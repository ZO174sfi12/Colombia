/* dagplan.js — compacte daglijst met uitklapbare details op de locatiepagina's.
   Bron blijft de bestaande HTML:
     .sec-divider "📅 Dag N · …"   → dagkop (+ status uit reservaties.js)
     .route-block .route-row       → compacte regels met tijdslot (handgeschreven "op één blik")
     details.dagdetail .card       → detailinhoud; wordt gekoppeld aan de regel met dezelfde titel,
                                     anders krijgt de kaart een eigen regel
   Gedrag: regels dicht; tik = open; open-stand onthouden (localStorage);
           tijdens de reis staat de dag van vandaag open en scrolt de pagina ernaartoe. */
(function(){
  var SLEUTEL = 'dagplan:' + location.pathname.split('/').pop();
  var geheugen = {};
  try { geheugen = JSON.parse(localStorage.getItem(SLEUTEL) || '{}'); } catch(e){}
  function bewaar(){ try { localStorage.setItem(SLEUTEL, JSON.stringify(geheugen)); } catch(e){} }

  /* vandaag = welke reisdag? (zelfde ankers als de countdown) */
  var vandaagDag = null;
  if (typeof DAG1 !== 'undefined'){
    var d1 = new Date(DAG1 + 'T00:00:00'), nu = new Date(), d0 = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate());
    var n = Math.round((d0 - d1) / 86400000) + 1;
    if (n >= 1 && n <= (typeof REISDAGEN !== 'undefined' ? REISDAGEN : 24)) vandaagDag = n;
  }

  function txt(el){ return (el ? el.textContent : '').replace(/\s+/g,' ').trim(); }
  function emoji(s){ var m = s.match(/^\s*(\p{Extended_Pictographic}[️]?)/u); return m ? m[1] : ''; }
  function woorden(s){ return s.toLowerCase().replace(/[^\p{L}\p{N} ]/gu,' ').split(/\s+/).filter(function(w){ return w.length >= 4; }); }
  function score(a, b){                         /* 0 = geen match; hoger = beter */
    var ea = emoji(a), eb = emoji(b);
    var wa = woorden(a), wb = woorden(b), gem = wa.filter(function(w){ return wb.indexOf(w) >= 0; }).length;
    if (!((ea && ea === eb && gem >= 1) || gem >= 2)) return 0;
    return gem * 2 + (ea && ea === eb ? 1 : 0);
  }
  function status(dag, dagTot){
    if (typeof RESERVATIES === 'undefined') return '';
    var t = { geboekt:0, 'te-boeken':0, 'ter-plaatse':0 };
    RESERVATIES.forEach(function(r){ if (r.dag >= dag && r.dag <= dagTot && r.status in t && r.type !== 'hotel') t[r.status]++; });
    var h = '';
    if (t['te-boeken'])   h += '<span class="dk-chip dk-warn">! ' + t['te-boeken'] + ' te boeken</span>';
    if (t.geboekt)        h += '<span class="dk-chip dk-ok">✓ ' + t.geboekt + ' geboekt</span>';
    if (t['ter-plaatse']) h += '<span class="dk-chip">○ ' + t['ter-plaatse'] + ' ter plaatse</span>';
    return h;
  }

  /* route-blocks zonder voorafgaande dagkop krijgen er een (uit hun eigen h3) */
  Array.prototype.forEach.call(document.querySelectorAll('.route-block'), function(rb){
    var h3 = rb.querySelector('h3'); if (!h3 || !/^📍\s*Dag\s*\d+/.test(txt(h3))) return;
    var prev = rb.previousElementSibling;
    if (prev && prev.classList.contains('sec-divider')) return;
    var k = document.createElement('div'); k.className = 'sec-divider';
    k.textContent = txt(h3).replace(/^📍/, '📅').replace(/\s*op één blik\s*/i, ' ').replace(/\s+—\s*$/, '').replace(/\s{2,}/g, ' ').trim();
    rb.parentNode.insertBefore(k, rb);
  });
  var koppen = Array.prototype.filter.call(document.querySelectorAll('.sec-divider'), function(k){ return /^📅\s*Dag\s*\d+/.test(txt(k)); });
  koppen.forEach(function(kop, ki){
    var dag = parseInt(txt(kop).match(/Dag\s*(\d+)/)[1], 10);
    var dagTot = (txt(kop).match(/Dag\s*\d+\s*[–-]\s*(\d+)/) || [0, dag])[1] * 1;
    /* blokken die bij deze dag horen: alles tot de volgende sec-divider / prac-block / einde section */
    var blokken = [], n = kop.nextElementSibling;
    while (n && !n.classList.contains('sec-divider') && !n.classList.contains('prac-block')){ blokken.push(n); n = n.nextElementSibling; }
    var route = blokken.filter(function(b){ return b.classList.contains('route-block'); })[0];
    var details = blokken.filter(function(b){ return b.classList.contains('dagdetail'); });
    var losse = blokken.filter(function(b){ return !b.classList.contains('route-block') && !b.classList.contains('dagdetail'); });

    /* 1. regels uit de handgeschreven timeline */
    var regels = [];
    if (route) Array.prototype.forEach.call(route.querySelectorAll('.route-row'), function(r){
      regels.push({ tijd: txt(r.querySelector('.route-time')), titel: txt(r.querySelector('.route-label')), sub: txt(r.querySelector('.route-sub')), kaart: null });
    });
    /* 2. kaarten koppelen of toevoegen */
    var kaarten = [];
    details.forEach(function(d){ Array.prototype.forEach.call(d.querySelectorAll('.event > .card, .timeline > .card'), function(c){ kaarten.push(c); }); });
    kaarten.forEach(function(c){
      var titel = txt(c.querySelector('h3')), tijd = txt(c.querySelector('.time'));
      var hit = null, best = 0;
      regels.forEach(function(r){ if (r.kaart) return; var s = score(r.titel, titel); if (s > best){ best = s; hit = r; } });
      if (hit){ hit.kaart = c; return; }
      /* geen regel: tijdslot afleiden uit .time ("9:30 · Busstation" → "9:30"; "Dag 4 · Vroeg vertrek" → "Vroeg vertrek") */
      var slot = tijd.replace(/^Dag\s*\d+(–\d+)?\s*[·—-]\s*/i,'').split(/\s*[·—]\s*/)[0];
      var chips = Array.prototype.slice.call(c.querySelectorAll('.meta .chip'), 0, 2).map(txt).join(' · ');
      regels.push({ tijd: slot, titel: titel, sub: chips || txt(c.querySelector('.desc')).slice(0, 90), kaart: c });
    });
    if (!regels.length) return;

    /* 3. opbouwen */
    var wrap = document.createElement('div'); wrap.className = 'dag'; wrap.id = 'dag-' + dag;
    var h = document.createElement('div'); h.className = 'dag-kop';
    h.innerHTML = '<div class="dk-titel">' + kop.innerHTML + '</div><div class="dk-status">' + status(dag) + '</div>';
    wrap.appendChild(h);
    var lijst = document.createElement('div'); lijst.className = 'dag-lijst';
    regels.forEach(function(r, ri){
      var rij = document.createElement('div'); rij.className = 'dag-rij' + (r.kaart ? ' heeft-detail' : '');
      rij.innerHTML = '<div class="dr-tijd">' + r.tijd + '</div><div class="dr-body"><div class="dr-titel">' + r.titel + '</div>' +
                      (r.sub ? '<div class="dr-sub">' + r.sub + '</div>' : '') + '</div>' +
                      (r.kaart ? '<div class="dr-chev">▾</div>' : '');
      lijst.appendChild(rij);
      if (r.kaart){
        var det = document.createElement('div'); det.className = 'dag-detail';
        r.kaart.querySelector('h3').style.display = 'none';          /* titel staat al in de regel */
        det.appendChild(r.kaart);
        lijst.appendChild(det);
        var key = dag + ':' + ri;
        function zet(open){ rij.classList.toggle('open', open); det.style.display = open ? '' : 'none'; }
        zet(geheugen[key] === true || (geheugen[key] === undefined && vandaagDag >= dag && vandaagDag <= dagTot));
        rij.setAttribute('role','button'); rij.tabIndex = 0;
        function toggle(){ var open = !rij.classList.contains('open'); zet(open); geheugen[key] = open; bewaar(); }
        rij.addEventListener('click', toggle);
        rij.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggle(); } });
      }
    });
    wrap.appendChild(lijst);
    losse.forEach(function(b){ wrap.appendChild(b); });              /* bv. tip-kaarten buiten de details */
    kop.parentNode.insertBefore(wrap, kop);
    kop.remove(); if (route) route.remove(); details.forEach(function(d){ d.remove(); });
    if (vandaagDag >= dag && vandaagDag <= dagTot) wrap.classList.add('vandaag');
  });
  var v = document.querySelector('.dag.vandaag');
  if (v) setTimeout(function(){ v.scrollIntoView({ behavior:'smooth', block:'start' }); }, 150);
})();
