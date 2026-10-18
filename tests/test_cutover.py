import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("cutover", Path(__file__).parents[1] / "scripts/cutover.py")
cutover = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cutover)


class CutoverTests(unittest.TestCase):
    @patch.object(cutover, "yc", return_value={"status": "VALIDATING"})
    def test_pending_certificate_prevents_all_changes(self, yc):
        with self.assertRaises(cutover.NotReady):
            cutover.migrate("polarnick.com", apply=True)
        self.assertEqual(yc.call_count, 1)
        self.assertEqual(yc.call_args.args[:3], ("certificate-manager", "certificate", "get"))

    def test_filters_only_web_records(self):
        web = {"name": "polarnick.com.", "type": "AAAA", "data": ["legacy"]}
        others = [
            {"name": "polarnick.com.", "type": "NS"},
            {"name": "polarnick.com.", "type": "MX"},
            {"name": "_acme-challenge.polarnick.com.", "type": "CNAME"},
        ]
        self.assertEqual(cutover.web_records("polarnick.com", [web] + others), [web])

    def test_root_is_aname_not_cname(self):
        root, www = cutover.desired("polarnick.com")
        self.assertEqual(root["type"], "ANAME")
        self.assertEqual(www["data"], ["www.polarnick.com.website.yandexcloud.net."])

    @patch.object(cutover, "dns_update", return_value={"done": True})
    def test_replaces_all_legacy_values_and_descriptions_atomically(self, update):
        old = [
            {"name": "polarnick.com.", "ttl": "300", "type": "A", "data": ["ip1", "ip2"],
             "description": "Existing records"},
            {"name": "polarnick.com.", "ttl": "300", "type": "AAAA", "data": ["ip6"],
             "description": "Other description"},
        ]
        new = cutover.desired("polarnick.com")
        cutover.replace("zone", old, new)
        update.assert_called_once_with("zone", old, new)

    @patch.object(cutover.time, "sleep")
    @patch.object(cutover, "yc", return_value={"id": "op", "done": True})
    @patch.object(cutover, "dns_update", return_value={"id": "op", "done": False})
    def test_waits_for_atomic_operation(self, update, yc, sleep):
        cutover.replace("zone", [], [])
        yc.assert_called_once_with("operation", "get", "op")

    @patch.object(cutover, "dns_update", return_value={"done": True, "error": {"code": 9}})
    def test_failed_dns_operation_is_not_success(self, update):
        with self.assertRaisesRegex(RuntimeError, "DNS operation failed"):
            cutover.replace("zone", [], [])

    @patch.object(cutover, "check")
    @patch.object(cutover, "records", return_value=[
        {"name": "polarnick.com.", "type": "A", "ttl": "300", "data": ["unexpected-user-edit"]}
    ])
    @patch.object(cutover, "yc", return_value={"status": "ISSUED"})
    def test_refuses_intervening_user_edits(self, yc, records, check):
        with self.assertRaisesRegex(RuntimeError, "Unexpected DNS"):
            cutover.migrate("polarnick.com", apply=False)
        self.assertEqual(yc.call_count, 1)


if __name__ == "__main__":
    unittest.main()
