/* hotelstatus.js — statusregel per locatieblok op hotels.html.
   Leest uitsluitend uit reservaties.js. */
(function(){
  if (typeof RESERVATIES === 'undefined') return;
  function esc(x){ return String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }

  var blokken = document.querySelectorAll('.loc-block[data-loc]');
  Array.prototype.forEach.call(blokken, function(b){
    var loc = b.getAttribute('data-loc');
    if (loc === 'all') return;
    var stays = RESERVATIES.filter(function(r){ return r.type === 'hotel' && r.locatie === loc; })
                           .sort(resSorteer);
    if (!stays.length) return;
    var kop = b.querySelector('.loc-header');
    if (!kop) return;

    var html = '';
    stays.forEach(function(r){
      var d = [];
      if (r.datums)  d.push(esc(r.datums));
      if (r.nachten) d.push(r.nachten + ' nacht' + (r.nachten>1?'en':''));
      if (r.prijs)   d.push(esc(r.prijs));
      if (r.deadline) d.push('<b>' + esc(r.deadline) + '</b>');
      html += '<div class="res-regel">' +
        '<span class="rr-ico">🏨</span>' +
        '<span class="rr-txt"><b>' + esc(r.titel) + '</b>' +
          (d.length ? '<small>' + d.join(' · ') + '</small>' : '') + '</span>' +
        resChip(r.status, '') +
        '</div>';
    });
    var wrap = document.createElement('div');
    wrap.className = 'res-blok';
    wrap.style.margin = '0 0 1rem';
    wrap.innerHTML = '<div class="res-blok-kop">Status van deze overnachting</div>' + html;
    kop.parentNode.insertBefore(wrap, kop.nextSibling);
  });
})();
