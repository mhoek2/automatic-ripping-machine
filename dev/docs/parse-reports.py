#!/usr/bin/env python3
import json
from pathlib import Path
from collections import defaultdict

report_dir = Path("docs/source/development/reports")

def finding(line, kind, message):
    """Create a structured report finding."""
    return {
        "line": line,
        "type": kind,
        "message": message,
    }


def group_findings(items, filename_key, parse_item):
    """Group parsed findings by filename."""
    files = defaultdict(list)

    for item in items:
        filename = item.get(filename_key, "Unknown file")
        result = parse_item(item)
        if result:
            files[filename].append(result)

    return sorted(files.items())


def get_ruff_entries(data):
    return group_findings(
        data,
        "filename",
        lambda issue: finding(
            f"{issue.get('location', {}).get('row', '?')}:"
            f"{issue.get('location', {}).get('column', '?')}",
            issue.get("code", "unknown"),
            issue.get("message", "Unknown issue"),
        ),
    )


def get_eslint_entries(data):
    files = []

    for result in data:
        filename = result.get("filePath", "Unknown file")
        findings = []

        for issue in result.get("messages", []):
            findings.append(finding(
                f"{issue.get('line', '?')}:{issue.get('column', '?')}",
                issue.get("ruleId") or "fatal",
                issue.get("message", "Unknown issue"),
            ))

        if findings:
            files.append((filename, findings))

    return sorted(files)


def get_stylelint_entries(data):
    files = []

    for result in data:
        filename = result.get("source", "Unknown file")
        findings = []

        for issue in result.get("warnings", []):
            findings.append(finding(
                f"{issue.get('line', '?')}:{issue.get('column', '?')}",
                issue.get("rule", "unknown"),
                issue.get("text", "Unknown issue"),
            ))

        if findings:
            files.append((filename, findings))

    return sorted(files)


def get_shellcheck_entries(data):
    return group_findings(
        data,
        "file",
        lambda issue: finding(
            f"{issue.get('line', '?')}:{issue.get('column', '?')}",
            f"{issue.get('code', 'unknown')} "
            f"({issue.get('level', 'unknown')})",
            issue.get("message", "Unknown issue"),
        ),
    )


def get_hadolint_entries(data):
    return group_findings(
        data,
        "file",
        lambda issue: finding(
            f"{issue.get('line', '?')}:{issue.get('column', '?')}",
            f"{issue.get('code', 'unknown')} "
            f"({issue.get('level', 'unknown')})",
            issue.get("message", "Unknown issue"),
        ),
    )


def get_bandit_entries(data):
    files = defaultdict(list)

    for issue in data.get("results", []):
        filename = issue.get("filename", "Unknown file")
        files[filename].append(finding(
            issue.get("line_number", "?"),
            f"{issue.get('test_id', 'unknown')} "
            f"(severity={issue.get('issue_severity', 'unknown')}, "
            f"confidence={issue.get('issue_confidence', 'unknown')})",
            issue.get("issue_text", "Unknown issue"),
        ))

    return sorted(files.items())


def get_pip_audit_entries(data):
    files = defaultdict(list)

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
                f"Fix available: {', '.join(fixes)}"
                if fixes
                else "No fix version listed"
            )

            files["Python dependencies"].append(finding(
                "—",
                vuln_id,
                f"{name}=={version}: {fix_text}",
            ))

    return sorted(files.items())


def escape_table_cell(value):
    """Escape characters that could break a Markdown table."""
    return (
        str(value)
        .replace("\\", "\\\\")
        .replace("|", "\\|")
        .replace("\n", " ")
        .replace("\r", " ")
    )


def load_report(source, get_entries):
    data = json.loads(
        (report_dir / source).read_text(encoding="utf-8")
    )
    return [
        (filename, findings)
        for filename, findings in get_entries(data)
        if findings
    ]


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

        for filename, findings in entries:
            lines += [
                "::: {grid-item}",
                f"````{{admonition}} {escape_table_cell(filename)}",
                ":class: caution",
                "",
                "| Line | Type | Message |",
                "|---:|---|---|",
            ]

            for issue in findings:
                lines.append(
                    f"| {escape_table_cell(issue['line'])} "
                    f"| {escape_table_cell(issue['type'])} "
                    f"| {escape_table_cell(issue['message'])} |"
                )

            lines += [
                "",
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