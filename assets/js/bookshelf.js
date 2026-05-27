/* ============================================================
   Bookshelf — client-side renderer.

   Fetches the published Google Sheet CSV named in
   [data-bookshelf][data-source-url] and renders three sections:
     • Currently reading   (status: reading)
     • Year-grouped finished books
     • Did not finish      (status: abandoned)

   Paint sequence mirrors the health dashboard: render from
   localStorage cache first if available, then re-render with
   fresh CSV when the fetch resolves.

   CSV columns (snake_case):
     title, author, status, finished, started, rating, note, tags
   Tags use '|' as the in-cell delimiter — commas are reserved
   for CSV columns and may legitimately appear inside `note`.
   ============================================================ */
(function () {
  'use strict';

  const root = document.querySelector('[data-bookshelf]');
  if (!root) return;

  const SOURCE_URL = root.dataset.sourceUrl;
  const CONTAINER = root.querySelector('[data-bs-sections]');
  const STATUS_EL = root.querySelector('[data-bs-status]');
  const CACHE_KEY = 'bookshelf-cache-v2';

  // ------------------------------------------------------------
  // Cache (paint instantly on revisit; swap when fresh fetch lands)
  // ------------------------------------------------------------
  function readCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return Array.isArray(parsed) ? parsed : null;
    } catch (e) { return null; }
  }
  function writeCache(rows) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(rows)); }
    catch (e) { /* quota / disabled — skip */ }
  }

  // ------------------------------------------------------------
  // CSV — quote-aware. Handles commas and newlines inside quoted
  // fields, plus "" as an escaped quote (Google Sheets' export
  // dialect). Single pass over the text.
  // ------------------------------------------------------------
  function parseCSV(text) {
    const rows = [];
    let row = [];
    let cur = '';
    let inQuotes = false;
    const t = text.replace(/^﻿/, '').replace(/\r\n/g, '\n');
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      if (inQuotes) {
        if (c === '"' && t[i + 1] === '"') { cur += '"'; i++; }
        else if (c === '"') { inQuotes = false; }
        else { cur += c; }
      } else {
        if (c === ',') { row.push(cur); cur = ''; }
        else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
        else if (c === '"' && cur === '') { inQuotes = true; }
        else { cur += c; }
      }
    }
    if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
    return rows;
  }

  function csvToObjects(text) {
    const rows = parseCSV(text);
    if (rows.length < 2) return [];
    const headers = rows[0].map(s => s.trim());
    const out = [];
    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i];
      if (cells.every(c => c.trim() === '')) continue;
      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        const k = headers[j];
        const v = (cells[j] || '').trim();
        // Skip blanks so duplicate-header columns where only one is
        // populated don't clobber the filled cell.
        if (v === '') continue;
        obj[k] = v;
      }
      out.push(obj);
    }
    return out;
  }

  function normalize(row) {
    const b = Object.assign({}, row);
    if (b.rating !== undefined) {
      const n = Number(b.rating);
      b.rating = Number.isFinite(n) ? n : null;
    }
    b.tags = b.tags
      ? String(b.tags).split('|').map(s => s.trim()).filter(Boolean)
      : [];
    if (!b.status) b.status = 'finished';
    return b;
  }

  async function loadBooks() {
    if (!SOURCE_URL) throw new Error('No source_url configured');
    const res = await fetch(SOURCE_URL, { credentials: 'omit' });
    if (!res.ok) throw new Error('CSV fetch failed: ' + res.status);
    return csvToObjects(await res.text()).map(normalize);
  }

  // ------------------------------------------------------------
  // DOM rendering
  // ------------------------------------------------------------
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const k of Object.keys(attrs)) {
        if (k === 'class') node.className = attrs[k];
        else if (k === 'text') node.textContent = attrs[k];
        else node.setAttribute(k, attrs[k]);
      }
    }
    if (children) for (const c of children) if (c) node.appendChild(c);
    return node;
  }

  function fmtDate(iso) {
    if (!iso) return '';
    // Year only — section header already carries the year, so the
    // date column stays blank to avoid duplicating it.
    if (iso.length === 4) return '';
    if (iso.length === 7) {
      const d = new Date(iso + '-01T00:00:00');
      if (Number.isNaN(d.getTime())) return iso;
      return d.toLocaleDateString(undefined, { month: 'short' });
    }
    const d = new Date(iso + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  // Pad partial dates for lexicographic sort so a year-only entry
  // sorts *after* fully-known dates in the same year (i.e. less
  // precise → lower in the timeline). `2026` → `2026-00-00`,
  // `2026-05` → `2026-05-00`, full date passes through.
  function sortKey(d) {
    if (!d) return '';
    if (d.length === 4) return d + '-00-00';
    if (d.length === 7) return d + '-00';
    return d;
  }

  function renderRow(b, dateField, dateLabel) {
    const d = b[dateField] || '';
    const dateText = fmtDate(d);
    const dateNode = dateText
      ? el('time', { class: 'bs-date', datetime: d },
          dateLabel
            ? [el('span', { class: 'bs-date-label', text: dateLabel }),
               document.createTextNode(' ' + dateText)]
            : [document.createTextNode(dateText)])
      : el('span', { class: 'bs-date bs-date--empty' });

    const titleSpan = el('span', { class: 'bs-title' });
    if (b.goodreads_link) {
      titleSpan.appendChild(el('a', {
        href: b.goodreads_link,
        target: '_blank',
        rel: 'noopener noreferrer',
        text: b.title || '',
      }));
    } else {
      titleSpan.textContent = b.title || '';
    }
    const lineChildren = [titleSpan];
    if (b.rating) {
      const stars = el('span', {
        class: 'bs-rating',
        'aria-label': b.rating + ' out of 5',
      });
      for (let i = 1; i <= 5; i++) {
        if (i <= b.rating) {
          stars.appendChild(document.createTextNode('★'));
        } else {
          stars.appendChild(el('span', { class: 'bs-star-empty', text: '★' }));
        }
      }
      lineChildren.push(stars);
    }

    const metaChildren = [el('span', { class: 'bs-author', text: b.author || '' })];
    if (b.tags.length) {
      metaChildren.push(el('span', { class: 'bs-sep', text: '·' }));
      b.tags.forEach((tag, i) => {
        metaChildren.push(el('span', { class: 'bs-tag', text: tag }));
        if (i < b.tags.length - 1) {
          metaChildren.push(el('span', { class: 'bs-sep', text: '·' }));
        }
      });
    }

    const bodyChildren = [
      el('div', { class: 'bs-line' }, lineChildren),
      el('div', { class: 'bs-meta' }, metaChildren),
    ];
    if (b.note) bodyChildren.push(el('p', { class: 'bs-note', text: b.note }));

    return el('li', { class: 'bs-item' }, [
      dateNode,
      el('div', { class: 'bs-body' }, bodyChildren),
    ]);
  }

  function renderSection({ title, sectionClass, pulse, count, rows }) {
    const headChildren = pulse
      ? [el('span', { class: 'bs-pulse' }), document.createTextNode(title)]
      : [document.createTextNode(title)];
    return el('section', { class: 'bs-year' + (sectionClass ? ' ' + sectionClass : '') }, [
      el('header', { class: 'bs-year-head' }, [
        el('h2', {}, headChildren),
        el('span', {
          class: 'bs-count',
          text: count + ' book' + (count === 1 ? '' : 's'),
        }),
      ]),
      el('ol', { class: 'bs-list' }, rows),
    ]);
  }

  function render(books) {
    const reading = [], finished = [], abandoned = [];
    for (const b of books) {
      const st = b.status || 'finished';
      if (st === 'reading') reading.push(b);
      else if (st === 'abandoned') abandoned.push(b);
      else if (st === 'finished' && b.finished) finished.push(b);
    }
    // DESC by date. Entries with no date sink to the bottom of their
    // section; less-precise dates sink within their period (see sortKey).
    const byDateDesc = (key) => (a, b) => {
      const ka = sortKey(a[key]);
      const kb = sortKey(b[key]);
      if (!ka && !kb) return 0;
      if (!ka) return 1;
      if (!kb) return -1;
      return kb.localeCompare(ka);
    };
    reading.sort(byDateDesc('started'));
    finished.sort(byDateDesc('finished'));
    abandoned.sort(byDateDesc('started'));

    CONTAINER.innerHTML = '';

    if (reading.length) {
      CONTAINER.appendChild(renderSection({
        title: 'Currently reading',
        sectionClass: 'bs-section-reading',
        pulse: true,
        count: reading.length,
        rows: reading.map(b => renderRow(b, 'started', 'since')),
      }));
    }

    const years = [];
    for (const b of finished) {
      const y = (b.finished || '').slice(0, 4);
      if (y && !years.includes(y)) years.push(y);
    }
    for (const y of years) {
      const yBooks = finished.filter(b => (b.finished || '').startsWith(y));
      CONTAINER.appendChild(renderSection({
        title: y,
        count: yBooks.length,
        rows: yBooks.map(b => renderRow(b, 'finished')),
      }));
    }

    if (abandoned.length) {
      CONTAINER.appendChild(renderSection({
        title: 'Did not finish',
        sectionClass: 'bs-section-abandoned',
        count: abandoned.length,
        rows: abandoned.map(b => renderRow(b, 'started', 'started')),
      }));
    }

    if (STATUS_EL) {
      const empty = !reading.length && !finished.length && !abandoned.length;
      if (empty) { STATUS_EL.textContent = 'No books on the shelf yet.'; STATUS_EL.hidden = false; }
      else { STATUS_EL.hidden = true; }
    }
  }

  // ------------------------------------------------------------
  // Boot — paint from cache (if any), then fetch and re-paint.
  // ------------------------------------------------------------
  async function boot() {
    const cached = readCache();
    if (cached && cached.length) {
      try { render(cached); }
      catch (e) { console.error('Bookshelf cache render failed:', e); }
    }

    try {
      const books = await loadBooks();
      writeCache(books);
      render(books);
    } catch (e) {
      console.error('Failed to load bookshelf:', e);
      if (!cached && STATUS_EL) {
        STATUS_EL.textContent = "Couldn't load the bookshelf right now.";
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
