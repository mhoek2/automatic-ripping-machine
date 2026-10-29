#!/usr/bin/env bash
set -uo pipefail

cd "$(dirname "$0")/../.."

# remove on exit
trap 'rm -f ./eslint.config.mjs ./stylelint.config.js ./pyproject.toml' EXIT

# move to root. 
# prefer to keep docs build related files concentrated in: dev/docs
cp dev/docs/eslint.config.mjs ./eslint.config.mjs
cp dev/docs/stylelint.config.js ./stylelint.config.js
cp dev/docs/pyproject.toml ./pyproject.toml

REPORT_DIR="docs/source/development/reports"
mkdir -p "$REPORT_DIR"

echo "Running ESLint..."
/opt/docs/node_modules/.bin/eslint "arm/ui/static/js/**/*.js" \
    --format json \
    --output-file "$REPORT_DIR/eslint.json" || true

echo "Running Stylelint..."
/opt/docs/node_modules/.bin/stylelint "arm/ui/static/css/**/*.css" \
    --formatter json \
    --output-file "$REPORT_DIR/stylelint.json" || true

echo "Running Ruff..."
python -m ruff check arm --output-format json \
    > "$REPORT_DIR/ruff.json" || true

echo "Running ShellCheck..."
if command -v shellcheck >/dev/null 2>&1; then
    mapfile -d '' SHELL_FILES < <(
        find . \
            -type d \( -name .git -o -name node_modules -o -name .venv \) -prune \
            -o -type f -name '*.sh' -print0
    )

    if (("${#SHELL_FILES[@]}" > 0)); then
        shellcheck --format=json "${SHELL_FILES[@]}" \
            > "$REPORT_DIR/shellcheck.json" || true
    else
        printf '[]\n' > "$REPORT_DIR/shellcheck.json"
    fi
else
    echo "ShellCheck is not installed; skipping."
    printf '[]\n' > "$REPORT_DIR/shellcheck.json"
fi

echo "Running Hadolint..."
if command -v hadolint >/dev/null 2>&1; then
    mapfile -d '' DOCKER_FILES < <(
        find . \
            -type d \( -name .git -o -name node_modules -o -name .venv \) -prune \
            -o -type f \( -iname Dockerfile -o -iname 'Dockerfile.*' \) -print0
    )

    if (("${#DOCKER_FILES[@]}" > 0)); then
        hadolint --format json "${DOCKER_FILES[@]}" \
            > "$REPORT_DIR/hadolint.json" || true
    else
        printf '[]\n' > "$REPORT_DIR/hadolint.json"
    fi
else
    echo "Hadolint is not installed; skipping."
    printf '[]\n' > "$REPORT_DIR/hadolint.json"
fi

echo "Running Bandit..."
python -m bandit -r arm -f json -o "$REPORT_DIR/bandit.json" \
    --exit-zero

echo "Running pip-audit..."
pip-audit -r requirements.txt \
    --format json \
    --output "$REPORT_DIR/pip-audit.json" || true

echo "Converting reports to docs..."
python dev/docs/parse-reports.py

echo "Lint reports generated in $REPORT_DIR"