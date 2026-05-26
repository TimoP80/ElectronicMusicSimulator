/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Track, TrackStats, MusicGenre, RecordLabel, MusicTrend, ReleasedTrack, GameState, EventLog, GearItem } from "../types";
import { GENRES_DB } from "../data/genres";
import { GEAR_DB } from "../data/gear";
import { 
  getSubgenreBPMRange, 
  getSubgenreLengthRange, 
  getSubgenreAttributes, 
  getSubgenrePopularity,
  getAllSceneGroups,
  getRandomReleaseNote,
  getSongGeneratorGenreData,
  getCompilationNames,
  getReleaseTypes,
  getTrackVersions,
  GENRES_DATA,
  getRandomSongName,
  getAllSongNames
} from "../data/database";
import { getExtendedLabelsDB } from "../data/recordLabels";

// Procedural song naming components
const ADJECTIVES = ["Analog", "Digital", "Gated", "Subharmonic", "Rhythmic", "Modular", "Industrial", "Darkroom", "Sunset", "Glitched", "Liquid", "Heavy", "Midnight", "Eevolving", "Futuristic", "Saturated", "Unstable", "Resonant", "Hypnotic", "Acid", "Cosmic", "Warehouse", "Strobe", "Retro", "Spectral"];
const NOUNS = ["Dreams", "Protocol", "Rumble", "Sledgehammer", "Transit", "Siren", "Oscillator", "LFO", "Vibe", "Vapor", "Apocalypse", "Reverb", "Jungle", "Dunes", "Symmetry", "Delay", "Drums", "Algorithm", "Rave", "Frequency", "Hologram", "Horizon", "Ghost", "Circuit", "Echoes"];

// Cache for all available song names from the database
let allSongNamesCache: string[] | null = null;

// Get all genre names including new subgenres from JSON
const ALL_GENRE_NAMES = Object.values(MusicGenre);

// Scene group names for naming conventions
const SCENE_GROUPS = getAllSceneGroups();

// Get current year for scene releases
const getCurrentYear = () => {
  // This will be called from game state but for naming we use a baseline year
  return 2024;
};

// Generate scene-style release names
function generateSceneReleaseName(genre: MusicGenre): string {
  const groups = SCENE_GROUPS;
  if (groups.length === 0) {
    // Fallback if no scene groups loaded
    return `${genre}_Release_${Math.floor(Math.random() * 999)}`;
  }
  
  const group = groups[Math.floor(Math.random() * groups.length)];
  const prefix = group.prefix || group.name.substring(0, 3).toUpperCase();
  const cdNumber = Math.floor(Math.random() * 3) + 1;
  const catNumber = Math.floor(Math.random() * 9999) + 1;
  
  return `${prefix}-${cdNumber}CD-${catNumber}`;
}

// Generate release format based on SongGeneratorDatabase
function getRandomReleaseFormat(): { name: string; tag: string; trackCount: number } {
  const releaseTypes = getReleaseTypes();
  if (releaseTypes.length === 0) {
    // Default fallback
    return { name: "EP", tag: "WEB", trackCount: 4 };
  }
  
  const releaseType = releaseTypes[Math.floor(Math.random() * releaseTypes.length)];
  const trackCount = Math.floor(Math.random() * 4) + 2; // 2-5 tracks
  
  return {
    name: releaseType["@displayname"],
    tag: releaseType["@sourceTag"],
    trackCount
  };
}

// Generate track version suffix based on release type
function getTrackVersionSuffix(trackNum: number, releaseType: string): string {
  const versions = getTrackVersions(releaseType);
  if (versions.length === 0) {
    // Default fallback
    return trackNum === 1 ? "Original Mix" : "Remix";
  }
  
  const version = versions.find(v => v["@TrackNum"] === String(trackNum));
  if (!version) return trackNum === 1 ? "Original Mix" : "Remix";
  
  const types = Array.isArray(version.type) ? version.type : [version.type];
  if (types.length === 0) return "Original Mix";
  
  return types[Math.floor(Math.random() * types.length)];
}

// Get all unique song names from database (with caching)
function getCachedSongNames(): string[] {
  if (!allSongNamesCache) {
    allSongNamesCache = getAllSongNames();
  }
  return allSongNamesCache;
}

// Get a random song name from the pre-built database
function getRandomSongNameFromDatabase(): string {
  const allNames = getCachedSongNames();
  if (allNames.length === 0) {
    // Fallback to procedural generation
    return `${ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]} ${NOUNS[Math.floor(Math.random() * NOUNS.length)]}`;
  }
  return allNames[Math.floor(Math.random() * allNames.length)];
}

// Procedural fallback for track name generation
function generateProceduralTrackName(primary: MusicGenre): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  
  // Custom genre flavorings
  if (primary === MusicGenre.AMBIENT) {
    const spaceAdjs = ["Starry", "Infinite", "Soporific", "Deep", "Ethereal", "Floating"];
    const spaceNouns = ["Nebula", "Slumber", "Chords", "Drone", "Glacier", "Silence"];
    return `${spaceAdjs[Math.floor(Math.random() * spaceAdjs.length)]} ${spaceNouns[Math.floor(Math.random() * spaceNouns.length)]}`;
  }
  if (primary === MusicGenre.HARDSTYLE || primary === MusicGenre.INDUSTRIAL) {
    const aggroAdjs = ["Sledgehammer", "Hardcore", "Crushed", "Distorted", "Iron", "Brutal"];
    const aggroNouns = ["Gate", "Kick", "Pounder", "Anvil", "Riot", "Concrete"];
    return `${aggroAdjs[Math.floor(Math.random() * aggroAdjs.length)]} ${aggroNouns[Math.floor(Math.random() * aggroNouns.length)]}`;
  }
  if (primary === MusicGenre.SYNTHWAVE) {
    const retroAdjs = ["Outrun", "Overdrive", "Neon", "Sunset", "Grid", "Laser"];
    const retroNouns = ["Racer", "Cruiser", "Chrome", "Cove", "Synth", "Arcade"];
    return `${retroAdjs[Math.floor(Math.random() * retroAdjs.length)]} ${retroNouns[Math.floor(Math.random() * retroNouns.length)]}`;
  }
  
  // New subgenre-specific naming
  if (primary === MusicGenre.GABBER) {
    const gabberAdjs = ["Rotterdam", "Thunder", "Hoover", "Distorted", "Brutal", "Rotten"];
    const gabberNouns = ["Anthem", "Attack", "Drop", "Destroyer", "Fire", "Mayhem"];
    return `${gabberAdjs[Math.floor(Math.random() * gabberAdjs.length)]} ${gabberNouns[Math.floor(Math.random() * gabberNouns.length)]}`;
  }
  if (primary === MusicGenre.TECH_TRANCE || primary === MusicGenre.UPLIFTING_TRANCE) {
    const tranceAdjs = ["Euphoric", "Epic", "Celestial", "Transcendent", "Sonic", "Aurora"];
    const tranceNouns = ["Horizon", "Voyage", "Euphoria", "Melody", "Dream", "Serenity"];
    return `${tranceAdjs[Math.floor(Math.random() * tranceAdjs.length)]} ${tranceNouns[Math.floor(Math.random() * tranceNouns.length)]}`;
  }
  if (primary === MusicGenre.ACID_HOUSE || primary === MusicGenre.ACID_TRANCE) {
    const acidAdjs = ["303", "Acid", "Squelchy", "Resonant", "Squelsh", "Raw"];
    const acidNouns = ["Acid", "Squelch", "Line", "Sequence", "Patternd", "Loop"];
    return `${acidAdjs[Math.floor(Math.random() * acidAdjs.length)]} ${acidNouns[Math.floor(Math.random() * acidNouns.length)]}`;
  }
  if (primary === MusicGenre.JUMPSTYLE) {
    const jumpAdjs = ["Jump", "Bouncy", "Happy", "Energy", "Jumpin", "Hard"];
    const jumpNouns = ["Style", "Anthem", "Floor", "Rave", "Jumper", "Dance"];
    return `${jumpAdjs[Math.floor(Math.random() * jumpAdjs.length)]} ${jumpNouns[Math.floor(Math.random() * jumpNouns.length)]}`;
  }
  
  return `${adj} ${noun}`;
}

// Extended track name generator with scene-style names
function generateExtendedTrackName(primary: MusicGenre, secondary: MusicGenre | null, addSceneStyle: boolean = true): string {
  // Try to get a random pre-existing song name from the database
  const dbSongName = getRandomSongNameFromDatabase();
  
  // 70% chance to use database name, 30% chance for procedural
  if (dbSongName && Math.random() < 0.7) {
    return dbSongName;
  }
  
  // Fall back to procedural generation
  return generateProceduralTrackName(primary);
}

export function generateRandomTrackName(primary: MusicGenre, secondary: MusicGenre | null): string {
  return generateExtendedTrackName(primary, secondary);
}

export const STEM_LOOPS = {
  beat: [
    "Crunchy TR-909 Driving Beat",
    "Acoustic Breaks Spliced Dynamic Beat",
    "Heavy Sidechained 808 Sub-Beat",
    "Modular Glitched Percussive Grid Loop",
    "Shuffled Four-on-the-Floor Deep House Beat",
    "Gated 80s Snare and Synth Tom Loop",
    "Punishing Industrial Distortion Beat"
  ],
  bass: [
    "Supercharged rolling saw bassline",
    "FM Plastic bass thud",
    "Heavy modulated continuous sub-hum",
    "Arpeggiated retro acid 303 squelch",
    "Neuro-engineered growl bassline",
    "Warm acoustic Rhodes upright double-bass",
    "Detroit analog pulsing organ bass"
  ],
  synth: [
    "Uplifting epic super-saw chord stacks",
    "Drifting modular ambient pads",
    "Syncopated steel synth plucks",
    "Chipped lofi arpeggiated lead line",
    "Haunting reverse delays and reverb plucks",
    "Funky Rhodes organ stab progression",
    "Gothic digital industrial feedback saws"
  ],
  fx: [
    "White noise sweeps and sidechain pump",
    "Laser riser and granular crash echoes",
    "Heavy vinyl crackle and record spin effects",
    "Glitched micro-clicks and metallic ring-mods",
    "Industrial siren alerts and exhaust vents",
    "Tape echo pitch-sweep delays"
  ],
  vocal: [
    "No vocals (Purely Instrumental)",
    "Chopped reverbed female vocal harmonies",
    "Spoken-word dark philosophy robotic voice",
    "Soulful House pitch-bent phrases",
    "Heavy pitched battle shouts and hype counts",
    "Ethereal slow-speed singing pads"
  ]
};

// Complete Record Labels Catalog - Expanded with 40+ labels covering all electronic music genres
export const LABELS_DB: RecordLabel[] = [
  // === UNDERGROUND TECHNO & INDUSTRIAL LABELS ===
  {
    id: "subterranean_clicks",
    name: "Subterranean Clicks",
    description: "Crucial Berlin underground label specializing in deep hypnotic techno and raw industrial sound designs.",
    prestige: 15,
    preferredGenres: [MusicGenre.TECHNO, MusicGenre.INDUSTRIAL, MusicGenre.EXPERIMENTAL],
    royaltySplit: 0.40,
    signingAdvance: 200,
    requirements: { minFans: 300, minHype: 15, genreMatch: true },
    dealLength: 3,
  },
  {
    id: "detroit_machine_soul",
    name: "Detroit Machine Soul",
    description: "Historic Motor City label preserving the legacy of Juan Atkins and Derrick May with futuristic techno.",
    prestige: 35,
    preferredGenres: [MusicGenre.DETROIT_TECHNO, MusicGenre.TECHNO, MusicGenre.AMBIENT],
    royaltySplit: 0.45,
    signingAdvance: 1200,
    requirements: { minFans: 2500, minHype: 20, genreMatch: true },
    dealLength: 4,
  },
  {
    id: "minimal_wave_collective",
    name: "Minimal Wave Collective",
    description: "Repping Berlin's minimal scene with sparse percussive techno and hypnotic loops.",
    prestige: 28,
    preferredGenres: [MusicGenre.MINIMAL_TECHNO, MusicGenre.TECHNO, MusicGenre.EXPERIMENTAL],
    royaltySplit: 0.42,
    signingAdvance: 600,
    requirements: { minFans: 1800, minHype: 18, genreMatch: true },
    dealLength: 3,
  },
  {
    id: "schranz_werks_north",
    name: "Schranz Werks North",
    description: "Hard German techno powerhouse pounding the floors with relentless basslines.",
    prestige: 45,
    preferredGenres: [MusicGenre.SCHRANZ, MusicGenre.INDUSTRIAL, MusicGenre.HARDCORE],
    royaltySplit: 0.38,
    signingAdvance: 3000,
    requirements: { minFans: 6000, minHype: 35, genreMatch: true },
    dealLength: 2,
  },
  {
    id: "industrial_pulse",
    name: "Industrial Pulse",
    description: "Cyber-goth basement beats with metallic clangs and feedback sirens.",
    prestige: 32,
    preferredGenres: [MusicGenre.INDUSTRIAL, MusicGenre.EXPERIMENTAL, MusicGenre.TECHNO],
    royaltySplit: 0.44,
    signingAdvance: 800,
    requirements: { minFans: 2200, minHype: 22, genreMatch: true },
    dealLength: 3,
  },

  // === HOUSE LABELS ===
  {
    id: "neonlyt_outrun",
    name: "NeOnlyt Outrun",
    description: "Nostalgic retro indie label with synthwave aesthetics and sunset driving tracks.",
    prestige: 25,
    preferredGenres: [MusicGenre.SYNTHWAVE, MusicGenre.HOUSE, MusicGenre.AMBIENT],
    royaltySplit: 0.45,
    signingAdvance: 800,
    requirements: { minFans: 1500, minHype: 25, genreMatch: true },
    dealLength: 4,
  },
  {
    id: "deep_groove_foundations",
    name: "Deep Groove Foundations",
    description: "Chicago deep house institution with soulful vocals and warm Rhodes chords.",
    prestige: 38,
    preferredGenres: [MusicGenre.HOUSE, MusicGenre.DOWNTEMPO, MusicGenre.AMBIENT],
    royaltySplit: 0.48,
    signingAdvance: 2200,
    requirements: { minFans: 4500, minHype: 30, genreMatch: true },
    dealLength: 4,
  },
  {
    id: "progressive_sound_labs",
    name: "Progressive Sound Labs",
    description: "Building long-form journeys with evolving structures and emotional builds.",
    prestige: 42,
    preferredGenres: [MusicGenre.HOUSE, MusicGenre.TRANCE, MusicGenre.PROGRESSIVE_PSYTRANCE],
    royaltySplit: 0.46,
    signingAdvance: 3500,
    requirements: { minFans: 8000, minHype: 35, genreMatch: true },
    dealLength: 4,
  },
  {
    id: "tech_house_nexus",
    name: "Tech House Nexus",
    description: "Where techno meets house - functional grooves for modern dancefloors.",
    prestige: 30,
    preferredGenres: [MusicGenre.HOUSE, MusicGenre.TECHNO, MusicGenre.MINIMAL_TECHNO],
    royaltySplit: 0.43,
    signingAdvance: 1100,
    requirements: { minFans: 2800, minHype: 24, genreMatch: true },
    dealLength: 3,
  },
  {
    id: "funky_jackin_sessions",
    name: "Funky Jackin Sessions",
    description: "Classic jackin house grooves with swing-infused 4/4 beats.",
    prestige: 22,
    preferredGenres: [MusicGenre.HOUSE, MusicGenre.NU_SKOOL_BREAKS],
    royaltySplit: 0.50,
    signingAdvance: 500,
    requirements: { minFans: 1200, minHype: 16, genreMatch: true },
    dealLength: 3,
  },

  // === DRUM & BASS / JUNGLE LABELS ===
  {
    id: "breakbeat_syndicate",
    name: "Breakbeat Syndicate",
    description: "Legendary UK outlet for heavy breaks, jungle rollers, and dark stompers.",
    prestige: 40,
    preferredGenres: [MusicGenre.DRUM_AND_BASS, MusicGenre.DUBSTEP, MusicGenre.EXPERIMENTAL],
    royaltySplit: 0.50,
    signingAdvance: 2500,
    requirements: { minFans: 5000, minHype: 40, genreMatch: true },
    dealLength: 3,
  },
  {
    id: "neurofunk_engineering",
    name: "Neurofunk Engineering",
    description: "Technical D&B with complex bass design and surgical precision.",
    prestige: 48,
    preferredGenres: [MusicGenre.DRUM_AND_BASS, MusicGenre.EXPERIMENTAL],
    royaltySplit: 0.47,
    signingAdvance: 4200,
    requirements: { minFans: 10000, minHype: 45, genreMatch: true },
    dealLength: 3,
  },
  {
    id: "liquid_soundscape",
    name: "Liquid Soundscape",
    description: "Emotional rollers and atmospheric D&B for the soul.",
    prestige: 33,
    preferredGenres: [MusicGenre.DRUM_AND_BASS, MusicGenre.AMBIENT, MusicGenre.DOWNTEMPO],
    royaltySplit: 0.44,
    signingAdvance: 900,
    requirements: { minFans: 3500, minHype: 25, genreMatch: true },
    dealLength: 4,
  },
  {
    id: "jump_up_central",
    name: "Jump Up Central",
    description: "High-energy D&B with rolling basslines and crowd-igniting drops.",
    prestige: 26,
    preferredGenres: [MusicGenre.DRUM_AND_BASS, MusicGenre.HARDCORE],
    royaltySplit: 0.48,
    signingAdvance: 700,
    requirements: { minFans: 2000, minHype: 20, genreMatch: true },
    dealLength: 2,
  },

  // === DUBSTEP LABELS ===
  {
    id: "deep_dubstep_voltage",
    name: "Deep Dubstep Voltage",
    description: "Subterranean bass weight with minimal arrangements and maximum impact.",
    prestige: 35,
    preferredGenres: [MusicGenre.DUBSTEP, MusicGenre.DRUM_AND_BASS, MusicGenre.INDUSTRIAL],
    royaltySplit: 0.46,
    signingAdvance: 1500,
    requirements: { minFans: 4000, minHype: 28, genreMatch: true },
    dealLength: 3,
  },
  {
    id: "brostep_moshpit",
    name: "Brostep Moshpit",
    description: "Aggressive mid-range focus with wobbly bass and heavy dubstep aesthetics.",
    prestige: 20,
    preferredGenres: [MusicGenre.DUBSTEP, MusicGenre.HARDCORE],
    royaltySplit: 0.42,
    signingAdvance: 400,
    requirements: { minFans: 1000, minHype: 15, genreMatch: true },
    dealLength: 2,
  },

  // === TRANCE LABELS ===
  {
    id: "aurora_heavenly",
    name: "Aurora Heavenly",
    description: "Melodic publishing house for massive trance melodies and laser anthems.",
    prestige: 55,
    preferredGenres: [MusicGenre.TRANCE, MusicGenre.AMBIENT, MusicGenre.UPLIFTING_TRANCE],
    royaltySplit: 0.50,
    signingAdvance: 8000,
    requirements: { minFans: 12000, minHype: 50, genreMatch: true },
    dealLength: 4,
  },
  {
    id: "uplifting_horizon",
    name: "Uplifting Horizon",
    description: "Euphoric uplifting trance with soaring melodies and emotional breakdowns.",
    prestige: 52,
    preferredGenres: [MusicGenre.UPLIFTING_TRANCE, MusicGenre.TRANCE, MusicGenre.TECH_TRANCE],
    royaltySplit: 0.48,
    signingAdvance: 6500,
    requirements: { minFans: 10000, minHype: 45, genreMatch: true },
    dealLength: 4,
  },
  {
    id: "progressive_goa_journey",
    name: "Progressive Goa Journey",
    description: "Spiritual goa trance for psychedelic dancefloors and cosmic exploration.",
    prestige: 44,
    preferredGenres: [MusicGenre.GOA_TRANCE, MusicGenre.PROGRESSIVE_PSYTRANCE, MusicGenre.PSYTRANCE],
    royaltySplit: 0.46,
    signingAdvance: 2800,
    requirements: { minFans: 6500, minHype: 38, genreMatch: true },
    dealLength: 4,
  },
  {
    id: "dark_psy_forest",
    name: "Dark Psy Forest",
    description: "Hypnotic dark psytrance for nocturnal forest raves and deep trips.",
    prestige: 38,
    preferredGenres: [MusicGenre.DARK_PSY, MusicGenre.PSYTRANCE, MusicGenre.GOA_TRANCE],
    royaltySplit: 0.44,
    signingAdvance: 1800,
    requirements: { minFans: 4000, minHype: 32, genreMatch: true },
    dealLength: 3,
  },
  {
    id: "tech_trance_futures",
    name: "Tech Trance Futures",
    description: "When techno precision meets trance energy - driving and hypnotic.",
    prestige: 40,
    preferredGenres: [MusicGenre.TECH_TRANCE, MusicGenre.TRANCE, MusicGenre.SCHRANZ],
    royaltySplit: 0.45,
    signingAdvance: 3200,
    requirements: { minFans: 7000, minHype: 35, genreMatch: true },
    dealLength: 3,
  },
  {
    id: "suomisaundi_north",
    name: "Suomisaundi North",
    description: "Finnish psytrance with funky grooves, silly vocals, and retro game samples.",
    prestige: 36,
    preferredGenres: [MusicGenre.SUOMISAUNDI, MusicGenre.PSYTRANCE, MusicGenre.FULL_ON],
    royaltySplit: 0.43,
    signingAdvance: 1400,
    requirements: { minFans: 3500, minHype: 28, genreMatch: true },
    dealLength: 3,
  },

  // === HARDSTYLE & HARDCORE LABELS ===
  {
    id: "hardstyle_mainstage",
    name: "Hardstyle Mainstage",
    description: "Festival-ready hardstyle with euphoric leads and reverse bass kicks.",
    prestige: 58,
    preferredGenres: [MusicGenre.HARDSTYLE, MusicGenre.HARDCORE, MusicGenre.JUMPSTYLE],
    royaltySplit: 0.40,
    signingAdvance: 12000,
    requirements: { minFans: 18000, minHype: 55, genreMatch: true },
    dealLength: 4,
  },
  {
    id: "gabber_rotterdam_ultra",
    name: "Gabber Rotterdam Ultra",
    description: "Raw Rotterdam-style gabber with hoover kicks and distorted fury.",
    prestige: 30,
    preferredGenres: [MusicGenre.GABBER, MusicGenre.HARDCORE, MusicGenre.INDUSTRIAL],
    royaltySplit: 0.42,
    signingAdvance: 850,
    requirements: { minFans: 2500, minHype: 22, genreMatch: true },
    dealLength: 2,
  },
  {
    id: "frenchcore_extreme",
    name: "Frenchcore Extreme",
    description: "Ultra-fast Frenchcore with hardcore kicks and punk energy.",
    prestige: 25,
    preferredGenres: [MusicGenre.HARDCORE, MusicGenre.GABBER],
    royaltySplit: 0.45,
    signingAdvance: 400,
    requirements: { minFans: 1500, minHype: 18, genreMatch: true },
    dealLength: 2,
  },
  {
    id: "jumpstyle_revival",
    name: "Jumpstyle Revival",
    description: "Happy hardcore revival with bouncy beats and hakken energy.",
    prestige: 18,
    preferredGenres: [MusicGenre.JUMPSTYLE, MusicGenre.HARDSTYLE],
    royaltySplit: 0.48,
    signingAdvance: 250,
    requirements: { minFans: 800, minHype: 12, genreMatch: true },
    dealLength: 2,
  },

  // === AMBIENT & EXPERIMENTAL LABELS ===
  {
    id: "ambient_waves_institute",
    name: "Ambient Waves Institute",
    description: "Floating soundscapes for deep meditation and cosmic relaxation.",
    prestige: 20,
    preferredGenres: [MusicGenre.AMBIENT, MusicGenre.DOWNTEMPO, MusicGenre.EXPERIMENTAL],
    royaltySplit: 0.50,
    signingAdvance: 300,
    requirements: { minFans: 500, minHype: 10, genreMatch: true },
    dealLength: 4,
  },
  {
    id: "experimental_sound_lab",
    name: "Experimental Sound Lab",
    description: "Glitchy IDM and deconstructed club music for art galleries.",
    prestige: 28,
    preferredGenres: [MusicGenre.EXPERIMENTAL, MusicGenre.INDUSTRIAL, MusicGenre.AMBIENT],
    royaltySplit: 0.46,
    signingAdvance: 600,
    requirements: { minFans: 1800, minHype: 18, genreMatch: true },
    dealLength: 3,
  },
  {
    id: "chiptune_arcade",
    name: "Chiptune Arcade",
    description: "8-bit nostalgia with NES chips, Gameboy sounds, and pixel art vibes.",
    prestige: 15,
    preferredGenres: [MusicGenre.CHIPTUNE, MusicGenre.EXPERIMENTAL, MusicGenre.SYNTHWAVE],
    royaltySplit: 0.48,
    signingAdvance: 150,
    requirements: { minFans: 300, minHype: 8, genreMatch: true },
    dealLength: 3,
  },

  // === BREAKBEAT LABELS ===
  {
    id: "big_beat_revival",
    name: "Big Beat Revival",
    description: "90s-inspired breaks with live drums and cinematic breaks.",
    prestige: 24,
    preferredGenres: [MusicGenre.BIG_BEAT, MusicGenre.HOUSE, MusicGenre.NU_SKOOL_BREAKS],
    royaltySplit: 0.44,
    signingAdvance: 700,
    requirements: { minFans: 1800, minHype: 18, genreMatch: true },
    dealLength: 3,
  },
  {
    id: "breakcore_chaos",
    name: "Breakcore Chaos",
    description: "Ragga samples and fast breaks for chaotic dancefloors.",
    prestige: 22,
    preferredGenres: [MusicGenre.RAGGACORE, MusicGenre.HARDCORE, MusicGenre.EXPERIMENTAL],
    royaltySplit: 0.42,
    signingAdvance: 400,
    requirements: { minFans: 1200, minHype: 15, genreMatch: true },
    dealLength: 2,
  },

  // === ACID LABELS ===
  {
    id: "acid_house_classics",
    name: "Acid House Classics",
    description: "Chicago warehouse vibes with classic 303 acid squelch.",
    prestige: 26,
    preferredGenres: [MusicGenre.ACID_HOUSE, MusicGenre.HOUSE, MusicGenre.ACID_TRANCE],
    royaltySplit: 0.48,
    signingAdvance: 500,
    requirements: { minFans: 1500, minHype: 16, genreMatch: true },
    dealLength: 3,
  },

  // === FUTURE BASS & MODERN LABELS ===
  {
    id: "future_bass_neon",
    name: "Future Bass Neon",
    description: "Bright colors and candy aesthetics with pitch-bending drops.",
    prestige: 32,
    preferredGenres: [MusicGenre.FUTURE_BASS, MusicGenre.DUBSTEP, MusicGenre.HOUSE],
    royaltySplit: 0.44,
    signingAdvance: 1400,
    requirements: { minFans: 3500, minHype: 26, genreMatch: true },
    dealLength: 3,
  },
  {
    id: "uk_garage_house",
    name: "UK Garage House",
    description: "Two-step garage grooves and UK house with swing.",
    prestige: 28,
    preferredGenres: [MusicGenre.UK_GARAGE, MusicGenre.HOUSE, MusicGenre.DUBSTEP],
    royaltySplit: 0.46,
    signingAdvance: 900,
    requirements: { minFans: 2500, minHype: 22, genreMatch: true },
    dealLength: 3,
  },

  // === MAINSTAGE / COMMERCIAL LABELS ===
  {
    id: "vortex_records",
    name: "Vortex Mainstage",
    description: "Commercial powerhouse for festival EDM and crowd-pleasing hits.",
    prestige: 80,
    preferredGenres: [MusicGenre.HOUSE, MusicGenre.HARDSTYLE, MusicGenre.TRANCE, MusicGenre.FUTURE_BASS],
    royaltySplit: 0.35,
    signingAdvance: 35000,
    requirements: { minFans: 50000, minHype: 70, genreMatch: false },
    dealLength: 5,
  },
  {
    id: "edm_global_network",
    name: "EDM Global Network",
    description: "Worldwide EDM releases with massive marketing campaigns.",
    prestige: 75,
    preferredGenres: [MusicGenre.HARDSTYLE, MusicGenre.TRANCE, MusicGenre.HOUSE],
    royaltySplit: 0.32,
    signingAdvance: 28000,
    requirements: { minFans: 40000, minHype: 65, genreMatch: false },
    dealLength: 5,
  },
  {
    id: "electro_pop_futures",
    name: "Electro Pop Futures",
    description: "When electronic music meets mainstream pop appeal.",
    prestige: 60,
    preferredGenres: [MusicGenre.HOUSE, MusicGenre.FUTURE_BASS, MusicGenre.SYNTHWAVE],
    royaltySplit: 0.38,
    signingAdvance: 18000,
    requirements: { minFans: 25000, minHype: 55, genreMatch: false },
    dealLength: 4,
  },

  // === FULL ON / PROGRESSIVE PSYTRANCE ===
  {
    id: "full_on_sunrise",
    name: "Full On Sunrise",
    description: "Day-glo visuals and energetic psychedelic trance for festivals.",
    prestige: 40,
    preferredGenres: [MusicGenre.FULL_ON, MusicGenre.PROGRESSIVE_PSYTRANCE, MusicGenre.PSYTRANCE],
    royaltySplit: 0.44,
    signingAdvance: 2500,
    requirements: { minFans: 5500, minHype: 35, genreMatch: true },
    dealLength: 4,
  },
  {
    id: "psytrance_collectors",
    name: "Psytrance Collectors",
    description: "Premium psytrance releases for dedicated collectors and dancers.",
    prestige: 46,
    preferredGenres: [MusicGenre.PSYTRANCE, MusicGenre.PROGRESSIVE_PSYTRANCE, MusicGenre.GOA_TRANCE],
    royaltySplit: 0.48,
    signingAdvance: 3800,
    requirements: { minFans: 7500, minHype: 40, genreMatch: true },
    dealLength: 4,
  },
];

// Combined labels: base labels + extended JSON labels
export function getAllLabels(): RecordLabel[] {
  return [...LABELS_DB, ...getExtendedLabelsDB()];
}

export const WORLD_TRENDS: MusicTrend[] = [
  {
    id: "default",
    name: "Steady State Scene",
    description: "The electronic scene is stable. Club attendance is balanced across traditional subgenres.",
    hotGenre: MusicGenre.HOUSE,
    decayingGenre: MusicGenre.EXPERIMENTAL,
    hypeMultiplier: 1.0,
    durationMonths: 12,
    source: "Club Regularity",
  },
  {
    id: "berlin_revival",
    name: "145BPM Dark Warehouse Surge",
    description: "Dungeon aesthetics, industrial steel pipes, and fast-paced dark techno are sweeping through global TikTok streams.",
    hotGenre: MusicGenre.TECHNO,
    decayingGenre: MusicGenre.SYNTHWAVE,
    hypeMultiplier: 1.5,
    durationMonths: 4,
    source: "Viral Hype",
  },
  {
    id: "liquid_dnb_wave",
    name: "Liquid Rollers Sunsets",
    description: "Soulful vocals superimposed over 174BPM snappy breaks are playing at every sunny terrace and open-air event.",
    hotGenre: MusicGenre.DRUM_AND_BASS,
    decayingGenre: MusicGenre.DUBSTEP,
    hypeMultiplier: 1.45,
    durationMonths: 5,
    source: "Summer Anthems",
  },
  {
    id: "cyberpunk_outrun",
    name: "Outrun Synthwave Explosion",
    description: "Gamer streamers and cyberpunk movie releases have pushed detuned analog vintage patches into the mainstream spotlight.",
    hotGenre: MusicGenre.SYNTHWAVE,
    decayingGenre: MusicGenre.INDUSTRIAL,
    hypeMultiplier: 1.4,
    durationMonths: 6,
    source: "Cyber Cinema Syncs",
  },
  {
    id: "ambient_meditation",
    name: "Post-Burnout Chillout Sanctuary",
    description: "Exhausted by constant high-energy kicks, ravers are turning beatless modular environments and field recordings.",
    hotGenre: MusicGenre.AMBIENT,
    decayingGenre: MusicGenre.HARDSTYLE,
    hypeMultiplier: 1.35,
    durationMonths: 5,
    source: "Mental Wellness Movement",
  },
  {
    id: "hard_dance_renaissance",
    name: "Hardstyle Reverse-Bass Rush",
    description: "Gym workout viral playlists and European mainstage festivals are featuring distorted pitched hammer kicks.",
    hotGenre: MusicGenre.HARDSTYLE,
    decayingGenre: MusicGenre.AMBIENT,
    hypeMultiplier: 1.6,
    durationMonths: 4,
    source: "Raw Energy Overdrive",
  },
  // New trends for imported subgenres
  {
    id: "euphoric_trance_wave",
    name: "Epic Trance Anthem Revival",
    description: "Supersaw leads, epic buildups, and emotional melodies are dominating festival mainstages worldwide.",
    hotGenre: MusicGenre.UPLIFTING_TRANCE,
    decayingGenre: MusicGenre.MINIMAL_TECHNO,
    hypeMultiplier: 1.55,
    durationMonths: 5,
    source: "Festival Season Energy",
  },
  {
    id: "gabber_rotterdam_return",
    name: "Rotterdam Gabber Comeback",
    description: "The Dutch hardcore scene is experiencing a massive revival with hoover basslines and 180+ BPM distortions.",
    hotGenre: MusicGenre.GABBER,
    decayingGenre: MusicGenre.DOWNTEMPO,
    hypeMultiplier: 1.7,
    durationMonths: 4,
    source: "Nostalgia Wave",
  },
  {
    id: "acid_wave_303",
    name: "303 Acid Squelch Renaissance",
    description: "Classic TB-303 acid lines are making a comeback in both house and trance forms.",
    hotGenre: MusicGenre.ACID_HOUSE,
    decayingGenre: MusicGenre.NU_SKOOL_BREAKS,
    hypeMultiplier: 1.4,
    durationMonths: 6,
    source: "Classic Roland Vibes",
  },
  {
    id: "suomisaundi_finnish_psy",
    name: "Suomisaundi Global Expansion",
    description: "Finnish psychedelic trance with its unique silly vocals and retro game samples is gaining international traction.",
    hotGenre: MusicGenre.SUOMISAUNDI,
    decayingGenre: MusicGenre.HANDS_UP,
    hypeMultiplier: 1.45,
    durationMonths: 5,
    source: "Nordic Scene Export",
  },
  {
    id: "jumpstyle_party_hard",
    name: "Jumpstyle International Party",
    description: "The bouncy jumping style with happy hardcore influences is sweeping through European festivals.",
    hotGenre: MusicGenre.JUMPSTYLE,
    decayingGenre: MusicGenre.DETROIT_TECHNO,
    hypeMultiplier: 1.5,
    durationMonths: 4,
    source: "Party Hard Anthems",
  },
  {
    id: "psytrance_forest",
    name: "Dark Psy Forest Energy",
    description: "Dark psychedelic forest sounds with nocturnal hypnotic grooves are dominating night events.",
    hotGenre: MusicGenre.DARK_PSY,
    decayingGenre: MusicGenre.BIG_BEAT,
    hypeMultiplier: 1.35,
    durationMonths: 6,
    source: "Forest Rave Culture",
  }
];

export function rollNextTrend(currentTrendId: string): MusicTrend {
  const others = WORLD_TRENDS.filter(t => t.id !== currentTrendId && t.id !== "default");
  const chosen = others[Math.floor(Math.random() * others.length)];
  return chosen || WORLD_TRENDS[0];
}

// Math Formula: Calculate Composed Track Stats based on genres, gear, and player skills
export function composeTrack(
  title: string,
  primary: MusicGenre,
  secondary: MusicGenre | null,
  stems: Track["stems"],
  ownedGearIds: string[],
  playerSkills: { [key: string]: number },
  ideasSpent: number
): Track {
  const primaryDb = GENRES_DB[primary];
  const secondaryDb = secondary ? GENRES_DB[secondary] : null;

  // Try to get BPM from JSON database first for subgenres
  let bpm = primaryDb.bpmRange.default;
  let bpmMin = primaryDb.bpmRange.min;
  let bpmMax = primaryDb.bpmRange.max;
  
  // Look up more specific BPM range from JSON data for the primary genre
  const genreGenres = GENRES_DATA.Genrelist.Genre;
  const matchingGenre = genreGenres.find(g => {
    const subgenres = Array.isArray(g.Subgenre) ? g.Subgenre : [g.Subgenre];
    return subgenres.some(s => s["@name"] === primary);
  });
  
  if (matchingGenre) {
    const subgenres = Array.isArray(matchingGenre.Subgenre) ? matchingGenre.Subgenre : [matchingGenre.Subgenre];
    const matchingSubgenre = subgenres.find(s => s["@name"] === primary);
    if (matchingSubgenre?.BPM) {
      bpmMin = parseInt(matchingSubgenre.BPM.min, 10);
      bpmMax = parseInt(matchingSubgenre.BPM.max, 10);
      bpm = Math.floor((bpmMin + bpmMax) / 2);
    }
  }
  
  if (secondaryDb) {
    bpm = Math.round((bpm + secondaryDb.bpmRange.default) / 2);
  }

  let baseEnergy = primaryDb.defaultEnergy;
  let baseComplexity = primaryDb.defaultComplexity;
  let baseDance = primaryDb.danceability;

  if (secondaryDb) {
    baseEnergy = Math.round((baseEnergy + secondaryDb.defaultEnergy) / 2);
    baseComplexity = Math.round((baseComplexity + secondaryDb.defaultComplexity) / 2);
    baseDance = Math.round((baseDance + secondaryDb.danceability) / 2);
  }

  // Add random factors based on ideas spent (more inspiration spent, higher results)
  const complexityFactor = Math.min(100, baseComplexity + (stems.synth.length % 7) * 4);
  const experimentalFactor = secondary ? 40 + (ideasSpent * 6) : 10 + (ideasSpent * 3);

  // GEAR BONUSES (Aggregate all owned gear bonuses)
  // Core production stats
  let gearSoundDef = 10;
  let gearMixing = 5;
  let gearCatchiness = 10;
  let gearEnergy = 5;
  let gearGroove = 5;
  let gearOriginality = 5;
  let gearInspiration = 10;
  
  // Performance & DJ stats returned for use
  let gearDjUsability = 0;
  let gearHypeGeneration = 0;
  let gearGigQuality = 0;
  let gearGigPayBonus = 0;
  
  // Career & Business stats
  let gearLabelSigningBonus = 0;
  let gearStreamPerformance = 0;
  let gearViralPotential = 0;
  let gearFanSatisfaction = 0;
  
  // Quality of life
  let gearBurnoutReduction = 0;
  let gearMixPrecision = 0;
  let gearRecordingQuality = 0;

  ownedGearIds.forEach(gid => {
    const item = GEAR_DB.find(g => g.id === gid);
    if (item && item.statBonus) {
      // Core production
      if (item.statBonus.soundDesign) gearSoundDef += item.statBonus.soundDesign;
      if (item.statBonus.mixing) gearMixing += item.statBonus.mixing;
      if (item.statBonus.catchiness) gearCatchiness += item.statBonus.catchiness;
      if (item.statBonus.energy) gearEnergy += item.statBonus.energy;
      if (item.statBonus.groove) gearGroove += item.statBonus.groove;
      if (item.statBonus.originality) gearOriginality += item.statBonus.originality;
      if (item.statBonus.inspiration) gearInspiration += item.statBonus.inspiration;
      
      // Performance & DJ
      if (item.statBonus.djUsability) gearDjUsability += item.statBonus.djUsability;
      if (item.statBonus.hypeGeneration) gearHypeGeneration += item.statBonus.hypeGeneration;
      if (item.statBonus.gigQuality) gearGigQuality += item.statBonus.gigQuality;
      if (item.statBonus.gigPayBonus) gearGigPayBonus += item.statBonus.gigPayBonus;
      
      // Career & business
      if (item.statBonus.labelSigningBonus) gearLabelSigningBonus += item.statBonus.labelSigningBonus;
      if (item.statBonus.streamPerformance) gearStreamPerformance += item.statBonus.streamPerformance;
      if (item.statBonus.viralPotential) gearViralPotential += item.statBonus.viralPotential;
      if (item.statBonus.fanSatisfaction) gearFanSatisfaction += item.statBonus.fanSatisfaction;
      
      // Quality of life
      if (item.statBonus.burnoutReduction) gearBurnoutReduction += item.statBonus.burnoutReduction;
      if (item.statBonus.mixPrecision) gearMixPrecision += item.statBonus.mixPrecision;
      if (item.statBonus.recordingQuality) gearRecordingQuality += item.statBonus.recordingQuality;
    }
  });

  // SKILLS BONUSES
  const designSkill = playerSkills["sound_design"] || 1;
  const eqSkill = playerSkills["mixing_eq"] || 1;
  const samplingSkill = playerSkills["sampling"] || 1;
  const arrangeSkill = playerSkills["arrangement"] || 1;
  const limitSkill = playerSkills["limiting_compression"] || 1;

  // Track calculations
  const soundDesignScore = Math.min(100, Math.round(gearSoundDef * (1 + (designSkill - 1) * 0.15)));
  const mixingScore = Math.min(100, Math.round((gearMixing + (eqSkill * 10) + (limitSkill * 8) + gearMixPrecision)));
  const catchinessScore = Math.min(100, Math.round(gearCatchiness + (samplingSkill * 12) + (stems.vocal !== STEM_LOOPS.vocal[0] ? 15 : 0)));
  const grooveScore = Math.min(100, Math.round(gearGroove + (arrangeSkill * 8) + (primary === MusicGenre.HOUSE ? 20 : 0)));
  const originalityScore = Math.min(100, Math.round(gearOriginality + (designSkill * 5) + (secondary ? 25 : 0)));
  const inspirationMultiplier = 1 + (gearInspiration / 100);

  const stats: TrackStats = {
    bpm,
    energy: Math.min(100, Math.round(baseEnergy + (limitSkill * 5) + gearEnergy)),
    groove: grooveScore,
    soundDesign: soundDesignScore,
    mixingQuality: mixingScore,
    originality: originalityScore,
    catchiness: catchinessScore,
    emotionalTone: primary === MusicGenre.AMBIENT || primary === MusicGenre.TRANCE ? 75 : 30, // ambient/trance are warm, industrial/techno cold
    danceability: Math.min(100, Math.round(baseDance + (arrangeSkill * 4))),
    complexity: complexityFactor,
    experimentalFactor,
  };

  return {
    id: "track_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    title: title.trim() || generateRandomTrackName(primary, secondary),
    primaryGenre: primary,
    secondaryGenre: secondary,
    stats,
    composedAt: "Year 1, Month 1, Week 1", // Will be filled with state date
    stems,
    ideasSpent
  };
}

// Local procedurals for blog reviews
export function generateLocalReviews(track: Track, rating: number): string[] {
  const authorTitles = [
    "Underground Frequencies Blog",
    "Synth Depot Magazine",
    "RA Resident Critic",
    "Low End Theory Newsletter",
    "The Bedroom Audio Guild"
  ];
  
  const reviews: string[] = [];
  const count = Math.min(2, Math.floor(Math.random() * 2) + 1);

  for (let i = 0; i < count; i++) {
    const blogger = authorTitles[i % authorTitles.length];
    let template = "";

    if (rating >= 85) {
      template = `[${blogger}] "An absolute masterclass in ${track.primaryGenre}. The sound design (${track.stats.soundDesign}/100) is mindbogglingly crisp. That loop of ${track.stems.bass.split(" ")[0]} details is already playing across legendary warehouses."`;
    } else if (rating >= 65) {
      template = `[${blogger}] "A highly competent release. Solid grooves (${track.stats.groove}/100) and catchy filters. While it lacks extreme experimentation, it's highly danceable and will easily trigger crowd energy rings."`;
    } else if (rating >= 40) {
      template = `[${blogger}] "Decent bedroom composition. Unfortunately, the mixing (${track.stats.mixingQuality}/100) feels slightly muddy in the low frequency range, washing out the punchy beats. Worth a listen if you love raw underground grit."`;
    } else {
      template = `[${blogger}] "A promising draft but heavily flawed. The sound design is thin and the drum stems feel highly repetitive. Requires serious equipment upgrades or acoustic treatment."`;
    }
    reviews.push(template);
  }

  return reviews;
}

// Local procedural social tweets
export function generateLocalSocial(track: Track, rating: number): string[] {
  const handles = ["@TechnoPurist99", "@RaveKitty_x", "@HardwareGeek", "@Beatmaster_D", "@LFO_Lord", "@FestivalHypeKid"];
  const comments: string[] = [];
  const indices = [0, 1, 2, 3, 4, 5].sort(() => Math.random() - 0.5);

  const commentsCount = 4;
  for (let i = 0; i < commentsCount; i++) {
    const handle = handles[indices[i]];
    let text = "";

    if (rating >= 80) {
      const positiveTexts = [
        `this new track ${track.title} is an absolute banger! the bass sound is filthy 🔊🔥`,
        `OMG that build-up at the 1/3 mark in ${track.title} got me dancing in my room of blankets`,
        `Unreal sound design! Clearly utilizing Eurorack patching, respect.`,
        `Literally playing this on repeat for 4 hours. Absolute hypnosis.`
      ];
      text = positiveTexts[Math.floor(Math.random() * positiveTexts.length)];
    } else if (rating >= 50) {
      const midTexts = [
        `solid tune. nothing mindblowing but that 4-on-the-floor beat has a good swing to it`,
        `Not bad but could use a cleaner master. Still throwing this in my playlist.`,
        `a bit generic for ${track.primaryGenre} but the catchy stems are stuck in my head anyway haha`
      ];
      text = midTexts[Math.floor(Math.random() * midTexts.length)];
    } else {
      const lowTexts = [
        `is it just me or does the bass clip like crazy on small headphones? needs a better engine`,
        `sounds like it was written on a cracked DAW in 10 minutes, raw but boring`,
        `too messy. too many frequencies clashing together in the mid-range. back to bedroom tutorials bro`
      ];
      text = lowTexts[Math.floor(Math.random() * lowTexts.length)];
    }
    comments.push(`${handle}: ${text}`);
  }

  return comments;
}

// Release Track Calculation: Streaming, Sales, Fan Conversion
export function processRelease(
  track: Track,
  labelId: string | null,
  currentTrend: MusicTrend,
  gameState: GameState
): ReleasedTrack {
  const label = labelId ? LABELS_DB.find(l => l.id === labelId) : null;
  const primaryGenre = track.primaryGenre;
  
  // Base Hype Multipliers
  let genreTrendBoost = 1.0;
  if (currentTrend.hotGenre === primaryGenre) {
    genreTrendBoost = currentTrend.hypeMultiplier; // e.g. 1.5x Hype
  } else if (currentTrend.decayingGenre === primaryGenre) {
    genreTrendBoost = 0.8; // Cools down
  }

  // Calculate Overall Quality Score from metrics
  // Base average of mix + sound + catches + originality
  const baseQuality = (track.stats.mixingQuality + track.stats.soundDesign + track.stats.catchiness + track.stats.groove) / 4;
  
  // Marketing Bonuses from skills
  const promoSkill = gameState.skills["marketing_memes"] || 1;
  const marketingBoost = 1 + (promoSkill - 1) * 0.25;

  // Label Prestige Boosts
  const labelBoost = label ? (1 + label.prestige / 75) : 1.0;

  // Standard Initial Play Count (Influenced by current fans, label reach, and marketing)
  const baseReach = Math.max(50, gameState.stats.fans * 0.1) + (label ? label.prestige * 125 : 50);
  const playCount = Math.round(baseReach * (baseQuality / 55) * marketingBoost * genreTrendBoost * labelBoost);
  
  // Royalties Formula: Label Split vs. Independent
  // Self releases: $0.004 per stream. Labels: $0.008 per stream (increased reach/quality licensing) times label royaltySplit
  const ratePerStream = label ? 0.008 : 0.004;
  const rawRevenue = playCount * ratePerStream;
  const totalRoyaltiesEarned = label ? (rawRevenue * label.royaltySplit) : rawRevenue;

  // Hype Generation: 0-40 temporary hype boost
  const hypeBoost = Math.round((baseQuality / 2.5) * genreTrendBoost * (label ? 1.4 : 1.0));

  // Reviews & Comments
  const score = Math.round(baseQuality);
  const reviews = generateLocalReviews(track, score);
  const socialBuzz = generateLocalSocial(track, score);

  return {
    ...track,
    releaseId: "release_" + Date.now(),
    releaseDate: `Year ${gameState.gameDate.year}, Month ${gameState.gameDate.month}, Week ${gameState.gameDate.week}`,
    labelId,
    playCount,
    totalRoyaltiesEarned,
    hypeBoost,
    reviews,
    socialBuzz
  };
}
