# Test A.R.M Python versions locally
The CI-CD workflows tests if A.R.M can start without errors using predefined Python versions in the workflow file.

**For local tests, follow the steps below:**

1. Open a terminal in the project root
2. Select a Python version and run
    ```bash
    $env:PYTHON_VERSION="3.10"; docker compose -f dev/ci/compose.yml run --build --rm ci
    ```

    ```bash
    $env:PYTHON_VERSION="3.11"; docker compose -f dev/ci/compose.yml run --build --rm ci
    ```

    ```bash
    $env:PYTHON_VERSION="3.12"; docker compose -f dev/ci/compose.yml run --build --rm ci
    ```