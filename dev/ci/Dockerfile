ARG PYTHON_VERSION=3.10
FROM python:${PYTHON_VERSION}-bookworm

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgnutls28-dev \
    libcurl4-openssl-dev \
    libssl-dev \
    libdiscid-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

COPY arm-dependencies/requirements.txt /tmp/arm-dependencies/requirements.txt
COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r /tmp/requirements.txt

ENTRYPOINT ["bash", "dev/ci/launch.sh"]
CMD []