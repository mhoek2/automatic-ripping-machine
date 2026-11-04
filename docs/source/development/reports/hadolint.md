# Hadolint Report

::::{grid} 1
:margin: 0 0 0 0
:padding: 0 0 0 0

::: {grid-item}
````{admonition} ./Dockerfile
:class: caution

| Line | Type | Message |
|---:|---|---|
| 12:1 | SC2174 (warning) | When used with -p, -m only applies to the deepest directory. |
| 29:1 | DL3059 (info) | Multiple consecutive `RUN` instructions. Consider consolidation. |
| 34:1 | DL3059 (info) | Multiple consecutive `RUN` instructions. Consider consolidation. |
| 55:1 | DL3059 (info) | Multiple consecutive `RUN` instructions. Consider consolidation. |

````
:::

::: {grid-item}
````{admonition} ./arm-dependencies/Dockerfile
:class: caution

| Line | Type | Message |
|---:|---|---|
| 8:1 | DL3027 (warning) | Do not use apt as it is meant to be a end-user tool, use apt-get or apt-cache instead |
| 85:1 | DL3013 (warning) | Pin versions in pip. Instead of `pip install <package>` use `pip install <package>==<version>` or `pip install --requirement <requirements file>` |
| 85:1 | DL3042 (warning) | Avoid use of cache directory with pip. Use `pip install --no-cache-dir <package>` |
| 86:1 | DL3042 (warning) | Avoid use of cache directory with pip. Use `pip install --no-cache-dir <package>` |
| 86:1 | DL3059 (info) | Multiple consecutive `RUN` instructions. Consider consolidation. |
| 105:1 | DL3027 (warning) | Do not use apt as it is meant to be a end-user tool, use apt-get or apt-cache instead |

````
:::

::: {grid-item}
````{admonition} ./dev/docs/Dockerfile
:class: caution

| Line | Type | Message |
|---:|---|---|
| 7:1 | DL3008 (warning) | Pin versions in apt get install. Instead of `apt-get install <package>` use `apt-get install <package>=<version>` |

````
:::

::::
