/**
 * BTMN Admin - Matching Service
 * Felelősség: Szöveges hasonlóság számítása és fejlesztési területek javaslata
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
    root.MatchingService = exported;
  }
}(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this), function () {
  'use strict';

  function normalizeTokens(str) {
    if (!str) return [];
    return String(str)
      .toLowerCase()
      .replace(/[^a-záéíóöőúüű0-9]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 0);
  }

  // Token-alapú hasonlósági ráta fallback (Dice együttható és arány max), ha a fuzzball nem elérhető
  function simpleTokenRatio(str1, str2) {
    const s1 = normalizeTokens(str1);
    const s2 = normalizeTokens(str2);
    if (!s1.length || !s2.length) return 0;

    let matches = 0;
    s1.forEach(w1 => {
      if (s2.some(w2 => w2 === w1 || (w1.length > 3 && w2.includes(w1)) || (w2.length > 3 && w1.includes(w2)))) {
        matches++;
      }
    });

    const diceScore = Math.round(((2 * matches) / (s1.length + s2.length)) * 100);
    const ratioScore = Math.round((matches / Math.max(s1.length, s2.length)) * 100);
    return Math.max(diceScore, ratioScore);
  }

  function getFuzzballLib() {
    if (typeof window !== 'undefined' && window.fuzzball) {
      return window.fuzzball;
    }
    if (typeof globalThis !== 'undefined' && globalThis.fuzzball) {
      return globalThis.fuzzball;
    }
    return null;
  }

  function scoreMatch(targetName, queryText) {
    if (!targetName || !queryText) return 0;

    const fuzz = getFuzzballLib();
    if (fuzz && typeof fuzz.token_sort_ratio === 'function') {
      const sortScore = fuzz.token_sort_ratio(targetName, queryText);
      const setScore = typeof fuzz.token_set_ratio === 'function' 
        ? fuzz.token_set_ratio(targetName, queryText) 
        : sortScore;
      return Math.max(sortScore, setScore);
    }

    return simpleTokenRatio(targetName, queryText);
  }

  function findRecommendations(queryText, allTeruletek = null) {
    const list = allTeruletek || (typeof window !== 'undefined' && window.TERULETEK_DATA ? window.TERULETEK_DATA.teruletek : []);
    if (!list || !Array.isArray(list) || list.length === 0) return [];

    const scored = list.map(t => ({
      terulet: t,
      score: scoreMatch(t.nev, queryText)
    }));

    // Csökkenő sorrend pontszám alapján
    scored.sort((a, b) => b.score - a.score);
    return scored;
  }

  function matchLines(lines, allTeruletek = null) {
    if (!lines || !Array.isArray(lines)) return [];
    return lines.map(line => ({
      rawLine: line,
      recommendations: findRecommendations(line, allTeruletek)
    }));
  }

  return {
    scoreMatch,
    findRecommendations,
    matchLines,
    simpleTokenRatio
  };
}));
