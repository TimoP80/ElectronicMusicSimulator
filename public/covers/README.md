# Custom Track Covers

You can add custom cover images for your tracks by placing image files in this folder.

## Supported Formats
- PNG (.png)
- JPG/JPEG (.jpg, .jpeg)
- WebP (.webp)

## Usage
1. Generate or create your cover images using an AI image generator (Midjourney, DALL-E, Stable Diffusion, etc.)
2. Save the images to this folder (`public/covers/`)
3. In the game's DAW Track Creator, click "📷 Custom Cover"
4. The game will load covers from this folder

## Recommended Settings
- Resolution: 300x300 pixels or higher (square aspect ratio works best)
- File size: Under 5MB
- Format: PNG or WebP recommended for best quality

## Organization
You can organize covers in subfolders:
```
public/covers/
├── neon/
│   ├── cover1.png
│   └── cover2.png
├── minimal/
│   └── minimal_cover.png
└── custom_covers/
    └── my_cover.webp
```

The game will automatically scan this folder and let you select from your custom covers!