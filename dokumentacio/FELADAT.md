# Fejlesztőpedagógus adminisztrációs webapp specifikáció

- **Tárgy:** BME VIK Mérnökinformatikus képzés, Önálló laboratórium 2
- **Név:** Frink Dávid
- **Konzulens:** Albert István
- **Tanszék:** AUT - Automatizálási és Alkalmazott Informatikai Tanszék

---

## 1. Bevezetés és háttér

A féléves feladatomként egy olyan webes adminisztrációs alkalmazást készítek, amely a köznevelési intézményekben dolgozó fejlesztőpedagógusok mindennapi szakmai munkáját és adminisztrációját hivatott támogatni. A rendszer fókusza a **Beilleszkedési, Tanulási, Magatartási Nehézséggel (BTMN)** küzdő tanulók nyilvántartása, a pedagógiai szakszolgálatok szakértői véleményeinek kezelése, valamint az egyéni és csoportos fejlesztő foglalkozások naplózásának digitális támogatása.

### BTMN vs. SNI fogalmi elhatárolás

A **Beilleszkedési, Tanulási, Magatartási Nehézséggel (BTMN)** küzdő tanulók valamilyen eseti hátránnyal rendelkeznek. Nem betegek, lemaradásuk átmeneti jellegű és felzárkóztatással behozható; velük nem gyógypedagógus, hanem fejlesztőpedagógus foglalkozik (szemben a Sajátos Nevelési Igényű - SNIs - tanulókkal). 

Ezek a gyermekek többnyire az összes tanórán részt vesznek, és a tanórákon felül – délután vagy a készségtárgyak sávjában – egyéni vagy kiscsoportos foglalkozások keretében kapnak célzott támogatást. A foglalkozások célja az eseti hiányosságok célzott felszámolása, biztosítva a tanulmányok zökkenőmentes folytatását a többségi oktatásban.

---

## 2. [Funkciók](./FUNKCIOK.md)

---

## 3. Nemfunkcionális követelmények

### 3.1. Adatvédelem és jogi megfelelőség (GDPR)
- **Különleges adatok kezelése:** A tanulási nehézségre és egészségügyi/pedagógiai felmérésekre vonatkozó adatok a [GDPR 9. cikke alapján](https://gdpr-text.com/hu/read/article-9/) különleges kategóriájú személyes adatnak minősülnek. A tárolásuk és kezelésük fokozott védelmet igényel.
- **Titkosítás:** Kötelező a titkosított adatátvitel (HTTPS/TLS 1.3) a kliens és a szerver között, valamint a szenzitív adatok és biztonsági mentések nyugalmi titkosítása (encryption at rest, pl. AES-256).
- **Adatminimalizálás és hozzáférés-védelem:** Csak a fejlesztéshez elengedhetetlenül szükséges adatok rögzítése engedélyezett. Az adatokhoz kizárólag a jogosult pedagógus férhet hozzá.

### 3.2. Biztonság és jogosultságkezelés
- Szerepkör-alapú hozzáférés-vezérlés (RBAC): minimálisan *Adminisztrátor* és *Fejlesztőpedagógus* szerepkörök elválasztása.
- Biztonságos hitelesítés, munkamenet-kezelés és védelem a gyakori sebezhetőségek ellen (OWASP Top 10).

### 3.3. Felhasználhatóság és ergonómia
- **Reszponzív felület:** Asztali gépen és táblagépen egyaránt kényelmesen kezelhető nézetek (a foglalkozások alatti gyors jelenléti és tevékenység-adminisztráció érdekében).
- **Gyors adatrögzítés:** A mindennapi órai adminisztráció minimális kattintásszámmal és intuitív kereső/választó mezőkkel elvégezhető kell, hogy legyen.

---

## 4. Hatókör és a féléves munka határai (Scope & Out of Scope)

### 4.1. In Scope (A félév során megvalósuló elemek)
- Önálló prototípus és tesztkörnyezet kiépítése szintetikus (anonimizált/mock) adatokkal.
- A fenti funkcionális követelmények teljes körű lefejlesztése: tanulók kezelése, szakvélemények rögzítése, célhierarchia kezelése, órai naplózás és év végi összesítő riport generálása.
- Az önálló laboratóriumi dokumentáció elkészítése.

### 4.2. Out of Scope (A félév keretein kívül eső elemek)
- **Éles üzembe állítás:** A félév végén egy működőképes, bemutatható, de még nem élesített alkalmazás jön létre; éles oktatási intézményi bevezetés nem történik valós tanulói adatokkal.
- **Központi e-napló hitelesítés:** Digitális aláírással ellátott, hivatalos állami törzskönyvi szintű archiválás biztosítása.
- **Natív mobilapplikáció:** Csak reszponzív webalkalmazás készül, iOS/Android natív app nem. (Amennyiben felmerül az igény, akkor a modern PWA irányt tekintsük át.)
