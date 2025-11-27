# Changelog

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/) and uses [Conventional Commits](https://conventionalcommits.org/).

## [1.4.0](https://github.com/lenneTech/bug.lt/compare/v1.3.0...v1.4.0) (2025-11-27)

### 🚀 Features

* Replace Puppeteer with modern-screenshot for client-side captures ([13d553a](https://github.com/lenneTech/bug.lt/commit/13d553a530b8ea9f75782231ad0d55ab014ff242))

## [1.3.0](https://github.com/lenneTech/bug.lt/compare/v1.2.0...v1.3.0) (2025-11-24)

### 🚀 Features

* erweitere Benutzerreise-Tracking und Fehlerberichterstattung mit neuen Optionen ([3419486](https://github.com/lenneTech/bug.lt/commit/341948648ec80ff30cc34277b32bbced5ae002f4))
* Implement user journey tracking and bug reporting enhancements ([76c6dbf](https://github.com/lenneTech/bug.lt/commit/76c6dbf29bd50c5bd375540de96952b7aeedd01d))

## [1.2.0](https://github.com/lenneTech/bug.lt/compare/v1.1.6...v1.2.0) (2025-10-13)

### 🚀 Features

* add HTTP Basic Authentication support for screenshot functionality ([96c5bae](https://github.com/lenneTech/bug.lt/commit/96c5bae9b6d4e27836fcb6291b2b2f91aad79569))

## [1.1.6](https://github.com/lenneTech/bug.lt/compare/v1.1.5...v1.1.6) (2025-10-08)

### ♻️ Code Refactoring

* update dependencies for Nuxt and related packages ([abf8c41](https://github.com/lenneTech/bug.lt/commit/abf8c4165daa5b6b834e63fae2eb0dd79bf68e09))
* update dependencies for Nuxt and related packages ([6a71873](https://github.com/lenneTech/bug.lt/commit/6a718734549ad1d1edb7be36cbfdf89219caa308))

## [1.1.5](https://github.com/lenneTech/bug.lt/compare/v1.1.4...v1.1.5) (2025-09-05)

### ♻️ Code Refactoring

* enhance bug report submission with toast notifications for success and error feedback ([9c31eba](https://github.com/lenneTech/bug.lt/commit/9c31eba26bf966ba7dfd799bc3987d4270dead42))

## [1.1.4](https://github.com/lenneTech/bug.lt/compare/v1.1.3...v1.1.4) (2025-09-05)

### ♻️ Code Refactoring

* simplify useRuntimeConfig mock implementation in tests ([3badb1d](https://github.com/lenneTech/bug.lt/commit/3badb1d53ee635a3fe7b8d8cf111f3b292122705))
* update useRuntimeConfig usage in bug report handler and tests ([51e4352](https://github.com/lenneTech/bug.lt/commit/51e4352fab4302be4f7013898e89468b5895908a))
* utilize useRuntimeConfig in bug report event handler ([3d875c0](https://github.com/lenneTech/bug.lt/commit/3d875c079c1258245e22c94f9910f5b9f2c7f977))

## [1.1.3](https://github.com/lenneTech/bug.lt/compare/v1.1.2...v1.1.3) (2025-09-05)

### ♻️ Code Refactoring

* integrate useRuntimeConfig in BugReportButton and BugReportForm components ([47c1a03](https://github.com/lenneTech/bug.lt/commit/47c1a037452373d61001e0e5a69e691599287c7d))

## [1.1.2](https://github.com/lenneTech/bug.lt/compare/v1.1.1...v1.1.2) (2025-09-05)

### ♻️ Code Refactoring

* streamline runtime configuration and plugin registration in module ([13880c4](https://github.com/lenneTech/bug.lt/commit/13880c455dcd810560f07f6a8072315de685f408))

## [1.1.1](https://github.com/lenneTech/bug.lt/compare/v1.1.0...v1.1.1) (2025-09-05)

### ♻️ Code Refactoring

* rename plugin.client.ts to bug-lt.ts and update plugin registration ([5d400b2](https://github.com/lenneTech/bug.lt/commit/5d400b23b4e99756444d61621b38de5fda1e0497))

## [1.1.0](https://github.com/lenneTech/bug.lt/compare/v1.0.2...v1.1.0) (2025-09-05)

### 🚀 Features

* add support for optional @nuxt/ui module and remove customCSS option ([7ae78df](https://github.com/lenneTech/bug.lt/commit/7ae78df32f375a51b3edd1ab5ba8854f09262d75))

### ✅ Tests

* update module tests to use async setup and add installModule mock ([167963d](https://github.com/lenneTech/bug.lt/commit/167963d0e09eb1d1f9f6bb006237c15a0e0a20ab))

## [1.0.2](https://github.com/lenneTech/bug.lt/compare/v1.0.1...v1.0.2) (2025-09-05)

### ♻️ Code Refactoring

* reorder build step in release workflow for clarity ([b0c6d7a](https://github.com/lenneTech/bug.lt/commit/b0c6d7a9c7e62bca80325666f95341501b7b5351))
* simplify release workflow by removing manual version input and unnecessary steps ([0f58eb3](https://github.com/lenneTech/bug.lt/commit/0f58eb39cd257d6ec4ce4dfcb8a01ea685afa76b))

## [1.0.1](https://github.com/lenneTech/bug.lt/compare/v1.0.0...v1.0.1) (2025-09-05)

### 🐛 Bug Fixes

* remove unnecessary dist directory from release assets ([c715a39](https://github.com/lenneTech/bug.lt/commit/c715a3924ff67d820a216507b021b252f0171f36))

## 1.0.0 (2025-09-05)

### 🐛 Bug Fixes

* update homepage and repository URLs in package.json ([93a4ca0](https://github.com/lenneTech/bug.lt/commit/93a4ca07cfff7f7f4fc4e86c84053097c35e5c33))
* update repository URL in .releaserc.json ([f2a686a](https://github.com/lenneTech/bug.lt/commit/f2a686accc49d77699eacbc4429c7db201d70c97))

### ♻️ Code Refactoring

* make bug report interface properties optional and remove nuxt-icon dependency ([07baf91](https://github.com/lenneTech/bug.lt/commit/07baf91fbcfc0b07310d78f3667c2bfa9230f528))

## [1.0.0] - Initial Release

### Features

- ✨ Complete Nuxt 4 module for bug reporting with Linear integration
- 📸 Screenshot capture using server-side Puppeteer
- 🌐 Browser information collection (user agent, viewport, performance metrics)
- 📝 Console log capturing and history
- 🎯 Configurable bug report button with customizable position
- 🔗 Automatic Linear issue creation with team/project resolution
- 🏷️ Dynamic label creation based on bug report type
- 🇩🇪 German language interface for German customers
- 📎 Screenshot attachment upload to Linear issues
- 🎨 Nuxt UI integration for all UI components
- ⚙️ Comprehensive configuration options
- ✅ Complete test suite with 51 passing tests
- 📚 Detailed documentation and setup instructions
- 🚀 GitHub Actions for automated publishing
