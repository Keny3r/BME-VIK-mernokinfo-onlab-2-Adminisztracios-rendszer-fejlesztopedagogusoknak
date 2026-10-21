/**
 * BTMN Admin - Storage Service
 * Felelősség: Lokális adattárolás (alapadatok, előzmények, alapértelmezések) kezelése
 */
(function (root, factory) {
  const exported = factory();
  if (typeof define === 'function' && define.amd) {
    define([], () => exported);
  }
  if (typeof module === 'object' && module && module.exports) {
    module.exports = exported;
  }
  if (root) {
    root.StorageService = exported;
  }
}(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this), function () {
  'use strict';

  const KEYS = {
    ALAP_ADATOK: 'btmn_alap_adatok',
    CHILD_HISTORY: 'btmn_child_history',
    LAST_CHILD_SETTINGS: 'btmn_last_child_settings'
  };

  const DEFAULT_HISTORY = {
    osztalyok: ['1. osztály', '2. osztály', '3. osztály', '4. osztály', '5. osztály', '6. osztály'],
    formak: ['egyéni', 'csoportos'],
    oraszamok: ['heti 1 óra', 'heti 2 óra', 'heti 3 óra', 'heti 4 óra'],
    felulvizsgalatok: []
  };

  // Memória fallback ha a localStorage nem érhető el (pl. sandbox / letiltott cookie-k)
  const memoryFallback = new Map();

  function safeGetItem(key) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      // Ignored - fallback memóriára
    }
    return memoryFallback.get(key) || null;
  }

  function safeSetItem(key, value) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      // Ignored - fallback memóriára
    }
    memoryFallback.set(key, value);
  }

  function getDefaultSchoolYear(refDate = new Date()) {
    const year = refDate.getFullYear();
    const month = refDate.getMonth() + 1;
    return month >= 8 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
  }

  function loadAlapAdatok() {
    const defaults = {
      pedagogusNeve: '',
      iskola: '',
      szakszolgalat: '',
      tanev: getDefaultSchoolYear()
    };

    const raw = safeGetItem(KEYS.ALAP_ADATOK);
    if (!raw) return defaults;

    try {
      const parsed = JSON.parse(raw);
      return {
        ...defaults,
        ...parsed,
        tanev: parsed.tanev || defaults.tanev
      };
    } catch (e) {
      return defaults;
    }
  }

  function saveAlapAdatok(data) {
    if (!data) return;
    safeSetItem(KEYS.ALAP_ADATOK, JSON.stringify({
      pedagogusNeve: data.pedagogusNeve || '',
      iskola: data.iskola || '',
      szakszolgalat: data.szakszolgalat || '',
      tanev: data.tanev || ''
    }));
  }

  function loadChildHistory() {
    const history = {
      osztalyok: [...DEFAULT_HISTORY.osztalyok],
      formak: [...DEFAULT_HISTORY.formak],
      oraszamok: [...DEFAULT_HISTORY.oraszamok],
      felulvizsgalatok: [...DEFAULT_HISTORY.felulvizsgalatok]
    };

    const raw = safeGetItem(KEYS.CHILD_HISTORY);
    if (!raw) return history;

    try {
      const parsed = JSON.parse(raw);
      if (parsed) {
        if (Array.isArray(parsed.osztalyok)) {
          history.osztalyok = Array.from(new Set([...parsed.osztalyok, ...history.osztalyok]));
        }
        if (Array.isArray(parsed.formak)) {
          history.formak = Array.from(new Set([...parsed.formak, ...history.formak]));
        }
        if (Array.isArray(parsed.oraszamok)) {
          history.oraszamok = Array.from(new Set([...parsed.oraszamok, ...history.oraszamok]));
        }
        if (Array.isArray(parsed.felulvizsgalatok)) {
          history.felulvizsgalatok = Array.from(new Set([...parsed.felulvizsgalatok, ...history.felulvizsgalatok]));
        }
      }
    } catch (e) {
      // Return defaults on corrupt data
    }

    return history;
  }

  function updateHistoryList(list, item) {
    if (!item || typeof item !== 'string') return list;
    const trimmed = item.trim();
    if (!trimmed) return list;
    return [trimmed, ...list.filter(x => x !== trimmed)];
  }

  function saveChildHistory(currentHistory, childData = null) {
    const safeHistory = currentHistory || {};
    const history = {
      osztalyok: [...(safeHistory.osztalyok || DEFAULT_HISTORY.osztalyok)],
      formak: [...(safeHistory.formak || DEFAULT_HISTORY.formak)],
      oraszamok: [...(safeHistory.oraszamok || DEFAULT_HISTORY.oraszamok)],
      felulvizsgalatok: [...(safeHistory.felulvizsgalatok || [])]
    };

    if (childData) {
      if (childData.osztaly) history.osztalyok = updateHistoryList(history.osztalyok, childData.osztaly);
      if (childData.fejlesztesFormaja) history.formak = updateHistoryList(history.formak, childData.fejlesztesFormaja);
      if (childData.hetiOraszam) history.oraszamok = updateHistoryList(history.oraszamok, childData.hetiOraszam);
      if (childData.felulvizsgalatIdeje) history.felulvizsgalatok = updateHistoryList(history.felulvizsgalatok, childData.felulvizsgalatIdeje);
    }

    safeSetItem(KEYS.CHILD_HISTORY, JSON.stringify(history));
    return history;
  }

  function loadLastChildSettings() {
    const defaults = {
      osztaly: '',
      fejlesztesFormaja: 'egyéni',
      hetiOraszam: 'heti 2 óra',
      felulvizsgalatIdeje: ''
    };

    const raw = safeGetItem(KEYS.LAST_CHILD_SETTINGS);
    if (!raw) return defaults;

    try {
      const parsed = JSON.parse(raw);
      return { ...defaults, ...parsed };
    } catch (e) {
      return defaults;
    }
  }

  function saveLastChildSettings(settings) {
    if (!settings) return;
    safeSetItem(KEYS.LAST_CHILD_SETTINGS, JSON.stringify({
      osztaly: settings.osztaly || '',
      fejlesztesFormaja: settings.fejlesztesFormaja || 'egyéni',
      hetiOraszam: settings.hetiOraszam || 'heti 2 óra',
      felulvizsgalatIdeje: settings.felulvizsgalatIdeje || ''
    }));
  }

  return {
    KEYS,
    getDefaultSchoolYear,
    loadAlapAdatok,
    saveAlapAdatok,
    loadChildHistory,
    saveChildHistory,
    loadLastChildSettings,
    saveLastChildSettings
  };
}));
