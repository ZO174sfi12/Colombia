/* sw.js — offline-cache voor de Colombia-site.
   VERSIE verhogen bij elke wijziging aan de site; de oude cache wordt dan opgeruimd.
   Strategie: alles vooraf in de cache (precache), daarna cache-first met update op de achtergrond. */
var VERSIE = 'colombia-v6';
var BESTANDEN = [
 "./activiteiten.html",
 "./bogota.html",
 "./bogota2.html",
 "./budget.js",
 "./culinair.html",
 "./dagsync.js",
 "./grootboek.js",
 "./guatape.html",
 "./hotels.html",
 "./hotelstatus.js",
 "./img/act_museo_oro.webp",
 "./img/act_plaza_bolivar.webp",
 "./img/act_streetart.webp",
 "./img/andres_carne_res.webp",
 "./img/bogota-graffiti-tour.webp",
 "./img/bogota_candelaria.webp",
 "./img/bogota_food.webp",
 "./img/bogota_monserrate.webp",
 "./img/boottocht_guatape.webp",
 "./img/catedral_de_sal.webp",
 "./img/catedral_de_sal2.webp",
 "./img/cerro_tres_cruces_gym.webp",
 "./img/cocora.webp",
 "./img/downhill.webp",
 "./img/food/ajiaco.webp",
 "./img/food/arequipe.webp",
 "./img/food/asado_huilense.webp",
 "./img/food/caldo_costilla.webp",
 "./img/food/cazuela_mariscos.webp",
 "./img/food/coffee_cafe.webp",
 "./img/food/fruits.webp",
 "./img/food/natilla.webp",
 "./img/food/patacones.webp",
 "./img/food/picada.webp",
 "./img/food/sancocho.webp",
 "./img/food/tamales.webp",
 "./img/food/typicalcaribbeanlunch.webp",
 "./img/food/viudo_bocachico.webp",
 "./img/guatape_piedra.webp",
 "./img/icons/apple-touch-icon.png",
 "./img/icons/icon-192.png",
 "./img/icons/icon-512.png",
 "./img/marinka.webp",
 "./img/medellin_arvi.webp",
 "./img/medellin_city.webp",
 "./img/medellin_comuna13.webp",
 "./img/minca_sierra.webp",
 "./img/mirador.webp",
 "./img/overzicht.webp",
 "./img/palomino_beach.webp",
 "./img/palomino_bodyboard.webp",
 "./img/pozoazul.webp",
 "./img/route_kaart.svg",
 "./img/salento_cocora.webp",
 "./img/salento_coffee.webp",
 "./img/salento_town.webp",
 "./img/salsa.webp",
 "./img/surfing.webp",
 "./img/tayrona-colombia_pueblito.webp",
 "./img/tayrona_beach.webp",
 "./img/tejo.webp",
 "./img/tubing.webp",
 "./img/unidad_belen.webp",
 "./img/usaquen.webp",
 "./img/zocalos.webp",
 "./index.html",
 "./info/bogota-catedral-sal.html",
 "./info/bogota-graffiti-tour.html",
 "./info/bogota-la-candelaria.html",
 "./info/bogota-monserrate.html",
 "./info/bogota-museo-del-oro.html",
 "./info/bogota-paloquemao.html",
 "./info/bogota-plaza-bolivar.html",
 "./info/bogota-street-art.html",
 "./info/bogota-tejo.html",
 "./info/bogota-usaquen.html",
 "./info/dag22-palomino-santamarta-bogota.html",
 "./info/dag23-vlucht-bogota.html",
 "./info/dag24-zoutmijnen-vertrek.html",
 "./info/dia-de-las-velitas.html",
 "./info/guatape-piedra-del-penon.html",
 "./info/guatape-zocalos.html",
 "./info/medellin-comuna-13.html",
 "./info/medellin-parque-arvi.html",
 "./info/medellin-salsa.html",
 "./info/minca-marinka.html",
 "./info/minca-pozo-azul.html",
 "./info/minca-sierra.html",
 "./info/mountainbiken.html",
 "./info/palomino-strand.html",
 "./info/palomino-surf.html",
 "./info/palomino-tubing.html",
 "./info/salento-coffee-proeverij.html",
 "./info/salento-koffieboerderij.html",
 "./info/salento-mirador.html",
 "./info/salento-valle-de-cocora.html",
 "./info/tayrona-park.html",
 "./locatieblok.js",
 "./manifest.json",
 "./medellin.html",
 "./minca.html",
 "./palomino.html",
 "./praktisch.html",
 "./reservaties.js",
 "./routes.html",
 "./routestatus.js",
 "./salento.html",
 "./site.css",
 "./common.css",
 "./navbar.js",
 "./countdown.js",
 "./dagplan.js",
 "./tayrona.html"
];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(VERSIE).then(function(c){
    /* één voor één, zodat één ontbrekend bestand de installatie niet blokkeert */
    return Promise.all(BESTANDEN.map(function(u){ return c.add(u).catch(function(){}); }));
  }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== VERSIE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(caches.match(e.request, {ignoreSearch:true}).then(function(hit){
    var net = fetch(e.request).then(function(r){
      if (r && r.ok) caches.open(VERSIE).then(function(c){ c.put(e.request, r.clone()); });
      return r;
    }).catch(function(){ return hit; });
    return hit || net;
  }));
});
