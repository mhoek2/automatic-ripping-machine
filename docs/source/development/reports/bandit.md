# Bandit Security Report

::::{grid} 1
:margin: 0 0 0 0
:padding: 0 0 0 0

::: {grid-item}
````{admonition} arm/models/job.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 6 | B404 (severity=LOW, confidence=HIGH) | Consider possible security implications associated with the subprocess module. |
| 187 | B602 (severity=HIGH, confidence=HIGH) | subprocess call with shell=True identified, security issue. |

````
:::

::: {grid-item}
````{admonition} arm/models/system_drives.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 9 | B404 (severity=LOW, confidence=HIGH) | Consider possible security implications associated with the subprocess module. |

````
:::

::: {grid-item}
````{admonition} arm/models/system_info.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 4 | B404 (severity=LOW, confidence=HIGH) | Consider possible security implications associated with the subprocess module. |
| 37 | B603 (severity=LOW, confidence=HIGH) | subprocess call - check for execution of untrusted input. |
| 40 | B602 (severity=HIGH, confidence=HIGH) | subprocess call with shell=True identified, security issue. |

````
:::

::: {grid-item}
````{admonition} arm/ripper/ProcessHandler.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 7 | B404 (severity=LOW, confidence=HIGH) | Consider possible security implications associated with the subprocess module. |
| 28 | B602 (severity=HIGH, confidence=HIGH) | subprocess call with shell=True identified, security issue. |

````
:::

::: {grid-item}
````{admonition} arm/ripper/ffmpeg.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 6 | B404 (severity=LOW, confidence=HIGH) | Consider possible security implications associated with the subprocess module. |
| 71 | B602 (severity=HIGH, confidence=HIGH) | subprocess call with shell=True identified, security issue. |
| 252 | B602 (severity=HIGH, confidence=HIGH) | subprocess call with shell=True identified, security issue. |
| 448 | B602 (severity=HIGH, confidence=HIGH) | subprocess call with shell=True identified, security issue. |
| 487 | B602 (severity=HIGH, confidence=HIGH) | subprocess call with shell=True identified, security issue. |
| 501 | B603 (severity=LOW, confidence=HIGH) | subprocess call - check for execution of untrusted input. |

````
:::

::: {grid-item}
````{admonition} arm/ripper/handbrake.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 6 | B404 (severity=LOW, confidence=HIGH) | Consider possible security implications associated with the subprocess module. |
| 34 | B602 (severity=HIGH, confidence=HIGH) | subprocess call with shell=True identified, security issue. |
| 373 | B602 (severity=HIGH, confidence=HIGH) | subprocess call with shell=True identified, security issue. |
| 385 | B602 (severity=HIGH, confidence=HIGH) | subprocess call with shell=True identified, security issue. |

````
:::

::: {grid-item}
````{admonition} arm/ripper/identify.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 207 | B310 (severity=MEDIUM, confidence=HIGH) | Audit url open for permitted schemes. Allowing use of file:/ or custom schemes is often unexpected. |

````
:::

::: {grid-item}
````{admonition} arm/ripper/makemkv.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 19 | B404 (severity=LOW, confidence=HIGH) | Consider possible security implications associated with the subprocess module. |
| 1005 | B603 (severity=LOW, confidence=HIGH) | subprocess call - check for execution of untrusted input. |
| 1014 | B603 (severity=LOW, confidence=HIGH) | subprocess call - check for execution of untrusted input. |
| 1119 | B101 (severity=LOW, confidence=HIGH) | Use of assert detected. The enclosed code will be removed when compiling to optimised byte code. |
| 1122 | B101 (severity=LOW, confidence=HIGH) | Use of assert detected. The enclosed code will be removed when compiling to optimised byte code. |
| 1343 | B603 (severity=LOW, confidence=HIGH) | subprocess call - check for execution of untrusted input. |

````
:::

::: {grid-item}
````{admonition} arm/ripper/utils.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 6 | B404 (severity=LOW, confidence=HIGH) | Consider possible security implications associated with the subprocess module. |
| 158 | B311 (severity=LOW, confidence=HIGH) | Standard pseudo-random generators are not suitable for security/cryptographic purposes. |
| 368 | B113 (severity=MEDIUM, confidence=LOW) | Call to requests without timeout |
| 477 | B602 (severity=HIGH, confidence=HIGH) | subprocess call with shell=True identified, security issue. |
| 519 | B602 (severity=HIGH, confidence=HIGH) | subprocess call with shell=True identified, security issue. |
| 811 | B605 (severity=HIGH, confidence=HIGH) | Starting a process with a shell, possible injection detected, security issue. |
| 814 | B605 (severity=HIGH, confidence=HIGH) | Starting a process with a shell, possible injection detected, security issue. |
| 817 | B605 (severity=HIGH, confidence=HIGH) | Starting a process with a shell, possible injection detected, security issue. |
| 818 | B605 (severity=HIGH, confidence=HIGH) | Starting a process with a shell, possible injection detected, security issue. |

````
:::

::: {grid-item}
````{admonition} arm/ui/__init__.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 54 | B105 (severity=LOW, confidence=MEDIUM) | Possible hardcoded password: 'Big secret key' |

````
:::

::: {grid-item}
````{admonition} arm/ui/json_api.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 6 | B404 (severity=LOW, confidence=HIGH) | Consider possible security implications associated with the subprocess module. |
| 635 | B607 (severity=LOW, confidence=HIGH) | Starting a process with a partial executable path |
| 637 | B602 (severity=LOW, confidence=HIGH) | subprocess call with shell=True seems safe, but may be changed in the future, consider rewriting without shell |

````
:::

::: {grid-item}
````{admonition} arm/ui/metadata.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 43 | B310 (severity=MEDIUM, confidence=HIGH) | Audit url open for permitted schemes. Allowing use of file:/ or custom schemes is often unexpected. |
| 76 | B310 (severity=MEDIUM, confidence=HIGH) | Audit url open for permitted schemes. Allowing use of file:/ or custom schemes is often unexpected. |
| 86 | B310 (severity=MEDIUM, confidence=HIGH) | Audit url open for permitted schemes. Allowing use of file:/ or custom schemes is often unexpected. |
| 119 | B113 (severity=MEDIUM, confidence=LOW) | Call to requests without timeout |
| 169 | B113 (severity=MEDIUM, confidence=LOW) | Call to requests without timeout |
| 218 | B113 (severity=MEDIUM, confidence=LOW) | Call to requests without timeout |
| 223 | B113 (severity=MEDIUM, confidence=LOW) | Call to requests without timeout |
| 243 | B113 (severity=MEDIUM, confidence=LOW) | Call to requests without timeout |
| 302 | B113 (severity=MEDIUM, confidence=LOW) | Call to requests without timeout |

````
:::

::: {grid-item}
````{admonition} arm/ui/routes.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 204 | B404 (severity=LOW, confidence=HIGH) | Consider possible security implications associated with the subprocess module. |
| 214 | B607 (severity=LOW, confidence=HIGH) | Starting a process with a partial executable path |
| 214 | B603 (severity=LOW, confidence=HIGH) | subprocess call - check for execution of untrusted input. |

````
:::

::: {grid-item}
````{admonition} arm/ui/settings/health.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 4 | B404 (severity=LOW, confidence=HIGH) | Consider possible security implications associated with the subprocess module. |
| 111 | B603 (severity=LOW, confidence=HIGH) | subprocess call - check for execution of untrusted input. |
| 146 | B603 (severity=LOW, confidence=HIGH) | subprocess call - check for execution of untrusted input. |
| 174 | B604 (severity=MEDIUM, confidence=LOW) | Function call with shell=True parameter identified, possible security issue. |

````
:::

::: {grid-item}
````{admonition} arm/ui/settings/settings.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 20 | B404 (severity=LOW, confidence=HIGH) | Consider possible security implications associated with the subprocess module. |
| 417 | B602 (severity=HIGH, confidence=HIGH) | subprocess call with shell=True identified, security issue. |

````
:::

::: {grid-item}
````{admonition} arm/ui/utils.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 9 | B404 (severity=LOW, confidence=HIGH) | Consider possible security implications associated with the subprocess module. |
| 617 | B113 (severity=MEDIUM, confidence=LOW) | Call to requests without timeout |
| 756 | B603 (severity=LOW, confidence=HIGH) | subprocess call - check for execution of untrusted input. |
| 759 | B602 (severity=HIGH, confidence=HIGH) | subprocess call with shell=True identified, security issue. |
| 838 | B324 (severity=HIGH, confidence=HIGH) | Use of weak MD5 hash for security. Consider usedforsecurity=False |
| 891 | B607 (severity=LOW, confidence=HIGH) | Starting a process with a partial executable path |
| 891 | B603 (severity=LOW, confidence=HIGH) | subprocess call - check for execution of untrusted input. |
| 906 | B607 (severity=LOW, confidence=HIGH) | Starting a process with a partial executable path |
| 906 | B603 (severity=LOW, confidence=HIGH) | subprocess call - check for execution of untrusted input. |
| 974 | B607 (severity=LOW, confidence=HIGH) | Starting a process with a partial executable path |
| 975 | B602 (severity=LOW, confidence=HIGH) | subprocess call with shell=True seems safe, but may be changed in the future, consider rewriting without shell |

````
:::

::::
