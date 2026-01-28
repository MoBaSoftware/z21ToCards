# Locomotive Card Generator

🇩🇪 [Deutsch](README.md) | 🇳🇱 [Nederlands](README.nl.md) | 🏛️ [Latina](README.la.md)

A browser-based tool for creating locomotive cards from Z21 backups for model railway enthusiasts.

**[▶ Use Online](https://donderda.github.io/z21ToCards/)**

![Screenshot](docs/screenshot.png)

## Features

- **100% Browser-based** – No server installation required, all data stays local
- **Z21 Backup Import** – Open your Z21 App backup (.z21 or .zip)
- **Customizable Cards** – Size, colors, font size and address style
- **PDF Export** – Print your cards on A4, A3 or 10x15cm
- **Printed Tracking** – Keep track of which locomotives have been printed
- **Save Settings** – Your configuration is saved in the browser
- **Multilingual** – DE, EN, NL (and Latin), automatic browser language detection

## Use Cases

The printed cards are perfect for:
- **Magnet Cards** – Print and attach to magnetic foil, e.g. for a magnetic board or whiteboard
- **Laminated Cards** – For durable hand cards while operating
- **Overview at Control Panel** – All locomotive addresses at a glance

## Usage

### Online
Use the **[hosted version on GitHub Pages](https://donderda.github.io/z21ToCards/)** or open `public/index.html` locally in your browser.

### GitHub Pages

1. Fork this repository
2. Go to **Settings → Pages**
3. Select **GitHub Actions** as Source
4. The app will be available at `https://<username>.github.io/z21ToCards/`

## Technology

- Vanilla JavaScript (no frameworks)
- [sql.js](https://github.com/sql-js/sql.js/) – SQLite in the browser via WebAssembly
- [JSZip](https://stuk.github.io/jszip/) – Unzip files in the browser
- [jsPDF](https://github.com/parallax/jsPDF) – PDF generation in the browser

## Extensibility

The code is structured so that additional backup formats (e.g. TrainController, ECoS) can be supported in the future. See `backupParsers` in `script.js`.

## Privacy

All data is processed exclusively locally in your browser. No data is transmitted to servers.

## Icons

Train and tree icons from [Icons8](https://icons8.com).

## License

MIT
