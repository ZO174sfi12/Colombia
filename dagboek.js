/**
 * Colombia Dagboek Module v4
 *
 * ARCHITECTUUR:
 *   Foto's   → ImgBB API (gratis, permanent, upload vanuit browser)
 *   Data     → Google Sheets via Apps Script Web App
 *                 Tab "Data":      id | locatie | user | datum | tekst | fotos
 *                 Tab "Gerechten": gerecht_id | user | geprobeerd | rating
 *   Lokaal   → localStorage als offline buffer / fallback
 *
 * TWEE FUNCTIES:
 *
 *   1. Dagboek.render(locatieId, locatieNaam)
 *      → Gebruik in elke locatiepagina (bogota.html, salento.html, ...)
 *
 *   2. Dagboek.renderGerechten(gerechten)
 *      → Gebruik in culinair.html
 */

const Dagboek = (() => {

  // ─── FOTO REGISTRY (voor lightbox) ─────────────────────────────────────────
  const _fotoSets = {};

  // ─── CONFIG ────────────────────────────────────────────────────────────────
  const DEFAULT_SHEETS_URL   = 'https://script.google.com/macros/s/AKfycbwXFju7-qe4FIdB6LTTCosacBqxi-r2-dThPAyatCsneaGCnWlSxL5C7C17Fp_7iBUaag/exec';
  const DEFAULT_SHEETS_TOKEN = 'd-Vs_5afzPjCjSgppSCMAmGocAlMqj-XUa-L5QPKny4';

  const cfg = () => ({
    imgbbKey:    localStorage.getItem('cfg_imgbb') || '',
    sheetsUrl:   localStorage.getItem('cfg_sheets_url')   || DEFAULT_SHEETS_URL,
    sheetsToken: localStorage.getItem('cfg_sheets_token') || DEFAULT_SHEETS_TOKEN,
    user:        localStorage.getItem('cfg_user') || 'Bert',
  });

  // ─── SHEETS LEZEN ──────────────────────────────────────────────────────────
  async function sheetsLees() {
    const { sheetsUrl, sheetsToken } = cfg();
    if (!sheetsUrl || !sheetsToken) return lokaleLees();
    try {
      const r = await fetch(sheetsUrl, {
        method: 'POST',
        body: JSON.stringify({ token: sheetsToken, actie: 'lees' })
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const inhoud = await r.text();
      if (inhoud === '403 Forbidden') throw new Error('Verkeerd token');
      const data = JSON.parse(inhoud);
      localStorage.setItem('reis_data', inhoud);
      return data;
    } catch (e) {
      console.warn('Sheets lezen mislukt, gebruik lokale cache:', e);
      return lokaleLees();
    }
  }

  // ─── ENTRY TOEVOEGEN ───────────────────────────────────────────────────────
  // Voegt één rij toe aan de "Data" tab. Gooit Error bij mislukking.
  async function sheetsVoegEntryToe(locatieId, entry) {
    const { sheetsUrl, sheetsToken } = cfg();
    if (!sheetsUrl || !sheetsToken) throw new Error('Google Sheets niet geconfigureerd');
    const r = await fetch(sheetsUrl, {
      method: 'POST',
      body: JSON.stringify({ token: sheetsToken, actie: 'schrijf-entry', locatie: locatieId, entry })
    });
    const antwoord = await r.text();
    if (antwoord !== 'OK') throw new Error('Sheets fout: ' + antwoord);
  }

  // ─── RATING OPSLAAN ────────────────────────────────────────────────────────
  // Update of voegt toe in de "Gerechten" tab.
  async function sheetsSchrijfRating(gid, user, geprobeerd, rating) {
    const { sheetsUrl, sheetsToken } = cfg();
    if (!sheetsUrl || !sheetsToken) return; // ratings zijn niet kritisch
    try {
      await fetch(sheetsUrl, {
        method: 'POST',
        body: JSON.stringify({ token: sheetsToken, actie: 'schrijf-rating', gid, user, geprobeerd, rating })
      });
    } catch (e) {
      console.warn('Rating opslaan mislukt:', e);
    }
  }

  function lokaleLees() {
    try { return JSON.parse(localStorage.getItem('reis_data') || '{}'); }
    catch { return {}; }
  }

  // ─── FOTO UPLOADEN (ImgBB) ─────────────────────────────────────────────────
  async function fotoUploaden(file) {
    const { imgbbKey } = cfg();
    if (!imgbbKey) throw new Error('Geen ImgBB API key — ga naar setup.html');
    const fd = new FormData();
    fd.append('image', file);
    const r = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
      method: 'POST', body: fd
    });
    const data = await r.json();
    if (!data.success) throw new Error('ImgBB upload mislukt');
    return { url: data.data.url, thumb: data.data.thumb?.url };
  }

  // ─── HELPERS ───────────────────────────────────────────────────────────────
  function zekereLocatie(data, locatieId) {
    if (!data[locatieId]) data[locatieId] = {};
    if (!data[locatieId].entries) data[locatieId].entries = [];
    return data;
  }

  function toonStatus(el, tekst, type) {
    if (!el) return;
    el.textContent = tekst;
    el.className = `db-status db-status-${type}`;
  }

  function formatDatum(iso) {
    return new Date(iso).toLocaleDateString('nl-BE', {
      weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit'
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FUNCTIE 1: DAGBOEK PER LOCATIE
  // ═══════════════════════════════════════════════════════════════════════════
  // ─── LIGHTBOX ──────────────────────────────────────────────────────────────
  function ensureLightbox() {
    if (document.getElementById('db-lichtbak')) return;
    const div = document.createElement('div');
    div.id = 'db-lichtbak';
    div.className = 'db-lichtbak';
    div.innerHTML = `
      <button class="db-lb-sluit" id="db-lb-sluit">✕</button>
      <button class="db-lb-pijl db-lb-links" id="db-lb-links">‹</button>
      <img id="db-lb-img" class="db-lb-img" src="" alt="">
      <button class="db-lb-pijl db-lb-rechts" id="db-lb-rechts">›</button>
      <div class="db-lb-teller" id="db-lb-teller"></div>`;
    document.body.appendChild(div);

    let _fotos = [], _huidig = 0;

    function toon(i) {
      _huidig = (i + _fotos.length) % _fotos.length;
      document.getElementById('db-lb-img').src = _fotos[_huidig].url;
      const meerdere = _fotos.length > 1;
      document.getElementById('db-lb-teller').textContent = meerdere ? `${_huidig + 1} / ${_fotos.length}` : '';
      document.getElementById('db-lb-links').style.display  = meerdere ? '' : 'none';
      document.getElementById('db-lb-rechts').style.display = meerdere ? '' : 'none';
    }

    window._dbLichtbakOpen = (fotos, startIdx) => { _fotos = fotos; toon(startIdx); div.classList.add('open'); };

    document.getElementById('db-lb-sluit').addEventListener('click',  () => div.classList.remove('open'));
    document.getElementById('db-lb-links').addEventListener('click',   () => toon(_huidig - 1));
    document.getElementById('db-lb-rechts').addEventListener('click',  () => toon(_huidig + 1));
    div.addEventListener('click', e => { if (e.target === div) div.classList.remove('open'); });
    document.addEventListener('keydown', e => {
      if (!div.classList.contains('open')) return;
      if (e.key === 'Escape')      div.classList.remove('open');
      if (e.key === 'ArrowLeft')   toon(_huidig - 1);
      if (e.key === 'ArrowRight')  toon(_huidig + 1);
    });
  }

  function lichtbakOpen(fotos, idx) {
    if (window._dbLichtbakOpen) window._dbLichtbakOpen(fotos, idx);
  }

  // ───────────────────────────────────────────────────────────────────────────
  async function render(locatieId, locatieNaam) {
    injectCSS();
    ensureLightbox();

    const container = document.createElement('div');
    container.id = 'dagboek-module';
    container.innerHTML = dagboekHTML(locatieNaam);

    const footer = document.querySelector('.footer');
    if (footer) document.body.insertBefore(container, footer);
    else document.body.appendChild(container);

    const data = await sheetsLees();
    zekereLocatie(data, locatieId);
    renderEntries(locatieId, data);
    bindDagboekEvents(locatieId, data);
  }

  function dagboekHTML(locatieNaam) {
    return `
    <div class="db-wrap">
      <div class="db-section">
        <div class="sec-title">📔 Dagboek — ${locatieNaam}</div>

        <div class="db-gebruiker">
          <span>Schrijven als:</span>
          <button class="db-user-btn" data-user="Bert">🧔 Bert</button>
          <button class="db-user-btn" data-user="Ellen">👩 Ellen</button>
        </div>

        <div class="db-invoer">
          <textarea id="db-tekst" placeholder="Wat hebben jullie vandaag gedaan, gezien, beleefd?" rows="5"></textarea>
          <div class="db-invoer-acties">
            <label class="db-foto-btn">
              📷 Foto toevoegen
              <input type="file" id="db-foto-input" accept="image/*" multiple style="display:none">
            </label>
            <button id="db-opslaan" class="db-sla-op">💾 Opslaan</button>
          </div>
          <div id="db-foto-preview" class="db-foto-preview"></div>
          <div id="db-status" class="db-status"></div>
        </div>

        <div id="db-entries" class="db-entries"></div>
      </div>
    </div>`;
  }

  function albumKlasse(n) {
    if (n === 1) return '1';
    if (n === 2) return '2';
    if (n === 3) return '3';
    return '4plus';
  }

  function renderEntries(locatieId, data) {
    const el = document.getElementById('db-entries');
    if (!el) return;
    const entries = data[locatieId]?.entries || [];
    if (!entries.length) {
      el.innerHTML = '<p class="db-leeg">Nog geen dagboekentries voor deze locatie.</p>';
      return;
    }

    // Registreer foto sets voor lightbox
    entries.forEach(e => {
      if (e.fotos?.length) _fotoSets[`entry_${e.id}`] = e.fotos;
    });

    el.innerHTML = [...entries].reverse().map(e => `
      <div class="db-entry">
        <div class="db-entry-meta">
          <span class="db-entry-user">${e.user === 'Ellen' ? '👩 Ellen' : '🧔 Bert'}</span>
          <span class="db-entry-datum">${formatDatum(e.datum)}</span>
        </div>
        <p class="db-entry-tekst">${e.tekst.replace(/\n/g, '<br>')}</p>
        ${e.fotos?.length ? `
          <div class="db-album db-album-${albumKlasse(e.fotos.length)}">
            ${e.fotos.map((f, i) =>
              `<div class="db-album-item" data-set="entry_${e.id}" data-idx="${i}">
                <img src="${f.thumb || f.url}" class="db-album-img" loading="lazy">
              </div>`
            ).join('')}
          </div>` : ''}
      </div>
    `).join('');

    // Bind lightbox click op alle album items
    el.querySelectorAll('.db-album-item').forEach(item => {
      item.addEventListener('click', () => {
        const fotos = _fotoSets[item.dataset.set];
        const idx   = parseInt(item.dataset.idx);
        if (fotos) lichtbakOpen(fotos, idx);
      });
    });
  }

  function bindDagboekEvents(locatieId, data) {
    const actieveUser = () => localStorage.getItem('cfg_user') || 'Bert';
    document.querySelectorAll('.db-user-btn').forEach(btn => {
      if (btn.dataset.user === actieveUser()) btn.classList.add('active');
      btn.addEventListener('click', () => {
        localStorage.setItem('cfg_user', btn.dataset.user);
        document.querySelectorAll('.db-user-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    let geselecteerdeFotos = [];
    const fotoInput = document.getElementById('db-foto-input');
    const preview   = document.getElementById('db-foto-preview');

    fotoInput?.addEventListener('change', () => {
      geselecteerdeFotos = Array.from(fotoInput.files);
      preview.innerHTML = geselecteerdeFotos.map(f => `
        <div class="db-prev-item">
          <img src="${URL.createObjectURL(f)}" class="db-prev-img">
          <span class="db-prev-naam">${f.name}</span>
        </div>`).join('');
    });

    document.getElementById('db-opslaan')?.addEventListener('click', async () => {
      const tekst  = document.getElementById('db-tekst').value.trim();
      const status = document.getElementById('db-status');

      if (!tekst && !geselecteerdeFotos.length) {
        toonStatus(status, '⚠️ Schrijf iets of kies een foto', 'warn');
        return;
      }

      toonStatus(status, '⏳ Bezig...', 'info');

      try {
        const fotoUrls = [];
        for (let i = 0; i < geselecteerdeFotos.length; i++) {
          toonStatus(status, `⏳ Foto ${i + 1}/${geselecteerdeFotos.length} uploaden...`, 'info');
          fotoUrls.push(await fotoUploaden(geselecteerdeFotos[i]));
        }

        const entry = {
          id:    Date.now(),
          datum: new Date().toISOString(),
          user:  actieveUser(),
          tekst,
          fotos: fotoUrls,
        };

        toonStatus(status, '⏳ Opslaan naar Google Sheets...', 'info');
        await sheetsVoegEntryToe(locatieId, entry);

        // Reset invoer
        document.getElementById('db-tekst').value = '';
        fotoInput.value = '';
        geselecteerdeFotos = [];
        preview.innerHTML = '';

        // Herlaad vanuit Sheets (bevestiging)
        toonStatus(status, '⏳ Controleren...', 'info');
        const vernieuwd = await sheetsLees();
        renderEntries(locatieId, vernieuwd);
        Object.assign(data, vernieuwd);

        toonStatus(status, '✅ Opgeslagen in Google Sheets!', 'ok');
        setTimeout(() => { if (status) status.textContent = ''; }, 4000);

      } catch (e) {
        toonStatus(status, `⚠️ Lokaal opgeslagen, maar Sheets mislukt: ${e.message}`, 'warn');
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FUNCTIE 2: GERECHTEN RATINGS (voor culinair.html)
  // ═══════════════════════════════════════════════════════════════════════════
  async function renderGerechten(gerechten) {
    injectCSS();

    const data = await sheetsLees();
    if (!data.gerechten) data.gerechten = {};

    gerechten.forEach((g, i) => {
      const id   = g.id || `g_${i}`;
      let kaart = document.querySelector(`[data-gerecht="${id}"]`);
      if (!kaart) return;

      const s = data.gerechten[id] || {};
      const ratingHTML = `
        <div class="db-rating-blok" data-gerecht-id="${id}">
          ${['Bert', 'Ellen'].map(u => `
            <div class="db-rating-user">
              <span class="db-rating-label">${u === 'Bert' ? '🧔' : '👩'} ${u}</span>
              <label class="db-chk-label">
                <input type="checkbox" class="db-geprobeerd" data-user="${u}"
                  ${s[u]?.geprobeerd ? 'checked' : ''}>
                geprobeerd
              </label>
              <div class="db-sterren" data-user="${u}">
                ${[1,2,3,4,5].map(n =>
                  `<span class="db-ster ${(s[u]?.rating || 0) >= n ? 'aan' : ''}"
                    data-r="${n}">★</span>`
                ).join('')}
              </div>
            </div>`).join('')}
        </div>`;

      kaart.insertAdjacentHTML('beforeend', ratingHTML);
    });

    document.querySelectorAll('.db-rating-blok').forEach(blok => {
      const gid = blok.dataset.gerechtId;

      blok.querySelectorAll('.db-geprobeerd').forEach(chk => {
        chk.addEventListener('change', () => slaRatingOp(gid, blok));
      });
      blok.querySelectorAll('.db-ster').forEach(ster => {
        ster.addEventListener('click', function () {
          const sterrenBlok = this.closest('.db-sterren');
          const r = +this.dataset.r;
          sterrenBlok.querySelectorAll('.db-ster')
            .forEach((s, i) => s.classList.toggle('aan', i < r));
          slaRatingOp(gid, blok);
        });
      });
    });
  }

  async function slaRatingOp(gid, blok) {
    for (const u of ['Bert', 'Ellen']) {
      const chk    = blok.querySelector(`.db-geprobeerd[data-user="${u}"]`);
      const sterren = blok.querySelectorAll(`.db-sterren[data-user="${u}"] .db-ster.aan`);
      await sheetsSchrijfRating(gid, u, chk?.checked || false, sterren.length);
    }
    // Update locale cache
    const data = lokaleLees();
    if (!data.gerechten) data.gerechten = {};
    if (!data.gerechten[gid]) data.gerechten[gid] = {};
    for (const u of ['Bert', 'Ellen']) {
      const chk    = blok.querySelector(`.db-geprobeerd[data-user="${u}"]`);
      const sterren = blok.querySelectorAll(`.db-sterren[data-user="${u}"] .db-ster.aan`);
      data.gerechten[gid][u] = { geprobeerd: chk?.checked || false, rating: sterren.length };
    }
    localStorage.setItem('reis_data', JSON.stringify(data));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CSS
  // ═══════════════════════════════════════════════════════════════════════════
  function injectCSS() {
    if (document.getElementById('dagboek-css')) return;
    const s = document.createElement('style');
    s.id = 'dagboek-css';
    s.textContent = `
      .db-wrap { max-width: 860px; margin: 0 auto; padding: 0 1rem 2rem; }
      .db-section { margin-bottom: 2rem; }

      .db-gebruiker { display:flex; align-items:center; gap:0.5rem; margin-bottom:0.8rem; font-size:0.83rem; color:var(--muted,#4A5E4D); flex-wrap:wrap; }
      .db-user-btn { border:1px solid var(--border,#E5E0D8); background:white; border-radius:20px; padding:0.3rem 0.9rem; font-size:0.8rem; cursor:pointer; transition:all 0.15s; }
      .db-user-btn.active { background:var(--navy,#1A4A2E); color:white; border-color:var(--navy,#1A4A2E); }

      .db-invoer { background:white; border:1px solid var(--border,#E5E0D8); border-radius:12px; padding:1rem; margin-bottom:1rem; }
      .db-invoer textarea { width:100%; border:1px solid var(--border,#E5E0D8); border-radius:8px; padding:0.7rem; font-size:0.85rem; font-family:inherit; resize:vertical; color:var(--text,#1C2A1E); background:var(--cream,#FAF8F4); }
      .db-invoer textarea:focus { outline:none; border-color:var(--navy,#1A4A2E); }
      .db-invoer-acties { display:flex; gap:0.6rem; align-items:center; margin-top:0.7rem; flex-wrap:wrap; }
      .db-foto-btn { background:var(--cream,#FAF8F4); border:1px solid var(--border,#E5E0D8); border-radius:8px; padding:0.45rem 0.9rem; font-size:0.82rem; cursor:pointer; white-space:nowrap; }
      .db-sla-op { background:var(--navy,#1A4A2E); color:white; border:none; border-radius:8px; padding:0.45rem 1.1rem; font-size:0.82rem; font-weight:700; cursor:pointer; margin-left:auto; }
      .db-sla-op:active { opacity:0.8; }

      .db-foto-preview { display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:0.6rem; }
      .db-prev-item { display:flex; flex-direction:column; align-items:center; gap:0.2rem; }
      .db-prev-img { width:64px; height:64px; object-fit:cover; border-radius:6px; border:1px solid var(--border,#E5E0D8); }
      .db-prev-naam { font-size:0.65rem; color:var(--muted,#4A5E4D); max-width:64px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

      .db-status { font-size:0.8rem; margin-top:0.5rem; padding:0.35rem 0.65rem; border-radius:6px; min-height:1.4rem; }
      .db-status-ok    { background:#DCFCE7; color:#14532D; }
      .db-status-warn  { background:#FEF3C7; color:#78350F; }
      .db-status-error { background:#FEE2E2; color:#7F1D1D; }
      .db-status-info  { background:#EFF6FF; color:#1E3A8A; }

      .db-entries { display:flex; flex-direction:column; gap:0.8rem; }
      .db-leeg { font-size:0.83rem; color:var(--muted,#4A5E4D); font-style:italic; padding:0.4rem 0; }
      .db-entry { background:white; border:1px solid var(--border,#E5E0D8); border-radius:12px; padding:1rem; }
      .db-entry-meta { display:flex; gap:0.6rem; align-items:center; margin-bottom:0.5rem; }
      .db-entry-user { font-size:0.75rem; font-weight:700; background:var(--navy,#1A4A2E); color:white; border-radius:20px; padding:0.15rem 0.6rem; }
      .db-entry-datum { font-size:0.75rem; color:var(--muted,#4A5E4D); }
      .db-entry-tekst { font-size:0.85rem; line-height:1.6; }
      /* ── Album grid ── */
      .db-album { margin-top:0.8rem; display:grid; gap:3px; border-radius:10px; overflow:hidden; }
      .db-album-item { overflow:hidden; cursor:pointer; }
      .db-album-img { width:100%; height:100%; object-fit:cover; display:block; transition:transform 0.2s; }
      .db-album-item:hover .db-album-img { transform:scale(1.04); }

      .db-album-1 { grid-template-columns:1fr; }
      .db-album-1 .db-album-img { height:220px; }

      .db-album-2 { grid-template-columns:1fr 1fr; }
      .db-album-2 .db-album-img { height:180px; }

      .db-album-3 { grid-template-columns:2fr 1fr; grid-template-rows:95px 95px; }
      .db-album-3 .db-album-item:first-child { grid-row:1/3; }
      .db-album-3 .db-album-img { height:95px; }
      .db-album-3 .db-album-item:first-child .db-album-img { height:193px; }

      .db-album-4plus { grid-template-columns:repeat(3,1fr); }
      .db-album-4plus .db-album-img { height:110px; }

      /* ── Lightbox ── */
      .db-lichtbak { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.93); z-index:9999; align-items:center; justify-content:center; }
      .db-lichtbak.open { display:flex; }
      .db-lb-img { max-width:90vw; max-height:85vh; object-fit:contain; border-radius:4px; }
      .db-lb-sluit { position:absolute; top:1rem; right:1.2rem; color:white; font-size:2rem; line-height:1; background:none; border:none; cursor:pointer; padding:0.2rem 0.5rem; }
      .db-lb-pijl { position:absolute; top:50%; transform:translateY(-50%); color:white; font-size:2.5rem; background:rgba(255,255,255,0.12); border:none; cursor:pointer; padding:0.3rem 0.8rem; border-radius:6px; }
      .db-lb-links { left:0.5rem; }
      .db-lb-rechts { right:0.5rem; }
      .db-lb-teller { position:absolute; bottom:1rem; left:50%; transform:translateX(-50%); color:rgba(255,255,255,0.65); font-size:0.82rem; }

      .db-wrap .sec-title { font-size:0.9rem; font-weight:800; color:var(--navy,#1A4A2E); border-top:2px solid var(--border,#E5E0D8); padding-top:1rem; margin:1.5rem 0 0.8rem; text-transform:uppercase; letter-spacing:0.5px; }

      .db-rating-blok { display:flex; gap:1rem; flex-wrap:wrap; margin-top:0.8rem; padding-top:0.8rem; border-top:1px solid var(--border,#E5E0D8); }
      .db-rating-user { display:flex; flex-direction:column; gap:0.3rem; flex:1; min-width:120px; }
      .db-rating-label { font-size:0.78rem; font-weight:700; color:var(--muted,#4A5E4D); }
      .db-chk-label { display:flex; align-items:center; gap:0.35rem; font-size:0.8rem; cursor:pointer; }
      .db-chk-label input { width:15px; height:15px; accent-color:var(--navy,#1A4A2E); }
      .db-sterren { display:flex; gap:0.05rem; }
      .db-ster { font-size:1.4rem; color:#D1D5DB; cursor:pointer; line-height:1; transition:color 0.1s; }
      .db-ster.aan { color:#F59E0B; }
      .db-ster:hover { color:#FCD34D; }
    `;
    document.head.appendChild(s);
  }

  return { render, renderGerechten, _sheetsLees: sheetsLees, _sheetsVoegEntryToe: sheetsVoegEntryToe };

})();
