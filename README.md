# Automatic Ripping Machine (ARM)
A fork of the [Automatic Ripping Machine](https://github.com/automatic-ripping-machine/automatic-ripping-machine) with updates to the UI, keeping true to usage of Flask, which is sufficient for its purpose.



> [!IMPORTANT]
> **Prerequisites**
>
> - A system running Ubuntu Linux.
> - Docker Engine and the Docker Compose plugin installed.
> - A user account with `sudo` privileges.
> - A working internet connection to download the ARM Docker image.
> - A DVD or Blu-ray drive connected to the system for ripping media.
>
> This guide assumes Docker is already installed and configured. If not, follow the [Quick Guide](#install-docker-on-ubuntu) or the official [Docker installation guide](https://docs.docker.com/engine/install/ubuntu/) first.


## Install ARM
> [!NOTE]
> This guide covers a simple setup of Automatic Ripping Machine (ARM) using Docker Compose.
<details>
<summary>View steps</summary>

### 1. Prepare

Create a directory for ARM and its configuration files.

```bash
sudo mkdir -p /stack/arm
cd /stack/arm
sudo nano docker-compose.yml
```

Paste the following configuration into `docker-compose.yml` and save the file.

```yaml
services:
  arm:
    # image: arm-local:dev
    # image: ghcr.io/mhoek2/automatic-ripping-machine:latest-dev
    image: ghcr.io/mhoek2/automatic-ripping-machine:latest-dev-compose
    container_name: arm_local
    restart: unless-stopped
    privileged: true
    ports:
      - "8080:8080"
    environment:
      - TZ=Europe/Amsterdam
    volumes:
      - ./config:/etc/arm/config
      - ./home:/home/arm
      - ./logs:/home/arm/logs
      - ./media:/home/arm/media
      - ./music:/home/arm/Music
      - /dev:/dev
```

The configuration uses the development Compose image. The other image options are included as alternatives.

### 2. Start ARM

From the `/stack/arm` directory, run Docker Compose to pull the image (if needed) and start the container in the background.

```bash
sudo docker compose up -d
```

### 3. Verify the Installation

Check whether the container is running.

```bash
sudo docker compose ps
```

To view the container logs:

```bash
sudo docker compose logs -f
```

### 4. Access the Web Interface

Open the following address in your browser:

http://<server-ip>:8080

Replace `<server-ip>` with the IP address of your Ubuntu server. If you're accessing ARM directly on the same machine, use `http://localhost:8080`.

find ip on ubuntu:
```bash
ip -a
```
</details>


## Install Docker on Ubuntu
> [!NOTE]
> This is a quick guide. More detailed guides are available online or follow the official [Docker installation guide](https://docs.docker.com/engine/install/ubuntu/)!

<details>
<summary>View steps</summary>
 
### 1. Prepare

Install the required packages and add the official Docker repository.

```bash
sudo apt install -y ca-certificates curl gnupg lsb-release software-properties-common

sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### 2. Install

### 1. Prepare
```bash
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 3. Enable Docker

```bash
sudo systemctl enable docker
sudo systemctl start docker
sudo systemctl status docker
```

### 4. Verify Installation

```bash
docker version
docker compose version
```
</details>

## License
[MIT License](LICENSE)
