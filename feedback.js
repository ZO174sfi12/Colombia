/**
 * Colombia Site — Feedback Widget
 * Sla berichten op in notes.txt via de GitHub Contents API.
 *
 * INSTELLEN (éénmalig):
 *   1. Ga naar github.com → Settings → Developer settings → Personal access tokens
 *   2. Maak een token aan met scope: repo (of alleen "Contents: write" bij fine-grained)
 *   3. Voer het token in het widget in — het wordt opgeslagen in localStorage
 *
 * GEBRUIK IN CLAUDE:
 *   Zeg "lees de notes" om de inhoud van notes.txt op te halen voor evaluatie.
 */

(function () {
  const REPO  = 'ZO174sfi12/Colombia';
  const FILE  = 'notes.txt';
  const ROLES = ['Bert 🧳', 'Ellen 🌺'];

  // ── Build & inject widget HTML ──────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #fb-widget {
      position: fixed; bottom: 1.2rem; right: 1.2rem; z-index: 9999;
      font-family: 'Segoe UI', system-ui, sans-serif;
    }
    #fb-toggle {
      width: 48px; height: 48px; border-radius: 50%;
      background: #1A4A2E; color: white; border: none;
      font-size: 1.3rem; cursor: pointer; box-shadow: 0 3px 12px rgba(0,0,0,0.25);
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.15s;
    }
    #fb-toggle:hover { transform: scale(1.08); }
    #fb-panel {
      display: none; flex-direction: column; gap: 0.6rem;
      background: white; border: 1px solid #E5E0D8;
      border-radius: 14px; padding: 1rem 1.1rem;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      width: min(320px, calc(100vw - 2.4rem));
      margin-bottom: 0.6rem;
    }
    #fb-panel.open { display: flex; }
    #fb-panel h4 {
      font-size: 0.88rem; font-weight: 800; color: #1A4A2E;
      margin-bottom: 0.1rem;
    }
    #fb-panel small { font-size: 0.72rem; color: #6B6052; }
    #fb-role {
      font-size: 0.83rem; padding: 0.4rem 0.7rem;
      border: 1px solid #E5E0D8; border-radius: 8px;
      background: #FAF8F4; width: 100%;
    }
    #fb-text {
      font-size: 0.83rem; padding: 0.55rem 0.7rem;
      border: 1px solid #E5E0D8; border-radius: 8px;
      resize: vertical; min-height: 80px; width: 100%;
      font-family: inherit; line-height: 1.5;
    }
    #fb-text:focus, #fb-role:focus { outline: 2px solid #1A4A2E; border-color: transparent; }
    #fb-row { display: flex; gap: 0.5rem; }
    #fb-send {
      flex: 1; padding: 0.5rem; background: #1A4A2E; color: white;
      border: none; border-radius: 8px; font-weight: 700;
      font-size: 0.83rem; cursor: pointer; transition: opacity 0.15s;
    }
    #fb-send:hover { opacity: 0.85; }
    #fb-send:disabled { opacity: 0.5; cursor: default; }
    #fb-cfg {
      background: none; border: 1px solid #E5E0D8; border-radius: 8px;
      font-size: 0.75rem; padding: 0.5rem 0.7rem; cursor: pointer; color: #6B6052;
    }
    #fb-status {
      font-size: 0.75rem; min-height: 1rem; text-align: center;
    }
    #fb-token-row {
      display: none; flex-direction: column; gap: 0.4rem;
    }
    #fb-token-row.visible { display: flex; }
    #fb-token-input {
      font-size: 0.78rem; padding: 0.4rem 0.6rem;
      border: 1px solid #E5E0D8; border-radius: 8px; width: 100%;
      font-family: monospace;
    }
    #fb-token-save {
      padding: 0.35rem 0.8rem; background: #1A4A2E; color: white;
      border: none; border-radius: 8px; font-size: 0.78rem; cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  const widget = document.createElement('div');
  widget.id = 'fb-widget';
  widget.innerHTML = `
    <div id="fb-panel">
      <h4>💬 Notitie achterlaten</h4>
      <small>Opgeslagen in <code>notes.txt</code> op GitHub · pagina: <strong id="fb-page"></strong></small>
      <select id="fb-role">${ROLES.map(r => `<option>${r}</option>`).join('')}</select>
      <textarea id="fb-text" placeholder="Schrijf hier je opmerking, idee of vraag..."></textarea>
      <div id="fb-row">
        <button id="fb-send">Verstuur</button>
        <button id="fb-cfg" title="GitHub token instellen">⚙️ Token</button>
      </div>
      <div id="fb-token-row">
        <small>GitHub Personal Access Token (opgeslagen in localStorage):</small>
        <input id="fb-token-input" type="password" placeholder="ghp_xxxxxxxxxxxx">
        <button id="fb-token-save">Opslaan</button>
      </div>
      <div id="fb-status"></div>
    </div>
    <button id="fb-toggle" title="Notitie achterlaten">💬</button>
  `;
  document.body.appendChild(widget);

  // ── Wire up UI ──────────────────────────────────────────────────────
  const panel   = document.getElementById('fb-panel');
  const toggle  = document.getElementById('fb-toggle');
  const sendBtn = document.getElementById('fb-send');
  const cfgBtn  = document.getElementById('fb-cfg');
  const status  = document.getElementById('fb-status');
  const tokenRow = document.getElementById('fb-token-row');
  const tokenInput = document.getElementById('fb-token-input');
  const tokenSave  = document.getElementById('fb-token-save');

  document.getElementById('fb-page').textContent =
    window.location.pathname.split('/').pop() || 'index.html';

  toggle.addEventListener('click', () => {
    panel.classList.toggle('open');
    toggle.textContent = panel.classList.contains('open') ? '✕' : '💬';
  });

  cfgBtn.addEventListener('click', () => {
    tokenRow.classList.toggle('visible');
    const saved = localStorage.getItem('ghToken') || '';
    tokenInput.value = saved;
  });

  tokenSave.addEventListener('click', () => {
    localStorage.setItem('ghToken', tokenInput.value.trim());
    tokenRow.classList.remove('visible');
    setStatus('✅ Token opgeslagen', 'green');
  });

  sendBtn.addEventListener('click', sendNote);

  document.getElementById('fb-text').addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) sendNote();
  });

  function setStatus(msg, color) {
    status.textContent = msg;
    status.style.color = color === 'green' ? '#166534'
                       : color === 'red'   ? '#991B1B'
                       : '#6B6052';
    if (color !== 'loading') setTimeout(() => { status.textContent = ''; }, 4000);
  }

  // ── GitHub API ──────────────────────────────────────────────────────
  async function sendNote() {
    const token = localStorage.getItem('ghToken') || '';
    if (!token) {
      tokenRow.classList.add('visible');
      setStatus('⚠️ Voer eerst een GitHub token in', 'red');
      return;
    }

    const role = document.getElementById('fb-role').value;
    const text = document.getElementById('fb-text').value.trim();
    if (!text) { setStatus('⚠️ Notitie is leeg', 'red'); return; }

    sendBtn.disabled = true;
    setStatus('⏳ Opslaan...', 'loading');

    const timestamp = new Date().toLocaleString('nl-BE', {
      dateStyle: 'short', timeStyle: 'short'
    });
    const page = window.location.pathname.split('/').pop() || 'index.html';
    const newLine = `[${timestamp}] [${role}] [${page}]\n${text}\n\n`;

    try {
      const headers = {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      };
      const apiUrl = `https://api.github.com/repos/${REPO}/contents/${FILE}`;

      // 1. Get current file (to get SHA + content)
      let sha = null;
      let existing = '';
      const getResp = await fetch(apiUrl, { headers });
      if (getResp.ok) {
        const data = await getResp.json();
        sha = data.sha;
        existing = atob(data.content.replace(/\n/g, ''));
      } else if (getResp.status !== 404) {
        throw new Error(`GitHub API: ${getResp.status}`);
      }

      // 2. Append new note
      const updated = existing + newLine;
      const encoded = btoa(unescape(encodeURIComponent(updated)));

      // 3. Commit
      const body = {
        message: `note: ${role} @ ${page}`,
        content: encoded,
        ...(sha ? { sha } : {}),
      };
      const putResp = await fetch(apiUrl, {
        method: 'PUT', headers, body: JSON.stringify(body)
      });

      if (!putResp.ok) {
        const err = await putResp.json();
        throw new Error(err.message || putResp.status);
      }

      document.getElementById('fb-text').value = '';
      setStatus('✅ Notitie opgeslagen!', 'green');
    } catch (err) {
      setStatus(`❌ Fout: ${err.message}`, 'red');
    } finally {
      sendBtn.disabled = false;
    }
  }
})();
