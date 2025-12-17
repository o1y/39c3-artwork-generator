# Contributing

Thanks for your interest in contributing to the 39C3 Artwork Generator!

## Getting Started

### Prerequisites

- Node.js 24 or later

### Setup

```bash
git clone https://github.com/o1y/39c3-logo-animator.git
cd 39c3-logo-animator
npm install
npm run dev
```

The development server runs at `http://localhost:5173`.

## Code Style

This project uses **ESLint** and **Prettier** for code quality and formatting.

Before committing, ensure your code passes:

```bash
npm run lint # Check for lint errors
npm run format:check # Check formatting
```

To auto-fix issues:

```bash
npm run lint:fix # Fix lint errors
npm run format # Format code
```

## Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Ensure `npm run lint` and `npm run format:check` pass
5. Commit your changes
6. Push to your fork and open a pull request

## Dependencies

This project uses a [custom fork of opentype.js](https://github.com/o1y/opentype.js) for font rendering. The fork is installed automatically via npm.

## Reporting Issues

- Bugs: Use the [bug report template](https://github.com/o1y/39c3-logo-animator/issues/new?template=bug_report.yml)
- Features: Use the [feature request template](https://github.com/o1y/39c3-logo-animator/issues/new?template=feature_request.yml)
