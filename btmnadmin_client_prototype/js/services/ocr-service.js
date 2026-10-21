/**
 * BTMN Admin - OCR Service
 * Felelősség: PDF és kép szövegkinyerés (Tesseract + PDF.js), valamint szakértői vélemény parser
 */
(function (root, factory) {
  const exported = factory();
  if (typeof define === 'function' && define.amd) {
    define([], () => exported);
  }
  if (typeof module === 'object' && module && module.exports) {
    module.exports = exported;
  }
  if (root) {
    root.OcrService = exported;
  }
}(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this), function () {
  'use strict';

  // PDF.js worker konfiguráció
  function ensurePdfWorkerConfigured() {
    if (typeof window !== 'undefined' && window.pdfjsLib && !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'vendor/pdf.worker.min.js';
    }
  }

  function cleanString(str) {
    if (!str) return '';
    return String(str)
      .replace(/\s+/g, ' ')
      .replace(/^[.,;:\-–—\s]+/, '')
      .replace(/(?<!\d)\.+|[^\wáéíóöőúüű\d.)]+$/gi, '')
      .trim();
  }

  // Minták a gyermek alapadatainak kinyeréséhez (prioritási sorrendben)
  const CHILD_EXTRACTION_RULES = [
    {
      key: 'forgalmiSzam',
      patterns: [
        /(?:forgalmi\s*sz[aá]m(?:a)?|forg\.\s*sz[aá]m)\s*[:]\s*([^\r\n]+)/i,
        /Forgalmi szám:\s*(.+)/im
      ]
    },
    {
      key: 'iktatoszam',
      patterns: [
        /(?:iktat[oó]sz[aá]m(?:a)?|ikt\.\s*sz(?:[aá]m)?)\s*[:]\s*([^\r\n]+)/i,
        /Iktatószám:\s*(.+)/im
      ]
    },
    {
      key: 'nev',
      patterns: [
        /(?:(?:gyermek|tanul[oó])\s+neve|n[eé]v)\s*[:]\s*([^\r\n]+)/i,
        /Név:\s*(.+)/i
      ]
    },
    {
      key: 'anyjaNeve',
      patterns: [
        /(?:anyja\s*(?:le[aá]nykori\s*)?neve|anyja\s*neve?)\s*[:]\s*([^\r\n]+)/i,
        /Anyja.*:\s*(.+)/i
      ]
    },
    {
      key: 'szuletesiHelyEsIdo',
      patterns: [
        /(?:sz[uü]let[eé]si\s*hely[e]?\s*(?:[eé]s|,)\s*ideje|sz[uü]let[eé]si\s*hely,\s*id[oő]|sz[uü]let[eé]si\s*id[oő]\s*[eé]s\s*hely|sz[uü]let[eé]si\s*hely[e]?\s*[:]?\s*[^\r\n,]+[,\s]+ideje)\s*[:]\s*([^\r\n]+)/i,
        /Születési.*:\s*(.+)/i
      ]
    },
    {
      key: 'fejlesztesFormaja',
      patterns: [
        /(?:fejleszt[eé]s\s*form[aá]ja)\s*[:]?\s*([^\r\n]+)/i,
        /\b(egy[eé]ni|csoportos)\b/i
      ]
    },
    {
      key: 'hetiOraszam',
      patterns: [
        /(?:heti\s*[oó]rasz[aá]m|heti\s*id[oő]keret)\s*[:]?\s*([^\r\n]+)/i,
        /\b(heti\s*\d+\s*(?:[oó]ra)?)\b/i,
        /\b(\d+\s*[oó]ra\s*[/]\s*h[eé]t)\b/i
      ]
    },
    {
      key: 'felulvizsgalatIdeje',
      patterns: [
        /(?:fel[uü]lvizsg[aá]lat(?:ok)?|kontroll(?:vizsg[aá]lat)?)\s*(?:ideje)?\s*[:]?\s*([^\r\n]+)/i
      ]
    }
  ];

  // Interaktív kamera beolvasási mezők és regex szabályok sorrendben
  const CAMERA_SCAN_FIELDS = [
    {
      key: 'nev',
      label: 'Gyermek neve',
      patterns: [
        /(?:(?:gyermek|tanul[oó])\s+neve|n[eé]v)\s*[:]\s*([^\r\n]+)/i,
        /Név:\s*(.+)/i
      ]
    },
    {
      key: 'szuletesiHelyEsIdo',
      label: 'Születési helye és ideje',
      patterns: [
        /(?:sz[uü]let[eé]si\s*hely[e]?\s*(?:[eé]s|,)\s*ideje|sz[uü]let[eé]si\s*hely,\s*id[oő]|sz[uü]let[eé]si\s*id[oő]\s*[eé]s\s*hely|sz[uü]let[eé]si\s*hely[e]?\s*[:]?\s*[^\r\n,]+[,\s]+ideje)\s*[:]\s*([^\r\n]+)/i,
        /Születési.*:\s*(.+)/i
      ]
    },
    {
      key: 'anyjaNeve',
      label: 'Anyja neve',
      patterns: [
        /(?:anyja\s*(?:le[aá]nykori\s*)?neve|anyja\s*neve?)\s*[:]\s*([^\r\n]+)/i,
        /Anyja.*:\s*(.+)/i
      ]
    },
    {
      key: 'forgalmiSzam',
      label: 'Forgalmi szám',
      patterns: [
        /(?:forgalmi\s*sz[aá]m(?:a)?|forg\.\s*sz[aá]m)\s*[:]\s*([^\r\n]+)/i,
        /Forgalmi szám:\s*(.+)/im
      ]
    },
    {
      key: 'iktatoszam',
      label: 'Iktatószám',
      patterns: [
        /(?:iktat[oó]sz[aá]m(?:a)?|ikt\.\s*sz(?:[aá]m)?)\s*[:]\s*([^\r\n]+)/i,
        /Iktatószám:\s*(.+)/im
      ]
    },
    {
      key: 'fejlesztesFormaja',
      label: 'Fejlesztés formája',
      customMatcher: (rawText) => {
        if (!rawText) return null;
        const match = rawText.match(/\b(egy[eé]ni|csoportos)\b/i);
        if (match) {
          return match[1].toLowerCase().startsWith('egy') ? 'egyéni' : 'csoportos';
        }
        return null;
      }
    },
    {
      key: 'hetiOraszam',
      label: 'Heti óraszám',
      customMatcher: (rawText) => {
        if (!rawText) return null;
        const match = rawText.match(/heti\s*(\d+)/i);
        if (match && match[1]) {
          return `heti ${match[1]} óra`;
        }
        return null;
      }
    },
    {
      key: 'felulvizsgalatIdeje',
      label: 'Felülvizsgálat ideje',
      customMatcher: (rawText) => {
        if (!rawText) return null;
        const match = rawText.match(/\b(20\d{2}\s*[/–-]\s*(?:20\d{2}|\d{2}))\b/);
        if (match && match[1]) {
          return match[1].replace(/\s+/g, '').replace(/[–-]/g, '/');
        }
        return null;
      }
    }
  ];

  function matchCameraField(fieldKey, rawText) {
    if (!rawText || !fieldKey) return null;
    const field = CAMERA_SCAN_FIELDS.find(f => f.key === fieldKey);
    if (!field) return null;

    if (typeof field.customMatcher === 'function') {
      return field.customMatcher(rawText);
    }

    if (field.patterns) {
      for (const pattern of field.patterns) {
        const match = rawText.match(pattern);
        if (match && match[1]) {
          const val = cleanString(match[1]);
          if (val) return val;
        }
      }
    }

    return null;
  }

  function parseGyermekAdatai(rawText) {
    const result = {
      forgalmiSzam: '',
      iktatoszam: '',
      nev: '',
      anyjaNeve: '',
      szuletesiHelyEsIdo: '',
      fejlesztesFormaja: '',
      hetiOraszam: '',
      felulvizsgalatIdeje: ''
    };

    if (!rawText) return result;

    CHILD_EXTRACTION_RULES.forEach(({ key, patterns }) => {
      for (const pattern of patterns) {
        const match = rawText.match(pattern);
        if (match && match[1]) {
          if (key === 'felulvizsgalatIdeje') {
            const yearMatch = match[1].match(/\b(20\d{2}\s*[/–-]\s*(?:20\d{2}|\d{2}))\b/);
            if (yearMatch) {
              result[key] = yearMatch[1].replace(/\s+/g, '').replace(/[–-]/g, '/');
              break;
            }
          }
          if (key === 'hetiOraszam') {
            const numMatch = match[1].match(/\b(\d+)\b/);
            if (numMatch) {
              result[key] = `heti ${numMatch[1]} óra`;
              break;
            }
          }
          if (key === 'fejlesztesFormaja') {
            const formMatch = match[1].match(/\b(egy[eé]ni|csoportos)\b/i);
            if (formMatch) {
              result[key] = formMatch[1].toLowerCase().startsWith('egy') ? 'egyéni' : 'csoportos';
              break;
            }
          }
          const val = cleanString(match[1]);
          if (val) {
            result[key] = val;
            break;
          }
        }
      }
    });

    return result;
  }

  function isPageDelimiter(line) {
    const t = (line || '').trim();
    return /^(?:={2,}|-{2,}|\*{2,}|\[|\()?\s*(?:oldal|page)\s*\d+(?:\s*(?:={2,}|-{2,}|\*{2,}|\]|\)))?$/i.test(t) ||
           /^(?:={3,}|-{3,})$/.test(t);
  }

  function isSectionHeader(line) {
    const t = (line || '').trim();
    if (t.length > 80) return false;
    return /^(?:fejleszt[eé]s(?:i|end[oő])\s*(?:ter[uü]let(?:ek)?|javaslat(?:ok)?|feladat(?:ok)?|c[eé]lok?)|javaslat(?:ok)?\s*a\s*fejleszt[eé]sre|egy[eé]ni\s*fejleszt[eé]s|fejleszt[eé]s\s*ter[uü]letei)/i.test(t);
  }

  function isSectionEnd(line) {
    const t = (line || '').trim();
    if (t.length > 80) return false;
    return /^(?:fel[uü]lvizsg[aá]lat|kontroll(?:vizsg[aá]lat)?|ell[aá]t[aá]s\s*helye|heti\s*[oó]rasz[aá]m|int[eé]zm[eé]ny(?:\s*neve)?|z[aá]rad[eé]k|d[oö]nt[eé]s|hat[aá]rozat|kelt[:\s]|al[aá][ií]r[aá]sok?|szak[eé]rt[oö]i\s*v[eé]lem[eé]ny\s*z[aá]r)/i.test(t);
  }

  function isNarrativeOrInvalid(content) {
    if (!content || content.length < 3) return true;
    if (isPageDelimiter(content)) return true;

    // Fejlécek, intézményi sorok
    if (/(?:tagint[eé]zm[eé]ny|szakszolg[aá]lat|szak[eé]rt[oö]i\s*bizotts[aá]g|forgalmi\s*sz[aá]m|iktat[oó]sz[aá]m|tanul[oó]\s*neve|sz[uü]let[eé]si)/i.test(content)) {
      return true;
    }

    // Címsor jellegű sorok önmagukban (pl. Pszichopedagógiai vizsgálat, Fejlesztési javaslat)
    if (/^(?:p?szichopedag[oó]giai\s*vizsg[aá]lat|fejleszt[eé]si\s*ter[uü]let|javaslat|orvosi\s*vizsg[aá]lat)[\s:;.]*$/i.test(content)) {
      return true;
    }

    // Összetett leíró mondatok: pont után nagybetű
    if (/\.\s+[A-ZÁÉÍÓÖŐÚÜŰ]/.test(content)) {
      return true;
    }

    // Leíró/megfigyelési kifejezések és diagnosztikai kifejezések
    const narrativeRegex = /\b(?:vizsg[aá]lat[a-z]*|sz[uü]l[oő](?:vel|je|k|jei)?|v[eé]gezz[uü]k|[eé]rkezett|mutat|mutatott|megfigyelhet[oö]|bizonytalan\s*volt|javult|k[eé]rd[eé]sek\s*sor[aá]n|[aá]lmodozik|helyzetben|probl[eé]m[aá]k\s*h[aá]tter[eé]ben|artikul[aá]ci[oó]ja|tanul[oó]\s*megjelen[eé]se)\b/i;
    if (narrativeRegex.test(content)) {
      return true;
    }

    // Vizsgálat leírása
    if (/^[^:]*vizsg[aá]lat/i.test(content)) {
      return true;
    }

    // Túl hosszú bekezdés
    if (content.length > 150) {
      return true;
    }

    return false;
  }

  function cleanBulletContent(content) {
    if (!content) return '';
    return content
      .replace(/^[—–\-\.\,\:\s•*·▪▫◦○►>~]+/, '')
      .trim();
  }

  function getMatchingScore(targetName, queryText) {
    if (typeof window !== 'undefined' && window.MatchingService && typeof window.MatchingService.scoreMatch === 'function') {
      return window.MatchingService.scoreMatch(targetName, queryText);
    }
    if (typeof globalThis !== 'undefined' && globalThis.MatchingService && typeof globalThis.MatchingService.scoreMatch === 'function') {
      return globalThis.MatchingService.scoreMatch(targetName, queryText);
    }
    return 0;
  }

  function parseTeruletSorok(rawText, teruletekList = null) {
    if (!rawText) return [];

    const lines = rawText.split(/\r?\n/);

    // 1. lépés: Szekciókeresés
    let sectionLines = [];
    let inSection = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (!inSection) {
        if (isSectionHeader(trimmed)) {
          inSection = true;
          continue;
        }
      } else {
        if (isSectionEnd(trimmed)) {
          break;
        }
        sectionLines.push(trimmed);
      }
    }

    const linesToProcess = (inSection && sectionLines.length > 0) ? sectionLines : lines;

    // 2. lépés: Felsorolásjelek felismerése és többsoros elemek összefűzése
    const bulletRegex = /^[ \t]*(?:[eE]\s*[\.\-–—]+|[eE]\s+|[oO]\s*[\.\-–—]+|[oO]\s+|[•*·▪▫◦○►>~–—\-]\s*|\d{1,2}[\.\)]\s*)(.+)$/;
    const extractedLines = [];

    for (let i = 0; i < linesToProcess.length; i++) {
      const rawLine = linesToProcess[i];
      const trimmed = rawLine.trim();
      if (!trimmed || isPageDelimiter(trimmed)) continue;

      const match = trimmed.match(bulletRegex);
      if (match && match[1]) {
        const cleaned = cleanBulletContent(match[1]);
        if (cleaned && !isNarrativeOrInvalid(cleaned)) {
          extractedLines.push(cleaned);
        }
      } else {
        // Nem új bullet: többsoros összefűzés, ha nyitott zárójel vagy kötőjel/vessző van
        if (extractedLines.length > 0) {
          const prev = extractedLines[extractedLines.length - 1];
          const openParens = (prev.match(/\(/g) || []).length - (prev.match(/\)/g) || []).length;
          const endsWithConnector = /[,–—\-]\s*$/.test(prev);

          if ((openParens > 0 || endsWithConnector) && !isSectionHeader(trimmed) && !isSectionEnd(trimmed)) {
            if (!isNarrativeOrInvalid(trimmed)) {
              extractedLines[extractedLines.length - 1] = `${prev} ${trimmed}`.replace(/\s+/g, ' ');
            }
          }
        }
      }
    }

    // 3. lépés: Szótáralapú másodlagos fallback, ha egyetlen felsorolásjel sem volt
    const availableTeruletek = teruletekList || (typeof window !== 'undefined' && window.TERULETEK_DATA ? window.TERULETEK_DATA.teruletek : null);
    if (extractedLines.length === 0 && availableTeruletek && availableTeruletek.length > 0) {
      for (let i = 0; i < linesToProcess.length; i++) {
        const line = linesToProcess[i].trim();
        if (!line || line.length < 4 || line.length > 120) continue;
        if (isPageDelimiter(line) || isSectionHeader(line) || isSectionEnd(line)) continue;
        if (isNarrativeOrInvalid(line)) continue;

        const cleanedLine = cleanBulletContent(line);
        if (isNarrativeOrInvalid(cleanedLine)) continue;

        let bestScore = 0;
        for (const t of availableTeruletek) {
          const sc = getMatchingScore(t.nev, cleanedLine);
          if (sc > bestScore) bestScore = sc;
          if (bestScore >= 60) break;
        }

        if (bestScore >= 60) {
          extractedLines.push(cleanedLine);
        }
      }
    }

    // Ismétlődések kiszűrése az eredeti sorrend megőrzésével
    return Array.from(new Set(extractedLines));
  }

  // Kép alapú területszöveg előkészítése: bullet jelek tisztítása és többsoros elemek összefűzése
  function extractCleanedImageLines(rawText) {
    if (!rawText) return [];
    const bulletRegex = /^[ \t]*(?:[eE]\s*[\.\-–—_]+|[eE]\s+|[oO]\s*[\.\-–—_]+|[oO]\s+|[•*·▪▫◦○►>~–—\-_+]+\s*|\d{1,2}[\.\)]\s*)(.+)$/;
    const lines = rawText.split(/\r?\n/);
    const mergedLines = [];

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const trimmed = (rawLine || '').trim();
      if (!trimmed || isPageDelimiter(trimmed)) continue;

      const bulletMatch = trimmed.match(bulletRegex);
      const isBullet = Boolean(bulletMatch && bulletMatch[1]);
      let cleaned = cleanBulletContent(isBullet ? bulletMatch[1] : trimmed);
      cleaned = cleaned.replace(/[\s:;.]*$/, '').trim();
      if (!cleaned) continue;

      // Ha nem új bullet jel, és az előző sor nyitott zárójellel vagy kötőjellel/vesszővel zárult -> összefűzés
      if (!isBullet && mergedLines.length > 0) {
        const prev = mergedLines[mergedLines.length - 1];
        const openParens = (prev.match(/\(/g) || []).length - (prev.match(/\)/g) || []).length;
        const endsWithConnector = /[,–—\-]\s*$/.test(prev);

        if (openParens > 0 || endsWithConnector) {
          mergedLines[mergedLines.length - 1] = `${prev} ${cleaned}`.replace(/\s+/g, ' ');
          continue;
        }
      }

      mergedLines.push(cleaned);
    }

    return mergedLines;
  }

  // Képes terület beolvasás logikája:
  // - Nem keresünk szekciókat, mert eleve a területeket fotózza be a felhasználó
  // - Megtisztítjuk és összefűzzük a sorokat
  // - Minden sort összehasonlítunk a területekkel, és csak a megadott küszöböt (alapértelmezetten 65%) elérő sorokat tartjuk meg
  function parseTeruletSorokFromImage(rawText, teruletekList = null, threshold = 65) {
    if (!rawText) return [];

    const availableTeruletek = teruletekList || (typeof window !== 'undefined' && window.TERULETEK_DATA ? window.TERULETEK_DATA.teruletek : null);
    if (!availableTeruletek || !Array.isArray(availableTeruletek) || availableTeruletek.length === 0) {
      return [];
    }

    const cleanedLines = extractCleanedImageLines(rawText);
    const passedLines = [];

    for (const line of cleanedLines) {
      if (line.length < 3) continue;

      let bestScore = 0;
      for (const t of availableTeruletek) {
        const sc = getMatchingScore(t.nev, line);
        if (sc > bestScore) {
          bestScore = sc;
        }
        if (bestScore === 100) break;
      }

      if (bestScore >= threshold) {
        passedLines.push(line);
      }
    }

    return Array.from(new Set(passedLines));
  }

  // Képpontok adaptív normalizálása és kontrasztosítása OCR-hez (árnyékok megszüntetése, papír fehérítése, szöveg élesítése)
  function processImageData(data, width, height) {
    if (!data || !width || !height) return data;

    const blockSize = 32;
    const gridW = Math.ceil(width / blockSize);
    const gridH = Math.ceil(height / blockSize);
    const blockMax = new Uint8Array(gridW * gridH);

    // 1. lépés: Helyi háttér luminancia (blokkonkénti csúcsérték) felmérése
    for (let gy = 0; gy < gridH; gy++) {
      const startY = gy * blockSize;
      const endY = Math.min(height, startY + blockSize);

      for (let gx = 0; gx < gridW; gx++) {
        const startX = gx * blockSize;
        const endX = Math.min(width, startX + blockSize);
        let maxVal = 0;

        for (let y = startY; y < endY; y += 2) {
          const rowOffset = y * width;
          for (let x = startX; x < endX; x += 2) {
            const idx = (rowOffset + x) * 4;
            const lum = (data[idx] * 77 + data[idx + 1] * 150 + data[idx + 2] * 29) >> 8;
            if (lum > maxVal) maxVal = lum;
          }
        }
        blockMax[gy * gridW + gx] = Math.max(maxVal, 40);
      }
    }

    // 2. lépés: Helyi háttér szerinti normalizálás + éles S-kontraszt
    for (let y = 0; y < height; y++) {
      const gy = Math.min(gridH - 1, (y / blockSize) | 0);
      const rowOffset = y * width;

      for (let x = 0; x < width; x++) {
        const gx = Math.min(gridW - 1, (x / blockSize) | 0);
        const bg = blockMax[gy * gridW + gx];
        const idx = (rowOffset + x) * 4;

        const lum = (data[idx] * 77 + data[idx + 1] * 150 + data[idx + 2] * 29) >> 8;
        let normalized = Math.min(255, Math.round((lum / bg) * 255));

        let finalVal;
        if (normalized >= 170) {
          finalVal = 255;
        } else if (normalized <= 90) {
          finalVal = 0;
        } else {
          finalVal = Math.round(((normalized - 90) / 80) * 255);
        }

        data[idx] = finalVal;
        data[idx + 1] = finalVal;
        data[idx + 2] = finalVal;
      }
    }

    return data;
  }

  // Canvas / Video elem előfeldolgozása az optimális OCR felbontásra és kontrasztra
  function preprocessCanvasForOcr(src, options = {}) {
    if (typeof document === 'undefined') return { canvas: src, width: 0, height: 0 };

    const maxDim = options.maxDim || 1100;
    let srcW = src.videoWidth || src.naturalWidth || src.width;
    let srcH = src.videoHeight || src.naturalHeight || src.height;

    if (!srcW || !srcH) {
      srcW = 1000;
      srcH = 750;
    }

    let w = srcW;
    let h = srcH;
    if (w > maxDim || h > maxDim) {
      if (w >= h) {
        h = Math.round((h / w) * maxDim);
        w = maxDim;
      } else {
        w = Math.round((w / h) * maxDim);
        h = maxDim;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    ctx.drawImage(src, 0, 0, w, h);
    try {
      const imgData = ctx.getImageData(0, 0, w, h);
      processImageData(imgData.data, w, h);
      ctx.putImageData(imgData, 0, 0);
    } catch (e) {
      console.warn('Nem sikerült az adaptív képszűrés futtatása:', e);
    }

    return {
      canvas,
      width: w,
      height: h
    };
  }

  async function initTesseractWorker(lang = 'hun', onProgress = null, customParams = null) {
    const { createWorker } = (typeof window !== 'undefined' && window.Tesseract) ? window.Tesseract : {};
    if (!createWorker) {
      throw new Error('A Tesseract.js könyvtár nem érhető el!');
    }

    const worker = await createWorker(lang, 1, {
      logger: m => {
        if (onProgress && m) {
          let pct = 0;
          if (m.progress !== undefined) {
            pct = Math.round(m.progress * 100);
          }
          onProgress({
            status: m.status || 'Feldolgozás...',
            progress: pct
          });
        }
      }
    });

    if (customParams && typeof worker.setParameters === 'function') {
      try {
        await worker.setParameters(customParams);
      } catch (err) {
        console.warn('Nem sikerült beállítani az egyedi Tesseract paramétereket:', err);
      }
    }

    return worker;
  }

  async function extractFromImage(file, lang = 'hun', onProgress = null) {
    let target = file;
    if (typeof document !== 'undefined' && typeof Image !== 'undefined' && typeof URL !== 'undefined') {
      try {
        const img = new Image();
        const url = (typeof file === 'string') ? file : URL.createObjectURL(file);
        await new Promise((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Kép betöltése sikertelen'));
          img.src = url;
        });
        if (typeof file !== 'string') {
          URL.revokeObjectURL(url);
        }
        const preprocessed = preprocessCanvasForOcr(img, { maxDim: 1800 });
        if (preprocessed && preprocessed.canvas) {
          target = preprocessed.canvas;
        }
      } catch (err) {
        console.warn('Kép előfeldolgozás sikertelen, eredeti fájl használata:', err);
        target = file;
      }
    }

    const worker = await initTesseractWorker(lang, onProgress, {
      user_defined_dpi: '300'
    });
    try {
      if (onProgress) onProgress({ status: 'Szövegfelismerés...', progress: 10 });
      const { data: { text } } = await worker.recognize(target);
      if (onProgress) onProgress({ status: 'Kész', progress: 100 });

      const full = text || '';
      return {
        fullText: full,
        firstPageText: full
      };
    } finally {
      await worker.terminate();
    }
  }

  async function extractFromPdf(file, lang = 'hun', onProgress = null) {
    ensurePdfWorkerConfigured();
    const pdfjs = typeof window !== 'undefined' ? window.pdfjsLib : null;
    if (!pdfjs) {
      throw new Error('A PDF.js könyvtár nem érhető el!');
    }

    const arrayBuffer = file instanceof ArrayBuffer ? file : await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;

    const worker = await initTesseractWorker(lang, null);
    let fullText = '';
    let firstPageText = '';

    try {
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;

        if (onProgress) {
          const baseProgress = Math.round(((pageNum - 1) / numPages) * 100);
          onProgress({
            status: `${pageNum}. / ${numPages} oldal felismerése...`,
            progress: baseProgress
          });
        }

        const { data: { text } } = await worker.recognize(canvas);
        const trimmed = (text || '').trim();

        if (pageNum === 1) {
          firstPageText = trimmed;
        }
        fullText += `=== Oldal ${pageNum} ===\n${trimmed}\n\n`;

        if (onProgress) {
          const endProgress = Math.round((pageNum / numPages) * 100);
          onProgress({
            status: `${pageNum}. oldal feldolgozva`,
            progress: endProgress
          });
        }
      }
    } finally {
      await worker.terminate();
    }

    return {
      fullText,
      firstPageText
    };
  }

  async function processDocument(file, options = {}) {
    const lang = options.lang || 'hun';
    const onProgress = options.onProgress || null;
    const threshold = options.threshold !== undefined ? options.threshold : 65;
    const isAreaUpload = Boolean(options.isAreaUpload || options.onlyAreas);

    const mimeType = file?.type?.toLowerCase() || '';
    const fileName = (file?.name || (typeof file === 'string' ? file : '')).toLowerCase();

    const isPdf = mimeType === 'application/pdf' || fileName.endsWith('.pdf');
    const isImage = mimeType.startsWith('image/') || /\.(png|jpe?g|webp|bmp|tiff?)$/i.test(fileName);

    if (!isPdf && !isImage) {
      throw new Error(`Nem támogatott fájltípus: ${file.name || 'Ismeretlen fájl'}`);
    }

    let extractionResult;
    if (isPdf) {
      extractionResult = await extractFromPdf(file, lang, onProgress);
    } else {
      extractionResult = await extractFromImage(file, lang, onProgress);
    }

    const childData = isAreaUpload ? null : parseGyermekAdatai(extractionResult.firstPageText || extractionResult.fullText);
    const areaLines = (!isPdf || isAreaUpload)
      ? parseTeruletSorokFromImage(extractionResult.fullText, options.teruletek, threshold)
      : parseTeruletSorok(extractionResult.fullText, options.teruletek);

    return {
      isPdf,
      isImage,
      fullText: extractionResult.fullText,
      childData,
      areaLines,
      allCleanedLines: extractCleanedImageLines(extractionResult.fullText).filter(l => l.length >= 3)
    };
  }

  // Kijelölt sorok megtisztítása és intelligens összefűzése
  function cleanAndStitchSelectedLines(lines) {
    if (!lines || !Array.isArray(lines) || lines.length === 0) return [];

    const bulletRegex = /^[ \t]*(?:[eE]\s*[\.\-–—_]+|[eE]\s+|[oO]\s*[\.\-–—_]+|[oO]\s+|[•*·▪▫◦○►>~–—\-_+]+\s*|\d{1,2}[\.\)]\s*)(.+)$/;
    const merged = [];

    for (let i = 0; i < lines.length; i++) {
      const rawLine = (lines[i] || '').trim();
      if (!rawLine || isPageDelimiter(rawLine)) continue;

      const bulletMatch = rawLine.match(bulletRegex);
      const isBullet = Boolean(bulletMatch && bulletMatch[1]);
      let cleaned = cleanBulletContent(isBullet ? bulletMatch[1] : rawLine);
      cleaned = cleaned.replace(/[\s:;.]*$/, '').trim();
      if (!cleaned || cleaned.length < 2) continue;

      // Ha nem új bullet jel, és az előző sor nyitott zárójellel vagy kötőjellel/vesszővel zárult,
      // vagy ha ez a sor kisbetűvel kezdődik -> összefűzés
      if (!isBullet && merged.length > 0) {
        const prev = merged[merged.length - 1];
        const openParens = (prev.match(/\(/g) || []).length - (prev.match(/\)/g) || []).length;
        const endsWithConnector = /[,–—\-]\s*$/.test(prev);
        const startsWithLower = /^[a-záéíóöőúüű]/.test(cleaned);

        if (openParens > 0 || endsWithConnector || startsWithLower) {
          merged[merged.length - 1] = `${prev} ${cleaned}`.replace(/\s+/g, ' ');
          continue;
        }
      }

      merged.push(cleaned);
    }

    return Array.from(new Set(merged));
  }

  // Tesseract OCR eredményéből szövegsorok és százalékos határoló dobozok (bbox) előállítása
  function parseLinesFromOcrResult(tesseractData, canvasWidth, canvasHeight) {
    if (!tesseractData || !canvasWidth || !canvasHeight) return [];
    const rawLines = tesseractData.lines || [];
    const parsed = [];

    for (let idx = 0; idx < rawLines.length; idx++) {
      const line = rawLines[idx];
      const text = (line.text || '').replace(/\s+/g, ' ').trim();
      if (!text || text.length < 2) continue;
      if (isPageDelimiter(text)) continue;

      const bbox = line.bbox || { x0: 0, y0: 0, x1: canvasWidth, y1: 20 };
      const padX = 3;
      const padY = 2;

      const x0 = Math.max(0, bbox.x0 - padX);
      const y0 = Math.max(0, bbox.y0 - padY);
      const x1 = Math.min(canvasWidth, bbox.x1 + padX);
      const y1 = Math.min(canvasHeight, bbox.y1 + padY);

      const leftPct = (x0 / canvasWidth) * 100;
      const topPct = (y0 / canvasHeight) * 100;
      const widthPct = Math.max(2, ((x1 - x0) / canvasWidth) * 100);
      const heightPct = Math.max(1.5, ((y1 - y0) / canvasHeight) * 100);

      parsed.push({
        id: 'line_' + idx + '_' + Math.random().toString(36).substring(2, 7),
        text,
        confidence: line.confidence !== undefined ? line.confidence : 80,
        active: true,
        leftPct: Math.round(leftPct * 100) / 100,
        topPct: Math.round(topPct * 100) / 100,
        widthPct: Math.round(widthPct * 100) / 100,
        heightPct: Math.round(heightPct * 100) / 100
      });
    }

    return parsed;
  }

  return {
    processDocument,
    parseGyermekAdatai,
    parseTeruletSorok,
    parseTeruletSorokFromImage,
    extractCleanedImageLines,
    cleanAndStitchSelectedLines,
    parseLinesFromOcrResult,
    cleanString,
    isSectionHeader,
    isSectionEnd,
    isNarrativeOrInvalid,
    CAMERA_SCAN_FIELDS,
    matchCameraField,
    initTesseractWorker,
    processImageData,
    preprocessCanvasForOcr
  };
}));
