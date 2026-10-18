# Static hosting: Yandex Object Storage + Cloud DNS

No VMs, CDN, functions, load balancers or paid runners. The only paid services
created for this migration are Object Storage and Cloud DNS. Managed Let's Encrypt
certificates and OIDC service-account federation do not require stored secrets.

## Resources

Cloud `cloud-polarnick` (`b1gmsvb6g8s7kq62pdv3`), dedicated folder
`polarnick-site` (`b1gq3hft48e92tvkhiq4`). Never change the workstation's default
`yc` profile: it belongs to another project. All commands specify the folder.

| Resource | ID / purpose |
| --- | --- |
| `polarnick-com` DNS zone | `dnsb3jdb38cscjl1f4c9` |
| `polarnick-ru` DNS zone | `dnschvmgo5p6suu0kdjv` |
| `polarnick.com` bucket | Actual Jekyll output; `hosting.json` |
| `www.polarnick.com`, `polarnick.ru`, `www.polarnick.ru` buckets | HTTPS redirects to `polarnick.com`; `redirect.json` |
| `polarnick-com-tls` | `fpqp94b2v1kvsuuf8m00`, covers `.com` and `www` |
| `polarnick-ru-tls` | `fpqs77s993iopk6pn82c`, covers `.ru` and `www` |
| `polarnick-site-deployer` | `ajeod99ve5lr8iiar1ei` |
| GitHub OIDC federation | `aje8u3n475kiggv4tljg` |
| Federated credential | `ajekc7t66vsinchl460q` |

Each bucket uses STANDARD storage with a 5 GiB size limit; versioning is disabled.
The limit caps stored size, **not** outgoing traffic charges. DNS zones and
certificates have deletion protection. Public read/list is enabled as required
by static hosting; anonymous writes are not allowed. Only `_site` is uploaded.

The deployer has `storage.uploader` in this dedicated folder; `bucket-policy.json`
restricts its main-bucket actions to `PutObject`. Redirect bucket policies,
generated from `redirect-policy-template.json`, deny this deployer access.
No DNS/certificate administration, object deletion or static access keys are
needed by CI. The original administrator retains access in all policies.
Bucket policy alone is insufficient: Object Storage first requires IAM or ACL
permission, then applies the policy. Direct impersonated-token upload was tested.

OIDC issuer: `https://token.actions.githubusercontent.com`, audience:
`https://github.com/PolarNick239`, allowed subject **only**:
`repo:PolarNick239/polarnick239.github.io:ref:refs/heads/master`.

## Build / deploy without GitHub runners

Install Ruby from `.ruby-version` and Bundler. On this workstation an unprivileged
Ruby installation under `~/.local/opt/ruby-3.3.9` is already available; the script
handles its environment without changing system Ruby or requiring sudo.

```sh
scripts/build.sh
python3 -m unittest discover -s tests -v
python3 scripts/deploy.py --dry-run
python3 scripts/deploy.py
```

The local script uses existing `yc` authentication; it never prints or stores a
new token. It compares MD5/ETag, handles pagination, uploads assets before pages,
retries transient failures and **never clears or deletes** objects. Historical
URLs remain available. Deliberate removals must be reviewed separately. There is
no multi-object atomic publication; a failed upload can leave some new assets,
but never removes the old site in advance. `--force` refreshes metadata as well.

The workflow `.github/workflows/deploy.yml` performs the same staged upload on
push to `master` or manual dispatch, using short-lived OIDC credentials. Actions
are pinned by SHA; deployment runs are serialized, not cancelled mid-upload.
It still uses GitHub-hosted runners; the local script is the independent fallback.
The workflow is activated by committing/pushing `.github/workflows/deploy.yml`.
One push to `master` triggers one deployment, even if it contains several commits;
pushes to other branches and pull requests do not deploy. OIDC trust is limited
to this repository's `master` subject, not to one specific workflow file. Anyone
who can modify `master` can publish site content, so protect GitHub write access.
The upload identity can overwrite existing site files even though it cannot delete
them. Compromised code running in the authorized CI job can use that identity.

HTML/feed cache TTL is 5 minutes, other assets one day (not `immutable`, since
historical filenames can be overwritten). All object MIME types are set.

## DNS and HTTPS cutover

Registrar NS: `ns1.yandexcloud.net`, `ns2.yandexcloud.net` for both domains.
Keep `_acme-challenge` CNAMEs permanently for automatic certificate renewal:

- `.com` and `www`: `fpqp94b2v1kvsuuf8m00.cm.yandexcloud.net.`
- `.ru` and `www`: `fpqs77s993iopk6pn82c.cm.yandexcloud.net.`

Desired web records (TTL 300): root **ANAME** to
`<domain>.website.yandexcloud.net.`, `www` **CNAME** to
`www.<domain>.website.yandexcloud.net.`. Do not hard-code Object Storage IPs.
Legacy root A/AAAA and legacy www records are removed in the same atomic DNS
operation. Do not create a root CNAME alongside NS/SOA.

```sh
# Read-only readiness check (TLS must already be bound):
python3 scripts/cutover.py
# Explicitly bind issued certs, test HTTPS and switch DNS only after tests pass:
POLARNICK_DIRECT_INTERFACE=enp5s0 python3 scripts/cutover.py --apply
# Optional bounded retry while certificates are pending:
POLARNICK_DIRECT_INTERFACE=enp5s0 python3 scripts/cutover.py --apply --wait-seconds 14400
```

Use `--domain polarnick.com` or `--domain polarnick.ru` to act on only one zone.
Both domains were migrated on 2026-10-18. The bounded local `.ru` waiter
completed its verified cutover at 19:47 MSK and exited; the workstation does not
need to remain running. The historical PID and log are in
`~/.cache/polarnick-site/cutover-ru.pid` and `cutover-ru.log`. To inspect the log:

```sh
tail -n 10 ~/.cache/polarnick-site/cutover-ru.log
```

Backups are saved outside the build directory in
`~/.cache/polarnick-site/dns-<domain>-<timestamp>.json`. Original pre-migration
snapshots are `dns-com-original.json` and `dns-ru-original.json` there.
The script rejects unexpected intervening web-record edits. It uses the strict
Cloud DNS REST API to preserve complete RRsets, including descriptions, during
atomic deletion/addition. The CLI's shared `--description` cannot represent
different old/new descriptions in one `update-records` call.

On this workstation the VPN intercepts ordinary port-53 queries. To query real
authorities, bind the physical source address, for example:

```sh
dig -b192.168.31.61 @84.201.185.208 polarnick.com A +norecurse
dig -b192.168.31.61 @a.dns.ripn.net polarnick.ru NS +norecurse
```

HTTP is automatically redirected to HTTPS after attaching certificates.
The `.ru` and `www` redirects preserve the URL **path**. Object Storage's redirects
drop query parameters; they are not used for page routing in this site.
The root redirects to the main site's root, whose JS/meta refresh opens
`/index_ru.html` (including when JavaScript is disabled). Paths of articles,
media, feeds and old demos are unchanged. Missing pages return `404.html` with
an actual HTTP 404, not a successful SPA fallback.

## Rollback

Do not delete/disable GitHub Pages, its `CNAME` source file, old REG forwarding,
DNS validation records or certificates during the observation period.

To roll back a migrated zone, use **one** `yc dns zone update-records` operation
with `--delete-record` for its current ANAME and www CNAME and `--add-record`
for every legacy value below (TTL 300). Preserve NS/SOA and `_acme-challenge`.
DNS propagation still takes time; rollback is not instantaneous.

- `.com` root A: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
- `.com` root AAAA: `2606:50c0:8000::153`, `2606:50c0:8001::153`,
  `2606:50c0:8002::153`, `2606:50c0:8003::153`.
- `www.polarnick.com.` CNAME: `polarnick239.github.io.`
- `.ru` root A and `www.polarnick.ru.` A: `95.163.244.134`.

Keep the Yandex nameservers during a hosting rollback: the Yandex zones already
contain the necessary legacy records. Reverting nameservers would add a separate,
longer propagation cycle. There is no need to delete the new buckets.
