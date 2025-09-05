# Contributing

## Semantic Release

This project uses [semantic-release](https://semantic-release.gitbook.io/) for automated version management and package publishing.

### Commit Message Format

This project follows the [Conventional Commits](https://conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Types:
- **feat**: A new feature (bumps minor version)
- **fix**: A bug fix (bumps patch version)
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files

#### Breaking Changes:
- Add `!` after the type/scope: `feat!: remove deprecated API`
- Or add `BREAKING CHANGE:` in the footer

### Examples:
```bash
git commit -m "feat: add screenshot upload to Linear issues"
git commit -m "fix: resolve modal closing issue"
git commit -m "feat!: change module configuration structure"
git commit -m "docs: update README with new configuration options"
```

### Release Process

1. **Automatic Releases**: Push commits to `main` branch with conventional commit messages
2. **Manual Releases**: Use the "Manual Release" workflow in GitHub Actions

### Version Bumping:
- **Patch** (1.0.1): `fix:`, `docs:`, `style:`, `refactor:`, `perf:` commits
- **Minor** (1.1.0): `feat:` commits  
- **Major** (2.0.0): `BREAKING CHANGE:` or `!` in commit messages
- **No Release**: commits with scope `no-release`

### Special Scopes:
- `scope: no-release` - Skip release (useful for internal changes)
- `docs(README)` - Will trigger a patch release

### Enhanced Release Notes:
The generated changelog will include emoji-categorized sections:
- 🚀 **Features** - New functionality 
- 🐛 **Bug Fixes** - Bug fixes
- ⚡ **Performance Improvements** - Performance optimizations
- 📚 **Documentation** - Documentation changes
- 🎨 **Styles** - Code style changes
- ♻️ **Code Refactoring** - Code restructuring
- ✅ **Tests** - Test additions/modifications
- 🏗️ **Build System** - Build configuration changes
- 👷 **CI/CD** - Continuous integration changes
- ⏪ **Reverts** - Commit reverts

### Branching Strategy:
- **main** - Production releases
- **beta** - Beta pre-releases (e.g., `1.1.0-beta.1`)
- **alpha** - Alpha pre-releases (e.g., `1.1.0-alpha.1`)

### The semantic-release process will:
- Analyze commits since the last release
- Determine the next version number
- Generate categorized release notes with emojis
- Update CHANGELOG.md with detailed sections
- Build the module (`npm run prepack`)
- Create a Git tag with format `v1.0.0`
- Publish to NPM
- Create a GitHub release with auto-generated notes
- Add labels to related issues/PRs
- Comment on resolved issues