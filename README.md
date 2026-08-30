<div align="center">

  <img src="https://raw.githubusercontent.com/iamNVN/PlayIMDB/refs/heads/master/icons/logo.png"
       width="80"
       height="80"
       alt="Play IMDb Logo">

  <h1>Play IMDb</h1>

  <p>
A browser extension that lets you watch movies & TV shows directly on IMDb with a single click.
  </p>

  <img src="https://raw.githubusercontent.com/iamNVN/PlayIMDB/refs/heads/master/icons/banner.png"
       width="85%"
       alt="Play IMDb">


  <img src="https://img.shields.io/badge/Version-1.0.0-F5B82E?style=for-the-badge"
       alt="Version">
  &nbsp;
  <img src="https://img.shields.io/badge/License-MIT-171717?style=for-the-badge"
       alt="License">
  &nbsp;
  <img src="https://img.shields.io/badge/Chrome-Manifest%20V3-F5B82E?style=for-the-badge&logo=googlechrome&logoColor=white"
       alt="Chrome Manifest V3">

</div>


## 📋 Table of Contents

- 📸 [Preview](#-preview)
- ✨ [Features](#-features)
- 📦 [Installation](#-installation)
- 🚀 [Usage](#-usage)
- 🔗 [How It Works](#-how-it-works)
- 🤝 [Contributing](#-contributing)
- ⚠️ [Disclaimer](#️-disclaimer)
- 🔒 [Privacy](#-privacy)
- ⚖️ [License](#️-license)


## 📸 Preview

<p align="center">
  <img src="https://raw.githubusercontent.com/iamNVN/PlayIMDB/refs/heads/master/icons/preview1.png" width="300" alt="Play IMDb on IMDb">
</p>


## ✨ Features

- **▶️ One-Click Play**  
  Adds a Play button directly to supported IMDb movie and TV show pages.

- **🎬 Movies & TV Shows**  
  Supports both IMDb movies and TV shows.

- **🖼️ Popup Player**  
  Opens playback in a popup player without requiring the user to navigate away from IMDb.

- **📺 Picture-in-Picture**  
  Pop the player out into an always-on-top floating window. Because it uses the modern Document PiP API, it keeps the subtitles and player controls in PiP.

- **🔖 Built-in Watchlist**  
  Click the extension icon in your browser toolbar to save titles to your personal Watchlist and launch them later with one click.

## 📦 Installation

### From Release

1. Download the latest `PlayIMDb.zip` from [Releases](https://github.com/iamnvn/PlayIMDb/releases).
2. Extract the ZIP file.
3. Open `chrome://extensions/`.
4. Enable **Developer mode**.
5. Click **Load unpacked**.
6. Select the extracted folder.

### From Source

```bash
git clone https://github.com/iamnvn/PlayIMDb.git
cd PlayIMDb
```
Then load the project folder through `chrome://extensions/` → Load unpacked.


## 🚀 Usage

### 1. Open an IMDb Page
Navigate to any movie or TV show page on IMDb.
Example: `https://www.imdb.com/title/tt0816692/`

### 2. Click PlayIMDb
A golden **PlayIMDb** button will appear next to the movie title. Click it to launch the player.

### 3. Watch Seamlessly
The movie will instantly start playing in a popup player directly over the IMDb page. From the player overlay, you can:
- **Open Picture-in-Picture (PiP)**: Open the player in a floating Picture-in-Picture window so you can keep browsing.
- **Open in New Tab**: Open the player in a separate browser tab.

### 4. Manage Your Watchlist
Click the PlayIMDb extension icon in your browser toolbar to open the popup. From here, you can add the current movie to your Watchlist, view your saved titles, and check for extension updates.

## 🔗 How It Works

Play IMDb detects the IMDb title ID from the current IMDb page and determines whether the page represents a movie or TV show.

It then generates the corresponding playback URL using **supported provider** and loads it inside the extension's player.

While the extension handles the IMDb integration, UI, Watchlist, and playback controls, it does not host any video content itself.


## 🤝 Contributing

Contributions, improvements, and bug fixes are welcome.

### 1. Fork the Repository

Create your own fork of the project on GitHub.

### 2. Create a Feature Branch

```bash
git checkout -b feature/my-new-feature
```

### 3. Make and test your changes

Implement your feature or fix any issues and test the extension.


### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add my new feature"
```

### 5. Push Your Branch

```bash
git push origin feature/my-new-feature
```

### 6. Open a Pull Request

Create a Pull Request against the `main` branch with a clear description of your changes.


## ⚠️ Disclaimer

Play IMDb is an independent browser extension and is **not affiliated with, endorsed by, or sponsored by IMDb or Amazon.**

IMDb is a trademark of its respective owner.

Users are responsible for ensuring that their use of third-party content and services complies with applicable laws and the respective service terms.

## 🔒 Privacy

Play IMDb does not require an account or collect personal information.

The extension stores Watchlist data locally in the browser and only accesses IMDb pages required for its functionality.

## ⚖️ License

This project is licensed under the **MIT License**.

See the [LICENSE](LICENSE) file for the complete license text.


<div align="center">

<br> 

**Made with ❤️ by [Naveen Kumar](https://iamnvn.in)**

[GitHub](https://github.com/iamnvn) · [Releases](https://github.com/iamnvn/PlayIMDb/releases)

</div>
