#!/usr/bin/env python3
"""Non-destructive, incremental upload of _site using existing yc authentication."""
import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
import mimetypes
from pathlib import Path
import subprocess
import time

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "_site"
BUCKET = "polarnick.com"
FOLDER = "b1gq3hft48e92tvkhiq4"
FORBIDDEN = {".git", ".github", ".env", ".bundle"}
ROOT_FORBIDDEN = {"AGENTS.md", "Gemfile", "Gemfile.lock", "scripts", "infrastructure", "src", "vendor", "tests"}


def yc(*args):
    command = ["yc", "storage", "s3api", *args, "--folder-id", FOLDER, "--format", "json"]
    for attempt in range(3):
        result = subprocess.run(command, capture_output=True, text=True)
        if result.returncode == 0:
            return json.loads(result.stdout or "{}")
        if attempt < 2:
            time.sleep(2 ** attempt)
    raise RuntimeError(result.stderr.strip())


def files():
    for required in ("index.html", "index_ru.html", "404.html"):
        if not (SITE / required).is_file():
            raise ValueError(f"Missing _site/{required}; run bundle exec jekyll build first")
    result = []
    for path in sorted(SITE.rglob("*")):
        if path.is_symlink():
            raise ValueError(f"Refusing symlink: {path}")
        if not path.is_file():
            continue
        relative = path.relative_to(SITE)
        if (FORBIDDEN.intersection(relative.parts) or relative.parts[0] in ROOT_FORBIDDEN
                or path.suffix in {".pem", ".key"}):
            raise ValueError(f"Private/build file in output: {relative}")
        result.append((relative.as_posix(), path))
    return result


def remote_etags():
    result = {}
    token = None
    while True:
        args = ["list-objects", "--bucket", BUCKET]
        if token:
            args += ["--continuation-token", token]
        page = yc(*args)
        for entry in page.get("contents", []):
            result[entry["key"]] = entry.get("etag", "").strip('"')
        token = page.get("next_continuation_token")
        if not token:
            if page.get("is_truncated"):
                raise RuntimeError("Truncated object list without continuation token")
            return result


def md5(path):
    digest = hashlib.md5(usedforsecurity=False)
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def content_type(key):
    kind = mimetypes.guess_type(key)[0] or "application/octet-stream"
    if kind.startswith("text/") or kind in {"application/javascript", "application/xml", "image/svg+xml"}:
        kind += "; charset=utf-8"
    return kind


def upload(item):
    key, path = item
    cache = "public, max-age=300" if path.suffix in {".html", ".xml", ".json"} else "public, max-age=86400"
    yc("put-object", "--bucket", BUCKET, "--key", key, "--body", str(path),
       "--content-type", content_type(key), "--cache-control", cache)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--force", action="store_true", help="Also refresh unchanged objects/metadata")
    parser.add_argument("--workers", type=int, default=6)
    args = parser.parse_args()
    local = files()  # Validate before any network access.
    remote = remote_etags()
    pending = [(key, path) for key, path in local if args.force or remote.get(key) != md5(path)]
    print(f"Built files: {len(local)}; upload: {len(pending)}; unchanged: {len(local) - len(pending)}", flush=True)
    if args.dry_run:
        return
    # Publish assets first; if any fail, do not publish pages referring to them.
    # Never clear the bucket, and never delete historical URLs automatically.
    for pages in (False, True):
        batch = [item for item in pending if (item[1].suffix in {".html", ".xml"}) == pages]
        with ThreadPoolExecutor(max_workers=max(1, min(args.workers, 16))) as pool:
            for count, _ in enumerate(pool.map(upload, batch), 1):
                if count % 100 == 0 or count == len(batch):
                    print(f"{'Pages' if pages else 'Assets'}: {count}/{len(batch)}", flush=True)
    print("Upload complete; no remote objects deleted.", flush=True)


if __name__ == "__main__":
    main()
