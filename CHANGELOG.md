# Changelog

All notable changes to **Beatmaker Legend** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- **Expanded Game Guide** — Comprehensive HTML documentation with new articles:
  - AI Scene Simulation - how the living scene works
  - World News Browser - news reader features and tips
  - Release Types & Formats - singles, EPs, albums, catalog numbers
  - Record Labels Deep Dive - prestige tiers, genre coverage
  - Dynamic AI Content - Gemini API setup and fallbacks
  - Difficulty Levels - challenge modes explained
  - Community Features - virtual artists, remixes, forum
  - 15 navigation sections for easy access

- **Web Ecosystem Simulator (WES)** — Living attention economy simulation with 7 engines:
  - **Content Graph Engine** — Weighted directed graph of artist pages, label sites, release pages, forum threads, blog posts, news articles, reviews. SEO-like link authority with backlink tracking.
  - **Attention Economy Engine** — Nodes tracked by views, clicks, dwell time, shares, likes, backlinks with decay rate and momentum. Scoring formula: `(views×0.2 + clicks×0.3 + shares×0.5 + backlinks×0.7 + dwell×0.4) × momentum × trendMultiplier`. Random resurgence when content is rediscovered.
  - **Search & Ranking Engine** — Full-text search across all nodes with 8 search intents (news, music, forum, artist, label, gossip, track_releases, general). Ranking = `relevance × authority × freshness × engagement × trendBoost`. Intent-based weighting for biased results.
  - **Virality Simulation Engine** — State machine: dead→gaining→viral→peak→declining→forgotten. Virality formula: `shares × amplificationFactor × networkDensity × (1+influencerBoost) × (1+emotionalIntensity) × (1+noveltyFactor)`. Viral spikes temporarily override decay.
  - **Trend System** — Genre trends, hot topics, and sentiment tracking. Trends decay/boost each tick, feed into ranking multipliers and NPC behavior.
  - **Forum/Thread System** — Threads with toxicity/engagement/polarization dynamics that evolve as posts are added. Can escalate to heated or polarized states.
  - **NPC Web Behavior** — NPCs post content based on sociability. High-ego NPCs trigger controversial posts (30% chance) with viral attempts. Positive posts create blog nodes.
  - **Content Lifecycle** — creation→discovery→growth→viral_spike→saturation→decay→archive with time-based stage transitions.

- **Virtual Browser 2.0** — Fully rewritten to use live WES engine data:
  - Home page with trending content, viral feed, active forum discussions, live "Internet Pulse" panel (genre trends, hot topics, sentiment gauges)
  - Search with intent selector and ranked results showing score breakdown (authority%, engagement%, freshness%, trend boost)
  - Node pages (artist/label/release) with attention stats grid and virality profile
  - Thread view with live dynamics bars (toxicity, engagement, polarization)
  - Status bar showing live node/edge/thread count and tick counter
  - No longer depends on `gameState` prop — reads directly from WES singleton

- **NPC Simulation System** — Complete NPC framework with:
  - 10 NPC archetypes (techno_purist, experimental, commercial, underground_legend, rising_star, mentor, rival, scene_elder, industry_shark, bedroom_producer)
  - Big-5 personality model (openness, ego, creativity, commercialism, emotionality, sociability) with archetype-based jitter
  - Mood engine with energy, burnout, inspiration and emotional states (neutral, excited, angry, burnt_out, inspired)
  - Relationship system with affinity, trust, history tracking across all NPC pairs
  - Memory system with structured events, summaries, and weight decay/consolidation
  - Procedural dialogue with 5 interaction types (greeting, collaboration, conflict, random_chat, farewell)

- **Event Generation Pipeline** — World event system with:
  - NPC tick (mood decay, goal progress, NPC action generation)
  - Scene event generation (industry, NPC interaction, trend, controversy)
  - Event impact application (stats, NPC relationships)
  - Premium AI event generation every 8 ticks (interview, review, viral, controversy, festival_report)

- **Premium AI Layer** — Gemini-powered enhancement for rare events:
  - `POST /api/npc/dialogue` — NPC dialogue with personality/mood/relationship/memory context
  - `POST /api/npc/premium-event` — Premium event generation (interview, review, viral, controversy, festival_report)
  - Client-side NPC AI module (`npcAI.ts`) with 10-minute LRU cache (200 entries)
  - 5% dialogue spike: AI-enhanced character dialogue with full context
  - Graceful degradation when AI is unavailable (falls back to procedural)

- **Dynamic AI Text Generation** — AI-powered content across the game engine:
  - `/api/generate-ai-scene-news` - Dynamic scene news headlines
  - `/api/generate-ai-forum-post` - Forum discussion generation
  - `/api/generate-ai-social-feed` - Social media posts
  - `/api/generate-ai-artist-bio` - Artist biography generation
  - Smart procedural fallbacks when AI unavailable
  - 5-minute content caching to reduce API calls
  - Quality-aware content based on player stats

- **Expanded World News Browser** — Full-featured news reader component:
  - Three tabs: News Feed, Scene Releases, Label Activity
  - Search and filter by category (release, gossip, trend, festival, scandal, collab)
  - Sort by newest, oldest, highest/lowest hype
  - Bookmark articles for later reading
  - Article detail modal with full content
  - Visual statistics dashboard with category counts
  - Connected to sidebar for easy access

- **Enhanced Release System**:
  - Automatic catalog number generation (e.g., `DIY-EP-001`, `SUB-SGL-002`)
  - Release type badges (SINGLE, EP, ALBUM) on cover art
  - Catalog number and label display on release cards
  - Self-release indicator with 🏠 emoji

- **40+ Record Labels** — Expanded from 5 to 40+ labels covering all genres:
  - Techno: Subterranean Clicks, Detroit Machine Soul, Minimal Wave Collective
  - House: NeOnlyt Outrun, Deep Groove Foundations, Progressive Sound Labs
  - Drum & Bass: Breakbeat Syndicate, Neurofunk Engineering, Liquid Soundscape
  - Trance/Psytrance: Aurora Heavenly, Uplifting Horizon, Dark Psy Forest
  - Hardstyle/Hardcore: Hardstyle Mainstage, Gabber Rotterdam Ultra
  - Genre filtering and prestige tier system (Underground/Mid-Tier/Prestigious)

### Added
- **Difficulty Level System** — Scalable challenge with 4 difficulty modes:
  - 🌱 **Easy**: $2,000 starting money, 1.5x gig earnings, 0.5x burnout rate
  - ⚡ **Normal**: $550 starting money, balanced gameplay (default)
  - 🔥 **Hard**: $300 starting money, 0.8x earnings, 1.5x label requirements
  - 💀 **Nightmare**: $150 starting money, 0.5x gig earnings, 2x burnout, 2x label requirements
  - Difficulty selector on career launch screen with visual icons and detailed tooltips
  - Each difficulty affects: starting money/fans, gig earnings, royalties, fan gains, burnout rate, label requirements, gear prices, inspiration depletion

- **Track Length Control** — Creative format selection for compositions:
  - 📻 **Radio Edit** (2:30-3:30): Streaming-friendly for Spotify/radio
  - 🎧 **Club Edit** (4:00-5:30): Standard club mix (default)
  - 🌙 **Extended Mix** (6:00-8:00): Festival/underground sets
  - 🔮 **Long Play** (10:00-15:00): Ambient/progressive journeys
  - 🎹 **Megamix** (20:00+): Endurance/DJ sets
  - Duration stored per track with version name (e.g., "Extended Mix", "Club Mix")

- **Custom Cover Image System**:
  - Upload custom cover images (PNG, JPG, WEBP) up to 5MB
  - Real-time preview in LP Sleeve Designer
  - Library browser for pre-loaded covers in `public/covers/`
  - Generated AI covers work perfectly (Midjourney, DALL-E, Stable Diffusion)
  - Stored as base64 data URL for offline portability

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