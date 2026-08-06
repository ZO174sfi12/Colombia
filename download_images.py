"""
Colombia website - foto's downloaden van Wikimedia Commons
Voer dit script uit in de Colombia-map: python download_images.py
Alle afbeeldingen worden opgeslagen in ./img/
"""
import urllib.request
import os
import sys

IMG_DIR = os.path.join(os.path.dirname(__file__), "img")
os.makedirs(IMG_DIR, exist_ok=True)

IMAGES = {
    # Wikimedia Commons CC-licensed images
    # Cocora Valley
    "salento_cocora.jpg":
        "https://upload.wikimedia.org/wikipedia/commons/0/00/Valle_de_Cocora%2C_Colombia_04.jpg",

    # Cartagena stadsmuren zonsondergang
    "cartagena_murallas.jpg":
        "https://upload.wikimedia.org/wikipedia/commons/1/12/Sunset-cartagena-tower-dewired.jpg",

    # Guatapé zócalos
    "guatape_zocalos.jpg":
        "https://upload.wikimedia.org/wikipedia/commons/1/16/Plazoleta_de_los_z%C3%B3calos_%282%29.JPG",

    # Chiva bus
    "act_chiva.jpg":
        "https://upload.wikimedia.org/wikipedia/commons/1/15/La_Chiva_Colombiana.jpg",

    # Castillo San Felipe
    "act_castillo.jpg":
        "https://upload.wikimedia.org/wikipedia/commons/a/aa/Castillo_de_San_Felipe_de_Barajas%2C_Cartagena%2C_Colombia.jpg",

    # Salsa dancing (Cali)
    "act_salsa.jpg":
        "https://upload.wikimedia.org/wikipedia/commons/9/94/Salsa_en_Cali.jpg",

    # Mirador Alto de la Cruz Salento
    "salento_mirador.jpg":
        "https://upload.wikimedia.org/wikipedia/commons/e/ea/Alto_de_la_Cruz%2C_Salento%2C_Colombia.jpg",

    # Las Murallas Cartagena
    "cartagena_street.jpg":
        "https://upload.wikimedia.org/wikipedia/commons/6/65/Las_Murallas%2C_the_walls_of_Cartagena%2C_Colombia_%2823955876854%29.jpg",
}

HEADERS = {
    "User-Agent": "Colombia-travel-site/1.0 (personal travel website; bert0nijs@gmail.com)"
}

print(f"Afbeeldingen downloaden naar: {IMG_DIR}\n")
success = 0
errors = []

for filename, url in IMAGES.items():
    dest = os.path.join(IMG_DIR, filename)
    print(f"  Downloaden: {filename} ... ", end="", flush=True)
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=30) as r:
            data = r.read()
        with open(dest, "wb") as f:
            f.write(data)
        kb = len(data) // 1024
        print(f"OK ({kb} KB)")
        success += 1
    except Exception as e:
        print(f"FOUT: {e}")
        errors.append(filename)

print(f"\n✅ {success}/{len(IMAGES)} afbeeldingen gedownload.")
if errors:
    print(f"❌ Mislukt: {', '.join(errors)}")
    print("   Controleer je internetverbinding en probeer opnieuw.")
else:
    print("Alle afbeeldingen zijn klaar — push daarna met git.")
