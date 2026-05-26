/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Music, Sparkles, Disc, MapPin, Calendar, Heart, ShieldAlert, 
  Trash2, DollarSign, Users, Zap, TrendingUp, Trophy, ArrowUpRight, Award, MessageCircle, HelpCircle, Flame,
  Database, Globe
} from "lucide-react";

import { GameState, Track, ReleasedTrack, MusicGenre, MusicTrend } from "./types";
import { WORLD_TRENDS, processRelease, rollNextTrend } from "./utils/simulation";
import { getTopPredefinedArtists } from "./data/artists";
import { simulateAIScene, updateArtistFame } from "./utils/aiSimulation";

import AudioVisualizer from "./components/AudioVisualizer";
import DAWTrackCreator from "./components/DAWTrackCreator";
import GigBooking from "./components/GigBooking";
import RecordLabelsCatalog from "./components/RecordLabelsCatalog";
import SocialDramaForum from "./components/SocialDramaForum";
import SkillsTree from "./components/SkillsTree";
import UpgradableGearShop from "./components/UpgradableGearShop";
import DataModEditor from "./components/DataModEditor";
import AIDashboard from "./components/AIDashboard";
import ReleaseManagement from "./components/ReleaseManagement";
import VirtualBrowser from "./components/VirtualBrowser";

const LOCAL_STORAGE_KEY = "beatmaker_simulator_state_v1";

// Primary Creator Class Archetypes
interface EthosArchetype {
  id: string;
  name: string;
  description: string;
  statBoost: string;
  genreBonus: MusicGenre;
}

const ETHOS_DB: EthosArchetype[] = [
  {
    id: "techno_purist",
    name: "Underground Techno Purist",
    description: "You believe loops belong in wet, dark dungeons. Focus on modular fidelity and darkroom atmospheres.",
    statBoost: "+20% Techno Track Quality, double respect from underground sub-labels.",
    genreBonus: MusicGenre.TECHNO,
  },
  {
    id: "edm_superstar",
    name: "Commercial EDM Superstar",
    description: "You write massive crowd-pleasing drops designed for lasers and fireworks main-stages.",
    statBoost: "+25% Royalties split on mainstream labels, faster fan growth.",
    genreBonus: MusicGenre.HOUSE,
  },
  {
    id: "sound_designer",
    name: "Experimental Sound Designer",
    description: "You record feedback sirens and water drippings to compose deconstructed computational microtonals.",
    statBoost: "+30% Abstract Track Originality, but lower initial play counts.",
    genreBonus: MusicGenre.EXPERIMENTAL,
  },
  {
    id: "nostalgia_runner",
    name: "Synthwave Nostalgia Runner",
    description: "Detuned sawtooth oscillators, outrun driving drums, and neon sunsets on cassette tape.",
    statBoost: "Double starting Hype on Synthwave releases, cheaper travel costs.",
    genreBonus: MusicGenre.SYNTHWAVE,
  },
  {
    id: "garage_grime",
    name: "UK Garage Selector",
    description: "Swung vocal chops, bumpy 2-step syncopated swing breaks, and rich physical low-end warmth.",
    statBoost: "+25% UK Garage & Deep House quality. Faster performance energy loops.",
    genreBonus: MusicGenre.UK_GARAGE,
  },
  {
    id: "ambient_dubber",
    name: "Downtempo Ambient Dubber",
    description: "Glacial tape delays, organic field recordings, spacey minor-chord pads, and cozy chillout focus beats.",
    statBoost: "+30% starting Cash. -30% lower burnout generation.",
    genreBonus: MusicGenre.DOWNTEMPO,
  }
];

const PORTRAITS_DB: { [key: string]: string } = {
  techno_purist: "/src/assets/images/avatar_techno_purist_1779785211830.png",
  edm_superstar: "/src/assets/images/avatar_edm_superstar_1779785231025.png",
  sound_designer: "/src/assets/images/avatar_sound_designer_1779785250169.png",
  nostalgia_runner: "/src/assets/images/avatar_nostalgia_runner_1779785267478.png",
  garage_grime: "https://picsum.photos/seed/ukg/150/150",
  ambient_dubber: "https://picsum.photos/seed/ambient/150/150"
};

// Difficulty levels configuration
export type DifficultyLevel = 'easy' | 'normal' | 'hard' | 'nightmare';

interface DifficultyConfig {
  id: DifficultyLevel;
  name: string;
  description: string;
  startingMoney: number;
  startingFans: number;
  startingHype: number;
  gigEarningsMultiplier: number;
  royaltyMultiplier: number;
  labelRequirementsMultiplier: number;
  burnoutRateMultiplier: number;
  fanGainMultiplier: number;
  inspirationMultiplier: number;
  labelPrestigeBonus: number;
  gearPricesMultiplier: number;
  startingPrestige: number;
  color: string;
  icon: string;
}

export const DIFFICULTY_DB: DifficultyConfig[] = [
  {
    id: 'easy',
    name: 'Easy',
    description: 'Start with more money, earn more from gigs, easier label signing. Perfect for learning the ropes.',
    startingMoney: 2000,
    startingFans: 200,
    startingHype: 40,
    gigEarningsMultiplier: 1.5,
    royaltyMultiplier: 1.2,
    labelRequirementsMultiplier: 0.5,
    burnoutRateMultiplier: 0.5,
    fanGainMultiplier: 1.3,
    inspirationMultiplier: 0.8,
    labelPrestigeBonus: 20,
    gearPricesMultiplier: 0.8,
    startingPrestige: 3,
    color: 'text-emerald-400',
    icon: '🌱',
  },
  {
    id: 'normal',
    name: 'Normal',
    description: 'Balanced challenge. The original experience with moderate difficulty.',
    startingMoney: 550,
    startingFans: 150,
    startingHype: 25,
    gigEarningsMultiplier: 1.0,
    royaltyMultiplier: 1.0,
    labelRequirementsMultiplier: 1.0,
    burnoutRateMultiplier: 1.0,
    fanGainMultiplier: 1.0,
    inspirationMultiplier: 1.0,
    labelPrestigeBonus: 0,
    gearPricesMultiplier: 1.0,
    startingPrestige: 1,
    color: 'text-blue-400',
    icon: '⚡',
  },
  {
    id: 'hard',
    name: 'Hard',
    description: 'Less starting money, harder gigs, stricter label requirements. Veterans only.',
    startingMoney: 300,
    startingFans: 100,
    startingHype: 15,
    gigEarningsMultiplier: 0.8,
    royaltyMultiplier: 0.9,
    labelRequirementsMultiplier: 1.5,
    burnoutRateMultiplier: 1.5,
    fanGainMultiplier: 0.8,
    inspirationMultiplier: 1.3,
    labelPrestigeBonus: -15,
    gearPricesMultiplier: 1.2,
    startingPrestige: 0,
    color: 'text-amber-400',
    icon: '🔥',
  },
  {
    id: 'nightmare',
    name: 'Nightmare',
    description: 'Scarce funds, brutal label standards, maximum burnout speed. Only for the truly devoted.',
    startingMoney: 150,
    startingFans: 50,
    startingHype: 10,
    gigEarningsMultiplier: 0.5,
    royaltyMultiplier: 0.75,
    labelRequirementsMultiplier: 2.0,
    burnoutRateMultiplier: 2.0,
    fanGainMultiplier: 0.6,
    inspirationMultiplier: 1.5,
    labelPrestigeBonus: -30,
    gearPricesMultiplier: 1.5,
    startingPrestige: 0,
    color: 'text-rose-400',
    icon: '💀',
  },
];

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedEthos, setSelectedEthos] = useState<EthosArchetype>(ETHOS_DB[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyConfig>(DIFFICULTY_DB[1]); // Default to Normal
  const [onboardingName, setOnboardingName] = useState("");
  const [activeTab, setActiveTab] = useState<"workspace" | "releases" | "live" | "labels" | "social" | "shop" | "skills" | "editor" | "web">("workspace");
  const [showVirtualBrowser, setShowVirtualBrowser] = useState(false);
  const [preSelectedTrackId, setPreSelectedTrackId] = useState<string>("");
  const [onboardingShowEditor, setOnboardingShowEditor] = useState(false);
  const [showCreateLabelModal, setShowCreateLabelModal] = useState(false);

  // Save slot states
  const [saveSlot1, setSaveSlot1] = useState<GameState | null>(null);
  const [saveSlot2, setSaveSlot2] = useState<GameState | null>(null);
  const [saveSlot3, setSaveSlot3] = useState<GameState | null>(null);

  const loadSlots = () => {
    try {
      const s1 = localStorage.getItem("beatmaker_state_v1_slot_1");
      const s2 = localStorage.getItem("beatmaker_state_v1_slot_2");
      const s3 = localStorage.getItem("beatmaker_state_v1_slot_3");
      setSaveSlot1(s1 ? JSON.parse(s1) : null);
      setSaveSlot2(s2 ? JSON.parse(s2) : null);
      setSaveSlot3(s3 ? JSON.parse(s3) : null);
    } catch(e) {
      console.error("Error loading slots", e);
    }
  };

  // Load game state from local storage on launch
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setGameState(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved game state, starting fresh.");
      }
    }
    loadSlots();
  }, []);

  // Save game state whenever it updates
  const saveState = (updated: GameState) => {
    setGameState(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  };

  const handleSaveToSlot = (slotNumber: number) => {
    if (!gameState) return;
    try {
      const key = `beatmaker_state_v1_slot_${slotNumber}`;
      localStorage.setItem(key, JSON.stringify(gameState));
      loadSlots();
      alert(`Game successfully saved to Slot ${slotNumber}!`);
    } catch(e) {
      alert("Failed to save state.");
    }
  };

  const handleLoadFromSlot = (slotNumber: number) => {
    try {
      const key = `beatmaker_state_v1_slot_${slotNumber}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const loaded = JSON.parse(saved);
        saveState(loaded);
        alert(`Game state loaded from Slot ${slotNumber}!`);
      } else {
        alert("This slot is empty.");
      }
    } catch(e) {
      alert("Failed to load state.");
    }
  };

  const handleExportState = () => {
    if (!gameState) return;
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(gameState, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `beatmaker_career_${gameState.pseudonym.toLowerCase().replace(/\s+/g, '_')}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      alert("Could not export save state.");
    }
  };

  const handleImportState = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result === "string") {
          const loaded = JSON.parse(result);
          if (loaded && loaded.pseudonym && loaded.stats) {
            saveState(loaded);
            alert(`Successfully imported backup. Loaded career: ${loaded.pseudonym}`);
          } else {
            alert("Invalid backup file structure.");
          }
        }
      } catch (err) {
        alert("Could not read backup JSON file.");
      }
    };
    reader.readAsText(file);
  };

  const handleStartNewCareerFlow = () => {
    if (confirm("Proceed to starting a new game? Make sure you have saved your current artist's progress to one of the slots above first, or you will lose it!")) {
      setGameState(null);
    }
  };

  const handleStartNewGame = () => {
    const name = onboardingName.trim() || "DJ BedRoomer";
    
    // Initialize virtual artists pool (top 20 predefined artists as active competitors)
    const virtualArtists = getTopPredefinedArtists(20).map(artist => ({
      ...artist,
      relationship: 0,
      status: (artist.fame > 70 ? "rival" : "neutral") as "rival" | "neutral"
    }));
    
    const initial: GameState = {
      artistName: name,
      pseudonym: name,
      avatarSeed: selectedEthos.id,
      difficulty: selectedDifficulty.id,
      gameDate: { year: 1, month: 1, week: 1 },
      stats: {
        fans: selectedDifficulty.startingFans,
        hype: selectedDifficulty.startingHype,
        prestige: selectedDifficulty.startingPrestige,
        money: selectedDifficulty.startingMoney,
        inspiration: 100, // 0-100
        burnout: 0,       // 0-100
        skillPoints: 2,
      },
      skills: {
        "sound_design": 1,
        "sampling": 1,
        "mixing_eq": 1,
        "limiting_compression": 1,
      },
      gear: ["old_laptop", "freeware_daw", "budget_headphones"],
      tracks: [],
      releases: [],
      signedLabelId: null,
      playerLabelId: null,
      playerLabelName: null,
      tracksDueToLabel: 0,
      currentTrend: WORLD_TRENDS[0],
      log: [
        {
          id: "log_init",
          date: "Y1, M1, W1",
          title: "Bedroom Studio Booted",
          description: `Spawned as a clean ${selectedEthos.name} in a cramped suburban apartment. Plugged in your dusty MIDI keyboard. ${selectedDifficulty.icon} Difficulty: ${selectedDifficulty.name}`,
          type: "system",
        }
      ],
      currentCityId: "bedroom",
      completedGigsCount: 0,
      allTimeEarnings: 0,
      
      // AI Simulation data
      aiReleases: [],
      aiNews: [],
      labelActivities: [],
      virtualArtists
    };
    saveState(initial);
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to completely erase your legendary studio, tracks, and travel logs to start a fresh music career?")) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setGameState(null);
    }
  };

  // Helper: Get difficulty config from difficulty id
const getDifficultyConfig = (difficultyId: string): DifficultyConfig | undefined => {
  return DIFFICULTY_DB.find(d => d.id === difficultyId);
};

// Helper: Log new Event
  const appendLog = (state: GameState, title: string, desc: string, type: any): GameState => {
    const newlog = {
      id: "log_" + Date.now(),
      date: `Y${state.gameDate.year}, M${state.gameDate.month}, W${state.gameDate.week}`,
      title,
      description: desc,
      type,
    };
    return {
      ...state,
      log: [newlog, ...state.log.slice(0, 49)], // Keep up to 50 logs
    };
  };

  // 1. Compose track callback
  const handleComposeTrack = (track: Track) => {
    if (!gameState) return;
    
    // Set time reference
    track.composedAt = `Year ${gameState.gameDate.year}, Month ${gameState.gameDate.month}, Week ${gameState.gameDate.week}`;

    const updated: GameState = {
      ...gameState,
      tracks: [...gameState.tracks, track],
      stats: {
        ...gameState.stats,
        burnout: Math.min(100, gameState.stats.burnout + 14), // composing slightly raises stress
      }
    };

    const final = appendLog(
      updated,
      "New Studio Track Written",
      `Completed mastering on '${track.title}' (${track.primaryGenre}). Sound design ceiling set to ${track.stats.soundDesign}/100.`,
      "release"
    );
    saveState(final);
  };

  // Deduct inspiration during track composing
  const handleDeductInspiration = (amount: number) => {
    if (!gameState) return;
    saveState({
      ...gameState,
      stats: {
        ...gameState.stats,
        inspiration: Math.max(0, gameState.stats.inspiration - amount)
      }
    });
  };

  // 2. Buy studio gear callback
  const handleBuyGear = (gearId: string, cost: number) => {
    if (!gameState) return;
    
    // Add item to inventory
    const updated: GameState = {
      ...gameState,
      gear: [...gameState.gear, gearId],
      stats: {
        ...gameState.stats,
        money: gameState.stats.money - cost,
      }
    };

    const final = appendLog(
      updated,
      "Studio Hardware Upgraded",
      `Acquired pro hardware module and mounted it into your bedroom rack.`,
      "system"
    );
    saveState(final);
  };

  // 3. Level-up educational skills callback
  const handleLevelUpSkill = (skillId: string, pointCost: number) => {
    if (!gameState) return;
    const current = gameState.skills[skillId] || 0;
    
    const updated: GameState = {
      ...gameState,
      skills: {
        ...gameState.skills,
        [skillId]: current + 1
      },
      stats: {
        ...gameState.stats,
        skillPoints: gameState.stats.skillPoints - pointCost
      }
    };

    const final = appendLog(
      updated,
      "Academy Skill Levelled",
      `Upgraded training level to ${current + 1} with deep engineering guides.`,
      "system"
    );
    saveState(final);
  };

  // 4. Record labels demo submit and sign
  const handleSignLabel = (labelId: string, advance: number, dealLength: number) => {
    if (!gameState) return;

    const updated: GameState = {
      ...gameState,
      signedLabelId: labelId,
      tracksDueToLabel: dealLength,
      stats: {
        ...gameState.stats,
        money: gameState.stats.money + advance,
        prestige: Math.min(100, gameState.stats.prestige + 8)
      }
    };

    const final = appendLog(
      updated,
      "Signed Publishing Deal!",
      `Accepted legal label split and collected an advance of $${advance}. We owe ${dealLength} tracks.`,
      "label"
    );
    saveState(final);
  };

  // 4b. Start your own record label
  const handleCreateOwnLabel = () => {
    setShowCreateLabelModal(true);
  };

  const handleConfirmCreateLabel = (labelName: string) => {
    if (!gameState) return;

    const labelId = `player_label_${Date.now()}`;
    const updated: GameState = {
      ...gameState,
      playerLabelId: labelId,
      playerLabelName: labelName,
      stats: {
        ...gameState.stats,
        prestige: Math.min(100, gameState.stats.prestige + 15)
      }
    };

    const final = appendLog(
      updated,
      "Record Label Founded!",
      `Launched your own imprint: "${labelName}". You can now manage releases, sign artists, and build your catalog!`,
      "label"
    );
    saveState(final);
    setShowCreateLabelModal(false);
  };

  // Check if player can create their own label
  const canCreateOwnLabel = gameState && !gameState.playerLabelId && !gameState.signedLabelId && 
                            gameState.stats.fans >= 500 && gameState.stats.prestige >= 60;

  // 5. Release tracks: Self vs. Label
  const executeRelease = async (track: Track, labelId: string | null) => {
    if (!gameState) return;

    let modifiedState = { ...gameState };

    // Process simulation stats
    const released = processRelease(track, labelId, gameState.currentTrend, gameState);

    // Filter track out of unreleased drafts list
    const unreleasedRemaining = gameState.tracks.filter(t => t.id !== track.id);

    // Update contract counters if releasing with signed label
    let nextLabelId = gameState.signedLabelId;
    let nextTracksDue = gameState.tracksDueToLabel;

    if (labelId && gameState.signedLabelId === labelId) {
      nextTracksDue -= 1;
      if (nextTracksDue <= 0) {
        nextLabelId = null; // Contract completed!
        nextTracksDue = 0;
      }
    }

    // Append gains: Fans, Overall Hype, Prestige
    const finalHype = Math.min(100, gameState.stats.hype + released.hypeBoost);
    const finalPrestige = Math.min(100, gameState.stats.prestige + Math.round(released.hypeBoost / 3));

    modifiedState = {
      ...modifiedState,
      tracks: unreleasedRemaining,
      releases: [released, ...gameState.releases],
      signedLabelId: nextLabelId,
      tracksDueToLabel: nextTracksDue,
      stats: {
        ...gameState.stats,
        fans: gameState.stats.fans + Math.round(released.playCount * 0.15),
        hype: finalHype,
        prestige: finalPrestige,
        money: gameState.stats.money + Math.round(released.totalRoyaltiesEarned), // starting stream payout
      }
    };

    // Trigger asynchronous Gemini critique in background to overwrite local blog draft!
    // This is incredibly authentic and prevents locking up the UI.
    try {
      const resp = await fetch("/api/generate-ai-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: released.title,
          primaryGenre: released.primaryGenre,
          secondaryGenre: released.secondaryGenre,
          stats: released.stats,
          artist: gameState.pseudonym,
          rating: Math.round((released.stats.mixingQuality + released.stats.soundDesign) / 2)
        }),
      });
      const data = await resp.json();
      if (data.review) {
        // Find isReleased and edit
        setGameState((current) => {
          if (!current) return null;
          const updatedReleases = current.releases.map(r => 
            r.releaseId === released.releaseId ? { ...r, reviews: [data.review, ...r.reviews.slice(1)] } : r
          );
          return { ...current, releases: updatedReleases };
        });
      }
    } catch (e) {
      console.warn("Asynchronous record critique timed out / bypassed.");
    }

    const final = appendLog(
      modifiedState,
      "Track Released Globally",
      `Distributed '${released.title}' on streaming platforms. Soundclash racked up ${released.playCount} instant plays.`,
      "release"
    );
    saveState(final);
  };

  const handleReleaseWithLabel = (trackId: string, labelId: string) => {
    const track = gameState?.tracks.find(t => t.id === trackId);
    if (track) executeRelease(track, labelId);
  };

  const handleSelfRelease = (trackId: string) => {
    const track = gameState?.tracks.find(t => t.id === trackId);
    if (track) executeRelease(track, null);
  };

  // 6. Traveling between Cities
  const handleTravelToCity = (cityId: string, cost: number) => {
    if (!gameState) return;

    const updated: GameState = {
      ...gameState,
      currentCityId: cityId,
      stats: {
        ...gameState.stats,
        money: gameState.stats.money - cost,
      }
    };

    const final = appendLog(
      updated,
      "Transited HQ Location",
      `Arrived in a new regional electronics gateway. Check local venues to book clubs.`,
      "system"
    );
    saveState(final);
  };

  // 7. Complete gig callback
  const handleCompleteGig = (earnings: number, fansGained: number, prestigeGained: number, burnoutAdded: number, count: number) => {
    if (!gameState) return;

    // Career Level Ups: check prestige levels gaps. For every level-up, award +2 skill points
    const currentPrestige = gameState.stats.prestige;
    const nextPrestige = Math.min(100, currentPrestige + prestigeGained);
    const hasLeveled = Math.floor(nextPrestige / 10) > Math.floor(currentPrestige / 10);
    const pointsAward = hasLeveled ? 2 : 0;

    const updated: GameState = {
      ...gameState,
      completedGigsCount: gameState.completedGigsCount + count,
      stats: {
        ...gameState.stats,
        money: gameState.stats.money + earnings,
        fans: gameState.stats.fans + fansGained,
        prestige: nextPrestige,
        burnout: Math.min(100, gameState.stats.burnout + burnoutAdded),
        skillPoints: gameState.stats.skillPoints + pointsAward,
      }
    };

    const final = appendLog(
      updated,
      "Live DJ Mixing Set Completed",
      `Played gig at our city club. Collected a promoter payout of $${earnings} and gained ${fansGained} active fans! ${hasLeveled ? "CRITICAL CAREER LEVEL UP! +2 SP." : ""}`,
      "gig"
    );
    saveState(final);
  };

  // 8. Travel/Suggest Collabs inside Social tabs
  const handleCollaborate = (artistName: string, fee: number) => {
    if (!gameState) return;

    // Generate a collaborative remix track automatically!
    const stems = {
      beat: "Co-produced Analog Driving Beat",
      bass: `Modular fat heavy low-end by ${artistName}`,
      synth: "Duo customized frequency synthesizer arp loop",
      fx: "Collaborative dynamic sweeps",
      vocal: "Chopped sample vox",
    };

    const track = {
      id: "collab_" + Date.now(),
      title: `${gameState.pseudonym} & ${artistName} - Acid Symmetry (Duo Edit)`,
      primaryGenre: gameState.releases[0]?.primaryGenre || MusicGenre.TECHNO,
      secondaryGenre: MusicGenre.EXPERIMENTAL,
      stats: {
        bpm: 130,
        energy: 88,
        groove: 92,
        soundDesign: 85,
        mixingQuality: 82,
        originality: 95,
        catchiness: 90,
        emotionalTone: 50,
        danceability: 95,
        complexity: 85,
        experimentalFactor: 75,
      },
      composedAt: `Year ${gameState.gameDate.year}, Month ${gameState.gameDate.month}, Week ${gameState.gameDate.week}`,
      stems,
      ideasSpent: 4,
    };

    const updated: GameState = {
      ...gameState,
      tracks: [...gameState.tracks, track],
      stats: {
        ...gameState.stats,
        money: gameState.stats.money - fee,
        prestige: Math.min(100, gameState.stats.prestige + 6),
      }
    };

    const final = appendLog(
      updated,
      "Duo Studio Collaboration",
      `Invited ${artistName} to record custom modules. Remix project filed in your tracks catalog draft.`,
      "release"
    );
    saveState(final);
  };

  // 9. Twitter flame wars / online cancellations
  const handleTriggerDrama = (title: string, desc: string, hypeAward: number, fanChange: number) => {
    if (!gameState) return;

    const updated: GameState = {
      ...gameState,
      stats: {
        ...gameState.stats,
        hype: Math.min(100, gameState.stats.hype + hypeAward),
        fans: Math.max(10, gameState.stats.fans + fanChange),
      }
    };

    const final = appendLog(updated, title, desc, "scandal");
    saveState(final);
  };

  // 10. REST AND MASTER LOOP CYCLE (Increments calendar, recovers stamina, pays streaming passive income!)
  const handleRestAndMasterCycle = async () => {
    if (!gameState) return;

    // Import AI simulation

    // Advance calendar by 1 week
    let week = gameState.gameDate.week + 1;
    let month = gameState.gameDate.month;
    let year = gameState.gameDate.year;

    if (week > 4) {
      week = 1;
      month += 1;
    }
    if (month > 12) {
      month = 1;
      year += 1;
    }

    // Recover creative energy, wash away stress
    const recoveryInspiration = 30 + (gameState.skills["sampling"] || 1) * 3;
    const finalInspiration = Math.min(100, gameState.stats.inspiration + recoveryInspiration);
    const finalBurnout = Math.max(0, gameState.stats.burnout - 35);

    // Calculate passive streaming royalties from ALL historically released tracks!
    // Every track pays a residual dividend per week depending on overall plays.
    let residualPayout = 0;
    const recalculatedReleases = gameState.releases.map((rel) => {
      // Natural weekly plays increase
      const weeklyPlays = Math.round(rel.playCount * (0.05 + Math.random() * 0.05));
      const weeklyEarnings = weeklyPlays * (rel.labelId ? 0.003 : 0.001);
      residualPayout += weeklyEarnings;

      return {
        ...rel,
        playCount: rel.playCount + weeklyPlays,
        totalRoyaltiesEarned: rel.totalRoyaltiesEarned + weeklyEarnings
      };
    });

    // Handle shifting market trends every 4 months (or 16 weeks)
    let nextTrend = gameState.currentTrend;
    let trendLogMsg = "";
    if (week === 1 && (month % 4 === 0)) {
      nextTrend = rollNextTrend(gameState.currentTrend.id);
      trendLogMsg = `Global electronic market trends shifted! Focus: "${nextTrend.name}".`;

      // Optionally call mock/real AI trend generator endpoint to draft an alternate scenario
      try {
        const resp = await fetch("/api/generate-ai-trend", { method: "POST" });
        const data = await resp.json();
        if (data.trend) {
          nextTrend = {
            id: "ai_" + Date.now(),
            name: data.trend.name,
            description: data.trend.description,
            hotGenre: data.trend.hotGenre as MusicGenre,
            decayingGenre: data.trend.decayingGenre as MusicGenre,
            hypeMultiplier: 1.5,
            durationMonths: 4,
            source: data.trend.source,
          };
          trendLogMsg = `Global market shift: "${nextTrend.name}". ${nextTrend.description}`;
        }
      } catch (err) {}
    }

    // Simulate AI scene for this week
    const simulationResult = simulateAIScene(gameState, 1);
    
    // Update virtual artists' fame
    const updatedVirtualArtists = updateArtistFame(
      gameState.virtualArtists || [],
      simulationResult.fameChanges
    );

    // Limit stored AI data to last 50 items each
    const maxStoredAI = 50;
    const newAIReleases = [...(simulationResult.newReleases || []), ...(gameState.aiReleases || [])].slice(0, maxStoredAI);
    const newAINews = [...(simulationResult.newNews || []), ...(gameState.aiNews || [])].slice(0, maxStoredAI);
    const newLabelActivities = [...(simulationResult.newActivities || []), ...(gameState.labelActivities || [])].slice(0, maxStoredAI);

    // Build the updated state object
    let updated: GameState = {
      ...gameState,
      gameDate: { year, month, week },
      releases: recalculatedReleases,
      currentTrend: nextTrend,
      aiReleases: newAIReleases,
      aiNews: newAINews,
      labelActivities: newLabelActivities,
      virtualArtists: updatedVirtualArtists,
      stats: {
        ...gameState.stats,
        inspiration: finalInspiration,
        burnout: finalBurnout,
        money: gameState.stats.money + Math.round(residualPayout),
        hype: Math.max(0, gameState.stats.hype - 3), // Hype decays naturally over time (-3% per week)
      }
    };

    // Build simulation summary for log
    const aiSummaryParts = [];
    if (simulationResult.newReleases.length > 0) {
      aiSummaryParts.push(`${simulationResult.newReleases.length} releases`);
    }
    if (simulationResult.newNews.length > 0) {
      aiSummaryParts.push(`${simulationResult.newNews.length} news posts`);
    }
    const aiSummary = aiSummaryParts.length > 0 ? ` | AI Scene: ${aiSummaryParts.join(', ')}` : '';

    // Log the rested outcomes
    updated = appendLog(
      updated,
      `Master Loop Calendar Tick: Week ${year}.${month}.${week}`,
      `Took a baseline break. Refueled +${recoveryInspiration} creative ideas and recovered stress. Passive plays generated $${Math.round(residualPayout)} streaming royalties. ${trendLogMsg}${aiSummary}`,
      "system"
    );

    saveState(updated);
  };

  return (
    <div className="min-h-screen bg-[#050507] text-[#E0E0E0] flex flex-col font-sans selection:bg-[#00FF95]/30 selection:text-white relative overflow-hidden">
      {/* Virtual Browser Modal */}
      {showVirtualBrowser && (
        <VirtualBrowser
          gameState={gameState}
          onClose={() => setShowVirtualBrowser(false)}
        />
      )}
      
      {/* Subtle Scanline Retro Overlay */}
      <div className="absolute inset-0 pointer-events-none scanline opacity-[0.03] z-[999]" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(255,0,255,0.08),transparent_50%)] z-0" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_bottom_left,rgba(0,255,149,0.06),transparent_50%)] z-0" />
      
      {/* Dynamic Header HUD and Navigation rails */}
      {gameState ? (
        <>
          {/* Main Top Header HUD with Neon Accents */}
          <header className="bg-[#0A0A0C]/90 backdrop-blur-md border-b border-[#1A1A1E] px-4 py-3 sticky top-0 z-50 neon-border">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              
              {/* Profile card and calendar */}
              <div className="flex items-center space-x-3.5">
                <div className="h-11 w-11 rounded-xl overflow-hidden border border-purple-500/35 flex items-center justify-center shadow-lg relative bg-black flex-shrink-0">
                  <img
                    src={PORTRAITS_DB[gameState.avatarSeed] || PORTRAITS_DB["techno_purist"]}
                    alt={gameState.pseudonym}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-0 right-0 p-0.5 leading-none bg-black/85 rounded-bl border-b border-l border-slate-800">
                    <Disc className="h-2 w-2 text-[#00FF95] animate-spin" style={{ animationDuration: "12s" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-display font-medium text-sm text-white tracking-tight">{gameState.pseudonym}</span>
                    <span className="text-[10px] font-mono text-[#00FF95] bg-[#050507] border border-[#1A1A1E] px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                      LEVEL {Math.floor(gameState.stats.prestige / 10) + 1}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono mt-0.5">
                    <Calendar className="h-3.5 w-3.5 text-[#FF00FF]" />
                    <span>Y{gameState.gameDate.year} · M{gameState.gameDate.month} · W{gameState.gameDate.week}</span>
                  </div>
                </div>
              </div>

              {/* Numerical Status Metrics */}
              <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs font-mono">
                
                {/* Followers */}
                <div className="bg-[#0A0A0C] border border-[#1A1A1E] py-1.5 px-3 rounded-lg flex items-center space-x-2">
                  <span className="p-1 rounded bg-[#050507] text-[#00FF95]">
                    <Users className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <span className="text-slate-500 block text-[9px] tracking-wider uppercase">FANS</span>
                    <strong className="text-white">{gameState.stats.fans}</strong>
                  </div>
                </div>

                {/* Hype */}
                <div className="bg-[#0A0A0C] border border-[#1A1A1E] py-1.5 px-3 rounded-lg flex items-center space-x-2">
                  <span className="p-1 rounded bg-[#050507] text-[#FF00FF]">
                    <TrendingUp className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <span className="text-slate-500 block text-[9px] tracking-wider uppercase">HYPE</span>
                    <strong className="text-white">{gameState.stats.hype}%</strong>
                  </div>
                </div>

                {/* Prestige */}
                <div className="bg-[#0A0A0C] border border-[#1A1A1E] py-1.5 px-3 rounded-lg flex items-center space-x-2">
                  <span className="p-1 rounded bg-[#050507] text-[#00FF95]">
                    <Trophy className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <span className="text-slate-500 block text-[9px] tracking-wider uppercase">PRESTIGE</span>
                    <strong className="text-white">{gameState.stats.prestige}/100</strong>
                  </div>
                </div>

                {/* Bankroll */}
                <div className="bg-[#0A0A0C] border border-[#1A1A1E] py-1.5 px-3 rounded-lg flex items-center space-x-2">
                  <span className="p-1 rounded bg-[#050507] text-amber-400">
                    <DollarSign className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <span className="text-slate-500 block text-[9px] tracking-wider uppercase">BANKROLL</span>
                    <strong className="text-[#00FF95] font-bold">${gameState.stats.money}</strong>
                  </div>
                </div>

                {/* Burnout stress tracking */}
                <div className="bg-[#0A0A0C] border border-[#1A1A1E] py-1.5 px-3 rounded-lg flex items-center space-x-2 w-32 md:w-auto">
                  <span className="p-1 rounded bg-[#050507] text-[#FF00FF]">
                    <Heart className="h-3.5 w-3.5 animate-pulse" />
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center text-[9px] text-slate-500">
                      <span>BURNOUT</span>
                      <span className={gameState.stats.burnout >= 75 ? "text-[#FF00FF] font-black" : "text-slate-400"}>{gameState.stats.burnout}%</span>
                    </div>
                    <div className="w-16 bg-[#050507] rounded-full h-1 overflow-hidden mt-1">
                      <div className="bg-[#FF00FF] h-1" style={{ width: `${gameState.stats.burnout}%` }} />
                    </div>
                  </div>
                </div>

                {/* MASTER CLOCK REST BUTTON */}
                <button
                  onClick={handleRestAndMasterCycle}
                  className="bg-[#111114] hover:bg-[#1A1A1E] text-[#00FF95] border border-[#00FF95]/40 px-3.5 py-2 rounded-lg font-sans font-bold flex items-center shadow-lg transition-all text-xs hover:shadow-[#00FF95]/10 font-display uppercase tracking-wider relative active:scale-95 cursor-pointer ml-auto xl:ml-0 neon-glow"
                >
                  <Calendar className="h-4 w-4 mr-1.5 text-[#00FF95]" />
                  Tick Week & Rest
                </button>
              </div>

            </div>
          </header>

          {/* Sub-Header: Active trend bar notification */}
          <section className="bg-[#FF00FF]/5 border-b border-[#1A1A1E] py-2.5 px-4 text-xs z-10 relative">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center space-x-2">
                <span className="bg-[#050507]/90 border border-[#FF00FF]/50 text-[#FF00FF] font-mono text-[9px] px-2 py-0.5 rounded font-bold animate-pulse uppercase tracking-wider">
                  ACTIVE MUSIC TREND
                </span>
                <span className="font-display font-bold text-white text-[13px]">{gameState.currentTrend.name}</span>
                <span className="text-slate-500 font-mono text-[10px]">({gameState.currentTrend.source})</span>
              </div>
              <div className="text-[11px] text-slate-400 max-w-xl truncate leading-normal font-mono">
                {gameState.currentTrend.description} Boost: <strong className="text-[#00FF95]">{gameState.currentTrend.hotGenre}</strong>, decay: <strong className="text-[#FF00FF]">{gameState.currentTrend.decayingGenre}</strong>.
              </div>
            </div>
          </section>

          {/* Core Content Arena with tab rails */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start z-10 relative">
            
            {/* LEFT COLUMN: Main Tabs Nav rail */}
            <div className="lg:col-span-2 space-y-2">
              <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#00FF95] px-2 block font-medium">STUDIO CHANNELS</h4>
              
              <button
                onClick={() => setActiveTab("workspace")}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold font-sans flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === "workspace"
                    ? "bg-[#111114] text-[#00FF95] font-bold border-l-4 border-[#00FF95] neon-glow"
                    : "text-slate-400 hover:bg-[#111114]/60 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2"><Disc className="h-4 w-4" /> Studio DAW</span>
                <span className="text-[9px] font-mono bg-[#050507] border border-[#1A1A1E] px-1.5 py-0.2 rounded text-[#00FF95] font-bold">{gameState.tracks.length} drafts</span>
              </button>

              <button
                onClick={() => setActiveTab("releases")}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold font-sans flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === "releases"
                    ? "bg-[#111114] text-[#00FF95] font-bold border-l-4 border-[#00FF95] neon-glow"
                    : "text-slate-400 hover:bg-[#111114]/60 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2"><Music className="h-4 w-4" /> Releases Catalog</span>
                <span className="text-[9px] font-mono bg-[#050507] border border-[#1A1A1E] px-1.5 py-0.2 rounded text-[#00FF95] font-bold">{gameState.releases.length} out</span>
              </button>

              <button
                onClick={() => setActiveTab("live")}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold font-sans flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === "live"
                    ? "bg-[#111114] text-[#00FF95] font-bold border-l-4 border-[#00FF95] neon-glow"
                    : "text-slate-400 hover:bg-[#111114]/60 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Live Gigs & Tour</span>
              </button>

              <button
                onClick={() => setActiveTab("labels")}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold font-sans flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === "labels"
                    ? "bg-[#111114] text-[#00FF95] font-bold border-l-4 border-[#00FF95] neon-glow"
                    : "text-slate-400 hover:bg-[#111114]/60 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2"><Award className="h-4 w-4" /> Labels Signing</span>
              </button>

              <button
                onClick={() => setActiveTab("social")}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold font-sans flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === "social"
                    ? "bg-[#111114] text-[#00FF95] font-bold border-l-4 border-[#00FF95] neon-glow"
                    : "text-slate-400 hover:bg-[#111114]/60 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /> Forums & Rivalry</span>
              </button>

              <button
                onClick={() => setActiveTab("shop")}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold font-sans flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === "shop"
                    ? "bg-[#111114] text-[#00FF95] font-bold border-l-4 border-[#00FF95] neon-glow"
                    : "text-slate-400 hover:bg-[#111114]/60 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2"><Zap className="h-4 w-4" /> Studio Upgrade</span>
                <span className="text-[9px] font-mono bg-[#050507] border border-[#1A1A1E] px-1.5 py-0.2 rounded text-[#00FF95] font-bold">Hardware</span>
              </button>

              <button
                onClick={() => setActiveTab("skills")}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold font-sans flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === "skills"
                    ? "bg-[#111114] text-[#00FF95] font-bold border-l-4 border-[#00FF95] neon-glow"
                    : "text-slate-400 hover:bg-[#111114]/60 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2"><Trophy className="h-4 w-4" /> Skills Academy</span>
                <span className="text-[10px] text-[#00FF95] font-bold bg-[#00FF95]/10 px-1 py-0.2 border border-[#00FF95]/30 rounded">{gameState.stats.skillPoints} SP</span>
              </button>

              <button
                onClick={() => setActiveTab("scene")}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold font-sans flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === "scene"
                    ? "bg-[#111114] text-[#FF00FF] font-bold border-l-4 border-[#FF00FF] neon-glow"
                    : "text-slate-400 hover:bg-[#111114]/60 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2"><Globe className="h-4 w-4" /> Scene Monitor</span>
                <span className="text-[9px] font-mono bg-[#050507] border border-[#1A1A1E] px-1.5 py-0.2 rounded text-[#FF00FF] font-bold">
                  {(gameState.aiReleases || []).length + (gameState.aiNews || []).length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("editor")}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold font-sans flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === "editor"
                    ? "bg-[#111114] text-[#00FF95] font-bold border-l-4 border-[#00FF95] neon-glow"
                    : "text-slate-400 hover:bg-[#111114]/60 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2"><Database className="h-4 w-4" /> Modding & Editor</span>
                <span className="text-[9px] font-mono bg-[#00FF95]/10 border border-[#00FF95]/20 px-1.5 py-0.2 rounded text-[#00FF95] font-bold">DEV V2</span>
              </button>

              <button
                onClick={() => setActiveTab("web")}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold font-sans flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === "web"
                    ? "bg-[#111114] text-[#FF00FF] font-bold border-l-4 border-[#FF00FF] neon-glow"
                    : "text-slate-400 hover:bg-[#111114]/60 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2"><Globe className="h-4 w-4" /> Scene Browser</span>
                <span className="text-[9px] font-mono bg-[#FF00FF]/10 border border-[#FF00FF]/20 px-1.5 py-0.2 rounded text-[#FF00FF] font-bold">🌐</span>
              </button>

              {/* SAVE / LOAD & NEW GAME SYSTEM */}
              <div id="save-load-system-panel" className="pt-6 mt-6 border-t border-[#1A1A1E] space-y-4 font-mono text-left">
                <span className="block text-[9.5px] uppercase tracking-wider text-[#FF00FF] font-bold">Save & Load Center</span>

                {/* Slot controls */}
                <div className="space-y-2 animate-fadeIn">
                  {[1, 2, 3].map((num) => {
                    const slotData = num === 1 ? saveSlot1 : num === 2 ? saveSlot2 : saveSlot3;
                    return (
                      <div key={num} className="bg-slate-950/60 p-2 border border-[#1A1A1E] rounded-lg text-[10px] space-y-1.5 hover:border-slate-800 transition-all">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-300">Slot {num}</span>
                          <span className="text-[8.5px] text-slate-500">
                            {slotData ? `Y${slotData.gameDate?.year || 1} M${slotData.gameDate?.month || 1}` : "Empty"}
                          </span>
                        </div>
                        {slotData ? (
                          <div className="text-[9px] text-[#00FF95]/90 truncate leading-snug">
                            {slotData.pseudonym} ({slotData.avatarSeed ? slotData.avatarSeed.replace('_', ' ') : 'Producer'})
                          </div>
                        ) : (
                          <div className="text-[9px] text-slate-600 italic">No historical backup saved</div>
                        )}
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          <button
                            onClick={() => handleSaveToSlot(num)}
                            className="bg-purple-950/20 hover:bg-purple-900/30 text-purple-350 hover:text-purple-200 border border-purple-500/20 hover:border-purple-500/40 text-[9px] py-1 px-1.5 rounded transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1 font-bold"
                          >
                            Save Active
                          </button>
                          <button
                            onClick={() => handleLoadFromSlot(num)}
                            disabled={!slotData}
                            className="bg-emerald-950/20 hover:bg-emerald-900/30 text-[#00FF95] hover:text-[#00FF95]/90 border border-[#00FF95]/20 hover:border-[#00FF95]/40 text-[9px] py-1 px-1.5 rounded transition-all cursor-pointer active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-1 font-bold"
                          >
                            Load
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Import / Export Backup and New Career action */}
                <div className="space-y-1.5 pt-1">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleExportState}
                      className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/30 hover:border-slate-650 rounded px-2 py-1.5 text-[9px] transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95"
                      title="Download backup file"
                    >
                      Export File
                    </button>
                    <label className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/30 hover:border-slate-650 rounded px-2 py-1.5 text-[9px] cursor-pointer transition-all flex items-center justify-center gap-1 active:scale-95 text-center">
                      Import File
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportState}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <button
                    onClick={handleStartNewCareerFlow}
                    className="w-full bg-cyan-950/20 hover:bg-cyan-900/30 text-cyan-400 hover:text-cyan-350 border border-cyan-500/25 hover:border-cyan-500/40 rounded py-1.5 text-[9px] transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95 font-bold"
                  >
                    🚀 New Game (New Artist)
                  </button>

                  <button
                    onClick={handleReset}
                    className="w-full text-center text-red-500/40 hover:text-red-400 text-[8px] hover:underline transition-all block pt-2 cursor-pointer"
                  >
                    Erase Save & Factory Reset
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Center display workspace slots */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Tabs Content router switch */}
              {activeTab === "workspace" && (
                <div className="space-y-6">
                  {/* Master EQ spectrum scope output */}
                  <AudioVisualizer 
                    bpm={gameState.releases[0]?.stats.bpm || 135} 
                    energy={gameState.releases[0]?.stats.energy || 75} 
                    isPlaying={true} 
                  />

                  {/* Bedroom compose rack */}
                  <DAWTrackCreator
                    gameState={gameState}
                    onComposeTrack={handleComposeTrack}
                    onDeductInspiration={handleDeductInspiration}
                  />

                  {/* Finished unreleased drafts catalog box */}
                  <div className="bg-[#0A0A0C] border border-[#1A1A1E] p-5 rounded-xl shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-1 w-20 bg-gradient-to-r from-transparent to-[#00FF95]" />
                    <h3 className="text-sm font-sans font-bold text-white mb-3 block border-b border-[#1A1A1E] pb-2 flex items-center gap-2">
                      <span className="text-[#00FF95]">🎹</span> Studio Drawers — Unreleased Track Drafts
                    </h3>
                    
                    {gameState.tracks.length > 0 ? (
                      <div className="space-y-2.5 mt-2">
                        {gameState.tracks.map((track) => (
                          <div key={track.id} className="bg-[#050507] p-3.5 rounded-lg border border-[#1A1A1E] flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              {/* LP Artwork cover display */}
                              <div className="h-10 w-10 rounded-md overflow-hidden border border-[#1A1A1E] bg-black flex-shrink-0">
                                <img
                                  src={track.artworkUrl || `https://picsum.photos/seed/${encodeURIComponent(track.title)}/100/100`}
                                  alt={track.title}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div className="space-y-1 min-w-0 flex-1">
                                <span className="font-bold text-xs text-white block truncate uppercase tracking-tight">{track.title}</span>
                                <div className="flex flex-wrap gap-1.5 text-[9px] font-mono text-slate-400">
                                  <span className="bg-[#111114] px-1.5 py-0.5 border border-[#1A1A1E] rounded text-[#00FF95]">{track.primaryGenre}</span>
                                  {track.secondaryGenre && <span className="bg-[#111114] px-1.5 py-0.5 border border-[#1A1A1E] rounded">+ {track.secondaryGenre}</span>}
                                  <span>| Sound: {track.stats.soundDesign}/100</span>
                                  <span>| Mix EQ: {track.stats.mixingQuality}/100</span>
                                  <span>| Ideas: {track.ideasSpent}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                              <button
                                onClick={() => {
                                  handleSelfRelease(track.id);
                                }}
                                className="text-[10px] font-mono bg-emerald-600 hover:bg-emerald-550 border border-emerald-500/20 px-3 py-1.5 text-white rounded-lg font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1 shadow-md"
                              >
                                <Sparkles className="h-3.5 w-3.5 text-emerald-200" /> DIY Self-Release
                              </button>

                              <button
                                onClick={() => {
                                  setPreSelectedTrackId(track.id);
                                  setActiveTab("labels");
                                }}
                                className="text-[10px] font-mono bg-[#111114] text-[#00FF95] border border-[#00FF95]/30 px-3 py-1.5 hover:border-[#00FF95] hover:bg-[#00FF95]/10 rounded-lg font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                              >
                                <Award className="h-3.5 w-3.5" /> Pitch Labels
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 font-mono italic leading-relaxed text-center py-6 bg-[#050507] border border-dashed border-[#1A1A1E] rounded-lg">
                        Crank out some original drafts inside the Studio DAW above using modular loops!
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "releases" && (
                gameState.playerLabelId ? (
                  <ReleaseManagement 
                    gameState={gameState} 
                    playerLabelId={gameState.playerLabelId}
                    playerLabelName={gameState.playerLabelName || "My Record Label"}
                  />
                ) : (
                <div className="bg-[#0A0A0C] border border-[#1A1A1E] p-5 rounded-xl space-y-4 shadow-lg">
                  <div>
                    <h2 className="text-base font-display font-bold text-white tracking-tight">Rave Streaming Portal (Soundclash Analytics)</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Manage released catalogs, listen to critics reviews and digital streams feedback reels.</p>
                  </div>

                  {gameState.releases.length > 0 ? (
                    <div className="space-y-4 mt-2">
                      {gameState.releases.map((rel) => {
                        const totalScore = Math.round((rel.stats.mixingQuality + rel.stats.soundDesign + rel.stats.catchiness + rel.stats.groove) / 4);
                        
                        return (
                          <div key={rel.releaseId} className="bg-[#050507] p-4 rounded-xl border border-[#1A1A1E] space-y-3 shadow-md select-text relative overflow-hidden">
                            
                            {/* Track row detail */}
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 border-b border-[#1A1A1E] pb-3">
                              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                {/* LP Cover artwork */}
                                <div className="h-11 w-11 rounded-lg overflow-hidden border border-[#1A1A1E] bg-black flex-shrink-0 shadow-lg relative">
                                  <img
                                    src={rel.artworkUrl || `https://picsum.photos/seed/${encodeURIComponent(rel.title)}/100/100`}
                                    alt={rel.title}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <div className="space-y-0.5 min-w-0 flex-1">
                                  <div className="flex items-center space-x-2 flex-wrap gap-y-1 leading-none">
                                    <span className="font-extrabold text-xs text-white uppercase tracking-tight truncate">{rel.title}</span>
                                    <span className="text-[8px] font-mono tracking-wider bg-[#FF00FF]/15 border border-[#FF00FF]/30 px-2 py-0.5 rounded text-[#FF00FF] font-black uppercase">
                                      SCORE: {totalScore}/100
                                    </span>
                                  </div>
                                  <div className="text-[10px] font-mono text-slate-400 flex gap-1.5 flex-wrap">
                                    <span>Released: {rel.releaseDate}</span>
                                    <span>| Genre: <strong className="text-[#00FF95]/90 font-bold">{rel.primaryGenre}</strong></span>
                                    <span>| {rel.stats.bpm} bpm</span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right font-mono text-[11px] sm:text-right text-left flex-shrink-0">
                                <span className="text-slate-500 block text-[9px] tracking-wide uppercase">TOTAL PLAYS</span>
                                <strong className="text-[#00FF95] font-extrabold">{rel.playCount.toLocaleString()} plays</strong>
                                <span className="block text-[8px] text-slate-400">Royalties: ${Math.round(rel.totalRoyaltiesEarned)}</span>
                              </div>
                            </div>

                            {/* Critics feedback block */}
                            {rel.reviews && rel.reviews.length > 0 && (
                              <div className="p-3 bg-[#0A0A0C] border border-[#1A1A1E] rounded-lg text-xs font-mono text-slate-300 leading-normal relative">
                                <div className="absolute top-2.5 right-3 text-[8px] uppercase font-bold tracking-wider text-[#FF00FF] flex items-center gap-1 animate-pulse">
                                  <Award className="h-3 w-3 text-[#FF00FF]" /> Live Critique
                                </div>
                                {rel.reviews[0]}
                              </div>
                            )}

                            {/* Fan tweets ticker block */}
                            {rel.socialBuzz && rel.socialBuzz.length > 0 && (
                              <div className="space-y-1 mt-2 font-mono text-[10px]">
                                <span className="block text-[#00FF95] uppercase pb-1 text-[8px] tracking-widest font-bold">Twitter Fan Reaction Ticker</span>
                                <div className="bg-[#0A0A0C]/40 border border-[#1A1A1E] rounded p-2 text-slate-400 grid grid-cols-1 sm:grid-cols-2 gap-1.5 leading-tight">
                                  {rel.socialBuzz.map((tweet, tid) => (
                                    <div key={tid} className="border-b border-[#050507] pb-1 last:border-0 text-[10px]">{tweet}</div>
                                  ))}
                                </div>
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 font-mono italic text-center py-8 bg-[#050507] rounded-lg border border-dashed border-[#1A1A1E]">
                      No released tracks in catalog. Submit a finished bedroom demo to music labels or self-release independently inside the DAW Studio drawers.
                    </p>
                  )}
                </div>
                )
              )}

              {activeTab === "live" && gameState && (() => {
                const diff = getDifficultyConfig(gameState.difficulty);
                return (
                  <GigBooking
                    gameState={gameState}
                    onCompleteGig={handleCompleteGig}
                    onTravelToCity={handleTravelToCity}
                    onSaveState={saveState}
                    difficultyMultiplier={diff?.gigEarningsMultiplier || 1}
                    difficultyFanMultiplier={diff?.fanGainMultiplier || 1}
                    difficultyBurnoutMultiplier={diff?.burnoutRateMultiplier || 1}
                  />
                );
              })()}

              {activeTab === "labels" && (
                <RecordLabelsCatalog
                  gameState={gameState}
                  onSignLabel={handleSignLabel}
                  onReleaseWithLabel={handleReleaseWithLabel}
                  onSelfRelease={handleSelfRelease}
                  preSelectedTrackId={preSelectedTrackId}
                  setPreSelectedTrackId={setPreSelectedTrackId}
                  onCreateOwnLabel={handleCreateOwnLabel}
                  canCreateOwnLabel={canCreateOwnLabel}
                />
              )}

              {activeTab === "social" && (
                <SocialDramaForum
                  gameState={gameState}
                  onModifyRelationship={(id, delta, status) => {}}
                  onTriggerDrama={handleTriggerDrama}
                  onCollaborate={handleCollaborate}
                />
              )}

              {activeTab === "shop" && (
                <UpgradableGearShop
                  gameState={gameState}
                  onBuyGear={handleBuyGear}
                />
              )}

              {activeTab === "skills" && (
                <SkillsTree
                  gameState={gameState}
                  onLevelUpSkill={handleLevelUpSkill}
                />
              )}

              {activeTab === "scene" && (
                <AIDashboard gameState={gameState} />
              )}

              {activeTab === "editor" && (
                <DataModEditor
                  gameState={gameState}
                  setGameState={setGameState}
                />
              )}

              {activeTab === "web" && (
                <div className="text-center py-8">
                  <p className="text-slate-400 font-mono text-sm mb-4">Virtual Scene Browser opens in full screen mode</p>
                  <button
                    onClick={() => setShowVirtualBrowser(true)}
                    className="px-6 py-3 bg-[#00FF95] text-black font-bold rounded-lg hover:bg-[#00FF95]/90 transition-colors"
                  >
                    🌐 Open Virtual Browser
                  </button>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN: Event Logger & Career milestones telemetry */}
            <div className="lg:col-span-3 space-y-4 font-mono">
              
              {/* Studio equipment HUD */}
              <div className="bg-[#0A0A0C] border border-[#1A1A1E] p-4 rounded-xl space-y-2.5 text-xs shadow-md">
                <span className="text-[10px] font-mono text-[#00FF95] font-bold uppercase block tracking-wider">HARDWARE STUDIO DOCK</span>
                
                <div className="space-y-1.5 text-slate-350 font-mono text-[10px] pt-1 border-t border-[#1A1A1E]">
                  {gameState.gear.map((gid) => (
                    <div key={gid} className="flex items-center space-x-2 pb-1.5 border-b border-[#050507] last:border-0 last:pb-0">
                      <span className="text-[#00FF95] font-bold text-xs">✔</span>
                      <span className="text-white font-medium">{gid.replace(/_/g, " ").toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Event Logs */}
              <div className="bg-[#0A0A0C] border border-[#1A1A1E] p-4 rounded-xl shadow-md">
                <span className="text-[10px] font-mono text-[#00FF95] font-bold uppercase block mb-2 border-b border-[#1A1A1E] pb-1.5 tracking-wider">LIVE TICKER OUTPUT Log</span>
                
                <div className="max-h-[350px] overflow-y-auto space-y-3 pr-1 font-mono text-[10px] select-text">
                  {gameState.log.map((log) => (
                    <div key={log.id} className="border-b border-[#050507] pb-2.5 last:border-0 leading-normal">
                      <div className="flex justify-between text-slate-500 text-[9px]">
                        <span>{log.date}</span>
                        <span className={`text-[8px] font-bold tracking-wider px-1 rounded bg-[#050507] border ${
                          log.type === "scandal" ? "text-[#FF00FF] border-[#FF00FF]/25" : log.type === "gig" ? "text-cyan-400 border-cyan-400/25" : "text-[#00FF95] border-[#00FF95]/25"
                        }`}>{log.type.toUpperCase()}</span>
                      </div>
                      <span className="font-bold text-white block mt-1">{log.title}</span>
                      <p className="text-slate-400 text-[9px] mt-0.5 leading-relaxed">{log.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </main>
        </>
      ) : onboardingShowEditor ? (
        /* Editor view - full screen standalone mod editor */
        <div className="fixed inset-0 z-[100] bg-[#0A0A0C] overflow-hidden flex flex-col">
          {/* Back button header */}
          <div className="bg-[#050507] border-b border-[#1A1A1E] px-4 py-3 flex items-center justify-between flex-shrink-0">
            <button
              onClick={() => setOnboardingShowEditor(false)}
              className="flex items-center gap-2 bg-[#111114] hover:bg-[#1A1A1E] text-slate-300 hover:text-white border border-[#1A1A1E] hover:border-slate-700 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all active:scale-95"
            >
              <span className="text-lg">←</span>
              <span>Back to Artist Selection</span>
            </button>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-mono text-slate-500">MODDING STUDIO // WORKSHOP</span>
              <div className="h-6 w-px bg-[#1A1A1E]" />
              <span className="text-xs font-mono text-[#00FF95]">Ready to create!</span>
            </div>
          </div>
          
          {/* Editor content - takes remaining space */}
          <div className="flex-1 overflow-hidden">
            <DataModEditor
              gameState={null}
              setGameState={setGameState}
              standaloneMode={true}
            />
          </div>
        </div>
      ) : (
        /* Career splash screen (onboarding launch screen) */
        <div className="flex-1 flex items-center justify-center p-4 relative z-10">
          <div className="bg-[#0A0A0C] border border-[#1A1A1E] rounded-3xl p-6 md:p-8 max-w-xl w-full text-center space-y-6 relative overflow-hidden shadow-2xl neon-border">
            
            {/* Ambient cyber grid shapes */}
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#FF00FF]/5 to-transparent pointer-events-none" />
            <div className="absolute -top-10 -right-10 leading-0 pointer-events-none opacity-5">
              <Disc className="h-60 w-60 animate-spin text-[#00FF95]" style={{ animationDuration: "25s" }} />
            </div>

            <div className="space-y-3 relative z-10">
              <div className="inline-flex p-4 bg-[#FF00FF]/10 border border-[#FF00FF]/30 text-[#FF00FF] rounded-2xl mb-1 items-center justify-center animate-pulse magenta-glow">
                <Music className="h-7 w-7 text-[#FF00FF]" />
              </div>
              <h1 className="text-3xl font-display font-bold tracking-tight text-white flex items-center justify-center gap-2 uppercase">
                BEATMAKER LEGEND
              </h1>
              <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans leading-relaxed">
                Emerge from your suburban bedroom as an unknown modular live looping artist. Code synthesizer waveforms and rise to legendary status in deep rave scenes.
              </p>
            </div>

            {/* Input fields selectors */}
            <div className="space-y-4 max-w-sm mx-auto relative z-10 text-left">
              <div>
                <label className="block text-[10px] font-mono text-[#00FF95] uppercase tracking-widest mb-1.5 font-bold">ARTIST PSEUDONYM / DJ LABEL</label>
                <input
                  type="text"
                  placeholder="e.g. Subharmonic Phantom, DJ Acid_Flow..."
                  value={onboardingName}
                  onChange={(e) => setOnboardingName(e.target.value)}
                  maxLength={25}
                  className="w-full bg-[#050507] border border-[#1A1A1E] rounded-xl px-4 py-3 text-white text-sm focus:outline-hidden focus:border-[#00FF95]/60 focus:ring-1 focus:ring-[#00FF95]/60 transition-all font-mono"
                />
              </div>

              {/* Producer Ethos Archetypes selectors */}
              <div>
                <label className="block text-[10px] font-mono text-[#00FF95] uppercase tracking-widest mb-1.5 font-bold">AESTHETIC & MODULAR ETHOS</label>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  {ETHOS_DB.map((ethos) => (
                    <div
                      key={ethos.id}
                      onClick={() => setSelectedEthos(ethos)}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between h-20 leading-snug ${
                        selectedEthos.id === ethos.id
                          ? "bg-[#111114] border-[#00FF95] text-white"
                          : "bg-[#050507] border-[#1A1A1E] hover:border-[#FF00FF]/30 text-slate-450"
                      }`}
                    >
                      <span className="font-bold text-[10px] block text-white">{ethos.name}</span>
                      <span className="text-[8px] text-slate-400 mt-1 block h-8 overflow-hidden font-sans uppercase tracking-tight">{ethos.description}</span>
                    </div>
                  ))}
                </div>

                {/* Selected Ethos avatar portrait preview */}
                <div className="flex items-center gap-3.5 bg-[#111114] p-3 rounded-xl border border-[#1A1A1E]">
                  <div className="h-14 w-14 rounded-lg overflow-hidden border border-purple-500/30 flex-shrink-0 bg-black">
                    <img
                      src={PORTRAITS_DB[selectedEthos.id]}
                      alt={selectedEthos.name}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <span className="text-[8.5px] font-mono text-[#FF00FF] uppercase tracking-widest font-black block leading-none mb-1">Class Portrait Loaded</span>
                    <span className="text-xs font-bold text-white block leading-tight">{selectedEthos.name}</span>
                    <span className="text-[9px] text-slate-350 leading-none block mt-0.5">Focus Genre: {selectedEthos.genreBonus}</span>
                  </div>
                </div>
              </div>

              {/* Difficulty Level selector */}
              <div>
                <label className="block text-[10px] font-mono text-[#FF00FF] uppercase tracking-widest mb-1.5 font-bold">CAREER DIFFICULTY</label>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {DIFFICULTY_DB.map((diff) => (
                    <div
                      key={diff.id}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`p-2 rounded-lg border cursor-pointer transition-all text-center ${
                        selectedDifficulty.id === diff.id
                          ? "bg-[#111114] border-[#FF00FF] text-white"
                          : "bg-[#050507] border-[#1A1A1E] hover:border-[#FF00FF]/30 text-slate-450"
                      }`}
                    >
                      <div className={`text-xl mb-0.5 ${diff.color}`}>{diff.icon}</div>
                      <span className={`font-bold text-[9px] block ${diff.color}`}>{diff.name}</span>
                      <span className="text-[7px] text-slate-500 block mt-0.5">
                        ${diff.startingMoney}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Selected difficulty details */}
                <div className="mt-2 p-2 bg-[#050507] border border-[#1A1A1E] rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-lg ${selectedDifficulty.color}`}>{selectedDifficulty.icon}</span>
                    <span className={`font-bold text-xs ${selectedDifficulty.color}`}>{selectedDifficulty.name} Mode</span>
                  </div>
                  <p className="text-[9px] text-slate-400 leading-relaxed">{selectedDifficulty.description}</p>
                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-0.5 text-[8px] font-mono text-slate-500">
                    <span>💰 Starting: <span className={selectedDifficulty.color}>${selectedDifficulty.startingMoney}</span></span>
                    <span>👥 Fans: <span className={selectedDifficulty.color}>{selectedDifficulty.startingFans}</span></span>
                    <span>🎸 Gig Pay: <span className={selectedDifficulty.color}>×{selectedDifficulty.gigEarningsMultiplier}</span></span>
                    <span>📈 Royalties: <span className={selectedDifficulty.color}>×{selectedDifficulty.royaltyMultiplier}</span></span>
                    <span>🔥 Burnout: <span className={selectedDifficulty.color}>×{selectedDifficulty.burnoutRateMultiplier}</span></span>
                    <span>🏷️ Label Gate: <span className={selectedDifficulty.color}>×{selectedDifficulty.labelRequirementsMultiplier}</span></span>
                  </div>
                </div>
              </div>
              
              {/* Ethos specifications detail panel */}
              <div className="bg-[#111114] border border-[#1A1A1E] p-3 rounded-xl text-[10px] leading-relaxed text-slate-400 font-mono">
                <strong className="text-[#00FF95] uppercase tracking-wider block mb-1">Class Stat Multipliers:</strong> {selectedEthos.statBoost}
              </div>
            </div>

            {/* CTA action buttons */}
            <div className="pt-2 relative z-10 max-w-sm mx-auto space-y-3">
              <button
                onClick={handleStartNewGame}
                className="w-full bg-[#111114] hover:bg-[#1A1A1E] text-[#00FF95] border border-[#00FF95] font-display font-bold py-3.5 rounded-xl transition-all shadow-lg neon-glow uppercase tracking-wider text-xs active:scale-98 cursor-pointer text-center"
              >
                Launch Studio Signal 🚀
              </button>
              
              <button
                onClick={() => setOnboardingShowEditor(true)}
                className="w-full bg-[#050507] hover:bg-[#111114] text-slate-300 hover:text-white border border-[#1A1A1E] hover:border-slate-700 font-mono text-[11px] py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 text-center"
              >
                <Database className="h-4 w-4 text-[#FF00FF]" /> Open Mod-Pack Toolkit & Editor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Label Modal */}
      {gameState && showCreateLabelModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] bg-opacity-50">
          <div className="bg-[#0A0A0C] border border-[#1A1A1E] p-8 rounded-xl max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Disc size={20} className="text-[#00FF95]" />
              Start Your Own Record Label
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              You've achieved enough industry presence to launch your own imprint. Build your catalog, sign artists, and compete in the market!
            </p>
            <div className="mb-6">
              <label className="block text-[10px] font-mono text-[#00FF95] uppercase tracking-tracking-widest mb-2 font-bold">
                Label Name
              </label>
              <input
                type="text"
                id="labelNameInput"
                placeholder="e.g. Phantom Grooves, Electric Soul Records..."
                maxLength={40}
                className="w-full bg-[#050507] border border-[#1A1A1E] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00FF95]/60"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateLabelModal(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const input = document.getElementById('labelNameInput') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    handleConfirmCreateLabel(input.value.trim());
                    input.value = '';
                  }
                }}
                className="flex-1 bg-[#00FF95] hover:bg-[#00FF95]/90 text-black font-bold px-4 py-2.5 rounded-lg text-sm transition-colors"
              >
                Launch Label 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer credit blocks */}
      <footer className="bg-[#050507] border-t border-[#1A1A1E] py-3 text-center text-[10px] font-mono text-slate-600 mt-auto z-10 relative">
        <span>Google AI Studio Build &bull; Electronic Music Career Simulator</span>
      </footer>

    </div>
  );
}
