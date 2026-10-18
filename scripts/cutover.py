#!/usr/bin/env python3
"""Resume the guarded migration. DNS changes require --apply; never switches without TLS tests."""
import argparse
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import subprocess
import time
import urllib.request

FOLDER = "b1gq3hft48e92tvkhiq4"
RESOURCES = {
    "polarnick.com": ("dnsb3jdb38cscjl1f4c9", "fpqp94b2v1kvsuuf8m00"),
    "polarnick.ru": ("dnschvmgo5p6suu0kdjv", "fpqs77s993iopk6pn82c"),
}
CACHE = Path.home() / ".cache/polarnick-site"
PAGE = "/blogs/239/2026/index_ru.html"


class NotReady(RuntimeError):
    pass


def yc(*args):
    result = subprocess.run(["yc", *args, "--folder-id", FOLDER, "--format", "json"],
                            capture_output=True, text=True)
    if result.returncode:
        raise RuntimeError(result.stderr.strip())
    return json.loads(result.stdout or "{}")


def check(host, path, status, location=None, protocol="https"):
    port = 443 if protocol == "https" else 80
    command = ["curl", "--noproxy", "*", "--silent", "--show-error", "--head",
               "--max-time", "25", "--connect-to",
               f"{host}:{port}:{host}.website.yandexcloud.net:{port}"]
    if os.environ.get("POLARNICK_DIRECT_INTERFACE"):
        command += ["--interface", os.environ["POLARNICK_DIRECT_INTERFACE"]]
    result = subprocess.run(command + [f"{protocol}://{host}{path}"], capture_output=True, text=True)
    if result.returncode:
        raise NotReady(f"{host}{path}: TLS/network check failed: {result.stderr.strip()}")
    lines = result.stdout.splitlines()
    actual = int(lines[0].split()[1]) if lines else 0
    headers = dict(line.split(": ", 1) for line in lines[1:] if ": " in line)
    if actual != status or (location and headers.get("Location", headers.get("location")) != location):
        raise NotReady(f"{host}{path}: expected {status}/{location}, got {actual}/{headers}")


def records(zone):
    return yc("dns", "zone", "list-records", "--id", zone)["record_sets"]


def web_records(domain, record_sets):
    return [r for r in record_sets if r["name"] in {domain + ".", "www." + domain + "."}
            and r["type"] in {"A", "AAAA", "ANAME", "CNAME"}]


def desired(domain):
    return [
        {"name": domain + ".", "type": "ANAME", "ttl": "300",
         "data": [domain + ".website.yandexcloud.net."]},
        {"name": "www." + domain + ".", "type": "CNAME", "ttl": "300",
         "data": ["www." + domain + ".website.yandexcloud.net."]},
    ]


def signature(record_sets):
    return sorted((r["name"], r["type"], tuple(sorted(r["data"]))) for r in record_sets)


def dns_update(zone, old, new):
    # The strict API compares TTL, all values AND description on deletion.
    # CLI --description applies to every addition/deletion, so it cannot express
    # arbitrary existing descriptions and distinct new descriptions atomically.
    token = subprocess.run(["yc", "iam", "create-token", "--folder-id", FOLDER],
                           capture_output=True, text=True, check=True).stdout.strip()
    request = urllib.request.Request(
        f"https://dns.api.cloud.yandex.net/dns/v1/zones/{zone}:updateRecordSets",
        data=json.dumps({"deletions": old, "additions": new}).encode(),
        headers={"Authorization": "Bearer " + token, "Content-Type": "application/json"})
    with urllib.request.urlopen(request, timeout=60) as response:
        return json.load(response)


def replace(zone, old, new):
    operation = dns_update(zone, old, new)  # All RRset changes are atomic.
    deadline = time.monotonic() + 120
    while not operation.get("done"):
        if time.monotonic() >= deadline:
            raise RuntimeError("DNS operation is still running; inspect " + operation["id"])
        time.sleep(1)
        operation = yc("operation", "get", operation["id"])
    if operation.get("error"):
        raise RuntimeError("DNS operation failed: " + str(operation["error"]))


def migrate(domain, apply):
    zone, certificate = RESOURCES[domain]
    cert = yc("certificate-manager", "certificate", "get", certificate)
    if cert["status"] != "ISSUED":
        raise NotReady(f'{domain}: certificate {cert["status"]}')
    for host in (domain, "www." + domain):
        # Binding only affects new storage endpoints, never the old hosting.
        if apply:
            settings = subprocess.run(["yc", "storage", "bucket", "get-https", host,
                                       "--folder-id", FOLDER, "--format", "json"],
                                      capture_output=True, text=True)
            if settings.returncode or certificate not in settings.stdout:
                yc("storage", "bucket", "set-https", host, "--certificate-id", certificate)
    if domain == "polarnick.com":
        for path in ("/index_ru.html", PAGE,
                     "/blogs/239/2026/school239_108_2026_2027/2026/10/15/015-ball.html",
                     "/blogs/239/2026/school239_108_2026_2027/2026/10/15/016-ml-olymps-list.html",
                     "/blogs/239/2026/feed_ru.xml", "/favicon.png"):
            check(domain, path, 200)
        check(domain, "/migration-check-missing-239.html", 404)
        check(domain, "/index_ru.html", 301, "https://polarnick.com/index_ru.html", protocol="http")
    else:
        check(domain, PAGE, 301, "https://polarnick.com" + PAGE)
        check(domain, "/", 301, "https://polarnick.com/")
    check("www." + domain, PAGE, 301, "https://polarnick.com" + PAGE)
    existing = records(zone)
    old = web_records(domain, existing)
    new = desired(domain)
    if signature(old) == signature(new):
        print(f"{domain}: TLS/HTTP tests OK; DNS already points to Object Storage", flush=True)
        return True
    # Refuse to overwrite unexpected intervening DNS edits.
    allowed = {"185.199.108.153", "185.199.109.153", "185.199.110.153", "185.199.111.153",
               "2606:50c0:8000::153", "2606:50c0:8001::153", "2606:50c0:8002::153", "2606:50c0:8003::153",
               "95.163.244.134", "polarnick239.github.io."}
    if not old or any(value not in allowed for r in old for value in r["data"]):
        raise RuntimeError(f"Unexpected DNS records for {domain}; inspect manually before migration")
    if not apply:
        print(f"{domain}: TLS/HTTP tests OK; would replace legacy web records with {new}", flush=True)
        return False
    CACHE.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    backup = CACHE / f"dns-{domain}-{stamp}.json"
    backup.write_text(json.dumps(existing, indent=2) + "\n", encoding="utf-8")
    replace(zone, old, new)
    if signature(web_records(domain, records(zone))) != signature(new):
        replace(zone, new, old)
        raise RuntimeError(f"{domain}: DNS verification failed; restored old web records")
    print(f"{domain}: switched to Object Storage; backup: {backup}", flush=True)
    return True


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--domain", choices=list(RESOURCES), action="append")
    parser.add_argument("--wait-seconds", type=int, default=0, help="Retry pending certificates/TLS once per minute")
    args = parser.parse_args()
    remaining = set(args.domain or RESOURCES)
    deadline = time.monotonic() + max(0, args.wait_seconds)
    while remaining:
        for domain in sorted(remaining):
            try:
                migrate(domain, args.apply)
                remaining.remove(domain)
            except NotReady as error:
                print(datetime.now(timezone.utc).isoformat(), error, flush=True)
        if not remaining:
            return
        if time.monotonic() >= deadline:
            raise SystemExit("Not switched: " + ", ".join(sorted(remaining)))
        time.sleep(min(60, max(0, deadline - time.monotonic())))


if __name__ == "__main__":
    main()
