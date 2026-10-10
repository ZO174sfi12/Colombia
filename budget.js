/* budget.js — budgettabel op index.html.
   Vluchtprijzen komen uit reservaties.js, de rest uit BUDGET_POSTEN.
   Niets hier met de hand bijwerken. */
(function(){
  if (typeof RESERVATIES === 'undefined') return;
  var el = document.getElementById('budgetTabel');
  if (!el) return;

  function esc(x){ return String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
  function eur(n){ return '€' + n.toLocaleString('nl-BE', {minimumFractionDigits:0, maximumFractionDigits:0}); }

  var b = budgetOverzicht();
  var out = '';

  function rij(label, detail, bedrag, zeker, extra){
    return '<div class="budget-row' + (extra || '') + '">' +
      '<span class="bl">' + label +
        (detail ? ' <small style="font-weight:400;color:var(--muted)">' + esc(detail) + '</small>' : '') +
      '</span>' +
      '<span class="bv">' + eur(bedrag) +
        (zeker ? ' <span class="res-chip res-geboekt" style="margin-left:0.3rem">✓ geboekt</span>'
               : ' <small style="font-weight:400;color:var(--muted)">schatting</small>') +
      '</span></div>';
  }

  /* geboekte vluchten, één regel per vlucht */
  b.vluchtItems.forEach(function(r){
    out += rij('✈️ ' + esc(r.titel), 'dag ' + r.dag + (r.pnr ? ' · ' + r.pnr : ''), resBedrag(r), true);
  });
  out += rij('<b>✈️ Alle vluchten samen</b>', '', b.vluchten, true, ' budget-sub');

  /* schattingen */
  b.posten.forEach(function(p){
    out += rij(p.label, p.detail, p.bedrag, false);
  });

  out += rij('<b>💰 Totaal excl. eten</b>', '2 personen', b.totaalExclEten, false, ' budget-tot');
  out += rij('<b>💰 Totaal incl. eten</b>', '2 personen · 24 dagen', b.totaalInclEten, false, ' budget-tot');
  el.innerHTML = out;
})();
