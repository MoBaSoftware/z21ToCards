# Generator Chartarum Locomotivarum

🇩🇪 [Deutsch](README.md) | 🇬🇧 [English](README.en.md) | 🇳🇱 [Nederlands](README.nl.md)

Instrumentum in navigatore ad chartas locomotivarum ex Z21-exemplaribus creandas pro fervidiariis viarum ferratarum miniatarum.

**[▶ In Interrete Uti](https://donderda.github.io/z21ToCards/)**

![Imago](docs/screenshot.png)

## Facultates

- **C% In Navigatore** – Nulla installatio servitoris necessaria, omnia data localia manent
- **Z21-Exemplar Importare** – Aperi tuum Z21-App exemplar (.z21 vel .zip)
- **Chartae Accommodabiles** – Magnitudo, colores, scriptura et stilus inscriptionis
- **PDF Exportare** – Imprime chartas tuas in A4, A3 vel 10x15cm
- **Impressio Notata** – Nota quae locomotivae iam impressae sint
- **Configurationem Servare** – Configuratio tua in navigatore servatur
- **Multilinguis** – DE, EN, NL (et Latina), detectio automatica linguae navigatoris

## Usus

Chartae impressae perfectae sunt pro:
- **Chartis Magneticis** – Imprime et in folium magneticum adglutina, e.g. pro tabula magnetica
- **Chartis Laminatis** – Pro chartis manualibus durabilibus
- **Conspectus ad Pulpitum** – Omnes inscriptiones locomotivarum uno aspectu

## Usus

### In Interrete
Utere **[versione in GitHub Pages](https://donderda.github.io/z21ToCards/)** vel aperi `public/index.html` localiter in navigatore tuo.

### GitHub Pages

1. Furca hoc repositorium
2. Vade ad **Settings → Pages**
3. Elige **GitHub Actions** ut Fons
4. Applicatio erit in `https://<nomen-usatoris>.github.io/z21ToCards/`

## Technologia

- JavaScript Purum (sine frameworks)
- [sql.js](https://github.com/sql-js/sql.js/) – SQLite in navigatore per WebAssembly
- [JSZip](https://stuk.github.io/jszip/) – Fasciculos ZIP in navigatore aperire
- [jsPDF](https://github.com/parallax/jsPDF) – Generatio PDF in navigatore

## Extensibilitas

Codex ita structus est ut futura formata exemplarium (e.g. TrainController, ECoS) sustineri possint. Vide `backupParsers` in `script.js`.

## Secretum

Omnia data excluse localiter in navigatore tuo tractantur. Nulla data ad servitores mittuntur.

## Icones

Icones hamaxostitum et arborum ab [Icons8](https://icons8.com).

## Licentia

MIT
