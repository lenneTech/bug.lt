# Release Workflow

Dieses Projekt nutzt automatisierte GitHub Actions für CI/CD.

## Release Process

### Automatisches Release

1. **Tag erstellen und pushen:**
   ```bash
   # Version in package.json aktualisieren
   npm version patch  # oder minor/major
   
   # Tag pushen (löst automatisch Release aus)
   git push origin --tags
   ```

2. **Was passiert automatisch:**
   - ✅ Dependencies installieren
   - ✅ Dev environment vorbereiten
   - ✅ Build ausführen
   - ✅ Tests laufen lassen
   - ✅ NPM Package publishen
   - ✅ GitHub Release erstellen

### Manuelles Release

Falls nötig, kann ein Release auch manuell ausgelöst werden:

1. Gehe zu GitHub Actions
2. Wähle "Release" Workflow
3. Klicke "Run workflow"
4. Wähle den gewünschten Tag

## Voraussetzungen

### Repository Secrets

Folgende Secrets müssen im GitHub Repository konfiguriert sein:

- `NPM_TOKEN`: NPM Auth Token für Package Publishing
  - Erstellen: https://www.npmjs.com/settings/tokens
  - Typ: "Automation" Token
  - Berechtigung: "Publish" für @lenne.tech Scope

### NPM Token Setup

1. NPM Account auf npmjs.com erstellen/anmelden
2. Zu "Access Tokens" gehen
3. "Generate New Token" klicken
4. Typ "Automation" wählen
5. Token kopieren
6. In GitHub Repository Settings -> Secrets -> Actions -> "NPM_TOKEN" hinzufügen

## CI Workflow

Bei jedem Push/PR auf `main` Branch:

- ✅ Lint Check
- ✅ Type Check  
- ✅ Tests
- ✅ Build Verification
- ✅ Playground Build

## Troubleshooting

### Release schlägt fehl

1. **NPM Token abgelaufen:**
   - Neuen Token erstellen
   - GitHub Secret aktualisieren

2. **Version bereits existiert:**
   - `npm version` verwenden um Version zu erhöhen
   - Neuen Tag erstellen

3. **Build/Test Fehler:**
   - Lokal `npm run build` und `npm test` prüfen
   - Fehler beheben und erneut taggen

### Package nicht gefunden

Nach dem ersten Release:
- Package ist unter `@lenne.tech/bug.lt` verfügbar
- Installation: `npm install @lenne.tech/bug.lt`