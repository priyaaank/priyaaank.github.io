/* ============================================================
   Health dashboard — client-side renderer.

   Reads:
     #health-log     JSON array of { date, ...metricKeys }
     #health-config  JSON (range_default, range_presets, sections)

   Then for each [data-widget] in the DOM, computes stats and paints
   the widget body. Re-runs on time-range change.

   Chart.js (UMD) is loaded ahead of this script via the page layout.
   ============================================================ */
(function () {
  'use strict';

  // ------------------------------------------------------------
  // Bootstrap
  // ------------------------------------------------------------
  function readJSON(id) {
    const el = document.getElementById(id);
    if (!el) return null;
    try { return JSON.parse(el.textContent); }
    catch (e) { console.error('Bad JSON in #' + id, e); return null; }
  }

  const RAW_LOG    = readJSON('health-log') || [];
  const CONFIG     = readJSON('health-config') || {};

  // Normalize and sort log ascending by date. Each row keeps the
  // original metric keys (string-typed booleans become real booleans).
  const LOG = RAW_LOG
    .map(row => {
      const out = { date: row.date };
      for (const k of Object.keys(row)) {
        if (k === 'date') continue;
        out[k] = row[k];
      }
      return out;
    })
    .sort((a, b) => a.date < b.date ? -1 : 1);

  if (!LOG.length) return;

  const LATEST = LOG[LOG.length - 1].date;

  const COLORS = {
    ink:   { line: '#1d1d1f', fill: 'rgba(29,29,31,0.08)',  target: '#8a8784' },
    amber: { line: '#b45309', fill: 'rgba(180,83,9,0.10)',  target: '#d6a36f' },
    teal:  { line: '#0f766e', fill: 'rgba(15,118,110,0.10)',target: '#7fb5ad' },
    rose:  { line: '#b91c1c', fill: 'rgba(185,28,28,0.10)', target: '#d99090' },
    sage:  { line: '#4d6a3a', fill: 'rgba(77,106,58,0.12)', target: '#9bb085' },
  };
  function paletteFor(name) { return COLORS[name] || COLORS.ink; }

  // ------------------------------------------------------------
  // Filtering and stats
  // ------------------------------------------------------------
  function daysAgo(n) {
    const d = new Date(LATEST + 'T00:00:00');
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  }

  function logForRange(rangeDays) {
    if (!rangeDays || rangeDays <= 0) return LOG.slice();
    const cutoff = daysAgo(rangeDays - 1);
    return LOG.filter(r => r.date >= cutoff);
  }

  function valuesOf(rows, metric) {
    return rows
      .map(r => ({ date: r.date, value: r[metric] }))
      .filter(r => r.value !== undefined && r.value !== null);
  }

  function numericValues(rows, metric) {
    return valuesOf(rows, metric).filter(p => typeof p.value === 'number');
  }
  function booleanValues(rows, metric) {
    return valuesOf(rows, metric).filter(p => typeof p.value === 'boolean');
  }

  function mean(arr) {
    if (!arr.length) return null;
    return arr.reduce((s, x) => s + x, 0) / arr.length;
  }

  function fmt(n, decimals) {
    if (n === null || n === undefined || Number.isNaN(n)) return '—';
    const d = Number.isFinite(decimals) ? decimals : 1;
    return Number(n).toLocaleString(undefined, {
      minimumFractionDigits: d,
      maximumFractionDigits: d,
    });
  }

  // ------------------------------------------------------------
  // Widget renderers
  // ------------------------------------------------------------
  const RENDERERS = {};

  RENDERERS.stat = function (el, rangeDays) {
    const metric   = el.dataset.metric;
    const decimals = parseInt(el.dataset.decimals, 10) || 0;
    const target   = parseFloat(el.dataset.target);

    // Current = avg over current range. Previous = avg over the
    // immediately preceding window of the same length.
    const cur  = numericValues(logForRange(rangeDays), metric).map(p => p.value);
    const curMean = mean(cur);

    let prevMean = null;
    if (rangeDays > 0) {
      const cutoff = daysAgo(rangeDays * 2 - 1);
      const upper  = daysAgo(rangeDays);
      const prev = numericValues(
        LOG.filter(r => r.date >= cutoff && r.date < upper),
        metric
      ).map(p => p.value);
      prevMean = mean(prev);
    }

    el.querySelector('[data-stat-value]').textContent = fmt(curMean, decimals);

    const deltaEl = el.querySelector('[data-stat-delta]');
    if (curMean !== null && prevMean !== null) {
      const d = curMean - prevMean;
      const pct = (d / prevMean) * 100;
      let cls = 'flat';
      if (Math.abs(pct) >= 0.5) cls = d > 0 ? 'up' : 'down';
      // For some metrics "up" is bad (resting HR, weight when targeting loss).
      // We don't try to be too clever — just colour by direction.
      deltaEl.className = 'stat-delta ' + cls;
      const sign = d > 0 ? '↑' : (d < 0 ? '↓' : '·');
      deltaEl.textContent = sign + ' ' + fmt(Math.abs(d), decimals);
    } else {
      deltaEl.textContent = '';
      deltaEl.className = 'stat-delta';
    }
  };

  RENDERERS.line = function (el, rangeDays) {
    const metric   = el.dataset.metric;
    const decimals = parseInt(el.dataset.decimals, 10) || 0;
    const unit     = el.dataset.unit || '';
    const target   = parseFloat(el.dataset.target);
    const palette  = paletteFor(el.dataset.color);

    const series = numericValues(logForRange(rangeDays), metric);
    const labels = series.map(p => p.date);
    const values = series.map(p => p.value);

    const last = values[values.length - 1];
    const sub = el.querySelector('[data-line-sub]');
    if (sub) sub.textContent = last !== undefined
      ? 'latest ' + fmt(last, decimals) + unit
      : '';

    const canvas = el.querySelector('[data-line-canvas]');
    if (!canvas || !window.Chart) return;

    // Tear down any prior chart on this canvas.
    if (canvas._chart) { canvas._chart.destroy(); canvas._chart = null; }

    const datasets = [{
      data: values,
      borderColor: palette.line,
      backgroundColor: palette.fill,
      pointRadius: 0,
      pointHoverRadius: 4,
      pointHoverBackgroundColor: palette.line,
      borderWidth: 2,
      tension: 0.3,
      fill: true,
    }];
    if (Number.isFinite(target)) {
      datasets.push({
        data: values.map(() => target),
        borderColor: palette.target,
        borderDash: [4, 4],
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
        order: 2,
      });
    }

    canvas._chart = new Chart(canvas, {
      type: 'line',
      data: { labels, datasets },
      options: chartCommon({ decimals, unit, palette }),
    });
  };

  RENDERERS.bar = function (el, rangeDays) {
    const metric   = el.dataset.metric;
    const decimals = parseInt(el.dataset.decimals, 10) || 0;
    const unit     = el.dataset.unit || '';
    const target   = parseFloat(el.dataset.target);
    const palette  = paletteFor(el.dataset.color);

    const series = numericValues(logForRange(rangeDays), metric);
    const labels = series.map(p => p.date);
    const values = series.map(p => p.value);

    const avg = mean(values);
    const sub = el.querySelector('[data-bar-sub]');
    if (sub) sub.textContent = avg !== null
      ? 'avg ' + fmt(avg, decimals) + ' ' + unit
      : '';

    const canvas = el.querySelector('[data-bar-canvas]');
    if (!canvas || !window.Chart) return;
    if (canvas._chart) { canvas._chart.destroy(); canvas._chart = null; }

    const datasets = [{
      data: values,
      backgroundColor: palette.line,
      borderRadius: 2,
      borderSkipped: false,
      barPercentage: 0.85,
      categoryPercentage: 0.9,
    }];
    if (Number.isFinite(target)) {
      datasets.push({
        type: 'line',
        data: values.map(() => target),
        borderColor: palette.target,
        borderDash: [4, 4],
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
      });
    }

    canvas._chart = new Chart(canvas, {
      type: 'bar',
      data: { labels, datasets },
      options: chartCommon({ decimals, unit, palette }),
    });
  };

  RENDERERS.consistency = function (el, rangeDays) {
    const metric  = el.dataset.metric;
    const cadence = el.dataset.cadence || 'daily';
    const grid    = el.querySelector('[data-consistency-grid]');
    if (!grid) return;
    grid.innerHTML = '';

    // Decide how the grid is laid out based on cadence.
    if (cadence === 'weekly') {
      grid.classList.add('weekly');
    } else {
      grid.classList.remove('weekly');
    }

    // Lookup of date → value across the entire log (we walk the
    // calendar ourselves so missing dates become "no data").
    const byDate = new Map();
    for (const r of LOG) byDate.set(r.date, r[metric]);

    const stepDays = cadence === 'weekly' ? 7 : 1;

    // How far back to walk. For weekly, scale the cell count so the
    // grid stays compact (12 weeks ≈ 3 months).
    let cellCount;
    if (rangeDays && rangeDays > 0) {
      cellCount = Math.ceil(rangeDays / stepDays);
    } else {
      cellCount = Math.ceil(LOG.length / stepDays);
    }
    cellCount = Math.min(cellCount, cadence === 'weekly' ? 52 : 140);

    const endDate = new Date(LATEST + 'T00:00:00');
    const cells = [];
    for (let i = cellCount - 1; i >= 0; i--) {
      const d = new Date(endDate);
      d.setDate(d.getDate() - i * stepDays);
      const key = d.toISOString().slice(0, 10);
      const v = byDate.get(key);
      let cls = 'no-data';
      if (v === true)  cls = 'done';
      if (v === false) cls = 'miss';
      cells.push({ key, cls, v });
    }

    let done = 0, total = 0;
    const cellEls = [];
    for (const c of cells) {
      if (c.v === true)  { done++; total++; }
      if (c.v === false) { total++; }
      const cell = document.createElement('div');
      cell.className = 'ccell ' + c.cls;
      const prefix = cadence === 'weekly' ? 'Week of ' : '';
      const status = c.v === true ? 'done' : c.v === false ? 'missed' : 'no data';
      cell.dataset.tip = prefix + c.key + ' · ' + status;
      grid.appendChild(cell);
      cellEls.push(cell);
    }

    const sub = el.querySelector('[data-consistency-sub]');
    const label = cadence === 'weekly' ? 'weeks' : 'days';
    const summary = total
      ? done + '/' + total + ' ' + label + ' · ' + Math.round(100 * done / total) + '%'
      : '';
    if (sub) {
      sub.textContent = summary;
      // In-widget hover label: route cell tooltips through the subtitle so
      // they don't escape the widget bounds the way native `title` does.
      for (const c of cellEls) {
        c.addEventListener('mouseenter', () => { sub.textContent = c.dataset.tip; });
        c.addEventListener('mouseleave', () => { sub.textContent = summary; });
      }
    }
  };

  RENDERERS.streak = function (el /*, rangeDays */) {
    // Streaks always read from the full log (not the range), because
    // a long streak is a long streak regardless of the viewport.
    // For weekly metrics, "streak" still counts consecutive `true`
    // entries — they just happen to be 7 days apart.
    const metric  = el.dataset.metric;
    const cadence = el.dataset.cadence || 'daily';
    const all = booleanValues(LOG, metric);

    // Current streak: count backwards from the most recent entry
    // while value is true.
    let current = 0;
    for (let i = all.length - 1; i >= 0; i--) {
      if (all[i].value === true) current++;
      else break;
    }

    // Best streak: longest consecutive run of `true`.
    let best = 0, run = 0;
    for (const p of all) {
      if (p.value === true) { run++; best = Math.max(best, run); }
      else run = 0;
    }

    el.querySelector('[data-streak-current]').textContent = current;
    el.querySelector('[data-streak-best]').textContent = best;

    // Swap the unit label for weekly streaks.
    const lbl = el.querySelector('.streak-current .streak-lbl');
    if (lbl) lbl.textContent = cadence === 'weekly' ? 'week streak' : 'day streak';
  };

  RENDERERS.category = function (el, rangeDays) {
    const metric = el.dataset.metric;
    const bar    = el.querySelector('[data-category-bar]');
    const legend = el.querySelector('[data-category-legend]');
    const valuesScript = el.querySelector('[data-category-values]');
    if (!bar || !legend || !valuesScript) return;

    let cats = [];
    try { cats = JSON.parse(valuesScript.textContent) || []; }
    catch (_) { cats = []; }
    if (!cats.length) return;

    // Count occurrences over the active range.
    const rows = logForRange(rangeDays);
    const counts = new Map();
    let total = 0;
    for (const r of rows) {
      const v = r[metric];
      if (typeof v !== 'string') continue;
      counts.set(v, (counts.get(v) || 0) + 1);
      total++;
    }

    bar.innerHTML = '';
    legend.innerHTML = '';

    if (!total) {
      bar.innerHTML = '<div class="cat-empty">no data in range</div>';
      return;
    }

    // Bar: one segment per category in declared order.
    for (const c of cats) {
      const n = counts.get(c.key) || 0;
      if (!n) continue;
      const pct = (n / total) * 100;
      const seg = document.createElement('div');
      seg.className = 'cat-seg';
      seg.style.width  = pct.toFixed(2) + '%';
      seg.style.background = c.color || '#1d1d1f';
      seg.title = c.label + ': ' + n + ' (' + Math.round(pct) + '%)';
      if (pct > 8) seg.textContent = Math.round(pct) + '%';
      bar.appendChild(seg);
    }

    // Legend: every declared category, even if zero (so the user knows
    // the full set of possible values).
    for (const c of cats) {
      const n = counts.get(c.key) || 0;
      const pct = total ? (n / total) * 100 : 0;
      const item = document.createElement('div');
      item.className = 'cat-item' + (n === 0 ? ' zero' : '');
      item.innerHTML =
        '<span class="cat-dot" style="background:' + (c.color || '#1d1d1f') + '"></span>' +
        '<span class="cat-label">' + c.label + '</span>' +
        '<span class="cat-count">' + n + ' <span class="cat-pct">(' + Math.round(pct) + '%)</span></span>';
      legend.appendChild(item);
    }

    const sub = el.querySelector('[data-category-sub]');
    if (sub) sub.textContent = total + ' sessions';
  };

  RENDERERS.gauge = function (el /*, rangeDays */) {
    // Gauge reads the *latest* numeric value of the metric, regardless
    // of the active range (it's a "today" / "right now" reading).
    const metric   = el.dataset.metric;
    const decimals = parseInt(el.dataset.decimals, 10) || 0;
    const target   = parseFloat(el.dataset.target);

    const series = numericValues(LOG, metric);
    const last = series.length ? series[series.length - 1].value : null;

    el.querySelector('[data-gauge-value]').textContent = fmt(last, decimals);

    const fill = el.querySelector('[data-gauge-fill]');
    const pct  = el.querySelector('[data-gauge-pct]');
    if (last !== null && Number.isFinite(target) && target > 0) {
      const ratio = Math.max(0, Math.min(1, last / target));
      fill.style.width = (ratio * 100).toFixed(0) + '%';
      pct.textContent = Math.round(ratio * 100) + '% of goal';
    } else {
      fill.style.width = '0%';
      pct.textContent = '';
    }
  };

  // ------------------------------------------------------------
  // Chart.js shared options
  // ------------------------------------------------------------
  function chartCommon({ decimals, unit, palette }) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 250 },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1d1d1f',
          titleColor: '#fff',
          bodyColor: '#e8e6e0',
          padding: 10,
          displayColors: false,
          callbacks: {
            label: (ctx) => fmt(ctx.parsed.y, decimals) + (unit ? ' ' + unit : ''),
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: '#8a8784',
            font: { size: 10 },
            maxRotation: 0,
            autoSkip: true,
            autoSkipPadding: 24,
            callback: function (val) {
              // Show only "Mon DD" labels, not full ISO dates.
              const s = this.getLabelForValue(val);
              if (typeof s !== 'string') return s;
              const d = new Date(s + 'T00:00:00');
              if (Number.isNaN(d.getTime())) return s;
              return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            },
          },
          border: { color: '#e6e2d8' },
        },
        y: {
          grid: { color: '#efebe0', drawBorder: false },
          ticks: {
            color: '#8a8784',
            font: { size: 10 },
            callback: (v) => fmt(v, decimals),
          },
          border: { display: false },
        },
      },
    };
  }

  // ------------------------------------------------------------
  // Orchestration
  // ------------------------------------------------------------
  function renderAll(rangeDays) {
    document.querySelectorAll('[data-widget]').forEach(el => {
      const type = el.dataset.type;
      const fn = RENDERERS[type];
      if (!fn) return;
      try { fn(el, rangeDays); }
      catch (e) { console.error('widget render failed:', type, el.dataset.metric, e); }
    });
  }

  function wireRangeSwitcher() {
    const sw = document.querySelector('[data-range-switcher]');
    if (!sw) return parseInt(CONFIG.range_default, 10) || 90;

    const defaultRange = parseInt(sw.dataset.default, 10) || 90;

    sw.addEventListener('click', (e) => {
      const btn = e.target.closest('.range-btn');
      if (!btn) return;
      sw.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const days = parseInt(btn.dataset.range, 10) || 0;
      renderAll(days);
    });

    return defaultRange;
  }

  function boot() {
    const initial = wireRangeSwitcher();
    renderAll(initial);
  }

  // Chart.js is loaded with `defer`, so wait for both DOM and Chart to be ready.
  function ready() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', whenChartReady);
    } else {
      whenChartReady();
    }
  }
  function whenChartReady() {
    if (window.Chart) return boot();
    // Poll briefly until the deferred Chart.js script lands.
    let tries = 0;
    const t = setInterval(() => {
      if (window.Chart || tries++ > 80) {
        clearInterval(t);
        boot();
      }
    }, 50);
  }
  ready();
})();
