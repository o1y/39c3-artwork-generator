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

This project uses ESLint and Prettier for code quality and formatting and JSDoc type checking via TypeScript.

Before committing, ensure your code passes:

```bash
npm run lint # Check for lint errors
npm run typecheck # Check JSDoc types
npm run format:check # Check formatting
```

To auto-fix issues:

```bash
npm run lint:fix # Fix lint errors
npm run format # Format code
```

### Type Annotations

This project uses JSDoc comments for type safety without converting to TypeScript. When adding or modifying code, include type annotations:

```javascript
/**
 * @param {number} weight - Font weight (10-100)
 * @returns {string} CSS color value
 */
function getColorForWeight(weight) {
  // ...
}
```

Shared types are defined in `src/types.js`. Import them with:

```javascript
/** @typedef {import('./types.js').Settings} Settings */
```

## Testing

This project uses **Vitest** for unit and snapshot testing.

```bash
npm test # Run all tests
npm run test:watch # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Snapshot Tests

When you modify rendering code, snapshot tests may need updating:

```bash
npm test -- --update # Update snapshots after intentional changes
```

Review snapshot diffs carefully before committing.

## Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Ensure all checks pass:
   ```bash
   npm test             # All tests must pass
   npm run lint         # No lint errors
   npm run typecheck    # No type errors
   npm run format:check # Code is formatted
   ```
5. Commit your changes
6. Push to your fork and open a pull request

## Dependencies

This project uses a [custom fork of opentype.js](https://github.com/o1y/opentype.js) for font rendering. The fork is installed automatically via npm.

## Reporting Issues

- Bugs: Use the [bug report template](https://github.com/o1y/39c3-logo-animator/issues/new?template=bug_report.yml)
- Features: Use the [feature request template](https://github.com/o1y/39c3-logo-animator/issues/new?template=feature_request.yml)
