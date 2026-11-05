## Határidők és feladatok

Az időpontok hétfő reggelekre vannak definiálva, de vasárnap éjfélként is értelmezhetőek.

- **09.28.**
    - [Feladatspecifikáció](./FELADAT.md)
    - [Adatbázis séma](./SEMA.md)
    - [Kattintható demó](https://keny3r.github.io/BME-VIK-mernokinfo-onlab-2-Adminisztracios-rendszer-fejlesztopedagogusoknak/profile.html)
    - [Ütemterv](.)
- **10.05.**
    - Landing page és [Bejelentkezés](./FUNKCIOK.md#bejelentkezés) implementálása
        - Fontend
            - Landing page
            - Bejelentkezés
- **10.12.**
    - [Profil](./FUNKCIOK.md#profil) implementálása
        - Koncepciók, amiket osztályokra fordítok / implementálom az üzleti logikáját
            - Fejlesztőpedagógus
            - Tanév
            - Iskola
            - Szakvélemény Kiállitó
        - Frontend
            - Profil menü
        - Elvárt eredmény
            - A demóban látható Profil menü elkészül
                - A fejlesztőpedagógus neve, illetve a tanévek, iskolák és szakvélemény kiállítók listái szerkeszthetőek.
- **10.19.**
    - [Fejlesztési repertoár](./FUNKCIOK.md#fejlesztési-repertoár) menü implementálása
        - Koncepciók, amiket osztályokra fordítok / implementálom az üzleti logikáját
            - Fejlesztési Terület
            - Fejlesztési Cél
            - Fejlesztési Eszköz
        - Frontend
            - Fejlesztési repertoár menü
        - Elvárt eredmény
            - A demóban látható Fejlesztési Területek menü elkészül
                - A [fejlesztési fa](./DEFINICIOK.md#fejlesztési-fa) egy újrafelhasználható komponensben látható és szerkeszthető lesz a felületen.
- **10.22.**
    - [Gyermekek](./FUNKCIOK.md#gyermekek) menü implementálása
        - A cél az, hogy a gyermekek adatai megfelelően kerüljenek be az adatbázisba minél kevesebb UI lépésben. A fejlesztési tervek generálásával még nem foglalkozunk.
        - Koncepciók, amiket osztályokra fordítok / implementálom az üzleti logikáját
            - Gyermekek
            - Szakvélemények
            - Fejlesztési Tervek
        - Frontend
            - Gyermekek menü
        - Elvárt eredmény
            - A demóban látható Gyermekek menü elkészül (PDF generálás nélkül)
- **10.29.**
    - [Fejlesztési tervek](./DEFINICIOK.md#fejlesztési-terv) generálása
        - PDF generátor endpoint létrehozása
            - FejlesztesiTervPdfService
        - Frontend
            - Gyermekek kiválasztása
            - Fejlesztési terv generálása gomb
            - PDF generátor modal
        - Elvárt eredmény
            - Fejlesztési terveket tudjunk generálni.
- Ezen a ponton mérlegelném a [szakértői vélemények beolvasása funkció](./FUNKCIOK.md#szakértői-vélemények-beolvasása) implementálását.

### OCR alapú beolvasás

Végül a [szakértői vélemények beolvasása funkció](./FUNKCIOK.md#szakértői-vélemények-beolvasása) implementálása mellett döntottam.

Az ütemterv így változik:

- **11.05.**
    - Konfigurálható beolvasás
        - Két lehetőség:
            - **Konfigurálható regex-ek**
                - Előnyök
                    - Gyors számítás
                    - Több OCR beolvasás lehetséges valós időben
                    - Testre szabható
                - Hátrányok
                    - Konfigurációs overhead
                    - Manuális beállítás, ha a default-ok nem elegek
            - **AI alapú megoldás**
                - Előnyök
                    - Univerzálisan működik
                    - Felismeri a kontextust
                - Hátrányok
                    - Költséges feldolgozás (adott esetben lassú)
- **11.12.**
    - A beolvasási flow oda-vissza csatolása az adat-rétegben
        - Minden, a kliensoldali alkalmazásban felvett adat kerüljön be az adat-rétegbe és fordítva
        - Új profil adatok beírása
            - Név, Iskolák, Szakszolgálatok stb. felvétele
- **11.19.**
    - [Fizetési Flow](./FUNKCIOK.md#fizetési-flow) implementálása
        - Stripe bekötése
        - Stripe integrációja a PDF generátor endpointokkal
            - FizetesService
        - Frontend
            - Fizetési flow a PDF generátorok menüiben.
        - Elvárt eredmény
            - Az alkalmazás fizetéssel együtt működik.
- **11.26.**
    - Célok és felvétele a PDF generálás folyamatába
        - Ne csak a területeket, hanem a célokat és eszközöket is ki lehessen választani
- **12.03.**
    - Manuális end-to-end tesztek írása
        - Deployment előtti checklist írása.
            - Persze nem fogjuk élesíteni az appot, de egy valós projektnél fontos lenne.
    - Automata end-to-end tesztek írása a legkritikusabb funkciókra (bejelentkezés, pdf generálás)
    - Elvárt eredmény
        - Minden funkció kész és a leírtaknak megfelelően működik
- **12.10.**
    - Önlab dokumentáció elkészítése
    - Prezentáció elkészítése


### Depracated

Végül az OCR megoldás fejlesztése mellett döntöttem.

- **11.05.**
    - [Foglalkozások](./FUNKCIOK.md#foglalkozások) menü implementálása 1
        - Koncepciók, amiket osztályokra fordítok / implementálom az üzleti logikáját
            - Foglalkozások
        - Frontend
            - Foglalkozások menü, komplex modalok nélkül.
        - Elvárt eredmény
            - Lehessen felvenni, szerkeszteni és törölni egy-egy foglalkozást. A megvalósulási számokkal még nem foglalkozunk.
- **11.12.**
    - [Foglalkozások](./FUNKCIOK.md#foglalkozások) menü implementálása 2
        - Koncepciók, amiket osztályokra fordítok / implementálom az üzleti logikáját
            - A fejlesztési tervek megvalósulásának számítása
        - Frontend
            - Teljes, megvalósulási számokkal segítséget nyújtó modal a foglalkozások menüben
        - Elvárt eredmény
            - A már felvehető foglalkozásokat bővítsük a megvalósulási számokkal, legyen másolható KRÉTA órai munka.
- **11.19.**
    - [Szöveges értékelés](./DEFINICIOK.md#szöveges-értékelés) generátor implementálása
        - PDF generátor endpoint létrehozása
            - SzovegesErtekelesPdfService
        - Elvárt eredmény
            - Szöveges értékeléseket tudjunk generálni.
- **11.26.**
    - [Fizetési Flow](./FUNKCIOK.md#fizetési-flow) implementálása
        - Stripe bekötése
        - Stripe integrációja a PDF generátor endpointokkal
            - FizetesService
        - Frontend
            - Fizetési flow a PDF generátorok menüiben.
        - Elvárt eredmény
            - Az alkalmazás fizetéssel együtt működik.
- **12.03.**
    - Manuális end-to-end tesztek írása
        - Deployment előtti checklist írása.
            - Persze nem fogjuk élesíteni az appot, de egy valós projektnél fontos lenne.
    - Automata end-to-end tesztek írása a legkritikusabb funkciókra (bejelentkezés, pdf generálás)
    - Elvárt eredmény
        - Minden funkció kész és a leírtaknak megfelelően működik
- **12.10.**
    - Önlab dokumentáció elkészítése
    - Prezentáció elkészítése
