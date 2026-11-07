# Release Workflow

Releases laufen automatisch über [semantic-release](https://semantic-release.gitbook.io/) in
`.github/workflows/release.yml`, bei jedem Push auf `main`.

## Ablauf

1. Commits nach [Conventional Commits](https://conventionalcommits.org/) schreiben. Die Commit-Typen
   bestimmen die Version (`.releaserc.json`):
   - `feat` → Minor
   - `fix`, `perf`, `refactor`, `style`, `revert`, `docs(README)` → Patch
   - `BREAKING CHANGE` im Footer → Major
   - Scope `no-release` (z. B. `fix(no-release): …`) → kein Release
   - alle anderen Typen (`docs`, `chore`, `ci`, `test`, …) → kein Release
2. Auf `main` pushen bzw. den PR mergen.
3. Die Action installiert, baut, lintet und testet. Danach erhöht semantic-release die Version,
   aktualisiert `CHANGELOG.md`, published auf npm, committet `chore(release): 🔖 <version> [skip ci]`,
   setzt den Tag `v<version>` und legt den GitHub-Release an.

Ein Commit mit `[skip ci]` in der Nachricht startet den Workflow nicht.

## Voraussetzungen

Es wird **kein** npm-Token gebraucht. Das Publishing läuft über
[npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers) (OIDC): npm tauscht das
OIDC-Token des Workflow-Laufs gegen ein Publish-Token, das nach Minuten abläuft, und signiert eine
Provenance-Attestation.

- Auf npmjs.com ist für `@lenne.tech/bug.lt` der Trusted Publisher
  `lenneTech / bug.lt / release.yml` (ohne Environment) eingetragen. Wer die Workflow-Datei
  umbenennt, muss diesen Eintrag mit ändern, sonst schlägt das Publishing fehl.
- Der Job braucht `id-token: write`. Für Release-Commit, Tag, GitHub-Release und Kommentare nutzt
  semantic-release das `GITHUB_TOKEN` des Laufs (`contents`, `issues`, `pull-requests: write`).

## Troubleshooting

### Release schlägt fehl

1. **OIDC-Austausch fehlgeschlagen** (`OIDC token exchange with the npm registry failed` bzw.
   `ENONPMTOKEN`): Trusted Publisher auf npmjs.com prüfen (`npm trust list @lenne.tech/bug.lt`) und
   ob der Job `id-token: write` hat. Danach `gh run rerun --failed`.
2. **Kein Release, obwohl erwartet:** Commit-Typen prüfen, siehe oben. Lokal:
   `npm run release:dry`.
3. **Build-/Testfehler:** lokal `npm run prepack`, `npm run lint` und `npm test` prüfen, Fehler
   beheben und erneut pushen.

### Package nicht gefunden

Nach dem ersten Release:
- Package ist unter `@lenne.tech/bug.lt` verfügbar
- Installation: `npm install @lenne.tech/bug.lt`
