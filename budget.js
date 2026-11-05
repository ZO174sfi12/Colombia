/* budget.js — budgettabel op index.html: nu vs oorspronkelijk budget, uitsplitsing achter het uitvouwen.
   Bedragen komen uit reservaties.js (RESERVATIES, BUDGET_POSTEN, BUDGET_ORIGINEEL).
   Niets hier met de hand bijwerken. */
(function(){
  if (typeof RESERVATIES === 'undefined') return;
  var el = document.getElementById('budgetTabel');
  if (!el) return;

  function esc(x){ return String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
  function eur(n){ return '€' + Math.round(n).toLocaleString('nl-BE'); }
  function delta(nu, was){
    if (was == null) return '<span class="bd"></span>';
    var d = Math.round(nu - was);
    var cls = d > 0 ? 'bd-plus' : (d < 0 ? 'bd-min' : 'bd-nul');
    return '<span class="bd ' + cls + '">' + (d > 0 ? '+' : d < 0 ? '−' : '±') + eur(Math.abs(d)) + '</span>';
  }

  var b = budgetOverzicht();
  var O = (typeof BUDGET_ORIGINEEL !== 'undefined') ? BUDGET_ORIGINEEL : {};
  var post = {}; b.posten.forEach(function(p){ post[p.id] = p; });

  /* deelregels */
  function lijn(label, detail, bedrag, geboekt){
    return '<div class="bsub"><span class="bl">' + label + (detail ? ' <small>' + esc(detail) + '</small>' : '') + '</span>' +
           '<span class="bv">' + eur(bedrag) + (geboekt ? ' <span class="bok">✓</span>' : ' <small>raming</small>') + '</span></div>';
  }
  var intl = [], binnen = [], land = [], hotels = [];
  var sIntl = 0, sBin = 0, sLand = 0;
  b.vluchtItems.forEach(function(r){
    var v = resBedrag(r);
    if (r.type === 'transfer'){ land.push(lijn('🚗 ' + esc(r.titel), 'dag ' + r.dag, v, true)); sLand += v; }
    else if (r.id === 'vlucht-heen'){ intl.push(lijn('✈️ ' + esc(r.titel) + ' + terug', 'heen en terug, één boeking', v, true)); sIntl += v; }
    else { binnen.push(lijn('✈️ ' + esc(r.titel), 'dag ' + r.dag + (r.vluchtnr ? ' · ' + r.vluchtnr : ''), v, true)); sBin += v; }
  });
  var gv = post.grondvervoer;
  if (gv){ land.push(lijn('🚌 Rest over land', gv.detail, gv.bedrag, false)); sLand += gv.bedrag; }
  RESERVATIES.slice().sort(resSorteer).forEach(function(r){
    if (r.type !== 'hotel' || r.status === 'vervallen' || !r.nachten) return;
    var v = resBedrag(r), ok = v > 0;
    if (!ok) v = r.nachten * (r.raming || post.hotels.perNacht);
    hotels.push(lijn('🏨 ' + esc(r.titel), r.datums + ' · ' + r.nachten + ' n.', v, ok));
  });

  function rij(label, nu, was, kind, zeker){
    var head = '<span class="bl">' + label + '</span><span class="bv">' + eur(nu) +
               (zeker ? ' <span class="bok">✓</span>' : '') + '</span><span class="bw">' + (was != null ? eur(was) : '') + '</span>' + delta(nu, was);
    if (!kind || !kind.length) return '<div class="brow">' + head + '</div>';
    return '<details class="bpost"><summary class="brow">' + head + '</summary><div class="bdet">' + kind.join('') + '</div></details>';
  }

  var exclNu = sIntl + sBin + sLand + post.hotels.bedrag + post.activiteiten.bedrag;
  var exclWas = O.intl + O.binnen + O.land + O.hotels + O.activiteiten;
  var out = '<div class="brow bkop"><span class="bl">Post · 2 personen</span><span class="bv">Nu</span><span class="bw">Oorspr.</span><span class="bd">Verschil</span></div>';
  out += rij('✈️ Internationale vlucht', sIntl, O.intl, intl, true);
  out += rij('✈️ Binnenlandse vluchten <small>(' + binnen.length + ')</small>', sBin, O.binnen,
             binnen.concat(['<div class="bnote">Oorspronkelijk: één vlucht Medellín → Cartagena (±€160).</div>']), true);
  out += rij('🚗 Vervoer over land', sLand, O.land, land.concat(['<div class="bnote">Oorspronkelijk: enkel bussen (±€60); nu ook de privéchauffeur Salento → Medellín.</div>']));
  out += rij('🏨 Overnachtingen <small>(' + post.hotels.detail.split(' · ')[0] + ')</small>', post.hotels.bedrag, O.hotels,
             hotels.concat(['<div class="bnote">' + esc(post.hotels.detail) + '. Oorspronkelijk: 22 nachten à ±€70.</div>']));
  out += rij('🎟️ Activiteiten & tours', post.activiteiten.bedrag, O.activiteiten, ['<div class="bnote">' + esc(post.activiteiten.detail) + ' · schatting</div>']);
  out += '<div class="brow btot"><span class="bl">💰 Totaal excl. eten</span><span class="bv">' + eur(exclNu) + '</span><span class="bw">' + eur(exclWas) + '</span>' + delta(exclNu, exclWas) + '</div>';
  out += rij('🍽️ Eten & drinken', post.eten.bedrag, O.eten, ['<div class="bnote">' + esc(post.eten.detail) + ' · schatting</div>']);
  out += '<div class="brow btot"><span class="bl">💰 Totaal incl. eten</span><span class="bv">' + eur(exclNu + post.eten.bedrag) + '</span><span class="bw">' + eur(exclWas + O.eten) + '</span>' + delta(exclNu + post.eten.bedrag, exclWas + O.eten) + '</div>';
  out += '<div class="bvoet">Oorspronkelijk = budget van ' + esc(O.datum || '') + '. ✓ = geboekt, de rest is raming. Tik op een post voor de uitsplitsing.</div>';
  el.innerHTML = out;
})();
