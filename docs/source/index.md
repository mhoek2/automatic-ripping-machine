
::::::{div} landing

::::{grid}
:reverse:
:gutter: 2 3 3 3
:margin: 4 4 1 2


:::{grid-item}
:columns: 12 12 12 12
:child-align: justify
:class: sd-text-white sd-fs-3 sd-text-center

:::{div} landing-title
Automatic Ripping Machine
:::

::::{grid}
:reverse:
:gutter: 2 3 3 3
:margin: 4 4 1 2

:::{grid-item}
:columns: 12 4 4 4
:::

::::{grid}
:gutter: 1
:margin: 0

:::{grid-item}
:columns: 6
:child-align: center

```{button-link} development/development.html
:ref-type: doc
:outline:
:color: white
:class: sd-px-4 sd-fs-5 btn-development
:align: right

Development
```
:::

:::{grid-item}
:columns: 6
:child-align: center

```{button-link} https://github.com/mhoek2/automatic-ripping-machine/pkgs/container/automatic-ripping-machine
:ref-type: doc
:outline:
:color: warning
:class: sd-px-4 sd-fs-5
:align: left
:target: blank

See Latest Package
```
:::
::::

:::
::::

::::::

## Project Origin

::::{admonition} A fork of the original project
:class: seealso

This is a fork of the [Automatic Ripping Machine](https://github.com/automatic-ripping-machine/automatic-ripping-machine) project, with updates to the UI, keeping true to usage of Flask, which is sufficient for its purpose.

Credits and thanks go to the original authors and contributors whose work
made this project possible.
::::

## Features

::::{grid} 1
:gutter: 0

:::{grid-item}
:::{gallery-grid}
:grid-columns: 1 2 2 3

- header: "{fas}`compact-disc;pst-color-warning` Automatic Disc Detection"
  content: "Automatically detects disc insertion using udev and identifies the disc type to determine the appropriate processing workflow."

- header: "{fas}`film;pst-color-warning` Movie & TV Ripping"
  content: "Automatically retrieves disc titles or uses the [OMDb API](http://www.omdbapi.com/) to identify movies and TV shows, organizing output into `Movie Title (Year)` folders for Plex and Emby."

- header: "{fas}`file-video;pst-color-warning` Flexible Video Ripping"
  content: "Rip Blu-ray and DVD content using MakeMKV or HandBrake. Choose between ripping all features or just the main feature."

- header: "{fas}`music;pst-color-warning` Audio CD Ripping"
  content: "Rip audio CDs using abcde, with album metadata and artwork retrieved from [MusicBrainz](https://musicbrainz.org/)."

- header: "{fas}`database;pst-color-warning` Data Disc Backups"
  content: "Create ISO backups of data discs, including Blu-ray, DVD, DVD-Audio and CD."

- header: "{fas}`layer-group;pst-color-warning` Asynchronous Transcoding"
  content: "Automatically ejects discs when ripping finishes and queues HandBrake transcoding jobs. Transcoding runs asynchronously alongside ongoing ripping jobs."

- header: "{fas}`bell;pst-color-warning` Notifications"
  content: "Receive notifications through IFTTT, Pushbullet, Slack, Discord and many other supported services."

- header: "{fas}`server;pst-color-warning` Headless Server Operation"
  content: "Designed to run unattended on a server without requiring a monitor, keyboard or graphical desktop."

- header: "{fas}`compact-disc;pst-color-warning` Multi-Drive Support"
  content: "Rip from multiple optical drives in parallel to process several discs simultaneously."

- header: "{fas}`desktop;pst-color-warning` Web Interface"
  content: "Manage ripping jobs, monitor logs, inspect job details and update jobs through a Python Flask web interface."

:::
:::
::::


## Install ARM
::::{grid} 1
:margin: 0 0 0 0
:padding: 0 0 0 0

:::{grid-item}
```{admonition} Prerequisites
:class: caution

- A system running Ubuntu Linux.
- Docker Engine and the Docker Compose plugin installed.
- A user account with `sudo` privileges.
- A working internet connection to download the ARM Docker image.
- A DVD or Blu-ray drive connected to the system for ripping media.

This guide assumes Docker is already installed and configured. If not, follow the [Quick Guide](#install-docker-on-ubuntu) or the official [Docker installation guide](https://docs.docker.com/engine/install/ubuntu/) first.

```
:::
::::

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

    http://`<server-ip>`:8080

    Replace `<server-ip>` with the IP address of your Ubuntu server. \
    If you're accessing ARM directly on the same machine, use `http://localhost:8080`.
 
    ```bash
    # find ip on ubuntu:
    ip a
    ```

## Install Docker on Ubuntu
::::{grid} 1
:margin: 0 0 0 0
:padding: 0 0 0 0

:::{grid-item}
```{admonition} Info
:class: info

This is a quick guide. More detailed guides are available online or follow the official [Docker installation guide](https://docs.docker.com/engine/install/ubuntu/)!

```
:::
::::

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

```{toctree} id="rootnav"
:hidden:
:maxdepth: 3

development/development
```