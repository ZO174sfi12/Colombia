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
    vluchtnr:'LX4555 + LX8092', ref:'Y637MQ',
    prijs:'€1.944,00 voor 2 personen (heen en terug)',
    note:'Uber of Cabify van El Dorado naar Botánico — nooit een gewone taxi.' },

  { id:'vlucht-mde-smr', type:'vlucht', dag:12, orde:2, status:'geboekt',
    titel:'Rionegro (MDE) → Santa Marta',
    van:'MDE', naar:'SMR', vertrek:'11:30', aankomst:'12:46',
    duur:'1u16', operator:'JetSMART', vluchtnr:'JA5430',
    ref:'40-1090989605', pnr:'Q4FWRL', prijs:'€167,00 voor 2 personen', bagage:'23 kg ruimbagage p.p.',
    via:'Booking.com' },

  { id:'vlucht-smr-bog', type:'vlucht', dag:22, orde:2, status:'geboekt',
    titel:'Santa Marta → Bogotá',
    van:'SMR', naar:'BOG', vertrek:'14:42', aankomst:'16:15',
    duur:'1u33', operator:'JetSMART', vluchtnr:'JA5171',
    ref:'40-1090994658', pnr:'DG5NPR', prijs:'€283,69 voor 2 personen', bagage:'23 kg ruimbagage p.p.',
    via:'Booking.com',
    note:'Vertrek uit Palomino om 11:30 om dit te halen.' },

  { id:'vlucht-terug', type:'vlucht', dag:24, status:'geboekt',
    titel:'Bogotá → Brussel',
    van:'BOG', naar:'BRU', vertrek:'23:15', aankomst:'20:15 (za 12 dec)',
    duur:'15u · 1 stop', operator:'Lufthansa · Brussels Airlines',
    vluchtnr:'LH543 + LH5578', ref:'Y637MQ',
    note:'Zelfde boeking als de heenvlucht — prijs staat daar.' },

  /* ----------------------------------------------- BINNENLANDSE VLUCHT --- */
  { id:'vlucht-bog-axm', type:'vlucht', dag:3, orde:1, status:'geboekt',
    titel:'Bogotá → Armenia (AXM)',
    van:'BOG', naar:'AXM', vertrek:'13:30', aankomst:'14:35',
    duur:'1u05 · direct', operator:'LATAM Airlines Colombia', vluchtnr:'LA4292',
    prijs:'€283,63 voor 2 personen', bagage:'23 kg ruimbagage + handbagage p.p. inbegrepen',
    via:'Booking.com', ref:'40-1090972461', pnr:'RQHJRU', tarief:'Full fare',
    note:'Annuleren en wijzigen toegestaan. Taxi El Edén → Salento ±45 min, in Salento ±15:45. Vervangt de busrit: uitslapen, ontbijten in Botánico, uitchecken 10:15, Uber naar El Dorado 10:45.' },

  /* ------------------------------------------------------------ BUSSEN --- */
  /* Vervallen alternatief — bus Bogotá → Armenia. Bewaard als terugvaloptie
     als de vlucht niet doorgaat. Zet status op 'te-boeken' om weer te tonen. */
  { id:'bus-bog-arm', type:'bus', dag:3, orde:9, status:'vervallen',
    titel:'Bogotá → Armenia → Salento (bus, niet gekozen)',
    van:'Terminal Salitre', naar:'Terminal de Armenia',
    duur:'±7u30 + 1u colectivo',
    advies:'Bolivariano 2G Gold 07:00 → Armenia 14:33 → Salento ±16:00 · COP 80.000 p.p.',
    link:'https://www.redbus.co/en/bus-tickets/bogota-to-armenia',
    note:'Terugvaloptie. Komt op hetzelfde uur in Salento aan als de vlucht, maar kost 7u30 bus en opstaan om 05:15.' },

  { id:'bus-sal-mde', type:'bus', dag:7, status:'te-boeken',
    titel:'Salento → Medellín',
    van:'Terminal de Salento', naar:'Terminal del Sur',
    vertrek:'09:30', aankomst:'±16:00', duur:'±6u30',
    operator:'Flota Occidental · Línea Príncipe Star',
    prijs:'COP 89.000 + 5.340 fee p.p.',
    link:'https://www.redbus.co/en/bus-tickets/salento-to-medellin',
    deadline:'URGENT — slechts 19 zitplaatsen',
    note:'Lukt online boeken niet, laat je accommodatie in Salento de plaatsen vastleggen. Daarna Uber naar El Poblado.' },

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

  { id:'hotel-salento', type:'hotel', dag:3, totDag:7, status:'te-boeken',
    titel:'Salento', locatie:'salento', datums:'20–24 nov', nachten:4 },

  { id:'hotel-medellin', type:'hotel', dag:7, totDag:10, status:'te-boeken',
    titel:'Medellín (El Poblado)', locatie:'medellin', datums:'24–27 nov', nachten:3 },

  { id:'hotel-guatape', type:'hotel', dag:10, totDag:12, status:'te-boeken',
    titel:'Guatapé', locatie:'guatape', datums:'27–29 nov', nachten:2,
    note:'Twee nachten, zodat La Piedra, de boottocht en eventueel de afdaling naar San Rafael allemaal passen. Kies iets aan het meer.' },

  { id:'hotel-minca', type:'hotel', dag:12, totDag:16, status:'te-boeken',
    titel:'Minca', locatie:'minca', datums:'29 nov – 3 dec', nachten:4 },

  { id:'hotel-tayrona', type:'hotel', dag:16, totDag:18, status:'te-boeken',
    titel:'Parque Tayrona', locatie:'tayrona', datums:'3–5 dec', nachten:2,
    deadline:'Ruim aanbod — gidsen raden 1 à 2 nachten aan' },

  { id:'hotel-palomino', type:'hotel', dag:18, totDag:22, status:'te-boeken',
    titel:'Palomino', locatie:'palomino', datums:'5–9 dec', nachten:4,
    deadline:'Hoogseizoen — 7 dec is Día de las Velitas' },

  { id:'hotel-bogota2', type:'hotel', dag:22, totDag:24, status:'te-boeken',
    titel:'Bogotá — laatste nachten', locatie:'bogota', datums:'9–11 dec', nachten:2,
    deadline:'Nog niet in de hotellijst opgenomen',
    note:'Aankomst dag 22 om 16:15, vertrek dag 24 om 23:15. Twee nachten nodig.' },

  /* ------------------------------------------------- ACTIVITEITEN (res) -- */
  { id:'act-comuna13', type:'activiteit', dag:8, status:'te-boeken',
    titel:'Free walking tour Comuna 13', locatie:'medellin',
    vertrek:'13:30', note:'Vooraf aanmelden; tip in cash meenemen.' },

  { id:'act-catedral-sal', type:'activiteit', dag:24, status:'ter-plaatse',
    titel:'Catedral de Sal, Zipaquirá', locatie:'bogota',
    prijs:'±COP 90.000 p.p.',
    note:'Ticket aan de ingang. Laatste dag, vóór de nachtvlucht.' },

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
  { id:'hotels',       label:'🏨 Overnachtingen',      detail:null, /* wordt berekend */
    perNacht:70, zeker:false },
  { id:'grondvervoer', label:'🚌 Vervoer over land',   detail:'bussen, collectivo\'s, taxi El Edén → Salento, transfer Guatapé → Rionegro',
    bedrag:137,  zeker:false },
  { id:'activiteiten', label:'🎟️ Activiteiten & tours', detail:'€340 p.p.',
    bedrag:340*PERSONEN, zeker:false },
  { id:'eten',         label:'🍽️ Eten & drinken',      detail:'€35 p.p. per dag × ' + REISDAGEN + ' dagen',
    bedrag:35*PERSONEN*REISDAGEN, zeker:false, buitenTotaal:true }
];

/* Haalt alle bedragen uit de reservaties (formaat "€1.234,56 ...") */
function resBedrag(r){
  if (!r.prijs) return 0;
  var m = String(r.prijs).match(/€\s*([\d.]+),(\d{2})/);
  if (!m) return 0;
  return parseFloat(m[1].replace(/\./g,'')) + parseFloat(m[2]) / 100;
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
  /* hotelpost afleiden uit de werkelijke boekingen */
  BUDGET_POSTEN.forEach(function(p){
    if (p.id !== 'hotels') return;
    var n = resNachten();
    p.bedrag = n * p.perNacht;
    p.detail = n + ' nachten · gem. €' + p.perNacht + '/nacht';
  });
  var vluchten = 0, vluchtItems = [];
  RESERVATIES.slice().sort(resSorteer).forEach(function(r){
    if (r.status === 'vervallen') return;
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
