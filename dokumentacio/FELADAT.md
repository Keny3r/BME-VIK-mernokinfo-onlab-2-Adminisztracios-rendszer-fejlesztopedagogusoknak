# Fejlesztőpedagógus adminisztrációs webapp specifikáció

- **Tárgy:** BME VIK Mérnökinformatikus képzés, Önálló laboratórium 2
- **Név:** Frink Dávid
- **Konzulens:** TODO

---

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

## 3. Nemfunkcionális követelmények

### 3.1. Adatvédelem és jogi megfelelőség (GDPR)
- **Különleges adatok kezelése:** A tanulási nehézségre és egészségügyi/pedagógiai felmérésekre vonatkozó adatok a GDPR 9. cikke alapján különleges kategóriájú személyes adatnak minősülnek. A tárolásuk és kezelésük fokozott védelmet igényel.
- **Titkosítás:** Kötelező a titkosított adatátvitel (HTTPS/TLS 1.3) a kliens és a szerver között, valamint a szenzitív adatok és biztonsági mentések nyugalmi titkosítása (encryption at rest, pl. AES-256).
- **Adatminimalizálás és hozzáférés-védelem:** Csak a fejlesztéshez elengedhetetlenül szükséges adatok rögzítése engedélyezett. Az adatokhoz kizárólag a jogosult pedagógus férhet hozzá.

### 3.2. Biztonság és jogosultságkezelés
- Szerepkör-alapú hozzáférés-vezérlés (RBAC): minimálisan *Adminisztrátor* és *Fejlesztőpedagógus* szerepkörök elválasztása.
- Biztonságos hitelesítés (jelszó-hashelés modern algoritmussal, pl. Argon2 vagy bcrypt), munkamenet-kezelés és védelem a gyakori sebezhetőségek ellen (OWASP Top 10: XSS, CSRF, SQL/NoSQL Injection).

### 3.3. Felhasználhatóság és ergonómia
- **Reszponzív felület:** Asztali gépen és táblagépen egyaránt kényelmesen kezelhető nézetek (a foglalkozások alatti gyors jelenléti és tevékenység-adminisztráció érdekében).
- **Gyors adatrögzítés:** A mindennapi órai adminisztráció minimális kattintásszámmal és intuitív kereső/választó mezőkkel elvégezhető kell, hogy legyen.

---

## 4. Hatókör és a féléves munka határai (Scope & Out of Scope)

### 4.1. In Scope (A félév során megvalósuló elemek)
- Önálló prototípus és tesztkörnyezet kiépítése szintetikus (anonimizált/mock) adatokkal.
- A fenti funkcionális követelmények teljes körű lefejlesztése: tanulók kezelése, szakvélemények rögzítése, célhierarchia kezelése, órai naplózás és év végi összesítő riport generálása.
- A fejlesztői tesztelés és az önálló laboratóriumi dokumentáció elkészítése.

### 4.2. Out of Scope (A félév keretein kívül eső elemek)
- **Éles üzembe állítás:** A félév végén egy működőképes, bemutatható, de még nem élesített alkalmazás jön létre; éles oktatási intézményi bevezetés nem történik valós tanulói adatokkal.
- **Hivatalos KRÉTA API-integráció:** A hivatalos KRÉTA interfészek zárt jellege miatt a rendszer független webalkalmazásként működik; a kétirányú automatikus KRÉTA-szinkronizáció nem része a féléves feladatnak.
- **Központi e-napló hitelesítés:** Digitális aláírással ellátott, hivatalos állami törzskönyvi szintű archiválás biztosítása.
- **Natív mobilapplikáció:** Csak reszponzív webalkalmazás készül, iOS/Android natív app nem.
