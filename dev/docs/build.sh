#!/usr/bin/env bash
set -e
# trap 'echo; read -rp "Press Enter to close..."' EXIT

cd "$(dirname "$0")/../.."

cp dev/docs/eslint.config.mjs ./eslint.config.mjs
cp dev/docs/stylelint.config.js ./stylelint.config.js
cp dev/docs/pyproject.toml ./pyproject.toml

if [[ "${1:-}" != "--skip-lint" ]]; then
    ./dev/docs/lint.sh
fi

python -m sphinx -b html docs/source docs/build