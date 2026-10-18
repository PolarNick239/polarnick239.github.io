import importlib.util
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("deploy", Path(__file__).parents[1] / "scripts/deploy.py")
deploy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(deploy)


class DeploymentTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.site = Path(self.tmp.name)
        self.patcher = patch.object(deploy, "SITE", self.site)
        self.patcher.start()
        for name in ("index.html", "index_ru.html", "404.html"):
            (self.site / name).write_text("hello", encoding="utf-8")

    def tearDown(self):
        self.patcher.stop()
        self.tmp.cleanup()

    def test_requires_built_homepage(self):
        (self.site / "index.html").unlink()
        with self.assertRaises(ValueError):
            deploy.files()

    def test_rejects_repository_files(self):
        (self.site / "AGENTS.md").touch()
        with self.assertRaises(ValueError):
            deploy.files()

    def test_allows_historical_source_assets(self):
        asset = self.site / "old/webgl/matrix/src/gl.ts"
        asset.parent.mkdir(parents=True)
        asset.touch()
        self.assertIn(asset, dict(deploy.files()).values())

    def test_rejects_nested_credentials(self):
        directory = self.site / "old/.git"
        directory.mkdir(parents=True)
        (directory / "config").touch()
        with self.assertRaises(ValueError):
            deploy.files()

    def test_rejects_symlinks(self):
        (self.site / "linked").symlink_to(self.site / "index.html")
        with self.assertRaises(ValueError):
            deploy.files()

    def test_md5_and_types(self):
        self.assertEqual(deploy.md5(self.site / "index.html"), "5d41402abc4b2a76b9719d911017c592")
        self.assertEqual(deploy.content_type("a.html"), "text/html; charset=utf-8")
        self.assertEqual(deploy.content_type("a.pdf"), "application/pdf")
        self.assertEqual(deploy.content_type("a.mp4"), "video/mp4")

    @patch.object(deploy, "yc")
    def test_remote_pagination(self, yc):
        yc.side_effect = [
            {"contents": [{"key": "a", "etag": '"aaa"'}], "is_truncated": True, "next_continuation_token": "next"},
            {"contents": [{"key": "b", "etag": '"bbb"'}]},
        ]
        self.assertEqual(deploy.remote_etags(), {"a": "aaa", "b": "bbb"})
        self.assertIn("next", yc.call_args.args)

    @patch.object(deploy, "yc", return_value={"is_truncated": True})
    def test_rejects_incomplete_listing(self, yc):
        with self.assertRaises(RuntimeError):
            deploy.remote_etags()


if __name__ == "__main__":
    unittest.main()
