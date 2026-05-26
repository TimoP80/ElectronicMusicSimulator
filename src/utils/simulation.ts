/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Track, TrackStats, MusicGenre, RecordLabel, MusicTrend, ReleasedTrack, GameState, EventLog, GearItem } from "../types";
import { GENRES_DB } from "../data/genres";
import { GEAR_DB } from "../data/gear";

// Procedural song naming components
const ADJECTIVES = ["Analog", "Digital", "Gated", "Subharmonic", "Rhythmic", "Modular", "Industrial", "Darkroom", "Sunset", "Glitched", "Liquid", "Heavy", "Midnight", "Eevolving", "Futuristic", "Saturated", "Unstable", "Resonant", "Hypnotic", "Acid", "Cosmic", "Warehouse", "Strobe", "Retro", "Spectral"];
const NOUNS = ["Dreams", "Protocol", "Rumble", "Sledgehammer", "Transit", "Siren", "Oscillator", "LFO", "Vibe", "Vapor", "Apocalypse", "Reverb", "Jungle", "Dunes", "Symmetry", "Delay", "Drums", "Algorithm", "Rave", "Frequency", "Hologram", "Horizon", "Ghost", "Circuit", "Echoes"];

export function generateRandomTrackName(primary: MusicGenre, secondary: MusicGenre | null): string {
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

  return `${adj} ${noun}`;
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

// Complete Record Labels Catalog
export const LABELS_DB: RecordLabel[] = [
  {
    id: "subterranean_clicks",
    name: "Subterranean Clicks",
    description: "Crucial Berlin underground label specializing in deep hypnotic techno and raw industrial sound designs.",
    prestige: 15,
    preferredGenres: [MusicGenre.TECHNO, MusicGenre.INDUSTRIAL, MusicGenre.EXPERIMENTAL],
    royaltySplit: 0.40, // Player gets 40%
    signingAdvance: 200,
    requirements: {
      minFans: 300,
      minHype: 15,
      genreMatch: true,
    },
    dealLength: 3,
  },
  {
    id: "neonlyt_outrun",
    name: "NeOnlyt Outrun",
    description: "An nostalgic retro indie label providing high speed synths, Outrun aesthetics, and sunset driving tracks.",
    prestige: 25,
    preferredGenres: [MusicGenre.SYNTHWAVE, MusicGenre.HOUSE, MusicGenre.AMBIENT],
    royaltySplit: 0.45,
    signingAdvance: 800,
    requirements: {
      minFans: 1500,
      minHype: 25,
      genreMatch: true,
    },
    dealLength: 4,
  },
  {
    id: "breakbeat_syndicate",
    name: "Breakbeat Syndicate",
    description: "Legendary United Kingdom outlet releasing heavy high-bpm breaks, jungle rollers, and dark dubstep stomps.",
    prestige: 40,
    preferredGenres: [MusicGenre.DRUM_AND_BASS, MusicGenre.DUBSTEP, MusicGenre.EXPERIMENTAL],
    royaltySplit: 0.50,
    signingAdvance: 2500,
    requirements: {
      minFans: 5000,
      minHype: 40,
      genreMatch: true,
    },
    dealLength: 3,
  },
  {
    id: "aurora_heavenly",
    name: "Aurora Heavenly",
    description: "Highly prestigious melodic publishing house for massive trance melodies, deep progressive, and epic laser anthems.",
    prestige: 55,
    preferredGenres: [MusicGenre.TRANCE, MusicGenre.AMBIENT],
    royaltySplit: 0.50,
    signingAdvance: 8000,
    requirements: {
      minFans: 12000,
      minHype: 50,
      genreMatch: true,
    },
    dealLength: 4,
  },
  {
    id: "vortex_records",
    name: "Vortex Mainstage",
    description: "An absolute commercial powerhouse releasing crowd-pleasing house, hardstyle kicks, and festival EDM hits worldwide.",
    prestige: 80,
    preferredGenres: [MusicGenre.HOUSE, MusicGenre.HARDSTYLE, MusicGenre.TRANCE],
    royaltySplit: 0.35, // Low split but crazy promo
    signingAdvance: 35000,
    requirements: {
      minFans: 50000,
      minHype: 70,
      genreMatch: false, // Signs anything if famous enough
    },
    dealLength: 5,
  }
];

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
    description: "Exhausted by constant high-energy kicks, ravers are turning to beatless modular environments and field recordings.",
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

  // Initialize base stats directly influenced by chosen genres balance
  let bpm = primaryDb.bpmRange.default;
  if (secondaryDb) {
    bpm = Math.round((primaryDb.bpmRange.default + secondaryDb.bpmRange.default) / 2);
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

  // GEAR BONUSES (Aggregate owned gear bonuses)
  let gearSoundDef = 10;
  let gearMixing = 5;
  let gearCatchiness = 10;

  ownedGearIds.forEach(gid => {
    const item = GEAR_DB.find(g => g.id === gid);
    if (item && item.statBonus) {
      if (item.statBonus.soundDesign) gearSoundDef += item.statBonus.soundDesign;
      if (item.statBonus.mixing) gearMixing += item.statBonus.mixing;
      if (item.statBonus.catchiness) gearCatchiness += item.statBonus.catchiness;
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
  const mixingScore = Math.min(100, Math.round((gearMixing + (eqSkill * 10) + (limitSkill * 8))));
  const catchinessScore = Math.min(100, Math.round(gearCatchiness + (samplingSkill * 12) + (stems.vocal !== STEM_LOOPS.vocal[0] ? 15 : 0)));
  const grooveScore = Math.min(100, Math.round(50 + (arrangeSkill * 8) + (primary === MusicGenre.HOUSE ? 20 : 0)));
  const originalityScore = Math.min(100, Math.round(30 + (designSkill * 5) + (secondary ? 25 : 0)));

  const stats: TrackStats = {
    bpm,
    energy: Math.min(100, Math.round(baseEnergy + (limitSkill * 5))),
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
