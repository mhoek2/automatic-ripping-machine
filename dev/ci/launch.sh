#!/usr/bin/env bash
set -e

echo "======================================"
echo "Python Environment"
echo "======================================"
python -VV

echo "Configure A.R.M"

cp setup/arm.yaml arm.yaml

mkdir -p \
    /etc/arm/config \
    /home/arm/db \
    /home/arm \
    /home/arm/config \
    /home/arm/media \
    /home/arm/music \
    /opt/arm/arm \
    /opt/arm/setup

cp setup/arm.yaml /etc/arm/config/arm.yaml
cp setup/apprise.yaml /etc/arm/config/apprise.yaml
cp setup/.abcde.conf /etc/arm/config/abcde.conf

cp -r arm/migrations /opt/arm/arm/
cp setup/arm.yaml /opt/arm/setup/arm.yaml

echo "Run A.R.M UI"

set +e
timeout 1 python ./arm/runui.py
code=$?
set -e

if [[ "$code" -ne 124 && "$code" -ne 0 ]]; then
    echo "A.R.M UI failed with exit code $code"
    exit "$code"
fi

echo "A.R.M UI startup check passed."
