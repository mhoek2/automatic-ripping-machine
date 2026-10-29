#!/usr/bin/env bash
set -e
# trap 'echo; read -rp "Press Enter to close..."' EXIT

cd "$(dirname "$0")/../.."

if [[ "${1:-}" != "--skip-lint" ]]; then
    bash ./dev/docs/lint.sh
fi

python -m sphinx -b html docs/source docs/build