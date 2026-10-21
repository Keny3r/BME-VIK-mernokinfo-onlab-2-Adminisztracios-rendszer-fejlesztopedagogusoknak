/**
 * BTMN Admin - PDF Service
 * Felelősség: A Fejlesztési Terv kétoldalas PDF dokumentumának előállítása
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
    root.PdfService = exported;
    root.PdfGenerator = exported; // Kompatibilitási alias
  }
}(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this), function () {
  'use strict';

  const PDF_CONFIG = {
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    margin: 20,
    colors: {
      titleText: [30, 30, 30],
      dividerLine: [80, 80, 80],
      cardHeaderBg: [242, 242, 242],
      cardHeaderBorder: [180, 180, 180],
      labelText: [70, 70, 70],
      valueText: [15, 15, 15],
      footerText: [120, 120, 120],
      tableBorder: [120, 120, 120],
      tableHeadBg: [230, 230, 230],
      tableAreaBg: [248, 248, 248]
    }
  };

  function setupFonts(doc) {
    let fontName = 'helvetica';
    if (typeof window !== 'undefined' && window.ROBOTO_REGULAR_BASE64) {
      try {
        doc.addFileToVFS('Roboto-Regular.ttf', window.ROBOTO_REGULAR_BASE64);
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');

        if (window.ROBOTO_MEDIUM_BASE64) {
          doc.addFileToVFS('Roboto-Bold.ttf', window.ROBOTO_MEDIUM_BASE64);
          doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
        }

        doc.setFont('Roboto', 'normal');
        fontName = 'Roboto';
      } catch (err) {
        console.warn('Nem sikerült regisztrálni a Roboto betűtípust:', err);
      }
    }
    return fontName;
  }

  function formatDate(d = new Date()) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}. ${month}. ${day}.`;
  }

  function buildSafeFilename(data) {
    const safeChild = (data.nev || 'gyermek')
      .trim()
      .replace(/[\/\\?%*:|"<>]/g, '_')
      .replace(/\s+/g, '_');
    const safeYear = (data.tanev || 'tanev')
      .trim()
      .replace(/[\/\\?%*:|"<>]/g, '_')
      .replace(/\s+/g, '_');
    return `Fejlesztesi_Terv_${safeChild}_${safeYear}.pdf`;
  }

  /**
   * 1. Oldal renderelése: Alapadatok, Gyermek és Szakértői vélemény adatai
   */
  function renderFirstPage(doc, data, ctx) {
    const { fontName, pageWidth, pageHeight, margin, contentWidth } = ctx;
    let y = 28;

    // Főcím
    doc.setFont(fontName, 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...PDF_CONFIG.colors.titleText);
    doc.text('FEJLESZTÉSI TERV', pageWidth / 2, y, { align: 'center' });

    y += 4;
    doc.setDrawColor(...PDF_CONFIG.colors.dividerLine);
    doc.setLineWidth(0.6);
    doc.line(margin, y, pageWidth - margin, y);
    y += 14;

    function renderSectionCard(title, fields) {
      doc.setFont(fontName, 'bold');
      doc.setFontSize(12);
      doc.setTextColor(20, 20, 20);
      doc.setFillColor(...PDF_CONFIG.colors.cardHeaderBg);
      doc.setDrawColor(...PDF_CONFIG.colors.cardHeaderBorder);
      doc.setLineWidth(0.3);

      doc.rect(margin, y, contentWidth, 8.5, 'FD');
      doc.text(title, margin + 4, y + 6.0);
      y += 15.5;

      doc.setFontSize(10.5);
      const labelX = margin + 4;
      const valueX = margin + 65;

      fields.forEach(([label, value]) => {
        doc.setFont(fontName, 'bold');
        doc.setTextColor(...PDF_CONFIG.colors.labelText);
        doc.text(label + ':', labelX, y);

        doc.setFont(fontName, 'normal');
        doc.setTextColor(...PDF_CONFIG.colors.valueText);
        const displayVal = (value && String(value).trim()) ? String(value).trim() : '–';

        const splitVal = doc.splitTextToSize(displayVal, contentWidth - 70);
        doc.text(splitVal, valueX, y);

        y += (splitVal.length * 5.5) + 2.0;
      });

      y += 11; // Térköz a szekciók között
    }

    // 1. Szekció: Gyermek adatai
    renderSectionCard('Gyermek adatai', [
      ['Név', data.nev],
      ['Anyja neve', data.anyjaNeve],
      ['Születési helye, ideje', data.szuletesiHelyEsIdo],
      ['Iskolája', data.iskola],
      ['Osztálya', data.osztaly]
    ]);

    // 2. Szekció: Szakértői vélemény adatai
    renderSectionCard('Szakértői vélemény adatai', [
      ['Szakszolgálat neve', data.szakszolgalat],
      ['Szakértői vélemény iktatószáma', data.iktatoszam],
      ['Szakértői vélemény forgalmi száma', data.forgalmiSzam],
      ['Felülvizsgálat ideje', data.felulvizsgalatIdeje]
    ]);

    // 3. Szekció: Fejlesztés adatai
    renderSectionCard('Fejlesztés adatai', [
      ['Tanév', data.tanev],
      ['Fejlesztés formája', data.fejlesztesFormaja],
      ['Heti óraszám', data.hetiOraszam],
      ['Fejlesztőpedagógus', data.pedagogusNeve]
    ]);

    // Dátum és aláírásmezők az 1. oldal alján
    const bottomY = pageHeight - 32;
    doc.setFont(fontName, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text(`Kelt: ........................................, ${formatDate()}`, margin + 4, bottomY);

    const sigLineY = bottomY + 16;
    const sig1X = margin + 10;
    const sig2X = margin + contentWidth - 70;

    doc.setDrawColor(120, 120, 120);
    doc.setLineWidth(0.3);
    doc.line(sig1X, sigLineY, sig1X + 60, sigLineY);
    doc.line(sig2X, sigLineY, sig2X + 60, sigLineY);

    doc.setFontSize(9);
    doc.text('Fejlesztőpedagógus', sig1X + 30, sigLineY + 5, { align: 'center' });
    doc.text('Intézményvezető', sig2X + 30, sigLineY + 5, { align: 'center' });
  }

  /**
   * Táblázat sorainak előkészítése fa struktúra alapján
   */
  function prepareTableBody(selectedTeruletek) {
    const tableBody = [];
    const list = selectedTeruletek || [];

    list.forEach(area => {
      const celok = (area.celok && area.celok.length > 0) ? area.celok : [{ nev: '–', eszkozok: ['–'] }];
      const totalAreaRows = celok.reduce((sum, c) => sum + Math.max(1, (c.eszkozok || []).length), 0);
      let isFirstAreaRow = true;

      celok.forEach(cel => {
        const eszkozok = (cel.eszkozok && cel.eszkozok.length > 0) ? cel.eszkozok : ['–'];
        const celRowCount = eszkozok.length;
        let isFirstCelRow = true;

        eszkozok.forEach(eszkoz => {
          const row = [];

          if (isFirstAreaRow) {
            row.push({
              content: area.nev || '–',
              rowSpan: totalAreaRows,
              styles: {
                valign: 'middle',
                fontStyle: 'bold',
                fillColor: PDF_CONFIG.colors.tableAreaBg
              }
            });
            isFirstAreaRow = false;
          }

          if (isFirstCelRow) {
            row.push({
              content: cel.nev || '–',
              rowSpan: celRowCount,
              styles: {
                valign: 'middle'
              }
            });
            isFirstCelRow = false;
          }

          row.push({
            content: eszkoz || '–',
            styles: {
              valign: 'middle'
            }
          });

          tableBody.push(row);
        });
      });
    });

    if (tableBody.length === 0) {
      tableBody.push([
        { content: 'Nincs kiválasztott fejlesztési terület', colSpan: 3, styles: { halign: 'center', textColor: [120, 120, 120] } }
      ]);
    }

    return tableBody;
  }

  /**
   * 2. Oldal renderelése: Hierarchikus Fejlesztési Terv táblázat
   */
  function renderTablePage(doc, data, ctx) {
    const { fontName, pageWidth, pageHeight, margin } = ctx;

    doc.addPage();
    let page2Y = 22;

    doc.setFont(fontName, 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...PDF_CONFIG.colors.titleText);
    doc.text('FEJLESZTÉSI TERV', pageWidth / 2, page2Y, { align: 'center' });

    page2Y += 5;
    doc.setFont(fontName, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Tanuló: ${data.nev || '–'}   |   Tanév: ${data.tanev || '–'}   |   Osztály: ${data.osztaly || '–'}`, pageWidth / 2, page2Y, { align: 'center' });

    page2Y += 6;

    const tableBody = prepareTableBody(data.selectedTeruletek);

    doc.autoTable({
      startY: page2Y,
      margin: { left: margin, right: margin, top: 20, bottom: 20 },
      head: [
        [
          { content: 'Fejlesztési területek', styles: { halign: 'center' } },
          { content: 'Fejlesztési célok', styles: { halign: 'center' } },
          { content: 'Fejlesztési eszközök', styles: { halign: 'center' } }
        ]
      ],
      body: tableBody,
      theme: 'grid',
      styles: {
        font: fontName,
        fontSize: 9,
        lineColor: PDF_CONFIG.colors.tableBorder,
        lineWidth: 0.25,
        textColor: [20, 20, 20],
        cellPadding: 3.5,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: PDF_CONFIG.colors.tableHeadBg,
        textColor: [20, 20, 20],
        fontStyle: 'bold',
        lineWidth: 0.3,
        lineColor: [100, 100, 100]
      },
      columnStyles: {
        0: { cellWidth: 46 },
        1: { cellWidth: 54 },
        2: { cellWidth: 70 }
      },
      pageBreak: 'auto',
      didDrawPage: function (dataHook) {
        const totalPages = doc.internal.getNumberOfPages();
        const currentPage = dataHook.pageNumber;
        doc.setFont(fontName, 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...PDF_CONFIG.colors.footerText);
        doc.text(
          `${currentPage} / ${totalPages} oldal`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }
    });

    // Végleges oldalszámozás pótlása az 1. oldalra is
    const totalPages = doc.internal.getNumberOfPages();
    doc.setPage(1);
    doc.setFont(fontName, 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...PDF_CONFIG.colors.footerText);
    doc.text(
      `1 / ${totalPages} oldal`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  function generateDevelopmentPlanPdf(data) {
    const { jsPDF } = (typeof window !== 'undefined' && window.jspdf) ? window.jspdf : {};
    if (!jsPDF) {
      throw new Error('A jsPDF könyvtár nem található!');
    }

    const doc = new jsPDF({
      orientation: PDF_CONFIG.orientation,
      unit: PDF_CONFIG.unit,
      format: PDF_CONFIG.format
    });

    const fontName = setupFonts(doc);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = PDF_CONFIG.margin;
    const contentWidth = pageWidth - (margin * 2);

    const ctx = {
      fontName,
      pageWidth,
      pageHeight,
      margin,
      contentWidth
    };

    renderFirstPage(doc, data, ctx);
    renderTablePage(doc, data, ctx);

    const filename = buildSafeFilename(data);
    doc.save(filename);
    return filename;
  }

  return {
    generateDevelopmentPlanPdf,
    buildSafeFilename,
    prepareTableBody
  };
}));
