/* routestatus.js — chronologisch overzicht + statuschip per etappe op routes.html.
   Leest uitsluitend uit reservaties.js. */
(function(){
  if (typeof RESERVATIES === 'undefined') return;

  var ICO = { vlucht:'✈️', bus:'🚌' };
  var KLEUR = { vlucht:'#6366F1', bus:'#92400E' };

  function esc(x){ return String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }

  var ritten = RESERVATIES
    .filter(function(r){ return (r.type === 'vlucht' || r.type === 'bus') && r.status !== 'vervallen'; })
    .sort(resSorteer);

  /* ---- chronologisch overzicht ---- */
  var el = document.getElementById('routeOverzicht');
  if (el){
    var out = '';
    ritten.forEach(function(r){
      var det = [];
      if (r.operator) det.push(esc(r.operator));
      if (r.vluchtnr) det.push(esc(r.vluchtnr));
      if (r.vertrek)  det.push('vertrek ' + esc(r.vertrek) + (r.aankomst ? ' · aankomst ' + esc(r.aankomst) : ''));
      if (r.duur)     det.push(esc(r.duur));
      if (r.van && r.naar) det.push(esc(r.van) + ' → ' + esc(r.naar));
      if (r.advies)   det.push(esc(r.advies));
      if (r.prijs)    det.push(esc(r.prijs));
      if (r.pnr)      det.push('PNR ' + esc(r.pnr));
      if (r.ref)      det.push('ref. ' + esc(r.ref));

      out += '<div class="ov-row" style="border-left:4px solid ' + KLEUR[r.type] + ';">' +
        '<div class="ov-day">' + ICO[r.type] + '<br><small>Dag ' + r.dag + '</small></div>' +
        '<div class="ov-content"><strong>' + esc(r.titel) + ' ' +
          resChip(r.status, r.deadline || '') + '</strong>' +
          '<span>' + resDatum(r.dag) + (det.length ? ' · ' + det.join(' · ') : '') + '</span></div>' +
        '</div>';
    });
    el.innerHTML = out;
  }

  /* ---- statuschip in de etappekaarten ---- */
  var legs = document.querySelectorAll('.leg[data-dag]');
  Array.prototype.forEach.call(legs, function(leg){
    var dag = parseInt(leg.getAttribute('data-dag'), 10);
    var mijn = ritten.filter(function(r){ return r.dag === dag; });
    if (!mijn.length) return;
    var titel = leg.querySelector('.leg-title');
    if (!titel) return;
    /* strengste status wint: te-boeken > ter-plaatse > geboekt */
    var rang = { 'te-boeken':0, 'ter-plaatse':1, 'geboekt':2 };
    mijn.sort(function(a,b){ return rang[a.status] - rang[b.status]; });
    var r = mijn[0];
    titel.insertAdjacentHTML('beforeend', ' ' + resChip(r.status, r.deadline || ''));
  });
})();
