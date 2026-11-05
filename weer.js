/* weer.js — weerbanner bovenaan elke locatiepagina.
   Leest #resBlok (data-locatie, data-dagen) en DAG1 uit reservaties.js.
   Binnen 16 dagen voor het verblijf: echte verwachting via Open-Meteo (gratis, geen sleutel).
   Daarbuiten (of offline): klimaatgemiddelde voor eind november / begin december. */
(function(){
  var blok = document.getElementById('resBlok');
  var hero = document.querySelector('.hero');
  if (!blok || !hero || typeof DAG1 === 'undefined') return;

  var LOC = {
    bogota:   { lat:4.598,  lon:-74.076, ic:'🌦️', lbl:'Fris met buien',               min:8,  max:19, tip:'2.640 m: warme laag en regenjas mee' },
    salento:  { lat:4.637,  lon:-75.570, ic:'🌧️', lbl:'Zacht, buien in de namiddag',  min:13, max:22, tip:'november is de natste maand: vroeg starten' },
    medellin: { lat:6.209,  lon:-75.567, ic:'⛅', lbl:'Eeuwige lente, namiddagbuien', min:17, max:27, tip:'regen valt meestal kort en hevig' },
    guatape:  { lat:6.233,  lon:-75.160, ic:'🌦️', lbl:'Zacht met buien',              min:13, max:23, tip:'La Piedra liefst \'s ochtends' },
    minca:    { lat:11.143, lon:-74.117, ic:'🌦️', lbl:'Warm en vochtig, buien',       min:20, max:29, tip:'in de bergen koeler dan aan de kust' },
    tayrona:  { lat:11.270, lon:-73.880, ic:'🌤️', lbl:'Heet, droog seizoen begint',   min:23, max:32, tip:'vroeg wandelen, veel water mee' },
    palomino: { lat:11.250, lon:-73.556, ic:'🌤️', lbl:'Heet en zonnig, met wind',     min:24, max:32, tip:'zee ruw: zwemmen enkel waar locals gaan' }
  };
  var loc = LOC[blok.getAttribute('data-locatie')];
  if (!loc) return;
  var dd = (blok.getAttribute('data-dagen') || '').split('-').map(Number);
  function datum(dag){ var d = new Date(DAG1 + 'T12:00:00'); d.setDate(d.getDate() + dag - 1); return d; }
  function iso(d){ return d.getFullYear() + '-' + ('0'+(d.getMonth()+1)).slice(-2) + '-' + ('0'+d.getDate()).slice(-2); }
  var MND = ['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'];
  var WD = ['zo','ma','di','wo','do','vr','za'];
  var van = datum(dd[0]), tot = datum(dd[1] || dd[0]);   /* aankomst t.e.m. vertrekdag, zoals de boekingsdata */
  var periode = van.getDate() + (van.getMonth() !== tot.getMonth() ? ' ' + MND[van.getMonth()] : '') + '–' + tot.getDate() + ' ' + MND[tot.getMonth()];

  /* stijl één keer */
  var css = '.weer{display:flex;align-items:center;gap:0.8rem;max-width:560px;margin:1rem auto 0;padding:0.65rem 0.9rem;border-radius:14px;' +
    'background:rgba(255,255,255,0.16);border:1px solid rgba(255,255,255,0.35);backdrop-filter:blur(4px);text-align:left;color:#fff;}' +
    '.weer-ic{font-size:2.3rem;line-height:1;flex:none;}' +
    '.weer-main{flex:1;min-width:0;}' +
    '.weer-t{font-size:1.15rem;font-weight:800;line-height:1.2;}' +
    '.weer-l{font-size:0.82rem;font-weight:600;opacity:0.95;}' +
    '.weer-s{font-size:0.7rem;opacity:0.8;margin-top:0.15rem;}' +
    '.weer-dagen{display:flex;gap:0.3rem;flex-wrap:wrap;margin-top:0.45rem;}' +
    '.weer-dag{background:rgba(0,0,0,0.18);border-radius:8px;padding:0.15rem 0.4rem;font-size:0.7rem;white-space:nowrap;}' +
    '.weer-dag b{font-weight:800;}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var el = document.createElement('div'); el.className = 'weer';
  var sub = hero.querySelector('.sub');
  (sub && sub.nextSibling) ? hero.insertBefore(el, sub.nextSibling) : hero.appendChild(el);

  function toon(ic, temp, lbl, bron, dagen){
    el.innerHTML = '<div class="weer-ic">' + ic + '</div><div class="weer-main">' +
      '<div class="weer-t">' + temp + '</div><div class="weer-l">' + lbl + '</div>' +
      (dagen ? '<div class="weer-dagen">' + dagen + '</div>' : '') +
      '<div class="weer-s">' + bron + '</div></div>';
  }
  /* standaard: klimaatgemiddelde */
  toon(loc.ic, loc.min + '–' + loc.max + '°C', loc.lbl + ' · ' + loc.tip,
       'Gemiddeld weer voor ' + periode + ' · de echte verwachting verschijnt hier ±16 dagen vooraf');

  /* WMO-weercode → icoon + label */
  function wmo(c){
    if (c === 0) return ['☀️','zonnig'];
    if (c <= 2)  return ['🌤️','licht bewolkt'];
    if (c === 3) return ['☁️','bewolkt'];
    if (c <= 48) return ['🌫️','mist'];
    if (c <= 57) return ['🌦️','motregen'];
    if (c <= 65) return ['🌧️','regen'];
    if (c <= 67) return ['🌧️','ijzel'];
    if (c <= 77) return ['🌨️','sneeuw'];
    if (c <= 82) return ['🌦️','buien'];
    return ['⛈️','onweer'];
  }
  var nu = new Date(); nu.setHours(12,0,0,0);
  var dagenTot = Math.round((van - nu) / 86400000);
  var einde = new Date(nu); einde.setDate(einde.getDate() + 15);
  if (dagenTot > 15 || tot < nu) return;                 /* te ver weg of voorbij */
  var start = van < nu ? nu : van, stop = tot > einde ? einde : tot;
  var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + loc.lat + '&longitude=' + loc.lon +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=America%2FBogota' +
    '&start_date=' + iso(start) + '&end_date=' + iso(stop);
  fetch(url).then(function(r){ return r.json(); }).then(function(j){
    var d = j && j.daily; if (!d || !d.time || !d.time.length) return;
    var codes = d.weather_code, mx = d.temperature_2m_max, mn = d.temperature_2m_min, pr = d.precipitation_probability_max || [];
    var lo = Math.round(Math.min.apply(null, mn)), hi = Math.round(Math.max.apply(null, mx));
    /* samenvattend icoon: meest voorkomende categorie */
    var tel = {}, best = null;
    codes.forEach(function(c){ var k = wmo(c)[0]; tel[k] = (tel[k] || 0) + 1; if (!best || tel[k] > tel[best]) best = k; });
    var lbl = ''; codes.some(function(c){ if (wmo(c)[0] === best){ lbl = wmo(c)[1]; return true; } });
    var dagen = d.time.map(function(t, i){
      var dt = new Date(t + 'T12:00:00');
      return '<span class="weer-dag">' + WD[dt.getDay()] + ' ' + dt.getDate() + ' ' + wmo(codes[i])[0] + ' <b>' + Math.round(mx[i]) + '°</b>' +
             (pr[i] != null ? ' · ' + pr[i] + '%💧' : '') + '</span>';
    }).join('');
    toon(best, lo + '–' + hi + '°C', 'Verwachting: ' + lbl, 'Weersverwachting Open-Meteo · ' + periode + ' · bijgewerkt bij elk bezoek', dagen);
  }).catch(function(){ /* offline: klimaatgemiddelde blijft staan */ });
})();
