# Ruff Report

::::{grid} 1
:margin: 0 0 0 0
:padding: 0 0 0 0

::: {grid-item}
````{admonition} /workspace/arm/__init__.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/config/__init__.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/config/config.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 3:1 | I001 | Import block is un-sorted or un-formatted |
| 7:8 | PLR0402 | Use `from arm.config import config_utils` in lieu of alias |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/config/config_utils.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |
| 21:5 | SIM401 | Use `arm_cfg = comment_groups.get(key, "")` instead of an `if` block |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/models/__init__.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/models/alembic_version.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/models/config.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |
| 1:1 | I001 | Import block is un-sorted or un-formatted |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/models/job.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |
| 1:1 | I001 | Import block is un-sorted or un-formatted |
| 74:5 | PIE796 | Enum contains duplicate value: `"waiting"` |
| 80:5 | PIE796 | Enum contains duplicate value: `"ripping"` |
| 92:16 | RUF012 | Mutable default value for class attribute |
| 97:15 | RUF012 | Mutable default value for class attribute |
| 105:19 | RUF012 | Mutable default value for class attribute |
| 110:22 | RUF012 | Mutable default value for class attribute |
| 185:13 | LOG015 | `info()` call on root logger |
| 209:13 | LOG015 | `debug()` call on root logger |
| 240:13 | LOG015 | `debug()` call on root logger |
| 243:13 | LOG015 | `debug()` call on root logger |
| 246:13 | LOG015 | `debug()` call on root logger |
| 249:13 | LOG015 | `debug()` call on root logger |
| 252:13 | LOG015 | `debug()` call on root logger |
| 255:13 | LOG015 | `debug()` call on root logger |
| 258:13 | LOG015 | `debug()` call on root logger |
| 271:9 | LOG015 | `debug()` call on root logger |
| 273:9 | LOG015 | `debug()` call on root logger |
| 308:13 | LOG015 | `debug()` call on root logger |
| 311:13 | LOG015 | `warning()` call on root logger |
| 314:13 | LOG015 | `info()` call on root logger |
| 348:13 | LOG015 | `info()` call on root logger |
| 351:13 | LOG015 | `info()` call on root logger |
| 354:13 | LOG015 | `info()` call on root logger |
| 357:13 | LOG015 | `info()` call on root logger |
| 359:9 | LOG015 | `info()` call on root logger |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/models/notifications.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/models/system_drives.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |
| 80:15 | TRY201 | Use `raise` without specifying exception name |
| 184:9 | LOG015 | `debug()` call on root logger |
| 268:9 | LOG015 | `info()` call on root logger |
| 276:9 | LOG015 | `info()` call on root logger |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/models/system_info.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |
| 1:1 | I001 | Import block is un-sorted or un-formatted |
| 32:9 | LOG015 | `debug()` call on root logger |
| 49:13 | LOG015 | `debug()` call on root logger |
| 53:9 | LOG015 | `debug()` call on root logger |
| 54:9 | LOG015 | `debug()` call on root logger |
| 61:16 | UP024 | Replace aliased errors with `OSError` |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/models/track.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |
| 1:1 | I001 | Import block is un-sorted or un-formatted |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/models/ui_settings.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/models/user.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/ripper/ARMInfo.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |
| 1:1 | N999 | Invalid module name: 'ARMInfo' |
| 5:1 | I001 | Import block is un-sorted or un-formatted |
| 8:17 | RUF100 | Unused blanket `noqa` directive |
| 9:17 | RUF100 | Unused `noqa` directive (non-enabled: `E402`) |
| 39:9 | LOG015 | `info()` call on root logger |
| 40:9 | LOG015 | `info()` call on root logger |
| 41:9 | LOG015 | `info()` call on root logger |
| 42:9 | LOG015 | `info()` call on root logger |
| 43:9 | LOG015 | `info()` call on root logger |
| 65:28 | SIM115 | Use a context manager for opening files |
| 70:20 | UP024 | Replace aliased errors with `OSError` |
| 71:17 | LOG015 | `info()` call on root logger |
| 105:16 | BLE001 | Do not catch blind exception: `Exception` |
| 106:13 | LOG015 | `info()` call on root logger |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/ripper/ProcessHandler.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |
| 1:1 | N999 | Invalid module name: 'ProcessHandler' |
| 6:1 | I001 | Import block is un-sorted or un-formatted |
| 8:1 | UP035 | `typing.List` is deprecated, use `list` instead |
| 11:25 | UP007 | Use `X \| Y` for type annotations |
| 11:36 | UP006 | Use `list` instead of `List` for type annotation |
| 11:77 | UP045 | Use `X \| None` for type annotations |
| 24:5 | LOG015 | `debug()` call on root logger |
| 33:25 | UP045 | Use `X \| None` for type annotations |
| 36:9 | LOG015 | `error()` call on root logger |
| 46:19 | TRY201 | Use `raise` without specifying exception name |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/ripper/apprise_bulk.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |
| 2:1 | I001 | Import block is un-sorted or un-formatted |
| 96:17 | LOG015 | `debug()` call on root logger |
| 97:16 | BLE001 | Do not catch blind exception: `Exception` |
| 97:37 | RUF100 | Unused `noqa` directive (unused: `E722`) |
| 98:13 | LOG015 | `error()` call on root logger |
| 143:13 | LOG015 | `debug()` call on root logger |
| 144:16 | BLE001 | Do not catch blind exception: `Exception` |
| 144:37 | RUF100 | Unused `noqa` directive (unused: `E722`) |
| 145:13 | LOG015 | `error()` call on root logger |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/ripper/arm_ripper.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |
| 4:1 | I001 | Import block is un-sorted or un-formatted |
| 17:38 | RUF100 | Unused blanket `noqa` directive |
| 18:42 | RUF100 | Unused blanket `noqa` directive |
| 62:5 | LOG015 | `info()` call on root logger |
| 68:5 | LOG015 | `debug()` call on root logger |
| 70:9 | LOG015 | `info()` call on root logger |
| 75:41 | RUF100 | Unused `noqa` directive (unused: `E722`) |
| 82:9 | LOG015 | `info()` call on root logger |
| 89:9 | LOG015 | `info()` call on root logger |
| 95:5 | LOG015 | `debug()` call on root logger |
| 101:5 | LOG015 | `debug()` call on root logger |
| 132:5 | LOG015 | `info()` call on root logger |
| 152:9 | LOG015 | `error()` call on root logger |
| 174:9 | LOG015 | `info()` call on root logger |
| 178:13 | LOG015 | `debug()` call on root logger |
| 183:13 | LOG015 | `debug()` call on root logger |
| 189:13 | LOG015 | `debug()` call on root logger |
| 192:9 | LOG015 | `info()` call on root logger |
| 197:9 | LOG015 | `info()` call on root logger |
| 201:13 | LOG015 | `debug()` call on root logger |
| 206:13 | LOG015 | `debug()` call on root logger |
| 212:13 | LOG015 | `debug()` call on root logger |
| 215:9 | LOG015 | `info()` call on root logger |
| 227:9 | LOG015 | `info()` call on root logger |
| 233:9 | RET501 | Do not explicitly `return None` in function if it is the only possible return value |
| 297:5 | LOG015 | `debug()` call on root logger |
| 301:5 | LOG015 | `debug()` call on root logger |
| 304:5 | LOG015 | `debug()` call on root logger |
| 307:9 | LOG015 | `info()` call on root logger |
| 317:17 | LOG015 | `info()` call on root logger |
| 323:17 | LOG015 | `info()` call on root logger |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/ripper/ffmpeg.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 4:1 | I001 | Import block is un-sorted or un-formatted |
| 27:5 | LOG015 | `debug()` call on root logger |
| 31:5 | LOG015 | `debug()` call on root logger |
| 52:12 | BLE001 | Do not catch blind exception: `Exception` |
| 69:5 | LOG015 | `debug()` call on root logger |
| 72:9 | LOG015 | `debug()` call on root logger |
| 75:9 | LOG015 | `error()` call on root logger |
| 89:12 | BLE001 | Do not catch blind exception: `Exception` |
| 90:9 | LOG015 | `error()` call on root logger |
| 103:16 | BLE001 | Do not catch blind exception: `Exception` |
| 127:20 | BLE001 | Do not catch blind exception: `Exception` |
| 164:12 | BLE001 | Do not catch blind exception: `Exception` |
| 174:12 | BLE001 | Do not catch blind exception: `Exception` |
| 221:5 | LOG015 | `info()` call on root logger |
| 222:5 | LOG015 | `debug()` call on root logger |
| 223:5 | LOG015 | `debug()` call on root logger |
| 227:5 | LOG015 | `debug()` call on root logger |
| 233:5 | LOG015 | `info()` call on root logger |
| 242:9 | LOG015 | `error()` call on root logger |
| 255:9 | LOG015 | `info()` call on root logger |
| 260:9 | LOG015 | `error()` call on root logger |
| 266:5 | LOG015 | `info()` call on root logger |
| 267:5 | LOG015 | `debug()` call on root logger |
| 283:5 | LOG015 | `info()` call on root logger |
| 287:5 | LOG015 | `debug()` call on root logger |
| 295:13 | LOG015 | `info()` call on root logger |
| 300:13 | LOG015 | `info()` call on root logger |
| 304:13 | LOG015 | `info()` call on root logger |
| 310:13 | LOG015 | `info()` call on root logger |
| 321:17 | LOG015 | `error()` call on root logger |
| 329:5 | LOG015 | `info()` call on root logger |
| 330:5 | LOG015 | `debug()` call on root logger |
| 354:9 | LOG015 | `debug()` call on root logger |
| 360:13 | LOG015 | `debug()` call on root logger |
| 363:13 | LOG015 | `debug()` call on root logger |
| 367:9 | LOG015 | `info()` call on root logger |
| 372:13 | LOG015 | `info()` call on root logger |
| 374:13 | LOG015 | `error()` call on root logger |
| 376:5 | LOG015 | `info()` call on root logger |
| 377:5 | LOG015 | `debug()` call on root logger |
| 387:5 | LOG015 | `info()` call on root logger |
| 392:9 | LOG015 | `info()` call on root logger |
| 398:9 | LOG015 | `info()` call on root logger |
| 426:9 | LOG015 | `debug()` call on root logger |
| 431:13 | LOG015 | `debug()` call on root logger |
| 434:13 | LOG015 | `debug()` call on root logger |
| 441:9 | LOG015 | `info()` call on root logger |
| 450:13 | LOG015 | `info()` call on root logger |
| 455:17 | LOG015 | `debug()` call on root logger |
| 458:13 | LOG015 | `error()` call on root logger |
| 465:5 | LOG015 | `info()` call on root logger |
| 466:5 | LOG015 | `debug()` call on root logger |
| 485:9 | LOG015 | `error()` call on root logger |
| 493:5 | LOG015 | `debug()` call on root logger |
| 501:13 | LOG015 | `debug()` call on root logger |
| 510:25 | LOG015 | `info()` call on root logger |
| 524:21 | LOG015 | `info()` call on root logger |
| 526:17 | LOG015 | `debug()` call on root logger |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/ripper/handbrake.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 4:1 | I001 | Import block is un-sorted or un-formatted |
| 29:5 | LOG015 | `debug()` call on root logger |
| 36:9 | LOG015 | `debug()` call on root logger |
| 46:9 | LOG015 | `error()` call on root logger |
| 93:5 | LOG015 | `debug()` call on root logger |
| 97:5 | LOG015 | `debug()` call on root logger |
| 111:5 | LOG015 | `info()` call on root logger |
| 115:5 | LOG015 | `info()` call on root logger |
| 122:9 | LOG015 | `error()` call on root logger |
| 133:9 | LOG015 | `info()` call on root logger |
| 137:5 | LOG015 | `info()` call on root logger |
| 138:5 | LOG015 | `debug()` call on root logger |
| 153:5 | LOG015 | `info()` call on root logger |
| 158:5 | LOG015 | `debug()` call on root logger |
| 166:13 | LOG015 | `info()` call on root logger |
| 171:13 | LOG015 | `info()` call on root logger |
| 176:13 | LOG015 | `info()` call on root logger |
| 182:13 | LOG015 | `info()` call on root logger |
| 198:5 | LOG015 | `info()` call on root logger |
| 199:5 | LOG015 | `debug()` call on root logger |
| 230:5 | LOG015 | `info()` call on root logger |
| 238:9 | LOG015 | `debug()` call on root logger |
| 241:13 | LOG015 | `debug()` call on root logger |
| 244:13 | LOG015 | `debug()` call on root logger |
| 249:9 | LOG015 | `info()` call on root logger |
| 254:5 | LOG015 | `info()` call on root logger |
| 255:5 | LOG015 | `debug()` call on root logger |
| 265:5 | LOG015 | `info()` call on root logger |
| 268:5 | LOG015 | `debug()` call on root logger |
| 289:21 | LOG015 | `debug()` call on root logger |
| 290:21 | LOG015 | `info()` call on root logger |
| 303:9 | LOG015 | `info()` call on root logger |
| 373:9 | LOG015 | `error()` call on root logger |
| 374:9 | LOG015 | `error()` call on root logger |
| 385:13 | LOG015 | `error()` call on root logger |
| 387:13 | LOG015 | `error()` call on root logger |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/ripper/identify.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 4:1 | I001 | Import block is un-sorted or un-formatted |
| 24:1 | RUF100 | Unused `noqa` directive (unused: `W605`) |
| 28:33 | UP045 | Use `X \| None` for type annotations |
| 49:9 | LOG015 | `info()` call on root logger |
| 52:9 | LOG015 | `info()` call on root logger |
| 55:13 | LOG015 | `info()` call on root logger |
| 58:13 | LOG015 | `error()` call on root logger |
| 65:5 | LOG015 | `debug()` call on root logger |
| 76:9 | LOG015 | `info()` call on root logger |
| 90:13 | LOG015 | `info()` call on root logger |
| 93:13 | LOG015 | `debug()` call on root logger |
| 114:17 | LOG015 | `warning()` call on root logger |
| 127:21 | LOG015 | `info()` call on root logger |
| 129:21 | LOG015 | `exception()` call on root logger |
| 134:25 | TRY401 | Redundant exception object included in `logging.exception` call |
| 139:9 | LOG015 | `error()` call on root logger |
| 167:13 | LOG015 | `error()` call on root logger |
| 197:5 | LOG015 | `debug()` call on root logger |
| 204:9 | LOG015 | `info()` call on root logger |
| 207:9 | LOG015 | `debug()` call on root logger |
| 210:9 | LOG015 | `debug()` call on root logger |
| 211:9 | LOG015 | `debug()` call on root logger |
| 213:13 | LOG015 | `info()` call on root logger |
| 214:13 | LOG015 | `info()` call on root logger |
| 229:12 | BLE001 | Do not catch blind exception: `Exception` |
| 230:9 | LOG015 | `error()` call on root logger |
| 233:5 | LOG015 | `debug()` call on root logger |
| 239:5 | LOG015 | `debug()` call on root logger |
| 242:5 | LOG015 | `debug()` call on root logger |
| 247:9 | LOG015 | `debug()` call on root logger |
| 249:12 | BLE001 | Do not catch blind exception: `Exception` |
| 251:9 | LOG015 | `debug()` call on root logger |
| 264:13 | LOG015 | `debug()` call on root logger |
| 270:13 | LOG015 | `error()` call on root logger |
| 285:5 | LOG015 | `debug()` call on root logger |
| 287:9 | LOG015 | `info()` call on root logger |
| 297:5 | LOG015 | `debug()` call on root logger |
| 298:5 | LOG015 | `debug()` call on root logger |
| 302:12 | BLE001 | Do not catch blind exception: `Exception` |
| 303:9 | LOG015 | `info()` call on root logger |
| 318:5 | LOG015 | `debug()` call on root logger |
| 354:9 | LOG015 | `info()` call on root logger |
| 358:9 | LOG015 | `debug()` call on root logger |
| 363:9 | LOG015 | `debug()` call on root logger |
| 368:9 | LOG015 | `debug()` call on root logger |
| 369:9 | LOG015 | `debug()` call on root logger |
| 383:5 | LOG015 | `debug()` call on root logger |
| 393:17 | LOG015 | `debug()` call on root logger |
| 395:17 | LOG015 | `debug()` call on root logger |
| 400:17 | LOG015 | `debug()` call on root logger |
| 402:17 | LOG015 | `debug()` call on root logger |
| 405:21 | LOG015 | `debug()` call on root logger |
| 418:9 | LOG015 | `debug()` call on root logger |
| 420:9 | LOG015 | `debug()` call on root logger |
| 438:9 | LOG015 | `debug()` call on root logger |
| 443:9 | LOG015 | `debug()` call on root logger |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/ripper/logger.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 8:1 | I001 | Import block is un-sorted or un-formatted |
| 59:43 | LOG009 | Use of undocumented `logging.WARN` constant |
| 60:44 | LOG009 | Use of undocumented `logging.WARN` constant |
| 61:43 | LOG009 | Use of undocumented `logging.WARN` constant |
| 76:9 | LOG015 | `info()` call on root logger |
| 79:5 | LOG015 | `info()` call on root logger |
| 84:9 | LOG015 | `info()` call on root logger |
| 87:13 | LOG015 | `info()` call on root logger |
| 92:17 | LOG015 | `info()` call on root logger |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/ripper/main.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 7:1 | I001 | Import block is un-sorted or un-formatted |
| 7:18 | RUF100 | Unused `noqa` directive (non-enabled: `E402`) |
| 8:17 | RUF100 | Unused `noqa` directive (non-enabled: `E402`) |
| 10:14 | RUF100 | Unused `noqa` directive (non-enabled: `E402`) |
| 11:18 | RUF100 | Unused `noqa` directive (non-enabled: `E402`) |
| 12:12 | RUF100 | Unused `noqa` directive (non-enabled: `E402`) |
| 19:16 | RUF100 | Unused `noqa` directive (non-enabled: `E402`) |
| 27:39 | RUF100 | Unused `noqa` directive (non-enabled: `E402`) |
| 28:43 | RUF100 | Unused `noqa` directive (non-enabled: `E402`) |
| 29:52 | RUF100 | Unused `noqa` directive (non-enabled: `E402`) |
| 30:56 | RUF100 | Unused `noqa` directive (non-enabled: `E402`) |
| 32:41 | RUF100 | Unused blanket `noqa` directive |
| 34:56 | RUF100 | Unused blanket `noqa` directive |
| 36:6 | UP045 | Use `X \| None` for type annotations |
| 37:7 | UP045 | Use `X \| None` for type annotations |
| 38:11 | UP045 | Use `X \| None` for type annotations |
| 58:5 | LOG015 | `debug()` call on root logger |
| 62:9 | LOG015 | `debug()` call on root logger |
| 63:5 | LOG015 | `debug()` call on root logger |
| 70:5 | LOG015 | `info()` call on root logger |
| 73:9 | LOG015 | `info()` call on root logger |
| 73:32 | RUF010 | Use explicit conversion flag |
| 74:5 | LOG015 | `info()` call on root logger |
| 75:5 | LOG015 | `info()` call on root logger |
| 84:9 | LOG015 | `info()` call on root logger |
| 84:40 | RUF010 | Use explicit conversion flag |
| 85:5 | LOG015 | `info()` call on root logger |
| 95:5 | LOG015 | `info()` call on root logger |
| 100:9 | LOG015 | `warning()` call on root logger |
| 105:13 | LOG015 | `info()` call on root logger |
| 107:5 | LOG015 | `error()` call on root logger |
| 112:5 | LOG015 | `info()` call on root logger |
| 117:5 | LOG015 | `debug()` call on root logger |
| 142:13 | LOG015 | `critical()` call on root logger |
| 148:9 | LOG015 | `info()` call on root logger |
| 152:13 | LOG015 | `critical()` call on root logger |
| 156:9 | LOG015 | `critical()` call on root logger |
| 188:9 | LOG015 | `info()` call on root logger |
| 207:5 | LOG015 | `info()` call on root logger |
| 217:57 | RUF100 | Unused `noqa` directive (unused: `F811`) |
| 219:5 | LOG015 | `debug()` call on root logger |
| 232:9 | LOG015 | `error()` call on root logger |
| 232:17 | G201 | Logging `.exception(...)` should be used instead of `.error(..., exc_info=True)` |
| 234:5 | LOG015 | `info()` call on root logger |
| 247:9 | LOG015 | `critical()` call on root logger |
| 252:9 | LOG015 | `critical()` call on root logger |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/ripper/makemkv.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 10:1 | I001 | Import block is un-sorted or un-formatted |
| 20:25 | F401 | `time.time` imported but unused |
| 90:9 | LOG015 | `debug()` call on root logger |
| 108:9 | LOG015 | `debug()` call on root logger |
| 405:9 | SIM114 | Combine `if` branches using logical `or` operator |
| 414:9 | SIM114 | Combine `if` branches using logical `or` operator |
| 443:9 | LOG015 | `error()` call on root logger |
| 458:9 | LOG015 | `debug()` call on root logger |
| 460:13 | LOG015 | `debug()` call on root logger |
| 463:9 | LOG015 | `error()` call on root logger |
| 477:9 | LOG015 | `debug()` call on root logger |
| 479:13 | LOG015 | `debug()` call on root logger |
| 481:13 | LOG015 | `debug()` call on root logger |
| 483:9 | LOG015 | `error()` call on root logger |
| 610:9 | LOG015 | `info()` call on root logger |
| 614:13 | LOG015 | `info()` call on root logger |
| 655:5 | LOG015 | `info()` call on root logger |
| 663:5 | LOG015 | `info()` call on root logger |
| 704:5 | LOG015 | `info()` call on root logger |
| 708:9 | LOG015 | `debug()` call on root logger |
| 724:17 | LOG015 | `warning()` call on root logger |
| 726:17 | LOG015 | `error()` call on root logger |
| 728:5 | LOG015 | `info()` call on root logger |
| 731:5 | LOG015 | `info()` call on root logger |
| 739:9 | LOG015 | `info()` call on root logger |
| 741:5 | LOG015 | `info()` call on root logger |
| 757:9 | LOG015 | `info()` call on root logger |
| 758:9 | LOG015 | `info()` call on root logger |
| 759:9 | LOG015 | `info()` call on root logger |
| 760:9 | LOG015 | `info()` call on root logger |
| 763:13 | LOG015 | `info()` call on root logger |
| 777:9 | LOG015 | `warning()` call on root logger |
| 819:5 | LOG015 | `info()` call on root logger |
| 835:5 | LOG015 | `debug()` call on root logger |
| 845:5 | LOG015 | `info()` call on root logger |
| 873:5 | LOG015 | `info()` call on root logger |
| 897:161 | E501 | Line too long (171 > 160) |
| 901:161 | E501 | Line too long (174 > 160) |
| 909:13 | LOG015 | `info()` call on root logger |
| 944:5 | LOG015 | `info()` call on root logger |
| 948:9 | LOG015 | `warning()` call on root logger |
| 950:9 | LOG015 | `info()` call on root logger |
| 976:5 | LOG015 | `info()` call on root logger |
| 982:13 | LOG015 | `error()` call on root logger |
| 984:9 | LOG015 | `info()` call on root logger |
| 986:9 | LOG015 | `info()` call on root logger |
| 1008:9 | LOG015 | `debug()` call on root logger |
| 1012:13 | LOG015 | `info()` call on root logger |
| 1015:13 | LOG015 | `debug()` call on root logger |
| 1021:9 | LOG015 | `info()` call on root logger |
| 1024:9 | LOG015 | `debug()` call on root logger |
| 1033:13 | LOG015 | `warning()` call on root logger |
| 1076:5 | LOG015 | `debug()` call on root logger |
| 1154:9 | LOG015 | `info()` call on root logger |
| 1219:22 | RUF012 | Mutable default value for class attribute |
| 1226:22 | RUF012 | Mutable default value for class attribute |
| 1235:27 | RUF012 | Mutable default value for class attribute |
| 1277:9 | LOG015 | `debug()` call on root logger |
| 1279:13 | LOG015 | `critical()` call on root logger |
| 1287:9 | LOG015 | `critical()` call on root logger |
| 1296:13 | LOG015 | `debug()` call on root logger |
| 1307:13 | LOG015 | `critical()` call on root logger |
| 1309:13 | LOG015 | `warning()` call on root logger |
| 1315:9 | LOG015 | `critical()` call on root logger |
| 1350:5 | LOG015 | `debug()` call on root logger |
| 1352:9 | LOG015 | `debug()` call on root logger |
| 1356:13 | LOG015 | `debug()` call on root logger |
| 1361:17 | LOG015 | `warning()` call on root logger |
| 1365:13 | LOG015 | `debug()` call on root logger |
| 1379:5 | LOG015 | `info()` call on root logger |
| 1420:9 | LOG015 | `debug()` call on root logger |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/ripper/music_brainz.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 4:1 | I001 | Import block is un-sorted or un-formatted |
| 69:9 | LOG015 | `error()` call on root logger |
| 74:9 | LOG015 | `error()` call on root logger |
| 109:9 | LOG015 | `debug()` call on root logger |
| 114:9 | LOG015 | `error()` call on root logger |
| 160:9 | LOG015 | `error()` call on root logger |
| 164:9 | LOG015 | `info()` call on root logger |
| 166:9 | LOG015 | `debug()` call on root logger |
| 172:17 | LOG015 | `debug()` call on root logger |
| 177:21 | LOG015 | `info()` call on root logger |
| 178:21 | LOG015 | `debug()` call on root logger |
| 180:21 | LOG015 | `debug()` call on root logger |
| 200:21 | LOG015 | `info()` call on root logger |
| 202:21 | LOG015 | `debug()` call on root logger |
| 205:21 | LOG015 | `info()` call on root logger |
| 207:25 | LOG015 | `debug()` call on root logger |
| 209:25 | LOG015 | `debug()` call on root logger |
| 215:9 | LOG015 | `info()` call on root logger |
| 234:9 | LOG015 | `info()` call on root logger |
| 236:9 | LOG015 | `info()` call on root logger |
| 237:9 | LOG015 | `debug()` call on root logger |
| 307:9 | LOG015 | `debug()` call on root logger |
| 308:9 | LOG015 | `debug()` call on root logger |
| 369:13 | LOG015 | `debug()` call on root logger |
| 374:13 | LOG015 | `debug()` call on root logger |
| 383:17 | LOG015 | `debug()` call on root logger |
| 393:25 | LOG015 | `debug()` call on root logger |
| 398:9 | LOG015 | `error()` call on root logger |
| 437:13 | LOG015 | `error()` call on root logger |
| 450:5 | LOG015 | `debug()` call on root logger |
| 451:5 | LOG015 | `debug()` call on root logger |
| 452:5 | LOG015 | `debug()` call on root logger |
| 453:5 | LOG015 | `debug()` call on root logger |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/ripper/utils.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 3:1 | I001 | Import block is un-sorted or un-formatted |
| 64:5 | LOG015 | `debug()` call on root logger |
| 86:12 | BLE001 | Do not catch blind exception: `Exception` |
| 86:33 | RUF100 | Unused `noqa` directive (unused: `E722`) |
| 87:9 | LOG015 | `error()` call on root logger |
| 93:13 | LOG015 | `debug()` call on root logger |
| 94:16 | BLE001 | Do not catch blind exception: `Exception` |
| 94:37 | RUF100 | Unused `noqa` directive (unused: `E722`) |
| 95:13 | LOG015 | `error()` call on root logger |
| 147:5 | LOG015 | `info()` call on root logger |
| 159:9 | LOG015 | `debug()` call on root logger |
| 161:5 | LOG015 | `info()` call on root logger |
| 210:5 | LOG015 | `debug()` call on root logger |
| 214:9 | LOG015 | `info()` call on root logger |
| 218:5 | LOG015 | `info()` call on root logger |
| 225:9 | LOG015 | `info()` call on root logger |
| 230:9 | LOG015 | `info()` call on root logger |
| 319:13 | LOG015 | `info()` call on root logger |
| 339:16 | BLE001 | Do not catch blind exception: `Exception` |
| 340:13 | LOG015 | `error()` call on root logger |
| 342:9 | LOG015 | `info()` call on root logger |
| 355:20 | BLE001 | Do not catch blind exception: `Exception` |
| 356:17 | LOG015 | `error()` call on root logger |
| 358:13 | LOG015 | `info()` call on root logger |
| 365:9 | LOG015 | `info()` call on root logger |
| 366:145 | RUF100 | Unused `noqa` directive (unused: `E501`) |
| 371:13 | LOG015 | `info()` call on root logger |
| 373:13 | LOG015 | `error()` call on root logger |
| 375:9 | LOG015 | `info()` call on root logger |
| 388:21 | LOG015 | `info()` call on root logger |
| 391:17 | LOG015 | `debug()` call on root logger |
| 393:17 | LOG015 | `debug()` call on root logger |
| 395:17 | LOG015 | `debug()` call on root logger |
| 412:9 | LOG015 | `debug()` call on root logger |
| 465:9 | LOG015 | `info()` call on root logger |
| 472:9 | LOG015 | `debug()` call on root logger |
| 479:13 | LOG015 | `info()` call on root logger |
| 487:13 | LOG015 | `error()` call on root logger |
| 514:5 | LOG015 | `info()` call on root logger |
| 518:5 | LOG015 | `debug()` call on root logger |
| 521:55 | RUF010 | Use explicit conversion flag |
| 522:9 | LOG015 | `info()` call on root logger |
| 524:9 | LOG015 | `info()` call on root logger |
| 528:9 | LOG015 | `error()` call on root logger |
| 533:9 | LOG015 | `info()` call on root logger |
| 536:9 | LOG015 | `error()` call on root logger |
| 550:9 | LOG015 | `info()` call on root logger |
| 555:17 | LOG015 | `debug()` call on root logger |
| 559:17 | LOG015 | `debug()` call on root logger |
| 562:9 | LOG015 | `info()` call on root logger |
| 563:12 | BLE001 | Do not catch blind exception: `Exception` |
| 564:9 | LOG015 | `error()` call on root logger |
| 579:17 | UP012 | Unnecessary call to `encode` as UTF-8 |
| 583:33 | SIM115 | Use a context manager for opening files |
| 586:12 | BLE001 | Do not catch blind exception: `Exception` |
| 588:9 | LOG015 | `error()` call on root logger |
| 609:5 | LOG015 | `debug()` call on root logger |
| 673:9 | LOG015 | `debug()` call on root logger |
| 678:13 | LOG015 | `debug()` call on root logger |
| 683:17 | LOG015 | `debug()` call on root logger |
| 685:17 | LOG015 | `debug()` call on root logger |
| 687:5 | LOG015 | `error()` call on root logger |
| 700:13 | LOG015 | `debug()` call on root logger |
| 703:13 | LOG015 | `debug()` call on root logger |
| 708:17 | LOG015 | `debug()` call on root logger |
| 710:17 | LOG015 | `error()` call on root logger |
| 712:5 | LOG015 | `error()` call on root logger |
| 727:17 | LOG015 | `info()` call on root logger |
| 729:13 | LOG015 | `info()` call on root logger |
| 789:9 | LOG015 | `info()` call on root logger |
| 795:5 | LOG015 | `critical()` call on root logger |
| 798:5 | LOG015 | `info()` call on root logger |
| 800:9 | LOG015 | `info()` call on root logger |
| 814:13 | LOG015 | `info()` call on root logger |
| 817:13 | LOG015 | `info()` call on root logger |
| 832:9 | LOG015 | `info()` call on root logger |
| 835:9 | LOG015 | `debug()` call on root logger |
| 836:9 | LOG015 | `debug()` call on root logger |
| 842:13 | LOG015 | `info()` call on root logger |
| 847:5 | LOG015 | `info()` call on root logger |
| 858:5 | LOG015 | `debug()` call on root logger |
| 860:9 | LOG015 | `info()` call on root logger |
| 872:13 | SIM113 | Use `enumerate()` for index variable `i` in `for` loop |
| 876:9 | LOG015 | `debug()` call on root logger |
| 891:13 | LOG015 | `debug()` call on root logger |
| 894:9 | LOG015 | `info()` call on root logger |
| 906:9 | LOG015 | `info()` call on root logger |
| 914:17 | LOG015 | `info()` call on root logger |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/runui.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |
| 2:1 | I001 | Import block is un-sorted or un-formatted |
| 10:23 | RUF100 | Unused blanket `noqa` directive |
| 11:36 | RUF100 | Unused blanket `noqa` directive |
| 12:22 | RUF100 | Unused blanket `noqa` directive |
| 14:25 | RUF100 | Unused blanket `noqa` directive |
| 62:9 | I001 | Import block is un-sorted or un-formatted |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/ui/__init__.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |
| 2:1 | I001 | Import block is un-sorted or un-formatted |
| 3:12 | RUF100 | Unused `noqa` directive (unused: `F401`) |
| 67:1 | I001 | Import block is un-sorted or un-formatted |
| 67:54 | RUF100 | Unused `noqa` directive (unused: `F811`; non-enabled: `E402`) |
| 68:42 | RUF100 | Unused `noqa` directive (unused: `F811`; non-enabled: `E402`) |
| 69:42 | RUF100 | Unused `noqa` directive (unused: `F811`; non-enabled: `E402`) |
| 70:54 | RUF100 | Unused `noqa` directive (unused: `F811`; non-enabled: `E402`) |
| 71:42 | RUF100 | Unused `noqa` directive (unused: `F811`; non-enabled: `E402`) |
| 72:69 | RUF100 | Unused `noqa` directive (unused: `F811`; non-enabled: `E402`) |
| 81:1 | I001 | Import block is un-sorted or un-formatted |
| 81:17 | RUF100 | Unused `noqa` directive (non-enabled: `E402`) |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/ui/auth/__init__.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/ui/auth/auth.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |
| 10:1 | I001 | Import block is un-sorted or un-formatted |
| 14:44 | RUF100 | Unused `noqa` directive (unused: `F401`) |
| 142:20 | BLE001 | Do not catch blind exception: `Exception` |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/ui/constants.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/ui/database/__init__.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/ui/database/database.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |
| 9:1 | I001 | Import block is un-sorted or un-formatted |
| 17:28 | F401 | `arm.models.job.Job` imported but unused |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/ui/forms.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |
| 2:1 | I001 | Import block is un-sorted or un-formatted |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/ui/jobs/__init__.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/ui/jobs/jobs.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |
| 17:1 | I001 | Import block is un-sorted or un-formatted |
| 27:61 | F401 | `arm.ui.forms.TrackFormDynamic` imported but unused |
| 36:28 | F811 | Redefinition of unused `request` from line 19: `request` redefined here |
| 67:5 | F632 | Use `!=` to compare constant literals |
| 76:10 | SIM401 | Use `meta.get('Plot', "There was a problem getting the plot")` instead of an `if` block |
| 77:16 | SIM401 | Use `meta.get('background_url', None)` instead of an `if` block |
| 82:158 | E501 | Line too long (414 > 160) |
| 134:9 | BLE001 | Do not catch blind exception: `Exception` |
| 162:9 | BLE001 | Do not catch blind exception: `Exception` |
| 266:5 | PLR2044 | Line with empty comment |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/ui/json_api.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |
| 5:1 | I001 | Import block is un-sorted or un-formatted |
| 25:55 | RUF100 | Unused blanket `noqa` directive |
| 247:16 | BLE001 | Do not catch blind exception: `Exception` |
| 313:16 | BLE001 | Do not catch blind exception: `Exception` |
| 341:20 | BLE001 | Do not catch blind exception: `Exception` |
| 408:9 | SIM113 | Use `enumerate()` for index variable `i` in `for` loop |
| 462:12 | BLE001 | Do not catch blind exception: `Exception` |
| 478:12 | BLE001 | Do not catch blind exception: `Exception` |
| 497:12 | BLE001 | Do not catch blind exception: `Exception` |
| 501:16 | BLE001 | Do not catch blind exception: `Exception` |
| 534:12 | BLE001 | Do not catch blind exception: `Exception` |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/ui/logs/__init__.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/ui/logs/logs.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |
| 9:1 | I001 | Import block is un-sorted or un-formatted |
| 16:20 | F401 | `arm.ui.app` imported but unused |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/ui/metadata.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |
| 2:1 | I001 | Import block is un-sorted or un-formatted |
| 77:12 | BLE001 | Do not catch blind exception: `Exception` |
| 91:16 | BLE001 | Do not catch blind exception: `Exception` |
| 192:34 | SIM401 | Use `result.get('release_date', '0000-00-00')` instead of an `if` block |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/ui/notifications/__init__.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/ui/notifications/notifications.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |
| 9:1 | I001 | Import block is un-sorted or un-formatted |
| 9:41 | RUF100 | Unused `noqa` directive (unused: `F401`) |
| 31:12 | BLE001 | Do not catch blind exception: `Exception` |
| 34:12 | C408 | Unnecessary `dict()` call (rewrite as a literal) |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/ui/routes.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 12:1 | I001 | Import block is un-sorted or un-formatted |
| 158:37 | SIM115 | Use a context manager for opening files |
| 165:12 | BLE001 | Do not catch blind exception: `Exception` |
| 207:1 | I001 | Import block is un-sorted or un-formatted |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/ui/settings/DriveUtils.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |
| 1:1 | N999 | Invalid module name: 'DriveUtils' |
| 11:1 | I001 | Import block is un-sorted or un-formatted |
| 189:29 | PIE810 | Call `startswith` once with a `tuple` |
| 195:13 | LOG015 | `debug()` call on root logger |
| 210:17 | LOG015 | `info()` call on root logger |
| 221:16 | BLE001 | Do not catch blind exception: `Exception` |
| 246:9 | LOG015 | `error()` call on root logger |
| 248:9 | LOG015 | `debug()` call on root logger |
| 322:13 | LOG015 | `info()` call on root logger |
| 324:17 | LOG015 | `warning()` call on root logger |
| 328:13 | LOG015 | `debug()` call on root logger |
| 367:9 | LOG015 | `warning()` call on root logger |
| 376:9 | LOG015 | `debug()` call on root logger |
| 377:12 | BLE001 | Do not catch blind exception: `Exception` |
| 377:33 | RUF100 | Unused `noqa` directive (unused: `E722`) |
| 378:9 | LOG015 | `error()` call on root logger |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/ui/settings/ServerUtil.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |
| 1:1 | N999 | Invalid module name: 'ServerUtil' |
| 8:29 | F401 | `arm.config.config` imported but unused |
| 12:17 | UP039 | Unnecessary parentheses after class definition |
| 34:16 | UP024 | Replace aliased errors with `OSError` |
| 66:16 | UP024 | Replace aliased errors with `OSError` |
| 76:16 | UP024 | Replace aliased errors with `OSError` |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/ui/settings/__init__.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |
| 5:1 | I001 | Import block is un-sorted or un-formatted |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/ui/settings/health.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |
| 1:1 | I001 | Import block is un-sorted or un-formatted |
| 126:15 | F541 | f-string without any placeholders |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/ui/settings/settings.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |
| 17:1 | I001 | Import block is un-sorted or un-formatted |
| 19:8 | F401 | `re` imported but unused |
| 206:15 | F541 | f-string without any placeholders |
| 316:26 | RUF010 | Use explicit conversion flag |
| 317:30 | RUF010 | Use explicit conversion flag |
| 318:38 | RUF010 | Use explicit conversion flag |
| 319:31 | RUF010 | Use explicit conversion flag |
| 392:12 | BLE001 | Do not catch blind exception: `Exception` |
| 406:16 | B005 | Using `.strip()` with multi-character strings is misleading |

````
:::

::: {grid-item}
````{admonition} /workspace/arm/ui/utils.py
:class: caution

| Line | Type | Message |
|---:|---|---|
| 1:1 | EXE002 | The file is executable but no shebang is present |
| 4:1 | I001 | Import block is un-sorted or un-formatted |
| 75:5 | I001 | Import block is un-sorted or un-formatted |
| 76:40 | RUF100 | Unused `noqa` directive (unused: `F811`) |
| 133:5 | I001 | Import block is un-sorted or un-formatted |
| 217:12 | BLE001 | Do not catch blind exception: `Exception` |
| 366:20 | BLE001 | Do not catch blind exception: `Exception` |
| 419:5 | TRY203 | Remove exception handler; error is immediately re-raised |
| 449:67 | UP012 | Unnecessary call to `encode` as UTF-8 |
| 490:9 | SIM113 | Use `enumerate()` for index variable `i` in `for` loop |
| 577:13 | I001 | Import block is un-sorted or un-formatted |
| 595:12 | BLE001 | Do not catch blind exception: `Exception` |
| 642:21 | FURB129 | Instead of calling `readlines()`, iterate over file object directly |
| 774:78 | RUF100 | Unused `noqa` directive (unused: `W605`) |
| 969:12 | UP024 | Replace aliased errors with `OSError` |

````
:::

::::
