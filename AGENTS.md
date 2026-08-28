# AGENTS.md

## Project Overview

This repository contains a production-oriented **Real User Monitoring (RUM)** and **client-side observability** application.

The frontend is an Angular SPA that provides a GitHub Explorer interface and collects browser-side telemetry using OpenTelemetry and Web Vitals. Telemetry is exported through an OpenTelemetry Collector and exposed to Prometheus for visualization in Grafana.

The primary goals are:

- Build a modern Angular SPA using standalone components and Signals.
- Provide a GitHub Explorer experience using the public GitHub REST API.
- Collect Core Web Vitals and client-side performance metrics.
- Measure HTTP request latency and failures.
- Track application/runtime errors.
- Track user theme changes.
- Support `pt-BR` and `en-US` localization.
- Export telemetry using OTLP/HTTP.
- Provide Prometheus and Grafana observability dashboards.
- Keep the frontend production-ready and containerizable with Docker/Nginx.

---

## Architecture

```text
[ Browser / Angular SPA ]
        │
        ├── OTLP/HTTP :4318/v1/metrics
        │                 │
        │                 ▼
        │        [ OpenTelemetry Collector ]
        │                 │
        │                 ▼
        │        [ Prometheus Exporter :8889 ]
        │                 │
        │                 ▼
        │            [ Prometheus ]
        │                 │
        │                 ▼
        │             [ Grafana ]
        │
        └── HTTPS API requests
                    │
                    ▼
             [ api.github.com ]
```

---

## Technology Stack

### Frontend

- Angular 21
- Angular Standalone Components
- Angular Signals
- Angular functional HTTP interceptors
- Angular Router
- TypeScript 5.9+
- RxJS 7.8+
- Tailwind CSS **3.4.x**
- PostCSS 8.x
- Autoprefixer 10.x
- `@ngx-translate/core`
- `@ngx-translate/http-loader`

### Observability

- OpenTelemetry Web SDK
- `@opentelemetry/sdk-metrics`
- `@opentelemetry/exporter-metrics-otlp-http`
- `web-vitals`

### Backend / Infrastructure

- OpenTelemetry Collector Contrib
- Prometheus
- Grafana
- Nginx Alpine
- Docker
- Docker Compose

### External API

- GitHub REST API v3
- Public unauthenticated endpoints

---

## Important Dependency Decision: Tailwind CSS

This project uses **Tailwind CSS 3.4.x**.

Do **not** migrate the project to Tailwind CSS 4 unless the migration is explicitly requested.

The project intentionally uses the Tailwind CSS 3 configuration model:

```text
tailwind.config.js
postcss.config.js
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Required PostCSS configuration

`postcss.config.js` must use:

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

Do not replace `tailwindcss` with `@tailwindcss/postcss` while the project remains on Tailwind 3.

### Required global stylesheet

The main stylesheet should contain:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Do not replace these directives with:

```css
@import "tailwindcss";
```

That syntax belongs to the Tailwind CSS 4 setup.

### Tailwind configuration

`tailwind.config.js` should include the Angular source files:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [],
};
```

The `darkMode: "class"` strategy is required by the application theme architecture.

---

## Frontend Structure

The frontend follows this structure:

```text
frontend/
├── Dockerfile
├── nginx.conf
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
└── src/
    ├── assets/
    │   └── i18n/
    │       ├── pt-BR.json
    │       └── en-US.json
    ├── app/
    │   ├── core/
    │   │   ├── otel-rum.service.ts
    │   │   ├── global-error-handler.ts
    │   │   ├── theme.service.ts
    │   │   └── http-telemetry.interceptor.ts
    │   ├── features/
    │   │   └── github-explorer/
    │   │       ├── github.service.ts
    │   │       └── github-explorer.component.ts
    │   ├── app.config.ts
    │   ├── app.routes.ts
    │   └── app.component.ts
    └── styles.css
```

Keep reusable infrastructure concerns under `core/`.

Keep feature-specific functionality under `features/`.

Avoid placing business logic in `app.component.ts` unless it is genuinely application-wide.

---

## Angular Development Rules

Use modern Angular APIs.

### Prefer

- Standalone components
- `inject()`
- Signals
- `computed()`
- `effect()`
- Functional interceptors
- Modern Angular control flow
- Typed HTTP requests
- Dependency injection
- Reactive patterns

### Avoid

- NgModule-based architecture for new code
- Constructor injection when `inject()` provides a cleaner implementation
- Unnecessary RxJS subjects when Signals are sufficient
- Manual DOM manipulation unless necessary
- Global mutable state
- Large monolithic components

### Control flow

Prefer Angular's modern syntax:

```html
@if (user()) { ... } @for (repo of repositories(); track repo.id) { ... }
```

Avoid introducing legacy structural directives for new code unless there is a specific compatibility reason.

---

## GitHub Explorer

The GitHub feature is responsible for:

- Searching public GitHub users.
- Displaying user information.
- Displaying recent public repositories.
- Showing repository stars.
- Handling loading states.
- Handling user-not-found responses.
- Handling GitHub API rate limits.
- Measuring API request latency.

Expected API endpoints:

```text
GET https://api.github.com/users/{username}
GET https://api.github.com/users/{username}/repos?sort=updated&per_page=10
```

Do not expose GitHub credentials or tokens in the frontend.

The application must work with the unauthenticated public API.

---

## HTTP Telemetry

The HTTP telemetry interceptor should measure requests made by the application.

At minimum capture:

- HTTP method
- Host
- Request duration
- HTTP status where available
- Request failure information

Telemetry should avoid collecting sensitive information.

Do not record:

- Authorization headers
- Cookies
- Access tokens
- Passwords
- Personal secrets
- Full sensitive query strings

For GitHub API requests, the host should normally be:

```text
api.github.com
```

---

## RUM Metrics

The application should collect the following metrics.

| Metric                            | Type      | Description               |
| --------------------------------- | --------- | ------------------------- |
| `rum_web_vitals_lcp_ms`           | Gauge     | Largest Contentful Paint  |
| `rum_web_vitals_inp_ms`           | Gauge     | Interaction to Next Paint |
| `rum_web_vitals_cls_score`        | Gauge     | Cumulative Layout Shift   |
| `rum_web_vitals_ttfb_ms`          | Gauge     | Time to First Byte        |
| `rum_http_request_duration_ms`    | Histogram | HTTP request latency      |
| `rum_angular_client_errors_total` | Counter   | Runtime/client errors     |
| `rum_theme_switch_total`          | Counter   | Theme changes             |

Recommended targets:

```text
LCP  <= 2500 ms
INP  <= 200 ms
CLS  <= 0.1
TTFB <= 800 ms
HTTP p95 <= 1200 ms
Runtime errors = 0
```

---

## OpenTelemetry

The OpenTelemetry implementation should be centralized in:

```text
src/app/core/otel-rum.service.ts
```

The service is responsible for:

- Initializing the metrics SDK.
- Configuring the OTLP HTTP exporter.
- Configuring metric readers/export intervals.
- Defining application/resource attributes.
- Recording custom metrics.
- Integrating Web Vitals.

The frontend sends metrics to:

```text
http://localhost:4318/v1/metrics
```

during local development.

Do not hard-code production-specific endpoints throughout the application. Prefer environment/configuration-based values.

---

## Resource Attributes

The OpenTelemetry resource should contain useful non-sensitive application context.

Examples:

```text
service.name
service.version
deployment.environment
rum.locale
```

The active application locale must be represented in telemetry so metrics can be segmented by:

```text
pt-BR
en-US
```

Never include PII in OpenTelemetry resource attributes.

---

## Web Vitals

Use the `web-vitals` package to capture:

- LCP
- INP
- CLS
- TTFB

Record the values using OpenTelemetry metrics.

Do not manually reimplement the Web Vitals measurement algorithms.

---

## Runtime Error Handling

Global Angular/runtime errors should be captured by:

```text
src/app/core/global-error-handler.ts
```

Errors should increment:

```text
rum_angular_client_errors_total
```

Use an appropriate error classification such as:

```text
error_type: "runtime"
error_type: "api"
error_type: "rate_limit"
```

Do not include sensitive error payloads or personal information.

---

## Theme System

The application supports:

```text
light
dark
```

Theme state should be implemented using Angular Signals.

The source of truth should be the theme signal.

Persist the user's choice using:

```text
localStorage
```

Recommended key:

```text
app_theme
```

If there is no stored preference, use:

```text
prefers-color-scheme
```

The dark theme must use Tailwind's `class` strategy.

The root HTML element should receive:

```html
<html class="dark"></html>
```

for dark mode.

Do not implement dark mode by duplicating component-specific theme state.

---

## Theme Telemetry

Every explicit theme toggle should record:

```text
rum_theme_switch_total
```

with:

```text
theme: "dark"
```

or:

```text
theme: "light"
```

Do not record unnecessary user-identifying information.

---

## Internationalization

Supported locales:

```text
pt-BR
en-US
```

Default locale:

```text
pt-BR
```

Translation files live under:

```text
src/assets/i18n/
```

Files:

```text
pt-BR.json
en-US.json
```

Use `@ngx-translate/core` for runtime translation.

Do not hard-code user-visible application strings inside components when the string belongs to the translatable UI.

Translation keys should be structured and descriptive.

Example:

```text
APP.TITLE
APP.SUBTITLE
APP.THEME_TOGGLE
GITHUB.SEARCH_BUTTON
GITHUB.USER_NOT_FOUND
```

---

## CORS

The OpenTelemetry Collector must allow telemetry requests from the frontend origin.

Local development:

```text
http://localhost:8080
```

OTLP HTTP endpoint:

```text
http://localhost:4318/v1/metrics
```

CORS configuration must not disable security unnecessarily in production.

---

## Prometheus

Prometheus consumes metrics exposed by the OpenTelemetry Collector.

The Collector Prometheus exporter should expose:

```text
:8889
```

Prometheus should scrape the Collector exporter endpoint.

Metric names and labels should remain stable because Grafana dashboards depend on them.

Avoid high-cardinality labels.

Do not use labels containing:

- Usernames
- Full URLs
- Request IDs
- Random IDs
- Stack traces
- Arbitrary error messages

unless there is a documented operational reason.

---

## Grafana

Grafana is used to visualize:

- Core Web Vitals
- HTTP latency
- HTTP p95 latency
- Runtime errors
- API failures
- Theme usage
- Locale segmentation

Dashboards should prioritize actionable production indicators.

Recommended panels include:

```text
LCP
INP
CLS
TTFB
HTTP request p50
HTTP request p95
HTTP request p99
Client errors
API errors
Rate-limit errors
Theme distribution
Locale distribution
```

---

## Docker

The frontend should use a multi-stage Docker build.

Expected architecture:

```text
Node
  │
  ├── npm ci
  ├── npm run build
  │
  ▼
Nginx Alpine
  │
  └── Serve Angular static files
```

The production container must not run the Angular development server.

Use:

```text
nginx:alpine
```

for the runtime image unless there is a documented reason to use another image.

---

## Local Development

Prerequisites:

- Node.js 20+
- npm
- Docker
- Docker Compose

Install dependencies:

```bash
npm ci
```

Start the Angular development server:

```bash
npm start
```

Build the application:

```bash
npm run build
```

Run tests:

```bash
npm test
```

---

## Full Stack

Start the complete observability stack with:

```bash
docker compose up --build -d
```

Expected services:

```text
Angular:
http://localhost:8080

OTel Collector:
http://localhost:4318

Prometheus:
http://localhost:9090

Grafana:
http://localhost:3000
```

Default Grafana credentials for local development:

```text
username: admin
password: admin
```

Do not use these credentials in production.

---

## Package Management

The repository uses npm.

The package manager is specified in `package.json`.

Prefer:

```bash
npm ci
```

for reproducible installations from the lockfile.

Use:

```bash
npm install
```

when intentionally changing dependencies.

Always commit `package-lock.json` when dependencies change.

Do not manually edit dependency versions in `package-lock.json`.

---

## Dependency Compatibility

The current frontend stack intentionally uses:

```text
Angular 21.x
Tailwind CSS 3.4.x
PostCSS 8.x
Autoprefixer 10.x
TypeScript 5.9.x
RxJS 7.8.x
```

When changing major versions, verify compatibility between:

- Angular CLI
- Angular Build
- TypeScript
- Tailwind
- PostCSS
- Node.js

Do not upgrade multiple major frontend infrastructure dependencies without testing the complete build.

---

## Code Quality

New code should be:

- Typed
- Small and focused
- Testable
- Observable where appropriate
- Free of unnecessary duplication
- Free of secrets
- Accessible
- Responsive
- Compatible with both light and dark themes
- Localizable

Prefer clear code over clever abstractions.

Do not introduce a library when the requirement can be satisfied cleanly with Angular or existing dependencies.

---

## Accessibility

UI components should follow basic accessibility requirements:

- Semantic HTML
- Keyboard navigation
- Visible focus states
- Accessible button labels
- Appropriate form labels
- Sufficient color contrast
- Meaningful alternative text for images
- Do not rely exclusively on color to convey state

Theme and localization controls must be accessible.

---

## Security

Never commit:

- API tokens
- GitHub credentials
- Passwords
- Private keys
- OAuth secrets
- Production credentials
- Personal access tokens

The GitHub Explorer uses the public API and does not require credentials.

Do not send sensitive data through OpenTelemetry.

Do not log request headers containing credentials.

---

## PII Protection

Telemetry is intended for application observability, not user profiling.

Do not collect or export:

- Passwords
- Authentication tokens
- Email addresses
- Personal identification numbers
- Private GitHub information
- Cookies
- Authorization headers
- Full request payloads containing personal data

Telemetry attributes must be intentionally selected and documented.

---

## Error Handling

Expected GitHub API scenarios include:

```text
200 OK
403 Forbidden / rate limit
404 Not Found
429 Too Many Requests
5xx Server Errors
Network failures
```

The UI should distinguish between:

- User not found
- Rate limit exceeded
- Temporary API/server failure
- Network failure
- Unexpected application failure

Avoid exposing raw backend errors directly to users.

---

## Testing

Tests should cover critical application behavior.

At minimum, test:

- GitHub service requests
- HTTP telemetry interceptor
- Theme service
- Theme persistence
- Theme telemetry
- Runtime error handling
- Localization switching
- GitHub error states
- Rate-limit handling

Tests must not depend on live GitHub API availability.

Mock external API calls.

---

## Git Workflow

Before committing changes:

```bash
npm test
npm run build
```

If Docker-related files were changed, also verify:

```bash
docker compose config
```

and, when appropriate:

```bash
docker compose up --build
```

Keep commits focused.

Avoid mixing:

- Dependency upgrades
- Feature implementation
- Large formatting changes
- Unrelated refactoring

in a single commit unless necessary.

---

## Agent Rules

When modifying this repository:

1. Read the relevant source files before changing them.
2. Preserve the existing architecture unless there is a strong reason to change it.
3. Respect the Tailwind CSS **3.4.x** requirement.
4. Do not introduce Tailwind CSS 4 configuration.
5. Do not replace `postcss.config.js` with `.postcssrc.json` unless explicitly requested.
6. Do not remove `tailwind.config.js` without a migration plan.
7. Prefer Angular Signals for local reactive state.
8. Keep telemetry logic centralized under `core/`.
9. Avoid PII in logs and telemetry.
10. Do not expose secrets in frontend code.
11. Preserve `pt-BR` and `en-US` support.
12. Maintain dark/light theme support.
13. Validate changes with tests and a production build.
14. Do not silently change dependency major versions.
15. When a dependency upgrade is required, document the compatibility implications.

---

## Definition of Done

A feature is considered complete when:

- The application builds successfully.
- Tests pass.
- The feature works in light and dark themes.
- User-visible text is localized when applicable.
- Relevant telemetry is recorded.
- No sensitive data is sent to telemetry.
- GitHub API failures are handled gracefully.
- No secrets are introduced.
- Docker production build remains functional when applicable.
- Prometheus/Grafana integration remains compatible when metrics are changed.
- Existing functionality is not unnecessarily broken.

---

## Current Reference Configuration

The intended frontend configuration is:

```text
Angular:              21.x
Node.js:              20+
Tailwind CSS:         3.4.x
PostCSS:              8.x
Autoprefixer:         10.x
TypeScript:           5.9.x
RxJS:                 7.8.x
ngx-translate:        18.x
OpenTelemetry SDK:    2.x
Web Vitals:           6.x
```

The exact installed versions are defined by:

```text
frontend/package.json
frontend/package-lock.json
```

The lockfile is the source of truth for reproducible installations.
