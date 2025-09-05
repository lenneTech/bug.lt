<p align="center">
  <img src="src/runtime/assets/logo.png" alt="Bug LT Logo" height="300">
</p>

# @lenne.tech/bug.lt

Ein Nuxt 4 Modul für Bug-Reporting mit Linear Integration, Screenshots und automatischer Label-Verwaltung.

## Features

- 🐛 **Bug Report Button** - Konfigurierbarer Button in der Ecke des Bildschirms
- 📸 **Server-Side Screenshots** - Vollständige Screenshots mit allen Styles via Puppeteer
- 🏷️ **Automatische Label-Verwaltung** - Erstellt und verwaltet Labels basierend auf Bug-Type automatisch
- 🎯 **Linear Integration** - Direkte Erstellung von Issues in Linear mit Team/Project-Resolution
- 📱 **Browser-Informationen** - Automatische Erfassung von Browser-, OS- und Performance-Daten
- 📝 **Console Logs** - Erfassung und Anhang von Console-Ausgaben
- 🌓 **Theme Support** - Dark/Light Theme mit modernen OKLCH Farben
- 🔒 **Server-Side Sicherheit** - API-Keys werden nur server-seitig verwendet
- 🇩🇪 **Deutsche Lokalisierung** - Vollständig deutsche Benutzeroberfläche

## Installation

```bash
npm install @lenne.tech/bug.lt
```

## Setup

### 1. Nuxt Konfiguration

Füge das Modul zu deiner `nuxt.config.ts` hinzu:

```typescript
export default defineNuxtConfig({
  modules: ['@lenne.tech/bug.lt'],
  bug: {
    // Module Control
    enabled: true, // false deaktiviert das komplette Modul

    // Linear Integration
    linearApiKey: process.env.LINEAR_API_KEY,
    linearTeamName: 'Entwicklung', // Team-Name oder Key
    linearProjectName: 'Website', // Projekt-Name (optional)

    // UI Konfiguration
    autoShow: true,
    position: 'bottom-right', // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
    buttonColor: '#ef4444',

    // Features
    enableScreenshot: true,
    enableBrowserInfo: true,
    enableConsoleLogs: true,

    // Styling
    theme: 'auto', // 'light' | 'dark' | 'auto'
    maxConsoleLogs: 50
  }
})
```

### 2. Umgebungsvariablen

Erstelle eine `.env` Datei:

```bash
# Linear API Konfiguration (erforderlich)
# Hole dir deinen API Key aus Linear Settings -> API
LINEAR_API_KEY=lin_api_...

# Linear Team Name oder Key (erforderlich)
LINEAR_TEAM_NAME=Entwicklung

# Linear Projekt Name (optional)
LINEAR_PROJECT_NAME=Website

# Chrome Executable Path für Screenshots (erforderlich)
# Unterstützt moderne CSS Features wie OKLCH Farben (Chrome 111+ erforderlich)

# macOS
CHROME_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# Linux
# CHROME_EXECUTABLE_PATH="/usr/bin/google-chrome"

# Windows
# CHROME_EXECUTABLE_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
```

## Verwendung

### Automatisch (empfohlen)

Das Modul fügt automatisch einen Bug-Report-Button zu deiner Anwendung hinzu (wenn `autoShow: true`).

### Programmatisch

```vue

<template>
  <div>
    <BugReportButton/>
    <!-- oder -->
    <button @click="openBugReport">
      Bug melden
    </button>
  </div>
</template>

<script setup>
  const {openModal} = useBugReport()

  const openBugReport = () => {
    openModal()
  }
</script>
```

## Features im Detail

### Automatische Label-Verwaltung

Das Modul erstellt automatisch Labels in Linear basierend auf dem Bug-Report-Type:

- **Bug** → `bug` Label (rot)
- **Feature** → `feature` Label (blau)
- **Enhancement** → `enhancement` Label (grün)
- **Other** → `other` Label (lila)

Falls Labels nicht existieren, werden sie automatisch erstellt.

### Screenshot-Funktionalität

- **Server-seitige Generierung** mit Puppeteer für perfekte Darstellung
- **Vollständige CSS-Unterstützung** inklusive OKLCH-Farben
- **Automatische Anhang-Erstellung** in Linear Issues
- **Chrome 111+ Unterstützung** für moderne Web-Standards

### Linear Integration

- **Team-Resolution** - Verwendet Team-Namen statt UUIDs
- **Projekt-Resolution** - Optionale Projekt-Zuordnung per Name
- **Attachment-Upload** - Screenshots werden direkt als Anhänge verknüpft
- **Strukturierte Issues** - Organisierte Darstellung aller Informationen

### Browser-Informationen

Automatische Erfassung von:

- Browser-Details (Name, Version, User-Agent)
- Betriebssystem-Informationen
- Viewport und Screen-Größe
- Performance-Metriken
- Sprach- und Timezone-Einstellungen

## API

### Composable: `useBugReport()`

```typescript
const {
  openModal,           // () => Promise<void>
  submitBugReport,     // (data: BugReportData) => Promise<void>
  isSubmitting,        // Ref<boolean>
  error,              // Ref<string | null>
  previewScreenshot,  // Ref<string | null>
  capturingScreenshot // Ref<boolean>
} = useBugReport()
```

### Komponenten

- `<BugReportButton />` - Konfigurierbarer Bug-Report-Button
- `<BugReportModal />` - Modal-Dialog für Bug-Reports

## Konfigurationsoptionen

| Option              | Typ       | Standard                | Beschreibung                     |
|---------------------|-----------|-------------------------|----------------------------------|
| `linearApiKey`      | `string`  | -                       | Linear API Key (erforderlich)    |
| `linearTeamName`    | `string`  | -                       | Linear Team Name oder Key        |
| `linearProjectName` | `string`  | -                       | Linear Projekt Name (optional)   |
| `autoShow`          | `boolean` | `true`                  | Automatische Anzeige des Buttons |
| `position`          | `string`  | `'bottom-right'`        | Button-Position                  |
| `buttonColor`       | `string`  | `'#ef4444'`             | Button-Farbe                     |
| `buttonText`        | `string`  | `'Fehler melden'`       | Button-Text                      |
| `buttonIcon`        | `string`  | `'i-heroicons-bug-ant'` | Button-Icon                      |
| `enableScreenshot`  | `boolean` | `true`                  | Screenshot-Funktionalität        |
| `enableBrowserInfo` | `boolean` | `true`                  | Browser-Info-Erfassung           |
| `enableConsoleLogs` | `boolean` | `true`                  | Console-Log-Erfassung            |
| `theme`             | `string`  | `'auto'`                | Theme ('light', 'dark', 'auto')  |
| `maxConsoleLogs`    | `number`  | `50`                    | Maximale Anzahl Console-Logs     |

## Voraussetzungen

- **Nuxt 4.0+**
- **Linear API Key** mit write-Berechtigung
- **Google Chrome 111+** für Screenshots
- **@nuxt/ui** für UI-Komponenten

## Entwicklung

```bash
# Dependencies installieren
npm install

# Type Stubs generieren
npm run dev:prepare

# Entwicklung mit Playground
npm run dev

# Build
npm run build

# Tests
npm run test

# Linting
npm run lint
```

## Lizenz

MIT License - siehe [LICENSE](./LICENSE) Datei für Details.

---

Entwickelt von [lenne.Tech](https://lenne.tech) für effizientes Bug-Reporting in Nuxt-Anwendungen.
