# Locomotief Kaarten Generator

🇩🇪 [Deutsch](README.md) | 🇬🇧 [English](README.en.md) | 🏛️ [Latina](README.la.md)

Een browser-gebaseerde tool voor het maken van locomotiefkaarten uit Z21-backups voor modelspoorbaan-enthousiasten.

**[▶ Online gebruiken](https://donderda.github.io/z21ToCards/)**

![Screenshot](docs/screenshot.png)

## Functies

- **100% Browser-gebaseerd** – Geen server-installatie nodig, alle gegevens blijven lokaal
- **Z21-Backup Import** – Open je Z21-App backup (.z21 of .zip)
- **Aanpasbare Kaarten** – Grootte, kleuren, lettergrootte en adresstijl
- **PDF-Export** – Print je kaarten op A4, A3 of 10x15cm
- **Afdruk-Markering** – Houd bij welke locomotieven al geprint zijn
- **Instellingen Opslaan** – Je configuratie wordt opgeslagen in de browser
- **Meertalig** – DE, EN, NL (en Latijn), automatische browsertaal-detectie

## Toepassingen

De geprinte kaarten zijn perfect voor:
- **Magneetkaarten** – Printen en op magneetfolie plakken, bijv. voor een magneetbord of whiteboard
- **Gelamineerde Kaarten** – Voor duurzame handkaarten tijdens het rijden
- **Overzicht bij Bedieningspaneel** – Alle locomotiefadressen in één oogopslag

## Gebruik

### Online
Gebruik de **[gehoste versie op GitHub Pages](https://donderda.github.io/z21ToCards/)** of open `public/index.html` lokaal in je browser.

### GitHub Pages

1. Fork deze repository
2. Ga naar **Settings → Pages**
3. Selecteer **GitHub Actions** als Source
4. De app is dan beschikbaar op `https://<username>.github.io/z21ToCards/`

## Technologie

- Vanilla JavaScript (geen frameworks)
- [sql.js](https://github.com/sql-js/sql.js/) – SQLite in de browser via WebAssembly
- [JSZip](https://stuk.github.io/jszip/) – ZIP-bestanden uitpakken in de browser
- [jsPDF](https://github.com/parallax/jsPDF) – PDF-generatie in de browser

## Uitbreidbaarheid

De code is zo gestructureerd dat in de toekomst extra backup-formaten (bijv. TrainController, ECoS) ondersteund kunnen worden. Zie `backupParsers` in `script.js`.

## Privacy

Alle gegevens worden uitsluitend lokaal in je browser verwerkt. Er worden geen gegevens naar servers verzonden.

## Iconen

Trein- en boom-iconen van [Icons8](https://icons8.com).

## Licentie

MIT
