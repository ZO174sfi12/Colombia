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
    note:'Annuleren en wijzigen toegestaan. Taxi El Edén → Salento ±45 min, ±COP 80.000 (≈€22), taxistand aan de luchthaven — de transfer van Salento Plaza (COP 200.000 (≈€56) cash) niet nodig. In Salento ±15:45. Vervangt de busrit: uitslapen, ontbijten in Botánico, uitchecken 10:15, Uber naar El Dorado 10:45.' },

  /* ------------------------------------------------------------ BUSSEN --- */
  /* Vervallen alternatief — bus Bogotá → Armenia. Bewaard als terugvaloptie
     als de vlucht niet doorgaat. Zet status op 'te-boeken' om weer te tonen. */
  { id:'bus-bog-arm', type:'bus', dag:3, orde:9, status:'vervallen',
    titel:'Bogotá → Armenia → Salento (bus, niet gekozen)',
    van:'Terminal Salitre', naar:'Terminal de Armenia',
    duur:'±7u30 + 1u colectivo',
    advies:'Bolivariano 2G Gold 07:00 → Armenia 14:33 → Salento ±16:00 · COP 80.000 (≈€22) p.p.',
    link:'https://www.redbus.co/en/bus-tickets/bogota-to-armenia?fromCityId=195201&fromCityName=Bogota%20(D.C)&toCityId=195230&toCityName=Armenia%20(Qui)&onward=20-Nov-2026&doj=20-Nov-2026&ref=search',
    note:'Terugvaloptie. Komt op hetzelfde uur in Salento aan als de vlucht, maar kost 7u30 bus en opstaan om 05:15.' },

  { id:'bus-sal-mde', type:'bus', dag:7, orde:9, status:'vervallen',
    titel:'Salento → Medellín',
    van:'Terminal de Salento', naar:'Terminal del Sur',
    vertrek:'09:30', aankomst:'±16:00', duur:'±6u30',
    operator:'Flota Occidental · Línea Príncipe Star',
    prijs:'COP 89.000 (≈€25) + 5.340 fee p.p.',
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
    duur:'±2u', operator:'Sotrasanvicente', prijs:'±COP 18.000 (≈€5) p.p.',
    note:'Niet online te boeken. Loket Terminal del Norte, ongeveer elk half uur. Enkele reis — de volgende dag ga je door naar Rionegro.' },

  { id:'bus-gua-mde-apt', type:'bus', dag:12, orde:1, status:'ter-plaatse',
    titel:'Guatapé → luchthaven Rionegro (MDE)',
    duur:'±1u15',
    note:'Rionegro ligt tussen Guatapé en Medellín — je rijdt niet terug naar de stad. Regel een rechtstreekse transfer via je accommodatie in Guatapé; ruim vóór de vlucht van 11:30 vertrekken.' },

  { id:'bus-minca-tayrona', type:'bus', dag:16, status:'ter-plaatse',
    titel:'Minca → Santa Marta → El Zaíno (Tayrona)',
    duur:'±2u totaal',
    note:'Collectivo Minca → Santa Marta (±45 min), taxi naar El Mercado, daar de bus van Cootraoriente richting Tayrona/Palomino (elk half uur, 6:00–18:00). Die stopt pal voor Quetzal Dorado. Alleen cash. Alternatief: taxi via de lodge, COP 200.000 (≈€56) vanaf de luchthaven van Santa Marta.' },

  { id:'bus-tayrona-palomino', type:'bus', dag:18, status:'ter-plaatse',
    titel:'Tayrona → Palomino',
    duur:'±45 min',
    note:'Bus langs de kustweg aanhouden bij de parkingang. Rijdt frequent.' },

  { id:'bus-palomino-smr', type:'bus', dag:22, orde:1, status:'ter-plaatse',
    titel:'Palomino → luchthaven SMR (hoteltransport)',
    vertrek:'11:30', duur:'±1u45',
    note:'Hoteltransport Casa del Pavo Real COP 265.000 (≈€74) voor de rit — op dag 21 aan de receptie regelen en vragen of het tot SMR rijdt. Uber kost even veel (±COP 240.000–275.000 (≈€67–76)) maar is in Palomino onzeker; bus + taxi ±3 uur. Dag na het Velitas-weekend, dus drukte op de kustweg — ruim tijd nemen voor de vlucht van 14:42.' },

  /* ------------------------------------------------------------ HOTELS --- */
  { id:'hotel-bogota', type:'hotel', dag:1, totDag:3, status:'geboekt',
    titel:'Botánico Hostel', locatie:'bogota',
    datums:'18–20 nov', nachten:2, prijs:'€150 totaal · €75/nacht',
    kamer:'Driepersoonskamer met eigen badkamer, voor 2 personen',
    annuleren:'Gratis annuleren tot 16 nov 2026',
    note:'Inchecken 15:00–23:00 (receptie 24/7), uitchecken vóór 12:30. Shuttle vanaf de luchthaven mogelijk: COP 75.000 (≈€21), cash aan de chauffeur, iemand met een bordje wacht je op — vooraf via de Booking-chat doorgeven (vluchtnr., aankomstuur, naam, WhatsApp). Wij vertrekken vrijdag 10:15 — vlucht naar Armenia om 13:30.' },

  { id:'hotel-salento-plaza', type:'hotel', dag:3, totDag:4, status:'geboekt',
    titel:'Hotel Salento Plaza', locatie:'salento',
    datums:'20–21 nov', nachten:1, prijs:'≈€91 totaal · COP 327.860',
    kamer:'Deluxe kamer met kingsize bed, ontbijt inbegrepen',
    annuleren:'Gratis annuleren tot 16 nov 2026 23:59',
    note:'Brugnacht: Casa Salento was volzet op 20 nov. Carrera 7 #6-26, aan het plein · tel. +57 300 483 8877. Inchecken 14:00–18:00, uitchecken vóór 12:00. Betalen ter plaatse (kaart of cash). ⚠️ Za 21 nov vroeg weg (downhill 07:20): bij inchecken vroeg uitchecken regelen, kamer vooraf afrekenen en koffers aan de receptie tot na de tour; daarna ±3 blokken naar Casa Salento.' },

  { id:'hotel-salento', type:'hotel', dag:4, totDag:7, status:'geboekt',
    titel:'Casa Salento', locatie:'salento',
    datums:'21–24 nov', nachten:3, prijs:'≈€153 totaal · €51/nacht · COP 550.000',
    kamer:'Tweepersoonskamer met eigen badkamer, ontbijt inbegrepen',
    annuleren:'Gratis annuleren tot 21 nov 2026 18:00',
    note:'Calle 7 #4-43 · tel. +57 313 686 7553. ⚠️ Alleen cash, geen kaarten (6 nov via Booking-chat nogmaals bevestigd, ook niet met 6% extra) — COP 550.000 (≈€153) klaarhouden. Inchecken 15:00–18:00: na de downhill (terug ±13:30) ruim op tijd, of laat weten dat je later komt. Uitchecken vóór 12:00; de Daytrip-chauffeur haalt je hier op 24 nov om 10:00. Ze bieden ook tours aan (Cocora, koffie, La Carbonera, Filandia).' },

  { id:'hotel-medellin', type:'hotel', dag:7, totDag:10, status:'geboekt',
    titel:'Landmark Hotel', locatie:'medellin',
    datums:'24–27 nov', nachten:3, prijs:'≈€293 totaal · €98/nacht · COP 1.054.820',
    kamer:'Queen room met balkon, zonder ontbijt',
    annuleren:'Gratis annuleren tot 24 nov 2026 18:00',
    note:'Calle 14 #43D-85, Manila (El Poblado) · tel. +57 304 234 3158. Inchecken 15:00–23:30 met paspoort én creditcard, uitchecken vóór 12:00. Betalen ter plaatse. Ontbijt niet inbegrepen: COP 53.560 (≈€15) p.p. per nacht. Dakzwembad, spa en fitness. Craft beer te voet: Bipolar ±6 min, Métropole ±10 min, Sierra Blanca ±15 min.' },

  { id:'hotel-guatape', type:'hotel', dag:10, totDag:12, status:'geboekt',
    titel:'La Madriguera Hotel', locatie:'guatape',
    datums:'27–29 nov', nachten:2, prijs:'≈€126 totaal · €63/nacht · COP 454.420',
    kamer:'Bungalow met balkon op het meer, ontbijt inbegrepen',
    annuleren:'Gratis annuleren tot 27 nov 2026 18:00',
    note:'Carrera 20 #27-01, aan het water · tel. +57 324 4148622. Inchecken vr 15:00–22:00 (laat je aankomsttijd weten), uitchecken zo 12:00–12:30. Geen vooruitbetaling: betalen ter plaatse, kaart of cash. Ontbijt in het café ernaast. ±7–10 min wandelen naar het plein; craft beer bij San Tropel en Del Origen (±800 m).' },

  { id:'hotel-minca', type:'hotel', dag:12, totDag:16, status:'geboekt',
    titel:'Costeño River Minca', locatie:'minca',
    datums:'29 nov – 3 dec', nachten:4, prijs:'≈€284 totaal · €71/nacht · COP 1.024.100',
    kamer:'Double Room with Mountain View, ontbijt inbegrepen',
    annuleren:'Gratis annuleren tot 23 nov 2026 23:59 — daarna de volledige COP 1.024.100',
    deadline:'Vooruitbetaling gaat automatisch van de Visa binnen 5 dagen vóór aankomst',
    note:'Urbanización Milagro Verde, Minca · tel. +57 300 344 2337. Inchecken 14:00–21:00, uitchecken 08:00–11:00 — je landt 12:46 in Santa Marta, dus met een uur de berg op zit je rond 14:30 goed. Ze vragen je verwachte aankomsttijd vooraf door te geven. Betalen met kaart of cash. Geen geldautomaat in Minca: pin in Santa Marta onderweg.' },

  { id:'hotel-tayrona', type:'hotel', dag:16, totDag:18, status:'geboekt',
    titel:'Quetzal Dorado Eco-Lodge', locatie:'tayrona',
    datums:'3–5 dec', nachten:2, prijs:'≈€157 totaal · €79/nacht · COP 566.980',
    kamer:'Tweepersoonskamer met balkon, ontbijt inbegrepen',
    annuleren:'Gratis annuleren tot 25 nov 2026 23:59',
    deadline:'Vooruitbetaling via overschrijving — wacht op instructies van de lodge',
    note:'Km 32 Troncal del Caribe, Vereda Los Naranjos (El Zaíno) · tel. +57 320 374 9488. ±1,5 km van de parkingang El Zaíno. Inchecken 14:00–21:00, uitchecken 07:00–11:00. Het totaal wordt binnen 7 dagen voor aankomst aangerekend; de lodge stuurt zelf betaalinstructies (overschrijving). Aankomsttijd vooraf doorgeven. Alleen volwassenen; poort dicht 22:00–06:00. Lodge ligt op een heuvel: trappen naar de receptie (bagage!). Ontbijt 7:00–10:00, restaurant 13:00–20:30, zwembad 9:00–21:00. Zicht op de Río Piedras; Los Naranjos-strand op 1,4 km. ⚠️ Geen geldautomaat in de buurt — cash voor Tayrona en activiteiten meenemen (lodge zelf aanvaardt kaart). Geen sla eten in het park (geen gefilterd water).' },

  { id:'hotel-palomino', type:'hotel', dag:18, totDag:22, status:'geboekt',
    titel:'Casa del Pavo Real', locatie:'palomino',
    datums:'5–9 dec', nachten:4, prijs:'≈€285 totaal · €71/nacht · COP 1.026.800',
    kamer:'Bungalow met 1 slaapkamer, ontbijt inbegrepen',
    annuleren:'Gratis annuleren tot 1 dec 2026 23:59',
    note:'Calle 10 / km 72, Palomino (±300 m van het strand). Inchecken 14:00–22:00, uitchecken 07:00–11:00. Booking rekent het totaal aan binnen 3 dagen voor aankomst (kaart of cash). Receptie 7–21u, ontbijt 7:30–10:30, restaurant 12–14u en 18–21u, happy hour 17–19u (2-voor-1), zwembad tot 22u. Yoga dagelijks 8:30 (COP 50.000 · ≈€14), 2 gratis fietsen, wasservice binnen 24u. Transport van of naar Santa Marta COP 265.000 (≈€74). Via de receptie: tubing, paardrijden, inheems dorp, paddleboarden, surflessen, Cabo de la Vela. Zonnepanelen, het water komt op kamertemperatuur. Keuze van Lisa. 7 dec is Día de las Velitas.' },

  { id:'hotel-bogota2', type:'hotel', dag:22, totDag:24, status:'te-boeken',
    titel:'Bogotá — laatste nachten', locatie:'bogota', datums:'9–11 dec', nachten:2,
    raming:75,
    deadline:'Nog niet in de hotellijst opgenomen',
    note:'❓ Prijs en beschikbaarheid nog NIET gecheckt op Booking. Aankomst dag 22 om 16:15, vertrek dag 24 om 23:15. Twee nachten nodig. Raming €75/nacht (niveau Botánico); bagagebewaring op dag 24 afspreken.' },

  /* ----------------------------------------------------- HERINNERINGEN -- */
  { id:'herin-koffie-pieter', type:'herinnering', dag:4, status:'te-boeken',
    titel:'☕ ½ kg rauwe koffiebonen kopen voor Pieter', locatie:'salento',
    note:'Bij het bezoek aan een koffiefinca (bv. Finca Las Acacías in Salento) een halve kilo rauwe, ongebrande bonen kopen. Lukt het niet in Salento: Hacienda La Victoria in Minca (dag 13).' },

  /* ------------------------------------------------- ACTIVITEITEN (res) -- */
  { id:'act-comuna13', type:'activiteit', dag:8, status:'te-boeken',
    titel:'Free walking tour Comuna 13', locatie:'medellin',
    vertrek:'13:30', note:'Vooraf aanmelden; tip in cash meenemen.' },

  { id:'act-laatste-dag', type:'activiteit', dag:24, orde:2, status:'ter-plaatse',
    titel:'Souvenirs en een laatste pint — La Candelaria', locatie:'bogota',
    duur:'ochtend tot namiddag, op je gemak',
    note:'Pasaje Rivas (Carrera 10 #10-54), de oudste ambachtenpassage van Bogotá, open vanaf 9:00 en te voet vanaf het hotel: manden, sombreros aguadeños, carrieles, zwarte loza de La Chamba. ⚠️ Het ligt tegen San Victorino aan — overdag gaan, telefoon weg. Mochilas wayuu koop je beter al in Palomino (dag 18–21): die komen uit La Guajira. Koffiebonen voor thuis bij Azahar of Café Matuca. Laatste bier op loopafstand: BBC La Candelaria (3,40★) of Cervecería Irlandesa in La Macarena. Koffers blijven bij het hotel tot 19:45.' },
  { id:'act-catedral-sal', type:'activiteit', dag:23, status:'ter-plaatse',
    titel:'Catedral de Sal, Zipaquirá', locatie:'bogota',
    prijs:'±COP 110.000–130.000 (≈€31–36) p.p. (buitenlanders)',
    note:'Verplaatst naar dag 23: op de vertrekdag zelf is een rit van 48 km heen én terug een onnodig risico. Nu heb je de hele donderdag, met je kamer nog beschikbaar. Open 9:00–16:40, laatste kaartverkoop 16:40. Entree buitenlanders ±COP 125.000 (bronnen verschillen, reken op 125.000–150.000). Neem een trui — ondergronds is het fris. Niet met de lijnbus: de gidsen melden diefstal op die route. Taxi of georganiseerde tour.' },

  { id:'act-claudio', type:'activiteit', dag:23, status:'te-boeken', locatie:'bogota',
    titel:'Lunch met Claudio — Zipaquirá', deadline:'Vóór vertrek datum bevestigen',
    note:'Claudio woont bij de Catedral de Sal en bood aan om iets te gaan eten. Afspraak is flexibel; dag 23 in Zipaquirá past nu het best — na de kathedraal, rond 13u in het koloniale centrum. Bevestig de datum met hem.' },

  { id:'act-3cordilleras', type:'activiteit', dag:9, status:'te-boeken',
    titel:'3 Cordilleras · Estación Central — tafel reserveren', locatie:'medellin',
    note:'Estación Central is alleen open do–za 18:00–02:00; dag 10 vertrekken we, dus donderdag 26 nov is de enige avond. Tafel reserveren via 3cordilleras.com (reservatielink) of WhatsApp +57 315 818 3233; vragen of er een rondleiding/proeverij is.' },

  { id:'act-guatape-boot', type:'activiteit', dag:11, status:'ter-plaatse',
    titel:'Boottocht op het meer', locatie:'guatape',
    note:'Aan de kade regelen. Gaat door bij genoeg opvarenden.' },

  { id:'act-cocora', type:'activiteit', dag:6, status:'ter-plaatse',
    titel:'Valle de Cocora — 13 km lus', locatie:'salento',
    note:'Vroeg met de Willys-jeep vanaf de plaza. Rubberlaarzen te huur in het dorp; de paden langs de rivier zijn modderig.' },

  { id:'act-filandia', type:'activiteit', dag:5, status:'ter-plaatse',
    titel:'Filandia — koffie, paardrijden, uitkijktoren', locatie:'salento',
    note:'Voorkeur: A) paardrijden ±3u bij Rural Adventure (COP 220.000 (≈€61) p.p., Engelstalige gids gevraagd) — 6 nov David: Engelstalige gids OK; ophalen kost COP 150.000 (≈€42) per rit (Uber/taxi Salento–Filandia ±COP 60.000 (≈€17)). Boeking zo 22 nov 9:30 gevraagd + gevraagd of vooraf betalen via de website kan (6 nov). Nog open: betaling, pin van de finca. Alternatief B) brulapen in Barbas-Bremen (start ±6u, 3–5u met gids, tour ±US$105 p.p.). Rest van de dag: willy vanaf de plaza van Salento (elk uur, ±COP 7.500 (≈€2,1) p.p., ±40 min) · koffie en zondagsmarkt op de plaza · lunch Helena Adentro (reserveren) · Mirador Colina Iluminada (COP 8.000–12.000 (≈€2,2–3,3), open tot 18:00) · laatste willy 18:10 terug, retourticket bij aankomst kopen.' },

  { id:'act-downhill-salento', type:'activiteit', dag:4, status:'te-boeken',
    titel:'Downhill La Carbonera — Mountain Bike Salento', locatie:'salento',
    vertrek:'07:20 op kantoor (Cra 5 #6-24) · start 07:40 · terug ±13:30',
    prijs:'COP 240.000 p.p. (≈€67) all-in · betalen met kaart (+6%)',
    link:'https://wa.me/573127696391',
    deadline:'Vr 20 nov ’s ochtends WhatsAppen om te bevestigen (“escríbeme un día antes”) · paspoort Bert gestuurd · Ellens paspoort nog sturen · groep van 4 nog niet zeker',
    note:'Route paisajística intermedia: 2 afdalingen + 2 keer 4x4 naar boven, ±34 km grind, ontbijt op finca, waterval ±40 m. Regen bij de start of geen groep: wisselen met Cocora (dag 6). Alternatief: Trek Bike Adventure (Cl 7 #4-42, tegenover Casa Salento, ⭐5,0, WhatsApp +57 322 952 6119) — 7 nov geantwoord: tour La Carbonera ±6 uur, gids spreekt Engels en Spaans, kan vertrekken met enkel ons tweeën (geen minimum). Nog open: prijs, startuur, betalen met kaart? Salento Cycling volzet tot 3 dec.' },

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

/* Oorspronkelijk budget (index.html, 7 aug 2026 — eerste volledige versie), 2 personen.
   Toen nog: 22 nachten, één binnenlandse vlucht MDE → Cartagena, bussen overland. */
var BUDGET_ORIGINEEL = { datum:'7 aug 2026', intl:1944, binnen:160, land:60, hotels:1540, activiteiten:680, eten:1680 };

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
