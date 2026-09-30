---
eszköz: Google Gemini
modell: gemini flash 3.8
dátum: 2026.09.24.
---

<user>
Az alábbi specifikációhoz készíts nekem egy UI specifikációs promptot, amit egy kódoló ágensnek tudok adni.
A cél, hogy a funkcionalitásokat lefedve készüljön el egy barnás, kellemes kinézetű, minimális UI terv, ami egy kattintható demo-ként funkcionál mock adatokkal

# Fejlesztőpedagógus adminisztrációs webapp specifikáció

## 1. Bevezetés és háttér

A féléves feladatomként egy olyan webes adminisztrációs alkalmazást készítek, amely a köznevelési intézményekben dolgozó fejlesztőpedagógusok mindennapi szakmai munkáját és adminisztrációját hivatott támogatni. A rendszer fókusza a **Beilleszkedési, Tanulási, Magatartási Nehézséggel (BTMN)** küzdő tanulók nyilvántartása, a pedagógiai szakszolgálatok szakértői véleményeinek kezelése, valamint az egyéni és csoportos fejlesztő foglalkozások naplózásának digitális támogatása.

### BTMN vs. SNI fogalmi elhatárolás

A **Beilleszkedési, Tanulási, Magatartási Nehézséggel (BTMN)** küzdő tanulók valamilyen eseti hátránnyal rendelkeznek. Nem betegek, lemaradásuk átmeneti jellegű és felzárkóztatással behozható; velük nem gyógypedagógus, hanem fejlesztőpedagógus foglalkozik (szemben a Sajátos Nevelési Igényű - SNIs - tanulókkal). 

Ezek a gyermekek többnyire az összes tanórán részt vesznek, és a tanórákon felül – délután vagy a készségtárgyak sávjában – egyéni vagy kiscsoportos foglalkozások keretében kapnak célzott támogatást. A foglalkozások célja az eseti hiányosságok célzott felszámolása, biztosítva a tanulmányok zökkenőmentes folytatását a többségi oktatásban.

---

## 2. Funkcionális követelmények

### 2.1. Tanulói nyilvántartás és szakértői vélemények kezelése
- Tanulók alapadatainak (név, iskola, osztály, anyja neve, születési helye és ideje) nyilvántartása.
- A Pedagógiai Szakszolgálat által kiállított szakértői vélemények iktatása (érvényességi időtartam, kötelező heti óraszám, kontrollvizsgálat határideje).

### 2.2. Egyéni Fejlesztési Tervek (EFT)
A fejlesztőpedagógusok a tanév elején Egyéni Fejlesztési Tervet készítenek minden tanulóhoz. Bár erre nincs merev jogszabályi formanyomtatvány, a folyamat jól modellezhető egy háromszintű hierarchiával:
1. **Fejlesztési területek:** A szakszolgálati vélemény által kijelölt kategóriák (pl. vizuális figyelem, finommotorika, nyelvi készségek).
2. **Fejlesztési célok:** A fejlesztőpedagógus által az adott gyermekre szabott konkrét részcélok (pl. helyes ceruzafogás kialakítása, auditív differenciálás fejlesztése).
3. **Fejlesztési eszközök és módszerek:** Azok a gyakorlatok, feladattípusok és eszközök, amelyeket a pedagógus a célok elérése érdekében tervez alkalmazni.

### 2.3. Fejlesztő foglalkozások naplózása
A fejlesztő munka nem a Nemzeti alaptanterv (NAT) kötött tanmenete szerint halad, ezért a standard KRÉTA-struktúra nem alkalmas a valós célok követésére. A rendszer az alábbi naplózási folyamatot teszi lehetővé:
- Egyéni vagy csoportos foglalkozás létrehozása dátummal és résztvevőkkel.
- A tényleges foglalkozás összerendelése a tervezett célokkal:
  - előre definiált eszköz/tevékenység kiválasztásával, vagy
  - ad-hoc órai téma megadásával (pl. aktuális tantárgyi lemaradás pótlása), majd annak utólagos hozzárendelésével a fejlesztési célokhoz.

### 2.4. Értékelés és analitika (Fejlesztés eredménye)
A tanév végén a pedagógusnak szöveges értékelést kell adnia a tanuló fejlődéséről a szakvéleményben kijelölt területek mentén.
- **Automatikus munkanapló-összesítés:** Kimutatás arról, hogy az adott gyermeknél melyik fejlesztési terület és cél hány foglalkozáson, milyen óraszámban került elő.
- **Értékelési sablon és javaslattétel:** A rendszer a naplózott aktivitások alapján előre strukturált szöveges értékelési vázat generál, amelyet a pedagógus véglegesíthet.
- **Nyomtatható/exportálható riport:** Szülők, szaktanárok és a szakszolgálat számára átadható fejlődési lap exportálása (PDF formátumban).

---

</user>

<assistant>
# 📋 UI Specifikáció és Képernyőterv

> **Projekt megnevezése:** BTMN Adminisztrációs Rendszer  
> **Szerepkör:** Fejlesztőpedagógus  
> **Típus:** Webes adminisztrációs felület (Kattintható prototípus)

---

## 1. A feladat célja

Egyetemi féléves feladatomként egy olyan webes adminisztrációs alkalmazást készítek, amely a köznevelési intézményekben dolgozó **fejlesztőpedagógusok** mindennapi szakmai munkáját és adminisztrációját hivatott támogatni. 

### Fókuszterületek:
- **BTMN Nyilvántartás:** A *Beilleszkedési, Tanulási, Magatartási Nehézséggel* küzdő tanulók törvényben előírt kötelező nyilvántartása.
- **Szakértői vélemények kezelése:** Pedagógiai szakszolgálati szakvélemények adatainak strukturált tárolása.
- **Foglalkozások naplózása:** Egyéni és csoportos fejlesztő órák digitális rögzítése.

> 💡 **Kiemelt funkció:**  
> Az **Egyéni Fejlesztési Tervek (EFT)** PDF generálása, amely félévente a legnagyobb adminisztrációs leterheltséget jelenti a szakemberek számára.

### 📐 Tervezési alapelvek:
* **KISS (*Keep It Simple, Stupid*) & YAGNI (*You Aren't Gonna Need It*):**
  * Nincsenek spekulatív keresősávok, szűrők vagy redundáns UI elemek.
  * Csak a közvetlenül szükséges szakmai műveletek kapnak helyet.
* **Kimeneti elvárás:** Kattintható, lokálisan (`file://`) futtatható HTML/CSS prototípus és képernyőterv.

---

## 2. A prototípus terjedelme és navigációs architektúrája

### 2.1. Scope és határok

| Elem | Prototípus státusz | Leírás |
| :--- | :---: | :--- |
| **Bejelentkezési felület** | ❌ *Kívül esik (Out of Scope)* | Nincs külön login képernyő vagy publikus nyitólap. |
| **Munkafelület** | ✔️ *Fókuszban (In Scope)* | Sikeres bejelentkezést követő, hitelesített adminisztrátori környezet. |
| **Felhasználói azonosító** | ℹ️ *Statikus elem* | Monogramos avatár a fejlécben, nem kattintható menü (pedagógus jelenlétének mimikálása). |

---

### 2.2. Globális elrendezés (Layout)

```text
+------------------------------------------------------------------------------------+
| [Header] BTMN Admin                                           [Avatar: (TF)]       |
+---------------------+--------------------------------------------------------------+
| [Sidebar]           | [Main Content Area]                                          |
| - 👤 Profil         |                                                              |
| - 🎒 Gyerekek       |  Aktív modul nézete (Kártyák, táblázatok, műveletek)         |
| - 📅 Foglalkozások  |                                                              |
| - 🌳 Fejlesztési t. |                                                              |
+---------------------+--------------------------------------------------------------+
```

1. **Felső navigációs fejléc (`<header>`):**
   - Rendszernév: `BTMN Admin`
   - Jobb oldali statikus azonosító: `<avatar>` (pl. `TF` – Tóth Fruzsina)
2. **Bal oldali rögzített oldalsáv (`<aside>`):**
   - [x] **Profil:** Pedagógus adatai, tanévek, iskolák, szakértői bizottságok.
   - [ ] **Gyerekek:** Multi-select tanulói lista és dokumentumgenerálás.
   - [ ] **Foglalkozások:** Időrendi fejlesztési napló dátummal és jelenléttel.
   - [ ] **Fejlesztési területek:** Háromszintű, soronként behúzott fastruktúra.

---

## 3. UI és UX irányelvek

- [x] **Minimalista Flat Design:**
  - Letisztult, funkcionális felületek.
  - Mellőzve: keresők, szűrősávok, tooltipek, felesleges badge-ek, placeholderek és díszítő gombok.
- [x] **Színpaletta:**
  - `bg-base-100` (`#FFFFFF`): Kártyák és panelek háttere
  - `bg-base-200` (`#F7F5F0`): Természetes világos bézs oldalháttér
  - `accent` (`#8B5A2B` / földbarna): Kiemelt akciógombok és aktív állapotok
  - `neutral` (`#3E2723` / sötétbarna): Tipográfia és kontrasztos keretek
- [x] **Pontos modális hozzárendelés:**
  - Minden dialógusablak szigorúan a hozzá tartozó triggerhez van kötve.
  - Implementálatlan gombok esetén statikus állapot (téves megnyitások elkerülése).
- [x] **Önálló futtathatóság:**
  - Külső függőségektől mentes.
  - Egyetlen `style.css` fájl, közvetlen `file:///` futtatási támogatással.

---

## 4. Képernyőtervek részletes leírása

### 4.1. Profil nézet

> **Cél:** A pedagógus alapadatainak és a kapcsolódó törzsadatoknak (tanévek, intézmények, szakszolgálatok) menedzselése.

#### Moduláris kártyák:
1. **Fejlesztőpedagógus neve kártya:**
   - Név megjelenítése: **Tóth Fruzsina**
   - Művelet: <kbd>Szerkesztés</kbd> gomb
2. **Tanévek kártya:**
   - Rádiógombos lista:
     - `( )` 2023/2024
     - `(*) 2024/2025` `[Aktív]`
   - Művelet: `+ Új tanév hozzáadása` gomb *(Modalt nyit)*
3. **Iskolák kártya:**
   - Intézmények listája sorvégi gyorsműveletekkel (<kbd>✏️</kbd> / <kbd>🗑️</kbd>).
4. **Szakvélemény kiállítók kártya:**
   - Illetékes szakszolgálatok listája sorvégi gyorsműveletekkel.
5. **Modál nézet (Új tanév):**
   - Bemeneti mező: `Tanév megnevezése` (pl. `2025/2026`)
   - Jelölőnégyzet: `[x] Tanulók átmásolása az előző tanévből`
   - Gombok: <kbd>Mégse</kbd> | <kbd>Mentés</kbd>

---

### 4.2. Gyermekek nyilvántartása és Dokumentumgenerálás

> **Cél:** Tanulók kezelése, többes kijelölése és az automatizált adminisztrációs sablonok (EFT, Fejlesztés megvalósulása) generálása.

#### Képernyőelemek és Műveletek:

```
[ Gyerekek ] ------------------------------------------------------------------------
[Egyéni Fejlesztési Terv]  [Fejlesztés Megvalósulása]  [+ Új gyerek hozzáadása]
-------------------------------------------------------------------------------------
[x] | 3.a | Kovács Ádám                                                 [ ✏️ ] [ 🗑️ ]
[x] | 3.a | Nagy Bence                                                  [ ✏️ ] [ 🗑️ ]
[ ] | 4.b | Varga Csilla                                                [ ✏️ ] [ 🗑️ ]
```

#### Modális ablakok specifikációja:

* **1. Egyéni Fejlesztési Terv (EFT) Modal:**
  - **Kijelöltek:** Pl. `3.a - Kovács Ádám`, `3.a - Nagy Bence`
  - **Költségbecslés formulája:**
    $$\text{Összköltség} = N_{\text{tanuló}} \times C_{\text{egységár}}$$
    *(ahol $N$ a kijelölt tanulók száma, $C$ pedig a dokumentumonkénti egységár Ft-ban)*
  - **Műveletek:** <kbd>Mégse</kbd> és <kbd>Generálás megerősítése</kbd>

* **2. Fejlesztés Megvalósulása Modal:**
  - **Kijelöltek:** Dinamikus összefoglaló lista.
  - **Költségszámítás:** Megegyezik az EFT kalkulációjával.
  - **Funkció:** Naplózott óraszámok és szakértői célkitűzések összesítése.
  - **Műveletek:** <kbd>Mégse</kbd> és <kbd>Generálás megerősítése</kbd>

* **3. Gyermek szerkesztése Modal:**
  1. `Alapadatok` (Név, osztály, születési adatok)
  2. `Szakvélemény adatok` (Iktatószám, érvényesség, diagnózis)
  3. `Fejlesztési forma` (Egyéni / Csoportos, heti óraszám)
  4. `Fejlesztési fa` (Hierarchikus, behúzott checkbox-struktúra)
</assistant>