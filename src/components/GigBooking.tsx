/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  MapPin, Sparkles, Mic2, AlertTriangle, Play, HelpCircle, ChevronRight, 
  DollarSign, Users, Award, Zap, ShieldAlert, CloudRain, Flame, Sliders,
  Disc, Search, Trash2, ShoppingBag, Radio, Music, Plus, Layers, Laptop, 
  Settings, Check, Compass, MessageSquare, Volume2
} from "lucide-react";
import { GameState, CityData } from "../types";
import { CITIES_DB } from "../data/cities";

interface GigBookingProps {
  gameState: GameState;
  onCompleteGig: (earnings: number, fansGained: number, prestigeGained: number, burnoutAdded: number, gigCount: number) => void;
  onTravelToCity: (cityId: string, cost: number) => void;
  onSaveState?: (updated: GameState) => void;
  onBuyMusic?: (track: {
    id: string;
    title: string;
    artist: string;
    genre: string;
    bpm: number;
    key: string;
    energy: number;
    mood: string;
    popularity: number;
    credBonus: number;
    price: number;
    isVinyl?: boolean;
    condition?: string;
    releaseYear?: number;
  }) => void;
  difficultyMultiplier?: number; // For adjusting earnings based on difficulty
  difficultyFanMultiplier?: number; // For adjusting fan gains
  difficultyBurnoutMultiplier?: number; // For adjusting burnout rate
}

// DJ Equipment & upgrades available for the DJ Booth Setup
interface BoothUpgrade {
  id: string;
  name: string;
  cost: number;
  category: "players" | "mixers" | "effects" | "accessories";
  description: string;
  credBonus: number; // Underground credibility boost
  flowBonus: number; // Transition smoothness multiplier
  autoSync: boolean; // Enables CDJ match aid
  rarity: "Pro" | "Hobbyist" | "Legendary" | "Purist";
}

const BOOTH_UPGRADES: BoothUpgrade[] = [
  { id: "laptop_controller", name: "Hobbyist USB Controller", cost: 0, category: "players", description: "Standard starter deck with minor latency. No automated aid.", credBonus: 0, flowBonus: 0, autoSync: false, rarity: "Hobbyist" },
  { id: "cdj_3000", name: "Pioneer CDJ-3000 Nexus Pro Rig", cost: 1200, category: "players", description: "Industry standard digital CDJs. Unlocks Phase Beat Sync indicators.", credBonus: 10, flowBonus: 20, autoSync: true, rarity: "Pro" },
  { id: "sl1210", name: "Technics SL-1215 MK7 turntables", cost: 2400, category: "players", description: "Absolute purist dream. Massive prestige and underground value, but requires manual riding.", credBonus: 50, flowBonus: 10, autoSync: false, rarity: "Purist" },
  { id: "standard_mixer", name: "Pioneer DJM-900V10 Mixer", cost: 800, category: "mixers", description: "Robust 4-channel layout with standard EQ sweepers.", credBonus: 5, flowBonus: 5, autoSync: false, rarity: "Pro" },
  { id: "rotary_mixer", name: "Formula Sound x Isonoe Rotary Mixer", cost: 3500, category: "mixers", description: "Exquisite analog rotary. Crossover frequency isolators give buttery smooth blends.", credBonus: 60, flowBonus: 45, autoSync: false, rarity: "Purist" },
  { id: "delay_pedal", name: "Zen Delay Analog FX Unit", cost: 650, category: "effects", description: "Space delay with filter sweeps. Keeps crowd highly euphoric during build-ups.", credBonus: 20, flowBonus: 15, autoSync: false, rarity: "Legendary" },
  { id: "neon_feed", name: "Boiler Room Cam Neon Overlay Room", cost: 950, category: "accessories", description: "Drapes your stage in high-fidelity smoke, lasers, and live chat feed overlay.", credBonus: 25, flowBonus: 0, autoSync: false, rarity: "Legendary" }
];

// DJ Track metadata item representation
interface DjTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  bpm: number;
  key: string; // Camelot format (e.g., "8A", "9A", "8B", "11B")
  energy: number; // 1 to 5
  mood: "Dark" | "Warm" | "Euphoric" | "Hypnotic" | "Aggressive" | "Ethereal";
  popularity: number; // 0-100
  credBonus: number; // Underground credibility weight
  isVinyl: boolean;
  condition?: "Mint" | "VG+" | "VG" | "Good";
  price: number;
  overplayScore: number; // 0-100
  releaseYear: number;
}

// Procedural sound generators to keep crates endless
const TRACK_WORDS_ADJ = ["Deep", "Acid", "Modular", "Subsonic", "Lunar", "Warehouse", "Saturate", "Binary", "Cosmic", "Detroit", "Spectral", "Hypnotic", "Analog", "Resonant", "Lofi"];
const TRACK_WORDS_NOUN = ["Resonance", "Protocol", "Horizon", "Strobe", "Pulse", "Synthesizer", "Aether", "Cathedral", "Drift", "Decay", "Banger", "Frequencies", "Loophole", "Feedback"];
const ARTIST_NAMES = ["Strobe Vanguard", "Frequency Shifter", "Aether Architect", "Mod-Selector", "Hologram Kid", "Octave One-Two", "Silicon Soul", "Cyberia", "System D", "Lava Filter"];
const CAMELOT_KEYS = ["1A", "2A", "3A", "4A", "5A", "6A", "7A", "8A", "9A", "10A", "11A", "12A", "1B", "2B", "3B", "4B", "5B", "6B", "7B", "8B", "9B", "10B", "11B", "12B"];
const MUSIC_GENRES = ["Techno", "House", "Trance", "Drum & Bass", "Ambient", "Dubstep", "UK Garage", "Deep House", "Psytrance", "Synthwave"];

function generateProceduralTrack(forceVinyl = false): DjTrack {
  const isVinyl = forceVinyl || Math.random() > 0.6;
  const genre = MUSIC_GENRES[Math.floor(Math.random() * MUSIC_GENRES.length)];
  const bpm = genre === "Drum & Bass" ? 172 + Math.floor(Math.random() * 6)
            : genre === "Ambient" ? 80 + Math.floor(Math.random() * 20)
            : genre === "Techno" || genre === "Psytrance" ? 130 + Math.floor(Math.random() * 12)
            : 120 + Math.floor(Math.random() * 8);

  const title = `${TRACK_WORDS_ADJ[Math.floor(Math.random() * TRACK_WORDS_ADJ.length)]} ${TRACK_WORDS_NOUN[Math.floor(Math.random() * TRACK_WORDS_NOUN.length)]}`;
  const artist = ARTIST_NAMES[Math.floor(Math.random() * ARTIST_NAMES.length)];
  const key = CAMELOT_KEYS[Math.floor(Math.random() * CAMELOT_KEYS.length)];
  
  const conditions: ("Mint" | "VG+" | "VG" | "Good")[] = ["Mint", "VG+", "VG", "Good"];
  const cond = isVinyl ? conditions[Math.floor(Math.random() * conditions.length)] : undefined;
  
  const price = isVinyl 
    ? (cond === "Mint" ? 80 + Math.floor(Math.random() * 100) : 15 + Math.floor(Math.random() * 45))
    : 4.99 + Math.floor(Math.random() * 10);

  const ratingFactor = cond === "Mint" ? 1.5 : cond === "VG+" ? 1.2 : cond === "VG" ? 1.0 : 0.7;

  return {
    id: `track_${Math.random().toString(36).substring(2, 9)}`,
    title,
    artist,
    genre,
    bpm,
    key,
    energy: 1 + Math.floor(Math.random() * 5),
    mood: ["Dark", "Warm", "Euphoric", "Hypnotic", "Aggressive", "Ethereal"][Math.floor(Math.random() * 6)] as any,
    popularity: 20 + Math.floor(Math.random() * 75),
    credBonus: Math.round((isVinyl ? 25 : 5) * (ratingFactor || 1.0)),
    isVinyl,
    condition: cond,
    price: Math.round(price),
    overplayScore: Math.floor(Math.random() * 15),
    releaseYear: 1990 + Math.floor(Math.random() * 37)
  };
}

// Check key harmony through Camelot geometry (e.g. 8A to 8A, 9A, 7A, or 8B)
function areKeysHarmonicallyCompatible(k1: string, k2: string): boolean {
  if (!k1 || !k2) return false;
  if (k1 === k2) return true;
  
  const num1 = parseInt(k1);
  const letter1 = k1.replace(/[0-9]/g, "");
  const num2 = parseInt(k2);
  const letter2 = k2.replace(/[0-9]/g, "");

  if (isNaN(num1) || isNaN(num2)) return false;

  if (letter1 === letter2) {
    const diff = Math.abs(num1 - num2);
    return diff === 1 || diff === 11; // 12 is adjacent to 1
  }
  if (num1 === num2 && letter1 !== letter2) {
    return true;
  }
  return false;
}

// Initial library filler tracks
const INITIAL_LIBRARY: DjTrack[] = [
  { id: "init_1", title: "Midnight Solenoid", artist: "Modular System", genre: "Techno", bpm: 128, key: "8A", energy: 3, mood: "Dark", popularity: 55, credBonus: 10, isVinyl: false, price: 0, overplayScore: 0, releaseYear: 2024 },
  { id: "init_2", title: "Saturate Dusk", artist: "Hologram Kid", genre: "House", bpm: 124, key: "9A", energy: 2, mood: "Warm", popularity: 65, credBonus: 8, isVinyl: false, price: 0, overplayScore: 0, releaseYear: 2025 },
  { id: "init_3", title: "Resonant Dust", artist: "Silicon Soul", genre: "Ambient", bpm: 95, key: "8B", energy: 1, mood: "Ethereal", popularity: 40, credBonus: 15, isVinyl: true, condition: "VG+", price: 35, overplayScore: 0, releaseYear: 2018 },
  { id: "init_4", title: "Cyberia Breakbeat", artist: "Strobe Vanguard", genre: "UK Garage", bpm: 132, key: "7A", energy: 4, mood: "Euphoric", popularity: 75, credBonus: 12, isVinyl: false, price: 0, overplayScore: 0, releaseYear: 2026 }
];

export default function GigBooking({ gameState, onCompleteGig, onTravelToCity, onSaveState, onBuyMusic, difficultyMultiplier = 1, difficultyFanMultiplier = 1, difficultyBurnoutMultiplier = 1 }: GigBookingProps) {
  // Main screen routing tab state
  const [activeTab, setActiveTab] = useState<"gigs" | "stores" | "library" | "booth" | "feed">("gigs");
  
  // Persistence container for DJ Simulator metrics (keyed specific to current producer)
  const PROFILE_STORAGE_KEY = `beatmaker_dj_profile_v2_${gameState.pseudonym || "default"}`;
  
  const [djLibrary, setDjLibrary] = useState<DjTrack[]>(INITIAL_LIBRARY);
  const [crates, setCrates] = useState<{ [crateName: string]: string[] }>({
    "Peak Time Bangers": ["init_1", "init_4"],
    "Warm-Up Grooves": ["init_2"],
    "Underground Secret Stash": ["init_3"]
  });
  const [selectedCrate, setSelectedCrate] = useState<string>("Peak Time Bangers");
  const [ownedUpgrades, setOwnedUpgrades] = useState<string[]>(["laptop_controller", "standard_mixer"]);
  const [equippedUpgrades, setEquippedUpgrades] = useState<{ [cat: string]: string }>({
    players: "laptop_controller",
    mixers: "standard_mixer",
    effects: "",
    accessories: ""
  });
  
  const [signatureScore, setSignatureScore] = useState<number>(100); // 0-1000 DJ prestige gauge
  const [lastPerformanceReport, setLastPerformanceReport] = useState<string | null>(null);

  // Load and recover DJ stats from persistence
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.djLibrary) setDjLibrary(parsed.djLibrary);
        if (parsed.crates) setCrates(parsed.crates);
        if (parsed.ownedUpgrades) setOwnedUpgrades(parsed.ownedUpgrades);
        if (parsed.equippedUpgrades) setEquippedUpgrades(parsed.equippedUpgrades);
        if (parsed.signatureScore) setSignatureScore(parsed.signatureScore);
        if (parsed.lastPerformanceReport) setLastPerformanceReport(parsed.lastPerformanceReport);
      }
    } catch (e) {
      console.error("DJ persist retrieve failed:", e);
    }
  }, [PROFILE_STORAGE_KEY]);

  // Sync purchased music from global game state into local DJ library
  useEffect(() => {
    if (gameState?.purchasedMusic && gameState.purchasedMusic.length > 0) {
      const purchasedTracks: DjTrack[] = gameState.purchasedMusic.map(p => ({
        id: p.id,
        title: p.title,
        artist: p.artist,
        genre: p.genre,
        bpm: p.bpm,
        key: p.key,
        energy: p.energy,
        mood: p.mood as DjTrack["mood"],
        popularity: p.popularity,
        credBonus: p.credBonus,
        price: p.price,
        isVinyl: p.isVinyl || false,
        condition: p.condition as "Mint" | "VG+" | "VG" | "Good" | undefined,
        releaseYear: p.releaseYear || 2024,
        overplayScore: 0
      }));
      
      setDjLibrary(prev => {
        // Merge purchased tracks, avoiding duplicates
        const existingIds = new Set(prev.map(t => t.id));
        const newTracks = purchasedTracks.filter(t => !existingIds.has(t.id));
        if (newTracks.length === 0) return prev;
        return [...prev, ...newTracks];
      });
    }
  }, [gameState?.purchasedMusic]);

  // Synchronize state variations locally
  const writeDjLocalState = (lib: DjTrack[], cr: typeof crates, ou: string[], eq: typeof equippedUpgrades, rPoints: number, report: string | null) => {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({
        djLibrary: lib,
        crates: cr,
        ownedUpgrades: ou,
        equippedUpgrades: eq,
        signatureScore: rPoints,
        lastPerformanceReport: report
      }));
    } catch (e) {
      console.error("DJ local storage save failed:", e);
    }
  };

  // 🏪 STORES & DISCOGRAPHY ACQUISITIONS STATE
  const [digitalStoreTracks, setDigitalStoreTracks] = useState<DjTrack[]>([]);
  const [vinylStoreTracks, setVinylStoreTracks] = useState<DjTrack[]>([]);
  const [undergroundPromos, setUndergroundPromos] = useState<DjTrack[]>([]);
  const [activeDiggerCardIdx, setActiveDiggerCardIdx] = useState<number>(0);
  const [storeSearchingQuery, setStoreSearchingQuery] = useState("");
  const [storeActiveGenre, setStoreActiveGenre] = useState<string>("All");

  useEffect(() => {
    // Generate fresh releases across stores
    const dPool = Array.from({ length: 8 }, () => generateProceduralTrack(false));
    const vPool = Array.from({ length: 6 }, () => generateProceduralTrack(true));
    const uPool = Array.from({ length: 4 }, () => {
      const p = generateProceduralTrack(Math.random() > 0.5);
      p.price = Math.round(p.price * 1.5);
      p.credBonus = Math.round(p.credBonus * 2.0);
      p.popularity = Math.floor(Math.random() * 20); // Very underground!
      return p;
    });
    setDigitalStoreTracks(dPool);
    setVinylStoreTracks(vPool);
    setUndergroundPromos(uPool);
  }, [gameState.completedGigsCount]);

  const refreshMarketStock = () => {
    const dPool = Array.from({ length: 8 }, () => generateProceduralTrack(false));
    const vPool = Array.from({ length: 6 }, () => generateProceduralTrack(true));
    const uPool = Array.from({ length: 4 }, () => {
      const p = generateProceduralTrack(Math.random() > 0.5);
      p.price = Math.round(p.price * 1.5);
      p.credBonus = Math.round(p.credBonus * 2.0);
      p.popularity = Math.floor(Math.random() * 20);
      return p;
    });
    setDigitalStoreTracks(dPool);
    setVinylStoreTracks(vPool);
    setUndergroundPromos(uPool);
    setActiveDiggerCardIdx(0);
  };

  const buyMusicTrack = (track: DjTrack, source: "digital" | "vinyl" | "underground") => {
    if (gameState.stats.money < track.price) {
      alert("In-game liquidity is too low! Produce bedroom beats to gather gig advances or label split money.");
      return;
    }

    // Call onBuyMusic to update global game state (persisted across sessions)
    if (onBuyMusic) {
      onBuyMusic({
        id: track.id,
        title: track.title,
        artist: track.artist,
        genre: track.genre,
        bpm: track.bpm,
        key: track.key,
        energy: track.energy,
        mood: track.mood,
        popularity: track.popularity,
        credBonus: track.credBonus,
        price: track.price,
        isVinyl: track.isVinyl,
        condition: track.condition,
        releaseYear: track.releaseYear
      });
    }
    
    // Deduct player money directly from state
    if (onSaveState) {
      const fee = track.price;
      const nextGame: GameState = {
        ...gameState,
        stats: {
          ...gameState.stats,
          money: Math.max(0, gameState.stats.money - fee)
        },
        log: [
          ...gameState.log,
          {
            id: `purchase_${Date.now()}`,
            date: `Yr ${gameState.gameDate?.year || 1} M ${gameState.gameDate?.month || 1} W ${gameState.gameDate?.week || 1}`,
            type: "system",
            title: `Purchased '${track.title}'`,
            description: `Paid $${fee} to include this ${track.isVinyl ? "obscure Vinyl" : "Digital EP"} into your active DJ library.`
          }
        ]
      };
      onSaveState(nextGame);
    }

    // Add to library
    const updatedLib = [...djLibrary, track];
    setDjLibrary(updatedLib);

    // Save item inside default crate: "Underground Secret Stash"
    const nextCrates = { ...crates };
    nextCrates["Underground Secret Stash"] = [...(nextCrates["Underground Secret Stash"] || []), track.id];
    setCrates(nextCrates);

    // Filter store listings
    if (source === "digital") {
      setDigitalStoreTracks(digitalStoreTracks.filter(t => t.id !== track.id));
    } else if (source === "vinyl") {
      setVinylStoreTracks(vinylStoreTracks.filter(t => t.id !== track.id));
      setActiveDiggerCardIdx(0);
    } else {
      setUndergroundPromos(undergroundPromos.filter(t => t.id !== track.id));
    }

    const addedCred = track.credBonus || 5;
    const nextSignature = Math.min(1000, signatureScore + addedCred);
    setSignatureScore(nextSignature);

    writeDjLocalState(updatedLib, nextCrates, ownedUpgrades, equippedUpgrades, nextSignature, lastPerformanceReport);
  };

  // 📁 LIBRARY CREATION STATE
  const [newCrateName, setNewCrateName] = useState("");
  const [libFilterGenre, setLibFilterGenre] = useState("All");
  const [libSortBy, setLibSortBy] = useState<"bpm" | "title" | "key">("title");

  const buildCustomCrate = () => {
    if (!newCrateName.trim()) return;
    const clean = newCrateName.trim();
    if (crates[clean]) {
      alert("A crate with that name already exists!");
      return;
    }
    const nextC = { ...crates, [clean]: [] };
    setCrates(nextC);
    setSelectedCrate(clean);
    setNewCrateName("");
    writeDjLocalState(djLibrary, nextC, ownedUpgrades, equippedUpgrades, signatureScore, lastPerformanceReport);
  };

  const toggleTrackInCrate = (trackId: string, crName: string) => {
    const list = crates[crName] || [];
    let nextList: string[];
    if (list.includes(trackId)) {
      nextList = list.filter(id => id !== trackId);
    } else {
      nextList = [...list, trackId];
    }
    const nextCrates = {
      ...crates,
      [crName]: nextList
    };
    setCrates(nextCrates);
    writeDjLocalState(djLibrary, nextCrates, ownedUpgrades, equippedUpgrades, signatureScore, lastPerformanceReport);
  };

  const deleteCrate = (crName: string) => {
    if (crName === "Underground Secret Stash") return; // Keep at least one fallback
    const nextC = { ...crates };
    delete nextC[crName];
    setCrates(nextC);
    const keys = Object.keys(nextC);
    setSelectedCrate(keys[0] || "Underground Secret Stash");
    writeDjLocalState(djLibrary, nextC, ownedUpgrades, equippedUpgrades, signatureScore, lastPerformanceReport);
  };

  // 🎛️ SHOP DESIGNS SETUP
  const buyBoothRig = (upgrade: BoothUpgrade) => {
    if (gameState.stats.money < upgrade.cost) {
      alert("Insufficient capital. Earn funds at clubs first!");
      return;
    }

    if (onSaveState) {
      onSaveState({
        ...gameState,
        stats: {
          ...gameState.stats,
          money: gameState.stats.money - upgrade.cost
        }
      });
    }

    const nextOwned = [...ownedUpgrades, upgrade.id];
    setOwnedUpgrades(nextOwned);
    
    // Auto equip
    const nextEquip = { ...equippedUpgrades, [upgrade.category]: upgrade.id };
    setEquippedUpgrades(nextEquip);

    const nextSign = Math.min(1000, signatureScore + upgrade.credBonus);
    setSignatureScore(nextSign);

    writeDjLocalState(djLibrary, crates, nextOwned, nextEquip, nextSign, lastPerformanceReport);
  };

  const equipBoothRig = (upgrade: BoothUpgrade) => {
    const nextEquip = { ...equippedUpgrades, [upgrade.category]: upgrade.id };
    setEquippedUpgrades(nextEquip);
    writeDjLocalState(djLibrary, crates, ownedUpgrades, nextEquip, signatureScore, lastPerformanceReport);
  };

  // 🎪 GIG SELECTION & DOUBLE PERFORMANCE DECK SIMULATOR STAGES
  const [selectedCityObj, setSelectedCityObj] = useState<CityData>(CITIES_DB[0]);
  const [activeVenueToPlay, setActiveVenueToPlay] = useState<any | null>(null);
  
  // Real performance simulator state
  const [isPerforming, setIsPerforming] = useState(false);
  const [crowdExcitement, setCrowdExcitement] = useState<number>(60);
  const [timeLeft, setTimeLeft] = useState(30);
  const [cumulativeSetScore, setCumulativeSetScore] = useState(0);
  
  // Simulated Decks
  const [deckATrack, setDeckATrack] = useState<DjTrack | null>(null);
  const [deckBTrack, setDeckBTrack] = useState<DjTrack | null>(null);
  
  const [deckAPlay, setDeckAPlay] = useState(false);
  const [deckBPlay, setDeckBPlay] = useState(false);
  
  const [deckABpm, setDeckABpm] = useState(125);
  const [deckBBpm, setDeckBBpm] = useState(125);
  
  const [deckAPitch, setDeckAPitch] = useState(0); // -10 to +10%
  const [deckBPitch, setDeckBPitch] = useState(0);

  // EQ Rotaries (0 to 100)
  const [deckAEqs, setDeckAEqs] = useState({ hi: 100, mid: 100, low: 100, filter: 50 });
  const [deckBEqs, setDeckBEqs] = useState({ hi: 100, mid: 100, low: 100, filter: 50 });
  
  // 0 is all Left (Deck A), 50 is center (split), 100 is all Right (Deck B)
  const [crossfader, setCrossfader] = useState(0); 

  // Direct active player selection pointer
  const [focusDeck, setFocusDeck] = useState<"A" | "B">("A");

  // Live Scrolling Chat Log Feed
  const [raveComments, setRaveComments] = useState<string[]>([
    "🎉 Massive crowd waiting for the opening selector!",
    "💬 Drop a proper track to lift the smoke machine aura."
  ]);

  // Sudden booth hazards
  const [activeHazard, setActiveHazard] = useState<{
    id: string;
    msg: string;
    actionType: "beat_nudge" | "eq_kill" | "calm_down" | "filter_sweep";
    timeLimit: number;
  } | null>(null);

  useEffect(() => {
    const current = CITIES_DB.find(c => c.id === gameState.currentCityId);
    if (current) setSelectedCityObj(current);
  }, [gameState.currentCityId]);

  // Core live DJ simulation frame tick loop
  useEffect(() => {
    if (!isPerforming) return;

    const gameTick = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          concludeSetSession();
          return 0;
        }
        return prev - 1;
      });

      // Periodic comment feedback & scoring engine
      setCumulativeSetScore(score => {
        let tickScore = 0;
        
        const isASilent = crossfader === 100;
        const isBSilent = crossfader === 0;

        // Is sound coming out?
        if ((!deckAPlay && !isASilent) || (!deckBPlay && !isBSilent)) {
          // Negative feedback: playing track is paused with fader open!
          tickScore = Math.max(0, tickScore - 5);
          setCrowdExcitement(e => Math.max(10, e - 4));
          if (Math.random() > 0.7) {
            pushRaveComment("❌ Boo! Silence on the dancefloor. Fader is open!");
          }
        } else {
          // Check track selection compatibility and physical sync if crossfaded in the middle
          const blendingBoth = crossfader > 15 && crossfader < 85;
          if (blendingBoth && deckATrack && deckBTrack) {
            // Check BPM variance
            const bpmMargin = Math.abs(deckABpm - deckBBpm);
            const eqBassOverlap = deckAEqs.low > 50 && deckBEqs.low > 50;
            const keysAreHarmonic = areKeysHarmonicallyCompatible(deckATrack.key, deckBTrack.key);

            if (bpmMargin > 0.8) {
              tickScore += 2;
              setCrowdExcitement(e => Math.max(10, e - 2));
              if (Math.random() > 0.85) {
                pushRaveComment("🚨 Traaaainwreck! Track rhythms are drifting out of phase!");
              }
            } else {
              // Perfect BPM alignment
              tickScore += 8;
              setCrowdExcitement(e => Math.min(100, e + 1));
            }

            if (eqBassOverlap) {
              tickScore -= 3;
              setCrowdExcitement(e => Math.max(10, e - 1));
              if (Math.random() > 0.9) {
                pushRaveComment("👂 Way too muddy! Cut the low-end bass on one deck!");
              }
            } else {
              tickScore += 6;
            }

            if (keysAreHarmonic) {
              tickScore += 12;
              setCrowdExcitement(e => Math.min(100, e + 2));
              if (Math.random() > 0.92) {
                pushRaveComment("✨ Butter! These melodies are in perfect key lock (Harmonic blend)!");
              }
            }
          } else {
            // Playing solo deck smoothly
            const mainDeck = crossfader < 40 ? deckATrack : deckBTrack;
            if (mainDeck) {
              tickScore += 5;
              // Check overplay
              if (mainDeck.overplayScore > 40) {
                setCrowdExcitement(e => Math.max(10, e - 0.5));
                if (Math.random() > 0.95) pushRaveComment("🙄 This anthem is kinda overplayed, honestly.");
              }
            }
          }
        }

        // Trigger spontaneous crowd incidents
        if (Math.random() > 0.93 && !activeHazard) {
          triggerRandomBoothIncident();
        }

        return score + tickScore;
      });

      // Tick down active warning hazard
      if (activeHazard) {
        setActiveHazard(h => {
          if (!h) return null;
          if (h.timeLimit <= 1) {
            // Penalty hit! Hazard expired unresolved
            setCrowdExcitement(exc => Math.max(5, exc - 20));
            pushRaveComment(`🚨 Curfew / Fail penalty: unresolved booth problem: ${h.msg}`);
            return null;
          }
          return { ...h, timeLimit: h.timeLimit - 1 };
        });
      }

    }, 1000);

    return () => clearInterval(gameTick);
  }, [isPerforming, deckATrack, deckBTrack, deckAPlay, deckBPlay, deckABpm, deckBBpm, crossfader, deckAEqs, deckBEqs, activeHazard]);

  const pushRaveComment = (txt: string) => {
    setRaveComments(prev => [txt, ...prev.slice(0, 7)]);
  };

  const triggerRandomBoothIncident = () => {
    const events: { msg: string; type: "beat_nudge" | "eq_kill" | "calm_down" | "filter_sweep" }[] = [
      { msg: "⚠️ CDJ platter link cable loose! Tap MANUALLY NUDGE to realign the magnetic spindle!", type: "beat_nudge" },
      { msg: "⚠️ Feedback loop in the sub-bass channels! Swipe focused LOW-EQ down immediately!", type: "eq_kill" },
      { msg: "⚠️ A drink-spill request! Aggressive raver begs for 'Commercial Bass' - tap REFUSE politely!", type: "calm_down" },
      { msg: "⚠️ Smoke machine has overheated! Trigger a High-Pass tension FILTER SWEEP on Deck!", type: "filter_sweep" }
    ];
    const picked = events[Math.floor(Math.random() * events.length)];
    setActiveHazard({
      id: `hz_${Date.now()}`,
      msg: picked.msg,
      actionType: picked.type,
      timeLimit: 6
    });
  };

  const resolveHazardManual = (actionType: typeof activeHazard extends { actionType: infer T } ? T : any) => {
    if (!activeHazard) return;
    if (activeHazard.actionType === actionType) {
      setCrowdExcitement(e => Math.min(100, e + 15));
      setCumulativeSetScore(s => s + 100);
      pushRaveComment("💚 Success! Saved the booth mix with professional gear correction!");
      setActiveHazard(null);
    } else {
      setCrowdExcitement(e => Math.max(5, e - 8));
      pushRaveComment("❌ Wrong response control! The crowd cringed.");
    }
  };

  const selectGigPerformance = (venue: any) => {
    if (gameState.stats.burnout >= 90) {
      alert("Extreme Burnout! Recoup energy parameters inside the Bedroom Studio before DJ headlining.");
      return;
    }
    setActiveVenueToPlay(venue);
    
    // Auto-load 2 tracks to help the player start immediately
    const crateListIds = crates[selectedCrate] || [];
    const validTracks = djLibrary.filter(t => crateListIds.includes(t.id));
    
    setDeckATrack(validTracks[0] || djLibrary[0] || null);
    setDeckBTrack(validTracks[1] || djLibrary[1] || null);
    
    setDeckABpm(validTracks[0]?.bpm || 125);
    setDeckBBpm(validTracks[1]?.bpm || 125);
    
    setDeckAPlay(false);
    setDeckBPlay(false);
    setCrossfader(0);
    setCrowdExcitement(65);
    setCumulativeSetScore(0);
    setTimeLeft(40);
    setIsPerforming(true);
    setRaveComments([
      "🔊 Soundcheck cleared. Headliner is standing in the smoky neon light booth...",
      `⚡ Crowd vibe matches city mood: ${selectedCityObj.vibe}`
    ]);
  };

  const concludeSetSession = () => {
    setIsPerforming(false);

    const bonusSkills = (gameState.skills["dj_eq_mixing"] || 1);
    const bonusLights = (gameState.skills["audiovisual_integration"] || 1);

    const excitementMultiplier = crowdExcitement / 50; 
    const finalEarnings = Math.round(activeVenueToPlay.payout * excitementMultiplier * (1 + (bonusSkills - 1) * 0.1) * difficultyMultiplier);
    const finalFans = Math.round((activeVenueToPlay.capacity * 0.12) * excitementMultiplier * (1 + gameState.stats.hype / 150) * difficultyFanMultiplier);
    const finalPrestige = Math.round(activeVenueToPlay.relevance * 0.35 * (1 + (bonusLights - 1) * 0.15));
    const burnoutAdded = Math.max(8, Math.round((18 - bonusSkills) * difficultyBurnoutMultiplier));

    // Compile report card
    const styleString = signatureScore > 400 ? "Underground Vinyl Selector" 
                      : signatureScore > 250 ? "Techno Purist Guru" 
                      : "Open-format DJ";

    const feedbackReport = `Legendary gig at ${activeVenueToPlay.name}! Successfully maintained a dynamic ${Math.round(crowdExcitement)}% crowd chemical lock. High frequency EQ switches demonstrated pristine ${styleString} aesthetics. Earned $${finalEarnings} and added ${finalFans} new fans onto the record board!`;

    setLastPerformanceReport(feedbackReport);
    writeDjLocalState(djLibrary, crates, ownedUpgrades, equippedUpgrades, signatureScore, feedbackReport);

    onCompleteGig(finalEarnings, finalFans, finalPrestige, burnoutAdded, 1);
    setActiveVenueToPlay(null);
  };

  // Sync pitch with deck bpms
  const handlePitchAdjust = (deck: "A" | "B", percentage: number) => {
    if (deck === "A") {
      setDeckAPitch(percentage);
      if (deckATrack) setDeckABpm(Math.round(deckATrack.bpm * (1 + percentage / 100) * 10) / 10);
    } else {
      setDeckBPitch(percentage);
      if (deckBTrack) setDeckBBpm(Math.round(deckBTrack.bpm * (1 + percentage / 100) * 10) / 10);
    }
  };

  const equipTrackOnActiveSelectedDeck = (tk: DjTrack) => {
    if (focusDeck === "A") {
      setDeckATrack(tk);
      setDeckABpm(tk.bpm);
      setDeckAPitch(0);
      pushRaveComment(`💿 Selected & Loaded ${tk.title} onto Deck A.`);
    } else {
      setDeckBTrack(tk);
      setDeckBBpm(tk.bpm);
      setDeckBPitch(0);
      pushRaveComment(`💿 Selected & Loaded ${tk.title} onto Deck B.`);
    }
  };

  return (
    <div id="booking_view" className="space-y-6">
      
      {/* 🎪 CORE PERFORMING LAYER DIALOG OVERLAY */}
      {isPerforming && activeVenueToPlay && (
        <div className="bg-[#09090C] border border-[#1d1d25] rounded-3xl p-6 relative overflow-hidden flex flex-col items-center select-none shadow-2xl z-40 neon-border max-w-5xl mx-auto">
          {/* Neon strobe effect ambient block */}
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none transition-all duration-300">
            <div className={`w-full h-full bg-[radial-gradient(circle_at_center,rgba(0,255,149,0.3)_0,transparent_75%)] ${deckAPlay || deckBPlay ? "animate-pulse" : ""}`} />
          </div>

          <div className="w-full relative z-10 space-y-6">
            
            {/* Header dashboard widgets */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-[#050507]/80 backdrop-blur border border-[#1A1A1E] px-4 py-3.5 rounded-2xl gap-3">
              <div>
                <span className="font-mono text-[#00FF95] text-[10px] font-bold uppercase tracking-widest">{activeVenueToPlay.name} &mdash; Stage Controls</span>
                <h3 className="text-sm font-display font-black text-white flex items-center gap-2 uppercase">
                  <Mic2 className="h-4 w-4 text-[#FF00FF] animate-bounce" /> Live Performance Stage Set
                </h3>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <span className="block text-[8px] font-mono text-slate-500 uppercase">Energy Excitement</span>
                  <div className="flex items-center gap-1.5 justify-center">
                    <Flame className="h-4 'w-4' text-amber-400" />
                    <span className="text-sm font-bold font-mono text-white">{Math.round(crowdExcitement)}%</span>
                  </div>
                </div>
                <div className="text-center font-mono">
                  <span className="block text-[8px] text-zinc-505 tracking-wider">EST SCORE</span>
                  <span className="text-xs font-black text-[#00FF95]">{cumulativeSetScore} pts</span>
                </div>
                <div className="bg-red-950/20 border border-red-900/40 px-3 py-1.5 rounded-xl text-center">
                  <span className="block text-[8px] font-mono text-red-400">STAGE CURFEW</span>
                  <span className="text-base font-black text-red-500 animate-pulse font-mono">{timeLeft}s</span>
                </div>
              </div>
            </div>

            {/* Simulated Live Alert Hazards */}
            {activeHazard && (
              <div className="bg-amber-950/40 border border-amber-500/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-bounce">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-amber-500 animate-ping" />
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono">BOOTH INTEGRITY EMERGENCY</h5>
                    <p className="text-[11px] text-amber-200 font-sans max-w-lg leading-snug">{activeHazard.msg}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-[10px] text-amber-400 font-bold bg-amber-950 px-2 py-1 border border-amber-800 rounded">LIMIT: {activeHazard.timeLimit}s</span>
                  <button
                    onClick={() => resolveHazardManual(activeHazard.actionType)}
                    className="bg-[#00FF95] hover:bg-emerald-400 text-black px-3.5 py-1.5 rounded-lg text-xs font-sans font-bold uppercase transition active:scale-95 cursor-pointer"
                  >
                    Engage Deck Correction Module 🛠️
                  </button>
                </div>
              </div>
            )}

            {/* VIRTUAL DECKS PANEL */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* DECK A CONTROL PLATTER */}
              <div className={`lg:col-span-4 bg-[#050507] border rounded-2xl p-4 space-y-4 transition ${focusDeck === "A" ? "border-[#00FF95]" : "border-[#1A1A1E]"}`}>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono bg-[#00FF95]/10 text-[#00FF95] border border-[#00FF95]/30 px-2 py-0.5 rounded font-bold uppercase text-left">PLAYER PLATTER DECK A</span>
                  <button onClick={() => setFocusDeck("A")} className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase border cursor-pointer ${focusDeck === "A" ? "bg-white text-black border-white" : "text-slate-400 border-slate-800"}`}>Focus Load</button>
                </div>

                {deckATrack ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-gradient-to-tr from-cyan-950 to-[#00FF95]/30 rounded-xl border border-slate-800/80 ${deckAPlay ? "animate-spin" : ""}`} style={{ animationDuration: "3s" }}>
                        <Disc className="h-7 w-7 text-[#00FF95]" />
                      </div>
                      <div className="truncate text-left">
                        <h4 className="text-xs font-bold text-white font-sans tracking-tight">{deckATrack.title}</h4>
                        <p className="text-[10px] text-slate-400 font-mono italic truncate">{deckATrack.artist}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-[#0A0A0C] p-2 rounded-lg border border-[#1A1A1E]">
                      <div>
                        <span className="block text-slate-500">ORIG BPM</span>
                        <span className="text-xs font-bold text-white">{deckATrack.bpm} bpm</span>
                      </div>
                      <div>
                        <span className="block text-slate-500">KEY / SIGN</span>
                        <span className="text-xs font-bold text-amber-400">{deckATrack.key}</span>
                      </div>
                    </div>

                    {/* Progress slider bar simulation */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] font-mono text-slate-500">
                        <span>DECK PITCH PITCH SPEED</span>
                        <span className="text-[#00FF95]">{deckAPitch > 0 ? "+" : ""}{deckAPitch}% ({deckABpm} bpm)</span>
                      </div>
                      <input
                        type="range"
                        min="-10"
                        max="10"
                        step="0.1"
                        value={deckAPitch}
                        onChange={(e) => handlePitchAdjust("A", parseFloat(e.target.value))}
                        className="w-full accent-[#00FF95] cursor-pointer h-1.5 rounded-lg bg-[#111114]"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setDeckAPlay(!deckAPlay)}
                        className={`flex-1 font-bold font-mono text-xs py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 border ${
                          deckAPlay ? "bg-[#00FF95]/15 border-[#00FF95] text-[#00FF95]" : "bg-[#111114] border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>{deckAPlay ? "LIVE PLAYING" : "CUE TAP"}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 bg-[#0A0A0C] rounded-xl border border-dashed border-[#1A1A1E] space-y-2">
                    <Music className="h-5 w-5 text-slate-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-slate-500 uppercase">NO VINYL LOADED</span>
                  </div>
                )}
              </div>

              {/* CENTER ANALOG ROTARY MIXER */}
              <div className="lg:col-span-4 bg-[#0A0A0C] border border-[#1d1d25] rounded-2xl p-4 flex flex-col justify-between space-y-4">
                <span className="block text-[9px] font-mono uppercase tracking-widest text-[#FF00FF] font-bold text-center">STUDIO BOOTH MIXER STRIP</span>
                
                {/* EQ rotary controls */}
                <div className="grid grid-cols-2 gap-4 divide-x divide-slate-800/85">
                  {/* Deck A EQs */}
                  <div className="px-1 text-center space-y-2">
                    <span className="text-[8px] font-mono text-slate-500">DECK A</span>
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-mono text-slate-400 text-left">HI ({deckAEqs.hi}%)</label>
                      <input type="range" min="0" max="150" value={deckAEqs.hi} onChange={(e) => setDeckAEqs({ ...deckAEqs, hi: parseInt(e.target.value) })} className="w-full accent-[#00FF95] h-1 bg-[#111114]" />
                      
                      <label className="block text-[9px] font-mono text-slate-400 text-left">MID ({deckAEqs.mid}%)</label>
                      <input type="range" min="0" max="150" value={deckAEqs.mid} onChange={(e) => setDeckAEqs({ ...deckAEqs, mid: parseInt(e.target.value) })} className="w-full accent-[#00FF95] h-1 bg-[#111114]" />
                      
                      <label className="block text-[9px] font-mono text-[#00FF95] font-bold text-left">BASS ({deckAEqs.low}%)</label>
                      <input type="range" min="0" max="150" value={deckAEqs.low} onChange={(e) => setDeckAEqs({ ...deckAEqs, low: parseInt(e.target.value) })} className="w-full accent-[#FF00FF] h-1 bg-[#111114]" />
                    </div>
                  </div>

                  {/* Deck B EQs */}
                  <div className="px-1 text-center space-y-2">
                    <span className="text-[8px] font-mono text-slate-500">DECK B</span>
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-mono text-slate-400 text-left">HI ({deckBEqs.hi}%)</label>
                      <input type="range" min="0" max="150" value={deckBEqs.hi} onChange={(e) => setDeckBEqs({ ...deckBEqs, hi: parseInt(e.target.value) })} className="w-full accent-[#00FF95] h-1 bg-[#111114]" />
                      
                      <label className="block text-[9px] font-mono text-slate-400 text-left">MID ({deckBEqs.mid}%)</label>
                      <input type="range" min="0" max="150" value={deckBEqs.mid} onChange={(e) => setDeckBEqs({ ...deckBEqs, mid: parseInt(e.target.value) })} className="w-full accent-[#00FF95] h-1 bg-[#111114]" />
                      
                      <label className="block text-[9px] font-mono text-[#00FF95] font-bold text-left">BASS ({deckBEqs.low}%)</label>
                      <input type="range" min="0" max="150" value={deckBEqs.low} onChange={(e) => setDeckBEqs({ ...deckBEqs, low: parseInt(e.target.value) })} className="w-full accent-[#FF00FF] h-1 bg-[#111114]" />
                    </div>
                  </div>
                </div>

                {/* Harmonizer check badges */}
                {deckATrack && deckBTrack && (
                  <div className="bg-[#050507] border border-[#1A1A1E] p-2 rounded-xl text-center space-y-0.5">
                    <span className="text-[7.5px] uppercase font-mono text-slate-500 block">Camelot Grid Harmony Match</span>
                    {areKeysHarmonicallyCompatible(deckATrack.key, deckBTrack.key) ? (
                      <span className="text-[9px] font-mono uppercase bg-[#00FF95]/15 border border-[#00FF95]/30 text-[#00FF95] px-2 py-0.5 rounded font-extrabold shadow animate-pulse inline-block">Perfect harmonic chord lock (100% Blended)</span>
                    ) : (
                      <span className="text-[9px] font-mono uppercase bg-[#FF00FF]/15 border border-[#FF00FF]/30 text-[#FF00FF] px-2 py-0.5 rounded font-bold inline-block">Non-harmonic mismatch (Key clash warning)</span>
                    )}
                  </div>
                )}

                {/* Interactive slider crossfader */}
                <div className="space-y-1 bg-[#050507] p-2 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-[8px] font-mono text-slate-500">
                    <span>CROSSFADER CONTROL STRIP: DECK A</span>
                    <span>DECK B</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={crossfader}
                    onChange={(e) => setCrossfader(parseInt(e.target.value))}
                    className="w-full accent-[#00FF95] h-2 rounded cursor-pointer bg-[#111114]"
                  />
                  <div className="text-[9px] font-mono text-center text-slate-400 pt-1">
                    Faded: <strong className="text-white">{crossfader === 0 ? "100% Deck A" : crossfader === 50 ? "Balanced Mix" : crossfader === 100 ? "100% Deck B" : `${100 - crossfader}% A / ${crossfader}% B`}</strong>
                  </div>
                </div>

                {/* Hardware CDJ Auto Beat Sync aid */}
                {BOOTH_UPGRADES.find(u => u.id === equippedUpgrades.players)?.autoSync && (
                  <button
                    onClick={() => {
                      if (deckATrack && deckBTrack) {
                        setDeckBBpm(deckABpm);
                        const correctPitch = ((deckABpm / deckBTrack.bpm) - 1) * 100;
                        setDeckBPitch(Math.round(correctPitch * 10) / 10);
                        pushRaveComment("⚡ Pioneer Nexus Auto Match locked grid synchronization successfully!");
                      }
                    }}
                    className="w-full bg-[#111114] hover:bg-[#1A1A1E] text-[#00FF95] border border-[#00FF95]/40 font-mono text-[10px] py-1.5 rounded-lg font-bold tracking-wider cursor-pointer uppercase transition"
                  >
                    🚀 Lock Phase Beat-Sync Grid
                  </button>
                )}
              </div>

              {/* DECK B CONTROL PLATTER */}
              <div className={`lg:col-span-4 bg-[#050507] border rounded-2xl p-4 space-y-4 transition ${focusDeck === "B" ? "border-[#00FF95]" : "border-[#1A1A1E]"}`}>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono bg-purple-950/20 text-[#FF00FF] border border-[#FF00FF]/25 px-2 py-0.5 rounded font-bold uppercase text-left">PLAYER PLATTER DECK B</span>
                  <button onClick={() => setFocusDeck("B")} className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase border cursor-pointer ${focusDeck === "B" ? "bg-white text-black border-white" : "text-slate-400 border-slate-800"}`}>Focus Load</button>
                </div>

                {deckBTrack ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-gradient-to-tr from-[#FF00FF]/20 to-purple-900/30 rounded-xl border border-slate-800/80 ${deckBPlay ? "animate-spin" : ""}`} style={{ animationDuration: "3s" }}>
                        <Disc className="h-7 w-7 text-[#FF00FF]" />
                      </div>
                      <div className="truncate text-left font-sans">
                        <h4 className="text-xs font-bold text-white tracking-tight">{deckBTrack.title}</h4>
                        <p className="text-[10px] text-slate-400 font-mono italic truncate">{deckBTrack.artist}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-[#0A0A0C] p-2 rounded-lg border border-[#1A1A1E]">
                      <div>
                        <span className="block text-slate-500">ORIG BPM</span>
                        <span className="text-xs font-bold text-white">{deckBTrack.bpm} bpm</span>
                      </div>
                      <div>
                        <span className="block text-slate-500">KEY / SIGN</span>
                        <span className="text-xs font-bold text-amber-400">{deckBTrack.key}</span>
                      </div>
                    </div>

                    {/* Progress slider bar simulation */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] font-mono text-slate-500">
                        <span>DECK PITCH SPEED</span>
                        <span className="text-[#FF00FF]">{deckBPitch > 0 ? "+" : ""}{deckBPitch}% ({deckBBpm} bpm)</span>
                      </div>
                      <input
                        type="range"
                        min="-10"
                        max="10"
                        step="0.1"
                        value={deckBPitch}
                        onChange={(e) => handlePitchAdjust("B", parseFloat(e.target.value))}
                        className="w-full accent-[#FF00FF] cursor-pointer h-1.5 rounded-lg bg-[#111114]"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setDeckBPlay(!deckBPlay)}
                        className={`flex-1 font-bold font-mono text-xs py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 border ${
                          deckBPlay ? "bg-[#FF00FF]/15 border-[#FF00FF] text-[#FF00FF]" : "bg-[#111114] border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>{deckBPlay ? "LIVE PLAYING" : "CUE TAP"}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 bg-[#0A0A0C] rounded-xl border border-dashed border-[#1A1A1E] space-y-2">
                    <Music className="h-5 w-5 text-slate-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-slate-500 uppercase">NO VINYL LOADED</span>
                  </div>
                )}
              </div>

            </div>

            {/* LIVE DIG-CRATE AND COMMENT OVERLAYS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* LIVE PLAYLIST SELECTOR */}
              <div className="bg-[#050507] border border-[#1A1A1E] rounded-2xl p-4 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2 text-left">
                    <span className="text-[10px] font-mono text-slate-405 uppercase font-bold flex items-center gap-1"><Layers className="h-3.5 'w-3.5' text-[#00FF95]" /> CRATE: {selectedCrate}</span>
                    <span className="text-[9px] font-sans text-slate-500 font-bold bg-[#111114] px-1.5 py-0.2 rounded border border-slate-850">Deck Target: {focusDeck}</span>
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1 font-mono text-xs">
                    {djLibrary.filter(tk => (crates[selectedCrate] || []).includes(tk.id)).map((tk) => (
                      <div
                        key={tk.id}
                        onClick={() => equipTrackOnActiveSelectedDeck(tk)}
                        className="p-2 bg-[#0A0A0C] hover:bg-[#111114] border border-[#1A1A1E] hover:border-[#00FF95]/45 rounded-lg flex items-center justify-between cursor-pointer transition text-left"
                      >
                        <div className="truncate pr-2">
                          <span className="text-white font-bold block truncate text-[11px]">{tk.title}</span>
                          <span className="text-[9.5px] text-slate-500 italic font-sans truncate">{tk.artist} | {tk.genre}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="text-[#00FF95]">{tk.bpm}</span>
                          <span className="text-amber-400 font-bold bg-[#111114] px-1.5 py-0.5 rounded border border-slate-800">{tk.key}</span>
                        </div>
                      </div>
                    ))}
                    {djLibrary.filter(tk => (crates[selectedCrate] || []).includes(tk.id)).length === 0 && (
                      <p className="text-[10.5px] text-zinc-505 italic text-center py-6 font-sans">No track assigned onto this folder template. Open the Vinyl/Digital Library tab to transfer releases!</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {Object.keys(crates).slice(0, 3).map((n) => (
                    <button
                      key={n}
                      onClick={() => setSelectedCrate(n)}
                      className={`flex-1 py-1.5 text-[9.5px] font-mono tracking-wider font-bold uppercase rounded border transition cursor-pointer ${
                        selectedCrate === n ? "bg-[#FF00FF]/10 text-[#FF00FF] border-[#FF00FF]" : "bg-[#0A0A0C] border-[#1A1A1E]"
                      }`}
                    >
                      {n.replace(" Crate", "").slice(0, 10)}..
                    </button>
                  ))}
                </div>
              </div>

              {/* LIVE SOCIAL CHAT FEED */}
              <div className="bg-[#050507] border border-[#1A1A1E] rounded-2xl p-4 space-y-3 text-left">
                <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1 uppercase font-bold"><MessageSquare className="h-3.5 w-3.5 text-[#FF00FF]" /> Live Stage Rave Stream Reactions</span>
                <div className="h-44 overflow-y-auto space-y-1.5 bg-[#0A0A0C] p-3 rounded-xl border border-[#1A1A1E] text-[10.5px] font-mono">
                  {raveComments.map((cmt, i) => (
                    <div key={i} className="text-slate-300 leading-normal flex gap-1 items-start">
                      <span className="text-slate-600 font-bold italic">»</span>
                      <span>{cmt}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* EXIT EMERGENCY BUTTON */}
            <button
              onClick={concludeSetSession}
              className="w-full bg-[#111114] hover:bg-black text-red-500 border border-red-950 hover:border-red-500 font-display font-black py-3 rounded-xl uppercase tracking-widest text-xs transition cursor-pointer flex items-center justify-center gap-1 active:scale-95 shadow"
            >
              🛑 EMERGENCY KILL SHOW (CONCLUDE FEEDBACK ACCUMULATOR)
            </button>

          </div>
        </div>
      )}

      {/* 🏡 LOBBY USER INTERFACES GRID */}
      {!isPerforming && (
        <div className="space-y-6">
          
          {/* Main Navigation Row */}
          <div className="flex flex-wrap justify-between items-center bg-[#0A0A0C] border border-[#1A1A1E] px-4 py-2.5 rounded-2xl gap-3">
            <div className="flex items-center gap-2">
              <Disc className="h-5 w-5 text-[#00FF95] animate-spin" style={{ animationDuration: "12s" }} />
              <div>
                <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">DJ SOUNDSYSTEM CENTER</h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-display font-extrabold text-white uppercase">{gameState.pseudonym}</span>
                  <span className="text-[9px] font-mono bg-[#00FF95]/15 text-[#00FF95] border border-[#00FF95]/30 px-2 py-0.2 rounded font-extrabold shadow">RATING: {signatureScore}/1000</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 font-mono text-[10.5px]">
              <button
                onClick={() => setActiveTab("gigs")}
                className={`px-3 py-1.5 rounded-xl uppercase font-extrabold tracking-wider border cursor-pointer transition ${
                  activeTab === "gigs" ? "bg-[#111114] text-[#00FF95] border-[#00FF95]/30 shadow" : "text-slate-400 border-transparent hover:text-white"
                }`}
              >
                Booking Listings Gigs
              </button>
              <button
                onClick={() => setActiveTab("stores")}
                className={`px-3 py-1.5 rounded-xl uppercase font-extrabold tracking-wider border cursor-pointer transition ${
                  activeTab === "stores" ? "bg-[#111114] text-[#00FF95] border-[#00FF95]/30 shadow" : "text-slate-400 border-transparent hover:text-white"
                }`}
              >
                Crate Dig & Shops
              </button>
              <button
                onClick={() => setActiveTab("library")}
                className={`px-3 py-1.5 rounded-xl uppercase font-extrabold tracking-wider border cursor-pointer transition ${
                  activeTab === "library" ? "bg-[#111114] text-[#00FF95] border-[#00FF95]/30 shadow" : "text-slate-400 border-transparent hover:text-white"
                }`}
              >
                Custom Library
              </button>
              <button
                onClick={() => setActiveTab("booth")}
                className={`px-3 py-1.5 rounded-xl uppercase font-extrabold tracking-wider border cursor-pointer transition ${
                  activeTab === "booth" ? "bg-[#111114] text-[#00FF95] border-[#00FF95]/30 shadow" : "text-slate-400 border-transparent hover:text-white"
                }`}
              >
                Booth Upgrade Shop
              </button>
              <button
                onClick={() => setActiveTab("feed")}
                className={`px-3 py-1.5 rounded-xl uppercase font-extrabold tracking-wider border cursor-pointer transition ${
                  activeTab === "feed" ? "bg-[#111114] text-[#00FF95] border-[#00FF95]/30 shadow" : "text-slate-400 border-transparent hover:text-white"
                }`}
              >
                Press & Review Feed
              </button>
            </div>
          </div>

          {/* 1. GIGS AND BOOKING HUBS SECTION */}
          {activeTab === "gigs" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Tour Transit details panel */}
              <div className="lg:col-span-4 bg-[#0A0A0C] border border-[#1A1A1E] p-4 rounded-2xl flex flex-col justify-between neon-border">
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-widest text-[#00FF95] mb-3 flex items-center gap-1.5 font-bold">
                    <MapPin className="h-4 w-4 text-[#FF00FF] animate-bounce" />
                    TOUR TRANSIT HUBS
                  </h3>
                  <p className="text-[11px] text-slate-450 mb-3.5 leading-normal font-sans">Travel boosts regional production multipliers and unlocks legendary warehouse clubs.</p>
                  
                  <div className="space-y-2 font-mono max-h-72 overflow-y-auto pr-1">
                    {CITIES_DB.map((city) => {
                      const isCurrent = city.id === gameState.currentCityId;
                      const canTravel = gameState.stats.prestige >= city.prestigeNeeded;

                      return (
                        <div
                          key={city.id}
                          className={`p-2.5 rounded-xl border transition cursor-pointer ${
                            selectedCityObj.id === city.id
                              ? "bg-[#111114] border-[#00FF95] text-white"
                              : "bg-[#050507] border-[#1A1A1E] hover:border-[#FF00FF]/30 text-slate-400"
                          } ${!canTravel ? "opacity-35 cursor-not-allowed" : ""}`}
                          onClick={() => canTravel && !isCurrent && setSelectedCityObj(city)}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold font-sans text-white">{city.name}, {city.country}</span>
                            {isCurrent && (
                              <span className="text-[8px] font-mono bg-[#00FF95]/15 text-[#00FF95] border border-[#00FF95]/30 px-1.5 py-0.5 rounded font-bold">HQ</span>
                            )}
                          </div>
                          <div className="flex justify-between items-center text-[10px] mt-1 text-slate-550 font-mono">
                            <span>Req Prestige: {city.prestigeNeeded}</span>
                            {city.costToTravel > 0 && (
                              <span className="text-[#00FF95] font-bold">${city.costToTravel}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedCityObj.id !== gameState.currentCityId && (
                  <div className="mt-4 p-3 bg-[#050507] border border-[#1A1A1E] rounded-xl text-left">
                    <h4 className="text-[11px] font-mono text-slate-200 font-bold mb-1">Transit to {selectedCityObj.name}</h4>
                    <p className="text-[10px] text-slate-400 leading-normal mb-3 font-sans">Spend money flight tickets to switch active regions.</p>
                    <button
                      onClick={() => {
                        if (gameState.stats.money < selectedCityObj.costToTravel) {
                          alert("Insufficient travel finance!");
                          return;
                        }
                        onTravelToCity(selectedCityObj.id, selectedCityObj.costToTravel);
                      }}
                      className="w-full bg-[#111114] hover:bg-[#1A1A1E] text-[#00FF95] border border-[#00FF95] font-display font-semibold py-2 rounded-xl transition text-xs cursor-pointer flex items-center justify-center gap-1 shadow"
                    >
                      Book Flight Ticket (${selectedCityObj.costToTravel})
                    </button>
                  </div>
                )}
              </div>

              {/* Venue rosters listings */}
              <div className="lg:col-span-8 bg-[#0A0A0C] border border-[#1A1A1E] p-5 rounded-3xl text-left">
                <div className="mb-4">
                  <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                    <Compass className="h-5 w-5 text-[#00FF95]" />
                    ACTIVE SHOW LISTINGS &mdash; {selectedCityObj.name} Hub
                  </h3>
                  <p className="text-xs text-slate-400 font-sans tracking-wide">{selectedCityObj.vibe}</p>
                </div>

                <div className="space-y-3.5">
                  {selectedCityObj.venues.map((venue, idx) => {
                    const hasPrestige = gameState.stats.prestige >= venue.relevance;
                    
                    return (
                      <div
                        key={idx}
                        className={`bg-[#050507] p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between transition gap-4 ${
                          hasPrestige ? "border-[#1A1A1E] hover:border-[#00FF95]/30 animate-fade" : "border-[#1A1A1E]/40 opacity-40"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-white">{venue.name}</span>
                            <span className={`text-[8px] font-mono uppercase px-2 py-0.5 rounded border ${
                              venue.tier === "festival"
                                ? "bg-[#FF00FF]/15 text-[#FF00FF] border-[#FF00FF]/25 font-bold"
                                : "bg-[#111114] text-slate-400 border-[#1A1A1E]"
                            }`}>{venue.tier}</span>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-x-4 text-[10.5px] font-mono text-slate-450">
                            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-slate-550" /> {venue.capacity} cap</span>
                            <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5 text-[#00FF95]" /> Payout ${venue.payout}</span>
                            <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5 text-[#FF00FF]" /> Req {venue.relevance}</span>
                          </div>
                        </div>

                        <div>
                          {hasPrestige ? (
                            <div className="flex flex-col sm:flex-row gap-2">
                              <select
                                value={selectedCrate}
                                onChange={(e) => setSelectedCrate(e.target.value)}
                                className="bg-[#0A0A0C] border border-[#1A1A1E] rounded-xl text-[11px] font-mono text-white px-2.5 py-1.5 focus:outline-none focus:border-[#00FF95] w-36 cursor-pointer"
                              >
                                {Object.keys(crates).map(name => (
                                  <option key={name} value={name}>{name}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => selectGigPerformance(venue)}
                                className="bg-[#111114] hover:bg-[#1A1A1E] text-[#FF00FF] border border-[#FF00FF]/80 font-display text-[11.5px] font-bold tracking-wider uppercase py-2 px-4 rounded-xl flex items-center space-x-1.5 transition shadow-md active:scale-95 cursor-pointer magenta-glow"
                              >
                                <Play className="h-3 w-3 fill-current" />
                                <span>Load Mixer & Perform</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-slate-500 font-mono text-[9.5px] bg-[#0A0A0C] border border-[#1A1A1E] px-3 py-1.5 rounded-xl">
                              <ShieldAlert className="h-4 w-4 text-slate-550" />
                              <span>Requires {venue.relevance} Prestige</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* 2. CRATE DIGGING & MUSIC STORES TAB */}
          {activeTab === "stores" && (
            <div className="bg-[#0A0A0C] border border-[#1A1A1E] p-5 rounded-3xl text-left space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A1A1E] pb-3">
                <div className="space-y-1">
                  <h3 className="text-base font-display font-extrabold text-white flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-[#00FF95]" />
                    MUSIC DISCOVERY PORT & CRATE DIGGING
                  </h3>
                  <p className="text-xs text-slate-400 font-sans">Acquire high credibility audio tracks to feed into your mixing catalog folders.</p>
                </div>
                
                <button
                  onClick={refreshMarketStock}
                  className="bg-[#111114] hover:bg-[#1A1A1E] text-slate-300 border border-slate-800 text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer font-mono font-bold tracking-widest uppercase active:scale-95"
                >
                  🔄 ROTATE DIG STOCKS ($25 Fee)
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Digging the Vinyl bin panel */}
                <div className="lg:col-span-5 bg-[#050507] border border-[#1A1A1E] p-4 rounded-2xl flex flex-col justify-between space-y-4 shadow-inner">
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-widest text-[#FF00FF] font-bold flex items-center gap-1 justify-between mb-2">
                      <span>📻 B-SIDE PHYSICAL CRATE DIGGING</span>
                      <span className="text-[10px] font-sans text-slate-500 font-bold bg-[#111114] px-1.5 py-0.2 rounded border">VINYL CRATE</span>
                    </h4>
                    <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed mb-4">Click and cycle physical sleeve assets here. Vinyl copies have high collector conditions (Mint, VG+) and double credibility modifiers.</p>
                    
                    {vinylStoreTracks.length > 0 && activeDiggerCardIdx < vinylStoreTracks.length ? (
                      (() => {
                        const tk = vinylStoreTracks[activeDiggerCardIdx];
                        return (
                          <div className="bg-[#0A0A0C] border-2 border-[#FF00FF]/50 p-5 rounded-3xl flex flex-col items-center text-center space-y-4 relative overflow-hidden magenta-glow animate-fade">
                            <div className="absolute top-2.5 right-2.5 bg-amber-950/20 text-amber-500 border border-amber-900/40 font-mono text-[9px] px-2 py-0.5 rounded-full font-extrabold">
                              Condition: {tk.condition}
                            </div>
                            
                            {/* Record sleeve representation */}
                            <div className="w-28 h-28 bg-gradient-to-tr from-stone-900 to-black rounded-xl border border-stone-800 flex items-center justify-center relative shadow-lg">
                              <div className="absolute inset-2 border-2 border-dashed border-stone-700 rounded-full animate-spin" style={{ animationDuration: "15s" }} />
                              <Disc className="h-10 w-10 text-white/20" />
                              <div className="absolute bottom-2 left-2 text-[8px] font-mono text-zinc-650 bg-stone-950/80 p-1 rounded">Grade: {tk.condition}</div>
                            </div>

                            <div className="space-y-1">
                              <h5 className="text-sm font-bold text-white font-sans">{tk.title}</h5>
                              <p className="text-xs text-slate-400 italic font-mono">{tk.artist}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 w-full text-[10px] font-mono bg-[#111114] p-2.5 rounded-xl border border-slate-850">
                              <div className="text-left">
                                <span className="block text-slate-500 uppercase">Acoustic Genre:</span>
                                <span className="text-white font-bold">{tk.genre}</span>
                              </div>
                              <div className="text-right">
                                <span className="block text-slate-500 uppercase">Key / Speed:</span>
                                <span className="text-amber-400 font-bold">{tk.key} @ {tk.bpm}</span>
                              </div>
                            </div>

                            <div className="flex gap-2 w-full">
                              <button
                                onClick={() => setActiveDiggerCardIdx(prev => (prev + 1) % vinylStoreTracks.length)}
                                className="flex-1 bg-[#111114] hover:bg-[#1A1A1E] text-slate-300 border border-slate-800 font-mono text-[10.5px] py-2 rounded-xl"
                              >
                                Skip Sleeve »
                              </button>
                              <button
                                onClick={() => buyMusicTrack(tk, "vinyl")}
                                className="flex-1 bg-white hover:bg-[#FFF] text-black font-sans font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition active:scale-95 text-center"
                              >
                                <DollarSign className="h-3 w-3" /> Buy Vinyl (${tk.price})
                              </button>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="text-center py-12 bg-[#0A0A0C] border border-dashed border-slate-800 rounded-2xl">
                        <Disc className="h-8 w-8 text-slate-650 mx-auto animate-pulse mb-2" />
                        <p className="text-xs text-slate-500 italic">This physical records rack has been cleaned out. Rotate stock to fetch imported vintage items.</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-[#0A0A0C] border border-[#1A1A1E] p-3 rounded-xl text-left">
                    <span className="text-[10px] font-mono text-[#00FF95] block mb-1">PROMOTER GOSSIP SYNDICATE</span>
                    <p className="text-[10px] text-slate-450 leading-relaxed font-sans">Spinning original Vinyl copies provides <strong className="text-white">+50% Prestige yield boost</strong> when playing raves in progressive city locations like Berlin or Ibiza!</p>
                  </div>
                </div>

                {/* Digital Store - Filterable catalog section */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
                    <h4 className="text-xs font-mono uppercase tracking-widest text-[#00FF95] font-bold text-left w-full sm:w-auto">💾 ORBITPORT PREMIUM DIGITAL CATALOG</h4>
                    
                    <div className="flex gap-1.5 font-mono text-[9px] w-full sm:w-auto overflow-x-auto">
                      {["All", "Techno", "House", "Trance", "Drum & Bass"].map(genre => (
                        <button
                          key={genre}
                          onClick={() => setStoreActiveGenre(genre)}
                          className={`px-2 py-1.5 rounded uppercase font-bold border cursor-pointer ${
                            storeActiveGenre === genre ? "bg-[#00FF95]/10 text-[#00FF95] border-[#00FF95]" : "bg-[#050507] border-[#1A1A1E] text-slate-400"
                          }`}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {digitalStoreTracks
                      .filter(t => storeActiveGenre === "All" || t.genre === storeActiveGenre)
                      .map(tk => (
                        <div key={tk.id} className="bg-[#050507] p-3 rounded-xl border border-[#1A1A1E] hover:border-slate-800 flex items-center justify-between gap-4 transition-all animate-fade text-left">
                          <div className="flex items-center gap-3 truncate">
                            <div className="p-2 bg-[#111114] rounded-lg border border-slate-800">
                              <Music className="h-4 w-4 text-[#00FF95]" />
                            </div>
                            <div className="truncate font-sans leading-snug">
                              <h5 className="text-xs font-bold text-white truncate">{tk.title}</h5>
                              <p className="text-[10.5px] text-slate-400 font-mono italic truncate">{tk.artist} &mdash; {tk.genre}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 font-mono text-[10.5px]">
                            <div className="text-right">
                              <span className="text-amber-400 block font-bold">{tk.key}</span>
                              <span className="text-slate-500 block text-[9px]">{tk.bpm} PM</span>
                            </div>
                            <button
                              onClick={() => buyMusicTrack(tk, "digital")}
                              className="bg-[#111114] hover:bg-[#1A1A1E] text-slate-200 border border-slate-800 px-3.5 py-1.5 rounded-lg font-mono font-bold text-[10.5px] uppercase active:scale-95 cursor-pointer max-w-sm tracking-widest font-mono"
                            >
                              GET ${tk.price}
                            </button>
                          </div>
                   </div>
                    ))}

                    {/* Undergound Promos list card */}
                    {undergroundPromos.length > 0 && (
                      <div className="pt-4 border-t border-slate-850">
                        <span className="block text-[10px] font-mono text-[#FF00FF] uppercase mb-2 font-bold select-none text-left">⚡ DIRECT BACKSTAGE DEMOS & DUBPLATES</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {undergroundPromos.map(tk => (
                            <div key={tk.id} className="bg-[#060608] border border-dashed border-[#FF00FF]/40 p-3 rounded-xl flex justify-between items-center text-left">
                              <div className="truncate">
                                <h5 className="text-[11.5px] font-bold text-white font-sans truncate">{tk.title}</h5>
                                <span className="text-[9.5px] font-mono block text-purple-400">Backstage VIP leak &bull; {tk.genre}</span>
                              </div>
                              <button
                                onClick={() => buyMusicTrack(tk, "underground")}
                                className="bg-[#111114] hover:bg-black text-[#FF00FF] border border-[#FF00FF]/40 text-[10px] px-2.5 py-1.5 font-bold rounded"
                              >
                                ${tk.price}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 3. LIBRARY & FOLDER MANAGEMENT TAB */}
          {activeTab === "library" && (
            <div className="bg-[#0A0A0C] border border-[#1A1A1E] p-5 rounded-3xl text-left space-y-6 animate-fade">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A1A1E] pb-3">
                <div className="space-y-1">
                  <h3 className="text-base font-display font-extrabold text-white flex items-center gap-2">
                    <Layers className="h-5 w-5 text-[#00FF95]" />
                    MY RECORD LIBRARY & CRATE ARCHIVER
                  </h3>
                  <p className="text-xs text-slate-400 font-sans">Prepare play sets, define folder categories, and track Camelot harmonic keys compatibility.</p>
                </div>
                
                {/* Build folder builder UI */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="New Crate Name.."
                    value={newCrateName}
                    onChange={(e) => setNewCrateName(e.target.value)}
                    className="bg-[#050507] border border-slate-800 focus:border-[#00FF95] rounded-xl text-xs px-3 py-1.5 font-mono text-white focus:outline-none w-44"
                  />
                  <button
                    onClick={buildCustomCrate}
                    className="bg-[#111114]/80 hover:bg-[#111114] text-[#00FF95] border border-[#00FF95]/50 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition flex items-center gap-1 active:scale-95"
                  >
                    <Plus className="h-3.5 w-3.5" /> Create
                  </button>
                </div>
              </div>

              {/* Grid content folder index */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Available folders sidebar */}
                <div className="lg:col-span-4 bg-[#050507] border border-[#1A1A1E] p-4 rounded-2xl space-y-3">
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold text-left block">MY GIG PLAY CRATES</span>
                  
                  <div className="space-y-1.5 font-mono text-xs">
                    {Object.keys(crates).map(name => {
                      const count = crates[name]?.length || 0;
                      return (
                        <div
                          key={name}
                          onClick={() => setSelectedCrate(name)}
                          className={`p-2.5 rounded-xl border flex justify-between items-center cursor-pointer transition ${
                            selectedCrate === name ? "bg-[#111114]/90 text-[#00FF95] border-[#00FF95]/40" : "bg-[#0A0A0C] border-[#1A1A1E] text-slate-400 hover:text-white"
                          }`}
                        >
                          <span className="truncate">{name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] bg-[#111114] px-1.5 py-0.5 rounded border border-slate-850 text-slate-300 font-bold">{count} eps</span>
                            {name !== "Underground Secret Stash" && (
                              <button onClick={(e) => { e.stopPropagation(); deleteCrate(name); }} className="text-red-500 hover:text-red-400 p-1"><Trash2 className="h-3 w-3" /></button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Main list of vinyl/file properties */}
                <div className="lg:col-span-8 space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-500">MANAGE AUDIOS ON [{selectedCrate}]</span>
                    <span className="text-slate-400 bg-[#050507] hover:bg-[#111114] px-1.5 py-0.5 rounded border">TOTAL COPIES: {djLibrary.length}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                    {djLibrary.map(tk => {
                      const isAssigned = (crates[selectedCrate] || []).includes(tk.id);

                      return (
                        <div key={tk.id} className="bg-[#050507] p-3 rounded-2xl border border-[#1A1A1E] flex items-center justify-between text-left gap-3">
                          <div className="truncate font-sans leading-snug">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-extrabold text-white truncate text-left">{tk.title}</span>
                              {tk.isVinyl && (
                                <span className="text-[7.5px] font-mono bg-amber-950/10 text-amber-500 border border-amber-900/30 px-1 rounded uppercase font-bold">12” Physical</span>
                              )}
                            </div>
                            <span className="text-[10.5px] text-zinc-505 block italic truncate">{tk.artist}</span>
                            <div className="flex flex-wrap gap-1.5 pt-1 text-[9px] font-mono text-slate-505">
                              <span>{tk.bpm} bpm</span>
                              <span>&bull;</span>
                              <span className="text-amber-400">{tk.key} (Camelot)</span>
                              <span>&bull;</span>
                              <span>{tk.genre}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => toggleTrackInCrate(tk.id, selectedCrate)}
                            className={`px-3 py-1.5 text-[9.5px] font-mono border rounded-lg transition-all cursor-pointer font-bold uppercase select-none ${
                              isAssigned 
                                ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/35" 
                                : "bg-[#111114] hover:bg-black text-[#00FF95] border-[#00FF95]/30"
                            }`}
                          >
                            {isAssigned ? "Exclude" : "Include"}
                          </button>
                        </div>
                      );
                    })}

                    {djLibrary.length === 0 && (
                      <p className="text-xs text-slate-500 italic py-10 text-center font-sans">No digital files inside internal storage. Open the 'Crate Dig & Shops' tab to acquire music tracks!</p>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 4. DJ BOOTH SETUP UPGRADES TAB */}
          {activeTab === "booth" && (
            <div className="bg-[#0A0A0C] border border-[#1A1A1E] p-5 rounded-3xl text-left space-y-5 animate-fade">
              <div className="space-y-1 border-b border-[#1A1A1E] pb-3">
                <h3 className="text-base font-display font-extrabold text-white flex items-center gap-2">
                  <Laptop className="h-5 w-5 text-[#00FF95]" />
                  DJ SOUNDSYSTEM BOOTH SHOP
                </h3>
                <p className="text-xs text-slate-400 font-sans">Configure upgraded physical hardware modules to elevate live crowd blending perks, automatic synchronization, and prestige multipliers.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {BOOTH_UPGRADES.map(upgrade => {
                  const isOwned = ownedUpgrades.includes(upgrade.id);
                  const isEquipped = equippedUpgrades[upgrade.category] === upgrade.id;

                  return (
                    <div key={upgrade.id} className="bg-[#050507] border border-[#1A1A1E] p-4 rounded-2xl flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[7.5px] font-mono uppercase tracking-widest text-slate-500 block">{upgrade.category} module</span>
                            <h4 className="text-xs font-bold text-white font-sans truncate">{upgrade.name}</h4>
                          </div>
                          <span className={`text-[8.5px] font-mono px-1.5 py-0.2 rounded border ${
                            upgrade.rarity === "Purist" ? "bg-amber-950/20 text-amber-500 border-amber-900/30 font-bold"
                            : upgrade.rarity === "Legendary" ? "bg-[#FF00FF]/10 text-[#FF00FF] border-[#FF00FF]/30 font-bold"
                            : "bg-[#111114] text-slate-400 border-slate-800"
                          }`}>{upgrade.rarity}</span>
                        </div>
                        
                        <p className="text-[10.5px] text-slate-400 leading-normal font-sans text-left">{upgrade.description}</p>
                        
                        <div className="grid grid-cols-2 gap-2 text-[9px] font-mono bg-[#0A0A0C] p-2 rounded-xl border border-slate-850">
                          <div>
                            <span className="block text-slate-500 uppercase">Prestige Aura:</span>
                            <span className="text-white font-bold">+{upgrade.credBonus}%</span>
                          </div>
                          <div>
                            <span className="block text-slate-500 uppercase">EQ Blend Help:</span>
                            <span className="text-[#00FF95] font-bold">+{upgrade.flowBonus}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        {isEquipped ? (
                          <div className="bg-[#00FF95]/10 border border-[#00FF95]/30 text-[#00FF95] text-[10.5px] font-mono font-bold uppercase py-2.5 rounded-xl text-center flex items-center justify-center gap-1.5 select-none">
                            <Check className="h-4 w-4" /> Loaded in Active Booth
                          </div>
                        ) : isOwned ? (
                          <button
                            onClick={() => equipBoothRig(upgrade)}
                            className="w-full bg-[#111114] hover:bg-[#1A1A1E] text-white border border-slate-800 text-[11px] font-mono font-bold uppercase py-2.5 rounded-xl transition cursor-pointer select-none"
                          >
                            Equip Gear Strip
                          </button>
                        ) : (
                          <button
                            onClick={() => buyBoothRig(upgrade)}
                            className="w-full bg-[#00FF95] hover:bg-emerald-400 text-black text-xs font-sans font-black uppercase py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 active:scale-95 shadow"
                          >
                            Acquire for &mdash; ${upgrade.cost}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. PRESS REVIEW FEED & PERFORMANCE HISTORY */}
          {activeTab === "feed" && (
            <div className="bg-[#0A0A0C] border border-[#1A1A1E] p-5 rounded-3xl text-left space-y-4 animate-fade">
              <div className="space-y-1 border-b border-[#1A1A1E] pb-3">
                <h3 className="text-base font-display font-extrabold text-white flex items-center gap-2">
                  <Radio className="h-5 w-5 text-[#00FF95]" />
                  MEDIA FEEDBACK & PERFORMANCE TELEMETRY
                </h3>
                <p className="text-xs text-slate-400 font-sans">Read underground press reviews, mixtape reputation metrics, and crowd chemistry diagnostics.</p>
              </div>

              {lastPerformanceReport ? (
                <div className="bg-[#050507] border border-[#1A1A1E] rounded-2xl p-5 space-y-3 shadow-inner">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-[#00FF95] font-bold">
                    <Sparkles className="h-4 w-4 text-[#00FF95] animate-spin" style={{ animationDuration: "5s" }} />
                    <span>LATEST CONCLUDED SHOW REVIEW CARD &bull; ACTIVE STATUS</span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono leading-relaxed italic border-l-4 border-[#00FF95] pl-4 bg-[#0A0A0C] py-3 rounded-r-xl pr-2">{lastPerformanceReport}</p>
                </div>
              ) : (
                <div className="text-center py-16 bg-[#050507] rounded-3xl border border-[#1A1A1E] border-dashed">
                  <Volume2 className="h-8 w-8 text-slate-650 mx-auto animate-pulse mb-3" />
                  <p className="text-xs text-slate-500 italic max-w-sm mx-auto font-sans leading-relaxed">No historical performance files saved on this artist file. Travel to dynamic transit cities, select compatible crates, and launch a club gig to generate review notes.</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3.5 border-t border-slate-850 bg-[#0A0A0C]">
                <div className="p-3.5 bg-[#050507] rounded-xl border border-slate-850">
                  <span className="text-[10px] font-mono text-[#FF00FF] uppercase mb-1.5 block">Online Mixtape Distribution</span>
                  <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans">Compiling harmonically matched tracks inside active custom folder crates establishes high **Crate Digger** credibility indices, unlocking hidden VIP artist promos over time.</p>
                </div>
                <div className="p-3.5 bg-[#050507] rounded-xl border border-slate-850">
                  <span className="text-[10px] font-mono text-[#00FF95] uppercase mb-1.5 block">Sound Curators Status</span>
                  <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans">Having multiple physical vinyl sleeves inside the folder boosts your local **Purist Reputation** by +10%, satisfying tough underground warehouse purist ravers in Berlin.</p>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
