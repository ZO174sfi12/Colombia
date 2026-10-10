/* locatieblok.js — "Vastgelegd voor deze locatie" op elke locatiepagina.
   Plaatsing:  <div id="resBlok" data-locatie="salento" data-dagen="3-7"></div>
   Leest uitsluitend uit reservaties.js. */
(function(){
  if (typeof RESERVATIES === 'undefined') return;
  var el = document.getElementById('resBlok');
  if (!el) return;

  var loc  = el.getAttribute('data-locatie');
  var rng  = (el.getAttribute('data-dagen') || '').split('-');
  var van  = parseInt(rng[0], 10), tot = parseInt(rng[1] || rng[0], 10);

  function esc(x){ return String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
  function inRange(d){ return d >= van && d <= tot; }

  var ICO = { vlucht:'✈️', bus:'🚌', hotel:'🏨', activiteit:'🎯' };
  var regels = [];

  /* overnachting(en) voor deze locatie binnen dit dagbereik */
  RESERVATIES.forEach(function(r){
    if (r.type !== 'hotel' || r.locatie !== loc || r.status === 'vervallen') return;
    if (r.dag !== van) return;
    var d = [];
    if (r.datums)  d.push(esc(r.datums));
    if (r.nachten) d.push(r.nachten + ' nacht' + (r.nachten>1?'en':''));
    if (r.prijs)   d.push(esc(r.prijs));
    if (r.annuleren) d.push(esc(r.annuleren));
    if (r.deadline)  d.push('<b>' + esc(r.deadline) + '</b>');
    regels.push({ ico:ICO.hotel, kop:r.titel, sub:d.join(' · '), status:r.status, link:'hotels.html#loc=' + loc });
  });

  /* heen- en terugreis: bewegingen op de eerste en laatste dag, op dagvolgorde */
  var bewegingen = [];
  RESERVATIES.slice().sort(resSorteer).forEach(function(r){
    if (r.type !== 'bus' && r.type !== 'vlucht') return;
    if (r.status === 'vervallen') return;
    if (r.dag !== van && r.dag !== tot) return;
    var rol = (r.dag === van) ? 'Aankomst' : 'Verder reizen';
    var d = [];
    if (r.operator) d.push(esc(r.operator));
    if (r.vertrek)  d.push(esc(r.vertrek) + (r.aankomst ? ' → ' + esc(r.aankomst) : ''));
    if (r.duur)     d.push(esc(r.duur));
    if (r.advies)   d.push(esc(r.advies));
    if (r.ref)      d.push('ref. ' + esc(r.ref));
    if (r.deadline) d.push('<b>' + esc(r.deadline) + '</b>');
    bewegingen.push({ ico:ICO[r.type], kop:rol + ' · ' + r.titel, sub:'Dag ' + r.dag + ' · ' + resDatum(r.dag) + (d.length ? ' · ' + d.join(' · ') : ''),
                  status:r.status, link:'routes.html' });
  });
  bewegingen.forEach(function(x){ regels.push(x); });

  /* activiteiten die reservering vragen */
  RESERVATIES.forEach(function(r){
    if (r.type !== 'activiteit' || r.locatie !== loc || r.status === 'vervallen') return;
    if (!inRange(r.dag)) return;
    var d = ['Dag ' + r.dag + ' · ' + resDatum(r.dag)];
    if (r.vertrek) d.push(esc(r.vertrek));
    if (r.prijs)   d.push(esc(r.prijs));
    if (r.note)    d.push(esc(r.note));
    regels.push({ ico:ICO.activiteit, kop:r.titel, sub:d.join(' · '), status:r.status, link:'activiteiten.html' });
  });

  if (!regels.length){ el.style.display = 'none'; return; }

  var tel = { geboekt:0, 'te-boeken':0, 'ter-plaatse':0 };
  regels.forEach(function(x){ if (x.status in tel) tel[x.status]++; });
  var samen = [];
  if (tel['te-boeken'])   samen.push('<b style="color:#B45309">! ' + tel['te-boeken'] + ' te boeken</b>');
  if (tel.geboekt)        samen.push('<span style="color:#16A34A">✓ ' + tel.geboekt + ' geboekt</span>');
  if (tel['ter-plaatse']) samen.push('○ ' + tel['ter-plaatse'] + ' ter plaatse');
  var html = '<div class="res-blok-kop klik" role="button" tabindex="0"><span>Vastgelegd voor deze locatie · <small style="font-weight:600">' + samen.join(' · ') + '</small></span><span class="rb-chev">▾</span></div>';
  regels.forEach(function(x){
    html += '<div class="res-regel">' +
      '<span class="rr-ico">' + x.ico + '</span>' +
      '<span class="rr-txt"><a href="' + x.link + '" style="color:inherit;text-decoration:none;font-weight:700">' +
        esc(x.kop) + '</a>' + (x.sub ? '<small>' + x.sub + '</small>' : '') + '</span>' +
      resChip(x.status, '', true) +
      '</div>';
  });
  el.className = 'res-blok inklap' + (tel['te-boeken'] ? ' open' : '');   /* open als er nog iets te boeken is */
  el.innerHTML = html;
  var kop = el.querySelector('.res-blok-kop.klik');
  function toggle(){ el.classList.toggle('open'); }
  kop.addEventListener('click', toggle);
  kop.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggle(); } });
})();
