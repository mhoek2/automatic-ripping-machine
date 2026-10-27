# Automatic Ripping Machine (ARM)
A fork of the [Automatic Ripping Machine](https://github.com/automatic-ripping-machine/automatic-ripping-machine) with updates to the UI, keeping true to usage of Flask, which is sufficient for its purpose.

## License
[MIT License](LICENSE)

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

1. Create a directory for ARM and its configuration files.
    ```bash
    sudo mkdir -p /stack/arm
    cd /stack/arm
    sudo nano docker-compose.yml
    ```

2. Paste the following configuration into `docker-compose.yml` and save the file.
    ```yaml
    services:
    arm:
        image: ghcr.io/mhoek2/automatic-ripping-machine:latest-dev
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

    The current configuration uses the development image, final release will be available later.

3. From the `/stack/arm` directory, run Docker Compose to pull the image (if needed) and start the container in the background.
    ```bash
    sudo docker compose up -d
    ```

45. Verify the Installation
    ```bash
    # Veiw current status of the container
    sudo docker compose ps

    # To view the container logs:
    sudo docker compose logs -f

    # To restart the container:
    sudo docker compose restart

    # To stop the container:
    sudo docker compose down
    ```

6. Access the Web Interface
    Open the following address in your browser:

    http://<server-ip>:8080

    Replace `<server-ip>` with the IP address of your Ubuntu server. If you're accessing ARM directly on the same machine, use `http://localhost:8080`.
 
    ```bash
    # find ip on ubuntu:
    ip a
    ```
</details>

## Install Docker on Ubuntu
> [!NOTE]
> This is a quick guide. More detailed guides are available online or follow the official [Docker installation guide](https://docs.docker.com/engine/install/ubuntu/)!

<details>
<summary>View steps</summary>
 
1. Install the required packages and add the official Docker repository.
    ```bash
    sudo apt install -y ca-certificates curl gnupg lsb-release software-properties-common

    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
        $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    ```

2. Install
    ```bash
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    ```

3. Enable Docker
    ```bash
    sudo systemctl enable docker
    sudo systemctl start docker
    sudo systemctl status docker
    ```

4. Verify Installation
    ```bash
    docker version
    docker compose version
    ```
</details>

## Development

> [!CAUTION]
> The following sections describe how to set up a development environment and build and run a local ARM Docker image.

<details>
<summary>VS Code Development Environment</summary>

1. Clone the repository.
2. Copy `setup/arm.yml` to `dev/config`.
3. Open the repository in VS Code.
4. Open a terminal and navigate to the `dev` directory:

   ```bash
   cd dev
   ```

5. Start the development environment:

   ```bash
   docker compose up -d
   ```

6. To restart the services after making changes, run:

   ```bash
   docker compose restart
   ```

</details>

<details>
<summary>Build and Run a Local Docker Image</summary>

### Build the Image

1. Open the repository root folder in VS Code.
2. Open a terminal and build the local image:

   ```bash
   docker build -t arm-local:dev .
   ```

### Run the Image

1. Create a separate test directory on your computer.
2. Copy the root `docker-compose.yml` into the test directory.
3. Edit the copied `docker-compose.yml` to use the local image instead of the remote image:

   ```yaml
   image: arm-local:dev
   # image: ghcr.io/mhoek2/automatic-ripping-machine:latest-dev-compose
   ```

4. Open a terminal in the test directory and start the container:

   ```bash
   docker compose up -d --force-recreate
   ```

### Update the Local Image

Whenever you make code changes, rebuild the image and recreate the container:

1. In the repository root, rebuild the image:

   ```bash
   docker build -t arm-local:dev .
   ```

2. In the test directory, recreate the container using the updated image:

   ```bash
   docker compose up -d --force-recreate
   ```

</details>