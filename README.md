# Crtani Filmovi Elena — Universal Android Phone & Android TV App 🎬

A cross-platform JavaScript / React Native application designed for both **Android TV / Google TV** (D-pad remote control) and **Android Mobile Phones** (Touch screen), for browsing and streaming dubbed cartoons (*sinhronizovani crtani filmovi*) live from [crtanifilmovielena.com](https://crtanifilmovielena.com/).

![Platform Support](https://img.shields.io/badge/Platform-Android%20TV%20%7C%20Android%20Phone-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🌟 Key Features

- 📺 **Android TV Experience**: 10-foot UI with focusable card highlights, full remote D-pad navigation support (`LEANBACK_LAUNCHER`), and TV player overlay.
- 📱 **Android Phone Experience**: Touch-friendly layout, swipeable carousels, responsive grid views, and gesture controls.
- 🔄 **Live Web Scraper**: Live catalog and video stream extraction from `crtanifilmovielena.com`.
- 🔍 **In-App Search**: Instant search by cartoon title with automatic screen adaptation.
- 🎬 **Integrated Video Player**: Fullscreen HTML5 / Webview video player supporting embedded streams.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/<YOUR_USERNAME>/crtani-filmovi-app.git

# Navigate to directory
cd crtani-filmovi-app

# Install dependencies
npm install
```

### Running the App

```bash
# Start development server
npm start

# Run on Android Emulator / Physical Device
npm run android

# Run Web Preview
npm run web
```

---

## 📁 Project Structure

```
crtani_filmovi_app/
├── package.json
├── app.json
├── index.js
├── App.js
├── src/
│   ├── api/
│   │   └── scraper.js           # Live scraper for crtanifilmovielena.com
│   ├── components/
│   │   ├── MovieCard.js         # Adaptive Card (TV Focus & Touch)
│   │   ├── HeroBanner.js        # Featured carousel banner
│   │   └── VideoPlayer.js       # Stream player (Touch + Remote)
│   ├── screens/
│   │   ├── HomeScreen.js        # Main feed
│   │   ├── DetailScreen.js      # Cartoon info & stream launch
│   │   ├── SearchScreen.js      # Search screen
│   │   └── PlayerScreen.js      # Fullscreen streaming player
│   └── utils/
│       └── device.js            # Platform TV vs Mobile detection
```

---

## 📄 License
Distributed under the MIT License.
