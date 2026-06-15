/**
 * Colombia Dagboek Module v2
 *
 * ARCHITECTUUR:
 *   Foto's   → ImgBB API (gratis, permanent, upload vanuit browser)
 *   Data     → GitHub Gist (privé JSON, sync Bert & Ellen)
 *   Lokaal   → localStorage als offline buffer
 *
 * TWEE FUNCTIES:
 *
 *   1. Dagboek.render(locatieId, locatieNaam)
 *      → Gebruik in elke locatiepagina (bogota.html, salento.html, ...)
 *      → Voegt dagboek toe: tekst + foto's per entry, per persoon
 *
 *   2. Dagboek.renderGerechten(gerechten)
 *      → Gebruik in culinair.html
 *      → Voegt ratings toe (geprobeerd + sterren) per gerecht, voor Bert & Ellen apart
 *
 * SETUP (eenmalig via setup.html):
 *   - ImgBB API key    → imgbb.com → API
 *   - GitHub Token     → github.com/settings/tokens → scope: gist
 *   - Gist ID          → gist.github.com → nieuw bestand colombia_reis.json inhoud: {}
 *
 * INTEGRATIE LOCATIEPAGINA (2 regels):
 *   <script src="dagboek.js"></script>
 *   <script>Dagboek.render('bogota', 'Bogotá');</script>
 *
 * INTEGRATIE CULINAIR.HTML:
 *   <script src="dagboek.js"></script>
 *   <script>Dagboek.renderGerechten(GERECHTEN_ARRAY);</script>
 */

const Dagboek = (() => {

  // ─── CONFIG ────────────────────────────────────────────────────────────────
  const cfg = () => ({
    imgbbKey:  localStorage.getItem('cfg_imgbb') || '',
    gistId:    localStorage.getItem('cfg_gist_id') || '',
    gistToken: localStorage.getItem('cfg_gist_token') || '',
    user:      localStorage.getItem('cfg_user') || 'Bert',
  });

  // ─── GIST LEZEN ────────────────────────────────────────────────────────────
  // Gist is publiek: lezen via raw URL, geen token nodig
  const PUBLIEKE_RAW_URL = 'https://gist.githubusercontent.com/ZO174sfi12/a16b9d5e6c73ff7e3921a8a413d44437/raw/colombia_reis.json';

  async function gistLees() {
    try {
      const r = await fetch(PUBLIEKE_RAW_URL + '?t=' + Date.now());
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const inhoud = await r.text();
      localStorage.setItem('reis_data', inhoud);
      return JSON.parse(inhoud);
    } catch (e) {
      console.warn('Gist lezen mislukt, gebruik lokale cache:', e);
      return lokaleLees();
    }
  }

  // ─── GIST SCHRIJVEN ────────────────────────────────────────────────────────
  async function gistSchrijf(data) {
    const { gistId, gistToken } = cfg();
    const json = JSON.stringify(data, null, 2);
    localStorage.setItem('reis_data', json);
    if (!gistId || !gistToken) return;
    try {
      await fetch(`https://api.github.com/gists/${gistId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `token ${gistToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          files: { 'colombia_reis.json': { content: json } }
        })
      });
    } catch (e) {
      console.warn('Gist schrijven mislukt, alleen lokaal opgeslagen:', e);
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
  function zekereSleutel(data, sleutel) {
    if (!data[sleutel]) data[sleutel] = {};
    return data;
  }

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
  // Gebruik: Dagboek.render('bogota', 'Bogotá');
  // ═══════════════════════════════════════════════════════════════════════════
  async function render(locatieId, locatieNaam) {
    injectCSS();

    const container = document.createElement('div');
    container.id = 'dagboek-module';
    container.innerHTML = dagboekHTML(locatieNaam);

    const footer = document.querySelector('.footer');
    if (footer) document.body.insertBefore(container, footer);
    else document.body.appendChild(container);

    const data = await gistLees();
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

  function renderEntries(locatieId, data) {
    const el = document.getElementById('db-entries');
    if (!el) return;
    const entries = data[locatieId]?.entries || [];
    if (!entries.length) {
      el.innerHTML = '<p class="db-leeg">Nog geen dagboekentries voor deze locatie.</p>';
      return;
    }
    el.innerHTML = [...entries].reverse().map(e => `
      <div class="db-entry">
        <div class="db-entry-meta">
          <span class="db-entry-user">${e.user === 'Ellen' ? '👩 Ellen' : '🧔 Bert'}</span>
          <span class="db-entry-datum">${formatDatum(e.datum)}</span>
        </div>
        <p class="db-entry-tekst">${e.tekst.replace(/\n/g, '<br>')}</p>
        ${e.fotos?.length ? `
          <div class="db-entry-fotos">
            ${e.fotos.map(f =>
              `<a href="${f.url}" target="_blank">
                <img src="${f.thumb || f.url}" class="db-thumb" loading="lazy">
              </a>`
            ).join('')}
          </div>` : ''}
      </div>
    `).join('');
  }

  function bindDagboekEvents(locatieId, data) {
    // Gebruikersknoppen
    const actieveUser = () => localStorage.getItem('cfg_user') || 'Bert';
    document.querySelectorAll('.db-user-btn').forEach(btn => {
      if (btn.dataset.user === actieveUser()) btn.classList.add('active');
      btn.addEventListener('click', () => {
        localStorage.setItem('cfg_user', btn.dataset.user);
        document.querySelectorAll('.db-user-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Foto preview
    let geselecteerdeFotos = [];
    const fotoInput = document.getElementById('db-foto-input');
    const preview = document.getElementById('db-foto-preview');

    fotoInput?.addEventListener('change', () => {
      geselecteerdeFotos = Array.from(fotoInput.files);
      preview.innerHTML = geselecteerdeFotos.map(f => `
        <div class="db-prev-item">
          <img src="${URL.createObjectURL(f)}" class="db-prev-img">
          <span class="db-prev-naam">${f.name}</span>
        </div>`).join('');
    });

    // Opslaan
    document.getElementById('db-opslaan')?.addEventListener('click', async () => {
      const tekst = document.getElementById('db-tekst').value.trim();
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

        zekereLocatie(data, locatieId);
        data[locatieId].entries.push({
          id: Date.now(),
          datum: new Date().toISOString(),
          user: actieveUser(),
          tekst,
          fotos: fotoUrls,
        });

        await gistSchrijf(data);

        document.getElementById('db-tekst').value = '';
        fotoInput.value = '';
        geselecteerdeFotos = [];
        preview.innerHTML = '';
        renderEntries(locatieId, data);
        toonStatus(status, '✅ Opgeslagen!', 'ok');
        setTimeout(() => { if (status) status.textContent = ''; }, 3000);

      } catch (e) {
        toonStatus(status, `❌ ${e.message}`, 'error');
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FUNCTIE 2: GERECHTEN RATINGS (voor culinair.html)
  // Gebruik: Dagboek.renderGerechten(gerechten)
  // gerechten = array van strings of {id, naam} objecten
  // De functie voegt een rating-knop toe aan elk .db-gerecht-card element
  // ═══════════════════════════════════════════════════════════════════════════
  async function renderGerechten(gerechten) {
    injectCSS();

    const data = await gistLees();
    zekereSleutel(data, 'gerechten');

    // Voeg rating UI toe aan elke gerechtenkaart op de pagina
    // Elke kaart moet data-gerecht="id" hebben, of we matchen op index
    gerechten.forEach((g, i) => {
      const id = g.id || `g_${i}`;
      const naam = g.naam || g;

      // Zoek de kaart op naam of data-attribuut
      let kaart = document.querySelector(`[data-gerecht="${id}"]`);

      if (!kaart) {
        // Fallback: maak een standalone sectie aan als er geen kaart is
        return;
      }

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

    // Events binden
    document.querySelectorAll('.db-rating-blok').forEach(blok => {
      const gid = blok.dataset.gerechtId;

      blok.querySelectorAll('.db-geprobeerd').forEach(chk => {
        chk.addEventListener('change', () => slaRatingOp(data, gid, blok));
      });

      blok.querySelectorAll('.db-ster').forEach(ster => {
        ster.addEventListener('click', function () {
          const sterrenBlok = this.closest('.db-sterren');
          const r = +this.dataset.r;
          sterrenBlok.querySelectorAll('.db-ster')
            .forEach((s, i) => s.classList.toggle('aan', i < r));
          slaRatingOp(data, gid, blok);
        });
      });
    });
  }

  async function slaRatingOp(data, gid, blok) {
    zekereSleutel(data, 'gerechten');
    if (!data.gerechten[gid]) data.gerechten[gid] = {};

    ['Bert', 'Ellen'].forEach(u => {
      const chk = blok.querySelector(`.db-geprobeerd[data-user="${u}"]`);
      const sterren = blok.querySelectorAll(`.db-sterren[data-user="${u}"] .db-ster.aan`);
      data.gerechten[gid][u] = {
        geprobeerd: chk?.checked || false,
        rating: sterren.length
      };
    });

    await gistSchrijf(data);
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

      /* Gebruiker toggle */
      .db-gebruiker { display:flex; align-items:center; gap:0.5rem; margin-bottom:0.8rem; font-size:0.83rem; color:var(--muted,#4A5E4D); flex-wrap:wrap; }
      .db-user-btn { border:1px solid var(--border,#E5E0D8); background:white; border-radius:20px; padding:0.3rem 0.9rem; font-size:0.8rem; cursor:pointer; transition:all 0.15s; }
      .db-user-btn.active { background:var(--navy,#1A4A2E); color:white; border-color:var(--navy,#1A4A2E); }

      /* Invoer */
      .db-invoer { background:white; border:1px solid var(--border,#E5E0D8); border-radius:12px; padding:1rem; margin-bottom:1rem; }
      .db-invoer textarea { width:100%; border:1px solid var(--border,#E5E0D8); border-radius:8px; padding:0.7rem; font-size:0.85rem; font-family:inherit; resize:vertical; color:var(--text,#1C2A1E); background:var(--cream,#FAF8F4); }
      .db-invoer textarea:focus { outline:none; border-color:var(--navy,#1A4A2E); }
      .db-invoer-acties { display:flex; gap:0.6rem; align-items:center; margin-top:0.7rem; flex-wrap:wrap; }
      .db-foto-btn { background:var(--cream,#FAF8F4); border:1px solid var(--border,#E5E0D8); border-radius:8px; padding:0.45rem 0.9rem; font-size:0.82rem; cursor:pointer; white-space:nowrap; }
      .db-sla-op { background:var(--navy,#1A4A2E); color:white; border:none; border-radius:8px; padding:0.45rem 1.1rem; font-size:0.82rem; font-weight:700; cursor:pointer; margin-left:auto; }
      .db-sla-op:active { opacity:0.8; }

      /* Foto preview */
      .db-foto-preview { display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:0.6rem; }
      .db-prev-item { display:flex; flex-direction:column; align-items:center; gap:0.2rem; }
      .db-prev-img { width:64px; height:64px; object-fit:cover; border-radius:6px; border:1px solid var(--border,#E5E0D8); }
      .db-prev-naam { font-size:0.65rem; color:var(--muted,#4A5E4D); max-width:64px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

      /* Status */
      .db-status { font-size:0.8rem; margin-top:0.5rem; padding:0.35rem 0.65rem; border-radius:6px; min-height:1.4rem; }
      .db-status-ok    { background:#DCFCE7; color:#14532D; }
      .db-status-warn  { background:#FEF3C7; color:#78350F; }
      .db-status-error { background:#FEE2E2; color:#7F1D1D; }
      .db-status-info  { background:#EFF6FF; color:#1E3A8A; }

      /* Entries */
      .db-entries { display:flex; flex-direction:column; gap:0.8rem; }
      .db-leeg { font-size:0.83rem; color:var(--muted,#4A5E4D); font-style:italic; padding:0.4rem 0; }
      .db-entry { background:white; border:1px solid var(--border,#E5E0D8); border-radius:12px; padding:1rem; }
      .db-entry-meta { display:flex; gap:0.6rem; align-items:center; margin-bottom:0.5rem; }
      .db-entry-user { font-size:0.75rem; font-weight:700; background:var(--navy,#1A4A2E); color:white; border-radius:20px; padding:0.15rem 0.6rem; }
      .db-entry-datum { font-size:0.75rem; color:var(--muted,#4A5E4D); }
      .db-entry-tekst { font-size:0.85rem; line-height:1.6; }
      .db-entry-fotos { display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:0.7rem; }
      .db-thumb { width:84px; height:84px; object-fit:cover; border-radius:8px; border:1px solid var(--border,#E5E0D8); }

      /* Sectietitel */
      .db-wrap .sec-title { font-size:0.9rem; font-weight:800; color:var(--navy,#1A4A2E); border-top:2px solid var(--border,#E5E0D8); padding-top:1rem; margin:1.5rem 0 0.8rem; text-transform:uppercase; letter-spacing:0.5px; }

      /* Gerechten ratings */
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

  // _gistLees en _gistSchrijf worden ook geëxporteerd
  // zodat culinair.html ze direct kan gebruiken
  return { render, renderGerechten, _gistLees: gistLees, _gistSchrijf: gistSchrijf };

})();
