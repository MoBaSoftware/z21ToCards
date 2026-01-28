// ==================== Browser-Only Lok-Karten Generator ====================

// Global state
let SQL = null;
let db = null;
let imageFiles = {};
let allLoks = [];
let currentLang = 'de';

// LocalStorage keys
const STORAGE_KEY = 'z21cards-settings';
const PRINTED_LOKS_KEY = 'z21cards-printed-loks';
const LANG_KEY = 'z21cards-language';
const TRAIN_CONFIG_KEY = 'z21cards-train-config';

// ==================== Internationalization ====================

let translations = {};

async function loadTranslations(lang) {
    try {
        const response = await fetch(`lang/${lang}.json`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (e) {
        // Fallback for file:// protocol - load from embedded script
        return null;
    }
}

async function initTranslations() {
    // Try to load from JSON files (works on http/https)
    const [de, en, nl, la] = await Promise.all([
        loadTranslations('de'),
        loadTranslations('en'),
        loadTranslations('nl'),
        loadTranslations('la')
    ]);

    // Use loaded translations or fallback to embedded
    translations = {
        de: de || FALLBACK_TRANSLATIONS.de,
        en: en || FALLBACK_TRANSLATIONS.en,
        nl: nl || FALLBACK_TRANSLATIONS.nl,
        la: la || FALLBACK_TRANSLATIONS.la
    };
}

// Fallback translations for file:// protocol
const FALLBACK_TRANSLATIONS = {
    de: {
        title: "Lok-Karten Generator", resetUpload: "Neue Datei hochladen",
        loadingSqlite: "Lade SQLite Engine...", loadingReady: "Bereit!",
        loadingError: "Fehler beim Laden. Bitte Seite neu laden.", loadingComponents: "Lade Komponenten...",
        step1Title: "1. Wähle dein Z21-Backup",
        step1Desc: "Erstelle in der <strong>Z21-App</strong> ein Backup deiner Lokomotiven und öffne es hier.",
        dropzoneText: "Backup-Datei hier ablegen", dropzoneSubtext: "oder klicken zum Auswählen",
        privacyNote: "Deine Daten bleiben auf deinem Gerät – es wird nichts ins Internet übertragen.",
        processingBackup: "Verarbeite Backup...", invalidFileType: "Bitte eine .z21 oder .zip Datei wählen.",
        errorPrefix: "Fehler:", step2Title: "2. Anpassen und Exportieren",
        cardSize: "Karten-Größe", cardWidth: "Breite (cm):", cardHeight: "Höhe (cm):",
        addressStyle: "Adressen-Stil", styleLabel: "Stil:", styleCircle: "Kreis",
        styleRotatedRight: "Gedreht Rechts", styleRotatedLeft: "Gedreht Links", sidePadding: "Seiten-Abstand (%):",
        circleDetails: "Kreis-Details", circleSize: "Größe (mm):", position: "Position:",
        posTopRight: "Oben Rechts", posTopLeft: "Oben Links", posBottomRight: "Unten Rechts", posBottomLeft: "Unten Links",
        colorsFont: "Farben & Schrift", bgColor: "Hintergrund:", textColor: "Schrift:", fontSize: "Schriftgröße (px):",
        export: "Export", paperFormat: "Papierformat:", generatePdf: "PDF generieren", generating: "Generiere...",
        preview: "Vorschau", loadingPreview: "Lade Vorschau...", noLokPreview: "Keine Lok für Vorschau.", previewError: "Fehler bei Vorschau.",
        selectAll: "Alle auswählen", deselectAll: "Alle abwählen", selectUnprinted: "Nur ungedruckte", loadingLoks: "Lade Loks...",
        address: "Adresse:", noImage: "Kein Bild", selectAtLeastOne: "Bitte wähle mindestens eine Lok aus.",
        pdfError: "Fehler beim Erstellen des PDFs.", noValidFormat: "Kein gültiges Z21-Export-Format gefunden.",
        locoNotFound: "Loco.sqlite nicht gefunden.", sqlLoadError: "sql.js konnte nicht geladen werden"
    },
    en: {
        title: "Locomotive Card Generator", resetUpload: "Upload new file",
        loadingSqlite: "Loading SQLite Engine...", loadingReady: "Ready!",
        loadingError: "Error loading. Please reload page.", loadingComponents: "Loading components...",
        step1Title: "1. Select your Z21 Backup",
        step1Desc: "Create a backup of your locomotives in the <strong>Z21 App</strong> and open it here.",
        dropzoneText: "Drop backup file here", dropzoneSubtext: "or click to select",
        privacyNote: "Your data stays on your device – nothing is transmitted to the internet.",
        processingBackup: "Processing backup...", invalidFileType: "Please select a .z21 or .zip file.",
        errorPrefix: "Error:", step2Title: "2. Customize and Export",
        cardSize: "Card Size", cardWidth: "Width (cm):", cardHeight: "Height (cm):",
        addressStyle: "Address Style", styleLabel: "Style:", styleCircle: "Circle",
        styleRotatedRight: "Rotated Right", styleRotatedLeft: "Rotated Left", sidePadding: "Side Padding (%):",
        circleDetails: "Circle Details", circleSize: "Size (mm):", position: "Position:",
        posTopRight: "Top Right", posTopLeft: "Top Left", posBottomRight: "Bottom Right", posBottomLeft: "Bottom Left",
        colorsFont: "Colors & Font", bgColor: "Background:", textColor: "Text:", fontSize: "Font Size (px):",
        export: "Export", paperFormat: "Paper Format:", generatePdf: "Generate PDF", generating: "Generating...",
        preview: "Preview", loadingPreview: "Loading preview...", noLokPreview: "No locomotive for preview.", previewError: "Error generating preview.",
        selectAll: "Select all", deselectAll: "Deselect all", selectUnprinted: "Unprinted only", loadingLoks: "Loading locomotives...",
        address: "Address:", noImage: "No image", selectAtLeastOne: "Please select at least one locomotive.",
        pdfError: "Error creating PDF.", noValidFormat: "No valid Z21 export format found.",
        locoNotFound: "Loco.sqlite not found.", sqlLoadError: "Could not load sql.js"
    },
    nl: {
        title: "Locomotief Kaarten Generator", resetUpload: "Nieuw bestand uploaden",
        loadingSqlite: "SQLite Engine laden...", loadingReady: "Gereed!",
        loadingError: "Fout bij laden. Vernieuw de pagina.", loadingComponents: "Componenten laden...",
        step1Title: "1. Selecteer je Z21-Backup",
        step1Desc: "Maak een backup van je locomotieven in de <strong>Z21-App</strong> en open deze hier.",
        dropzoneText: "Sleep backup-bestand hierheen", dropzoneSubtext: "of klik om te selecteren",
        privacyNote: "Je gegevens blijven op je apparaat – er wordt niets naar internet verzonden.",
        processingBackup: "Backup verwerken...", invalidFileType: "Selecteer een .z21 of .zip bestand.",
        errorPrefix: "Fout:", step2Title: "2. Aanpassen en Exporteren",
        cardSize: "Kaartgrootte", cardWidth: "Breedte (cm):", cardHeight: "Hoogte (cm):",
        addressStyle: "Adresstijl", styleLabel: "Stijl:", styleCircle: "Cirkel",
        styleRotatedRight: "Gedraaid Rechts", styleRotatedLeft: "Gedraaid Links", sidePadding: "Zijmarge (%):",
        circleDetails: "Cirkel Details", circleSize: "Grootte (mm):", position: "Positie:",
        posTopRight: "Rechtsboven", posTopLeft: "Linksboven", posBottomRight: "Rechtsonder", posBottomLeft: "Linksonder",
        colorsFont: "Kleuren & Lettertype", bgColor: "Achtergrond:", textColor: "Tekst:", fontSize: "Lettergrootte (px):",
        export: "Exporteren", paperFormat: "Papierformaat:", generatePdf: "PDF genereren", generating: "Genereren...",
        preview: "Voorbeeld", loadingPreview: "Voorbeeld laden...", noLokPreview: "Geen locomotief voor voorbeeld.", previewError: "Fout bij voorbeeld.",
        selectAll: "Alles selecteren", deselectAll: "Alles deselecteren", selectUnprinted: "Alleen niet-geprinte", loadingLoks: "Locomotieven laden...",
        address: "Adres:", noImage: "Geen afbeelding", selectAtLeastOne: "Selecteer minimaal één locomotief.",
        pdfError: "Fout bij maken van PDF.", noValidFormat: "Geen geldig Z21-exportformaat gevonden.",
        locoNotFound: "Loco.sqlite niet gevonden.", sqlLoadError: "Kon sql.js niet laden"
    },
    la: {
        title: "Generator Chartarum Locomotivarum", resetUpload: "Fasciculum novum imposuere",
        loadingSqlite: "Machina SQLite onerans...", loadingReady: "Paratum!",
        loadingError: "Error onerationis. Paginam refrica.", loadingComponents: "Partes onerans...",
        step1Title: "I. Elige tuum Z21-Backup",
        step1Desc: "Fac exemplar locomotivarum tuarum in <strong>App Z21</strong> et hic aperi.",
        dropzoneText: "Fasciculum huc trahe", dropzoneSubtext: "vel clicca ad eligendum",
        privacyNote: "Data tua in machina tua manent – nihil ad interrete mittitur.",
        processingBackup: "Backup tractans...", invalidFileType: "Quaeso fasciculum .z21 vel .zip elige.",
        errorPrefix: "Error:", step2Title: "II. Accommoda et Exporta",
        cardSize: "Magnitudo Chartae", cardWidth: "Latitudo (cm):", cardHeight: "Altitudo (cm):",
        addressStyle: "Stilus Inscriptionis", styleLabel: "Stilus:", styleCircle: "Circulus",
        styleRotatedRight: "Rotatum Dextrum", styleRotatedLeft: "Rotatum Sinistrum", sidePadding: "Spatium Laterale (%):",
        circleDetails: "Particularia Circuli", circleSize: "Magnitudo (mm):", position: "Positio:",
        posTopRight: "Superior Dextra", posTopLeft: "Superior Sinistra", posBottomRight: "Inferior Dextra", posBottomLeft: "Inferior Sinistra",
        colorsFont: "Colores et Scriptura", bgColor: "Fundus:", textColor: "Textus:", fontSize: "Magnitudo Scripturae (px):",
        export: "Exportare", paperFormat: "Forma Chartae:", generatePdf: "PDF generare", generating: "Generans...",
        preview: "Praevisio", loadingPreview: "Praevisionem onerans...", noLokPreview: "Nulla locomotiva ad praevisionem.", previewError: "Error in praevisione.",
        selectAll: "Omnia eligere", deselectAll: "Omnia deligere", selectUnprinted: "Solum non impressa", loadingLoks: "Locomotivas onerans...",
        address: "Inscriptio:", noImage: "Nulla imago", selectAtLeastOne: "Quaeso unam locomotivam minimum elige.",
        pdfError: "Error in PDF creando.", noValidFormat: "Nullum validum Z21 formatum inventum.",
        locoNotFound: "Loco.sqlite non inventum.", sqlLoadError: "sql.js onerare non potuit"
    }
};

function t(key) {
    return translations[currentLang]?.[key] || translations['de']?.[key] || key;
}

// Convert number to Roman numerals (for Latin language mode)
function toRoman(num) {
    if (num <= 0 || num > 3999 || !Number.isInteger(num)) return String(num);
    const romanNumerals = [
        ['M', 1000], ['CM', 900], ['D', 500], ['CD', 400],
        ['C', 100], ['XC', 90], ['L', 50], ['XL', 40],
        ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]
    ];
    let result = '';
    for (const [letter, value] of romanNumerals) {
        while (num >= value) {
            result += letter;
            num -= value;
        }
    }
    return result;
}

const SUPPORTED_LANGS = ['de', 'en', 'nl', 'la'];

function detectLanguage() {
    // Migration: Reset stored language once to fix incorrect defaults from earlier versions
    const MIGRATION_KEY = 'z21cards-lang-v2';
    if (!localStorage.getItem(MIGRATION_KEY)) {
        localStorage.removeItem(LANG_KEY);
        localStorage.setItem(MIGRATION_KEY, '1');
    }

    // Check stored preference (only set when user explicitly clicks a language button)
    const stored = localStorage.getItem(LANG_KEY);
    if (stored && SUPPORTED_LANGS.includes(stored)) {
        return stored;
    }

    // Detect from browser
    const browserLang = navigator.language?.toLowerCase() || '';
    if (browserLang.startsWith('de')) return 'de';
    if (browserLang.startsWith('en')) return 'en';
    if (browserLang.startsWith('nl')) return 'nl';

    // Default to German
    return 'de';
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;
    updateAllTranslations();
    updateLanguageSwitcher();
}

function updateLanguageSwitcher() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
}

function updateAllTranslations() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (el.dataset.i18nHtml) {
            el.innerHTML = t(key);
        } else {
            el.textContent = t(key);
        }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        el.placeholder = t(el.dataset.i18nPlaceholder);
    });

    // Update select options
    document.querySelectorAll('[data-i18n-options]').forEach(select => {
        const options = JSON.parse(select.dataset.i18nOptions);
        select.querySelectorAll('option').forEach(opt => {
            if (options[opt.value]) {
                opt.textContent = t(options[opt.value]);
            }
        });
    });
}

// Default settings
const DEFAULT_SETTINGS = {
    cardWidth: 4,
    cardHeight: 2,
    addressStyle: 'rotated-right',
    rotatedPadding: 20,
    circleSize: 4,
    circlePosition: 'top-right',
    backgroundColor: '#d32f2f',
    textColor: '#ffffff',
    fontSize: 80,
    format: 'a4'
};

// ==================== Header Animation ====================

function setHeaderTrainSpeed() {
    const headerTrack = document.querySelector('.header-track');
    if (!headerTrack) return;

    // Calculate duration based on viewport width for consistent speed (~80px per second)
    const width = window.innerWidth + 200; // +200 for train entering and leaving
    const speed = 80; // pixels per second
    const duration = width / speed;

    headerTrack.style.setProperty('--header-train-duration', `${duration}s`);
}

// Recalculate on window resize
window.addEventListener('resize', () => {
    setHeaderTrainSpeed();
});

// ==================== Random Trees ====================

function generateRandomTrees(containerId) {
    const treesContainer = document.getElementById(containerId);
    if (!treesContainer) return;

    // Get container width for dynamic tree count (use viewport width for header)
    const isHeader = containerId === 'header-trees';
    const containerWidth = isHeader ? window.innerWidth : (treesContainer.parentElement?.offsetWidth || 300);
    const treeTypes = ['icons8-tree-96.png', 'icons8-laubbaum.png'];

    // Calculate number of trees based on width (roughly 1 tree per 40px)
    const minTrees = Math.max(6, Math.floor(containerWidth / 50));
    const numTrees = minTrees + Math.floor(Math.random() * 3);
    const minSpacing = 25;
    const positions = [];

    for (let i = 0; i < numTrees; i++) {
        let pos;
        let attempts = 0;
        do {
            pos = 20 + Math.floor(Math.random() * (containerWidth - 40));
            attempts++;
        } while (positions.some(p => Math.abs(p - pos) < minSpacing) && attempts < 50);

        if (attempts < 50) {
            positions.push(pos);

            const tree = document.createElement('img');
            tree.src = treeTypes[Math.floor(Math.random() * treeTypes.length)];
            tree.className = 'tree';
            tree.alt = 'Baum';
            tree.style.left = pos + 'px';
            const scale = 0.7 + Math.random() * 0.5;
            tree.style.height = (45 * scale) + 'px';
            tree.style.zIndex = Math.floor(scale * 10);
            treesContainer.appendChild(tree);
        }
    }
}

// ==================== Random Window Flicker ====================

function startWindowFlicker() {
    const groups = document.querySelectorAll('.window-group');
    if (!groups.length) return;

    // Randomly set some window groups dim or off initially
    groups.forEach(g => {
        const r = Math.random();
        if (r < 0.15) g.classList.add('off');
        else if (r < 0.3) g.classList.add('dim');
    });

    // Periodically toggle random window groups
    setInterval(() => {
        const g = groups[Math.floor(Math.random() * groups.length)];
        g.classList.remove('off', 'dim');
        const r = Math.random();
        if (r < 0.1) g.classList.add('off');
        else if (r < 0.25) g.classList.add('dim');
    }, 2000 + Math.random() * 3000);
}

// ==================== Random Clouds ====================

function generateRandomClouds(containerId) {
    const cloudsContainer = document.getElementById(containerId);
    if (!cloudsContainer) return;

    const isHeader = containerId === 'header-clouds';
    const containerWidth = isHeader ? window.innerWidth : 300;

    // Cloud colors - different gray and white tones
    const cloudColors = [
        'rgba(255, 255, 255, 0.8)',  // white
        'rgba(245, 245, 245, 0.75)', // off-white
        'rgba(220, 220, 220, 0.7)',  // light gray
        'rgba(200, 200, 200, 0.65)', // medium light gray
        'rgba(180, 180, 180, 0.6)',  // gray
        'rgba(230, 235, 240, 0.7)',  // bluish white
    ];

    // Calculate number of clouds based on width (like trees, but divided by 3)
    const numTrees = Math.max(6, Math.floor(containerWidth / 50)) + Math.floor(Math.random() * 3);
    const numClouds = Math.max(3, Math.floor(numTrees / 3));

    for (let i = 0; i < numClouds; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';

        // Random size (40-120px wide, aspect ratio ~2:1)
        const width = 40 + Math.random() * 80;
        const height = width * (0.4 + Math.random() * 0.2);

        // Clouds start at right edge - animation brings them in from right
        const startX = containerWidth + 50 + Math.random() * 100;
        // Header clouds: spread across full height (0-60px from top)
        // Loading clouds: higher up (-60 to -20px)
        const startY = isHeader ? (Math.random() * 60) : (-60 + Math.random() * 40);

        // Random speed - slower (35-55 seconds for full traverse)
        const duration = 35 + Math.random() * 20;

        // Negative delay for initial random distribution across screen
        const initialDelay = -Math.random() * duration;

        // Random color
        const color = cloudColors[Math.floor(Math.random() * cloudColors.length)];

        // Create fluffy cloud shape with multiple circles
        const gradients = [];
        const numCircles = 3 + Math.floor(Math.random() * 3);
        for (let j = 0; j < numCircles; j++) {
            const cx = 20 + Math.random() * 60; // percentage
            const cy = 30 + Math.random() * 40;
            const size = 30 + Math.random() * 40;
            gradients.push(`radial-gradient(ellipse ${size}% ${size * 0.8}% at ${cx}% ${cy}%, ${color} 0%, transparent 70%)`);
        }

        cloud.style.cssText = `
            width: ${width}px;
            height: ${height}px;
            left: ${startX}px;
            top: ${startY}px;
            background: ${gradients.join(', ')};
            animation-duration: ${duration}s;
            animation-delay: ${initialDelay}s;
        `;

        cloudsContainer.appendChild(cloud);
    }
}

// ==================== Birds ====================

function generateBirds(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const containerWidth = window.innerWidth;
    const numBirds = 3 + Math.floor(Math.random() * 3); // 3-5 birds

    for (let i = 0; i < numBirds; i++) {
        const bird = document.createElement('div');
        bird.className = 'bird';

        // Ensure at least one bird flies each direction
        const goRight = i === 0 ? true : (i === 1 ? false : Math.random() > 0.5);
        const startX = goRight ? (-20 - Math.random() * 100) : (containerWidth + 20 + Math.random() * 100);
        const startY = 5 + Math.random() * 50;
        const scale = 1 + Math.random() * 1; // 1x-2x

        // Depth effect: bigger birds (closer) fly faster
        // Base duration inversely proportional to scale
        const baseDuration = 30 / scale + Math.random() * 5; // scale=2 -> ~15-20s, scale=1 -> ~30-35s
        // Headwind: LTR birds fly slower (factor 1.5x)
        const flyDuration = goRight ? baseDuration * 1.5 : baseDuration;

        const flapSpeed = 0.4 + Math.random() * 0.4;
        const initialDelay = -Math.random() * flyDuration;
        const flyAnim = goRight ? 'bird-fly-ltr' : 'bird-fly-rtl';
        const flip = goRight ? 'transform:scaleX(-1);' : '';

        bird.style.cssText = `
            left: ${startX}px;
            top: ${startY}px;
            animation: bird-flap ${flapSpeed}s steps(9) infinite, ${flyAnim} ${flyDuration}s linear infinite;
            animation-delay: 0s, ${initialDelay}s;
            scale: ${scale};
            ${flip}
        `;
        bird.dataset.originalTop = startY;

        container.appendChild(bird);
    }
}

function initBirdDodge() {
    const dodgeRadius = 80;
    const dodgeAmount = 40;
    let frame = null;

    document.addEventListener('mousemove', (e) => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
            const birds = document.querySelectorAll('.bird');
            birds.forEach(bird => {
                const rect = bird.getBoundingClientRect();
                const bx = rect.left + rect.width / 2;
                const by = rect.top + rect.height / 2;
                const dx = e.clientX - bx;
                const dy = e.clientY - by;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const origTop = parseFloat(bird.dataset.originalTop);

                if (dist < dodgeRadius) {
                    // Fly away from cursor vertically
                    const dodgeDir = dy > 0 ? -1 : 1;
                    const intensity = 1 - (dist / dodgeRadius);
                    const newTop = Math.max(0, origTop + dodgeDir * dodgeAmount * intensity);
                    bird.style.top = newTop + 'px';
                    bird.dataset.dodging = '1';
                } else if (bird.dataset.dodging) {
                    bird.style.top = origTop + 'px';
                    delete bird.dataset.dodging;
                }
            });
            frame = null;
        });
    });
}

// ==================== Mountain Landscape ====================

function generateMountains(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const w = window.innerWidth;

    const layers = [
        { color: '#7a8ea8', maxH: 85, peaks: 5 + Math.floor(Math.random() * 2), zIndex: 1 },
        { color: '#5a7055', maxH: 60, peaks: 7 + Math.floor(Math.random() * 2), zIndex: 2 },
        { color: '#3d5535', maxH: 40, peaks: 9 + Math.floor(Math.random() * 2), zIndex: 3 },
    ];

    layers.forEach(layer => {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'mountain-layer');
        svg.setAttribute('viewBox', `0 0 ${w} ${layer.maxH}`);
        svg.setAttribute('preserveAspectRatio', 'none');
        svg.style.height = layer.maxH + 'px';
        svg.style.zIndex = layer.zIndex;

        let d = `M0,${layer.maxH}`;
        const segW = w / layer.peaks;

        for (let i = 0; i < layer.peaks; i++) {
            const x1 = i * segW;
            const x2 = x1 + segW / 2;
            const x3 = x1 + segW;
            const valleyH = layer.maxH * (0.6 + Math.random() * 0.3);
            const peakH = layer.maxH * (0.1 + Math.random() * 0.35);
            const cp1x = x1 + segW * 0.25;
            const cp2x = x1 + segW * 0.35;
            const cp3x = x2 + segW * 0.15;
            const cp4x = x2 + segW * 0.25;

            d += ` C${cp1x},${valleyH} ${cp2x},${peakH} ${x2},${peakH}`;
            d += ` C${cp3x},${peakH} ${cp4x},${valleyH} ${x3},${valleyH}`;
        }

        d += ` L${w},${layer.maxH} Z`;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('fill', layer.color);
        svg.appendChild(path);
        container.appendChild(svg);
    });
}

// ==================== Random Bushes ====================

function generateRandomBushes(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const containerWidth = window.innerWidth;

    // Same count as trees
    const numBushes = Math.max(6, Math.floor(containerWidth / 50)) + Math.floor(Math.random() * 3);
    const minSpacing = 20;
    const positions = [];

    const bushColors = [
        '#3a6b2a', '#4a7a35', '#2d5a22', '#5a8a45',
        '#3d7030', '#4d8040', '#35652b', '#527a3d',
    ];

    const leafColors = [
        'rgba(120, 200, 90, 0.6)',
        'rgba(90, 170, 60, 0.5)',
        'rgba(150, 210, 100, 0.4)',
        'rgba(80, 150, 50, 0.5)',
    ];

    // Generate a random organic bush silhouette path
    function generateBushPath(w, h) {
        // Create an irregular, jagged bush outline with multiple lobes
        const numLobes = 4 + Math.floor(Math.random() * 4); // 4-7 lobes
        const points = [];

        // Generate lobe peaks along the top
        for (let i = 0; i < numLobes; i++) {
            const x = (w * 0.05) + (w * 0.9) * (i / (numLobes - 1));
            const peakH = h * (0.15 + Math.random() * 0.45);
            // Each lobe has a peak and surrounding detail points
            const numDetail = 3 + Math.floor(Math.random() * 3);
            for (let j = 0; j < numDetail; j++) {
                const dx = x + (Math.random() - 0.5) * (w / numLobes) * 0.8;
                const dy = peakH + Math.random() * h * 0.2;
                points.push({ x: dx, y: dy });
            }
        }

        // Sort by x
        points.sort((a, b) => a.x - b.x);

        // Build path: start at bottom-left, go up along left, across top with lobes, down right, back along bottom
        let d = `M0,${h}`;

        // Left side rise
        const leftH = h * (0.4 + Math.random() * 0.3);
        d += ` C${w * 0.02},${h * 0.7} ${w * 0.03},${leftH + h * 0.1} ${w * 0.05},${leftH}`;

        // Across the top with jagged lobes using cubic beziers
        let prevX = w * 0.05;
        let prevY = leftH;
        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            const midX = (prevX + p.x) / 2;
            // Control points create jagged, spiky shapes
            const cp1x = prevX + (p.x - prevX) * 0.3;
            const cp1y = prevY + (Math.random() - 0.5) * h * 0.3;
            const cp2x = prevX + (p.x - prevX) * 0.7;
            const cp2y = p.y + (Math.random() - 0.5) * h * 0.2;
            d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p.x},${p.y}`;
            prevX = p.x;
            prevY = p.y;
        }

        // Right side descent
        const rightH = h * (0.4 + Math.random() * 0.3);
        d += ` C${w * 0.97},${rightH + h * 0.1} ${w * 0.98},${h * 0.7} ${w},${h}`;

        d += ' Z';
        return d;
    }

    for (let i = 0; i < numBushes; i++) {
        let pos;
        let attempts = 0;
        do {
            pos = Math.floor(Math.random() * containerWidth);
            attempts++;
        } while (positions.some(p => Math.abs(p - pos) < minSpacing) && attempts < 50);

        if (attempts >= 50) continue;
        positions.push(pos);

        const bushW = 20 + Math.random() * 30;
        const bushH = bushW * (0.4 + Math.random() * 0.3);
        const color = bushColors[Math.floor(Math.random() * bushColors.length)];
        const flip = Math.random() > 0.5;

        const vbW = 200;
        const vbH = 120;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'bush');
        svg.setAttribute('width', bushW);
        svg.setAttribute('height', bushH);
        svg.setAttribute('viewBox', `0 0 ${vbW} ${vbH}`);
        svg.setAttribute('preserveAspectRatio', 'none');
        svg.style.left = pos + 'px';

        // Main bush silhouette
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', generateBushPath(vbW, vbH));
        path.setAttribute('fill', color);
        svg.appendChild(path);

        // Second overlapping layer for more depth (slightly lighter/darker)
        const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path2.setAttribute('d', generateBushPath(vbW, vbH));
        path2.setAttribute('fill', color);
        path2.setAttribute('opacity', '0.7');
        svg.appendChild(path2);

        // Leaf texture - small circles scattered over the bush
        const numLeaves = 4 + Math.floor(Math.random() * 6);
        for (let j = 0; j < numLeaves; j++) {
            const lx = vbW * (0.1 + Math.random() * 0.8);
            const ly = vbH * (0.15 + Math.random() * 0.5);
            const lr = 3 + Math.random() * 5;
            const leafColor = leafColors[Math.floor(Math.random() * leafColors.length)];
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', lx);
            circle.setAttribute('cy', ly);
            circle.setAttribute('r', lr);
            circle.setAttribute('fill', leafColor);
            svg.appendChild(circle);
        }

        // Random horizontal flip for variety
        if (flip) {
            svg.style.transform = 'scaleX(-1)';
        }

        // Randomly assign squirrels to ~40% of bushes
        if (Math.random() < 0.4) {
            svg.classList.add('has-squirrel');
            if (nutCursorValue) svg.style.cursor = nutCursorValue;
        }

        // Click handler: spawn a squirrel
        svg.addEventListener('click', () => spawnSquirrel(svg));

        container.appendChild(svg);
    }
}

// ==================== Squirrel ====================

// Create a scaled-down nut cursor from the 100x100 icon
let nutCursorValue = null;

function initNutCursor() {
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 32, 32);
        const dataUrl = canvas.toDataURL('image/png');
        nutCursorValue = `url(${dataUrl}) 16 16, pointer`;
        applyNutCursors();
    };
    img.src = 'icons8-nuss-100.png';
}

function applyNutCursors() {
    if (!nutCursorValue) return;
    document.querySelectorAll('.bush.has-squirrel').forEach(bush => {
        bush.style.cursor = nutCursorValue;
    });
}

function spawnSquirrel(clickedBush) {
    // Only spawn from bushes that have a squirrel
    if (!clickedBush.classList.contains('has-squirrel')) return;

    const bushesContainer = clickedBush.parentElement;
    if (!bushesContainer) return;

    // Prevent spawning multiple squirrels at once from same bush
    if (clickedBush.dataset.squirrelActive) return;
    clickedBush.dataset.squirrelActive = '1';

    // Remove squirrel from this bush
    clickedBush.classList.remove('has-squirrel');
    clickedBush.style.cursor = '';

    const allBushes = Array.from(bushesContainer.querySelectorAll('.bush'));
    const clickedX = parseFloat(clickedBush.style.left);
    const clickedW = parseFloat(clickedBush.getAttribute('width'));

    // Find the nearest bigger bush
    let target = null;
    let targetDist = Infinity;
    allBushes.forEach(bush => {
        if (bush === clickedBush) return;
        const bw = parseFloat(bush.getAttribute('width'));
        if (bw > clickedW) {
            const bx = parseFloat(bush.style.left);
            const dist = Math.abs(bx - clickedX);
            if (dist < targetDist) {
                targetDist = dist;
                target = bush;
            }
        }
    });

    const startX = clickedX;
    let endX;
    if (target) {
        endX = parseFloat(target.style.left);
    } else {
        // No bigger bush: run off-screen (random direction)
        endX = Math.random() > 0.5 ? window.innerWidth + 60 : -60;
    }

    const goRight = endX > startX;
    const distance = Math.abs(endX - startX);
    const speed = 120; // px per second
    const duration = (distance / speed) * 1000;

    // Spawn squirrel in header (not in bushes container) to avoid overflow clipping
    const header = clickedBush.closest('header');
    const squirrel = document.createElement('div');
    squirrel.className = 'squirrel';
    if (!goRight) squirrel.classList.add('face-left');
    squirrel.style.left = startX + 'px';
    header.appendChild(squirrel);

    // Animate to target
    const anim = squirrel.animate([
        { left: startX + 'px' },
        { left: endX + 'px' }
    ], {
        duration: duration,
        easing: 'ease-in-out',
        fill: 'forwards'
    });

    anim.onfinish = () => {
        squirrel.remove();
        delete clickedBush.dataset.squirrelActive;
        // Squirrel hides in the target bush
        if (target) {
            target.classList.add('has-squirrel');
            if (nutCursorValue) target.style.cursor = nutCursorValue;
        }
    };
}

// ==================== Initialization ====================

async function initApp() {
    // Initialize translations
    await initTranslations();

    // Initialize language
    currentLang = detectLanguage();
    document.documentElement.lang = currentLang;

    // Load train config - try JSON file first, fall back to localStorage
    function applyTrainConfig(cfg) {
        const root = document.documentElement.style;
        if (cfg.hlTop !== undefined) root.setProperty('--headlight-top', cfg.hlTop + 'px');
        if (cfg.hlRight !== undefined) root.setProperty('--headlight-right', cfg.hlRight + 'px');
        if (cfg.hl2Top !== undefined) root.setProperty('--headlight2-top', cfg.hl2Top + 'px');
        if (cfg.hl2Right !== undefined) root.setProperty('--headlight2-right', cfg.hl2Right + 'px');
        if (cfg.coneSpread !== undefined) root.setProperty('--cone-spread', cfg.coneSpread + 'px');
        if (cfg.coneOpacity !== undefined) root.setProperty('--cone-opacity', cfg.coneOpacity / 100);
        if (cfg.wlTop !== undefined) root.setProperty('--wagon-light-top', cfg.wlTop + 'px');
        if (cfg.wlLeft !== undefined) root.setProperty('--wagon-light-left', cfg.wlLeft + 'px');
        if (cfg.winTop !== undefined) root.setProperty('--window-top', cfg.winTop + 'px');
        if (cfg.winWidth !== undefined) root.setProperty('--window-width', cfg.winWidth + 'px');
        if (cfg.winHeight !== undefined) root.setProperty('--window-height', cfg.winHeight + 'px');
        if (cfg.winLeft !== undefined) root.setProperty('--window-left', cfg.winLeft + 'px');
        if (cfg.wagSpacing !== undefined) root.setProperty('--wagon-spacing', cfg.wagSpacing + 'px');
        if (cfg.winMaskX !== undefined) root.setProperty('--window-mask-x', cfg.winMaskX + 'px');
        if (cfg.winMaskY !== undefined) root.setProperty('--window-mask-y', cfg.winMaskY + 'px');
        if (cfg.winMaskScale !== undefined) root.setProperty('--window-mask-scale', cfg.winMaskScale / 100);
        if (cfg.fireMaskX !== undefined) root.setProperty('--fire-mask-x', cfg.fireMaskX + 'px');
        if (cfg.fireMaskY !== undefined) root.setProperty('--fire-mask-y', cfg.fireMaskY + 'px');
        if (cfg.fireMaskScale !== undefined) root.setProperty('--fire-mask-scale', cfg.fireMaskScale / 100);
    }
    try {
        fetch('train-config.json').then(r => r.ok ? r.json() : Promise.reject()).then(applyTrainConfig)
            .catch(() => {
                const stored = localStorage.getItem(TRAIN_CONFIG_KEY);
                if (stored) applyTrainConfig(JSON.parse(stored));
            });
    } catch (e) {}

    // Load nut cursor for squirrel bushes
    initNutCursor();

    // Generate random trees and clouds for loading screen
    generateRandomTrees('trees');
    generateRandomClouds('loading-clouds');

    const loadingScreen = document.getElementById('loading-screen');
    const loadingText = document.querySelector('.loading-text');
    const app = document.getElementById('app');

    try {
        // Load sql.js
        loadingText.textContent = t('loadingSqlite');
        SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
        });

        loadingText.textContent = t('loadingReady');

        // Short delay for smooth transition
        await new Promise(resolve => setTimeout(resolve, 300));

        // Hide loading screen
        loadingScreen.classList.add('fade-out');
        app.classList.remove('hidden');

        // Apply translations and setup language switcher
        updateAllTranslations();
        setupLanguageSwitcher();

        // Generate mountains, trees, bushes and clouds for header and set train speed (after app is visible so we can measure width)
        setTimeout(() => {
            generateMountains('header-mountains');
            generateRandomTrees('header-trees');
            generateRandomBushes('header-bushes');
            generateRandomClouds('header-clouds');
            generateBirds('header-birds');
            initBirdDodge();
            startWindowFlicker();
            setHeaderTrainSpeed();
        }, 10);

        // Remove loading screen after animation
        setTimeout(() => loadingScreen.remove(), 500);

        // Initialize the main app
        initializeMainApp();

    } catch (error) {
        console.error('Error loading:', error);
        loadingText.textContent = t('loadingError');
        loadingText.style.color = '#e74c3c';
    }
}

function setupLanguageSwitcher() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setLanguage(btn.dataset.lang);
        });
    });
    updateLanguageSwitcher();
}

// Load sql.js dynamically
function initSqlJs(config) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js';
        script.onload = async () => {
            try {
                const SQL = await window.initSqlJs(config);
                resolve(SQL);
            } catch (e) {
                reject(e);
            }
        };
        script.onerror = () => reject(new Error(t('sqlLoadError')));
        document.head.appendChild(script);
    });
}

// ==================== LocalStorage Functions ====================

function loadSettings() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
        }
    } catch (e) {
        console.warn('Fehler beim Laden der Einstellungen:', e);
    }
    return DEFAULT_SETTINGS;
}

function saveSettings(settings) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
        console.warn('Fehler beim Speichern der Einstellungen:', e);
    }
}

function getLokIdentifier(lok) {
    return `${lok.name}|${lok.address || ''}`;
}

function loadPrintedLoks() {
    try {
        const stored = localStorage.getItem(PRINTED_LOKS_KEY);
        if (stored) {
            return new Set(JSON.parse(stored));
        }
    } catch (e) {
        console.warn('Fehler beim Laden der gedruckten Loks:', e);
    }
    return new Set();
}

function savePrintedLoks(printedSet) {
    try {
        localStorage.setItem(PRINTED_LOKS_KEY, JSON.stringify([...printedSet]));
    } catch (e) {
        console.warn('Fehler beim Speichern der gedruckten Loks:', e);
    }
}

function markLoksAsPrinted(loks) {
    const printed = loadPrintedLoks();
    loks.forEach(lok => printed.add(getLokIdentifier(lok)));
    savePrintedLoks(printed);
}

// ==================== Settings UI ====================

function applySettingsToForm(settings) {
    const elements = {
        'card-width': settings.cardWidth,
        'card-height': settings.cardHeight,
        'circle-size': settings.circleSize,
        'rotated-padding': settings.rotatedPadding,
        'font-size': settings.fontSize
    };

    for (const [id, value] of Object.entries(elements)) {
        const input = document.getElementById(id);
        const valSpan = document.getElementById(`${id}-val`);
        if (input) input.value = value;
        if (valSpan) valSpan.textContent = value;
    }

    const addressStyle = document.getElementById('address-style-select');
    const circlePosition = document.querySelector('select[name="circlePosition"]');
    const format = document.querySelector('select[name="format"]');
    const bgColor = document.getElementById('bg-color');
    const textColor = document.getElementById('text-color');

    if (addressStyle) addressStyle.value = settings.addressStyle;
    if (circlePosition) circlePosition.value = settings.circlePosition;
    if (format) format.value = settings.format;
    if (bgColor) bgColor.value = settings.backgroundColor;
    if (textColor) textColor.value = settings.textColor;
}

function getCurrentConfig() {
    const form = document.getElementById('lok-form');
    const formData = new FormData(form);
    return {
        cardWidth: parseFloat(formData.get('cardWidth')),
        cardHeight: parseFloat(formData.get('cardHeight')),
        addressStyle: formData.get('addressStyle'),
        rotatedPadding: parseInt(formData.get('rotatedPadding')),
        circleSize: parseInt(formData.get('circleSize')),
        circlePosition: formData.get('circlePosition'),
        backgroundColor: formData.get('backgroundColor'),
        textColor: formData.get('textColor'),
        fontSize: parseInt(formData.get('fontSize')),
        format: formData.get('format')
    };
}

// ==================== Backup Parsers ====================

// Registry of backup parsers - extensible for other apps
const backupParsers = {
    z21: {
        name: 'Z21 App',
        detect: async (zip) => {
            for (const path of Object.keys(zip.files)) {
                if (path.endsWith('Loco.sqlite')) return true;
            }
            return false;
        },
        parse: async (zip) => {
            let sqliteFile = null;
            for (const [path, zipEntry] of Object.entries(zip.files)) {
                if (path.endsWith('Loco.sqlite')) {
                    sqliteFile = await zipEntry.async('uint8array');
                    break;
                }
            }

            if (!sqliteFile) {
                throw new Error(t('locoNotFound'));
            }

            db = new SQL.Database(sqliteFile);

            imageFiles = {};
            for (const [path, zipEntry] of Object.entries(zip.files)) {
                if (!zipEntry.dir && (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg'))) {
                    const fileName = path.split('/').pop();
                    const blob = await zipEntry.async('blob');
                    imageFiles[fileName] = URL.createObjectURL(blob);
                }
            }

            return true;
        },
        getLoks: () => {
            const stmt = db.prepare('SELECT rowid as id, name, address, image_name as imageFile FROM vehicles ORDER BY CAST(address AS INTEGER) ASC');
            const loks = [];
            while (stmt.step()) {
                loks.push(stmt.getAsObject());
            }
            stmt.free();
            return loks;
        }
    }

    // Future parsers can be added here:
    // trainController: {
    //     name: 'TrainController',
    //     detect: async (zip) => { /* check for TC-specific files */ },
    //     parse: async (zip) => { /* parse TC backup */ },
    //     getLoks: () => { /* return loks in standard format */ }
    // },
    // ecos: { ... },
    // rocomotion: { ... },
};

let currentParser = null;

// ==================== File Processing ====================

async function processBackupFile(file) {
    const zip = await JSZip.loadAsync(file);

    // Auto-detect backup format
    for (const [parserId, parser] of Object.entries(backupParsers)) {
        if (await parser.detect(zip)) {
            currentParser = parser;
            console.log(`Detected backup format: ${parser.name}`);
            await parser.parse(zip);
            return parser.name;
        }
    }

    throw new Error(t('noValidFormat'));
}

function getLoksFromDatabase() {
    if (!currentParser) {
        throw new Error('No parser active');
    }
    return currentParser.getLoks();
}

// ==================== Card Rendering ====================

async function createLokCard(lok, config) {
    const DPI = 300;
    const { cardWidth, cardHeight, addressStyle, backgroundColor, textColor, fontSize } = config;
    const widthPx = (cardWidth / 2.54) * DPI;
    const heightPx = (cardHeight / 2.54) * DPI;

    const canvas = document.createElement('canvas');
    canvas.width = widthPx;
    canvas.height = heightPx;
    const ctx = canvas.getContext('2d');

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, widthPx, heightPx);

    let imageWidth = widthPx;
    let imageX = 0;
    const barWidth = widthPx * 0.2;
    const hasRotatedBar = addressStyle === 'rotated-left' || addressStyle === 'rotated-right';

    if (hasRotatedBar) {
        imageWidth -= barWidth;
        if (addressStyle === 'rotated-left') imageX = barWidth;
    }

    // Draw locomotive image
    const imageUrl = imageFiles[lok.imageFile];
    if (imageUrl) {
        try {
            const image = await loadImage(imageUrl);
            const scale = Math.min(imageWidth / image.width, heightPx / image.height);
            const scaledWidth = image.width * scale;
            const scaledHeight = image.height * scale;
            const dx = imageX + (imageWidth - scaledWidth) / 2;
            const dy = (heightPx - scaledHeight) / 2;
            ctx.drawImage(image, dx, dy, scaledWidth, scaledHeight);
        } catch (e) {
            console.warn('Bild konnte nicht geladen werden:', lok.imageFile);
            ctx.fillStyle = '#e0e0e0';
            ctx.fillRect(imageX, 0, imageWidth, heightPx);
        }
    } else {
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(imageX, 0, imageWidth, heightPx);
    }

    const address = lok.address || '??';
    const addressText = (currentLang === 'la' && typeof address === 'number') ? toRoman(address) : String(address);

    if (addressStyle === 'circle') {
        const { circleSize, circlePosition } = config;
        const circleRadius = (circleSize / 25.4) * DPI / 2;
        const margin = DPI * 0.05;
        let circleX, circleY;

        if (circlePosition === 'top-right') { circleX = widthPx - circleRadius - margin; circleY = circleRadius + margin; }
        else if (circlePosition === 'top-left') { circleX = circleRadius + margin; circleY = circleRadius + margin; }
        else if (circlePosition === 'bottom-right') { circleX = widthPx - circleRadius - margin; circleY = heightPx - circleRadius - margin; }
        else { circleX = circleRadius + margin; circleY = heightPx - circleRadius - margin; }

        ctx.fillStyle = backgroundColor || '#d32f2f';
        ctx.beginPath();
        ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = textColor || '#ffffff';
        ctx.font = `bold ${fontSize || 40}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(addressText, circleX, circleY);

    } else if (hasRotatedBar) {
        const barX = (addressStyle === 'rotated-left') ? 0 : widthPx - barWidth;
        ctx.fillStyle = backgroundColor || '#d32f2f';
        ctx.fillRect(barX, 0, barWidth, heightPx);

        ctx.save();
        ctx.translate(barX + barWidth / 2, heightPx / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = textColor || '#ffffff';
        ctx.font = `bold ${fontSize || 40}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(addressText, 0, 0);
        ctx.restore();
    }

    return canvas;
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

// ==================== Preview ====================

async function updatePreview() {
    const previewCanvas = document.getElementById('preview-canvas');
    const previewLoader = document.getElementById('preview-loader');

    previewLoader.classList.remove('hidden');
    previewCanvas.classList.add('hidden');

    const firstSelectedLok = document.querySelector('input[name="selected-loks"]:checked');
    const lok = firstSelectedLok
        ? allLoks.find(l => l.id == firstSelectedLok.value)
        : (allLoks.length > 0 ? allLoks[0] : null);

    if (!lok) {
        previewLoader.textContent = t('noLokPreview');
        return;
    }

    previewLoader.textContent = t('loadingPreview');

    try {
        const cardCanvas = await createLokCard(lok, getCurrentConfig());

        // Scale down for preview
        const maxHeight = 150;
        const scale = maxHeight / cardCanvas.height;
        previewCanvas.width = cardCanvas.width * scale;
        previewCanvas.height = maxHeight;

        const ctx = previewCanvas.getContext('2d');
        ctx.drawImage(cardCanvas, 0, 0, previewCanvas.width, previewCanvas.height);

        previewCanvas.classList.remove('hidden');
        previewLoader.classList.add('hidden');
    } catch (error) {
        console.error('Preview error:', error);
        previewLoader.textContent = t('previewError');
    }
}

// ==================== PDF Generation ====================

async function generatePDF(selectedLoks, config) {
    const { jsPDF } = window.jspdf;

    const cardWidthCm = config.cardWidth;
    const cardHeightCm = config.cardHeight;
    const margin = 10; // mm
    const gap = 2; // mm

    // Page sizes in mm
    const SIZES = {
        a4: { width: 210, height: 297 },
        a3: { width: 297, height: 420 },
        '10x15': { width: 100, height: 150 }
    };

    const pageSize = SIZES[config.format] || SIZES.a4;
    const cardWidthMm = cardWidthCm * 10;
    const cardHeightMm = cardHeightCm * 10;

    // Determine best orientation
    const pCardsW = Math.floor((pageSize.width - 2 * margin + gap) / (cardWidthMm + gap));
    const pCardsH = Math.floor((pageSize.height - 2 * margin + gap) / (cardHeightMm + gap));
    const lCardsW = Math.floor((pageSize.height - 2 * margin + gap) / (cardWidthMm + gap));
    const lCardsH = Math.floor((pageSize.width - 2 * margin + gap) / (cardHeightMm + gap));

    const portrait = pCardsW * pCardsH;
    const landscape = lCardsW * lCardsH;
    const orientation = landscape > portrait ? 'landscape' : 'portrait';

    const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: config.format === '10x15' ? [100, 150] : config.format
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    let x = margin;
    let y = margin;

    for (let i = 0; i < selectedLoks.length; i++) {
        const lok = selectedLoks[i];

        // Check if we need a new page
        if (y + cardHeightMm > pageHeight - margin) {
            pdf.addPage();
            x = margin;
            y = margin;
        }

        // Create card canvas
        const cardCanvas = await createLokCard(lok, config);

        // Convert to image data
        const imgData = cardCanvas.toDataURL('image/png');

        // Add to PDF
        pdf.addImage(imgData, 'PNG', x, y, cardWidthMm, cardHeightMm);

        // Draw border
        pdf.setDrawColor(0);
        pdf.setLineWidth(0.2);
        pdf.rect(x, y, cardWidthMm, cardHeightMm);

        // Move to next position
        x += cardWidthMm + gap;
        if (x + cardWidthMm > pageWidth - margin) {
            x = margin;
            y += cardHeightMm + gap;
        }
    }

    // Save PDF
    pdf.save('lok-karten.pdf');
}

// ==================== Main App Initialization ====================

function initializeMainApp() {
    const uploadSection = document.getElementById('upload-section');
    const uploadInput = document.getElementById('z21-upload');
    const dropzone = document.getElementById('dropzone');
    const uploadStatus = document.getElementById('upload-status');
    const mainAppContent = document.getElementById('main-app-content');
    const resetBtn = document.getElementById('reset-upload-btn');

    // Process file function
    async function handleFile(file) {
        if (!file) return;

        // Check file extension
        const ext = file.name.toLowerCase().split('.').pop();
        if (ext !== 'z21' && ext !== 'zip') {
            uploadStatus.textContent = t('invalidFileType');
            uploadStatus.classList.add('error');
            return;
        }

        uploadStatus.classList.remove('error');
        uploadStatus.textContent = t('processingBackup');
        dropzone.classList.add('processing');

        try {
            await processBackupFile(file);
            allLoks = getLoksFromDatabase();

            uploadSection.classList.add('hidden');
            mainAppContent.classList.remove('hidden');
            resetBtn.classList.remove('hidden');

            initializeCardGenerator();

        } catch (error) {
            console.error('Error:', error);
            uploadStatus.textContent = `${t('errorPrefix')} ${error.message}`;
            uploadStatus.classList.add('error');
            dropzone.classList.remove('processing');
        }
    }

    // Click to upload
    dropzone.addEventListener('click', () => {
        uploadInput.click();
    });

    uploadInput.addEventListener('change', (e) => {
        handleFile(e.target.files[0]);
    });

    // Drag & Drop
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-over');
    });

    dropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-over');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        handleFile(file);
    });

    // Prevent default drag behavior on window
    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', (e) => e.preventDefault());

    // Reset button
    resetBtn.addEventListener('click', () => {
        location.reload();
    });
}

function initializeCardGenerator() {
    const form = document.getElementById('lok-form');
    const lokContainer = document.getElementById('lok-selection-container');
    const generateBtn = document.getElementById('generate-btn');
    const configInputs = document.querySelectorAll('.config-input');
    const valueSpans = {
        'card-width': document.getElementById('card-width-val'),
        'card-height': document.getElementById('card-height-val'),
        'circle-size': document.getElementById('circle-size-val'),
        'rotated-padding': document.getElementById('rotated-padding-val'),
        'font-size': document.getElementById('font-size-val'),
    };
    const selectAllBtn = document.getElementById('select-all-btn');
    const deselectAllBtn = document.getElementById('deselect-all-btn');
    const selectUnprintedBtn = document.getElementById('select-unprinted-btn');
    const addressStyleSelect = document.getElementById('address-style-select');
    const circleSettings = document.getElementById('circle-settings');
    const rotatedSettings = document.getElementById('rotated-settings');

    let previewTimeout;

    // Load and apply saved settings
    const savedSettings = loadSettings();
    applySettingsToForm(savedSettings);

    const toggleAdvancedSettings = () => {
        const style = addressStyleSelect.value;
        circleSettings.classList.toggle('hidden', style !== 'circle');
        rotatedSettings.classList.toggle('hidden', style === 'circle');
    };

    // Render lok cards
    lokContainer.innerHTML = '';
    const printedLoks = loadPrintedLoks();

    allLoks.forEach(lok => {
        const lokIdentifier = getLokIdentifier(lok);
        const isPrinted = printedLoks.has(lokIdentifier);
        const isNew = !isPrinted;

        const card = document.createElement('label');
        card.className = 'lok-card' + (isPrinted ? ' printed' : '');

        const imageUrl = imageFiles[lok.imageFile] || '';

        const noImageText = encodeURIComponent(t('noImage'));
        card.innerHTML = `
            <input type="checkbox" name="selected-loks" value="${lok.id}"
                   data-lok-name="${lok.name}" data-lok-address="${lok.address || ''}"
                   ${isNew ? 'checked' : ''}>
            <img src="${imageUrl}" alt="${lok.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22140%22><rect fill=%22%23e0e0e0%22 width=%22200%22 height=%22140%22/><text x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22>${noImageText}</text></svg>'">
            <div class="info">
               <p class="name">${lok.name}${isPrinted ? ' <span class="printed-badge">✓</span>' : ''}</p>
               <p class="address">${t('address')} ${lok.address || 'N/A'}</p>
            </div>
        `;

        card.querySelector('input[type="checkbox"]').addEventListener('change', () => {
            clearTimeout(previewTimeout);
            previewTimeout = setTimeout(updatePreview, 250);
        });

        lokContainer.appendChild(card);
    });

    toggleAdvancedSettings();
    updatePreview();

    // Config input handlers
    configInputs.forEach(input => {
        input.addEventListener('input', () => {
            if (valueSpans[input.id]) valueSpans[input.id].textContent = input.value;
            if (input.id === 'address-style-select') toggleAdvancedSettings();
            saveSettings(getCurrentConfig());
            clearTimeout(previewTimeout);
            previewTimeout = setTimeout(updatePreview, 250);
        });
    });

    // Selection buttons
    selectAllBtn.addEventListener('click', () => {
        document.querySelectorAll('input[name="selected-loks"]').forEach(cb => cb.checked = true);
        updatePreview();
    });

    deselectAllBtn.addEventListener('click', () => {
        document.querySelectorAll('input[name="selected-loks"]').forEach(cb => cb.checked = false);
        updatePreview();
    });

    selectUnprintedBtn.addEventListener('click', () => {
        const printed = loadPrintedLoks();
        document.querySelectorAll('input[name="selected-loks"]').forEach(cb => {
            const identifier = `${cb.dataset.lokName}|${cb.dataset.lokAddress}`;
            cb.checked = !printed.has(identifier);
        });
        updatePreview();
    });

    // Form submission (PDF generation)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        generateBtn.textContent = t('generating');
        generateBtn.disabled = true;

        const selectedCheckboxes = Array.from(document.querySelectorAll('input[name="selected-loks"]:checked'));
        const selectedIds = selectedCheckboxes.map(cb => parseInt(cb.value));

        if (selectedIds.length === 0) {
            alert(t('selectAtLeastOne'));
            generateBtn.textContent = t('generatePdf');
            generateBtn.disabled = false;
            return;
        }

        const selectedLoks = allLoks.filter(lok => selectedIds.includes(lok.id));

        try {
            await generatePDF(selectedLoks, getCurrentConfig());

            // Mark printed loks
            markLoksAsPrinted(selectedLoks);

            // Update UI
            selectedCheckboxes.forEach(cb => {
                const card = cb.closest('.lok-card');
                if (card && !card.classList.contains('printed')) {
                    card.classList.add('printed');
                    const nameEl = card.querySelector('.name');
                    if (nameEl && !nameEl.querySelector('.printed-badge')) {
                        nameEl.innerHTML += ' <span class="printed-badge">✓</span>';
                    }
                }
            });

        } catch (error) {
            console.error('PDF error:', error);
            alert(t('pdfError'));
        } finally {
            generateBtn.textContent = t('generatePdf');
            generateBtn.disabled = false;
        }
    });
}

// ==================== Start App ====================
document.addEventListener('DOMContentLoaded', initApp);
