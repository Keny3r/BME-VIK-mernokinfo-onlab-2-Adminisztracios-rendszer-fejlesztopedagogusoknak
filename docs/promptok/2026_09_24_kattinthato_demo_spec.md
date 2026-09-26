---
eszköz: antigravity
modell: gemini 3.8 flash - high effort
dátum: 2026.09.24.
---

<user>

# Rendszertervezési Specifikáció és Képernyőterv

## 1. A feladat célja

Egyetemi féléves feladatomként egy olyan webes adminisztrációs alkalmazást készítek, amely a köznevelési intézményekben dolgozó fejlesztőpedagógusok mindennapi szakmai munkáját és adminisztrációját hivatott támogatni. A rendszer fókusza a **Beilleszkedési, Tanulási, Magatartási Nehézséggel (BTMN)** küzdő tanulók törvényben előírt kötelező nyilvántartásának, a pedagógiai szakszolgálati szakértői vélemények kezelésének, valamint az egyéni és csoportos fejlesztő foglalkozások naplózásának digitális támogatása.

A legfőbb funkcionalitás az Egyéni Fejlesztési Tervek PDF generálása, ami a legnagyobb adminisztrációs terhet jeleni a fejlesztőpedagógusok számára minden félév során.

A felület kialakításánál a legfontosabb alapelv a **szigorú minimalizmus (KISS, YAGNI)**: kerülni kell minden felesleges felületi elemet, spekulatív kereső/szűrősávot vagy redundáns adatismétlést. A felület közvetlenül a lényeges szakmai adatokra és műveletekre fókuszál.

Kérlek, hogy a specifikációban részletezett funkcionális követelmények és UX elvárások alapján készítsd el a rendszer kattintható, lokálisan megnyitható HTML/CSS prototípusát, valamint a hozzá tartozó képernyőket.

---

## 2. A prototípus terjedelme és navigációs architektúrája

### 2.1. Scope és határok

- A prototípus kifejezetten a **sikeres bejelentkezést követő, hitelesített adminisztrátori munkafelületet** mutatja be. Külön kezdőlap és a bejelentkezési képernyő nem része ennek a bemutatónak, a navigáció közvetlenül a profil és a további szakmai modulok felületeire fókuszál.
- A felhasználói azonosító (avatar) a fejlécben jelenjen meg statikus, tájékoztató jellegű elemként (nem kattintható menüként), ami azt mimikálja, mintha egy pedagógus belépett volna.

### 2.2. Globális elrendezés (Layout)

A felület két fő állandó szerkezeti egységből áll:

1. **Felső navigációs fejléc (Header):**
   - Rendszer megnevezése (BTMN Admin).
   - Jobb oldalon az aktív pedagógus statikus azonosítója (monogramos avatár).
2. **Bal oldali rögzített oldalsáv (Sidebar):**
   - Négy fő szakmai modul elérése egységes ikonográfiával és aktív állapotjelöléssel:
     1. **Profil**: Fejlesztőpedagógus adatai, tanévek, iskolák, szakértői bizottságok kezelése.
     2. **Gyerekek**: Multi-selectálható tanulói lista, dokumentumgeneráló műveletekkel.
     3. **Foglalkozások**: Időrendi fejlesztési napló dátummal és résztvevőkkel.
     4. **Fejlesztési területek**: Háromszintű, soronként behúzott hierarchikus fastruktúra.

---

## 3. UI és UX irányelvek

- **Minimalista Flat Design & Letisztultság:** Nincsenek felesleges kereső- és szűrősávok, alcímek, tooltipek, extra tagek, magyarázók, fölösleges szövegek, haszontalan placeholderek, fölösleges gombok, UI elemek stb. Az adatok letisztult listákban és strukturált táblázatokban jelenjenek meg.
- **Természetes, földszínű és meleg barnás színpaletta:** A felület alapját fehér kártyák (bg-base-100), világos bézs háttér (bg-base-200), valamint barna accent színek és sötétbarna semleges tónusok képezik.
- **Pontos modális hozzárendelés:** Minden felugró ablak pontosan ahhoz a művelethez kapcsolódik, amelyre hivatkozik. Ahol nincs dedikált modal megvalósítva, ott a gomb statikus elemként működik, megelőzve az eltérő tartalmú ablakok téves megnyitását.
- **Önálló futtathatóság:** A prototípus egyetlen helyi stíluslappal (style.css), tisztán helyi fájlként (file:// protokollon) is hibátlanul fut.

---

## 4. Képernyőtervek részletes leírása

### 4.1. Profil nézet

**Cél:** A fejlesztőpedagógus nevének, a gondozott tanéveknek, valamint az érintett iskolák és szakszolgálatok listájának karbantartása.

**Felépítés:**

1. **Fejlesztőpedagógus neve kártya:** A pedagógus neve (Tóth Fruzsina) és szerkesztés gomb.
2. **Tanévek kártya:** Lista rádiógombos kiválasztással, aktív státuszjelvénnyel (2024/2025 -  [Aktív]), valamint `+ Új tanév hozzáadása` gomb (megnyit egy modal-t).
3. **Iskolák kártya:** Intézmények egyszerű listája sorvégi műveleti gombokkal.
4. **Szakvélemény kiállítók kártya:** Szakszolgálatok jegyzéke sorvégi műveleti gombokkal.
5. **Modál nézet:** Új tanév felvételére szolgáló egyszerűsített dialógus, tanév megnevezése mezővel és a tanulók átmásolására szolgáló jelölőnégyzettel.

---

### 4.2. Gyermekek nyilvántartása és Dokumentumgenerálás

**Célja:** Az aktív tanévben ellátott tanulók listázása, csoportos kijelölése (multi-select), valamint az Egyéni Fejlesztési Terv és Fejlesztés Megvalósulása dokumentumok generálásának elindítása.

**Felépítés:**

1. **Gyerekek kártya:**
   - Fejléc:
     - Cím: **Gyerekek**.
     - Akciógombok csoportja: az `+ Új gyerek hozzáadása` gombtól balra elhelyezve a két kiemelt dokumentumgeneráló funkció:
       - `Egyéni Fejlesztési Terv` gomb (megnyitja a megfelelő modalt).
       - `Fejlesztés Megvalósulása` gomb (megnyitja a megfelelő modalt).
       - `+ Új gyerek hozzáadása` gomb (megnyitja a megfelelő modalt).
   - Vékony elválasztó.
   - Tömör, multi-selectálható lista:
     - Minden sor elején multiselect kijelölőnégyzet a tanuló kiválasztásához.
     - Osztály-badge (pl. **3.a**).
     - Tanuló teljes neve (pl. Kovács Ádám).
     - Műveleti ikonok: Szerkesztés (ceruza) - átnavigál a gyermekek modalra - és törlés (kuka).
2. **Egyéni Fejlesztési Terv generálási modal:**
   - Felugró ablak a kiválasztott tanulók felsorolásával (pl. 3.a - Kovács Ádám, 3.a - Nagy Bence).
   - Költségbecslés: Generálás költsége: kijelölt tanulók száma * X Ft (kijelölt tanulók száma * X Ft / dokumentum).
   - Tájékoztató szöveg a szakértői vélemények és a fejlesztési fák feldolgozásáról.
   - `Mégse` és `Generálás megerősítése` gombok.
3. **Fejlesztés Megvalósulása generálási modal:**
   - Felugró ablak a kiválasztott tanulók felsorolásával.
   - Költségbecslés: Generálás költsége: Ugyanaz, mint a fejlesztési terveké.
   - Tájékoztató szöveg a naplózott foglalkozások és óraszámok összesítéséről.
   - `Mégse` és `Generálás megerősítése` gombok.
4. **Gyermek szerkesztése modal:**
   - 4 szekciós űrlap: Alapadatok, Szakvélemény adatok, Fejlesztési forma, és a mélység szerint behúzott Fejlesztési fa jelölőnégyzetei.

---

### 4.3. Foglalkozások naplója nézet

**Célja:** A megtartott fejlesztő órák időrendi rögzítése és a KRÉTA órai munka előkészítése.

**Felépítés:**

1. **Foglalkozások kártya:**
   - Fejléc: Cím és `+ Új foglalkozás rögzítése` gomb (megnyitja a modalt).
   - Vékony elválasztó.
   - Tömör lista: Bal oldal dátum naptár ikonnal (pl. 2024-10-16), közép résztvevő gyermekek listája vertikálisan, jobb oldal törlés gomb. A sorra kattintva megnyílik a modal.
2. **Modal:**
   - Dátum, résztvevő gyermekek kezelése, mélység szerint behúzott fejlesztési mátrix, opcionális óraleírás, és automatikusan generált KRÉTA szöveg másolás gombbal.

---

### 4.4. Fejlesztési területek rendszere

**Célja:** A módszertani repertoár faszerkezetének áttekintése pontos mélységi behúzásokkal.

**Felépítés:**

1. **Fejlesztési repertoár kártya:**
   - Fejléc: Cím és `+ Új terület felvétele` gomb.
   - Vékony elválasztó.
   - Hierarchikus fastruktúra táblázat pontos mélységi behúzásokkal:
     - **1. szint – Terület** (nincs behúzás): Kinyitó nyíl, "Terület" címke, félkövér név, sorvégi `+ Cél` művelet, szerkesztés és törlés.
     - **2. szint – Cél** (kis behúzás): Kinyitó nyíl, "Cél" címke, közepes vastagságú név, sorvégi `+ Eszköz` művelet, szerkesztés és törlés.
     - **3. szint – Eszköz** (nagyobb behúzás): "Eszköz" címke, normál név, szerkesztés és törlés.
2. **Modális nézet:**
   - Új cél hozzáadására szolgáló egyszerű beviteli dialógus (editelős minta).


</user>

<skill>

## Design Principles

**UI Minimalism, KISS, DRY, YAGNI & Modularity Invariant**:
    - **KISS & Minimalist UI**: Never add redundant, verbose, or trivial subtitles/descriptions below obvious titles and section headers. Keep the UI clean, focused, and free of visual clutter.
    - **Info Tooltip Pattern**: If and only if extra, non-obvious guidance is genuinely required for a section or input, provide it via a discrete info icon.
    - **DRY & Zero Data Redundancy**: Avoid presenting or duplicating the same data in multiple places on the same screen.
    - **YAGNI**: Do not build speculative UI components, placeholder metadata fields, or superfluous widgets that serve no immediate administrative purpose.
    - **Visual Consistency & Uniform Design Language**: Navigation links and corresponding page header titles must use unified iconography. Section containers must share identical structural hierarchy and daisyUI styling.

</skill>