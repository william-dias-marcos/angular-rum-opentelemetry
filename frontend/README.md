# Frontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.22.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Deploy to Netlify

The GitHub Actions workflow in `.github/workflows/deploy-netlify.yml` deploys the
production build to Netlify only after the unit tests pass. It runs exclusively
for pushes to the `main` branch.

Before the first deployment, configure these repository secrets in GitHub:

- `NETLIFY_AUTH_TOKEN`: a Netlify personal access token with permission to deploy the site.
- `NETLIFY_SITE_ID`: the identifier of the target Netlify site.

The workflow builds the application and deploys `dist/frontend/browser` as the
production site.

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
