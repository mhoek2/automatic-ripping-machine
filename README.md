# Automatic Ripping Machine (ARM)
A fork of the [Automatic Ripping Machine](https://github.com/automatic-ripping-machine/automatic-ripping-machine) with updates to the UI, keeping true to usage of Flask, which is sufficient for its purpose.

> [!NOTE]
> The project aims to improve the user experience while staying true to the original ARM functionality and architecture.

## Features

| Feature | Description |
|---------------------------|--------------------------------------------------------------------------|
| **Automatic Disc Detection** | Detects inserted discs using udev and identifies the appropriate processing workflow. |
| **Movie & TV Ripping** | Automatically identifies movies and TV shows and organizes the output. |
| **Flexible Video Ripping** | Supports DVD and Blu-ray ripping using MakeMKV and HandBrake. |
| **Audio CD Ripping** | Rips audio CDs with metadata and artwork. |
| **Data Disc Backups** | Creates ISO backups of supported data discs. |
| **Asynchronous Transcoding** | Runs HandBrake transcoding jobs alongside ongoing ripping operations. |
| **Notifications** | Supports multiple notification services, including Discord, Slack, IFTTT and Pushbullet. |
| **Multi-Drive Support** | Supports multiple optical drives operating simultaneously. |
| **Web Interface** | Manage ripping jobs, monitor progress, inspect logs and update jobs through the Flask interface. |

## Installation

> [!TIP]
> ARM runs in Docker, making it compatible with most platforms that support Docker Engine and Docker Compose. \
> **Ubuntu Linux** is the recommended platform.

- [Install ARM](https://mhoek2.github.io/automatic-ripping-machine/index.html#install-arm)
- [Update ARM](https://mhoek2.github.io/automatic-ripping-machine/index.html#update-arm)
- [Quick Guide: Install Docker on Ubuntu](https://mhoek2.github.io/automatic-ripping-machine/index.html#install-docker-on-ubuntu)

## Development

Interested in contributing or running a local development environment?

- [VS Code Development Environment](https://mhoek2.github.io/automatic-ripping-machine/development/development.html#vs-code-development-environment)
- [Build and Run a Local Docker Image](https://mhoek2.github.io/automatic-ripping-machine/development/development.html#build-and-run-a-local-docker-image)
- [Create Linter Reports and Documentation](https://mhoek2.github.io/automatic-ripping-machine/development/development.html#create-linter-reports-and-docs)

### Code Quality

Automated linting and security checks are used to maintain code quality across the project.

The latest reports are available in the documentation:

- [ESLint](https://mhoek2.github.io/automatic-ripping-machine/development/reports/eslint.html)
- [Stylelint](https://mhoek2.github.io/automatic-ripping-machine/development/reports/stylelint.html)
- [Ruff](https://mhoek2.github.io/automatic-ripping-machine/development/reports/ruff.html)
- [ShellCheck](https://mhoek2.github.io/automatic-ripping-machine/development/reports/shellcheck.html)
- [Hadolint](https://mhoek2.github.io/automatic-ripping-machine/development/reports/hadolint.html)
- [Bandit Security](https://mhoek2.github.io/automatic-ripping-machine/development/reports/bandit.html)
- [Python Dependency Audit](https://mhoek2.github.io/automatic-ripping-machine/development/reports/dependency-audit.html)


## License

This project is licensed under the [MIT License](LICENSE).

## Credits

This project is based on the original [Automatic Ripping Machine](https://github.com/automatic-ripping-machine/automatic-ripping-machine).

Credit and thanks go to the original authors and contributors for their work.