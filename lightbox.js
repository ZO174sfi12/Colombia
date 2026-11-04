/* lightbox.js — foto's op ware grootte tonen, makkelijk weg te klikken.
   Geen afhankelijkheden. Sluit met klik, Escape of de terugknop van je telefoon. */
(function(){
  if (window.__lbKlaar) return; window.__lbKlaar = true;

  var overlay, figuur, bijschrift, open = false;

  function bouw(){
    overlay = document.createElement('div');
    overlay.className = 'lb-overlay';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.innerHTML =
      '<button class="lb-sluit" aria-label="Sluiten">✕</button>' +
      '<img class="lb-img" alt="">' +
      '<div class="lb-bij"></div>';
    document.body.appendChild(overlay);
    figuur = overlay.querySelector('.lb-img');
    bijschrift = overlay.querySelector('.lb-bij');
    /* klik waar dan ook sluit: achtergrond, foto of de knop */
    overlay.addEventListener('click', sluit);
  }

  function toon(src, alt){
    if (!overlay) bouw();
    figuur.src = src;
    figuur.alt = alt || '';
    bijschrift.textContent = alt || '';
    bijschrift.style.display = alt ? '' : 'none';
    overlay.classList.add('aan');
    document.body.style.overflow = 'hidden';
    open = true;
    try { history.pushState({lb:1}, ''); } catch(e){}
  }

  function sluit(){
    if (!open) return;
    overlay.classList.remove('aan');
    document.body.style.overflow = '';
    open = false;
    figuur.removeAttribute('src');
    if (history.state && history.state.lb) { try { history.back(); } catch(e){} }
  }

  window.addEventListener('popstate', function(){ if (open) sluit(); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') sluit(); });

  /* klik op elke inhoudsfoto — iconen en al gelinkte beelden overslaan */
  document.addEventListener('click', function(e){
    var im = e.target.closest ? e.target.closest('img') : null;
    if (!im || !im.src) return;
    if (im.closest('a')) return;                        /* al een link */
    if (im.classList.contains('lb-img')) return;        /* de lightbox zelf */
    if (im.naturalWidth && im.naturalWidth < 200) return; /* icoontje */
    if (!im.closest('.card, .hotel, .act-card, .intro-block, .section, .details-body')) return;
    e.preventDefault();
    toon(im.currentSrc || im.src, im.alt);
  }, true);

  /* cursor tonen zodra de pagina klaar is */
  function markeer(){
    var imgs = document.querySelectorAll('.card img, .hotel img, .act-card img, .details-body img');
    Array.prototype.forEach.call(imgs, function(im){
      if (im.closest('a')) return;
      im.classList.add('lb-klik');
      if (!im.title && im.alt) im.title = im.alt;
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', markeer);
  else markeer();
})();
