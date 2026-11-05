const test = require('node:test');
const assert = require('node:assert/strict');

// Load libraries
globalThis.fuzzball = require('../vendor/fuzzball.umd.min.js');
const MatchingService = require('../js/services/matching-service.js');
const OcrService = require('../js/services/ocr-service.js');
const teruletekData = require('../js/data/teruletek.json').teruletek;

test('MatchingService - scoreMatch correctly scores exact and partial matches', () => {
  const scoreExact = MatchingService.scoreMatch('Auditív figyelem', 'Auditív figyelem');
  assert.equal(scoreExact, 100);

  const scoreWithNoise = MatchingService.scoreMatch('Vizuális figyelem', 'Vizuális figyelem fejlesztése');
  assert.ok(scoreWithNoise >= 65, `Expected score >= 65, got ${scoreWithNoise}`);

  const scoreIrrelevant = MatchingService.scoreMatch('Auditív figyelem', 'Budapest 12. kerület 2024');
  assert.ok(scoreIrrelevant < 65, `Expected score < 65, got ${scoreIrrelevant}`);
});

test('OcrService - extractCleanedImageLines cleans bullets and merges continuation lines', () => {
  const sampleOcr = `
    - Vizuális percepció (azonosságok,
    különbségek, formaállandóság)
    1. Auditív figyelem
    o- Finommotorika,
    grafomotorika
    Egyéb zajos fejlécsor
  `;

  const cleaned = OcrService.extractCleanedImageLines(sampleOcr);
  assert.ok(cleaned.some(l => l.includes('Vizuális percepció (azonosságok, különbségek, formaállandóság)')));
  assert.ok(cleaned.some(l => l.includes('Auditív figyelem')));
  assert.ok(cleaned.some(l => l.includes('Finommotorika, grafomotorika')));
});

test('OcrService - parseTeruletSorokFromImage extracts only lines meeting >= 65% threshold without section headers', () => {
  const photoText = `
    SZAKÉRTŐI JAVASLAT
    - Sorkövetés, sorolvasás gyakorlása
    - Vizuális figyelem erősítése
    • Grafomotorika fejlesztése
    12. oldal
    Tanuló neve: Minta János
    - Időbeli tájékozódás
  `;

  const results = OcrService.parseTeruletSorokFromImage(photoText, teruletekData, 65);

  // Valid areas should be included
  assert.ok(results.some(l => l.includes('Sorkövetés')), 'Should include Sorkövetés');
  assert.ok(results.some(l => l.includes('Vizuális figyelem')), 'Should include Vizuális figyelem');
  assert.ok(results.some(l => l.includes('Grafomotorika')), 'Should include Grafomotorika');
  assert.ok(results.some(l => l.includes('Időbeli tájékozódás')), 'Should include Időbeli tájékozódás');

  // Headers, page numbers, child metadata should be filtered out because they score < 65%
  assert.ok(!results.some(l => l.includes('SZAKÉRTŐI JAVASLAT')), 'Should exclude SZAKÉRTŐI JAVASLAT');
  assert.ok(!results.some(l => l.includes('12. oldal')), 'Should exclude 12. oldal');
  assert.ok(!results.some(l => l.includes('Minta János')), 'Should exclude Minta János');
});

test('OcrService - parseTeruletSorokFromImage returns empty array when no line meets threshold', () => {
  const noisyText = `
    Dokumentum fejléc
    Pecsét és aláírás
    2026. október 4.
  `;

  const results = OcrService.parseTeruletSorokFromImage(noisyText, teruletekData, 65);
  assert.equal(results.length, 0);
});

test('MatchingService - matchLines returns sorted recommendations with scores', () => {
  const lines = ['Vizuális figyelem', 'Auditív figyelem fejlesztése'];
  const matched = MatchingService.matchLines(lines, teruletekData);

  assert.equal(matched.length, 2);
  assert.ok(matched[0].recommendations[0].score >= 65);
  assert.equal(matched[0].recommendations[0].terulet.nev, 'Vizuális figyelem');
  assert.ok(matched[1].recommendations[0].score >= 65);
  assert.equal(matched[1].recommendations[0].terulet.nev, 'Auditív figyelem');
});

test('OcrService - matchCameraField correctly matches each of the 8 camera fields', () => {
  // 1. nev
  assert.equal(OcrService.matchCameraField('nev', 'Gyermek neve: Minta János'), 'Minta János');
  assert.equal(OcrService.matchCameraField('nev', 'Tanuló neve: Kovács Anna'), 'Kovács Anna');
  assert.equal(OcrService.matchCameraField('nev', 'Név: Kiss Péter'), 'Kiss Péter');
  assert.equal(OcrService.matchCameraField('nev', 'Csak egy sor cimke nélkül'), null);

  // 2. szuletesiHelyEsIdo
  assert.equal(
    OcrService.matchCameraField('szuletesiHelyEsIdo', 'Születési helye és ideje: Budapest, 2014. 05. 12.'),
    'Budapest, 2014. 05. 12.'
  );
  assert.equal(
    OcrService.matchCameraField('szuletesiHelyEsIdo', 'Születési idő és hely: Debrecen, 2015. 10. 01.'),
    'Debrecen, 2015. 10. 01.'
  );

  // 3. anyjaNeve
  assert.equal(OcrService.matchCameraField('anyjaNeve', 'Anyja neve: Kovács Éva'), 'Kovács Éva');
  assert.equal(OcrService.matchCameraField('anyjaNeve', 'Anyja leánykori neve: Szabó Katalin'), 'Szabó Katalin');

  // 4. forgalmiSzam
  assert.equal(OcrService.matchCameraField('forgalmiSzam', 'Forgalmi szám: 1234/2024'), '1234/2024');
  assert.equal(OcrService.matchCameraField('forgalmiSzam', 'Forg. szám: F-998/23'), 'F-998/23');

  // 5. iktatoszam
  assert.equal(OcrService.matchCameraField('iktatoszam', 'Iktatószám: BP-01/123/2024'), 'BP-01/123/2024');
  assert.equal(OcrService.matchCameraField('iktatoszam', 'Ikt. szám: 456-78/2024'), '456-78/2024');

  // 6. fejlesztesFormaja (case-insensitive, egyéni/csoportos)
  assert.equal(OcrService.matchCameraField('fejlesztesFormaja', 'A fejlesztés formája: egyéni'), 'egyéni');
  assert.equal(OcrService.matchCameraField('fejlesztesFormaja', 'FEJLESZTÉS: CSOPORTOS foglalkozás'), 'csoportos');
  assert.equal(OcrService.matchCameraField('fejlesztesFormaja', 'Egyéni fejlesztés javasolt'), 'egyéni');
  assert.equal(OcrService.matchCameraField('fejlesztesFormaja', 'Nincs megadva forma'), null);

  // 7. hetiOraszam ("heti {digit} óra", case-insensitive)
  assert.equal(OcrService.matchCameraField('hetiOraszam', 'heti 2 órában javasolt'), 'heti 2 óra');
  assert.equal(OcrService.matchCameraField('hetiOraszam', 'Ellátás: HETI 3 ÓRA'), 'heti 3 óra');
  assert.equal(OcrService.matchCameraField('hetiOraszam', 'Heti 1 alkalommal'), 'heti 1 óra');
  assert.equal(OcrService.matchCameraField('hetiOraszam', 'havi 4 alkalom'), null);

  // 8. felulvizsgalatIdeje ({4 digit}/{2 vagy 4 digit})
  assert.equal(OcrService.matchCameraField('felulvizsgalatIdeje', 'Felülvizsgálat ideje: 2025/2026. tanév'), '2025/2026');
  assert.equal(OcrService.matchCameraField('felulvizsgalatIdeje', 'Kontrollvizsgálat: 2025/26'), '2025/26');
  assert.equal(OcrService.matchCameraField('felulvizsgalatIdeje', 'Felülvizsgálat: 2024-2025'), '2024/2025');
  assert.equal(OcrService.matchCameraField('felulvizsgalatIdeje', 'csak sima szöveg dátum nélkül'), null);
});

test('OcrService - cleanAndStitchSelectedLines cleans bullets, joins continuation lines, and dedupes', () => {
  const inputLines = [
    '- Finommotorika és',
    'grafomotoros készségek fejlesztése, ceruzafogás',
    'korrekciója.',
    '• Auditív figyelem és emlékezet',
    '1. Vizuális észlelés (alak-háttér,',
    'formaállandóság)',
    '- Finommotorika és',
    'grafomotoros készségek fejlesztése, ceruzafogás korrekciója'
  ];

  const result = OcrService.cleanAndStitchSelectedLines(inputLines);

  assert.ok(result.some(l => l.includes('Finommotorika és grafomotoros készségek fejlesztése, ceruzafogás korrekciója')));
  assert.ok(result.some(l => l.includes('Auditív figyelem és emlékezet')));
  assert.ok(result.some(l => l.includes('Vizuális észlelés (alak-háttér, formaállandóság)')));
  // Deduplication check
  const occurrences = result.filter(l => l.includes('Finommotorika')).length;
  assert.equal(occurrences, 1);
});

test('OcrService - parseLinesFromOcrResult extracts bounding boxes as percentages and filters delimiters', () => {
  const dummyOcr = {
    lines: [
      { text: 'Fejlesztési terület:', bbox: { x0: 10, y0: 20, x1: 200, y1: 50 }, confidence: 92 },
      { text: '=== Oldal 1 ===', bbox: { x0: 0, y0: 0, x1: 100, y1: 15 }, confidence: 99 },
      { text: '', bbox: { x0: 0, y0: 0, x1: 10, y1: 10 } },
      { text: '- Grafomotorika', bbox: { x0: 15, y0: 60, x1: 180, y1: 90 }, confidence: 88 }
    ]
  };

  const parsed = OcrService.parseLinesFromOcrResult(dummyOcr, 1000, 500);

  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].text, 'Fejlesztési terület:');
  assert.equal(parsed[0].active, true);
  assert.ok(parsed[0].leftPct >= 0 && parsed[0].leftPct <= 100);
  assert.ok(parsed[0].topPct >= 0 && parsed[0].topPct <= 100);
  assert.ok(parsed[0].widthPct > 0 && parsed[0].widthPct <= 100);
  assert.ok(parsed[0].heightPct > 0 && parsed[0].heightPct <= 100);
  assert.equal(parsed[1].text, '- Grafomotorika');
});

test('Integration - Area Camera lines to suggestions flow', () => {
  // 1. Több oldalon gyűjtött sorok
  const accumulatedFromPages = [
    '• Vizuális figyelem és',
    'észlelés fejlesztése',
    '- Matematikai készségek',
    '- Matematikai készségek' // duplikátum átfedésből
  ];

  // 2. Tisztítás és összefűzés
  const cleaned = OcrService.cleanAndStitchSelectedLines(accumulatedFromPages);
  assert.equal(cleaned.length, 2);
  assert.equal(cleaned[0], 'Vizuális figyelem és észlelés fejlesztése');
  assert.equal(cleaned[1], 'Matematikai készségek');

  // 3. Terület javaslatok generálása
  const matched = MatchingService.matchLines(cleaned, teruletekData);
  assert.equal(matched.length, 2);

  // Vizuális figyelem javaslat
  assert.ok(matched[0].recommendations.length > 0);
  assert.ok(matched[0].recommendations[0].score >= 65);

  // Matematikai készségek / gondolkodás javaslat
  assert.ok(matched[1].recommendations.length > 0);
  assert.ok(matched[1].recommendations[0].score >= 65);
});

test('OcrService - processImageData performs adaptive normalization removing shadows', () => {
  const w = 64, h = 64;
  const pixels = new Uint8ClampedArray(w * h * 4);

  // Szimulált árnyékos papír: luminancia = 110, sötét betű = 35
  for (let i = 0; i < w * h * 4; i += 4) {
    pixels[i] = 110;
    pixels[i + 1] = 110;
    pixels[i + 2] = 110;
    pixels[i + 3] = 255;
  }

  // Tintapont elhelyezése
  const inkIdx = (32 * 64 + 32) * 4;
  pixels[inkIdx] = 35;
  pixels[inkIdx + 1] = 35;
  pixels[inkIdx + 2] = 35;

  OcrService.processImageData(pixels, w, h);

  // A papír háttérnek fehérré kell válnia (>= 250)
  assert.ok(pixels[0] >= 250, `Expected white paper >= 250, got ${pixels[0]}`);

  // A tinta pontnak mélyfeketévé kell válnia (<= 20)
  assert.ok(pixels[inkIdx] <= 20, `Expected dark ink <= 20, got ${pixels[inkIdx]}`);
});

test('OcrService - parseGyermekAdatai extracts felulvizsgalatIdeje in school-year format and formats hetiOraszam', () => {
  const sampleDocText = `
    SZAKÉRTŐI VÉLEMÉNY
    Tanuló neve: Teszt Elek
    Anyja neve: Minta Mária
    Születési helye és ideje: Budapest, 2015. 03. 10.
    Forgalmi szám: 4321/2024
    Iktatószám: 12-34/2024
    Fejlesztés formája: egyéni foglalkozás
    Heti óraszám: 2 óra
    Felülvizsgálat ideje: a 2025/2026. tanév tavaszi időszaka
  `;

  const data = OcrService.parseGyermekAdatai(sampleDocText);
  assert.equal(data.nev, 'Teszt Elek');
  assert.equal(data.anyjaNeve, 'Minta Mária');
  assert.equal(data.szuletesiHelyEsIdo, 'Budapest, 2015. 03. 10.');
  assert.equal(data.forgalmiSzam, '4321/2024');
  assert.equal(data.iktatoszam, '12-34/2024');
  assert.equal(data.fejlesztesFormaja, 'egyéni');
  assert.equal(data.hetiOraszam, 'heti 2 óra');
  assert.equal(data.felulvizsgalatIdeje, '2025/2026');
});

test('Integration - Area Camera snapshot selection list flow with 65+ threshold', () => {
  const ocrText = `
    - Finommotorika, grafomotorika fejlesztése
    • Matematikai készségek
    - Egyéb leíró szöveg vagy vizsgálat eredménye
  `;

  const cleanedLines = OcrService.extractCleanedImageLines(ocrText).filter(l => l.length >= 3);
  assert.equal(cleanedLines.length, 3);

  // Pontszámítás és auto-kijelölés szimulációja
  const listItems = cleanedLines.map(line => {
    let bestScore = 0;
    for (const t of teruletekData) {
      const sc = MatchingService.scoreMatch(t.nev, line);
      if (sc > bestScore) bestScore = sc;
      if (bestScore === 100) break;
    }
    return {
      text: line,
      score: bestScore,
      selected: bestScore >= 65
    };
  });

  // Finommotorika és Matematikai készségek 65+ score -> auto-kijelölve
  assert.ok(listItems[0].score >= 65);
  assert.equal(listItems[0].selected, true);

  assert.ok(listItems[1].score >= 65);
  assert.equal(listItems[1].selected, true);

  // Leíró szöveg alacsony pontszám -> nincs kijelölve
  assert.ok(listItems[2].score < 65);
  assert.equal(listItems[2].selected, false);

  // Kijelölt sorok továbbítása a javaslatokhoz különálló elemekként (nem merge-ölve!)
  const selected = listItems.filter(i => i.selected).map(i => i.text.replace(/[\s:;.,\-–—_]+$/, '').trim());
  assert.equal(selected.length, 2);

  const matched = MatchingService.matchLines(selected, teruletekData);
  assert.equal(matched.length, 2);
  assert.ok(matched[0].recommendations[0].score >= 65);
  assert.ok(matched[1].recommendations[0].score >= 65);
});

test('OcrService - configurable Beállítások labels support custom prefixes, OCR accent tolerance, and custom fejlesztés formája', () => {
  try {
    OcrService.setBeallitasokLabels({
      nev: ['Vizsgált gyermek', 'Név'],
      anyjaNeve: ['Édesanyja neve'],
      szuletesiHelyEsIdo: ['Szül. hely, idő'],
      forgalmiSzam: ['Ügyszám'],
      iktatoszam: ['Hivatkozási szám'],
      fejlesztesFormaja: ['egyéni', 'kiscsoportos', 'osztálykeretben']
    });

    const customDoc = `
      Vizsgalt gyermek: Nagy Bence
      Edesanyja neve: Tóth Klára
      Szül. hely, idő: Szeged, 2016. 07. 21.
      Ugyszam: U-555/2026
      Hivatkozasi szam: H-777/2026
      Fejlesztés formája: KISCSOPORTOS fejlesztés
    `;

    const parsed = OcrService.parseGyermekAdatai(customDoc);
    assert.equal(parsed.nev, 'Nagy Bence');
    assert.equal(parsed.anyjaNeve, 'Tóth Klára');
    assert.equal(parsed.szuletesiHelyEsIdo, 'Szeged, 2016. 07. 21.');
    assert.equal(parsed.forgalmiSzam, 'U-555/2026');
    assert.equal(parsed.iktatoszam, 'H-777/2026');
    assert.equal(parsed.fejlesztesFormaja, 'kiscsoportos');

    // Camera field matching also uses the configured labels
    assert.equal(OcrService.matchCameraField('nev', 'Vizsgált gyermek: Nagy Bence'), 'Nagy Bence');
    assert.equal(OcrService.matchCameraField('forgalmiSzam', 'Ügyszám: U-555/2026'), 'U-555/2026');
    assert.equal(OcrService.matchCameraField('fejlesztesFormaja', 'Javasolt: osztalykeretben történő ellátás'), 'osztálykeretben');
    // 'csoportos' was removed from the list, so standalone 'csoportos' should not match
    assert.equal(OcrService.matchCameraField('fejlesztesFormaja', 'csoportos foglalkozás'), null);
  } finally {
    // Reset to defaults
    OcrService.setBeallitasokLabels(OcrService.DEFAULT_BEALLITASOK_LABELS);
  }
});






