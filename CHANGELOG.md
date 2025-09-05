# Changelog

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/) and uses [Conventional Commits](https://conventionalcommits.org/).

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
