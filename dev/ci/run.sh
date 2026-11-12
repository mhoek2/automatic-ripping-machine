
#!/usr/bin/env bash
set -uo pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m'

COMPOSE="dev/ci/compose.yml"
VERSIONS=(3.10 3.11 3.12)

declare -A RESULTS
start_time=$SECONDS
failed=0

echo "======================================"
echo " A.R.M - Python Compatibility Tests"
echo "======================================"
echo

for version in "${VERSIONS[@]}"; do
    echo
    echo "======================================"
    echo " Testing Python $version"
    echo "======================================"

    if PYTHON_VERSION="$version" docker compose -f "$COMPOSE" run --build --rm ci; then
        RESULTS[$version]="PASS"
        echo -e "${GREEN}[PASS]${NC} Python $version"
    else
        RESULTS[$version]="FAIL"
        failed=1
        echo -e "${RED}[FAIL]${NC} Python $version"
    fi
done

echo
echo "======================================"
echo " Summary"
echo "======================================"

for version in "${VERSIONS[@]}"; do
    result=${RESULTS[$version]}

    if [[ "$result" == "PASS" ]]; then
        printf "Python %-8s ${GREEN}%s${NC}\n" "$version" "$result"
    else
        printf "Python %-8s ${RED}%s${NC}\n" "$version" "$result"
    fi
done

echo "--------------------------------------"
echo "Total time: $((SECONDS - start_time)) seconds"
echo "======================================"

read -rp "Press Enter to exit..."
exit "$failed"