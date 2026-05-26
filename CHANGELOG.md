# Changelog

All notable changes to **Beatmaker Legend** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- **4,574 Predefined Artists** from authentic electronic music scene data:
  - Real-world artists like Scooter, Ferry Corsten, Armin van Buuren, DJ Tiesto
  - 2,328 Trance artists, 884 Psychedelic, 614 Hard Dance, 471 Hardcore
  - Genre-specific fame and ego calculations
  - Dynamic relationship system for rivals, mentors, and colleagues
- **566 Record Labels** from scene database:
  - Black Hole Recordings, Armada Music, Anjunabeats, Masters Of Hardcore, ID&T
  - Real founding years and contract terms
  - Genre-specific prestige calculations
- **500+ Authentic Track Names** from song database:
  - Classic trance/electronic names like "Age Of Love", "Airwave", "Communication"
  - 70% chance to use database names, 30% procedural generation
- **33 New Music Subgenres**:
  - Trance: Progressive, Melodic, Tech, Uplifting
  - Hardcore: Gabber, Speedcore, Terrorcore, Noisecore, Frenchcore
  - Psytrance: Dark psy, Full On, Goa, Progressive Psytrance
  - Breakbeat: Big Beat, Nu skool breaks, Raggacore, Chemical breaks
  - Acid: Acid House, Acid Trance
  - And more: Suomisaundi, Detroit/Minimal Techno, Schranz
- **New World Trends** for imported subgenres:
  - Epic Trance Anthem Revival
  - Rotterdam Gabber Comeback
  - 303 Acid Squelch Renaissance
  - Suomisaundi Global Expansion
  - Jumpstyle International Party
  - Dark Psy Forest Energy
- **Scene Group Database** for authentic release naming conventions
- **Compilation Series Names** (Trance Stories, The Definitive Trance Anthology, etc.)
- **Track Version Patterns** (Original Mix, Remix, Radio Edit, etc.)
- **Release Format Types** (CD Single, Vinyl EP, Web Album, etc.)

### Added
- `src/data/artists.ts` - Artist pool with 4,574 predefined artists
- `src/data/recordLabels.ts` - Extended record labels database
- `src/data/database.ts` - Centralized data access module

### Added
- **AI Scene Simulation** - Simulated music scene with:
  - 3-8 AI artist releases per week from predefined artists
  - 2-5 news posts per week (release, gossip, trend, festival, scandal)
  - 1-3 label activities per week (signings, releases, tours)
  - Dynamic virtual artists with fame/ego calculations
- **Scene Monitor Dashboard** - New UI component showing:
  - AI releases with quality, play counts, viral status
  - News feed with hype impact indicators
  - Label activities (signings, tours, closures)
  - Clickable website links for artists, labels, releases
- **Web URLs for Scene Entities**:
  - Record labels: `{slug}-records.scene`
  - Artists: `{slug}.scene-artists.com`
  - Releases: `{artist}-{title}.scene-releases.com`

---

## [1.3.0] - 2026-05-26

### Added
- **Comprehensive README documentation** - Complete game documentation including:
  - Game overview with story and gameplay loop
  - 16-genre library table with BPM ranges, underground index, and vibes
  - Record labels catalog (5 labels with prestige, splits, requirements)
  - Global cities overview (8 cities with travel costs and genre boosts)
  - Gear & equipment catalog (laptops, DAWs, synthesizers)
  - Skills tree documentation across 4 categories
  - Stats explained section
  - Strategic tips for early, mid, and late game phases
  - Tech stack and project structure documentation

- **Interactive HTML Game Guide** (`game-guide.html`) - Standalone comprehensive game guide featuring:
  - Cyberpunk-inspired dark theme with neon accents
  - Responsive design with sticky navigation
  - Full genre reference table with underground indices
  - City cards with travel costs and genre boosts
  - Label cards with prestige and royalty information
  - Interactive skills accordion with expandable categories
  - Strategic tips organized by game phase
  - Custom fonts (Orbitron, Rajdhani, Share Tech Mono)

### Changed
- **Mod Editor Layout Overhaul** - Major improvements to the Developer Modding Studio:
  - Full-screen standalone mode for better focus
  - Compact sticky header with essential actions
  - Shortened tab labels for space efficiency (META, GENRES, ARTISTS, etc.)
  - Sticky navigation tabs for easy access while scrolling
  - Hidden sidebar in standalone mode to maximize content area
  - Responsive padding and improved overflow handling
  - Better grid layout for single-column content display
  - `standaloneMode` prop added to control layout behavior

### Fixed
- Improved mod editor visibility and usability
- Better overflow handling for long content lists

---

## [1.2.0] - 2026-05-20

### Added
- **Developer Modding Studio** - Full-featured mod editor with:
  - Mod pack metadata editor
  - Custom genre definitions (BPM, energy, complexity, underground index)
  - AI artist blueprint system
  - Hardware equipment specifications
  - World/city scene editor
  - Story event scripting system
  - Economy parameters configuration
  - AI behavior node graph editor
  - Autonomous simulation stress-test lab

### Added
- **6 Producer Ethos Archetypes**:
  - Underground Techno Purist
  - Commercial EDM Superstar
  - Experimental Sound Designer
  - Synthwave Nostalgia Runner
  - UK Garage Selector
  - Downtempo Ambient Dubber

### Added
- **16 Music Genres**: Techno, Trance, House, Drum & Bass, Dubstep, Synthwave, Industrial, Ambient, Hardstyle, Experimental, Chiptune, Downtempo, Future Bass, UK Garage, Deep House, Psytrance

### Added
- **8 Global Cities**: Suburban Bedroom, Berlin, London, Detroit, Amsterdam, Ibiza, Tokyo, Los Angeles

### Added
- **5 Record Labels**: Subterranean Clicks, NeOnlyt Outrun, Breakbeat Syndicate, Aurora Heavenly, Vortex Mainstage

### Added
- **Save System**: 3 save slots + export/import functionality

---

## [1.1.0] - 2026-05-15

### Added
- **DAW Track Creator** - Full track composition system
- **Audio Visualizer** - Real-time audio visualization
- **Gig Booking System** - Book performances at venues worldwide
- **Record Labels Catalog** - Sign with labels for advances and royalty splits
- **Social Drama Forum** - AI rival interactions and drama events
- **Skills Tree** - Level up production, engineering, performance, marketing skills
- **Upgradable Gear Shop** - Purchase equipment and studio gear

### Added
- **World Trends System** - Dynamic genre popularity shifts
- **Burnout & Inspiration System** - Track quality affected by rest/production
- **Event Logging** - Career milestone tracking

---

## [1.0.0] - 2026-05-10

### Added
- Initial game release
- Basic career simulation mechanics
- Core track creation and release cycle
- Fan and hype tracking system

---

[Unreleased]: https://github.com/TimoP80/ElectronicMusicSimulator/compare/main...HEAD
[1.3.0]: https://github.com/TimoP80/ElectronicMusicSimulator/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/TimoP80/ElectronicMusicSimulator/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/TimoP80/ElectronicMusicSimulator/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/TimoP80/ElectronicMusicSimulator/releases/tag/v1.0.0