#!/usr/bin/python3
"""yaml config loader"""
import json
import os
import yaml

import arm.config.config_utils as config_utils

arm_config: dict[str, str]
arm_config_path: str = os.environ.get("ARM_CONFIG_FILE", "/etc/arm/config/arm.yaml")

abcde_config: dict[str, str]
abcde_config_path: str

apprise_config: dict[str, str]
apprise_config_path: str


def _load_config(fp):
    with open(fp, "r") as yaml_file:
        config = yaml.safe_load(yaml_file)
    return config


def _load_abcde(fp):
    with open(fp, "r") as abcde_read_file:
        config = abcde_read_file.read()
    return config


# arm config, open and read yaml contents
# handle arm.yaml migration here
# Load user config
cur_cfg = _load_config(arm_config_path)
# Load template config
ARM_SETTINGS_GROUPS: dict[str, list[str]] = {
    "General": [
        "ARM_NAME",
        "ARM_CHILDREN",
        "DISABLE_LOGIN",
        "DATE_FORMAT",
        "UMASK",
    ],
    "Disc & Ripping": [
        "PREVENT_99",
        "ARM_CHECK_UDF",
        "GET_VIDEO_TITLE",
        "GET_AUDIO_TITLE",
        "VIDEOTYPE",
        "MINLENGTH",
        "MAXLENGTH",
        "MANUAL_WAIT",
        "MANUAL_WAIT_TIME",
        "ALLOW_DUPLICATES",
        "DATA_RIP_PARAMETERS",
        "RIP_POSTER",
        "AUTO_EJECT",
    ],
    "Metadata": [
        "METADATA_PROVIDER",
        "ARM_API_KEY",
        "OMDB_API_KEY",
        "TMDB_API_KEY",
    ],
    "Transcoding": [
        "SKIP_TRANSCODE",
        "MAX_CONCURRENT_TRANSCODES",
        "MAX_CONCURRENT_MAKEMKVINFO",
    ],
    "Paths & Logging": [
        "ABCDE_CONFIG_FILE",
        "RAW_PATH",
        "TRANSCODE_PATH",
        "COMPLETED_PATH",
        "EXTRAS_SUB",
        "INSTALLPATH",
        "LOGPATH",
        "LOGLEVEL",
        "LOGLIFE",
        "DBFILE",
    ],
    "Web Server": [
        "WEBSERVER_IP",
        "WEBSERVER_PORT",
        "UI_BASE_URL",
    ],
    "File Permissions": [
        "SET_MEDIA_PERMISSIONS",
        "CHMOD_VALUE",
        "SET_MEDIA_OWNER",
        "CHOWN_USER",
        "CHOWN_GROUP",
    ],
    "MakeMKV": [
        "MAKEMKV_PERMA_KEY",
        "RIPMETHOD",
        "RIPMETHOD_DVD",
        "RIPMETHOD_BR",
        "MKV_ARGS",
        "DELRAWFILES",
    ],
    "HandBrake": [
        "HB_PRESET_DVD",
        "HB_PRESET_BD",
        "DEST_EXT",
        "HANDBRAKE_CLI",
        "HANDBRAKE_LOCAL",
        "MAINFEATURE",
        "HB_ARGS_DVD",
        "HB_ARGS_BD",
    ],
    "FFmpeg": [
        "FFMPEG_CLI",
        "FFMPEG_LOCAL",
        "FFMPEG_PRE_FILE_ARGS",
        "FFMPEG_POST_FILE_ARGS",
        "USE_FFMPEG",
    ],
    "Emby": [
        "EMBY_REFRESH",
        "EMBY_SERVER",
        "EMBY_PORT",
        "EMBY_CLIENT",
        "EMBY_DEVICE",
        "EMBY_DEVICEID",
        "EMBY_USERNAME",
        "EMBY_USERID",
        "EMBY_PASSWORD",
        "EMBY_API_KEY",
    ],
    "Notifications": [
        "NOTIFY_RIP",
        "NOTIFY_TRANSCODE",
        "NOTIFY_JOBID",
        "PB_KEY",
        "IFTTT_KEY",
        "IFTTT_EVENT",
        "PO_USER_KEY",
        "PO_APP_KEY",
        "BASH_SCRIPT",
        "JSON_URL",
    ],
    "Apprise": [
        "APPRISE",
    ],
}

arm_config = _load_config(os.path.join(cur_cfg["INSTALLPATH"], "setup/arm.yaml"))

# Update the template config with the user's values
arm_config.update(cur_cfg)

try:
    # Save the dictionary
    with open(arm_config_path, "w") as settings_file:
        with open(
            os.path.join(cur_cfg["INSTALLPATH"], "arm/ui/comments.json"),
            "r",
        ) as comments_file:
            comments = json.load(comments_file)

        arm_cfg = comments["ARM_CFG_GROUPS"]["BEGIN"] + "\n\n"
        for key, value in dict(arm_config).items():
            # Add any grouping comments
            arm_cfg += config_utils.arm_yaml_check_groups(comments, key)
            # Check for comments for this key in comments.json, add them if they exist
            try:
                if comment := comments[str(key)]:
                    arm_cfg += f"\n{comment}\n"
            except KeyError:
                arm_cfg += "\n"
            # test if key value is an int
            value = str(value)  # just change the type to keep things as expected
            try:
                post_value = int(value)
                arm_cfg += f"{key}: {post_value}\n"
            except ValueError:
                # Test if value is Boolean
                arm_cfg += config_utils.arm_yaml_test_bool(key, value)

        settings_file.write(arm_cfg)
        settings_file.close()
except OSError:
    pass

# abcde config file, open and read contents
abcde_config_path = arm_config["ABCDE_CONFIG_FILE"]
abcde_config = _load_abcde(abcde_config_path)

# apprise config, open and read yaml contents
apprise_config_path = arm_config["APPRISE"] or "/etc/arm/config/apprise.yaml"
try:
    apprise_config = _load_config(apprise_config_path)
except OSError:
    apprise_config = {}

APPRISE_SETTINGS_GROUPS: dict[str, list[str]] = {
    "Boxcar": [
        "BOXCAR_KEY",
        "BOXCAR_SECRET",
    ],
    "Discord": [
        "DISCORD_WEBHOOK_ID",
        "DISCORD_TOKEN",
    ],
    "Faast": [
        "FAAST_TOKEN",
    ],
    "Flock": [
        "FLOCK_TOKEN",
    ],
    "Gitter": [
        "GITTER_TOKEN",
        "GITTER_ROOM",
    ],
    "Gotify": [
        "GOTIFY_TOKEN",
        "GOTIFY_HOST",
    ],
    "Growl": [
        "GROWL_HOST",
        "GROWL_PASS",
    ],
    "Join": [
        "JOIN_API",
        "JOIN_DEVICE",
    ],
    "Kodi": [
        "KODI_HOST",
        "KODI_PORT",
        "KODI_USER",
        "KODI_PASS",
    ],
    "Kumulos": [
        "KUMULOS_API",
        "KUMULOS_SERVERKEY",
    ],
    "LaMetric": [
        "LAMETRIC_MODE",
        "LAMETRIC_API",
        "LAMETRIC_HOST",
        "LAMETRIC_APP_ID",
        "LAMETRIC_TOKEN",
    ],
    "Mailgun": [
        "MAILGUN_DOMAIN",
        "MAILGUN_USER",
        "MAILGUN_APIKEY",
    ],
    "Matrix": [
        "MATRIX_HOST",
        "MATRIX_USER",
        "MATRIX_PASS",
        "MATRIX_TOKEN",
    ],
    "Microsoft Teams": [
        "MSTEAMS_TOKENA",
        "MSTEAMS_TOKENB",
        "MSTEAMS_TOKENC",
    ],
    "Nextcloud": [
        "NEXTCLOUD_HOST",
        "NEXTCLOUD_ADMINUSER",
        "NEXTCLOUD_ADMINPASS",
        "NEXTCLOUD_NOTIFY_USER",
    ],
    "Notica": [
        "NOTICA_TOKEN",
    ],
    "Notifico": [
        "NOTIFICO_PROJECTID",
        "NOTIFICO_MESSAGEHOOK",
    ],
    "ntfy": [
        "NTFY_TOPIC",
        "NTFY_URL",
        "NTFY_PORT",
        "NTFY_USER",
        "NTFY_PASS",
    ],
    "Office 365": [
        "OFFICE365_TENANTID",
        "OFFICE365_ACCOUNTEMAIL",
        "OFFICE365_CLIENT_ID",
        "OFFICE365_CLIENT_SECRET",
    ],
    "Popcorn": [
        "POPCORN_API",
        "POPCORN_EMAIL",
        "POPCORN_PHONENO",
    ],
    "Prowl": [
        "PROWL_API",
        "PROWL_PROVIDERKEY",
    ],
    "Pushjet": [
        "PUSHJET_HOST",
        "PUSHJET_SECRET",
    ],
    "Push API": [
        "PUSH_API",
    ],
    "Pushed": [
        "PUSHED_APP_KEY",
        "PUSHED_APP_SECRET",
    ],
    "Pushsafer": [
        "PUSHSAFER_KEY",
    ],
    "Rocket.Chat": [
        "ROCKETCHAT_HOST",
        "ROCKETCHAT_USER",
        "ROCKETCHAT_PASS",
        "ROCKETCHAT_WEBHOOK",
    ],
    "Ryver": [
        "RYVER_ORG",
        "RYVER_TOKEN",
    ],
    "SendGrid": [
        "SENDGRID_API",
        "SENDGRID_FROMMAIL",
    ],
    "Simplepush": [
        "SIMPLEPUSH_API",
    ],
    "Slack": [
        "SLACK_TOKENA",
        "SLACK_TOKENB",
        "SLACK_TOKENC",
        "SLACK_CHANNEL",
    ],
    "SparkPost": [
        "SPARKPOST_API",
        "SPARKPOST_HOST",
        "SPARKPOST_USER",
        "SPARKPOST_EMAIL",
    ],
    "Spontit": [
        "SPONTIT_API",
        "SPONTIT_USER_ID",
    ],
    "Telegram": [
        "TELEGRAM_BOT_TOKEN",
        "TELEGRAM_CHAT_ID",
    ],
    "Twist": [
        "TWIST_EMAIL",
        "TWIST_PASS",
    ],
    "XBMC": [
        "XBMC_HOST",
        "XBMC_PORT",
        "XBMC_USER",
        "XBMC_PASS",
    ],
    "XMPP": [
        "XMPP_HOST",
        "XMPP_PASS",
        "XMPP_USER",
    ],
    "Webex Teams": [
        "WEBEX_TEAMS_TOKEN",
    ],
    "Zulip": [
        "ZILUP_CHAT_TOKEN",
        "ZILUP_CHAT_BOTNAME",
        "ZILUP_CHAT_ORG",
    ],
}