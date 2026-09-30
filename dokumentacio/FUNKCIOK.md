## Funkciók

Az alábbiakban az alkalmazás funkcióit tárgyaljuk menünkénti lebontásban.

### Bejelentkezés

A fejlesztőpedagógus a webes applikációba email címmel tud belépni.
- [Non blocker](#non-blocker) Google bejelentkezés.

### Profil

A fejlesztőpedagógus alapadatait jeleníti meg.

- **Név**
    - Szerkeszthető szöveg
- **Iskolák**
    - A fejlesztőpedagógus által eddig "felvett" összes iskola listája.
    - Lehet törölni, elemet szerkeszteni, új elemet felvenni.
    - Igazából ajánláshoz használjuk a gyermekek felvételénél
        - 1-2 intézménynél több valószínűleg nem is lesz pedagógusonként
        - Automatikusan felvesszük, ha a pedagógus új intézmény nevét írja be valamelyik gyermekhez
- **Szakvélemény Kiállítók**
    - Ugyanaz, mint az Iskolák, csak ez a gyermekek egy más dimenziója.
- **Tanévek**
    - A fejlesztőpedagógus által felvett tanévek listája.
    - A tanév koncepcióhoz tartoznak a gyermekek és foglalkozások
        - Mindig van egy aktív tanév, amit a fejlesztőpedagógus szabadon állíthat
            - A fejlesztőpedagógus létrehozásakor beállítunk egyet a jelenlegi dátum alapján
        - Az aktív tanévhez tartoznak az éppen megjelenített gyermekek és foglalkozások
    - Tanéveket fel lehet venni, lehet törölni - megerősítés - lehet szerkeszteni (például a név átírása "2025/2026-ról" "2025/26 Iskolanév"-re, ha például a fejlesztő munkahelyet vált a tanév közben.)
        - A tanév felvétele folyamat során felajánljuk, hogy a pedagógus "átmásolhassa" az éppen aktív tanév gyermek adatait a következő listába.
            - Ezek az adatok a *tanev_gyermekei* táblában található nevek és az ehhez csatolt [fejlesztési tervek](./DEFINICIOK.md#fejlesztési-terv).

### [Fejlesztési "repertoár"](./DEFINICIOK.md#fejlesztési-repertoár)

A cél, hogy egy közös [fejlesztési repertoár](./DEFINICIOK.md#fejlesztési-repertoár) fenntartásával a gyermekek egyéni [fejlesztési tervei](./DEFINICIOK.md#fejlesztési-terv) és később a foglalkozások egy-egy kattintással felvehetőek legyenek. Ez egy hierarchikus struktúra, amely [területek](./DEFINICIOK.md#fejlesztési-terület) -> [célok](./DEFINICIOK.md#fejlesztési-cél) -> [eszközök](./DEFINICIOK.md#fejlesztési-eszköz) képében épül fel.

- **[Fejlesztési Területek](./DEFINICIOK.md#fejlesztési-terület)**
    - A [fa](./DEFINICIOK.md#fejlesztési-fa) struktúra felső szintje.
    - A [szakvéleményekben](./DEFINICIOK.md#szakvélemény) szabad szöveges leírásban szerepel(het)nek ezek, vagy a fejlesztőpedagógusnak kell kitalálnia, hogy mire gondolt a bölcs kiállító.
    - Lehet területet felvenni, szerkeszteni, törölni.
    - A területek [célokat](./DEFINICIOK.md#fejlesztési-cél) tartalmaz(hat)nak.

- **[Fejlesztési célok](./DEFINICIOK.md#fejlesztési-cél)**
    - A [fa](./DEFINICIOK.md#fejlesztési-fa) [fejlesztési területek](./DEFINICIOK.md#fejlesztési-terület) alá rendelt szintje.
    - Ezeket minden gyermeknél a fejlesztőpedagógus határozza meg és a területekhez rendeli.
        - Az egyéni [fejlesztési tervek](./DEFINICIOK.md#fejlesztési-terv) lényege a valós célok kitűzése és a törekvés arra, hogy ezeket elérjük.
    - Lehet célokat felvenni, szerkeszteni, törölni.
    - A célok [eszközöket](./DEFINICIOK.md#fejlesztési-eszköz) tartalmaz(hat)nak.

- **[Fejlesztési eszközök](./DEFINICIOK.md#fejlesztési-eszköz)**
    - A [fejlesztési fa](./DEFINICIOK.md#fejlesztési-fa) [célok](./DEFINICIOK.md#fejlesztési-cél) alá rendelt szintje.
    - Ezeket a fejlesztőpedagógus határozza meg. A tervezett eszközök azok a tevékenységek, amelyeket a félév során a pedagógus el szeretne végezni a gyermekkel az adott cél elérése érdekében.

### Gyermekek

Az alkalmazásba a fejlesztőpedagógus a használat során több tanév gyermekeit is felveheti.

Ebben a menüben mindig az **aktív tanév** gyermekei jelennek meg.

- Lehet szerkeszteni, felvenni és törölni (a törlés csak az aktív tanévből törli a gyermeket, a gyermek [törzsadatai](./DEFINICIOK.md#gyermek-törzsadatai) megmaradnak).
- A gyermek tanévbe történő felvételekor ki lehet választani, hogy egy másik tanévbe felvett - és az aktív tanévben nem szereplő - gyermeket szeretne felvenni a pedagógus, vagy egy új diákot.
- Új gyermek felvételekor meg kell adni a [törzsadatait](./SEMA.md). Minden esetben meg kell adni a [tanévspecifikus adatait](./SEMA.md), továbbá meg kell határozni a [fejlesztési tervet](./DEFINICIOK.md#fejlesztési-terv), amelyben segítséget nyújt a [fejlesztési repertoár](./DEFINICIOK.md#fejlesztési-repertoár).
- A gyermekek listájából több gyermeket is kiválaszthat a fejlesztőpedagógus, hogy legenerálja a gyermekek [fejlesztési terveit](./DEFINICIOK.md#fejlesztési-terv) vagy [szöveges értékelését](DEFINICIOK.md#szöveges-értékelés).
    - A fejlesztési tervek determinisztikusan generálhatóak a gyermekekhez rendelt [fejlesztési fa](./DEFINICIOK.md#fejlesztési-fa) alapján.
    - A szöveges értékelés nem feltétlenül determinisztikus a fa és a [foglalkozások](#foglalkozások) alapján, de a fejlesztőórák során megvalósult fejlesztés alapján javaslatot tudunk generálni, amelyet a pedagógus exportálás előtt szerkeszthet.
        - A javaslatot a területekre generáljuk és a megvalósulási számokból tippeljük meg (a fejlesztés tényleges eredménye és a gyermekek felmérése a pedagógus dolga), viszont egy jó kiindulási alap lehet a következő logika
            - 0 megvalósulás esetén "kevéssé fejlődött"
            - 1-2 megvalósulás esetén "normál ütemben fejlődött"
            - 3+ megvalósulás esetén "nagymértékben fejlődött"

### Foglalkozások

A fejlesztőfoglalkozások strukturált naplózására használt eszköz. A KRÉTA rendszer lehetőséget nyújt a tanórák témájának szabad szöveges naplózására, viszont a [fejlesztési tervek](./DEFINICIOK.md#fejlesztési-terv) megvalósulásának nyomon követésére nem ad lehetőséget (pl. hány alkalommal foglalkozott a pedagógus az adott cél elérésével az adott gyermeknél).

- A fejlesztőpedagógus látja az aktív tanévben lezajlott foglalkozások listáját (a legújabb legfelül).
    - Felvehet új foglalkozást, szerkeszthet korábbi foglalkozásokat vagy törölhet egy foglalkozást.
    - Egy új foglalkozás felvételénél
        - Meg lehet adni a részt vevő gyermekek listáját
        - Meg lehet adni az elvégzett tevékenységet
            - Az elvégzett tevékenységek kiválasztásához a gyermekek [fejlesztési terveinek](./DEFINICIOK.md#fejlesztési-terv) uniója nyújt segítséget. Ebből a fából választhat a pedagógus alapesetben, de egyedi tevékenységet is felvehet.
                - Amennyiben egyedi tevékenységet vesz fel, azt [célokhoz](./DEFINICIOK.md#fejlesztési-cél) rendeli.
                - A célokhoz bekerül az újonnan felvett tevékenység a [fejlesztési repertoárba](DEFINICIOK.md#fejlesztési-repertoár)
        - Lehet látni, hogy melyik gyermeknél melyik cél hanyszor lett fejlesztve
            - Ez a gyermekek [fejlesztési fáinak](./DEFINICIOK.md#fejlesztési-fa) uniójában jelenik meg az alábbi módon:
                - Minden felvett gyermek egy oszlop
                - A fejlesztési fa minden eleme egy sor
                - A kettő metszetében mindenhol látszódik a megvalósulás száma
                    - Egy eszköz megvalósulási száma az összes olyan foglalkozás száma, amelyen a gyermek részt vett és az eszközt felvették
                    - Egy cél megvalósulási száma a hozzá tartozó eszközök megvalósulási számának összege (ide értjük azokat az eszközöket is, amelyek nem részei a fejlesztési tervnek, mert egyedi foglalkozás keretében vette fel a pedagógus)
                    - Egy terület megvalósulási száma a hozzá tartozó célok megvalósulási számának összege

### Fizetési flow

- A felületen két dologért lehet fizetni.
    - A fejlesztési tervek generálása.
    - A szöveges értékelés generálása.
- A cél az, hogy a pedagógusnak csak a PDF-ek legenerálásakor kelljen fizetnie, még ismeretlen összeget minden PDF után.
- [Non blocker](#non-blocker) A szöveges értékelések teljes, fizetéssel ellátott, körbetesztelt folyamata.

## Non blocker

Olyan funkció, amely elsősorban kényelmi szerepet lát el, nem érdemes miatta késleltetni a többi feladatot.
Célom implementálni, de csak akkor ha marad rá elég idő.
