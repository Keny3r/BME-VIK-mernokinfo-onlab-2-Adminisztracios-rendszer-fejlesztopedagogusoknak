---
eszköz: Google Gemini
modell: gemini flash 3.8
dátum: 2026.09.26.
---

<user>
Hogyan kell githubon github paget indítani?
Az egyik repó része egy demo weboldal
Fel is van pusholva
</user>

<assistant>
A GitHub Pages bekapcsolása közvetlenül a repó beállításaiból történik. A folyamat attól függ, hogy a demo weboldal fájljai a repó gyökerében, vagy egy almappában (pl. `docs/`, `build/`) találhatók-e.

1. **Nyisd meg a Settings fület:**
Lépj be a repó főoldalára a GitHubon, majd a felső menüsorban kattints a **Settings** fülre.


2. **Válaszd a Pages menüpontot:**
A bal oldali oldalsávban görgess a **Code and automation** szekcióhoz, majd kattints a **Pages** lehetőségre.


3. **Állítsd be a forrást (Source):**
A **Build and deployment** résznél a *Source* legyen **Deploy from a branch**.


4. **Válaszd ki a Branch-et és a mappát:**
A **Branch** lenyílóban válaszd ki az ágat (általában `main` vagy `master`).

A mappa választónál két lehetőséged van:

* **/ (root):** Ha az `index.html` közvetlenül a repó legfelső szintjén található.
* **/docs:** Ha a weboldal fájljait egy `docs` nevű mappába tetted.

Kattints a **Save** gombra.


5. **Várd meg a build lefutását:**
A mentés után a GitHub automatikusan elindít egy GitHub Action munkafolyamatot. 1-2 perc múlva az oldal tetején megjelenik az élő link:

`https://<felhasznalonev>.github.io/<repo-nev>/`


---

### Mi van, ha a weboldal egy másik almappában van?

A natív Pages beállítás csak a gyökérkönyvtárat (`/`) vagy a `/docs` mappát engedi kiválasztani. Ha a demód más almappában van (például `demo/` vagy React/Vite esetén `dist/`):

1. **Egyszerűbb megoldás:** Nevezd át vagy mozgasd a mappát `docs`-ra a repóban, pushold fel, és a fenti 4. lépésben válaszd a `/docs` opciót.
2. **Külön branch használata (gh-pages):** Pushold ki csak a demo mappa tartalmát egy különálló `gh-pages` nevű ágra:
```bash
git subtree push --prefix demo origin gh-pages

```


Ezután a Pages beállításainál válaszd a `gh-pages` branch-et és a `/ (root)` mappát.
</assistant>