# BTMN Admin - Fejlesztési Terv Készítő Alkalmazás

A BTMN Admin egy 100%-ban lokális, böngészőben futó webalkalmazás, amely segíti a fejlesztőpedagógusokat a szakértői vélemények feldolgozásában és a hivatalos Fejlesztési Tervek előállításában.

---

## Architektúra és Mappastruktúra (Refaktorált, alacsony entrópia)

```
btmnadmin/
├── index.html                   # Landing page (funkciók összefoglalása)
├── app.html                     # Fő alkalmazás (7 lépéses varázsló felület)
├── css/
│   └── style.css                # Letisztult, bézs-barna dizájnrendszer és reszponzív stílusok
├── fonts/
│   ├── Roboto-Regular.ttf       # Beágyazott betűtípusok
│   ├── Roboto-Medium.ttf
│   └── fonts-base64.js          # Base64 formátum az offline PDF generáláshoz
├── vendor/
│   ├── alpine.min.js            # Reaktív UI komponensek
│   ├── fuzzball.umd.min.js      # Fuzzy token alapú szöveghasonlóság
│   ├── pdf.min.js               # PDF olvasó motor
│   ├── pdf.worker.min.js        # PDF háttérszál feldolgozó
│   ├── tesseract.min.js         # Magyar nyelvű optikai karakterfelismerő (OCR)
│   ├── jspdf.umd.min.js         # Kliensoldali PDF generátor
│   └── jspdf.plugin.autotable.min.js # Táblázat renderelő motor
└── js/
    ├── data/
    │   ├── teruletek-data.js    # Szakterületi fastruktúra globális fallbackhez
    │   └── teruletek.json       # Nyers JSON szakterületi fa
    ├── services/
    │   ├── storage-service.js   # Perzisztencia, előzmények és tanév kezelése
    │   ├── matching-service.js  # Fuzzy hasonlósági algoritmus és javaslattevő
    │   ├── ocr-service.js       # PDF/kép szövegkinyerés és szakértői vélemény parser
    │   └── pdf-service.js       # Kétoldalas Fejlesztési Terv PDF generálása
    └── app.js                   # Alpine.js alkalmazás koordinátor és folyamatvezérlő
```

---

## Az elvégzett refaktor és entrópia-redukció kulcspontjai

1. **Szétválasztott felelősségi körök (Separation of Concerns):**
   - Korábban az `app.js` és a modulok túlbonyolított, monolitikus struktúrában működtek, és a root könyvtárban keveredtek a funkciók, scratch scriptek és adatok.
   - Most a modulok dedikált rétegekbe kerültek:
     - `StorageService`: Egységes perzisztencia-kezelés, biztonságos JSON parse, memóriafallback privát böngészés esetén, tanév számítás.
     - `MatchingService`: Egységes fuzzy és token-alapú hasonlósági ráta (Dice együttható és Set Ratio), nincsenek duplikált szöveghasonlítási függvények.
     - `OcrService`: Letisztult mintaregiszter a gyermek adataihoz, dedikált szekció- és felsorolásszűrők, automatikus PDF.js worker és Tesseract worker életciklus-kezelés.
     - `PdfService`: Deklaratív konfiguráció, szétválasztott címlap- és táblázatrenderelés, robusztus fa-struktúra cellaösszevonás (`rowSpan`).
     - `app.js`: Karcsú, könnyen átlátható folyamatkoordinátor az Alpine.js számára.

2. **Felesleges, elavult fájlok eltávolítása a buildből:**
   - A kezdeti fejlesztési kísérletek (`extract.js`, `gyermek.js`, `truletek.js`) nem kerültek át a produkciós `btmnadmin` könyvtárba, kizárólag a letisztult, működő modulok alkotják a rendszert.

3. **100%-os offline megbízhatóság:**
   - Nincs külső CDN vagy hálózati függőség. Az alkalmazás akár helyi szerverről (`npx serve btmnadmin`), akár közvetlenül fájlrendszerből (`file:///.../btmnadmin/index.html`) azonnal futtatható.

---

## Futtatás és Tesztelés

### Helyi szerver indítása:
```bash
npm start
```
(vagy: `npx serve btmnadmin`)

### Egységtesztek futtatása:
```bash
npm test
```
(vagy: `node --test test/services.test.js`)
