/* grootboek.js — rendert statustellers, samenvatting en het grootboek.
   Leest uitsluitend uit reservaties.js. Niets hier met de hand bijwerken. */
(function(){
  if (typeof RESERVATIES === 'undefined') return;

  var GROEPEN = [
    { type:'vlucht',     kop:'Vluchten',     ico:'✈️' },
    { type:'bus',        kop:'Bussen',       ico:'🚌' },
    { type:'hotel',      kop:'Overnachtingen', ico:'🏨' },
    { type:'activiteit', kop:'Activiteiten met reservering', ico:'🎯' }
  ];

  function esc(x){ return String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }

  /* ---- tellers in de hero ---- */
  var elT = document.getElementById('resTellers');
  if (elT){
    var t = resTellers(), html = '';
    GROEPEN.forEach(function(g){
      var c = t[g.type]; if (!c || !c.totaal) return;
      var open = c.teBoeken;
      html += '<a class="res-teller' + (open ? ' warn' : '') + '" href="#gb-' + g.type + '">' +
              g.ico + ' <b>' + c.geboekt + '/' + c.totaal + '</b> geboekt' +
              (open ? ' · ' + open + ' te boeken' : '') + '</a>';
    });
    elT.innerHTML = html;
  }

  /* ---- eenregelige samenvatting ---- */
  var elS = document.getElementById('gbSamenvatting');
  if (elS){
    var tt = resTellers(), delen = [], openTot = 0;
    GROEPEN.forEach(function(g){
      var c = tt[g.type]; if (!c || !c.totaal) return;
      delen.push('<a class="gb-link" href="#gb-' + g.type + '">' +
                 c.geboekt + ' van ' + c.totaal + ' ' + esc(g.kop.toLowerCase()) + '</a>');
      openTot += c.teBoeken;
    });
    elS.innerHTML = delen.join(' · ') +
      (openTot ? ' — <button type="button" class="gb-filter" id="gbFilter" aria-pressed="false">' +
                 openTot + ' nog te boeken</button>' : '');
  }

  /* ---- grootboek ---- */
  var elG = document.getElementById('grootboek');
  if (!elG) return;

  /* compact overzicht: enkel wat, wanneer en (voor open punten) wat er nog moet gebeuren.
     Details (kamer, refs, uren, notities) staan op de locatie- en hotelpagina's. */
  function regel(r){
    var kern = [];
    if (r.vluchtnr)  kern.push('<b>' + esc(r.vluchtnr) + '</b>');
    if (r.vertrek)   kern.push(esc(r.vertrek) + (r.aankomst ? ' → ' + esc(r.aankomst) : ''));
    else if (r.datums) kern.push('<b>' + esc(r.datums) + '</b>' + (r.nachten ? ' · ' + r.nachten + ' nacht' + (r.nachten>1?'en':'') : ''));
    if (r.prijs)     kern.push(esc(String(r.prijs).split(' · ')[0]));
    var todo = (r.status === 'te-boeken' && r.deadline) ? '<div class="gb-todo">⏳ ' + esc(r.deadline) + '</div>' : '';
    return '<div class="gb-rij" data-status="' + r.status + '">' +
      '<div class="gb-dag">Dag ' + r.dag + (r.totDag ? '–' + r.totDag : '') +
        '<small>' + resDatum(r.dag) + '</small></div>' +
      '<div class="gb-txt"><strong>' + esc(r.titel) + '</strong>' +
        (kern.length ? '<div class="gb-kern">' + kern.join(' · ') + '</div>' : '') + todo +
      '</div>' +
      resChip(r.status, '') +
      '</div>';
  }

  var out = '';
  GROEPEN.forEach(function(g){
    var items = resVoor({type:g.type}).sort(resSorteer);
    if (!items.length) return;
    out += '<div class="gb-groep" id="gb-' + g.type + '">' + g.ico + ' ' + esc(g.kop) + '</div>';
    items.forEach(function(r){ out += regel(r); });
  });
  elG.innerHTML = out;

  /* ---- filterknop: toon alleen wat nog geboekt moet worden ---- */
  var btn = document.getElementById('gbFilter');
  if (btn){
    btn.addEventListener('click', function(){
      var aan = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', aan ? 'true' : 'false');
      btn.textContent = aan ? 'Toon alles' : (function(){
        var n = 0; RESERVATIES.forEach(function(r){ if (r.status === 'te-boeken') n++; }); return n + ' nog te boeken';
      })();
      Array.prototype.forEach.call(elG.querySelectorAll('.gb-rij'), function(rij){
        rij.style.display = (aan && rij.getAttribute('data-status') !== 'te-boeken') ? 'none' : '';
      });
      /* groepskop verbergen als er niets van over is */
      Array.prototype.forEach.call(elG.querySelectorAll('.gb-groep'), function(kop){
        var zichtbaar = false, n = kop.nextElementSibling;
        while (n && n.classList.contains('gb-rij')){
          if (n.style.display !== 'none') zichtbaar = true;
          n = n.nextElementSibling;
        }
        kop.style.display = zichtbaar ? '' : 'none';
      });
      if (aan) elG.scrollIntoView({behavior:'smooth', block:'start'});
    });
  }
})();
