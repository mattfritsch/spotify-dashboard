#!/usr/bin/env python3
from PIL import Image, ImageDraw
import os

def create_icon(size, filename):
    # Créer une image avec fond noir
    img = Image.new('RGB', (size, size), color='#0a0a0a')
    draw = ImageDraw.Draw(img)
    
    # Dessiner un cercle vert Spotify au centre
    center = size // 2
    radius = int(size * 0.35)
    draw.ellipse(
        [center - radius, center - radius, center + radius, center + radius],
        fill='#1DB954'
    )
    
    # Sauvegarder
    img.save(f'public/{filename}', 'PNG')
    print(f'✅ {filename} créé ({size}x{size})')

# Créer les icônes
create_icon(192, 'icon-192.png')
create_icon(512, 'icon-512.png')
create_icon(32, 'favicon.png')

print('🎉 Toutes les icônes PWA ont été créées !')
