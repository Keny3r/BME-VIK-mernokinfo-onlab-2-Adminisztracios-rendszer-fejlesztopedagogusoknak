---
eszköz: Google Gemini
modell: gemini flash 3.8
dátum: 2026.09.26.
---

<user>
## Fejlesztőpedagógus adminisztrációs webapp specifikáció

- Tárgy: BME VIK Mérnökinformatikus képzés önálló laboratórium 2
- Név: Frink Dávid
- Konzulens: TODO

## Feladat

Egyetemi féléves feladatomként egy olyan webes adminisztrációs alkalmazást készítek, amely a köznevelési intézményekben dolgozó fejlesztőpedagógusok mindennapi szakmai munkáját és adminisztrációját hivatott támogatni. A rendszer fókusza a **Beilleszkedési, Tanulási, Magatartási Nehézséggel (BTMN)** küzdő tanulók törvényben előírt nyilvántartása, a pedagógiai szakszolgálatok szakértői véleményeinek kezelése, valamint az egyéni és csoportos fejlesztő foglalkozások naplózásának digitális támogatása.

### BTMN vs SNI

A **Beilleszkedési, Tanulási, Magatartási Nehézséggel (BTMN)** küzdő tanulók valamilyen eseti hátránnyal rendelkeznek. Nem betegek, a lemaradásuk rövidtávú, behozható, velük nem gyógypedagógus, hanem fejlesztőpedagógus foglalkozik. Ezek a gyermekek többnyire az összes tanórán résztvesznek és délután vagy a készségtárgyak idejében foglalkozik velük - a tananyagon felül - egy fejlesztőpedagógus. Ezeknek az óráknak a célja, hogy a gyermek olyan extra támogatást kapjon - egyéni vagy csoportos foglalkozásokon - amelynek révén behozhatja az eseti lemaradását és így maradéktalanul tudja folytatni a tanulmányait.

### Funkciók

Az applikáció legfontosabb funkcionális elemei, amelyek a fejlesztópedagógusok napi munkáját hivatottak segíteni.

#### Egyéni Fejlesztési Tervek

A fejlesztőpedagógusok a tanév elején szokták előállítani. A pedagógiai szakszolgálatok szakértői véleményei meghatároznak **Fejlesztési Területeket**, amelyeket a pedagógus tetszőlegesen bonthat le célokra, eszközökre, esetleg részterületekre stb. Ennek nincsen kőbe vésett formája. Gondoljunk rá úgy, mint a Scrum vagy a Kanban. Ezek módszertanok, amelyek a szoftverfejlesztési folyamatok modelljét, absztrakt működését írják le. Eközben az olyan szoftverek, mint a Jira vagy a Linear, ezeknek a modelleknek a szoftveres implementációi, amelyek már egy konkrét eszközt nyújtanak a megvalósításhoz. A modell konkrét példánya pedig maga a szoftverfejlesztési projekt, aminek keretein belül fejlesztők tömegei ülnek be a napi standupokra és egyéb eseményekre. Ez a szoftver hasonlít ezekre a példákra, csak itt a fejlesztőpedagógus domain folyamatait támogatjuk digitális eszközökkel.

A mi szoftverünkben az egyéni fejlesztési tervekben lesznek **fejlesztési területek** - ezeket a szakértői vélemény határozza meg -, **fejlesztési célok** - ezek a fejleszőpedagógus által, az adott gyermek esetében meghatározott szűkebb célok, például a ceruzafogás javítása, amelyeket egy adott időszakban fejleszteni szeretne - és **fejlesztési eszközök** - ezek pedig azok a tevékenységek, amelyeket a cél elérése érdekében a pedagógus szeretne elvégezni. Bár a napi munka vátozékony és sokszor a gyerekek szaktanárok által jelzett lemaradásait kell bepótolni, ezért a tervezett eszközök nem mindig kerülnek végrehajtásra maradéktalanul - a gyakorlott pedagógusok a célokhoz rendelik a tanév közben végrehajtott feladatokat, hogy a gyermekek eredeti hiányosságait is pótolják a tanév során.

#### Fejlesztés nyomonkövetése

A fejlesztőpedagógusok munkáját jelenleg nagyon nehéz követni. Ők nem a NAT alapján dolgoznak, hanem a saját céljaikhoz rendelt eszközöket használják, ennek azonban nincsen kőbe vésett kötelező módja, így a KRÉTA sem támogatja.

A célunk az, hogy az órai munka rögzítését és célokhoz rendelését megkönnyítsük. Ehhez a fejlesztőpedagógusnak egy foglalkozáshoz hozzá kell adnia a gyermekeket és
- ki kell választania a tervezett tevékenységek egyikét
- vagy meg kell adnia a tanóra témáját (gyakori, hogy a tananyagban felmerülő lemaradást kell behozni a gyermekekekkel) és célokhoz rendelni azt

#### Fejlesztés eredménye

Elméletben a fejlesztőpedagógusoknak minden tanév végén ki kéne állítaniuk egy szöveges értékelést arról, hogy a szakvélemény területei és a meghatározott célok mentén hogyan fejlődtek a gyermekek. Ez a gyakorlatban egy hatalmas adminisztrációs teher, amit nehéz mérni és kézzelfogható dokumentumot képezni belőle.

Azonban az alkalmazásunk tartalmazza
- a gyermekeket
- a tanév elején felvett területeket és célokat
- az elvégzett foglalkozásokat
- és ezeket össze is tudja rendelni

Így a pedagógus kaphat egy sablont, amely minden gyereknél tartalmaz egy munkanaplót, jelzi, hogy melyik gyereknél hány foglalkozáson volt fejlesztve az adott terület és cél, valamint ajánlást adhat egy szöveges értékeléshez, ami megkönnyíti a munkát és így lehetővé teheti, hogy a szaktanárok, a szülők és esetleg a gyermekek visszajelzést kapjanak a fejlődésük üteméről.

### Nemfunkcionális követelmények

#### Jogi megkötések

Ezt a dokumentumot szeretném értelmes nemfunkcionális követelményekkel kiegészíteni, egy minimális out of scope részleggel kiegészíteni (pl. a félév végén lesz egy kész, de még nem éles applikáció) és az esetleges helyesírási hibákat kijavítani
A dokumentumot egy markdown blokkba helyezd
</user>

<assistant>
```markdown
# Fejlesztőpedagógus adminisztrációs webapp specifikáció

- **Tárgy:** BME VIK Mérnökinformatikus képzés, Önálló laboratórium 2
- **Név:** Frink Dávid
- **Konzulens:** TODO

---

## 1. Bevezetés és háttér

Egyetemi féléves feladatomként egy olyan webes adminisztrációs alkalmazást készítek, amely a köznevelési intézményekben dolgozó fejlesztőpedagógusok mindennapi szakmai munkáját és adminisztrációját hivatott támogatni. A rendszer fókusza a **Beilleszkedési, Tanulási, Magatartási Nehézséggel (BTMN)** küzdő tanulók törvényben előírt nyilvántartása, a pedagógiai szakszolgálatok szakértői véleményeinek kezelése, valamint az egyéni és csoportos fejlesztő foglalkozások naplózásának digitális támogatása.

### BTMN vs. SNI fogalmi elhatárolás

A **Beilleszkedési, Tanulási, Magatartási Nehézséggel (BTMN)** küzdő tanulók valamilyen eseti hátránnyal rendelkeznek. Nem betegek, lemaradásuk átmeneti jellegű és felzárkóztatással behozható; velük nem gyógypedagógus, hanem fejlesztőpedagógus foglalkozik (szemben a Sajátos Nevelési Igényű – SNI – tanulókkal). 

Ezek a gyermekek többnyire az összes tanórán részt vesznek, és a tanórákon felül – délután vagy a készségtárgyak sávjában – egyéni vagy kiscsoportos foglalkozások keretében kapnak célzott támogatást. A foglalkozások célja az eseti hiányosságok célzott felszámolása, biztosítva a tanulmányok zökkenőmentes folytatását a többségi oktatásban.

---

## 2. Funkcionális követelmények

### 2.1. Tanulói nyilvántartás és szakértői vélemények kezelése
- Tanulók alapadatainak (név, osztály, oktatási azonosító, gondviselő elérhetősége) nyilvántartása.
- A Pedagógiai Szakszolgálat által kiállított szakértői vélemények iktatása (érvényességi időtartam, kötelező heti óraszám, kontrollvizsgálat határideje).
- Riasztási/figyelmeztetési funkció a lejáró szakvéleményekről és esedékes felülvizsgálatokról.

### 2.2. Egyéni Fejlesztési Tervek (EFT)
A fejlesztőpedagógusok a tanév elején Egyéni Fejlesztési Tervet készítenek minden tanulóhoz. Bár erre nincs merev jogszabályi formanyomtatvány, a folyamat jól modellezhető egy háromszintű hierarchiával:
1. **Fejlesztési területek:** A szakszolgálati vélemény által kijelölt nagykategóriák (pl. részképességek, figyelem, finommotorika, anyanyelvi készségek).
2. **Fejlesztési célok:** A fejlesztőpedagógus által az adott gyermekre szabott konkrét részcélok (pl. helyes ceruzafogás kialakítása, auditív differenciálás fejlesztése).
3. **Fejlesztési eszközök és módszerek:** Azok a gyakorlatok, feladattípusok és eszközök, amelyeket a pedagógus a célok elérése érdekében tervez alkalmazni.

A rendszer biztosítja az EFT rugalmas szerkeszthetőségét és év közbeni adaptálását.

### 2.3. Fejlesztő foglalkozások naplózása
A fejlesztő munka nem a Nemzeti alaptanterv (NAT) kötött tanmenete szerint halad, ezért a standard KRÉTA-struktúra nem alkalmas a valós célok követésére. A rendszer az alábbi naplózási folyamatot teszi lehetővé:
- Egyéni vagy csoportos foglalkozás létrehozása dátummal, időtartammal és résztvevőkkel.
- A tényleges foglalkozás összerendelése a tervezett célokkal:
  - előre definiált eszköz/tevékenység kiválasztásával, vagy
  - ad-hoc órai téma megadásával (pl. aktuális tantárgyi lemaradás pótlása), majd annak utólagos hozzárendelésével a fejlesztési célokhoz.
- Tanulói hiányzások és jelenlét rögzítése.

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

### 3.4. Rendszerarchitektúra és hordozhatóság
- Modern, böngészőfüggetlen webes felület (Chrome, Firefox, Safari, Edge legfrissebb főverziói).
- Konténerizált környezet (Docker) a reprodukálható helyi futtatás és fejlesztés támogatására.

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

```
</assistant>