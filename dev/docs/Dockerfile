FROM node:22-bookworm

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    shellcheck \
    git \
    wget \
    ca-certificates \
    && ln -s /usr/bin/python3 /usr/local/bin/python \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /tmp/docs

COPY dev/docs/package.json dev/docs/package-lock.json ./
RUN npm ci

WORKDIR /workspace

RUN mkdir -p /workspace/node_modules \
    && cp -a /tmp/docs/node_modules/. /workspace/node_modules/

COPY dev/docs/requirements.txt /tmp/docs-requirements.txt
RUN pip3 install --no-cache-dir --break-system-packages \
    -r /tmp/docs-requirements.txt

COPY dev/docs/package.json dev/docs/package-lock.json /opt/docs/
WORKDIR /opt/docs
RUN npm ci

WORKDIR /workspace

ENTRYPOINT ["bash", "dev/docs/build.sh"]
CMD []