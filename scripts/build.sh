#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

# Optional local, unprivileged Ruby installation on this workstation.
# On other machines install the version from .ruby-version (e.g. rbenv/mise).
ruby_home="$HOME/.local/opt/ruby-$(tr -d '\n' < .ruby-version)"
if [[ -x "$ruby_home/bin/ruby" ]]; then
  export PATH="$ruby_home/bin:$PATH"
  export LD_LIBRARY_PATH="$ruby_home/lib${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
  export RUBYLIB="$ruby_home/lib/ruby/3.3.0:$ruby_home/lib/ruby/3.3.0/x86_64-linux${RUBYLIB:+:$RUBYLIB}"
fi
bundle_bin="$(command -v bundle || true)"
if [[ -z "$bundle_bin" ]]; then
  echo 'Install Ruby from .ruby-version and Bundler, then rerun this script.' >&2
  exit 1
fi
export BUNDLE_PATH="${BUNDLE_PATH:-$HOME/.cache/polarnick-site/bundle}"
ruby "$bundle_bin" check || ruby "$bundle_bin" install
JEKYLL_ENV=production ruby "$bundle_bin" exec jekyll build --trace
python3 -c 'import runpy; m = runpy.run_path("scripts/deploy.py"); print("Validated", len(m["files"]()), "built files")'
