#!/bin/bash

# Vérifier si ImageMagick est installé
if ! command -v convert &> /dev/null; then
    echo "⚠️  ImageMagick n'est pas installé. Installation via Homebrew..."
    if command -v brew &> /dev/null; then
        brew install imagemagick
    else
        echo "❌ Homebrew n'est pas installé. Installe ImageMagick manuellement ou utilise des icônes en ligne."
        exit 1
    fi
fi

echo "🎨 Génération des icônes PNG..."

# Générer 192x192
convert -background none public/icon.svg -resize 192x192 public/icon-192.png
echo "✅ icon-192.png créé"

# Générer 512x512
convert -background none public/icon.svg -resize 512x512 public/icon-512.png
echo "✅ icon-512.png créé"

# Générer favicon
convert -background none public/icon.svg -resize 32x32 public/favicon.ico
echo "✅ favicon.ico créé"

echo "🎉 Toutes les icônes ont été générées !"
