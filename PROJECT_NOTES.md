# Project Conversation & Architecture Documentation 📜

**Project Name**: Crtani Filmovi Elena — Universal Android Phone & Android TV App  
**Target Repository**: [https://github.com/Silv3rVIP/crtani-filmovi-app](https://github.com/Silv3rVIP/crtani-filmovi-app)  
**Project Path**: `C:\Users\silv3\.gemini\antigravity\scratch\crtani_filmovi_app`  
**Target Platform**: Android Mobile Phone + Android TV / Google TV  

---

## 🎯 Project Overview & Objective

Build a universal cross-platform JavaScript / React Native application to stream dubbed animated movies (*sinhronizovani crtani filmovi*) live from [crtanifilmovielena.com](https://crtanifilmovielena.com/).

The application automatically detects the device type (`Platform.isTV`) and dynamically adjusts the user interface and navigation:
- **Android TV / Google TV**: 10-foot TV UI, D-pad remote focus highlight borders, scale animations on card focus, and TV player overlay (`LEANBACK_LAUNCHER`).
- **Android Mobile Phone / Tablet**: Touch gestures, swipeable carousels, responsive grid layouts, and touch video controls.

---

## 🏗 Architecture & Key Files

```
crtani_filmovi_app/
├── package.json               # Expo & React Native dependencies
├── app.json                   # Android Manifest Leanback launcher config
├── App.js                     # Root entry point & screen navigation router
├── test-scraper.js            # Standalone test script for web scraper
├── README.md                  # Main repository README
├── PROJECT_NOTES.md           # Preserved conversation notes & architecture
├── .github/
│   └── workflows/
│       └── build-apk.yml      # GitHub Actions automated APK build workflow
└── src/
    ├── api/
    │   └── scraper.js         # Live scraper for crtanifilmovielena.com
    ├── components/
    │   ├── MovieCard.js       # Adaptive Card (TV Focus & Touch)
    │   ├── HeroBanner.js      # Featured carousel banner
    │   └── VideoPlayer.js     # Fullscreen streaming player
    ├── screens/
    │   ├── HomeScreen.js      # Main catalog & horizontal category rows
    │   ├── DetailScreen.js    # Cartoon info & stream launcher
    │   ├── SearchScreen.js    # TV D-pad / Phone keyboard search
    │   └── PlayerScreen.js    # Fullscreen player screen
    └── utils/
        └── device.js          # Platform TV vs Mobile detection helper
```

---

## ⚙️ How To Run & Build APK

### 1. Run Live Development (Expo Go)
```bash
# Start development server
npx expo start
```
- Open **Expo Go** on your Phone or Android TV and scan the QR code to test immediately.

### 2. Build Standalone APK (EAS Cloud Build)
```bash
# Build direct downloadable APK in cloud
npx eas-cli build -p android --profile preview
```

### 3. Push Updates to GitHub
```bash
git add .
git commit -m "Update project documentation and features"
git push -u origin main
```
