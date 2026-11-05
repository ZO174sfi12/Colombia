/* =========================================================================
   reservaties.js — ENIGE BRON voor alles met een status
   Colombia 2026 · Bert & Ellen · dag 1 = wo 18 nov 2026, dag 24 = vr 11 dec
   -------------------------------------------------------------------------
   Wijzigt er iets? Pas het HIER aan. Alle pagina's lezen hieruit:
     praktisch.html   grootboek + statustellers in de hero
     routes.html      etappes met statuschip
     hotels.html      GEBOEKT-badge en boekingsfeiten
     locatiepagina's  blok "Vastgelegd voor deze locatie"
     activiteiten.html chip op activiteiten die reservering vragen

   status: 'geboekt' | 'te-boeken' | 'ter-plaatse'
     geboekt      vastgelegd, met referentie
     te-boeken    moet online/vooraf — vul deadline in
     ter-plaatse  bewust niet vooraf: loket of collectivo
   ========================================================================= */

var DAG1 = '2026-11-18';

var STATUS = {
  'geboekt':     { label: 'Geboekt',     icon: '✓', kleur: '#16A34A', bg: '#F0FDF4', rand: '#86EFAC' },
  'te-boeken':   { label: 'Te boeken',   icon: '!', kleur: '#B45309', bg: '#FFFBEB', rand: '#FCD34D' },
  'ter-plaatse': { label: 'Ter plaatse', icon: '○', kleur: '#475569', bg: '#F8FAFC', rand: '#CBD5E1' }
};

var RESERVATIES = [

  /* ---------------------------------------------------------- VLUCHTEN --- */
  { id:'vlucht-heen', type:'vlucht', dag:1, status:'geboekt',
    titel:'Brussel → Bogotá',
    van:'BRU', naar:'BOG', vertrek:'10:05', aankomst:'19:25',
    duur:'15u20 · 1 stop', operator:'Swiss · Brussels Airlines · Edelweiss',
    vluchtnr:'LX4555 + LX8092',
    prijs:'€1.944,42 voor 2 personen (heen en terug)',
    tarief:'Economy Comfort',
    bagage:'Per persoon: 23 kg ruimbagage + handbagage max 8 kg (23×40×55 cm) + persoonlijk item',
    note:'Via Zürich: LX4555 Brussel 10:05 → Zürich 11:25, dan LX8092 Zürich 13:30 → Bogotá 19:25. Overstap in Zürich 2u05. Bij aankomst Uber of Cabify van El Dorado naar Botánico — nooit een gewone taxi.' },

  { id:'vlucht-mde-smr', type:'vlucht', dag:12, orde:2, status:'geboekt',
    titel:'Rionegro (MDE) → Santa Marta',
    van:'MDE', naar:'SMR', vertrek:'11:30', aankomst:'12:46',
    duur:'1u16', operator:'JetSMART', vluchtnr:'JA5430', prijs:'€167,00 voor 2 personen', bagage:'23 kg ruimbagage p.p.',
    via:'Booking.com' },

  { id:'vlucht-smr-bog', type:'vlucht', dag:22, orde:2, status:'geboekt',
    titel:'Santa Marta → Bogotá',
    van:'SMR', naar:'BOG', vertrek:'14:42', aankomst:'16:15',
    duur:'1u33', operator:'JetSMART', vluchtnr:'JA5171', prijs:'€283,69 voor 2 personen', bagage:'23 kg ruimbagage p.p.',
    via:'Booking.com',
    note:'Vertrek uit Palomino om 11:30 om dit te halen.' },

  { id:'vlucht-terug', type:'vlucht', dag:24, status:'geboekt',
    titel:'Bogotá → Brussel',
    van:'BOG', naar:'BRU', vertrek:'23:15', aankomst:'20:15 (za 12 dec)',
    duur:'15u · 1 stop', operator:'Lufthansa · Brussels Airlines',
    vluchtnr:'LH543 + LH5578',
    note:'Zelfde boeking als de heenvlucht — prijs staat daar. Via Frankfurt: LH543 Bogotá 23:15 → Frankfurt 15:55 (volgende dag), dan LH5578 Frankfurt 19:10 → Brussel 20:15. Overstap in Frankfurt 3u15. Schemawijziging oktober 2026 verwerkt en bevestigd; beheer de boeking via swiss.com, niet Lufthansa.' },

  /* ----------------------------------------------- BINNENLANDSE VLUCHT --- */
  { id:'vlucht-bog-axm', type:'vlucht', dag:3, orde:1, status:'geboekt',
    titel:'Bogotá → Armenia (AXM)',
    van:'BOG', naar:'AXM', vertrek:'13:30', aankomst:'14:35',
    duur:'1u05 · direct', operator:'LATAM Airlines Colombia', vluchtnr:'LA4292',
    prijs:'€283,63 voor 2 personen', bagage:'23 kg ruimbagage + handbagage p.p. inbegrepen',
    via:'Booking.com', tarief:'Full fare',
    note:'Annuleren en wijzigen toegestaan. Taxi El Edén → Salento ±45 min, ±COP 80.000 (≈€22), taxistand aan de luchthaven — de transfer van Salento Plaza (COP 200.000 cash) niet nodig. In Salento ±15:45. Vervangt de busrit: uitslapen, ontbijten in Botánico, uitchecken 10:15, Uber naar El Dorado 10:45.' },

  /* ------------------------------------------------------------ BUSSEN --- */
  /* Vervallen alternatief — bus Bogotá → Armenia. Bewaard als terugvaloptie
     als de vlucht niet doorgaat. Zet status op 'te-boeken' om weer te tonen. */
  { id:'bus-bog-arm', type:'bus', dag:3, orde:9, status:'vervallen',
    titel:'Bogotá → Armenia → Salento (bus, niet gekozen)',
    van:'Terminal Salitre', naar:'Terminal de Armenia',
    duur:'±7u30 + 1u colectivo',
    advies:'Bolivariano 2G Gold 07:00 → Armenia 14:33 → Salento ±16:00 · COP 80.000 p.p.',
    link:'https://www.redbus.co/en/bus-tickets/bogota-to-armenia?fromCityId=195201&fromCityName=Bogota%20(D.C)&toCityId=195230&toCityName=Armenia%20(Qui)&onward=20-Nov-2026&doj=20-Nov-2026&ref=search',
    note:'Terugvaloptie. Komt op hetzelfde uur in Salento aan als de vlucht, maar kost 7u30 bus en opstaan om 05:15.' },

  { id:'bus-sal-mde', type:'bus', dag:7, orde:9, status:'vervallen',
    titel:'Salento → Medellín',
    van:'Terminal de Salento', naar:'Terminal del Sur',
    vertrek:'09:30', aankomst:'±16:00', duur:'±6u30',
    operator:'Flota Occidental · Línea Príncipe Star',
    prijs:'COP 89.000 + 5.340 fee p.p.',
    link:'https://www.redbus.co/en/bus-tickets/salento-to-medellin?fromCityId=195231&fromCityName=Salento%20(Qui)&toCityId=195160&toCityName=Medellin%20(Ant)&onward=24-Nov-2026&doj=24-Nov-2026&ref=search',
    deadline:'URGENT — slechts 19 zitplaatsen',
    note:'Slechts één maatschappij op deze route en drie ritten per dag (09:30, 12:30, 22:15) — de 09:30 heeft 19 zitplaatsen. Vooraf boeken dus. Lukt dat online niet, laat je accommodatie in Salento de plaatsen vastleggen. Daarna Uber naar El Poblado.' },

  { id:'transfer-sal-mde', type:'transfer', dag:7, orde:1, status:'geboekt',
    titel:'Salento → Manizales → Medellín',
    van:'Salento', naar:'Medellín',
    vertrek:'10:00', aankomst:'±17:33', duur:'6u03 rijden · ±7u33 deur tot deur',
    operator:'Daytrip · privéchauffeur, sedan',
    prijs:'US$337 (€301) voor 2 personen', via:'Daytrip',
    bagage:'2 ruimkoffers + 2 handbagages inbegrepen',
    tarief:'Standard — gratis annuleren tot 24u vooraf',
    note:'Deur tot deur met eigen chauffeur, inclusief een stop van 1u30 in Manizales (12:06–13:36) om te lunchen. Adressen aangepast in de boeking (5 nov): ophalen aan Casa Salento, Calle 7 #4-43, Salento · afzetten aan Landmark Hotel, Calle 14 #43D-85, El Poblado.' },

  { id:'bus-mde-gua', type:'bus', dag:10, status:'ter-plaatse',
    titel:'Medellín → Guatapé',
    van:'Terminal del Norte', naar:'Guatapé',
    duur:'±2u', operator:'Sotrasanvicente', prijs:'±COP 18.000 p.p.',
    note:'Niet online te boeken. Loket Terminal del Norte, ongeveer elk half uur. Enkele reis — de volgende dag ga je door naar Rionegro.' },

  { id:'bus-gua-mde-apt', type:'bus', dag:12, orde:1, status:'ter-plaatse',
    titel:'Guatapé → luchthaven Rionegro (MDE)',
    duur:'±1u15',
    note:'Rionegro ligt tussen Guatapé en Medellín — je rijdt niet terug naar de stad. Regel een rechtstreekse transfer via je accommodatie in Guatapé; ruim vóór de vlucht van 11:30 vertrekken.' },

  { id:'bus-minca-tayrona', type:'bus', dag:16, status:'ter-plaatse',
    titel:'Minca → Santa Marta → El Zaíno (Tayrona)',
    duur:'±2u totaal',
    note:'Collectivo Minca → Santa Marta (±45 min), daar overstappen op de bus naar El Zaíno. Alleen cash.' },

  { id:'bus-tayrona-palomino', type:'bus', dag:18, status:'ter-plaatse',
    titel:'Tayrona → Palomino',
    duur:'±45 min',
    note:'Bus langs de kustweg aanhouden bij de parkingang. Rijdt frequent.' },

  { id:'bus-palomino-smr', type:'bus', dag:22, orde:1, status:'ter-plaatse',
    titel:'Palomino → Santa Marta (luchthaven)',
    vertrek:'11:30', duur:'±1u30',
    note:'Via je accommodatie regelen. Dag na het Velitas-weekend, dus drukte op de kustweg — ruim tijd nemen voor de vlucht van 14:42.' },

  /* ------------------------------------------------------------ HOTELS --- */
  { id:'hotel-bogota', type:'hotel', dag:1, totDag:3, status:'geboekt',
    titel:'Botánico Hostel', locatie:'bogota',
    datums:'18–20 nov', nachten:2, prijs:'€150 totaal · €75/nacht',
    kamer:'Driepersoonskamer met eigen badkamer, voor 2 personen',
    annuleren:'Gratis annuleren tot 16 nov 2026',
    note:'Uitchecken vrijdag 10:15 — dezelfde dag als de vlucht naar Armenia (13:30).' },

  { id:'hotel-salento-plaza', type:'hotel', dag:3, totDag:4, status:'geboekt',
    titel:'Hotel Salento Plaza', locatie:'salento',
    datums:'20–21 nov', nachten:1, prijs:'≈€91 totaal · COP 327.860', ref:'6700033419',
    kamer:'Deluxe kamer met kingsize bed, ontbijt inbegrepen',
    annuleren:'Gratis annuleren tot 16 nov 2026 23:59',
    note:'Brugnacht: Casa Salento was volzet op 20 nov. Carrera 7 #6-26, aan het plein · tel. +57 300 483 8877. Inchecken 14:00–18:00, uitchecken vóór 12:00. Betalen ter plaatse (kaart of cash). Za-ochtend te voet met de koffers naar Casa Salento, ±3 blokken.' },

  { id:'hotel-salento', type:'hotel', dag:4, totDag:7, status:'geboekt',
    titel:'Casa Salento', locatie:'salento',
    datums:'21–24 nov', nachten:3, prijs:'≈€153 totaal · €51/nacht · COP 550.000', ref:'6199996396',
    kamer:'Tweepersoonskamer met eigen badkamer, ontbijt inbegrepen',
    annuleren:'Gratis annuleren tot 21 nov 2026 18:00',
    note:'Calle 7 #4-43 · tel. +57 313 686 7553. ⚠️ Alleen cash, geen kaarten — COP 550.000 klaarhouden. Inchecken 15:00–18:00: na Cocora op tijd terug zijn, of laat weten dat je later komt. Uitchecken vóór 12:00; de Daytrip-chauffeur haalt je hier op 24 nov om 10:00. Ze bieden ook tours aan (Cocora, koffie, La Carbonera, Filandia).' },

  { id:'hotel-medellin', type:'hotel', dag:7, totDag:10, status:'geboekt',
    titel:'Landmark Hotel', locatie:'medellin',
    datums:'24–27 nov', nachten:3, prijs:'≈€293 totaal · €98/nacht · COP 1.054.820', ref:'6866440696',
    kamer:'Queen room met balkon, zonder ontbijt',
    annuleren:'Gratis annuleren tot 24 nov 2026 18:00',
    note:'Calle 14 #43D-85, Manila (El Poblado) · tel. +57 304 234 3158. Inchecken 15:00–23:30 met paspoort én creditcard, uitchecken vóór 12:00. Betalen ter plaatse. Ontbijt niet inbegrepen: COP 53.560 p.p. per nacht. Dakzwembad, spa en fitness. Craft beer te voet: Bipolar ±6 min, Métropole ±10 min, Sierra Blanca ±15 min.' },

  { id:'hotel-guatape', type:'hotel', dag:10, totDag:12, status:'te-boeken',
    titel:'Guatapé', locatie:'guatape', datums:'27–29 nov', nachten:2,
    raming:40,
    note:'⚠️ Hotel Guatatur is VOLZET voor 27–29 nov (gecheckt 4 nov 2026), en wáár het nog kan kost het ±€96/nacht — de oude raming van €26 was niet realistisch. Beschikbaar: Hospedaje Marin (€61 voor 2 nachten, ≈€30/nacht, 8,8 met 121 reviews) of Libélula finca-hotel (€82, ≈€41/nacht, 8,6 met 95). Twee nachten, zodat La Piedra, de boottocht en eventueel San Rafael passen; kies iets aan het meer.' },

  { id:'hotel-minca', type:'hotel', dag:12, totDag:16, status:'te-boeken',
    titel:'Minca', locatie:'minca', datums:'29 nov – 3 dec', nachten:4, raming:59,
    note:'❓ Prijs en beschikbaarheid nog NIET gecheckt op Booking. Eerste keuze Costeño River Minca (±€59/nacht). Alternatieven uit reisverslagen en de gidsen: Hostal Sierra Minca (1.600 m hoog, drie maaltijden per dag, zwembad en hangmatten met zicht tot Santa Marta), Casa del Pozo Azul (vijf minuten van de waterval, aan de rivier), Mini Cabaña TANOA (boscabañas, kwartier buiten het dorp bij Pozo Azul), Hotel Minca Express Relax (centrum, budget) en Masaya Casas Viejas (boutique met infinity pool, maar een half uur buiten Minca — staat ook in de Rough Guide).' },

  { id:'hotel-tayrona', type:'hotel', dag:16, totDag:18, status:'geboekt',
    titel:'Quetzal Dorado Eco-Lodge', locatie:'tayrona',
    datums:'3–5 dec', nachten:2, prijs:'≈€157 totaal · €79/nacht · COP 566.980', ref:'6950810967',
    kamer:'Tweepersoonskamer met balkon, ontbijt inbegrepen',
    annuleren:'Gratis annuleren tot 25 nov 2026 23:59',
    deadline:'Vooruitbetaling via overschrijving — wacht op instructies van de lodge',
    note:'Km 32 Troncal del Caribe, Vereda Los Naranjos (El Zaíno) · tel. +57 320 374 9488. ±1,5 km van de parkingang El Zaíno. Inchecken 14:00–21:00, uitchecken 07:00–11:00. Het totaal wordt binnen 7 dagen voor aankomst aangerekend; de lodge stuurt zelf betaalinstructies (overschrijving). Aankomsttijd vooraf doorgeven. Alleen volwassenen; poort dicht 22:00–06:00. Bar, restaurant en zwembad met zicht op de bergen van het park.' },

  { id:'hotel-palomino', type:'hotel', dag:18, totDag:22, status:'te-boeken',
    titel:'Palomino', locatie:'palomino', datums:'5–9 dec', nachten:4,
    raming:83,
    deadline:'Hoogseizoen — 7 dec is Día de las Velitas · gratis annuleren',
    note:'⚠️ Casa del Pavo Real is VOLZET voor 5–9 dec (gecheckt 4 nov 2026). Het is wél echt boutique — Hotel Yoga &amp; Spa, 9,1 met 1.089 reviews — en kost ±€83/nacht, niet €122: de oude raming was te hoog. Er zijn 123 adressen vrij ondanks Velitas. Best beoordeeld en beschikbaar met gratis annuleren: Atalaya del Mar (€156 voor 4 nachten, 9,6 met 215 reviews), El Leon Feliz (€127, 9,5 met 201) en El Paraiso de Carmen (€176, 9,7 met 75). Luxer: Coconuco Beach (€507) of UUTTAAKA Eco-Hotel (€583).' },

  { id:'hotel-bogota2', type:'hotel', dag:22, totDag:24, status:'te-boeken',
    titel:'Bogotá — laatste nachten', locatie:'bogota', datums:'9–11 dec', nachten:2,
    raming:75,
    deadline:'Nog niet in de hotellijst opgenomen',
    note:'❓ Prijs en beschikbaarheid nog NIET gecheckt op Booking. Aankomst dag 22 om 16:15, vertrek dag 24 om 23:15. Twee nachten nodig. Raming €75/nacht (niveau Botánico); bagagebewaring op dag 24 afspreken.' },

  /* ----------------------------------------------------- HERINNERINGEN -- */
  /* ------------------------------------------------- ACTIVITEITEN (res) -- */
  { id:'act-comuna13', type:'activiteit', dag:8, status:'te-boeken',
    titel:'Free walking tour Comuna 13', locatie:'medellin',
    vertrek:'13:30', note:'Vooraf aanmelden; tip in cash meenemen.' },

  { id:'act-catedral-sal', type:'activiteit', dag:24, status:'ter-plaatse',
    titel:'Catedral de Sal, Zipaquirá', locatie:'bogota',
    prijs:'±COP 110.000–130.000 p.p. (buitenlanders)',
    note:'Ticket aan de ingang. Laatste dag, vóór de nachtvlucht.' },

  { id:'act-claudio', type:'activiteit', dag:24, status:'te-boeken', locatie:'bogota',
    titel:'Lunch met Claudio — Zipaquirá', deadline:'Vóór vertrek datum bevestigen',
    note:'Claudio woont bij de Catedral de Sal en bood aan om iets te gaan eten. Dag 24 (Zipaquirá) past het best; dag 23 of dag 2 in Bogotá als alternatief.' },

  { id:'act-3cordilleras', type:'activiteit', dag:9, status:'te-boeken',
    titel:'3 Cordilleras brouwerijtour', locatie:'medellin',
    note:'Alleen op donderdagavond — donderdag 26 nov valt goed. Vooraf reserveren.' },

  { id:'act-guatape-boot', type:'activiteit', dag:11, status:'ter-plaatse',
    titel:'Boottocht op het meer', locatie:'guatape',
    note:'Aan de kade regelen. Gaat door bij genoeg opvarenden.' },

  { id:'act-cocora', type:'activiteit', dag:4, status:'ter-plaatse',
    titel:'Valle de Cocora — 13 km lus', locatie:'salento',
    note:'Vroeg met de Willys-jeep vanaf de plaza. Rubberlaarzen te huur in het dorp; de paden langs de rivier zijn modderig.' },

  { id:'act-filandia', type:'activiteit', dag:5, status:'ter-plaatse',
    titel:'Filandia — koffie, paardrijden, uitkijktoren', locatie:'salento',
    note:'Lonely Planet geeft Filandia een volle dag: koffie op de plaza, paardrijden door de heuvels, de Mirador Colina Iluminada (27 m houten toren) en brulapen in Reserva Natural Barbas-Bremen. Rough Guide vindt de plaza beter bewaard dan die van Salento.' },

  { id:'act-downhill-salento', type:'activiteit', dag:6, status:'te-boeken',
    titel:'Downhill 30 km vanaf La Carbonera', locatie:'salento',
    prijs:'incl. gids, lunch, materiaal en verzekering',
    link:'https://salentocycling.com',
    deadline:'Vooraf mailen bij Salento Cycling',
    note:'Voertuig naar La Carbonera op 3.400 m, daarna 30 km dalen door nevelwoud. 5 à 6 uur.' },

  { id:'act-manizales', type:'activiteit', dag:7, status:'ter-plaatse',
    titel:'Manizales — lunchstop, twee opties', locatie:'medellin',
    vertrek:'12:06–13:36',
    note:'De chauffeur stopt anderhalf uur, maar waar hij afzet spreek je zelf af — zeg het bij het instappen. OPTIE A: afzetten en ophalen aan de Plaza de Bolívar. Eerst het plein met de Bolívar-Cóndor en de kathedraal (gratis), dan lunch bij La Azotea Rooftop op verdieping 15 pal aan het plein, 360° uitzicht. Reserveren via WhatsApp +57 322 306 8358. Nul looptijd, maar geen streeketen. OPTIE B: afzetten bij El Zaguán Paisa, Carrera 23 #31-27 — bamboegang, menú del día of plato montañero. Rond 13:05 afrekenen, kwartier over Carrera 23 naar het plein, daar om 13:30 opgepikt. Echt paisa-eten, maar een kwartier lopen en maar vijftien minuten plein. In beide gevallen: kathedraaltoren overslaan (rondleiding 1u15) en niet naar de Zona Rosa, die ligt 3 km verderop.' },

  { id:'act-minca-pozoazul', type:'activiteit', dag:13, status:'ter-plaatse',
    titel:'Pozo Azul + Hacienda La Victoria', locatie:'minca',
    note:'Pozo Azul: 40 min wandelen, gratis, twee zwemgaten. Daarna de koffiefinca uit 1892 (dagelijks 9–17u, tour 1u30) met Nevada Cervecería in de oude kapel.' },

  { id:'act-minca-marinka', type:'activiteit', dag:14, status:'ter-plaatse',
    titel:'Vogels bij zonsopgang + Cascadas de Marinka', locatie:'minca',
    note:'Jungle Joe Minca: vogeltocht van 3 uur, dagelijks om 6u. Daarna Marinka — 1u wandelen of 15 min motortaxi, entree, café en hangnetten boven het water.' },

  { id:'act-minca-eldorado', type:'activiteit', dag:15, status:'te-boeken',
    titel:'Reserva Natural El Dorado — San Lorenzo-kam', locatie:'minca',
    note:'Vogelparadijs met weids uitzicht vanaf de San Lorenzo-kam. Vooraf regelen; Cerro Kennedy (3.100 m) is een tweedaagse klim en past niet.' }
];

/* ----------------------------------------------------------- HELPERS ---- */

function resDatum(dag){
  var d = new Date(DAG1 + 'T12:00:00');
  d.setDate(d.getDate() + (dag - 1));
  var dgn = ['zo','ma','di','wo','do','vr','za'];
  var mnd = ['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'];
  return dgn[d.getDay()] + ' ' + d.getDate() + ' ' + mnd[d.getMonth()];
}

function resSorteer(a,b){
  if (a.dag !== b.dag) return a.dag - b.dag;
  return (a.orde || 5) - (b.orde || 5);
}

function resById(id){
  for (var i=0;i<RESERVATIES.length;i++){ if (RESERVATIES[i].id === id) return RESERVATIES[i]; }
  return null;
}

function resVoor(filter){
  return RESERVATIES.filter(function(r){
    if (r.status === 'vervallen' && !filter.ookVervallen) return false;
    if (filter.type && r.type !== filter.type) return false;
    if (filter.locatie && r.locatie !== filter.locatie) return false;
    if (filter.status && r.status !== filter.status) return false;
    if (filter.dag && r.dag !== filter.dag) return false;
    return true;
  });
}

function resTellers(){
  var t = {};
  ['vlucht','bus','hotel','activiteit'].forEach(function(ty){
    t[ty] = { totaal:0, geboekt:0, teBoeken:0, terPlaatse:0 };
  });
  RESERVATIES.forEach(function(r){
    if (r.status === 'vervallen') return;
    var c = t[r.type]; if (!c) return;
    c.totaal++;
    if (r.status === 'geboekt') c.geboekt++;
    else if (r.status === 'te-boeken') c.teBoeken++;
    else c.terPlaatse++;
  });
  return t;
}

/* Statuschip als HTML-string. compact=true laat het label weg. */
function resChip(status, extra, compact){
  var s = STATUS[status]; if (!s) return '';
  var txt = compact ? s.icon : s.icon + ' ' + s.label;
  if (extra && !compact) txt += ' · ' + extra;
  return '<span class="res-chip res-' + status + '">' + txt + '</span>';
}


/* =========================================================================
   BUDGET — alleen de posten die GEEN reservatie zijn.
   Vluchtprijzen komen uit RESERVATIES hierboven; niets dubbel invullen.
   ========================================================================= */
var PERSONEN = 2;
var REISDAGEN = 24;

var BUDGET_POSTEN = [
  { id:'hotels',       label:'🏨 Overnachtingen',      detail:null, /* wordt berekend uit prijs of raming per hotel */
    perNacht:70, zeker:false },
  { id:'grondvervoer', label:'🚌 Vervoer over land',   detail:'collectivo\'s, taxi El Edén → Salento, transfer Guatapé → Rionegro, bussen aan de kust',
    bedrag:95,  zeker:false },
  { id:'activiteiten', label:'🎟️ Activiteiten & tours', detail:'€340 p.p.',
    bedrag:340*PERSONEN, zeker:false },
  { id:'eten',         label:'🍽️ Eten & drinken',      detail:'€35 p.p. per dag × ' + REISDAGEN + ' dagen',
    bedrag:35*PERSONEN*REISDAGEN, zeker:false, buitenTotaal:true }
];

/* Haalt alle bedragen uit de reservaties (formaat "€1.234,56 ...") */
function resBedrag(r){
  if (!r.prijs) return 0;
  var m = String(r.prijs).match(/€\s*(\d[\d.]*)(?:,(\d{2}))?/);
  if (!m) return 0;
  return parseFloat(m[1].replace(/\./g,'')) + (m[2] ? parseFloat(m[2]) / 100 : 0);
}

/* telt de nachten uit de hotelreservaties zelf */
function resNachten(){
  var n = 0;
  RESERVATIES.forEach(function(r){
    if (r.type === 'hotel' && r.status !== 'vervallen' && r.nachten) n += r.nachten;
  });
  return n;
}

function budgetOverzicht(){
  /* hotelpost: geboekte prijs waar die er is, anders de raming per nacht; perNacht alleen als fallback */
  BUDGET_POSTEN.forEach(function(p){
    if (p.id !== 'hotels') return;
    var n = 0, tot = 0, geboekt = 0;
    RESERVATIES.forEach(function(r){
      if (r.type !== 'hotel' || r.status === 'vervallen' || !r.nachten) return;
      n += r.nachten;
      var b = resBedrag(r);
      if (b > 0){ tot += b; geboekt += r.nachten; }
      else tot += r.nachten * (r.raming || p.perNacht);
    });
    p.bedrag = Math.round(tot);
    p.detail = n + ' nachten · ' + geboekt + ' geboekt, rest raming per hotel · gem. €' + Math.round(tot / n) + '/nacht';
  });
  var vluchten = 0, vluchtItems = [];
  RESERVATIES.slice().sort(resSorteer).forEach(function(r){
    if (r.status === 'vervallen' || (r.type !== 'vlucht' && r.type !== 'transfer')) return;
    var b = resBedrag(r);
    if (b > 0){ vluchten += b; vluchtItems.push(r); }
  });
  var geschat = 0, binnenTotaal = 0;
  BUDGET_POSTEN.forEach(function(p){
    geschat += p.bedrag;
    if (!p.buitenTotaal) binnenTotaal += p.bedrag;
  });
  return {
    vluchten: vluchten,
    vluchtItems: vluchtItems,
    posten: BUDGET_POSTEN,
    totaalExclEten: vluchten + binnenTotaal,
    totaalInclEten: vluchten + geschat
  };
}
