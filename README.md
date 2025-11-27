<p align="center">
  <img src="src/runtime/assets/logo.png" alt="Bug LT Logo" height="300">
</p>

# @lenne.tech/bug.lt

Ein Nuxt 4 Modul für Bug-Reporting mit Linear Integration, Screenshots und automatischer Label-Verwaltung.

## Features

- 🐛 **Bug Report Button** - Konfigurierbarer Button in der Ecke des Bildschirms
- 📸 **Client-Side Screenshots** - Schnelle DOM-Screenshots mit `modern-screenshot` (kein Chrome/Puppeteer nötig)
- 🚶 **User Journey Tracking** - Automatische Erfassung von Benutzerinteraktionen (Klicks, Navigation, Formulare)
- 🌐 **Network Requests** - Erfassung aller Netzwerkanfragen mit Status und Fehlerdetails
- 🏷️ **Automatische Label-Verwaltung** - Erstellt und verwaltet Labels basierend auf Bug-Type automatisch
- 🎯 **Linear Integration** - Direkte Erstellung von Issues in Linear mit Team/Project-Resolution
- 📱 **Browser-Informationen** - Automatische Erfassung von Browser-, OS- und Performance-Daten
- 📝 **Console Logs** - Erfassung und Anhang von Console-Ausgaben (CSS-Styles werden bereinigt)
- ⚠️ **Error Boundary** - Automatische Fehlererfassung bei JavaScript-Exceptions
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
  modules: [
    '@lenne.tech/bug.lt'
    // @nuxt/ui wird automatisch hinzugefügt
  ],
  bug: {
    // Module Control
    enabled: true, // false deaktiviert das komplette Modul
    ui: true, // false deaktiviert @nuxt/ui Installation

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
    enableNetworkRequests: true,
    enableUserJourney: true,
    enableErrorBoundary: true,
    autoOpenOnError: false, // Modal automatisch öffnen bei JS-Fehlern

    // Styling
    theme: 'auto', // 'light' | 'dark' | 'auto'
    maxConsoleLogs: 50,
    maxNetworkRequests: 50,

    // User Journey Konfiguration (optional)
    userJourney: {
      maxEvents: 50,
      captureClicks: true,
      captureNavigation: true,
      captureFormInteractions: true,
      captureKeyboard: true,
      captureErrors: true,
    }
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

- **Client-seitige Erfassung** mit `modern-screenshot` (kein Server/Chrome nötig)
- **Viewport-Screenshot** - Erfasst den aktuell sichtbaren Bereich inkl. Scroll-Position
- **Automatische Anhang-Erstellung** in Linear Issues
- **Theme-Erkennung** - Passt Hintergrundfarbe an Light/Dark Mode an

### User Journey Tracking

- **Klick-Tracking** - Erfasst alle Klicks mit Element-Informationen
- **Navigation** - Protokolliert Seitenwechsel und URL-Änderungen
- **Formular-Interaktionen** - Erfasst Fokus, Blur und Submit-Events
- **Keyboard-Events** - Protokolliert wichtige Tastatureingaben
- **Fehler-Tracking** - Erfasst JavaScript-Exceptions automatisch
- **Timeline-Darstellung** - Übersichtliche Darstellung der letzten Aktionen

### Network Requests

- **Fetch & XHR** - Erfasst alle Netzwerkanfragen
- **Status-Tracking** - Zeigt erfolgreiche und fehlgeschlagene Requests
- **Error-Details** - Speichert Fehlerinformationen bei fehlgeschlagenen Requests
- **Request-Body** - Erfasst gesendete Daten (ohne sensitive Inhalte)

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

| Option                  | Typ       | Standard         | Beschreibung                          |
|-------------------------|-----------|------------------|---------------------------------------|
| `enabled`               | `boolean` | `true`           | Komplettes Modul aktivieren           |
| `ui`                    | `boolean` | `true`           | @nuxt/ui Installation aktivieren      |
| `linearApiKey`          | `string`  | -                | Linear API Key (erforderlich)         |
| `linearTeamName`        | `string`  | -                | Linear Team Name oder Key             |
| `linearProjectName`     | `string`  | -                | Linear Projekt Name (optional)        |
| `autoShow`              | `boolean` | `true`           | Automatische Anzeige des Buttons      |
| `position`              | `string`  | `'bottom-right'` | Button-Position                       |
| `buttonColor`           | `string`  | `'#ef4444'`      | Button-Farbe                          |
| `enableScreenshot`      | `boolean` | `true`           | Screenshot-Funktionalität             |
| `enableBrowserInfo`     | `boolean` | `true`           | Browser-Info-Erfassung                |
| `enableConsoleLogs`     | `boolean` | `true`           | Console-Log-Erfassung                 |
| `enableNetworkRequests` | `boolean` | `true`           | Netzwerk-Request-Erfassung            |
| `enableUserJourney`     | `boolean` | `true`           | User Journey Tracking                 |
| `enableErrorBoundary`   | `boolean` | `true`           | Error Boundary Komponente             |
| `autoOpenOnError`       | `boolean` | `false`          | Modal bei JS-Fehlern öffnen           |
| `theme`                 | `string`  | `'auto'`         | Theme ('light', 'dark', 'auto')       |
| `maxConsoleLogs`        | `number`  | `50`             | Maximale Anzahl Console-Logs          |
| `maxNetworkRequests`    | `number`  | `50`             | Maximale Anzahl Network-Requests      |
| `userJourney`           | `object`  | siehe unten      | User Journey Konfiguration            |

### User Journey Optionen

| Option                    | Typ       | Standard | Beschreibung                    |
|---------------------------|-----------|----------|---------------------------------|
| `enabled`                 | `boolean` | `true`   | User Journey aktivieren         |
| `maxEvents`               | `number`  | `50`     | Maximale Anzahl Events          |
| `captureClicks`           | `boolean` | `true`   | Klick-Events erfassen           |
| `captureNavigation`       | `boolean` | `true`   | Navigation erfassen             |
| `captureFormInteractions` | `boolean` | `true`   | Formular-Events erfassen        |
| `captureKeyboard`         | `boolean` | `true`   | Keyboard-Events erfassen        |
| `captureErrors`           | `boolean` | `true`   | Fehler erfassen                 |
| `captureModalEvents`      | `boolean` | `true`   | Modal-Events erfassen           |
| `throttleRate`            | `number`  | `100`    | Throttle-Rate in ms             |

## Voraussetzungen

- **Nuxt 4.0+**
- **Linear API Key** mit write-Berechtigung

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
