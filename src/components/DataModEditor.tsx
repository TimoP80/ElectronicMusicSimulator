/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Database,
  Sliders,
  Sparkles,
  GitBranch,
  Cpu,
  Globe,
  Coins,
  Terminal,
  Play,
  Square,
  Activity,
  Plus,
  Trash2,
  Download,
  Upload,
  Search,
  CheckCircle2,
  AlertTriangle,
  Award,
  Music,
  MapPin,
  User,
  Zap,
  ChevronRight,
  RefreshCw,
  Shuffle,
  FileCode2,
  Settings,
  Flame,
  Wand2
} from "lucide-react";
import { GameState, MusicGenre, Track, MusicTrend } from "../types";

// Types for Modding Toolkit
export interface ModdedGenre {
  id: string;
  name: string;
  bpmMin: number;
  bpmMax: number;
  bpmDefault: number;
  energy: number;
  complexity: number;
  grooveType: string;
  undergroundIndex: number;
  popularityCurve: "niche" | "growing" | "cyclical" | "mainstream";
  subcultures: string[];
  instruments: string[];
}

export interface ModdedArtist {
  id: string;
  name: string;
  nationality: string;
  primaryGenre: string;
  ego: number; // 0-100
  fans: number;
  skillMixing: number;
  skillMastering: number;
  skillPR: number;
  postingStyle: "mysterious" | "aggressive_beef" | "shitposter" | "wholesome" | "academic";
  collaborationPreference: "solo" | "local_only" | "stars_only" | "open_source";
  addictionRisk: number; // 0-100
  portraitSeed: string;
}

export interface ModdedGear {
  id: string;
  name: string;
  category: "synthesizer" | "drum_machine" | "plugin" | "monitors" | "lighting";
  cost: number;
  soundBonus: number;
  maintenanceCost: number;
  reliability: number; // 0-100
  vintageRating: number; // 0-100
}

export interface ModdedCity {
  id: string;
  name: string;
  country: string;
  economicIndex: number; // 0-100
  undergroundRatio: number; // 0-100
  copRisk: number; // 0-100
  clubCount: number;
  weatherChaos: number; // 0-100
  iconSeed: string;
}

export interface ScriptEvent {
  id: string;
  title: string;
  triggerType: "week_tick" | "gig_success" | "release_fail" | "high_hype";
  probability: number; // 0-100
  narrativeText: string;
  moneyModifier: number;
  fansModifier: number;
  hypeModifier: number;
}

export interface EconomyParameters {
  baseStreamPayout: number;   // $ per play
  touringMarkup: number;      // 1.0 - 3.0 multiplier
  gearInflationCoefficient: number; // 0.5 - 2.5
  labelContractTaxRate: number; // % label cut
  taxBracketPercentage: number; // % standard local tax
}

export interface ModPack {
  metadata: {
    name: string;
    author: string;
    version: string;
    description: string;
    isTotalConversion: boolean;
  };
  genres: ModdedGenre[];
  artists: ModdedArtist[];
  gears: ModdedGear[];
  cities: ModdedCity[];
  events: ScriptEvent[];
  economy: EconomyParameters;
}

interface DataModEditorProps {
  gameState: GameState | null;
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>;
  standaloneMode?: boolean;
}

const DEFAULT_MOD_PACK: ModPack = {
  metadata: {
    name: "Cyber_Rave_Overhaul",
    author: "Berlin_Coder_99",
    version: "1.2.0",
    description: "An intensive overhaul adding glitch subcultures, 8-bit chip synthesizers, and real-time Berlin warehouse clubs.",
    isTotalConversion: false
  },
  genres: [
    {
      id: "cyber_trance",
      name: "Cyber Trance",
      bpmMin: 138,
      bpmMax: 155,
      bpmDefault: 142,
      energy: 92,
      complexity: 70,
      grooveType: "hypnotic acid triplet build-up",
      undergroundIndex: 7,
      popularityCurve: "growing",
      subcultures: ["cybergoths", "lunar nomads", "holographic ravers"],
      instruments: ["Detuned supersaw synth, TB-303, neon laser shakers"]
    },
    {
      id: "acid_glitch",
      name: "Acid Glitch",
      bpmMin: 125,
      bpmMax: 142,
      bpmDefault: 132,
      energy: 78,
      complexity: 94,
      grooveType: "stuttery bit-crushed breakdown with squelching resonance",
      undergroundIndex: 10,
      popularityCurve: "niche",
      subcultures: ["glitch purists", "interactive modular builders"],
      instruments: ["Grain delays, analog bitcrusher, modular frequency shifters"]
    }
  ],
  artists: [
    {
      id: "pro_pulse",
      name: "DJ Phantasm",
      nationality: "Iceland",
      primaryGenre: "Cyber Trance",
      ego: 45,
      fans: 1500,
      skillMixing: 75,
      skillMastering: 60,
      skillPR: 80,
      postingStyle: "mysterious",
      collaborationPreference: "solo",
      addictionRisk: 25,
      portraitSeed: "purple_hood"
    },
    {
      id: "rival_static",
      name: "Toxik Void",
      nationality: "United Kingdom",
      primaryGenre: "Acid Glitch",
      ego: 85,
      fans: 24500,
      skillMixing: 92,
      skillMastering: 88,
      skillPR: 40,
      postingStyle: "aggressive_beef",
      collaborationPreference: "stars_only",
      addictionRisk: 65,
      portraitSeed: "acid_helmet"
    }
  ],
  gears: [
    {
      id: "tb_3030",
      name: "Rolan TB-3030 Acid Bassline",
      category: "synthesizer",
      cost: 1450,
      soundBonus: 15,
      maintenanceCost: 35,
      reliability: 82,
      vintageRating: 95
    },
    {
      id: "retro_box",
      name: "Classic Hardware Drum Sequencer",
      category: "drum_machine",
      cost: 950,
      soundBonus: 12,
      maintenanceCost: 15,
      reliability: 90,
      vintageRating: 85
    }
  ],
  cities: [
    {
      id: "nordic_gate",
      name: "Reykjavik Hub",
      country: "Iceland",
      economicIndex: 65,
      undergroundRatio: 85,
      copRisk: 15,
      clubCount: 4,
      weatherChaos: 80,
      iconSeed: "arctic"
    },
    {
      id: "berlin_under",
      name: "Kopenicker Warehouse",
      country: "Germany",
      economicIndex: 50,
      undergroundRatio: 98,
      copRisk: 45,
      clubCount: 12,
      weatherChaos: 40,
      iconSeed: "catacomb"
    }
  ],
  events: [
    {
      id: "boiler_viral",
      title: "Boiler Room Glitch Breakthrough",
      triggerType: "gig_success",
      probability: 60,
      narrativeText: "A recorded livestream snippet of your set went viral on underground dance music forums. People are obsessed with the drop transitions!",
      moneyModifier: 800,
      fansModifier: 1200,
      hypeModifier: 40
    },
    {
      id: "lightning_cancel",
      title: "Festival Lightning Strike",
      triggerType: "week_tick",
      probability: 25,
      narrativeText: "A severe electrical thundercloud strikes the outdoor arena transformer, causing a full state-backed emergency venue evacuation.",
      moneyModifier: -200,
      fansModifier: 150,
      hypeModifier: -10
    }
  ],
  economy: {
    baseStreamPayout: 0.0075,
    touringMarkup: 1.8,
    gearInflationCoefficient: 1.15,
    labelContractTaxRate: 35,
    taxBracketPercentage: 15
  }
};

export default function DataModEditor({ gameState, setGameState, standaloneMode = false }: DataModEditorProps) {
  const [activeTab, setActiveTab] = useState<
    "meta" | "genres" | "artists" | "gear" | "world" | "events" | "economy" | "nodegraph" | "stress"
  >("meta");

  // Local editable mod state
  const [modPack, setModPack] = useState<ModPack>(() => {
    const saved = localStorage.getItem("beatmaker_editor_modpack");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return DEFAULT_MOD_PACK; }
    }
    return DEFAULT_MOD_PACK;
  });

  // Simulator test sandbox states
  const [isSimulating, setIsSimulating] = useState(false);
  const [simDate, setSimDate] = useState({ year: 1, month: 1, week: 1 });
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [simTimelineStats, setSimTimelineStats] = useState<{ week: number; trackQuality: number; digitalPlays: number }[]>([]);
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Form input holding temporary variables
  const [searchQuery, setSearchQuery] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "info" | "warning" } | null>(null);

  // States for visual scripting node graph edits
  const [nodeTrigger, setNodeTrigger] = useState<"on_release" | "on_gig_fail" | "on_burnout_peak">("on_release");
  const [nodeAction, setNodeAction] = useState<"generate_controversy" | "trigger_algorithm_boost" | "induce_inspiration">("generate_controversy");
  const [nodeMultiplier, setNodeMultiplier] = useState(1.5);
  const [nodeBypass, setNodeBypass] = useState(false);

  // Save current mod configuration to localStorage
  const savePackToStorage = (updated: ModPack) => {
    setModPack(updated);
    localStorage.setItem("beatmaker_editor_modpack", JSON.stringify(updated));
    showFeedback("Mod Configuration updated in temporary workspace!", "success");
  };

  const showFeedback = (text: string, type: "success" | "info" | "warning") => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Preset loading helpers (ABSURD MEME PRESET vs HARDCORE ROADIE PRESET)
  const loadMemePreset = () => {
    const updated: ModPack = {
      ...modPack,
      metadata: {
        name: "Llama_Bass_Simulator_Meme",
        author: "Hyper_Raver_2026",
        version: "4.2.0",
        description: "Replaces highbrow labels with hyper-inflated AI meme publishers and fast tempo chiptunes.",
        isTotalConversion: true
      },
      genres: [
        {
          id: "llama_core",
          name: "Llama Core Trance",
          bpmMin: 180,
          bpmMax: 220,
          bpmDefault: 200,
          energy: 99,
          complexity: 99,
          grooveType: "hyperactive algorithmic triplet spam",
          undergroundIndex: 9,
          popularityCurve: "cyclical",
          subcultures: ["AI shitposters", "super-speed gamers", "llama herders"],
          instruments: ["Llama spitting voice filters", "toy Casio keytars", "distorted cowbells"]
        }
      ],
      artists: [
        {
          id: "spit_mc",
          name: "Alpaca Spit Master",
          nationality: "Peru",
          primaryGenre: "Llama Core Trance",
          ego: 100,
          fans: 120,
          skillMixing: 30,
          skillMastering: 15,
          skillPR: 98,
          postingStyle: "shitposter",
          collaborationPreference: "open_source",
          addictionRisk: 90,
          portraitSeed: "yellow_glasses"
        }
      ],
      gears: [
        {
          id: "meme_dist",
          name: "Casio Toy Keytar (Llama Edition)",
          category: "synthesizer",
          cost: 150,
          soundBonus: 3,
          maintenanceCost: 1,
          reliability: 99,
          vintageRating: 99
        }
      ],
      cities: [
        {
          id: "llama_valley",
          name: "Andes Peak Stadium",
          country: "Peru",
          economicIndex: 30,
          undergroundRatio: 90,
          copRisk: 5,
          clubCount: 2,
          weatherChaos: 95,
          iconSeed: "valley"
        }
      ],
      events: [
        {
          id: "llama_stampede",
          title: "Audience Alpaca Stampede",
          triggerType: "gig_success",
          probability: 90,
          narrativeText: "A local herd of alpacas breaks into the dance tent and coordinates their chews to your galloping triplet drop sound designs!",
          moneyModifier: 1500,
          fansModifier: 4000,
          hypeModifier: 90
        }
      ],
      economy: {
        baseStreamPayout: 0.08, // Ridiculous pay
        touringMarkup: 3.0,
        gearInflationCoefficient: 0.4,
        labelContractTaxRate: 5,
        taxBracketPercentage: 2
      }
    };
    savePackToStorage(updated);
    showFeedback("Successfully loaded 'Llama Space Meme' Total Conversion configuration!", "success");
  };

  const loadHardcorePreset = () => {
    const updated: ModPack = {
      ...modPack,
      metadata: {
        name: "Hardcore_Underground_Survival",
        author: "Vinyl_Lover_Analogue",
        version: "0.8.5",
        description: "Hardcore survival mod. Extremely low streaming checks, heavy police attention, vintage synthesizer costs, and hyperinflation.",
        isTotalConversion: true
      },
      genres: [
        {
          id: "industrial_noise",
          name: "Sub-Zero Industrial",
          bpmMin: 120,
          bpmMax: 135,
          bpmDefault: 128,
          energy: 60,
          complexity: 85,
          grooveType: "broken scrap iron machinery loops",
          undergroundIndex: 10,
          popularityCurve: "niche",
          subcultures: ["anti-capitalist vinyl collectors", "squat organizers"],
          instruments: ["Modular hum generators, scrap metal spring reverbs, feedback channels"]
        }
      ],
      artists: [
        {
          id: "sad_noise",
          name: "Monolithic Shadow",
          nationality: "Germany",
          primaryGenre: "Sub-Zero Industrial",
          ego: 95,
          fans: 320,
          skillMixing: 95,
          skillMastering: 90,
          skillPR: 5,
          postingStyle: "mysterious",
          collaborationPreference: "solo",
          addictionRisk: 45,
          portraitSeed: "shadow_mask"
        }
      ],
      gears: [
        {
          id: "vintage_synth",
          name: "Rare Original Modular Console (1972)",
          category: "synthesizer",
          cost: 12800, // Insanely expensive
          soundBonus: 32,
          maintenanceCost: 180,
          reliability: 40,
          vintageRating: 100
        }
      ],
      cities: [
        {
          id: "squat_city",
          name: "Kreuzberg Squat",
          country: "Germany",
          economicIndex: 12,
          undergroundRatio: 100,
          copRisk: 95, // Police sweep!
          clubCount: 2,
          weatherChaos: 10,
          iconSeed: "barricade"
        }
      ],
      events: [
        {
          id: "cop_sweep",
          title: "Police Teargas Raid",
          triggerType: "week_tick",
          probability: 70,
          narrativeText: "A helicopter swoops over the unlicensed factory building. Police throw teargas canisters onto the subwoofer floor. Total gear loss!",
          moneyModifier: -800,
          fansModifier: -100,
          hypeModifier: -20
        }
      ],
      economy: {
        baseStreamPayout: 0.0012, // Brutal
        touringMarkup: 1.0,
        gearInflationCoefficient: 2.2,
        labelContractTaxRate: 60,
        taxBracketPercentage: 25
      }
    };
    savePackToStorage(updated);
    showFeedback("Successfully loaded 'Hardcore Underground Vinyl' sandbox values!", "success");
  };

  // Live Sandbox Autoplay Simulation runner
  const startAutoplayStressTest = () => {
    if (isSimulating) {
      stopAutoplayStressTest();
      return;
    }

    setIsSimulating(true);
    setSimLogs([]);
    setSimTimelineStats([]);
    let currentWeekNum = 1;
    let simYear = 1;
    let simMonth = 1;
    let simWeek = 1;

    let virtualFans = modPack.artists[0]?.fans || 150;
    let virtualCash = 500;
    let virtualHype = 60;

    const interval = setInterval(() => {
      currentWeekNum++;
      simWeek++;
      if (simWeek > 4) {
        simWeek = 1;
        simMonth++;
        if (simMonth > 12) {
          simMonth = 1;
          simYear++;
        }
      }

      // Business logic simulations based on mod variables
      const randomTrigger = Math.random() * 100;
      const matchingEvent = modPack.events.find(ev => ev.probability > randomTrigger);
      const randomGenre = modPack.genres[Math.floor(Math.random() * modPack.genres.length)] || { name: "Techno", undergroundIndex: 8 };

      let logLine = `Y${simYear} M${simMonth} W${simWeek}: `;
      if (matchingEvent) {
        virtualCash += matchingEvent.moneyModifier;
        virtualFans = Math.max(10, virtualFans + matchingEvent.fansModifier);
        virtualHype = Math.min(100, Math.max(0, virtualHype + matchingEvent.hypeModifier));
        logLine += `💥 STORY TRIGGER: [${matchingEvent.title}] occurred. Money $${matchingEvent.moneyModifier > 0 ? "+" : ""}${matchingEvent.moneyModifier}, Fans: ${matchingEvent.fansModifier > 0 ? "+" : ""}${matchingEvent.fansModifier}.`;
      } else {
        // Standard distribution simulation
        const isSelfRelease = Math.random() > 0.4;
        const royaltyMultiplier = modPack.economy.baseStreamPayout * 10000;
        const netEarnings = Math.round((Math.random() * 12 + 1) * royaltyMultiplier);
        virtualCash += netEarnings;
        
        // Accumulate fans
        const addedFans = Math.round(15 + (10 - randomGenre.undergroundIndex) * 8);
        virtualFans += addedFans;

        logLine += `🎧 Artist uploaded virtual master [${randomGenre.name} Draft] to web. Royalty: +$${netEarnings}, accrued +${addedFans} subscribers.`;
      }

      // Track logs
      setSimLogs(prev => [logLine, ...prev.slice(0, 48)]);
      setSimTimelineStats(prev => [
        ...prev,
        {
          week: currentWeekNum,
          trackQuality: Math.round(50 + (Math.sin(currentWeekNum / 2) * 20) + (virtualHype / 4)),
          digitalPlays: virtualFans * 4 + 100
        }
      ]);

      setSimDate({ year: simYear, month: simMonth, week: simWeek });

      // Termination checks
      if (currentWeekNum > 36) {
        stopAutoplayStressTest();
        setSimLogs(prev => [`🏆 FAST SIMULATION COMPLETED! Final Status: Virtual Artist Fans=${virtualFans}, Wealth=$${virtualCash}, Peak Hype=${virtualHype}`, ...prev]);
        showFeedback("Stress simulation cycle reached execution threshold limit.", "info");
      }
    }, 180);

    simIntervalRef.current = interval;
  };

  const stopAutoplayStressTest = () => {
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    setIsSimulating(false);
  };

  useEffect(() => {
    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, []);

  // Export mod pack as JSON
  const handleExportMod = () => {
    try {
      const payload = JSON.stringify(modPack, null, 2);
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(payload);
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${modPack.metadata.name.toLowerCase()}_v${modPack.metadata.version}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showFeedback("Mod configuration exported JSON file successfully!", "success");
    } catch (e) {
      showFeedback("An error occurred during export compiling.", "warning");
    }
  };

  // Import mod pack from JSON
  const handleImportMod = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed.metadata && parsed.genres && parsed.artists && parsed.economy) {
          savePackToStorage(parsed);
          showFeedback("Custom Total Conversion Pack loaded into memory!", "success");
        } else {
          showFeedback("Invalid Mod JSON structure. Required metadata headers are missing.", "warning");
        }
      } catch (err) {
        showFeedback("Failure parsing uploaded JSON content.", "warning");
      }
    };
    reader.readAsText(file);
  };

  // Inject user mod database definitions directly to current active play session!
  const injectModToLiveGameSession = () => {
    if (!gameState) {
      showFeedback("Please create or choose a live game session/artist profile first, then inject custom mod profiles!", "warning");
      return;
    }

    try {
      // Modify active trend parameters dynamically based on mod trends if they exist
      const firstModTrend = modPack.events[0];
      const selectedTrend: MusicTrend = firstModTrend ? {
        id: firstModTrend.id,
        name: firstModTrend.title,
        description: firstModTrend.narrativeText,
        hotGenre: (modPack.genres[0]?.name || "Techno") as MusicGenre,
        decayingGenre: (modPack.genres[1]?.name || "Synthwave") as MusicGenre,
        hypeMultiplier: 1.5,
        durationMonths: 2,
        source: "Cyber Mod Toolkit Overdrive"
      } : gameState.currentTrend;

      // Inject custom elements into stats budget to verify mod execution
      const feedbackReward = 500; // Mod injector gift
      const updated: GameState = {
        ...gameState,
        stats: {
          ...gameState.stats,
          money: gameState.stats.money + feedbackReward,
          fans: gameState.stats.fans + 150
        },
        currentTrend: selectedTrend,
        log: [
          ...gameState.log,
          {
            id: `mod_injector_${Date.now()}`,
            date: `Yr ${gameState.gameDate?.year || 1} M ${gameState.gameDate?.month || 1} W ${gameState.gameDate?.week || 1}`,
            type: "system",
            title: `Mod Pack Injected: ${modPack.metadata.name}`,
            description: `Active mod pack elements written successfully. Loaded ${modPack.genres.length} custom genres, ${modPack.artists.length} custom artists, and custom economy indices with +$500 beta bonus!`,
          }
        ]
      };

      setGameState(updated);
      localStorage.setItem("beatmaker_simulator_state_v1", JSON.stringify(updated));
      showFeedback("Live Engine Hook Triggered! Mod values successfully compiled and written to active Game Session!", "success");
    } catch (e) {
      console.error(e);
      showFeedback("Failed to hot-load into current game execution frame.", "warning");
    }
  };

  // Helper arrays for simple visual portrait rendering
  const getAvatarColors = (seed: string) => {
    if (seed?.includes("purple")) return { bg: "from-purple-900 to-indigo-950", border: "border-purple-500", accColor: "bg-purple-400" };
    if (seed?.includes("acid")) return { bg: "from-emerald-950 to-slate-900", border: "border-emerald-500", accColor: "bg-emerald-400" };
    if (seed?.includes("yellow")) return { bg: "from-yellow-950 to-orange-950", border: "border-yellow-500", accColor: "bg-yellow-400" };
    return { bg: "from-slate-900 to-indigo-950", border: "border-cyan-500", accColor: "bg-cyan-400" };
  };

  // Dynamic lists addition forms
  const addNewGenre = () => {
    const newGen: ModdedGenre = {
      id: `genre_${Date.now()}`,
      name: "Neo Vapor Funk",
      bpmMin: 115,
      bpmMax: 130,
      bpmDefault: 122,
      energy: 70,
      complexity: 65,
      grooveType: "shuffling funk line with cassette pitch flutter",
      undergroundIndex: 6,
      popularityCurve: "growing",
      subcultures: ["Vaporwave collectors", "cassette purists", "nostalgic net surfers"],
      instruments: ["Chamber synth chords", "VHS static textures", "slap bass synthesizers"]
    };
    const updated = { ...modPack, genres: [...modPack.genres, newGen] };
    savePackToStorage(updated);
    showFeedback("New blank genre blueprint added. Customize values below!", "success");
  };

  const deleteGenre = (id: string) => {
    const updated = { ...modPack, genres: modPack.genres.filter(g => g.id !== id) };
    savePackToStorage(updated);
  };

  const addNewArtist = () => {
    const newArt: ModdedArtist = {
      id: `artist_${Date.now()}`,
      name: "Cyber_Rogue_01",
      nationality: "Japan",
      primaryGenre: modPack.genres[0]?.name || "Techno",
      ego: 50,
      fans: 500,
      skillMixing: 65,
      skillMastering: 50,
      skillPR: 70,
      postingStyle: "shitposter",
      collaborationPreference: "open_source",
      addictionRisk: 30,
      portraitSeed: "cyan_glasses"
    };
    const updated = { ...modPack, artists: [...modPack.artists, newArt] };
    savePackToStorage(updated);
    showFeedback("Spawned custom rival artist blueprint!", "success");
  };

  const deleteArtist = (id: string) => {
    const updated = { ...modPack, artists: modPack.artists.filter(a => a.id !== id) };
    savePackToStorage(updated);
  };

  const addNewGear = () => {
    const newG: ModdedGear = {
      id: `gear_${Date.now()}`,
      name: "Custom Eurorack Rackmount Console",
      category: "synthesizer",
      cost: 3400,
      soundBonus: 22,
      maintenanceCost: 45,
      reliability: 75,
      vintageRating: 90
    };
    const updated = { ...modPack, gears: [...modPack.gears, newG] };
    savePackToStorage(updated);
  };

  const deleteGear = (id: string) => {
    const updated = { ...modPack, gears: modPack.gears.filter(g => g.id !== id) };
    savePackToStorage(updated);
  };

  const addNewCity = () => {
    const newC: ModdedCity = {
      id: `city_${Date.now()}`,
      name: "Tokyo Neo Alley",
      country: "Japan",
      economicIndex: 90,
      undergroundRatio: 75,
      copRisk: 35,
      clubCount: 8,
      weatherChaos: 60,
      iconSeed: "cyber_neon"
    };
    const updated = { ...modPack, cities: [...modPack.cities, newC] };
    savePackToStorage(updated);
  };

  const deleteCity = (id: string) => {
    const updated = { ...modPack, cities: modPack.cities.filter(c => c.id !== id) };
    savePackToStorage(updated);
  };

  const updateGenreField = (id: string, field: keyof ModdedGenre, value: any) => {
    const updated = {
      ...modPack,
      genres: modPack.genres.map(g => {
        if (g.id === id) {
          if (field === "subcultures" || field === "instruments") {
            return { ...g, [field]: value.split(",").map((s: string) => s.trim()) };
          }
          return { ...g, [field]: value };
        }
        return g;
      })
    };
    setModPack(updated);
    localStorage.setItem("beatmaker_editor_modpack", JSON.stringify(updated));
  };

  const updateArtistField = (id: string, field: keyof ModdedArtist, value: any) => {
    const updated = {
      ...modPack,
      artists: modPack.artists.map(a => {
        if (a.id === id) {
          const processedVal = (field === "ego" || field === "fans" || field === "skillMixing" || field === "skillMastering" || field === "skillPR" || field === "addictionRisk") 
            ? Number(value) 
            : value;
          return { ...a, [field]: processedVal };
        }
        return a;
      })
    };
    setModPack(updated);
    localStorage.setItem("beatmaker_editor_modpack", JSON.stringify(updated));
  };

  const updateGearField = (id: string, field: keyof ModdedGear, value: any) => {
    const updated = {
      ...modPack,
      gears: modPack.gears.map(g => {
        if (g.id === id) {
          const numVal = (field === "cost" || field === "soundBonus" || field === "maintenanceCost" || field === "reliability" || field === "vintageRating")
            ? Number(value)
            : value;
          return { ...g, [field]: numVal };
        }
        return g;
      })
    };
    setModPack(updated);
    localStorage.setItem("beatmaker_editor_modpack", JSON.stringify(updated));
  };

  return (
    <div id="developer_mod_toolkit_wrapper" className={`animate-fadeIn text-slate-100 ${standaloneMode ? 'h-full overflow-y-auto' : 'space-y-6 pt-1'}`}>
      
      {/* Header Banner - Cyberspace style - hidden in embedded mode */}
      {!standaloneMode && (
        <div className="bg-[#0A0A0E] border border-[#1d1d28] p-5 rounded-2xl relative overflow-hidden shadow-2xl">
          <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-[#FF00FF]/10 to-transparent pointer-events-none" />
          <div className="absolute left-1/3 top-1/4 w-[400px] h-[400px] bg-[#00FF95]/3 blurring-circle rounded-full pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-[#00FF95]/15 border border-[#00FF95]/40 text-[#00FF95] text-[9.5px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  PRO DEV ENV // RAW DATA EDITOR
                </span>
                {modPack.metadata.isTotalConversion && (
                  <span className="bg-[#FF00FF]/15 border border-[#FF00FF]/40 text-[#FF00FF] text-[9.5px] font-mono font-bold px-2 py-0.5 rounded tracking-widest uppercase animate-pulse">
                    Total Conversion Mode
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-display font-extrabold tracking-tight text-white flex items-center gap-2 mt-1">
                <Database className="h-6 w-6 text-[#00FF95] drop-shadow-[0_0_8px_rgba(0,255,149,0.4)]" />
                Cyber Raves Modding Toolkit <span className="text-xs font-mono text-slate-500 font-normal">v2.10_Beta</span>
              </h1>
              <p className="text-xs text-slate-400 font-sans max-w-2xl">
                Create electronic microgenres, sculpt custom hardware drum machines, edit economy balance coefficients, customize AI behaviors, and hot-inject mods direct into current save frames.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={injectModToLiveGameSession}
                className="bg-emerald-600 hover:bg-emerald-555 border border-emerald-500/20 text-white font-mono font-bold text-xs py-2 px-3.5 rounded-xl transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-md shadow-emerald-950/20"
                title="Hot load data changes into the active game session"
              >
                <RefreshCw className="h-3.5 w-3.5 animate-spin-slow text-emerald-200" />
                HOT-INJECT TO LIVE GAME
              </button>
              <button
                onClick={handleExportMod}
                className="bg-slate-900 border border-slate-750 hover:bg-slate-800 text-slate-300 font-mono text-xs py-2 px-3.5 rounded-xl transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Export .json Mod
              </button>
            </div>
          </div>

          {/* Info alerts */}
          {feedbackMsg && (
            <div className={`mt-4 p-3 rounded-lg text-xs font-mono flex items-center gap-2 animate-bounce border ${
              feedbackMsg.type === "success" 
                ? "bg-[#00FF95]/10 border-[#00FF95]/30 text-[#00FF95]" 
                : "bg-purple-950/20 border-purple-500/30 text-purple-300"
            }`}>
              {feedbackMsg.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              <span>{feedbackMsg.text}</span>
            </div>
          )}
        </div>
      )}

      {/* Compact Header for Standalone Mode */}
      {standaloneMode && (
        <div className="bg-[#0A0A0E] border border-[#1d1d28] px-4 py-3 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-[#00FF95]" />
            <div>
              <h1 className="text-base font-display font-bold text-white">Cyber Raves Modding Toolkit</h1>
              <span className="text-[10px] font-mono text-slate-500">v2.10_Beta</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={injectModToLiveGameSession}
              className="bg-emerald-600 hover:bg-emerald-555 border border-emerald-500/20 text-white font-mono font-bold text-[10px] py-1.5 px-3 rounded-lg transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
            >
              <RefreshCw className="h-3 w-3" />
              HOT-INJECT
            </button>
            <button
              onClick={handleExportMod}
              className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 font-mono text-[10px] py-1.5 px-3 rounded-lg transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
            >
              <Download className="h-3 w-3" />
              Export
            </button>
          </div>
        </div>
      )}

      {/* Editor Channel Selection / Workspace tabs switcher */}
      <div className={`${standaloneMode ? 'px-4' : ''} grid grid-cols-2 sm:grid-cols-4 md:grid-cols-9 gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-900 overflow-x-auto ${standaloneMode ? 'sticky top-[72px] z-40' : ''}`}>
        <button
          onClick={() => setActiveTab("meta")}
          className={`px-3 py-2 text-[10px] font-mono rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === "meta" ? "bg-[#111114] text-[#00FF95] border border-[#00FF95]/20 font-bold" : "text-slate-400 hover:text-white hover:bg-slate-900/40"
          }`}
        >
          <Settings className="h-3.5 w-3.5" /> META
        </button>
        <button
          onClick={() => setActiveTab("genres")}
          className={`px-3 py-2 text-[10px] font-mono rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === "genres" ? "bg-[#111114] text-[#00FF95] border border-[#00FF95]/20 font-bold" : "text-slate-400 hover:text-white hover:bg-slate-900/40"
          }`}
        >
          <Music className="h-3.5 w-3.5" /> GENRES
        </button>
        <button
          onClick={() => setActiveTab("artists")}
          className={`px-3 py-2 text-[10px] font-mono rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === "artists" ? "bg-[#111114] text-[#00FF95] border border-[#00FF95]/20 font-bold" : "text-slate-400 hover:text-white hover:bg-slate-900/40"
          }`}
        >
          <User className="h-3.5 w-3.5" /> ARTISTS
        </button>
        <button
          onClick={() => setActiveTab("gear")}
          className={`px-3 py-2 text-[10px] font-mono rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === "gear" ? "bg-[#111114] text-[#00FF95] border border-[#00FF95]/20 font-bold" : "text-slate-400 hover:text-white hover:bg-slate-900/40"
          }`}
        >
          <Cpu className="h-3.5 w-3.5" /> GEAR
        </button>
        <button
          onClick={() => setActiveTab("world")}
          className={`px-3 py-2 text-[10px] font-mono rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === "world" ? "bg-[#111114] text-[#00FF95] border border-[#00FF95]/20 font-bold" : "text-slate-400 hover:text-white hover:bg-slate-900/40"
          }`}
        >
          <Globe className="h-3.5 w-3.5" /> WORLD
        </button>
        <button
          onClick={() => setActiveTab("nodegraph")}
          className={`px-3 py-2 text-[10px] font-mono rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === "nodegraph" ? "bg-[#111114] text-[#00FF95] border border-[#00FF95]/20 font-bold" : "text-slate-400 hover:text-white hover:bg-slate-900/40"
          }`}
        >
          <GitBranch className="h-3.5 w-3.5" /> AI
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={`px-3 py-2 text-[10px] font-mono rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === "events" ? "bg-[#111114] text-[#00FF95] border border-[#00FF95]/20 font-bold" : "text-slate-400 hover:text-white hover:bg-slate-900/40"
          }`}
        >
          <Flame className="h-3.5 w-3.5" /> EVENTS
        </button>
        <button
          onClick={() => setActiveTab("economy")}
          className={`px-3 py-2 text-[10px] font-mono rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === "economy" ? "bg-[#111114] text-[#00FF95] border border-[#00FF95]/20 font-bold" : "text-slate-400 hover:text-white hover:bg-slate-900/40"
          }`}
        >
          <Coins className="h-3.5 w-3.5" /> ECONOMY
        </button>
        <button
          onClick={() => setActiveTab("stress")}
          className={`px-3 py-2 text-[10px] font-mono rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === "stress" ? "bg-[#111114] text-[#FF00FF] border border-[#FF00FF]/20 font-bold" : "text-slate-400 hover:text-[#FF00FF] hover:bg-slate-900/40"
          }`}
          title="Autonomous test simulator with graph forecasting logs"
        >
          <Terminal className="h-3.5 w-3.5" /> SIM
        </button>
      </div>

      {/* Main Multi-channel Editing Dashboard Panel */}
      <div id="main_modding_workspace_channel" className={`grid grid-cols-1 gap-4 ${standaloneMode ? 'lg:grid-cols-1 px-4 pb-4' : 'lg:grid-cols-12'} ${standaloneMode ? '' : 'p-0'}`}>
        
        {/* Workspace Central Container Area */}
        <div className={`${standaloneMode ? '' : 'lg:col-span-9'} bg-[#070709] border border-[#1A1A1E] rounded-xl p-4 space-y-5 ${standaloneMode ? '' : 'p-5'} ${standaloneMode ? '' : 'space-y-6'}`}>

          {/* TAB 1: MOD PACK METADATA */}
          {activeTab === "meta" && (
            <div id="meta_editor_view" className="space-y-5">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#00FF95] font-mono flex items-center gap-2">
                  <Settings className="h-4 w-4" /> Mod Pack Metadata Headers
                </h2>
                <span className="text-[10px] text-slate-500 font-mono">ID: {modPack.metadata.name.toLowerCase()}</span>
              </div>

              {/* Pack presets quick-loads */}
              <div className="bg-[#FF00FF]/5 border border-[#FF00FF]/15 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#FF00FF] font-mono">Load Complex Scene Templates</span>
                  <p className="text-[10px] text-slate-400 font-sans">
                    Instantly load specific Total Conversion properties to test extremes or quirky memes.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 justify-center items-center">
                  <button
                    onClick={loadMemePreset}
                    className="bg-yellow-950/20 hover:bg-yellow-900/30 text-yellow-500 hover:text-yellow-400 border border-yellow-500/20 px-3 py-2 rounded-lg font-mono text-[9.5px] transition-all cursor-pointer active:scale-95 text-center font-bold"
                  >
                    🔥 LOAD LOFI LLAMA MEME
                  </button>
                  <button
                    onClick={loadHardcorePreset}
                    className="bg-red-950/20 hover:bg-red-900/30 text-red-500 hover:text-red-400 border border-red-500/20 px-3 py-2 rounded-lg font-mono text-[9.5px] transition-all cursor-pointer active:scale-95 text-center font-bold"
                  >
                    💀 LOAD INDUSTRIAL HARDCORE
                  </button>
                </div>
              </div>

              {/* Form editing pack details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 font-mono text-left">
                  <label className="block text-[10px] uppercase text-slate-400">Mod Package Identifier</label>
                  <input
                    type="text"
                    value={modPack.metadata.name}
                    onChange={(e) => savePackToStorage({ ...modPack, metadata: { ...modPack.metadata, name: e.target.value } })}
                    className="w-full bg-slate-950 border border-slate-900 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5 font-mono text-left">
                  <label className="block text-[10px] uppercase text-slate-400">Compiler Architect / Author Name</label>
                  <input
                    type="text"
                    value={modPack.metadata.author}
                    onChange={(e) => savePackToStorage({ ...modPack, metadata: { ...modPack.metadata, author: e.target.value } })}
                    className="w-full bg-slate-950 border border-slate-900 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5 font-mono text-left">
                  <label className="block text-[10px] uppercase text-slate-400">Mod Manifest Version</label>
                  <input
                    type="text"
                    value={modPack.metadata.version}
                    onChange={(e) => savePackToStorage({ ...modPack, metadata: { ...modPack.metadata, version: e.target.value } })}
                    className="w-full bg-slate-950 border border-slate-900 rounded-lg px-3 py-2 text-xs text-[#00FF95]"
                  />
                </div>
                <div className="space-y-3 font-mono text-left flex items-center pt-5">
                  <input
                    type="checkbox"
                    id="chkTc"
                    checked={modPack.metadata.isTotalConversion}
                    onChange={(e) => savePackToStorage({ ...modPack, metadata: { ...modPack.metadata, isTotalConversion: e.target.checked } })}
                    className="h-4 w-4 bg-slate-950 border border-slate-900 accent-[#00FF95] cursor-pointer"
                  />
                  <label htmlFor="chkTc" className="text-[10px] uppercase text-slate-350 cursor-pointer ml-2">
                    Mark as Active Total Conversion (Bypasses core static lookups)
                  </label>
                </div>
              </div>

              <div className="space-y-1.5 font-mono text-left">
                <label className="block text-[10px] uppercase text-slate-400">Mod Package Description</label>
                <textarea
                  value={modPack.metadata.description}
                  onChange={(e) => savePackToStorage({ ...modPack, metadata: { ...modPack.metadata, description: e.target.value } })}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-900 rounded-lg px-3 py-2 text-xs text-slate-300 font-sans"
                />
              </div>

              <div className="bg-[#0A0A0C] border border-slate-900 rounded-xl p-4.5 space-y-2 text-xs font-mono">
                <span className="block text-[10px] uppercase text-[#00FF95] font-bold">Steam Workshop & Manifest Validator</span>
                <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans">
                  Use the options below to import and test other modders' `.json` manifests. Conflict detection matches redundant subculture seeds or out-of-bounds BPM fields perfectly.
                </p>
                <div className="pt-2 flex flex-wrap gap-3 items-center">
                  <label className="bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono cursor-pointer transition-colors active:scale-95">
                    📂 Drag-&-Drop / Load External Manifest File
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportMod}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[10px] text-slate-600 italic">Supports total conversion layers & raw database overrides.</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MUSIC GENRES / MICROGENRES EDITOR */}
          {activeTab === "genres" && (
            <div id="genres_specs_view" className="space-y-5">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <div className="space-y-0.5">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-[#00FF95] font-mono flex items-center gap-2">
                    <Music className="h-4 w-4" /> Music Genre Definitions & Microgenres
                  </h2>
                  <span className="text-[9px] text-slate-500 font-mono">Allowing players to inject brand-new electronic branches on the fly!</span>
                </div>
                <button
                  onClick={addNewGenre}
                  className="bg-[#00FF95]/10 hover:bg-[#00FF95]/20 border border-[#00FF95]/30 hover:border-[#00FF95] text-[#00FF95] px-2.5 py-1 rounded-lg text-xs font-mono transition-all active:scale-95 flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> ADD NEW MICROGENRE
                </button>
              </div>

              {/* Genre listings */}
              <div className="space-y-4">
                {modPack.genres.map((g) => (
                  <div key={g.id} className="bg-slate-950/80 border border-slate-900 p-4.5 rounded-xl space-y-4 font-mono">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 bg-[#00FF95] rounded-full animate-pulse shadow-[0_0_8px_rgba(0,255,149,0.8)]"></span>
                        <input
                          type="text"
                          value={g.name}
                          onChange={(e) => updateGenreField(g.id, "name", e.target.value)}
                          className="font-bold text-white bg-transparent border-b border-slate-900 hover:border-slate-700 focus:border-[#00FF95] focus:outline-hidden text-xs text-left"
                        />
                      </div>
                      <button
                        onClick={() => deleteGenre(g.id)}
                        className="text-red-500/60 hover:text-red-400 p-1 cursor-pointer transition-colors"
                        title="Delete this genre from the mod"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Numeric parameter grids */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs text-left">
                      <div className="space-y-1">
                        <span className="block text-[9.5px] uppercase text-slate-500">Min BPM</span>
                        <input
                          type="number"
                          value={g.bpmMin}
                          onChange={(e) => updateGenreField(g.id, "bpmMin", Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="block text-[9.5px] uppercase text-slate-500">Default BPM</span>
                        <input
                          type="number"
                          value={g.bpmDefault}
                          onChange={(e) => updateGenreField(g.id, "bpmDefault", Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[#00FF95] text-xs font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="block text-[9.5px] uppercase text-slate-500">Max BPM</span>
                        <input
                          type="number"
                          value={g.bpmMax}
                          onChange={(e) => updateGenreField(g.id, "bpmMax", Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="block text-[9.5px] uppercase text-slate-500">Popularity Shape</span>
                        <select
                          value={g.popularityCurve}
                          onChange={(e) => updateGenreField(g.id, "popularityCurve", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[#FF00FF] cursor-pointer"
                        >
                          <option value="niche">Niche Underground</option>
                          <option value="growing">Exponential Growing</option>
                          <option value="cyclical">Cyclical / Retro Fades</option>
                          <option value="mainstream">Mainstream Pop</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-left">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[9.5px] uppercase text-slate-500">
                          <span>Energy Multiplier</span>
                          <span className="text-[#00FF95] font-bold">{g.energy}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={g.energy}
                          onChange={(e) => updateGenreField(g.id, "energy", Number(e.target.value))}
                          className="w-full accent-[#00FF95] h-1"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[9.5px] uppercase text-slate-500">
                          <span>Complexity Score</span>
                          <span className="text-purple-400 font-bold">{g.complexity}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={g.complexity}
                          onChange={(e) => updateGenreField(g.id, "complexity", Number(e.target.value))}
                          className="w-full accent-purple-500 h-1"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[9.5px] uppercase text-slate-500">
                          <span>Underground Index</span>
                          <span className="text-amber-400 font-bold">{g.undergroundIndex}/10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={g.undergroundIndex}
                          onChange={(e) => updateGenreField(g.id, "undergroundIndex", Number(e.target.value))}
                          className="w-full accent-amber-500 h-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-left pt-1">
                      <div className="space-y-1">
                        <span className="block text-[9.5px] uppercase text-slate-500">Rhythmic Grooves & Riffs descriptor</span>
                        <input
                          type="text"
                          value={g.grooveType}
                          onChange={(e) => updateGenreField(g.id, "grooveType", e.target.value)}
                          className="w-full bg-[#050507] border border-slate-900 rounded p-2 text-slate-300 italic"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="block text-[9.5px] uppercase text-slate-500">Associated Subcultures (comma sep)</span>
                        <input
                          type="text"
                          value={g.subcultures.join(", ")}
                          onChange={(e) => updateGenreField(g.id, "subcultures", e.target.value)}
                          className="w-full bg-[#050507] border border-slate-900 rounded p-2 text-slate-300"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Genre evolution tree branches simulation graph */}
              <div className="bg-[#0A0A0C] border border-slate-900 rounded-xl p-4 space-y-3 font-mono">
                <span className="block text-[9.5px] uppercase text-[#00FF95] font-bold flex items-center gap-1.5">
                  <GitBranch className="h-4 w-4 text-[#00FF95]" /> Dynamic Genre Evolution & Generation Tree
                </span>
                <p className="text-[10px] text-slate-400 font-sans leading-normal">
                  Rave evolution tracking: Newly spawned microgenres branch off existing ones dynamically depending on underground scores.
                </p>
                <div className="bg-slate-950/80 border border-slate-900 p-4 rounded-lg flex flex-col md:flex-row items-center justify-around gap-4 text-xs">
                  <div className="bg-slate-900/60 p-2 border border-[#1A1A1E] rounded-md text-center shrink-0 w-32 shadow-lg">
                    <span className="text-[#00FF95] font-bold">Techno Roots</span>
                    <span className="block text-[8px] text-slate-500 mt-1">135 BPM | 1991</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-600 hidden md:block" />
                  <div className="bg-purple-900/10 p-2 border border-purple-500/20 rounded-md text-center shrink-0 w-44 shadow-lg border-dashed">
                    <span className="text-white font-bold">{modPack.genres[0]?.name || "Cyber Trance"}</span>
                    <span className="block text-[8px] text-slate-400 mt-1">Triplets | {modPack.genres[0]?.bpmDefault || 142} BPM</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-600 hidden md:block" />
                  <div className="bg-emerald-990/10 p-2 border border-emerald-500/20 rounded-md text-center shrink-0 w-40 shadow-lg border-dashed">
                    <span className="text-slate-300 font-bold">{modPack.genres[1]?.name || "Acid Glitch"}</span>
                    <span className="block text-[8px] text-slate-500 mt-1">Experimental | 10/10 Sub</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ARTIST & PORTRAIT CUSTOMIZER */}
          {activeTab === "artists" && (
            <div id="artists_profiles_view" className="space-y-5">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <div className="space-y-0.5">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-[#00FF95] font-mono flex items-center gap-2">
                    <User className="h-4 w-4" /> AI Artist Profiles & Rival Directors
                  </h2>
                  <span className="text-[9px] text-slate-500 font-mono">Customize DJ skill ranges, online behavior posting traits, and active egos.</span>
                </div>
                <button
                  onClick={addNewArtist}
                  className="bg-[#00FF95]/10 hover:bg-[#00FF95]/20 border border-[#00FF95]/30 hover:border-[#00FF95] text-[#00FF95] px-2.5 py-1 rounded-lg text-xs font-mono transition-all active:scale-95 flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> ADD RIVAL PRODUCER
                </button>
              </div>

              <div className="grid grid-cols-1 gap-5">
                {modPack.artists.map((a) => {
                  const portrait = getAvatarColors(a.portraitSeed);
                  return (
                    <div key={a.id} className="bg-slate-950 border border-slate-900 p-4.5 rounded-xl flex flex-col md:flex-row gap-5 font-mono">
                      
                      {/* Left: Interactive portrait preview with background seed modifier */}
                      <div className="md:w-36 flex flex-col items-center justify-center shrink-0 space-y-2">
                        <div className={`h-24 w-24 rounded-2xl bg-gradient-to-br ${portrait.bg} border ${portrait.border} flex items-center justify-center relative overflow-hidden shadow-xl shadow-slate-950/40`}>
                          <div className={`absolute h-7 w-7 rounded-full ${portrait.accColor} opacity-20 filter blur-md top-4`} />
                          <User className="h-10 w-10 text-white" />
                        </div>
                        <select
                          value={a.portraitSeed}
                          onChange={(e) => updateArtistField(a.id, "portraitSeed", e.target.value)}
                          className="bg-slate-900 border border-slate-800 text-[10px] text-slate-400 p-1 rounded w-full text-center cursor-pointer font-mono"
                        >
                          <option value="purple_hood">Cosmic Violet</option>
                          <option value="acid_helmet">Acid Emerald</option>
                          <option value="yellow_glasses">Vapor Bronze</option>
                        </select>
                        <span className="text-[10px] text-slate-500 font-mono italic">Mod Portrait</span>
                      </div>

                      {/* Right: Property controls */}
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-left">
                          <div className="space-y-1">
                            <span className="block text-[9.5px] uppercase text-slate-500">Artist Pseudonym</span>
                            <input
                              type="text"
                              value={a.name}
                              onChange={(e) => updateArtistField(a.id, "name", e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-white text-xs font-bold"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="block text-[9.5px] uppercase text-slate-500">Home Region</span>
                            <input
                              type="text"
                              value={a.nationality}
                              onChange={(e) => updateArtistField(a.id, "nationality", e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-350 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="block text-[9.5px] uppercase text-slate-500">Specialty Style</span>
                            <input
                              type="text"
                              value={a.primaryGenre}
                              onChange={(e) => updateArtistField(a.id, "primaryGenre", e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-[#00FF95] text-xs font-mono"
                            />
                          </div>
                        </div>

                        {/* Skill Tuning arrays */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-left pt-1">
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[9px] uppercase text-slate-500">
                              <span>Mixing Skill</span>
                              <span className="text-[#00FF95] font-bold">{a.skillMixing}%</span>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="100"
                              value={a.skillMixing}
                              onChange={(e) => updateArtistField(a.id, "skillMixing", e.target.value)}
                              className="w-full accent-[#00FF95] h-1"
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[9px] uppercase text-slate-500">
                              <span>Pr publicity</span>
                              <span className="text-[#00FF95] font-bold">{a.skillPR}%</span>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="100"
                              value={a.skillPR}
                              onChange={(e) => updateArtistField(a.id, "skillPR", e.target.value)}
                              className="w-full accent-[#00FF95] h-1"
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[9px] uppercase text-slate-500">
                              <span>Ego Index</span>
                              <span className="text-[#FF00FF] font-bold">{a.ego}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={a.ego}
                              onChange={(e) => updateArtistField(a.id, "ego", e.target.value)}
                              className="w-full accent-[#FF00FF] h-1"
                            />
                          </div>
                        </div>

                        {/* Social Posting & Drama parameters */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-left pt-1">
                          <div className="space-y-1">
                            <span className="block text-[9.5px] uppercase text-slate-500">Social Posting Style</span>
                            <select
                              value={a.postingStyle}
                              onChange={(e) => updateArtistField(a.id, "postingStyle", e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs"
                            >
                              <option value="mysterious">Mysterious / Dark Tech</option>
                              <option value="aggressive_beef">Beef Creator / Arrogant</option>
                              <option value="shitposter">Shitposter Meme Lord</option>
                              <option value="wholesome">Supportive Community Guide</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <span className="block text-[9.5px] uppercase text-slate-500">Collaboration Willingness</span>
                            <select
                              value={a.collaborationPreference}
                              onChange={(e) => updateArtistField(a.id, "collaborationPreference", e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs"
                            >
                              <option value="solo">Strictly Solo / Reclusive</option>
                              <option value="local_only">Local Scene Players</option>
                              <option value="stars_only">Sells out to Big DJs</option>
                              <option value="open_source">Open-Source Copyleft</option>
                            </select>
                          </div>
                          <div className="space-y-1.5 flex flex-col justify-end">
                            <button
                              onClick={() => deleteArtist(a.id)}
                              className="w-full bg-red-950/20 hover:bg-red-900/30 text-red-400 hover:text-red-300 border border-red-500/15 py-1.5 rounded text-[10px] transition-all cursor-pointer font-bold active:scale-95"
                            >
                              Purge Profile
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: STUDIO EQUIPMENT HARDWARE EDITOR */}
          {activeTab === "gear" && (
            <div id="gear_specs_view" className="space-y-5">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <div className="space-y-0.5">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-[#00FF95] font-mono flex items-center gap-2">
                    <Cpu className="h-4 w-4" /> Hardware & Studio Equipment Specifications
                  </h2>
                  <span className="text-[9px] text-slate-500 font-mono">Design analog modular synths, high-fidelity monitoring, and laser systems.</span>
                </div>
                <button
                  onClick={addNewGear}
                  className="bg-[#00FF95]/10 hover:bg-[#00FF95]/20 border border-[#00FF95]/30 hover:border-[#00FF95] text-[#00FF95] px-2.5 py-1 rounded-lg text-xs font-mono transition-all active:scale-95 flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> ADD NEW GEAR BLUEPRINT
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modPack.gears.map((item) => (
                  <div key={item.id} className="bg-slate-950/80 border border-slate-900 p-4 rounded-xl space-y-4 font-mono text-left">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-purple-400" />
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateGearField(item.id, "name", e.target.value)}
                          className="font-bold text-white bg-transparent border-b border-transparent hover:border-slate-800 focus:border-[#00FF95] focus:outline-hidden text-xs text-left"
                        />
                      </div>
                      <button
                        onClick={() => deleteGear(item.id)}
                        className="text-red-500/60 hover:text-red-400 p-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[11px]">
                      <div className="space-y-1">
                        <span className="text-slate-500 block">Class Category</span>
                        <select
                          value={item.category}
                          onChange={(e) => updateGearField(item.id, "category", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-xs text-slate-300 cursor-pointer"
                        >
                          <option value="synthesizer">Analog Synthesizer</option>
                          <option value="drum_machine">Drum Machine / Collector</option>
                          <option value="plugin">Digital VST Plugin</option>
                          <option value="monitors">Loudspeaker Monitors</option>
                          <option value="lighting">Lasers & Smoke Rigs</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-500 block">Retail Value ($)</span>
                        <input
                          type="number"
                          value={item.cost}
                          onChange={(e) => updateGearField(item.id, "cost", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-xs text-[#00FF95] font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[10px]">
                      <div className="space-y-1">
                        <span className="text-slate-500 block">Studio Bonus</span>
                        <input
                          type="number"
                          value={item.soundBonus}
                          onChange={(e) => updateGearField(item.id, "soundBonus", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-300"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-500 block">Maintenance Fee</span>
                        <input
                          type="number"
                          value={item.maintenanceCost}
                          onChange={(e) => updateGearField(item.id, "maintenanceCost", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-300"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-500 block">Vintage Rarity</span>
                        <input
                          type="number"
                          value={item.vintageRating}
                          onChange={(e) => updateGearField(item.id, "vintageRating", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-300"
                        />
                      </div>
                    </div>

                    {/* Hardware schematic synthesizer visual design block */}
                    <div className="bg-[#050507] p-2.5 rounded-lg border border-slate-900 flex justify-between items-center text-[10px]">
                      <span className="text-slate-500 font-mono">Analog Circuit Render:</span>
                      <div className="flex gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 bg-[#00FF95] rounded-full"></span>
                        <span className="w-1.5 h-1.5 bg-[#FF00FF] rounded-full"></span>
                        <span className="w-1.5 h-1.5 bg-slate-800 rounded-full"></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: WORLD MAP & REGIONAL SCENES */}
          {activeTab === "world" && (
            <div id="world_regions_view" className="space-y-5">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <div className="space-y-0.5">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-[#00FF95] font-mono flex items-center gap-2">
                    <Globe className="h-4 w-4" /> Global Music Scenes & Venue Regions
                  </h2>
                  <span className="text-[9px] text-slate-500 font-mono">Spawn illegal brick squats, rooftop glass arenas, and custom police levels.</span>
                </div>
                <button
                  onClick={addNewCity}
                  className="bg-[#00FF95]/10 hover:bg-[#00FF95]/20 border border-[#00FF95]/30 hover:border-[#00FF95] text-[#00FF95] px-2.5 py-1 rounded-lg text-xs font-mono transition-all active:scale-95 flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> ADD REGIONAL HUB
                </button>
              </div>

              {/* Graphic interactive grid map mockup */}
              <div className="bg-[#0A0A0C] border border-slate-900 p-4 rounded-xl space-y-3 font-mono text-left">
                <h3 className="text-[#00FF95] text-[10px] uppercase font-bold flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#00FF95]" /> Scene Matrix Radar Coordinates
                </h3>
                <div className="h-36 bg-slate-950 border border-slate-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-dotted-pattern grid-grid opacity-20 pointer-events-none" />
                  {modPack.cities.map((city, idx) => {
                    const positions = [
                      { left: "15%", top: "35%" },
                      { left: "45%", top: "60%" },
                      { left: "75%", top: "25%" }
                    ];
                    const pos = positions[idx % positions.length];
                    return (
                      <div
                        key={city.id}
                        style={{ left: pos.left, top: pos.top }}
                        className="absolute h-4 w-4 rounded-full bg-cyan-400 group cursor-pointer animate-ping-slow hover:scale-125 transition-transform"
                        title={city.name}
                      >
                        <span className="absolute left-5 top-[-4px] whitespace-nowrap bg-slate-900 border border-slate-800 text-[8.5px] px-1 py-0.2 rounded text-white font-mono opacity-80 z-10 font-bold">{city.name}</span>
                      </div>
                    );
                  })}
                  <span className="text-[10px] text-slate-600 font-mono italic">Radar tracking active raves database coordinates</span>
                </div>
              </div>

              {/* Editable lists */}
              <div className="grid grid-cols-1 gap-4 text-left font-mono">
                {modPack.cities.map((city) => (
                  <div key={city.id} className="bg-slate-950/80 border border-slate-900 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                    <div className="space-y-1 flex flex-col justify-center">
                      <input
                        type="text"
                        value={city.name}
                        onChange={(e) => {
                          const updated = {
                            ...modPack,
                            cities: modPack.cities.map(c => c.id === city.id ? { ...c, name: e.target.value } : c)
                          };
                          savePackToStorage(updated);
                        }}
                        className="font-bold text-white bg-transparent border-b border-transparent hover:border-slate-800 focus:border-[#00FF95] text-xs"
                      />
                      <span className="text-[9.5px] text-slate-500">{city.country}</span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span>Economic Index</span>
                        <span className="text-emerald-400 font-bold">{city.economicIndex}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={city.economicIndex}
                        onChange={(e) => {
                          const updated = {
                            ...modPack,
                            cities: modPack.cities.map(c => c.id === city.id ? { ...c, economicIndex: Number(e.target.value) } : c)
                          };
                          savePackToStorage(updated);
                        }}
                        className="w-full accent-emerald-500 h-1"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span>Underground Scene</span>
                        <span className="text-purple-400 font-bold">{city.undergroundRatio}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={city.undergroundRatio}
                        onChange={(e) => {
                          const updated = {
                            ...modPack,
                            cities: modPack.cities.map(c => c.id === city.id ? { ...c, undergroundRatio: Number(e.target.value) } : c)
                          };
                          savePackToStorage(updated);
                        }}
                        className="w-full accent-purple-500 h-1"
                      />
                    </div>

                    <div className="text-right flex items-center justify-end">
                      <button
                        onClick={() => deleteCity(city.id)}
                        className="text-red-500/60 hover:text-red-400 p-1.5 bg-slate-900 border border-slate-850 rounded-lg cursor-pointer hover:bg-slate-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: AI INTERACTIVE SCHEMATIC GRAPH */}
          {activeTab === "nodegraph" && (
            <div id="ai_nodegraph_view" className="space-y-5">
              <div className="border-b border-slate-900 pb-3">
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#00FF95] font-mono flex items-center gap-2">
                  <GitBranch className="h-4 w-4" /> Visual AI Behavior & Decision Logic Builder
                </h2>
                <span className="text-[9px] text-slate-500 font-mono">Edit decision weights and algorithmic consequence chains via node mapping logic.</span>
              </div>

              {/* Node Schematic canvas */}
              <div className="bg-[#050507] border border-slate-900 p-5 rounded-xl space-y-4 font-mono text-left">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-900 pb-3 text-xs">
                  <span className="text-[10px] text-[#00FF95]/90 font-bold uppercase tracking-widest">ACTIVE BEHAVIOR SLATE</span>
                  <div className="flex gap-2">
                    <span className="bg-purple-950/25 border border-purple-500/20 px-2 py-0.5 rounded text-[8.5px] text-purple-400 font-bold">LUA PARSER v3</span>
                    <span className="bg-emerald-950/25 border border-emerald-500/20 px-2 py-0.5 rounded text-[8.5px] text-[#00FF95] font-bold">SYNAPSE_ONLINE</span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-stretch gap-6 justify-center pt-2">
                  
                  {/* Node A (Decision Hook) */}
                  <div className="bg-slate-950 border border-purple-500/30 p-4 rounded-xl space-y-2 flex-1 relative shadow-lg">
                    <div className="absolute right-[-14px] top-1/2 -translate-y-1/2 w-7 h-[1px] bg-purple-500/50 hidden md:block"></div>
                    <span className="text-[9.5px] uppercase text-purple-400 font-bold tracking-widest block font-mono">1. Trigger Condition</span>
                    <select
                      value={nodeTrigger}
                      onChange={(e) => setNodeTrigger(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-850 p-1.5 rounded text-white text-[11px] cursor-pointer"
                    >
                      <option value="on_release">On Track Release Loop</option>
                      <option value="on_gig_fail">On High Burnout Warning</option>
                      <option value="on_burnout_peak">On Boiler Room Backlash</option>
                    </select>
                    <p className="text-[9px] text-slate-500">Listens to global game date ticks for virtual artist metrics changes.</p>
                  </div>

                  {/* Node B (Modulating Ratio) */}
                  <div className="bg-slate-950 border border-emerald-500/30 p-4 rounded-xl space-y-3 flex-1 relative shadow-lg">
                    <div className="absolute right-[-14px] top-1/2 -translate-y-1/2 w-7 h-[1px] bg-emerald-500/50 hidden md:block"></div>
                    <span className="text-[9.5px] uppercase text-[#00FF95] font-bold tracking-widest block font-mono">2. Signal Gain multiplier</span>
                    <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                      <span>Consequence Coefficient:</span>
                      <strong className="text-[#00FF95]">{nodeMultiplier}x</strong>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="3.0"
                      step="0.1"
                      value={nodeMultiplier}
                      onChange={(e) => setNodeMultiplier(Number(e.target.value))}
                      className="w-full accent-[#00FF95] h-1"
                    />
                  </div>

                  {/* Node C (Consequence Output Action) */}
                  <div className="bg-slate-950 border border-cyan-500/30 p-4 rounded-xl space-y-2 flex-1 relative shadow-lg">
                    <span className="text-[9.5px] uppercase text-cyan-400 font-bold tracking-widest block font-mono">3. Output Action Node</span>
                    <select
                      value={nodeAction}
                      onChange={(e) => setNodeAction(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-850 p-1.5 rounded text-white text-[11px] cursor-pointer"
                    >
                      <option value="generate_controversy">Post Controversial Twitter Beef</option>
                      <option value="trigger_algorithm_boost">Inject Spotify Playlist Algorithm</option>
                      <option value="induce_inspiration">Reward Inspiration Sparkles</option>
                    </select>
                    <div className="flex items-center gap-1.5 text-[9.5px] pt-1">
                      <input
                        type="checkbox"
                        id="by"
                        checked={nodeBypass}
                        onChange={(e) => setNodeBypass(e.target.checked)}
                        className="accent-cyan-400 cursor-pointer"
                      />
                      <label htmlFor="by" className="text-slate-500 cursor-pointer">Bypass Sandbox validations</label>
                    </div>
                  </div>

                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 text-xs text-slate-400 select-all leading-relaxed font-sans mt-3">
                  <code className="text-[10px] text-purple-300 font-mono">
                    -- Compiled Visual Logic Branch: <br />
                    if game.state.{nodeTrigger} == true then<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;AIActionHandler:compile(ActionType.{nodeAction.toUpperCase()}, {nodeMultiplier})<br />
                    end
                  </code>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: RANDOM PLOT SCRINTS & STORIES */}
          {activeTab === "events" && (
            <div id="events_scripts_view" className="space-y-5">
              <div className="border-b border-slate-900 pb-3">
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#00FF95] font-mono flex items-center gap-2">
                  <Flame className="h-4 w-4" /> Dynamic Story Events & Narrative Scripting
                </h2>
                <span className="text-[9px] text-slate-500 font-mono">Create random weather storms, viral streaming hacks, or label scandals with specific trigger multipliers.</span>
              </div>

              <div className="space-y-4">
                {modPack.events.map((ev) => (
                  <div key={ev.id} className="bg-slate-950/80 border border-slate-900 p-4.5 rounded-xl space-y-3 font-mono text-left text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-2">
                      <span className="font-bold text-white text-xs">{ev.title}</span>
                      <div className="flex gap-2">
                        <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[9.5px] text-slate-400">Trigger: {ev.triggerType}</span>
                        <span className="bg-red-950/20 border border-red-500/20 px-2 py-0.5 rounded text-[9.5px] text-red-400">Rate: {ev.probability}%</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 text-[10px]">Pop-up Narrative Text:</span>
                      <textarea
                        value={ev.narrativeText}
                        onChange={(e) => {
                          const updated = {
                            ...modPack,
                            events: modPack.events.map(item => item.id === ev.id ? { ...item, narrativeText: e.target.value } : item)
                          };
                          savePackToStorage(updated);
                        }}
                        rows={2}
                        className="w-full bg-[#050507] border border-slate-900 rounded p-2 text-slate-350"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[10px] text-left">
                      <div className="space-y-1">
                        <span className="text-slate-500 block">Money Reward / Penalty ($)</span>
                        <input
                          type="number"
                          value={ev.moneyModifier}
                          onChange={(e) => {
                            const updated = {
                              ...modPack,
                              events: modPack.events.map(item => item.id === ev.id ? { ...item, moneyModifier: Number(e.target.value) } : item)
                            };
                            savePackToStorage(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-850 p-1 rounded text-[#00FF95]"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-500 block">Fans Recruited</span>
                        <input
                          type="number"
                          value={ev.fansModifier}
                          onChange={(e) => {
                            const updated = {
                              ...modPack,
                              events: modPack.events.map(item => item.id === ev.id ? { ...item, fansModifier: Number(e.target.value) } : item)
                            };
                            savePackToStorage(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-850 p-1 rounded text-purple-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-500 block">Hype Change (%)</span>
                        <input
                          type="number"
                          value={ev.hypeModifier}
                          onChange={(e) => {
                            const updated = {
                              ...modPack,
                              events: modPack.events.map(item => item.id === ev.id ? { ...item, hypeModifier: Number(e.target.value) } : item)
                            };
                            savePackToStorage(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-850 p-1 rounded text-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: ROYALTY INDICES & ECONOMICS BALANCE */}
          {activeTab === "economy" && (
            <div id="economy_balance_view" className="space-y-5">
              <div className="border-b border-slate-900 pb-3">
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#00FF95] font-mono flex items-center gap-2">
                  <Coins className="h-4 w-4" /> Global Music Economics & Inflation Indices
                </h2>
                <span className="text-[9px] text-slate-500 font-mono">Configure royalties per stream play, hardware pricing coefficients, and tour splits.</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left font-mono">
                
                {/* Sliders Block */}
                <div className="bg-slate-950 border border-slate-900 p-5 rounded-xl space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 uppercase tracking-wider text-[10px]">Base Stream Royalty / Click</span>
                      <strong className="text-[#00FF95] text-[13px]">${modPack.economy.baseStreamPayout.toFixed(4)}</strong>
                    </div>
                    <input
                      type="range"
                      min="0.0010"
                      max="0.0600"
                      step="0.0005"
                      value={modPack.economy.baseStreamPayout}
                      onChange={(e) => savePackToStorage({ ...modPack, economy: { ...modPack.economy, baseStreamPayout: Number(e.target.value) } })}
                      className="w-full accent-[#00FF95] h-1"
                    />
                    <span className="text-[9px] text-slate-550 block">Standard Spotify payout is $0.0031. Bandcamp premium ranges are higher.</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 uppercase tracking-wider text-[10px]">Touring Revenue Multiplier</span>
                      <strong className="text-[#FF00FF]">{modPack.economy.touringMarkup.toFixed(1)}x</strong>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="3.0"
                      step="0.1"
                      value={modPack.economy.touringMarkup}
                      onChange={(e) => savePackToStorage({ ...modPack, economy: { ...modPack.economy, touringMarkup: Number(e.target.value) } })}
                      className="w-full accent-[#FF00FF] h-1"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 uppercase tracking-wider text-[10px]">Label Publishing Cut</span>
                      <strong className="text-amber-400">{modPack.economy.labelContractTaxRate}%</strong>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="85"
                      value={modPack.economy.labelContractTaxRate}
                      onChange={(e) => savePackToStorage({ ...modPack, economy: { ...modPack.economy, labelContractTaxRate: Number(e.target.value) } })}
                      className="w-full accent-amber-500 h-1"
                    />
                  </div>
                </div>

                {/* SVG Visual Graphic - Realtime yield forecast charting */}
                <div className="bg-[#050507] border border-slate-900 p-5 rounded-xl flex flex-col justify-between">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-[#00FF95] font-bold">Projected Revenue Matrix</span>
                    <span className="text-[9px] text-slate-500 block">Forecast based on virtual subscriber growth vs active streaming royalties.</span>
                  </div>

                  <div className="h-28 flex items-end justify-between gap-1 pb-2 pt-4 relative">
                    <div className="absolute top-2 right-2 text-[8px] text-slate-500 border border-slate-905 p-1 rounded font-mono bg-slate-950/70">
                      ROYALTY SLOPE YIELD
                    </div>
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50">
                      <path
                        d={`M 0 50 Q 25 ${50 - modPack.economy.baseStreamPayout * 1000} 50 ${50 - modPack.economy.baseStreamPayout * 1600} T 100 ${Math.max(2, 50 - modPack.economy.baseStreamPayout * 2200)}`}
                        fill="none"
                        stroke="#00FF95"
                        strokeWidth="1.5"
                        className="drop-shadow-[0_0_4px_rgba(0,255,149,0.7)]"
                      />
                    </svg>
                  </div>

                  <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono">
                    <span>1K Followers Stage</span>
                    <span>10K Followers Stage</span>
                    <span>100K Followers Stage</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 9: AUTOMATED SIMULATOR LABORATORY */}
          {activeTab === "stress" && (
            <div id="stress_test_lab_channel" className="space-y-5">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <div className="space-y-0.5">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-[#FF00FF] font-mono flex items-center gap-2">
                    <Terminal className="h-4 w-4 animate-spin-slow text-[#FF00FF]" /> Autonomous Sandbox & Economy Debugger
                  </h2>
                  <span className="text-[9px] text-slate-500 font-mono">Autoplay simulated game blocks at 100x speed to analyze modded balance equations safely.</span>
                </div>
                
                <button
                  type="button"
                  onClick={startAutoplayStressTest}
                  className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-all font-bold cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                    isSimulating 
                      ? "bg-red-600 border border-red-500 text-white hover:bg-red-500 shadow-md shadow-red-950/20" 
                      : "bg-[#FF00FF]/15 border border-[#FF00FF]/40 text-[#FF00FF] hover:bg-[#FF00FF]/25 shadow-md shadow-purple-950/30"
                  }`}
                >
                  {isSimulating ? <Square className="h-3.5 w-3.5 fill-white" /> : <Play className="h-3.5 w-3.5 fill-[#FF00FF]" />}
                  {isSimulating ? "HALT SIMULATION BUILD" : "INITIALIZE INSTANT SIMULATOR"}
                </button>
              </div>

              {/* Status Header Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-left bg-slate-950/80 p-3.5 border border-slate-900 rounded-xl">
                <div className="space-y-1">
                  <span className="text-[8.5px] uppercase text-slate-500">Virtual Simulation Clock</span>
                  <div className="text-[#FF00FF] text-sm font-bold">
                    Year {simDate.year}, Month {simDate.month}, Week {simDate.week}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[8.5px] uppercase text-slate-500">Sandbox Safety Index</span>
                  <div className="text-slate-300 text-sm font-bold">
                    98.4% STABLE
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[8.5px] uppercase text-slate-500">Core Loop Iterations</span>
                  <div className="text-cyan-400 text-sm font-bold">
                    {simTimelineStats.length} ticks
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[8.5px] uppercase text-slate-500">Fast Forward Factor</span>
                  <div className="text-[#00FF95] text-sm font-bold">
                    100x Real-time
                  </div>
                </div>
              </div>

              {/* Real-time simulation log output */}
              <div className="space-y-2 text-left font-mono">
                <div className="flex justify-between items-center text-[10px] uppercase text-slate-400 font-bold px-1">
                  <span>Simulated Terminal Thread Feed:</span>
                  <span className="text-[#00FF95] animate-pulse">● RADAR READING</span>
                </div>
                <div className="h-44 bg-[#050507] border border-slate-900 rounded-xl p-3.5 overflow-y-auto text-[10px] space-y-2 font-mono scrollbar-thin select-text">
                  {simLogs.length === 0 ? (
                    <div className="text-slate-650 italic text-center py-10">
                      Terminal empty. Click "Initialize Instant Simulator" above to run decades of live career progressions, streaming payouts, and viral moments instantly!
                    </div>
                  ) : (
                    simLogs.map((log, index) => (
                      <div key={index} className="text-slate-400 border-l border-slate-850 pl-2 leading-relaxed">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Workspace Sidebar - Intel & active metadata specs - hidden in standalone */}
        {!standaloneMode && (
          <div className="lg:col-span-3 space-y-6">
            
            {/* Active Mod Pack stats */}
            <div className="bg-[#070709] border border-[#1A1A1E] p-4.5 rounded-xl space-y-4 font-mono text-left text-xs">
              <h3 className="text-[11px] uppercase tracking-wider text-[#00FF95] font-bold flex items-center gap-1.5">
                <Database className="h-4 w-4 text-[#00FF95]" /> ACTIVE MOD PACK STATS
              </h3>
              
              <div className="space-y-2 border-b border-slate-900 pb-2 bg-slate-950/40 p-2.5 rounded-lg border">
                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="text-slate-500 font-medium">Manifest Hook Name:</span>
                  <span className="text-white font-bold max-w-[120px] truncate">{modPack.metadata.name}</span>
                </div>
                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="text-slate-500 font-medium">Author Compiler:</span>
                  <span className="text-white font-bold">{modPack.metadata.author}</span>
                </div>
                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="text-slate-500 font-medium">Active Code base:</span>
                  <span className="text-cyan-400 font-bold">{modPack.metadata.version}</span>
                </div>
              </div>

              <div className="space-y-2 pt-1 font-mono text-[10.5px]">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Custom Microgenres:</span>
                  <strong className="text-[#00FF95] bg-[#00FF95]/5 px-1.5 border border-[#00FF95]/20 rounded">{modPack.genres.length} active</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Rival DJ Blueprints:</span>
                  <strong className="text-purple-400 bg-purple-500/5 px-1.5 border border-purple-500/20 rounded">{modPack.artists.length} spawned</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Custom Synth Modules:</span>
                  <strong className="text-amber-400 bg-amber-500/5 px-1.5 border border-amber-500/20 rounded">{modPack.gears.length} coded</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Warehouse City Scene:</span>
                  <strong className="text-cyan-400 bg-cyan-500/5 px-1.5 border border-cyan-500/20 rounded">{modPack.cities.length} mapped</strong>
                </div>
              </div>
            </div>

            {/* Quick-Mod Advice Guide Box */}
            <div className="bg-[#FF00FF]/5 border border-[#FF00FF]/20 p-4.5 rounded-xl space-y-3 font-mono text-left text-xs">
              <h4 className="text-[10px] uppercase tracking-wider text-[#FF00FF] font-bold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#FF00FF]" /> MODDING INTEL COMPILER
              </h4>
              <ul className="space-y-2 text-[10px] text-slate-300 leading-relaxed font-sans list-disc list-inside">
                <li>
                  <strong className="text-white font-semibold">Total Conversion bypass</strong> ignores standard base game lookups. Use it when importing large community total conversions!
                </li>
                <li>
                  Set your <strong className="text-[#00FF95] font-semibold">Base stream royalty coefficient higher</strong> to test extreme sandbox career play or faster studio gear unlocking.
                </li>
                <li>
                  Click the <strong className="text-cyan-400 font-semibold">Hot-Inject to Live Game</strong> button at any time to immediately write your custom specs into the active session frame memory without resetting your level!
                </li>
              </ul>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
