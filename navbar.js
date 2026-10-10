/* navbar.js — mobiele navigatie.
   1. Onderbalk met de 6 info-tabs (Overzicht, Culinair, Activiteiten, Hotels, Praktisch, Kaart),
      opgebouwd uit de bestaande .subnav-info-links — geen dubbele HTML.
   2. De actieve locatie-tab bovenaan wordt in beeld gescrold.
   Alleen zichtbaar onder 640 px (zie common.css: .bottombar). */
(function(){
  var info = document.querySelector('.subnav-info'); if (!info) return;
  var bar = document.createElement('nav'); bar.className = 'bottombar'; bar.setAttribute('aria-label','Hoofdnavigatie');
  Array.prototype.forEach.call(info.querySelectorAll('a'), function(a){
    var m = a.textContent.trim().match(/^(\S+)\s+(.*)$/);           /* "🏠 Overzicht" → icoon + label */
    var b = document.createElement('a'); b.href = a.getAttribute('href');
    if (a.classList.contains('active')) b.className = 'active';
    b.innerHTML = '<span class="bb-ico">' + (m ? m[1] : '•') + '</span><span class="bb-lbl">' + (m ? m[2] : a.textContent).replace('Kaart &amp; Routes','Kaart').replace('Kaart & Routes','Kaart') + '</span>';
    bar.appendChild(b);
  });
  document.body.appendChild(bar);
  var act = document.querySelector('.subnav-locs a.active');
  if (act && act.scrollIntoView) act.scrollIntoView({block:'nearest', inline:'center'});
})();
