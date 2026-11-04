
## Development

::::{grid} 1
:margin: 0 0 0 0
:padding: 0 0 0 0

:::{grid-item}
```{admonition} Info
:class: info

The following sections describe how to set up a development environment or to build and run a local ARM Docker image.

```
:::
::::

### VS Code Development Environment
<details>
<summary>View steps</summary>

1. Clone the repository.
2. Install pip requirements
	```bash
    python -m pip install -r requirements.txt
	```
3. Copy `setup/arm.yml` to `dev/config`.
4. Open the repository in VS Code.
5. Open a terminal and navigate to the `dev` directory:

   ```bash
   cd dev
   ```

6. Start the development environment:

   ```bash
   docker compose up -d
   ```

7. To restart the services after making changes, run:

   ```bash
   docker compose restart
   ```
</details>

### Build and Run a Local Docker Image
<details>
<summary>View steps</summary>

#### Build

1. Open the repository root folder in VS Code.
2. Open a terminal and build the local image:

   ```bash
   docker build -t arm-local:dev .
   ```

#### Run

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

#### Update

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

### Create linter reports and Docs
<details>
<summary>View steps</summary>

1. Open a terminal of your choice in the root of the codebase
2. Build the docs 
	```bash
    # complete docks with linter reports
	docker compose -f dev/docs/compose.yaml run --build --rm docs

    # docs only
    docker compose -f dev/docs/compose.yaml run --build --rm docs --skip-lint
	```
3. Open docs/build/index.html in the browser
</details>

```{toctree} id="devreports"
:hidden:
:maxdepth: 2

reports/reports
```