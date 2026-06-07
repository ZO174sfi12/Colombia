"""
Eenmalig uitvoeren: python download_food_imgs.py
Downloads alle culinaire foto's van Wikimedia naar img/food/
Daarna worden de HTML-src's bijgewerkt naar lokale paden.
"""

import urllib.request, os, re, shutil

HEADERS = {'User-Agent': 'Mozilla/5.0 (compatible; ColombiaReissite/1.0)'}
IMG_DIR = 'img/food'
os.makedirs(IMG_DIR, exist_ok=True)

# Bestandsnaam → lokale naam
IMAGES = {
    'bandeja_paisa.jpg':   'https://commons.wikimedia.org/wiki/Special:FilePath/Bandeja_Paisa_(Bogot%C3%A1).jpg?width=700',
    'ajiaco.jpg':          'https://commons.wikimedia.org/wiki/Special:FilePath/Ajiaco_in_Bogot%C3%A1.jpg?width=700',
    'sancocho.jpg':        'https://commons.wikimedia.org/wiki/Special:FilePath/Sancocho_cruzado_de_gallina%2C_rabo_y_costilla_con_arepa.jpg?width=700',
    'asado_co.jpg':        'https://commons.wikimedia.org/wiki/Special:FilePath/Chuleta_Valluna_-_Colombiana.jpg?width=700',
    'lechona.jpg':         'https://commons.wikimedia.org/wiki/Special:FilePath/Lechona.JPG?width=700',
    'tamales.jpg':         'https://commons.wikimedia.org/wiki/Special:FilePath/080924_tamal_de_viaje.JPG?width=700',
    'arepa.jpg':           'https://commons.wikimedia.org/wiki/Special:FilePath/Arepas_Colombia.JPG?width=700',
    'empanadas.jpg':       'https://commons.wikimedia.org/wiki/Special:FilePath/Bogota_Empanadas_de_la_53_con_carrera_17%2C_Chapinero.JPG?width=700',
    'pan_de_bono.jpg':     'https://commons.wikimedia.org/wiki/Special:FilePath/Pandebono.jpg?width=700',
    'bunuelos.jpg':        'https://commons.wikimedia.org/wiki/Special:FilePath/Home-made_bu%C3%B1uelos.JPG?width=700',
    'aguardiente.jpg':     'https://commons.wikimedia.org/wiki/Special:FilePath/Aguardientes_de_Colombia_Nectar.JPG?width=700',
    'cholado.jpg':         'https://commons.wikimedia.org/wiki/Special:FilePath/Cholado_jamundi.jpg?width=700',
    'helado_paila.jpg':    'https://commons.wikimedia.org/wiki/Special:FilePath/Helado_de_paila_01.jpg?width=700',
    'hormigas.jpg':        'https://commons.wikimedia.org/wiki/Special:FilePath/Hormigas_fritas_1.jpg?width=700',
    'cuy.jpg':             'https://commons.wikimedia.org/wiki/Special:FilePath/Cuy_asado.jpg?width=700',
}

print("Foto's downloaden...\n")
downloaded = []
failed = []

for local_name, url in IMAGES.items():
    dest = os.path.join(IMG_DIR, local_name)
    if os.path.exists(dest) and os.path.getsize(dest) > 5000:
        print(f"  ✓ al aanwezig: {local_name}")
        downloaded.append(local_name)
        continue
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=15) as r:
            data = r.read()
        if len(data) < 1000:
            raise ValueError("Bestand te klein, mogelijk foutmelding")
        with open(dest, 'wb') as f:
            f.write(data)
        kb = len(data) // 1024
        print(f"  ✅ {local_name} ({kb} KB)")
        downloaded.append(local_name)
    except Exception as e:
        print(f"  ❌ {local_name}: {e}")
        failed.append(local_name)

# Update culinair.html: vervang Wikimedia URLs door lokale paden
print("\nculinair.html bijwerken...")
html_file = 'culinair.html'
with open(html_file, encoding='utf-8') as f:
    html = f.read()

replacements = {
    'Special:FilePath/Bandeja_Paisa_(Bogot%C3%A1).jpg?width=600':        'img/food/bandeja_paisa.jpg',
    'Special:FilePath/Ajiaco_in_Bogot%C3%A1.jpg?width=600':              'img/food/ajiaco.jpg',
    'Special:FilePath/Sancocho_cruzado_de_gallina%2C_rabo_y_costilla_con_arepa.jpg?width=600': 'img/food/sancocho.jpg',
    'Special:FilePath/Chuleta_Valluna_-_Colombiana.jpg?width=600':        'img/food/asado_co.jpg',
    'Special:FilePath/Lechona.JPG?width=600':                             'img/food/lechona.jpg',
    'Special:FilePath/080924_tamal_de_viaje.JPG?width=600':               'img/food/tamales.jpg',
    'Special:FilePath/Arepas_Colombia.JPG?width=600':                     'img/food/arepa.jpg',
    'Special:FilePath/Bogota_Empanadas_de_la_53_con_carrera_17%2C_Chapinero.JPG?width=600': 'img/food/empanadas.jpg',
    'Special:FilePath/Pandebono.jpg?width=600':                           'img/food/pan_de_bono.jpg',
    'Special:FilePath/Home-made_bu%C3%B1uelos.JPG?width=600':             'img/food/bunuelos.jpg',
    'Special:FilePath/Aguardientes_de_Colombia_Nectar.JPG?width=600':     'img/food/aguardiente.jpg',
    'Special:FilePath/Cholado_jamundi.jpg?width=600':                     'img/food/cholado.jpg',
    'Special:FilePath/Helado_de_paila_01.jpg?width=600':                  'img/food/helado_paila.jpg',
    'Special:FilePath/Hormigas_fritas_1.jpg?width=600':                   'img/food/hormigas.jpg',
    'Special:FilePath/Cuy_asado.jpg?width=600':                           'img/food/cuy.jpg',
}

changed = 0
for wiki_path, local_path in replacements.items():
    local_name = local_path.split('/')[-1]
    if local_name in downloaded:
        full_wiki = 'https://commons.wikimedia.org/wiki/' + wiki_path
        if full_wiki in html:
            html = html.replace(full_wiki, local_path)
            changed += 1

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html)

print(f"\n✅ Klaar: {len(downloaded)} foto's gedownload, {changed} src's bijgewerkt")
if failed:
    print(f"❌ Mislukt ({len(failed)}): {', '.join(failed)}")
    print("   → Voeg deze handmatig toe via Google Images en sla op als img/food/<naam>.jpg")
