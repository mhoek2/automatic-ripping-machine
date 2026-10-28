# Bandit Security Report

::::{grid} 1
:margin: 0 0 0 0
:padding: 0 0 0 0

::: {grid-item}
````{admonition} arm/models/job.py
:class: caution

```text
6:1 [B404, severity=LOW, confidence=HIGH] Consider possible security implications associated with the subprocess module.
187:1 [B602, severity=HIGH, confidence=HIGH] subprocess call with shell=True identified, security issue.
```
````
:::

::: {grid-item}
````{admonition} arm/models/system_drives.py
:class: caution

```text
9:1 [B404, severity=LOW, confidence=HIGH] Consider possible security implications associated with the subprocess module.
```
````
:::

::: {grid-item}
````{admonition} arm/models/system_info.py
:class: caution

```text
4:1 [B404, severity=LOW, confidence=HIGH] Consider possible security implications associated with the subprocess module.
37:1 [B603, severity=LOW, confidence=HIGH] subprocess call - check for execution of untrusted input.
40:1 [B602, severity=HIGH, confidence=HIGH] subprocess call with shell=True identified, security issue.
```
````
:::

::: {grid-item}
````{admonition} arm/ripper/ProcessHandler.py
:class: caution

```text
7:1 [B404, severity=LOW, confidence=HIGH] Consider possible security implications associated with the subprocess module.
28:1 [B602, severity=HIGH, confidence=HIGH] subprocess call with shell=True identified, security issue.
```
````
:::

::: {grid-item}
````{admonition} arm/ripper/ffmpeg.py
:class: caution

```text
6:1 [B404, severity=LOW, confidence=HIGH] Consider possible security implications associated with the subprocess module.
71:1 [B602, severity=HIGH, confidence=HIGH] subprocess call with shell=True identified, security issue.
252:1 [B602, severity=HIGH, confidence=HIGH] subprocess call with shell=True identified, security issue.
448:1 [B602, severity=HIGH, confidence=HIGH] subprocess call with shell=True identified, security issue.
487:1 [B602, severity=HIGH, confidence=HIGH] subprocess call with shell=True identified, security issue.
501:1 [B603, severity=LOW, confidence=HIGH] subprocess call - check for execution of untrusted input.
```
````
:::

::: {grid-item}
````{admonition} arm/ripper/handbrake.py
:class: caution

```text
6:1 [B404, severity=LOW, confidence=HIGH] Consider possible security implications associated with the subprocess module.
34:1 [B602, severity=HIGH, confidence=HIGH] subprocess call with shell=True identified, security issue.
373:1 [B602, severity=HIGH, confidence=HIGH] subprocess call with shell=True identified, security issue.
385:1 [B602, severity=HIGH, confidence=HIGH] subprocess call with shell=True identified, security issue.
```
````
:::

::: {grid-item}
````{admonition} arm/ripper/identify.py
:class: caution

```text
207:1 [B310, severity=MEDIUM, confidence=HIGH] Audit url open for permitted schemes. Allowing use of file:/ or custom schemes is often unexpected.
```
````
:::

::: {grid-item}
````{admonition} arm/ripper/makemkv.py
:class: caution

```text
19:1 [B404, severity=LOW, confidence=HIGH] Consider possible security implications associated with the subprocess module.
1005:1 [B603, severity=LOW, confidence=HIGH] subprocess call - check for execution of untrusted input.
1014:1 [B603, severity=LOW, confidence=HIGH] subprocess call - check for execution of untrusted input.
1119:1 [B101, severity=LOW, confidence=HIGH] Use of assert detected. The enclosed code will be removed when compiling to optimised byte code.
1122:1 [B101, severity=LOW, confidence=HIGH] Use of assert detected. The enclosed code will be removed when compiling to optimised byte code.
1343:1 [B603, severity=LOW, confidence=HIGH] subprocess call - check for execution of untrusted input.
```
````
:::

::: {grid-item}
````{admonition} arm/ripper/utils.py
:class: caution

```text
6:1 [B404, severity=LOW, confidence=HIGH] Consider possible security implications associated with the subprocess module.
158:1 [B311, severity=LOW, confidence=HIGH] Standard pseudo-random generators are not suitable for security/cryptographic purposes.
368:1 [B113, severity=MEDIUM, confidence=LOW] Call to requests without timeout
477:1 [B602, severity=HIGH, confidence=HIGH] subprocess call with shell=True identified, security issue.
519:1 [B602, severity=HIGH, confidence=HIGH] subprocess call with shell=True identified, security issue.
811:1 [B605, severity=HIGH, confidence=HIGH] Starting a process with a shell, possible injection detected, security issue.
814:1 [B605, severity=HIGH, confidence=HIGH] Starting a process with a shell, possible injection detected, security issue.
817:1 [B605, severity=HIGH, confidence=HIGH] Starting a process with a shell, possible injection detected, security issue.
818:1 [B605, severity=HIGH, confidence=HIGH] Starting a process with a shell, possible injection detected, security issue.
```
````
:::

::: {grid-item}
````{admonition} arm/ui/__init__.py
:class: caution

```text
54:1 [B105, severity=LOW, confidence=MEDIUM] Possible hardcoded password: 'Big secret key'
```
````
:::

::: {grid-item}
````{admonition} arm/ui/json_api.py
:class: caution

```text
6:1 [B404, severity=LOW, confidence=HIGH] Consider possible security implications associated with the subprocess module.
635:1 [B607, severity=LOW, confidence=HIGH] Starting a process with a partial executable path
637:1 [B602, severity=LOW, confidence=HIGH] subprocess call with shell=True seems safe, but may be changed in the future, consider rewriting without shell
```
````
:::

::: {grid-item}
````{admonition} arm/ui/metadata.py
:class: caution

```text
43:1 [B310, severity=MEDIUM, confidence=HIGH] Audit url open for permitted schemes. Allowing use of file:/ or custom schemes is often unexpected.
76:1 [B310, severity=MEDIUM, confidence=HIGH] Audit url open for permitted schemes. Allowing use of file:/ or custom schemes is often unexpected.
86:1 [B310, severity=MEDIUM, confidence=HIGH] Audit url open for permitted schemes. Allowing use of file:/ or custom schemes is often unexpected.
119:1 [B113, severity=MEDIUM, confidence=LOW] Call to requests without timeout
169:1 [B113, severity=MEDIUM, confidence=LOW] Call to requests without timeout
218:1 [B113, severity=MEDIUM, confidence=LOW] Call to requests without timeout
223:1 [B113, severity=MEDIUM, confidence=LOW] Call to requests without timeout
243:1 [B113, severity=MEDIUM, confidence=LOW] Call to requests without timeout
302:1 [B113, severity=MEDIUM, confidence=LOW] Call to requests without timeout
```
````
:::

::: {grid-item}
````{admonition} arm/ui/routes.py
:class: caution

```text
204:1 [B404, severity=LOW, confidence=HIGH] Consider possible security implications associated with the subprocess module.
214:1 [B607, severity=LOW, confidence=HIGH] Starting a process with a partial executable path
214:1 [B603, severity=LOW, confidence=HIGH] subprocess call - check for execution of untrusted input.
```
````
:::

::: {grid-item}
````{admonition} arm/ui/settings/health.py
:class: caution

```text
4:1 [B404, severity=LOW, confidence=HIGH] Consider possible security implications associated with the subprocess module.
111:1 [B603, severity=LOW, confidence=HIGH] subprocess call - check for execution of untrusted input.
146:1 [B603, severity=LOW, confidence=HIGH] subprocess call - check for execution of untrusted input.
174:1 [B604, severity=MEDIUM, confidence=LOW] Function call with shell=True parameter identified, possible security issue.
```
````
:::

::: {grid-item}
````{admonition} arm/ui/settings/settings.py
:class: caution

```text
20:1 [B404, severity=LOW, confidence=HIGH] Consider possible security implications associated with the subprocess module.
417:1 [B602, severity=HIGH, confidence=HIGH] subprocess call with shell=True identified, security issue.
```
````
:::

::: {grid-item}
````{admonition} arm/ui/utils.py
:class: caution

```text
9:1 [B404, severity=LOW, confidence=HIGH] Consider possible security implications associated with the subprocess module.
617:1 [B113, severity=MEDIUM, confidence=LOW] Call to requests without timeout
756:1 [B603, severity=LOW, confidence=HIGH] subprocess call - check for execution of untrusted input.
759:1 [B602, severity=HIGH, confidence=HIGH] subprocess call with shell=True identified, security issue.
838:1 [B324, severity=HIGH, confidence=HIGH] Use of weak MD5 hash for security. Consider usedforsecurity=False
891:1 [B607, severity=LOW, confidence=HIGH] Starting a process with a partial executable path
891:1 [B603, severity=LOW, confidence=HIGH] subprocess call - check for execution of untrusted input.
906:1 [B607, severity=LOW, confidence=HIGH] Starting a process with a partial executable path
906:1 [B603, severity=LOW, confidence=HIGH] subprocess call - check for execution of untrusted input.
974:1 [B607, severity=LOW, confidence=HIGH] Starting a process with a partial executable path
975:1 [B602, severity=LOW, confidence=HIGH] subprocess call with shell=True seems safe, but may be changed in the future, consider rewriting without shell
```
````
:::

::::
