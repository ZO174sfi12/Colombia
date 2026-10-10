/* countdown.js — "N dagen tot vertrek" / "Dag X van 24" / "onderweg naar huis" in de topbar van elke pagina.
   Ankers komen uit reservaties.js (DAG1, REISDAGEN) en de terugvlucht (vlucht-terug). */
(function(){
  if (typeof DAG1 === 'undefined') return;
  var VERTREK = new Date(DAG1 + 'T00:00:00'),
      TOTAAL  = (typeof REISDAGEN !== 'undefined') ? REISDAGEN : 24,
      LAATSTE = new Date(VERTREK); LAATSTE.setDate(LAATSTE.getDate() + TOTAAL - 1);
  var THUIS = new Date(LAATSTE); THUIS.setDate(THUIS.getDate() + 1); THUIS.setHours(20, 15, 0, 0);
  var terug = (typeof resById === 'function') ? resById('vlucht-terug') : null;
  if (terug && terug.aankomst){ var m = /(\d{1,2}):(\d{2})/.exec(terug.aankomst); if (m) THUIS.setHours(+m[1], +m[2], 0, 0); }

  var topbar = document.querySelector('.topbar'), logo = topbar && topbar.querySelector('.logo');
  if (!logo) return;
  var left = document.createElement('div'); left.className = 'tb-left';
  logo.parentNode.insertBefore(left, logo); left.appendChild(logo);
  left.insertAdjacentHTML('beforeend', '<span class="cdchip" id="cdChip" title=""><b id="cdN">—</b><span id="cdL"></span></span>');
  topbar.insertAdjacentHTML('beforeend', '<div class="cdline" id="cdF"></div>');

  function dag0(d){ return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function verschil(a,b){ return Math.round((dag0(b)-dag0(a))/86400000); }
  function render(){
    var nu = new Date(), vandaag = dag0(nu),
        n=document.getElementById('cdN'), l=document.getElementById('cdL'),
        s=document.getElementById('cdChip'), f=document.getElementById('cdF');
    var tot = verschil(vandaag, VERTREK);
    if (tot > 0){
      n.textContent = tot; l.textContent = (tot===1 ? 'dag' : 'dagen') + ' tot vertrek';
      s.title = resDatum ? resDatum(1) + ' → ' + resDatum(TOTAAL) : ''; f.style.width = '0%';
    } else if (vandaag <= dag0(LAATSTE)){
      var dag = verschil(VERTREK, vandaag) + 1, rest = verschil(vandaag, LAATSTE);
      n.textContent = 'Dag ' + dag; l.textContent = 'van ' + TOTAAL + ' in Colombia';
      s.title = rest === 0 ? 'laatste dag' : 'nog ' + rest + (rest===1 ? ' dag' : ' dagen');
      f.style.width = Math.round(dag / TOTAAL * 100) + '%';
    } else if (nu < THUIS){
      n.textContent = '✈️'; l.textContent = 'Onderweg naar huis'; s.title = 'landen ' + resDatum(TOTAAL + 1); f.style.width = '100%';
    } else {
      var t = verschil(THUIS, vandaag);
      n.textContent = t; l.textContent = (t===1 ? 'dag' : 'dagen') + ' geleden thuisgekomen'; s.title = 'Colombia 2026'; f.style.width = '100%';
    }
  }
  render(); setInterval(render, 60*60*1000);
  document.addEventListener('visibilitychange', function(){ if (!document.hidden) render(); });
})();
