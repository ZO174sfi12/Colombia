# Download culinaire foto's van Wikimedia naar img/food/
# Uitvoeren: rechtsklik → "Run with PowerShell"
# Of in terminal: powershell -ExecutionPolicy Bypass -File download_food_imgs.ps1

Set-Location $PSScriptRoot
New-Item -ItemType Directory -Force -Path "img\food" | Out-Null

$images = @{
    "bandeja_paisa.jpg" = "https://commons.wikimedia.org/wiki/Special:FilePath/Bandeja_Paisa_(Bogot%C3%A1).jpg?width=700"
    "ajiaco.jpg"        = "https://commons.wikimedia.org/wiki/Special:FilePath/Ajiaco_in_Bogot%C3%A1.jpg?width=700"
    "sancocho.jpg"      = "https://commons.wikimedia.org/wiki/Special:FilePath/Sancocho_cruzado_de_gallina,_rabo_y_costilla_con_arepa.jpg?width=700"
    "asado_co.jpg"      = "https://commons.wikimedia.org/wiki/Special:FilePath/Chuleta_Valluna_-_Colombiana.jpg?width=700"
    "lechona.jpg"       = "https://commons.wikimedia.org/wiki/Special:FilePath/Lechona.JPG?width=700"
    "tamales.jpg"       = "https://commons.wikimedia.org/wiki/Special:FilePath/080924_tamal_de_viaje.JPG?width=700"
    "arepa.jpg"         = "https://commons.wikimedia.org/wiki/Special:FilePath/Arepas_Colombia.JPG?width=700"
    "empanadas.jpg"     = "https://commons.wikimedia.org/wiki/Special:FilePath/Bogota_Empanadas_de_la_53_con_carrera_17,_Chapinero.JPG?width=700"
    "pan_de_bono.jpg"   = "https://commons.wikimedia.org/wiki/Special:FilePath/Pandebono.jpg?width=700"
    "bunuelos.jpg"      = "https://commons.wikimedia.org/wiki/Special:FilePath/Home-made_bu%C3%B1uelos.JPG?width=700"
    "aguardiente.jpg"   = "https://commons.wikimedia.org/wiki/Special:FilePath/Aguardientes_de_Colombia_Nectar.JPG?width=700"
    "cholado.jpg"       = "https://commons.wikimedia.org/wiki/Special:FilePath/Cholado_jamundi.jpg?width=700"
    "helado_paila.jpg"  = "https://commons.wikimedia.org/wiki/Special:FilePath/Helado_de_paila_01.jpg?width=700"
    "hormigas.jpg"      = "https://commons.wikimedia.org/wiki/Special:FilePath/Hormigas_fritas_1.jpg?width=700"
    "cuy.jpg"           = "https://commons.wikimedia.org/wiki/Special:FilePath/Cuy_asado.jpg?width=700"
}

$downloaded = @()
$failed = @()

Write-Host "`nFoto's downloaden...`n" -ForegroundColor Cyan

foreach ($name in $images.Keys) {
    $dest = "img\food\$name"
    if ((Test-Path $dest) -and (Get-Item $dest).Length -gt 5000) {
        Write-Host "  ✓ al aanwezig: $name" -ForegroundColor Gray
        $downloaded += $name
        continue
    }
    try {
        $url = $images[$name]
        Invoke-WebRequest -Uri $url -OutFile $dest -UserAgent "Mozilla/5.0" -TimeoutSec 15 -ErrorAction Stop
        $kb = [int]((Get-Item $dest).Length / 1024)
        Write-Host "  ✅ $name ($kb KB)" -ForegroundColor Green
        $downloaded += $name
    } catch {
        Write-Host "  ❌ $name : $($_.Exception.Message)" -ForegroundColor Red
        $failed += $name
    }
}

# Update culinair.html: vervang Wikimedia URLs door lokale paden
Write-Host "`nculinair.html bijwerken..." -ForegroundColor Cyan
$html = Get-Content "culinair.html" -Raw -Encoding UTF8

$replacements = @{
    "https://commons.wikimedia.org/wiki/Special:FilePath/Bandeja_Paisa_(Bogot%C3%A1).jpg?width=600"                                          = "img/food/bandeja_paisa.jpg"
    "https://commons.wikimedia.org/wiki/Special:FilePath/Ajiaco_in_Bogot%C3%A1.jpg?width=600"                                                = "img/food/ajiaco.jpg"
    "https://commons.wikimedia.org/wiki/Special:FilePath/Sancocho_cruzado_de_gallina%2C_rabo_y_costilla_con_arepa.jpg?width=600"              = "img/food/sancocho.jpg"
    "https://commons.wikimedia.org/wiki/Special:FilePath/Chuleta_Valluna_-_Colombiana.jpg?width=600"                                          = "img/food/asado_co.jpg"
    "https://commons.wikimedia.org/wiki/Special:FilePath/Lechona.JPG?width=600"                                                              = "img/food/lechona.jpg"
    "https://commons.wikimedia.org/wiki/Special:FilePath/080924_tamal_de_viaje.JPG?width=600"                                                = "img/food/tamales.jpg"
    "https://commons.wikimedia.org/wiki/Special:FilePath/Arepas_Colombia.JPG?width=600"                                                      = "img/food/arepa.jpg"
    "https://commons.wikimedia.org/wiki/Special:FilePath/Bogota_Empanadas_de_la_53_con_carrera_17%2C_Chapinero.JPG?width=600"               = "img/food/empanadas.jpg"
    "https://commons.wikimedia.org/wiki/Special:FilePath/Pandebono.jpg?width=600"                                                            = "img/food/pan_de_bono.jpg"
    "https://commons.wikimedia.org/wiki/Special:FilePath/Home-made_bu%C3%B1uelos.JPG?width=600"                                              = "img/food/bunuelos.jpg"
    "https://commons.wikimedia.org/wiki/Special:FilePath/Aguardientes_de_Colombia_Nectar.JPG?width=600"                                      = "img/food/aguardiente.jpg"
    "https://commons.wikimedia.org/wiki/Special:FilePath/Cholado_jamundi.jpg?width=600"                                                      = "img/food/cholado.jpg"
    "https://commons.wikimedia.org/wiki/Special:FilePath/Helado_de_paila_01.jpg?width=600"                                                   = "img/food/helado_paila.jpg"
    "https://commons.wikimedia.org/wiki/Special:FilePath/Hormigas_fritas_1.jpg?width=600"                                                    = "img/food/hormigas.jpg"
    "https://commons.wikimedia.org/wiki/Special:FilePath/Cuy_asado.jpg?width=600"                                                            = "img/food/cuy.jpg"
}

$changed = 0
foreach ($wiki in $replacements.Keys) {
    $local = $replacements[$wiki]
    $localName = Split-Path $local -Leaf
    if ($downloaded -contains $localName) {
        if ($html -match [regex]::Escape($wiki)) {
            $html = $html.Replace($wiki, $local)
            $changed++
        }
    }
}

[System.IO.File]::WriteAllText("$PSScriptRoot\culinair.html", $html, [System.Text.Encoding]::UTF8)

Write-Host "`n✅ Klaar: $($downloaded.Count) foto's gedownload, $changed src's bijgewerkt" -ForegroundColor Green
if ($failed.Count -gt 0) {
    Write-Host "❌ Mislukt: $($failed -join ', ')" -ForegroundColor Red
    Write-Host "   Sla deze handmatig op als img\food\<naam>.jpg" -ForegroundColor Yellow
}

Write-Host "`nDruk Enter om te sluiten..." -NoNewline
Read-Host
