# Security Policy

## Supported versions

This project is currently in early public release form. Security fixes are handled on the latest maintained state of the repository.

## Reporting a vulnerability

Please do **not** open a public GitHub issue for sensitive security problems.

Instead, report vulnerabilities privately to the project maintainer through a private contact channel already associated with this project or repository.

When reporting, include:

- a short summary of the issue
- affected files or components
- reproduction steps if available
- impact assessment
- any suggested mitigation

## Secret handling

Do not commit:

- gateway tokens
- API keys
- cookies
- private credentials
- local environment secrets

Local secret files such as `*.token`, `.env`, or machine-specific credentials must remain outside published history.

## Scope notes

This repository includes frontend runtime code, local demo flows, and OpenClaw Gateway integration examples. If you believe an issue could expose tokens, session data, or local gateway access, treat it as sensitive and report it privately first.
