# Universal JavaScript App (Android Phone + Android TV) Implementation Plan for crtanifilmovielena.com

Transform the project into a single JavaScript/TypeScript application targeting **both Android Phones and Android TV** devices, with automated setup for a new GitHub repository.

## Key Changes & Architecture

### 1. Technology Stack (JavaScript / TypeScript)
- **Framework**: **React Native with Expo** (or React Universal UI)
  - Supports **Touch gestures** for Android Mobile Phones & Tablets.
  - Supports **D-Pad remote navigation** (`focusable`, `hasTVPreferredFocus`, TV focus highlight overlays) for Android TV & Google TV.
- **Language**: JavaScript / TypeScript
- **Video Player**: Native Video Player (`expo-video` / `react-native-video`) with adaptive layout (Touch controls for Phone, D-pad controls for TV).
- **Data Scraping & Fetching**: Axios / Fetch + `cheerio` / custom regex HTML parser for fetching movie catalogs, categories, search, and stream URLs from `crtanifilmovielena.com`.
- **Navigation**: React Navigation (`@react-navigation/native` & `@react-navigation/native-stack`).

### 2. Dual Experience (Phone + TV Adaptive Design)
- **Automatic Device Detection**: Detects whether the app is running on Android TV or Android Phone (`Platform.isTV`).
- **Adaptive Layouts**:
  - **Phone Mode**: Vertical scroll feed, swipeable carousels, touchable buttons, bottom navigation bar or header search.
  - **TV Mode**: 10-foot UI with large focusable poster cards, D-pad highlight borders, auto-scrolling hero banners, and remote control key handler.
- **Video Player**:
  - **Phone**: Touch controls (tap to show overlay, scrub bar, pinch/fullscreen).
  - **TV**: Remote control overlay (DPAD_CENTER to pause/play, LEFT/RIGHT to seek 10s).

### 3. GitHub Repository Setup
- Initialize Git repository in project directory: `C:\Users\silv3\.gemini\antigravity\scratch\crtani_filmovi_app`
- Create `.gitignore`, `README.md`, `LICENSE`, and initial git commit.
- Configure remote GitHub repository link.

---

## User Review Required

> [!IMPORTANT]
> - **Cross-Platform Compatibility**: A single JavaScript codebase will serve both Android Mobile Phones and Android TV.
> - **Workspace Directory**: `C:\Users\silv3\.gemini\antigravity\scratch\crtani_filmovi_app`
> - **GitHub Integration**: Local Git repository will be created and initialized ready for pushing to GitHub.

---

## Proposed Project Structure

### [NEW] `C:\Users\silv3\.gemini\antigravity\scratch\crtani_filmovi_app`

```
crtani_filmovi_app/
├── package.json
├── app.json
├── index.js / App.js
├── README.md
├── .gitignore
├── src/
│   ├── api/
│   │   └── scraper.js           # HTML parser for crtanifilmovielena.com
│   ├── components/
│   │   ├── MovieCard.js         # Adaptive Card (TV Focus & Phone Touch)
│   │   ├── HeroBanner.js        # Featured banner carousel
│   │   ├── TvFocusContainer.js  # D-pad focus engine for TV
│   │   └── VideoPlayer.js       # Universal Video Player (Touch + Remote)
│   ├── screens/
│   │   ├── HomeScreen.js        # Catalog & horizontal rows
│   │   ├── DetailScreen.js      # Movie details & stream link extractor
│   │   ├── SearchScreen.js      # Search screen
│   │   └── PlayerScreen.js      # Fullscreen media playback
│   ├── navigation/
│   │   └── AppNavigator.js
│   └── utils/
│       └── device.js            # Platform.isTV helper
```

---

## Verification Plan

### Automated Build & Test
- Run `npm test` or `npx expo lint` for code validity.
- Run node scraper test scripts to verify live stream link extraction from `crtanifilmovielena.com`.

### Manual Verification
- Test Phone touch layout responsiveness.
- Test Android TV remote D-pad focus states and playback controls.
- Verify Git repository commit history and GitHub remote setup.
