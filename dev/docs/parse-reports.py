#!/usr/bin/env python3
import json
from pathlib import Path
from collections import defaultdict

report_dir = Path("docs/source/development/reports")


def get_ruff_entries(data):
    files = defaultdict(list)

    for issue in data:
        filename = issue.get("filename", "Unknown file")
        row = issue.get("location", {}).get("row", "?")
        column = issue.get("location", {}).get("column", "?")
        code = issue.get("code", "")
        message = issue.get("message", "Unknown issue")

        files[filename].append(f"{row}:{column} [{code}] {message}")

    return sorted(files.items())

def get_eslint_entries(data):
    files = []

    for result in data:
        filename = result.get("filePath", "Unknown file")
        messages = []

        for issue in result.get("messages", []):
            row = issue.get("line", "?")
            column = issue.get("column", "?")
            rule = issue.get("ruleId") or "fatal"
            message = issue.get("message", "Unknown issue")
            messages.append(f"{row}:{column} [{rule}] {message}")

        if messages:
            files.append((filename, messages))

    return sorted(files)

def get_stylelint_entries(data):
    files = []

    for result in data:
        filename = result.get("source", "Unknown file")
        messages = []

        for issue in result.get("warnings", []):
            row = issue.get("line", "?")
            column = issue.get("column", "?")
            rule = issue.get("rule", "unknown")
            message = issue.get("text", "Unknown issue")
            messages.append(f"{row}:{column} [{rule}] {message}")

        if messages:
            files.append((filename, messages))

    return sorted(files)

def get_shellcheck_entries(data):
    files = defaultdict(list)

    for issue in data:
        filename = issue.get("file", "Unknown file")
        row = issue.get("line", "?")
        column = issue.get("column", "?")
        code = issue.get("code", "")
        level = issue.get("level", "unknown")
        message = issue.get("message", "Unknown issue")

        files[filename].append(
            f"{row}:{column} [{code}, {level}] {message}"
        )

    return sorted(files.items())

def get_hadolint_entries(data):
    files = defaultdict(list)

    for issue in data:
        filename = issue.get("file", "Unknown file")
        row = issue.get("line", "?")
        column = issue.get("column", "?")
        code = issue.get("code", "")
        level = issue.get("level", "unknown")
        message = issue.get("message", "Unknown issue")

        files[filename].append(
            f"{row}:{column} [{code}, {level}] {message}"
        )

    return sorted(files.items())

def get_bandit_entries(data):
    files = defaultdict(list)

    for issue in data.get("results", []):
        filename = issue.get("filename", "Unknown file")
        row = issue.get("line_number", "?")
        code = issue.get("test_id", "")
        severity = issue.get("issue_severity", "unknown")
        confidence = issue.get("issue_confidence", "unknown")
        message = issue.get("issue_text", "Unknown issue")

        files[filename].append(
            f"{row}:1 [{code}, severity={severity}, "
            f"confidence={confidence}] {message}"
        )

    return sorted(files.items())

def get_pip_audit_entries(data):
    files = defaultdict(list)

    # Support the object-based JSON format and list-based variants.
    dependencies = (
        data.get("dependencies", [])
        if isinstance(data, dict)
        else data
    )

    for dependency in dependencies:
        name = dependency.get("name", "Unknown package")
        version = dependency.get("version", "unknown")

        for vulnerability in dependency.get("vulns", []):
            vuln_id = vulnerability.get("id", "Unknown vulnerability")
            fixes = vulnerability.get("fix_versions", [])
            fix_text = (
                f"; fix available: {', '.join(fixes)}"
                if fixes else "; no fix version listed"
            )

            files["Python dependencies"].append(
                f"{name}=={version} [{vuln_id}]{fix_text}"
            )

    return sorted(files.items())

def load_report(source, get_entries):
    data = json.loads((report_dir / source).read_text(encoding="utf-8"))
    return [(filename, messages) for filename, messages in get_entries(data) if messages]

def write_report_md(source, destination, title, get_entries):
    lines = [
        f"# {title}",
        "",
    ]

    entries = load_report(source, get_entries)

    if not entries:
        lines += [
            "::::{admonition} No findings",
            ":class: tip",
            "",
            "No issues were reported by this check.",
            "::::",
            "",
        ]
    else:
        lines += [
            "::::{grid} 1",
            ":margin: 0 0 0 0",
            ":padding: 0 0 0 0",
            "",
        ]

        for filename, messages in entries:
            lines += [
                "::: {grid-item}",
                f"````{{admonition}} {filename}",
                ":class: caution",
                "",
                "```text",
            ]
            lines.extend(messages)
            lines += [
                "```",
                "````",
                ":::",
                "",
            ]

        lines += ["::::", ""]

    (report_dir / destination).write_text(
        "\n".join(lines), encoding="utf-8"
    )


write_report_md(
    "eslint.json", "eslint.md", "ESLint Report", get_eslint_entries
)
write_report_md(
    "stylelint.json", "stylelint.md", "Stylelint Report",
    get_stylelint_entries
)
write_report_md(
    "ruff.json", "ruff.md", "Ruff Report", get_ruff_entries
)
write_report_md(
    "shellcheck.json", "shellcheck.md", "ShellCheck Report",
    get_shellcheck_entries
)
write_report_md(
    "hadolint.json", "hadolint.md", "Hadolint Report",
    get_hadolint_entries
)
write_report_md(
    "bandit.json", "bandit.md", "Bandit Security Report",
    get_bandit_entries
)
write_report_md(
    "pip-audit.json", "dependency-audit.md",
    "Python Dependency Audit", get_pip_audit_entries
)