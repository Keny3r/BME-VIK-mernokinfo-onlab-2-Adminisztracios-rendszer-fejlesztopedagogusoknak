/**
 * BTMN Admin - Alkalmazás Koordinátor (Alpine.js)
 * Felelősség: Felhasználói felület állapota, lépésváltások és felhasználói interakciók
 */
document.addEventListener('alpine:init', () => {
  Alpine.data('btmnApp', () => ({
    // Lépések:
    // 1: Alap adatok
    // 2: Gyermek dokumentum feltöltés (2.1)
    // 3: Gyermek adatok űrlap (2.2)
    // 4: Területek képfeltöltés (2.3.1 - ha nem volt PDF)
    // 5: Területek egyesével átnézése (2.3.2)
    // 6: Kétlistás nézet (2.3.3)
    // 7: PDF kész / Befejezés (2.3.4 & 2.3.5)
    currentStep: 1,

    // 1. Alap adatok
    alapAdatok: {
      pedagogusNeve: '',
      iskola: '',
      szakszolgalat: '',
      tanev: ''
    },

    // 2. Gyermek adatai
    gyermek: {
      nev: '',
      anyjaNeve: '',
      szuletesiHelyEsIdo: '',
      forgalmiSzam: '',
      iktatoszam: '',
      osztaly: '',
      fejlesztesFormaja: '',
      hetiOraszam: '',
      felulvizsgalatIdeje: ''
    },

    // Előzmények a datalist-ekhez
    history: {
      osztalyok: [],
      formak: [],
      oraszamok: [],
      felulvizsgalatok: []
    },

    // OCR állapot
    ocrLoading: false,
    ocrProgress: 0,
    ocrStatus: '',
    ocrError: '',
    hasPdfUploaded: false,
    fullOcrText: '',

    // Területek állapota
    allTeruletek: [],
    extractedLines: [],
    matchedLines: [],
    currentLineIndex: 0,
    selectedTeruletek: [],
    unselectedTeruletek: [],

    // PDF állapot
    isPdfGenerating: false,
    generatedFileName: '',

    // Interaktív kamera állapot (Gyermek adatok)
    isCameraActive: false,
    cameraStream: null,
    cameraFields: [],
    currentCameraFieldIndex: 0,
    cameraScanning: false,
    cameraMatched: false,
    cameraMatchedValue: '',
    cameraWorker: null,
    cameraError: '',

    // Interaktív kamera állapot (Fejlesztési területek)
    isAreaCameraActive: false,
    areaCameraPhase: 'live', // 'live' | 'list'
    areaCameraStream: null,
    areaCameraWorker: null,
    areaCameraScanning: false,
    areaCameraError: '',
    areaLiveLines: [],
    areaAccumulatedLines: [],
    areaCapturedImageUrl: '',
    areaVideoAspectRatio: '16 / 9',
    isProcessingCapture: false,
    showFocusRing: false,
    focusRingX: 0,
    focusRingY: 0,
    areaScannedList: [],
    isFileUploadedModal: false,

    profilSuggestions: {
      iskola: [],
      szakszolgalat: [],
      tanev: []
    },

    get currentCameraField() {
      return this.cameraFields[this.currentCameraFieldIndex] || null;
    },

    getActiveAreaLinesCount() {
      return (this.areaScannedList || []).filter(l => l.selected).length;
    },

    getSelectedScannedCount() {
      return (this.areaScannedList || []).filter(l => l.selected).length;
    },

    async loadProfilData() {
      const kezdetiErtekek = { ...this.alapAdatok };

      try {
        const response = await fetch('/api/fejlesztesi-tervek/profil', {
          credentials: 'same-origin',
          cache: 'no-store',
          headers: { Accept: 'application/json' }
        });

        if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
          throw new Error(`Profil-API: ${response.status}`);
        }

        const profil = await response.json();

        this.profilSuggestions = {
          iskola: profil.iskola?.suggestions ?? [],
          szakszolgalat: profil.szakszolgalat?.suggestions ?? [],
          tanev: profil.tanev?.suggestions ?? []
        };

        const aktivErtekek = {
          pedagogusNeve: profil.pedagogusNeve ?? '',
          iskola: profil.iskola?.active ?? '',
          szakszolgalat: profil.szakszolgalat?.active ?? '',
          tanev: profil.tanev?.active ?? ''
        };

        for (const mezo of Object.keys(aktivErtekek)) {
          // Ne írjuk felül, amit a felhasználó a kérés közben módosított.
          if (this.alapAdatok[mezo] === kezdetiErtekek[mezo]) {
            this.alapAdatok[mezo] = aktivErtekek[mezo];
          }
        }
      } catch (error) {
        console.error('Nem sikerült betölteni a profiladatokat:', error);
      }
    },

    // ==========================================
    // ÉLETCIKLUS ÉS ADATBETÖLTÉS
    // ==========================================

    init() {
      this.loadInitialData();
      this.loadProfilData();
      this.initTeruletekData();
      if (window.OcrService && Array.isArray(window.OcrService.CAMERA_SCAN_FIELDS)) {
        this.cameraFields = window.OcrService.CAMERA_SCAN_FIELDS;
      }
    },

    loadInitialData() {
      const storage = window.StorageService;
      if (!storage) return;

      this.history = storage.loadChildHistory();

      const lastChild = storage.loadLastChildSettings();
      this.gyermek.osztaly = lastChild.osztaly || '';
      this.gyermek.fejlesztesFormaja = lastChild.fejlesztesFormaja || 'egyéni';
      this.gyermek.hetiOraszam = lastChild.hetiOraszam || 'heti 2 óra';
      this.gyermek.felulvizsgalatIdeje = lastChild.felulvizsgalatIdeje || '';
    },

    initTeruletekData() {
      if (typeof window !== 'undefined' && window.TERULETEK_DATA && Array.isArray(window.TERULETEK_DATA.teruletek)) {
        this.allTeruletek = JSON.parse(JSON.stringify(window.TERULETEK_DATA.teruletek));
        this.allTeruletek.sort((a, b) => (a.nev || '').localeCompare(b.nev || '', 'hu'));
        this.syncUnselectedList();
        return;
      }

      // Fallback helyi JSON betöltésre
      fetch('js/data/teruletek.json')
        .then(res => res.json())
        .then(data => {
          this.allTeruletek = data.teruletek || [];
          this.allTeruletek.sort((a, b) => (a.nev || '').localeCompare(b.nev || '', 'hu'));
          this.syncUnselectedList();
        })
        .catch(e => console.error('Nem sikerült betölteni a teruletek.json-t:', e));
    },

    syncUnselectedList() {
      const selectedNames = new Set(this.selectedTeruletek.map(t => t.nev));
      this.unselectedTeruletek = this.allTeruletek
        .filter(t => !selectedNames.has(t.nev))
        .sort((a, b) => (a.nev || '').localeCompare(b.nev || '', 'hu'));
    },

    // ==========================================
    // LÉPÉSNAVIGÁCIÓ
    // ==========================================

    goToStep(stepNumber) {
      if (this.isCameraActive) {
        this.stopCameraScanner();
      }
      if (this.isAreaCameraActive) {
        this.stopAreaCamera();
      }
      if (stepNumber < 1 || stepNumber > 7) return;
      this.currentStep = stepNumber;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // ==========================================
    // 1. LÉPÉS: ALAPADATOK
    // ==========================================

    submitAlapAdatok() {
      this.goToStep(2);
    },

    // ==========================================
    // 2. LÉPÉS: GYERMEK DOKUMENTUM FELTÖLTÉS
    // ==========================================

    async handleChildFileUpload(event) {
      const file = event.target.files ? event.target.files[0] : null;
      if (!file) return;

      this.ocrLoading = true;
      this.ocrProgress = 0;
      this.ocrStatus = 'Dokumentum előkészítése...';
      this.ocrError = '';

      try {
        const result = await window.OcrService.processDocument(file, {
          lang: 'hun',
          teruletek: this.allTeruletek,
          onProgress: ({ status, progress }) => {
            this.ocrStatus = status;
            this.ocrProgress = progress;
          }
        });

        // Gyermek adatok kitöltése
        if (result.childData) {
          if (result.childData.nev) this.gyermek.nev = result.childData.nev;
          if (result.childData.anyjaNeve) this.gyermek.anyjaNeve = result.childData.anyjaNeve;
          if (result.childData.szuletesiHelyEsIdo) this.gyermek.szuletesiHelyEsIdo = result.childData.szuletesiHelyEsIdo;
          if (result.childData.forgalmiSzam) this.gyermek.forgalmiSzam = result.childData.forgalmiSzam;
          if (result.childData.iktatoszam) this.gyermek.iktatoszam = result.childData.iktatoszam;
          if (result.childData.fejlesztesFormaja) this.gyermek.fejlesztesFormaja = result.childData.fejlesztesFormaja;
          if (result.childData.hetiOraszam) this.gyermek.hetiOraszam = result.childData.hetiOraszam;
          if (result.childData.felulvizsgalatIdeje) this.gyermek.felulvizsgalatIdeje = result.childData.felulvizsgalatIdeje;
        }

        // PDF esetén a felismert területeket is eltároljuk
        if (result.isPdf) {
          this.hasPdfUploaded = true;
          this.fullOcrText = result.fullText;
          if (result.areaLines && result.areaLines.length > 0) {
            this.extractedLines = result.areaLines;
          }
        } else {
          this.hasPdfUploaded = false;
        }

        this.goToStep(3);
      } catch (err) {
        console.error('OCR hiba a gyermek dokumentumnál:', err);
        this.ocrError = err.message || 'Hiba történt a fájl feldolgozása közben.';
      } finally {
        this.ocrLoading = false;
      }
    },

    skipChildUpload() {
      this.hasPdfUploaded = false;
      this.goToStep(3);
    },

    // ==========================================
    // INTERAKTÍV KAMERA SZKENNER METÓDUSOK
    // ==========================================

    async startCameraScanner() {
      this.cameraError = '';
      this.currentCameraFieldIndex = 0;
      this.cameraMatched = false;
      this.cameraMatchedValue = '';

      if (!window.OcrService || !Array.isArray(window.OcrService.CAMERA_SCAN_FIELDS)) {
        this.cameraError = 'Az OCR szolgáltatás nem érhető el.';
        return;
      }
      this.cameraFields = window.OcrService.CAMERA_SCAN_FIELDS;

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.cameraError = 'A böngésző nem támogatja a kamera elérését, vagy a kapcsolat nem biztonságos (HTTPS / localhost szükséges).';
        return;
      }

      try {
        this.cameraStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920, min: 1280 },
            height: { ideal: 1080, min: 720 }
          },
          audio: false
        });
      } catch (err) {
        try {
          this.cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false
          });
        } catch (err2) {
          console.error('Kamera hozzáférési hiba:', err2);
          this.cameraError = 'Nem sikerült elindítani a kamerát. Kérjük, engedélyezd a kamerahasználatot a böngészőben!';
          return;
        }
      }

      // Folyamatos autofókusz és expozíció aktiválása
      const track = this.cameraStream ? this.cameraStream.getVideoTracks()[0] : null;
      if (track && typeof track.getCapabilities === 'function' && typeof track.applyConstraints === 'function') {
        try {
          const caps = track.getCapabilities();
          const advanced = {};
          if (caps.focusMode && Array.isArray(caps.focusMode) && caps.focusMode.includes('continuous')) {
            advanced.focusMode = 'continuous';
          }
          if (caps.exposureMode && Array.isArray(caps.exposureMode) && caps.exposureMode.includes('continuous')) {
            advanced.exposureMode = 'continuous';
          }
          if (caps.whiteBalanceMode && Array.isArray(caps.whiteBalanceMode) && caps.whiteBalanceMode.includes('continuous')) {
            advanced.whiteBalanceMode = 'continuous';
          }
          if (Object.keys(advanced).length > 0) {
            await track.applyConstraints({ advanced: [advanced] });
          }
        } catch (e) {
          console.warn('Nem sikerült beállítani a kameraszkenner fókuszt:', e);
        }
      }

      this.isCameraActive = true;

      this.$nextTick(async () => {
        try {
          const video = this.$refs.cameraVideo;
          if (video && this.cameraStream) {
            video.srcObject = this.cameraStream;
            await video.play().catch(e => console.warn('Kamera videó lejátszási figyelmeztetés:', e));
          }

          if (!this.cameraWorker) {
            this.cameraWorker = await window.OcrService.initTesseractWorker('hun', null, {
              tessedit_pageseg_mode: '6',
              user_defined_dpi: '300'
            });
          }

          this.runCameraScanLoop();
        } catch (err) {
          console.error('Hiba a kameranézet inicializálásakor:', err);
          this.cameraError = 'Nem sikerült betölteni a szövegfelismerő komponenst.';
          this.stopCameraScanner();
        }
      });
    },

    stopCameraScanner() {
      this.isCameraActive = false;
      this.cameraScanning = false;
      this.cameraMatched = false;
      this.showFocusRing = false;

      if (this.cameraStream) {
        try {
          this.cameraStream.getTracks().forEach(t => t.stop());
        } catch (_) {}
        this.cameraStream = null;
      }

      const video = this.$refs.cameraVideo;
      if (video) {
        video.srcObject = null;
      }

      if (this.cameraWorker) {
        try {
          this.cameraWorker.terminate();
        } catch (_) {}
        this.cameraWorker = null;
      }
    },

    cancelCameraScanner() {
      this.stopCameraScanner();
    },

    async triggerChildCameraFocus(event) {
      if (!this.isCameraActive) return;

      const track = this.cameraStream ? this.cameraStream.getVideoTracks()[0] : null;
      if (!track) return;

      if (event && event.currentTarget) {
        const rect = event.currentTarget.getBoundingClientRect();
        this.focusRingX = Math.round(event.clientX - rect.left);
        this.focusRingY = Math.round(event.clientY - rect.top);
        this.showFocusRing = true;
        setTimeout(() => { this.showFocusRing = false; }, 850);
      }

      if (typeof track.getCapabilities === 'function' && typeof track.applyConstraints === 'function') {
        try {
          const caps = track.getCapabilities();
          const advanced = {};
          if (caps.focusMode && Array.isArray(caps.focusMode) && caps.focusMode.includes('continuous')) {
            advanced.focusMode = 'continuous';
          }
          if (Object.keys(advanced).length > 0) {
            await track.applyConstraints({ advanced: [advanced] });
          }
        } catch (_) {}
      }
    },

    skipCameraField() {
      if (this.cameraMatched) return;

      if (this.currentCameraFieldIndex < this.cameraFields.length - 1) {
        this.currentCameraFieldIndex++;
      } else {
        this.finishCameraScanner();
      }
    },

    async handleCameraFieldSuccess(fieldKey, val) {
      if (!val || this.cameraMatched) return;

      this.cameraMatched = true;
      this.cameraMatchedValue = val;

      if (fieldKey && Object.prototype.hasOwnProperty.call(this.gyermek, fieldKey)) {
        this.gyermek[fieldKey] = val;
      }

      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        try {
          navigator.vibrate(60);
        } catch (_) {}
      }

      // Rövid szünet a vizuális siker visszajelzéshez (~700ms)
      await new Promise(resolve => setTimeout(resolve, 700));

      this.cameraMatched = false;
      this.cameraMatchedValue = '';

      if (this.currentCameraFieldIndex < this.cameraFields.length - 1) {
        this.currentCameraFieldIndex++;
      } else {
        this.finishCameraScanner();
      }
    },

    finishCameraScanner() {
      this.stopCameraScanner();
      this.goToStep(3);
    },

    async runCameraScanLoop() {
      while (this.isCameraActive) {
        if (this.cameraMatched || this.cameraScanning) {
          await new Promise(resolve => setTimeout(resolve, 200));
          continue;
        }

        const video = this.$refs.cameraVideo;
        const slot = this.$refs.cameraViewfinder;

        if (!video || !slot || video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
          await new Promise(resolve => setTimeout(resolve, 200));
          continue;
        }

        this.cameraScanning = true;

        try {
          if (!this._cropCanvas) {
            this._cropCanvas = document.createElement('canvas');
          }

          const vRect = video.getBoundingClientRect();
          const sRect = slot.getBoundingClientRect();

          const videoRatio = video.videoWidth / video.videoHeight;
          const elemRatio = vRect.width / vRect.height;
          let visibleWidth, visibleHeight, offsetX, offsetY;

          if (elemRatio > videoRatio) {
            visibleWidth = vRect.width;
            visibleHeight = vRect.width / videoRatio;
            offsetX = 0;
            offsetY = (vRect.height - visibleHeight) / 2;
          } else {
            visibleHeight = vRect.height;
            visibleWidth = vRect.height * videoRatio;
            offsetY = 0;
            offsetX = (vRect.width - visibleWidth) / 2;
          }

          const scale = video.videoWidth / visibleWidth;
          const sx = Math.max(0, (sRect.left - vRect.left - offsetX) * scale);
          const sy = Math.max(0, (sRect.top - vRect.top - offsetY) * scale);
          const sw = Math.min(video.videoWidth - sx, sRect.width * scale);
          const sh = Math.min(video.videoHeight - sy, sRect.height * scale);

          if (sw > 20 && sh > 20) {
            this._cropCanvas.width = sw;
            this._cropCanvas.height = sh;
            const ctx = this._cropCanvas.getContext('2d', { willReadFrequently: true });
            ctx.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);

            // Adaptív képszűrés a beolvasó sávban: árnyékok megszüntetése, papír fehérítése, betűkontraszt
            try {
              const imgData = ctx.getImageData(0, 0, sw, sh);
              window.OcrService.processImageData(imgData.data, sw, sh);
              ctx.putImageData(imgData, 0, 0);
            } catch (_) {}

            if (this.cameraWorker && this.isCameraActive) {
              const res = await this.cameraWorker.recognize(this._cropCanvas);
              const text = res?.data?.text || '';

              if (text && this.isCameraActive && !this.cameraMatched) {
                const currentField = this.cameraFields[this.currentCameraFieldIndex];
                if (currentField) {
                  const matched = window.OcrService.matchCameraField(currentField.key, text);
                  if (matched) {
                    await this.handleCameraFieldSuccess(currentField.key, matched);
                  }
                }
              }
            }
          }
        } catch (e) {
          console.warn('Képkocka OCR hiba:', e);
        } finally {
          this.cameraScanning = false;
        }

        await new Promise(resolve => setTimeout(resolve, 200));
      }
    },

    // ==========================================
    // 3. LÉPÉS: GYERMEK ADATAI ŰRLAP
    // ==========================================

    submitGyermekAdatok() {
      if (!this.gyermek.nev || !this.gyermek.nev.trim()) {
        alert('A gyermek nevének megadása kötelező!');
        return;
      }

      if (this.gyermek.hetiOraszam && this.gyermek.hetiOraszam.trim()) {
        const match = this.gyermek.hetiOraszam.match(/\b(\d+)\b/);
        if (match) {
          this.gyermek.hetiOraszam = `heti ${match[1]} óra`;
        }
      }

      if (this.gyermek.felulvizsgalatIdeje && this.gyermek.felulvizsgalatIdeje.trim()) {
        const yearMatch = this.gyermek.felulvizsgalatIdeje.match(/\b(20\d{2}\s*[/–-]\s*(?:20\d{2}|\d{2}))\b/);
        if (yearMatch) {
          this.gyermek.felulvizsgalatIdeje = yearMatch[1].replace(/\s+/g, '').replace(/[–-]/g, '/');
        }
      }

      if (window.StorageService) {
        this.history = window.StorageService.saveChildHistory(this.history, this.gyermek);
        window.StorageService.saveLastChildSettings(this.gyermek);
      }

      if (this.hasPdfUploaded) {
        this.startAreasReview();
      } else {
        this.goToStep(4);
      }
    },

    // ==========================================
    // 4. LÉPÉS: TERÜLETEK KÉPFELTÖLTÉSE
    // ==========================================

    async handleAreasImageUpload(event) {
      const file = event.target.files ? event.target.files[0] : null;
      if (!file) return;

      this.ocrLoading = true;
      this.ocrProgress = 0;
      this.ocrStatus = 'Fájl előkészítése...';
      this.ocrError = '';

      try {
        const result = await window.OcrService.processDocument(file, {
          lang: 'hun',
          isAreaUpload: true,
          threshold: 65,
          teruletek: this.allTeruletek,
          onProgress: ({ status, progress }) => {
            this.ocrStatus = status;
            this.ocrProgress = progress;
          }
        });

        const lines = (result.allCleanedLines && result.allCleanedLines.length > 0)
          ? result.allCleanedLines
          : window.OcrService.extractCleanedImageLines(result.fullText).filter(l => l.length >= 3);

        if (lines && lines.length > 0) {
          this.areaScannedList = lines.map(line => {
            let bestScore = 0;
            let bestTerulet = null;
            if (this.allTeruletek && this.allTeruletek.length > 0) {
              for (const t of this.allTeruletek) {
                const score = window.MatchingService.scoreMatch(t.nev, line);
                if (score > bestScore) {
                  bestScore = score;
                  bestTerulet = t;
                }
                if (bestScore === 100) break;
              }
            }
            return {
              id: 'scan_' + Math.random().toString(36).substring(2, 9),
              text: line,
              score: bestScore,
              bestTerulet: bestTerulet,
              selected: bestScore >= 65
            };
          });

          this.isFileUploadedModal = true;
          this.isAreaCameraActive = true;
          this.areaCameraPhase = 'list';
        } else {
          this.extractedLines = [];
          alert('A feltöltött fájlban nem található észlelhető szövegsor. Kérjük, válaszd ki a területeket a listából!');
          this.syncUnselectedList();
          this.goToStep(6);
        }
      } catch (err) {
        console.error('OCR hiba a területek fájlnál:', err);
        this.ocrError = err.message || 'Hiba történt a fájl feldolgozása során.';
      } finally {
        this.ocrLoading = false;
        if (event && event.target) {
          event.target.value = '';
        }
      }
    },

    skipAreasImageUpload() {
      this.startAreasReview();
    },

    // ==========================================
    // TERÜLETEK INTERAKTÍV KAMERA METÓDUSOK
    // ==========================================

    async startAreaCamera() {
      this.areaCameraError = '';
      this.areaCameraPhase = 'live';
      this.areaScannedList = [];
      this.areaAccumulatedLines = [];
      this.isFileUploadedModal = false;
      this.areaCapturedImageUrl = '';
      this.areaVideoAspectRatio = '16 / 9';
      this.isProcessingCapture = false;
      this.showFocusRing = false;

      if (!window.OcrService) {
        this.areaCameraError = 'Az OCR szolgáltatás nem érhető el.';
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.areaCameraError = 'A böngésző nem támogatja a kamera elérését, vagy a kapcsolat nem biztonságos (HTTPS / localhost szükséges).';
        return;
      }

      try {
        this.areaCameraStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920, min: 1280 },
            height: { ideal: 1080, min: 720 }
          },
          audio: false
        });
      } catch (err) {
        // Fallback egyszerűbb kérésre
        try {
          this.areaCameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false
          });
        } catch (err2) {
          console.error('Kamera hozzáférési hiba (területek):', err2);
          this.areaCameraError = 'Nem sikerült elindítani a kamerát. Kérjük, engedélyezd a kamerahasználatot a böngészőben!';
          return;
        }
      }

      // Folyamatos autofókusz és expozíció aktiválása a hardveren (ha a készülék támogatja)
      const track = this.areaCameraStream ? this.areaCameraStream.getVideoTracks()[0] : null;
      if (track && typeof track.getCapabilities === 'function' && typeof track.applyConstraints === 'function') {
        try {
          const caps = track.getCapabilities();
          const advanced = {};
          if (caps.focusMode && Array.isArray(caps.focusMode) && caps.focusMode.includes('continuous')) {
            advanced.focusMode = 'continuous';
          }
          if (caps.exposureMode && Array.isArray(caps.exposureMode) && caps.exposureMode.includes('continuous')) {
            advanced.exposureMode = 'continuous';
          }
          if (caps.whiteBalanceMode && Array.isArray(caps.whiteBalanceMode) && caps.whiteBalanceMode.includes('continuous')) {
            advanced.whiteBalanceMode = 'continuous';
          }
          if (Object.keys(advanced).length > 0) {
            await track.applyConstraints({ advanced: [advanced] });
          }
        } catch (e) {
          console.warn('Nem sikerült beállítani az autofókuszt:', e);
        }
      }

      this.isAreaCameraActive = true;

      this.$nextTick(async () => {
        try {
          const video = this.$refs.areaCameraVideo;
          if (video && this.areaCameraStream) {
            video.srcObject = this.areaCameraStream;
            video.onloadedmetadata = () => {
              if (video.videoWidth && video.videoHeight) {
                this.areaVideoAspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
              }
            };
            await video.play().catch(e => console.warn('Kamera videó lejátszási figyelmeztetés:', e));
          }

          if (!this.areaCameraWorker) {
            // Tesseract worker előkészítése a háttérben
            this.areaCameraWorker = await window.OcrService.initTesseractWorker('hun', null, {
              tessedit_pageseg_mode: '6',
              user_defined_dpi: '300'
            });
          }
        } catch (err) {
          console.error('Hiba a terület kameranézet inicializálásakor:', err);
          this.areaCameraError = 'Nem sikerült betölteni a szövegfelismerő komponenst.';
          this.stopAreaCamera();
        }
      });
    },

    stopAreaCamera() {
      this.isAreaCameraActive = false;
      this.areaCameraScanning = false;
      this.areaCameraPhase = 'live';
      this.isProcessingCapture = false;
      this.showFocusRing = false;

      if (this.areaCameraStream) {
        try {
          this.areaCameraStream.getTracks().forEach(t => t.stop());
        } catch (_) {}
        this.areaCameraStream = null;
      }

      const video = this.$refs.areaCameraVideo;
      if (video) {
        video.srcObject = null;
      }

      if (this.areaCameraWorker) {
        try {
          this.areaCameraWorker.terminate();
        } catch (_) {}
        this.areaCameraWorker = null;
      }

      this.areaLiveLines = [];
      this.areaCapturedImageUrl = '';
    },

    cancelAreaCamera() {
      this.areaScannedList = [];
      this.isFileUploadedModal = false;
      this.stopAreaCamera();
    },

    async triggerCameraFocus(event) {
      if (!this.isAreaCameraActive || this.areaCameraPhase !== 'live') return;

      const track = this.areaCameraStream ? this.areaCameraStream.getVideoTracks()[0] : null;
      if (!track) return;

      // Fókusz animáció a kattintás/érintés pontján
      if (event && event.currentTarget) {
        const rect = event.currentTarget.getBoundingClientRect();
        this.focusRingX = Math.round(event.clientX - rect.left);
        this.focusRingY = Math.round(event.clientY - rect.top);
        this.showFocusRing = true;
        setTimeout(() => { this.showFocusRing = false; }, 850);
      }

      // Hardveres fókusz újraélesítése
      if (typeof track.getCapabilities === 'function' && typeof track.applyConstraints === 'function') {
        try {
          const caps = track.getCapabilities();
          const advanced = {};
          if (caps.focusMode && Array.isArray(caps.focusMode) && caps.focusMode.includes('continuous')) {
            advanced.focusMode = 'continuous';
          }
          if (Object.keys(advanced).length > 0) {
            await track.applyConstraints({ advanced: [advanced] });
          }
        } catch (_) {}
      }
    },

    async captureAreaPhoto() {
      const video = this.$refs.areaCameraVideo;
      if (!video || !video.videoWidth || !video.videoHeight) {
        this.areaCameraPhase = 'list';
        return;
      }

      this.isProcessingCapture = true;

      // 1. Állókép rögzítése a teljes videó felbontásban
      const snapCanvas = document.createElement('canvas');
      snapCanvas.width = video.videoWidth;
      snapCanvas.height = video.videoHeight;
      const ctx = snapCanvas.getContext('2d');
      ctx.drawImage(video, 0, 0, snapCanvas.width, snapCanvas.height);

      this.areaCapturedImageUrl = snapCanvas.toDataURL('image/jpeg', 0.92);

      // 2. Kép előfeldolgozása nagy felbontású OCR-hez
      const processed = window.OcrService.preprocessCanvasForOcr(snapCanvas, { maxDim: 1800 });

      // 3. Szövegfelismerés futtatása
      let rawText = '';
      if (this.areaCameraWorker) {
        try {
          const res = await this.areaCameraWorker.recognize(processed.canvas);
          rawText = (res && res.data && res.data.text) ? res.data.text : '';

          // Fallback: Ha PSM 6-tal nem találtunk szöveget, próbáljuk meg PSM 4-gyel
          if (!rawText.trim() && typeof this.areaCameraWorker.setParameters === 'function') {
            await this.areaCameraWorker.setParameters({ tessedit_pageseg_mode: '4' });
            const res4 = await this.areaCameraWorker.recognize(processed.canvas);
            rawText = (res4 && res4.data && res4.data.text) ? res4.data.text : '';
            await this.areaCameraWorker.setParameters({ tessedit_pageseg_mode: '6' });
          }
        } catch (e) {
          console.warn('Állókép OCR hiba:', e);
        }
      }

      // 4. Szövegtisztítás és összefűzés
      const cleanedLines = window.OcrService.extractCleanedImageLines(rawText).filter(l => l.length >= 3);

      // 5. Matchelés és pontszámítás
      const newItems = cleanedLines.map(line => {
        let bestScore = 0;
        let bestTerulet = null;
        if (this.allTeruletek && this.allTeruletek.length > 0) {
          for (const t of this.allTeruletek) {
            const sc = window.MatchingService.scoreMatch(t.nev, line);
            if (sc > bestScore) {
              bestScore = sc;
              bestTerulet = t;
            }
            if (bestScore === 100) break;
          }
        }
        return {
          id: 'scan_' + Math.random().toString(36).substring(2, 9),
          text: line,
          score: bestScore,
          bestTerulet: bestTerulet,
          selected: bestScore >= 65
        };
      });

      // Új képek hozzáadása a meglévő listához duplikátumok nélkül
      if (!this.areaScannedList || this.areaScannedList.length === 0) {
        this.areaScannedList = newItems;
      } else {
        const existingTexts = new Set(this.areaScannedList.map(i => i.text.toLowerCase().trim()));
        for (const item of newItems) {
          if (!existingTexts.has(item.text.toLowerCase().trim())) {
            this.areaScannedList.push(item);
          }
        }
      }

      this.isProcessingCapture = false;
      this.areaCameraPhase = 'list';
    },

    toggleScannedItem(item) {
      if (!item) return;
      item.selected = !item.selected;
    },

    retakeAreaPhoto() {
      if (this.isFileUploadedModal) {
        this.stopAreaCamera();
        this.isFileUploadedModal = false;
      } else {
        this.areaScannedList = [];
        this.areaCameraPhase = 'live';
      }
    },

    addNewAreaPhoto() {
      this.areaCameraPhase = 'live';
    },

    finishAreaScannedToSuggestions() {
      const selected = (this.areaScannedList || [])
        .filter(i => i.selected && i.text)
        .map(i => i.text.replace(/[\s:;.,\-–—_]+$/, '').trim())
        .filter(t => t.length > 0);

      this.stopAreaCamera();
      this.isFileUploadedModal = false;

      if (selected.length === 0) {
        // Ha semmi sincs kijelölve, rögtön átlépünk a kétlistás nézetbe (6. lépés)
        this.selectedTeruletek = [];
        this.syncUnselectedList();
        this.goToStep(6);
      } else {
        this.extractedLines = selected;
        this.startAreasReview();
      }
    },

    // Kompatibilitási aliasok
    captureAreaCameraNext() {
      return this.captureAreaPhoto();
    },
    toggleAreaLine(line) {
      return this.toggleScannedItem(line);
    },
    finishAreaCameraToSuggestions() {
      return this.finishAreaScannedToSuggestions();
    },

    // ==========================================
    // 5. LÉPÉS: TERÜLETEK EGYENKÉNTI ÁTNÉZÉSE
    // ==========================================

    startAreasReview() {
      if (this.extractedLines && this.extractedLines.length > 0) {
        const matched = window.MatchingService.matchLines(this.extractedLines, this.allTeruletek);
        this.matchedLines = matched.map(line => {
          const suggestions = (line.recommendations || []).slice(0, 4);
          const selectedNames = [];
          if (suggestions.length > 0 && suggestions[0].score >= 65) {
            selectedNames.push(suggestions[0].terulet.nev);
          }
          return {
            rawLine: line.rawLine,
            suggestions,
            selectedNames
          };
        });
        this.currentLineIndex = 0;
        this.goToStep(5);
      } else {
        this.syncUnselectedList();
        this.goToStep(6);
      }
    },

    getCurrentMatchedLine() {
      if (!this.matchedLines || !this.matchedLines[this.currentLineIndex]) {
        return null;
      }
      return this.matchedLines[this.currentLineIndex];
    },

    getTopSuggestions() {
      const cur = this.getCurrentMatchedLine();
      return cur && cur.suggestions ? cur.suggestions : [];
    },

    isAreaSelectedInCurrentLine(nev) {
      const cur = this.getCurrentMatchedLine();
      return !!(cur && cur.selectedNames && cur.selectedNames.includes(nev));
    },

    toggleAreaSelection(terulet) {
      if (!terulet) return;
      const cur = this.getCurrentMatchedLine();
      if (!cur) return;
      if (!cur.selectedNames) cur.selectedNames = [];

      const idx = cur.selectedNames.indexOf(terulet.nev);
      if (idx > -1) {
        cur.selectedNames.splice(idx, 1);
      } else {
        cur.selectedNames.push(terulet.nev);
      }
    },

    addCustomAreaToCurrentLine(areaName) {
      if (!areaName) return;
      const cur = this.getCurrentMatchedLine();
      if (!cur) return;

      const terulet = this.allTeruletek.find(t => t.nev === areaName);
      if (!terulet) return;

      if (!cur.suggestions) cur.suggestions = [];
      const existing = cur.suggestions.find(s => s.terulet && s.terulet.nev === areaName);
      if (!existing) {
        const score = window.MatchingService ? window.MatchingService.scoreMatch(terulet.nev, cur.rawLine) : null;
        cur.suggestions.push({
          terulet,
          score
        });
      }

      if (!cur.selectedNames) cur.selectedNames = [];
      if (!cur.selectedNames.includes(areaName)) {
        cur.selectedNames.push(areaName);
      }
    },

    goToPreviousLineOrStep() {
      if (this.currentLineIndex > 0) {
        this.currentLineIndex--;
      } else {
        this.goToStep(this.hasPdfUploaded ? 3 : 4);
      }
    },

    advanceLineReview() {
      this.currentLineIndex++;
      if (this.currentLineIndex >= this.matchedLines.length) {
        this.applyMatchedLinesUnion();
        this.goToStep(6);
      }
    },

    applyMatchedLinesUnion() {
      const chosenNames = [];
      const chosenMap = new Map();

      if (this.matchedLines && Array.isArray(this.matchedLines)) {
        for (const line of this.matchedLines) {
          if (line.selectedNames && Array.isArray(line.selectedNames)) {
            for (const name of line.selectedNames) {
              if (!chosenMap.has(name)) {
                let areaObj = null;
                if (line.suggestions) {
                  const found = line.suggestions.find(s => s.terulet && s.terulet.nev === name);
                  if (found) areaObj = found.terulet;
                }
                if (!areaObj) {
                  areaObj = this.allTeruletek.find(t => t.nev === name);
                }
                if (areaObj) {
                  chosenMap.set(name, areaObj);
                  chosenNames.push(name);
                }
              }
            }
          }
        }
      }

      this.selectedTeruletek = chosenNames
        .map(name => chosenMap.get(name))
        .filter(Boolean)
        .sort((a, b) => (a.nev || '').localeCompare(b.nev || '', 'hu'));
      this.syncUnselectedList();
    },

    // ==========================================
    // 6. LÉPÉS: KÉTLISTÁS NÉZET
    // ==========================================

    goBackFromTwoLists() {
      if (this.matchedLines && this.matchedLines.length > 0) {
        this.currentLineIndex = this.matchedLines.length - 1;
        this.goToStep(5);
      } else {
        this.goToStep(this.hasPdfUploaded ? 3 : 4);
      }
    },

    moveToSelected(terulet) {
      if (!terulet) return;
      if (!this.selectedTeruletek.some(t => t.nev === terulet.nev)) {
        this.selectedTeruletek.push(terulet);
        this.selectedTeruletek.sort((a, b) => (a.nev || '').localeCompare(b.nev || '', 'hu'));
      }
      this.syncUnselectedList();
    },

    moveToUnselected(index) {
      if (index >= 0 && index < this.selectedTeruletek.length) {
        this.selectedTeruletek.splice(index, 1);
        this.syncUnselectedList();
      }
    },

    // ==========================================
    // 7. LÉPÉS: PDF GENERÁLÁS ÉS BEFEJEZÉS
    // ==========================================

    generatePdf() {
      if (this.selectedTeruletek.length === 0) {
        alert('Legalább egy fejlesztési területet ki kell választani a PDF előállításához!');
        return;
      }

      this.isPdfGenerating = true;

      try {
        const payload = {
          ...this.alapAdatok,
          ...this.gyermek,
          selectedTeruletek: this.selectedTeruletek
        };

        const pdfService = window.PdfService || window.PdfGenerator;
        const filename = pdfService.generateDevelopmentPlanPdf(payload);
        this.generatedFileName = filename;

        if (window.StorageService) {
          window.StorageService.saveAlapAdatok(this.alapAdatok);
          window.StorageService.saveChildHistory(this.history, this.gyermek);
          window.StorageService.saveLastChildSettings(this.gyermek);
        }

        this.goToStep(7);
      } catch (err) {
        console.error('Hiba a PDF generálás során:', err);
        alert('Nem sikerült legenerálni a PDF dokumentumot: ' + err.message);
      } finally {
        this.isPdfGenerating = false;
      }
    },

    downloadPdfAgain() {
      this.generatePdf();
    },

    resetForNewChild() {
      // Gyermek egyedi mezőinek törlése
      this.gyermek.nev = '';
      this.gyermek.anyjaNeve = '';
      this.gyermek.szuletesiHelyEsIdo = '';
      this.gyermek.forgalmiSzam = '';
      this.gyermek.iktatoszam = '';

      // Alaphelyzetbe állítás az új gyermekhez (alapadatok és default beállítások megmaradnak)
      this.hasPdfUploaded = false;
      this.fullOcrText = '';
      this.extractedLines = [];
      this.matchedLines = [];
      this.currentLineIndex = 0;
      this.selectedTeruletek = [];
      this.syncUnselectedList();

      this.areaAccumulatedLines = [];
      this.stopAreaCamera();

      this.ocrError = '';
      this.ocrStatus = '';
      this.ocrProgress = 0;

      this.goToStep(1);
    }
  }));
});
