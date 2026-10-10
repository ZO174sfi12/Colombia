/* dagsync.js — vult dag-, datum- en vluchtlabels in vanuit reservaties.js.
   Conventie op de site: "Dag 3–6" = de dagen dat je ergens bent, de vertrekdag niet meegeteld
   (reservaties.js zelf gebruikt dag/totDag mét vertrekdag). De laatste etappe loopt tot dag 24.

   Gebruik in HTML (de bestaande tekst blijft staan als fallback):
     <span data-verblijf="hotel-salento" data-veld="dagen">Dag 3–6</span>
       veld: dagen | datums | dagen-datums | nachten | dagen-klein (svg: "dag 3–6")
     <span data-vlucht="vlucht-heen" data-veld="vertrek">10:05</span>
       veld: vertrek | aankomst | datum-vertrek | datum-aankomst | duur | vluchtnr | operator | ref
     <div data-vlucht="vlucht-heen" data-veld="hero">…</div>   → "✈️ BRU 18 nov 10:05 → BOG 19:25"
   Leest uitsluitend uit reservaties.js. */
(function(){
  if (typeof RESERVATIES === 'undefined') return;
  var MND = ['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'];
  var LAATSTE = (typeof REISDAGEN !== 'undefined') ? REISDAGEN : 24;

  function datum(dag){ var d = new Date(DAG1 + 'T12:00:00'); d.setDate(d.getDate() + dag - 1); return d; }
  function kort(a, b){
    var da = datum(a), db = datum(b);
    if (da.getMonth() === db.getMonth()) return da.getDate() + '–' + db.getDate() + ' ' + MND[da.getMonth()];
    return da.getDate() + ' ' + MND[da.getMonth()] + ' – ' + db.getDate() + ' ' + MND[db.getMonth()];
  }
  function verblijf(r){
    var van = r.dag, tot = r.totDag ? r.totDag - 1 : r.dag;
    if (r.totDag === LAATSTE) tot = LAATSTE;          /* laatste etappe: tot en met de vertrekdag */
    return { van:van, tot:tot, nachten:r.nachten || (r.totDag - r.dag) };
  }
  function esc(x){ return String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }

  /* ---- verblijven ---- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-verblijf]'), function(el){
    var r = resById(el.getAttribute('data-verblijf')); if (!r) return;
    var v = verblijf(r), veld = el.getAttribute('data-veld') || 'dagen', dagen = 'Dag ' + v.van + '–' + v.tot;
    switch (veld){
      case 'dagen':        el.textContent = dagen; break;
      case 'dagen-klein':  el.textContent = 'dag ' + v.van + '–' + v.tot; break;
      case 'datums':       el.textContent = kort(v.van, v.tot); break;
      case 'nachten':      el.textContent = v.nachten + ' nacht' + (v.nachten > 1 ? 'en' : ''); break;
      case 'dagen-datums': el.innerHTML = esc(dagen) + '<br><small style="font-weight:400;opacity:0.85">' + esc(kort(v.van, v.tot)) + '</small>'; break;
    }
  });

  /* ---- vluchten ---- */
  function dagLabel(dag){ return resDatum(dag); }
  Array.prototype.forEach.call(document.querySelectorAll('[data-vlucht]'), function(el){
    var r = resById(el.getAttribute('data-vlucht')); if (!r) return;
    var veld = el.getAttribute('data-veld') || 'vertrek';
    var aank = String(r.aankomst || '').replace(/\s*\(.*\)$/, '');          /* "20:15 (za 12 dec)" → "20:15" */
    var aankDag = /\(([^)]+)\)/.exec(r.aankomst || '');
    switch (veld){
      case 'vertrek':        el.textContent = r.vertrek || ''; break;
      case 'aankomst':       el.textContent = aank; break;
      case 'datum-vertrek':  el.textContent = dagLabel(r.dag); break;
      case 'datum-aankomst': el.textContent = aankDag ? aankDag[1] : dagLabel(r.dag); break;
      case 'duur':           el.textContent = r.duur || ''; break;
      case 'operator':       el.textContent = r.operator || ''; break;
      case 'ref':            el.textContent = r.ref ? 'Boekingsref. ' + r.ref : ''; break;
      case 'vluchtnr':
        el.innerHTML = String(r.vluchtnr || '').split(/\s*\+\s*/).map(function(n){ return '<span class="fl-chip nr">' + esc(n) + '</span>'; }).join('');
        break;
      case 'hero':
        el.textContent = '✈️ ' + r.van + ' ' + dagLabel(r.dag).replace(/^\w+ /, '') + ' ' + r.vertrek + ' → ' + r.naar + ' ' +
                         (aankDag ? aankDag[1].replace(/^\w+ /, '') + ' ' : '') + aank;
        break;
    }
  });
})();
