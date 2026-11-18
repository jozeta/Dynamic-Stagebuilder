# Security Policy

## Reporting a vulnerability

Please **do not open a public issue** for security problems.

If this project is hosted on GitHub, report it privately through the repository's **Security** tab
→ **Report a vulnerability**. Include what you found, how to reproduce it, and the impact you expect.

This is a personal project maintained in spare time. You can expect an acknowledgement within a
week, and fixes as soon as practical.

## Supported versions

Only the latest version on the `main` branch receives security fixes.

## Threat model

### Assets

What visitors enter and what the app stores in their browser.

### Untrusted input

Form fields, URL parameters and anything fetched from the network.

### Trust boundaries

Browser ↔ the page's own code: only same-origin scripts run (strict CSP, Trusted Types).

### Top risks

Cross-site scripting through rendered data: text goes in with textContent, never innerHTML.
