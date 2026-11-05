#!/usr/bin/env bash
set -e
# trap 'echo; read -rp "Press Enter to close..."' EXIT

cd "$(dirname "$0")/../.."

if [[ "${1:-}" != "--skip-lint" ]]; then
    bash ./dev/docs/lint.sh
fi

python -m sphinx -b html docs/source docs/build

# update latest version in index.html
LATEST_TAG=$(git tag --list 'v[0-9]*' --sort=-version:refname | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | head -n 1)
echo "Latest tag: $LATEST_TAG"
sed -i "s/::version::/${LATEST_TAG}/g" docs/build/index.html