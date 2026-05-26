/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, RefreshCw, Send, Radio, UserCheck, Flame, Users, Sparkles, MessageCircleCode } from "lucide-react";
import { GameState, VirtualArtist } from "../types";
import { getAllPredefinedArtists, getTopPredefinedArtists } from "../data/artists";
import { getExtendedLabelsDB } from "../data/recordLabels";

interface SocialDramaProps {
  gameState: GameState;
  onModifyRelationship: (artistId: string, delta: number, status: string) => void;
  onTriggerDrama: (title: string, desc: string, hypeAward: number, fanChange: number) => void;
  onCollaborate: (artistName: string, fee: number) => void;
}

// Use predefined artists from JSON database
const getVirtualArtistsDB = (): VirtualArtist[] => {
  const predefined = getAllPredefinedArtists();
  // Take top 20 artists from JSON
  if (predefined.length > 0) {
    return getTopPredefinedArtists(20);
  }
  // Fallback to static artists if JSON doesn't load
  return VIRTUAL_ARTISTS_DB_FALLBACK;
};

// Static fallback artists (only used if JSON doesn't load)
const VIRTUAL_ARTISTS_DB_FALLBACK: VirtualArtist[] = [
  {
    id: "acid_core",
    name: "DJ Acid_Core",
    primaryGenre: "Techno" as any,
    ego: 92,
    fame: 45,
    relationship: 0,
    status: "neutral",
    bio: "Hardcore Berlin vinyl-only purist. Refuses to use laptops or play in clubs that allow smartphones inside.",
    gender: "male",
    pronouns: "he/him"
  },
  {
    id: "liquid_viper",
    name: "Liquid Viper",
    primaryGenre: "Drum & Bass" as any,
    ego: 50,
    fame: 35,
    relationship: 20,
    status: "friend",
    bio: "Liquid roller programmer out of London. Extremely supportive of bedroom producers.",
    gender: "female",
    pronouns: "she/her"
  },
  {
    id: "cosmic_gazer",
    name: "Cosmic Gazer",
    primaryGenre: "Trance" as any,
    ego: 68,
    fame: 60,
    relationship: 10,
    status: "neutral",
    bio: "Euphoric festival DJ and space-pad specialist. Famous for 8-hour sets during Amsterdam Arena weeknights.",
    gender: "female",
    pronouns: "she/her"
  },
  {
    id: "neon_rider",
    name: "Neon Rider",
    primaryGenre: "Synthwave" as any,
    ego: 75,
    fame: 25,
    relationship: 0,
    status: "neutral",
    bio: "LA modular synthwave collector obsessed with outrun grids, digital neon, and 1985 car aesthetics.",
    gender: "male",
    pronouns: "he/him"
  },
  {
    id: "glitch_lord",
    name: "Glitch Lord",
    primaryGenre: "Experimental" as any,
    ego: 99,
    fame: 50,
    relationship: -50,
    status: "rival",
    bio: "Tokyo sound-art developer who writes custom DSP code to generate white-noise clicks. Extremely critical and dismissive of mainstream formats.",
    gender: "non-binary",
    pronouns: "they/them"
  },
  {
    id: "velvet_grid",
    name: "DJ Velvet_Grid",
    primaryGenre: "House" as any,
    ego: 55,
    fame: 65,
    relationship: 15,
    status: "colleague",
    bio: "Deep house pioneer who runs an independent all-female/non-binary club residency in Chicago. Extremely warm, passionate about vinyl, and vocal about gender diversity in booking rosters.",
    gender: "female",
    pronouns: "she/her"
  },
  {
    id: "subsec_zero",
    name: "SubSec_Zero",
    primaryGenre: "Industrial" as any,
    ego: 82,
    fame: 38,
    relationship: -10,
    status: "neutral",
    bio: "Brutalist industrial noise sculptor. Designs glitchy steam-hammer patterns. Dedicated advocate for safe, decentralized, gender-inclusive warehouse parties.",
    gender: "non-binary",
    pronouns: "they/them"
  },
  {
    id: "moko_bass",
    name: "Moko Bass",
    primaryGenre: "Dubstep" as any,
    ego: 45,
    fame: 42,
    relationship: 10,
    status: "neutral",
    bio: "London vinyl DJ crafting heavyweight, deep system dubstep. Outspoken critic of brostep gatekeeping. Deeply values physical sound systems and sub-frequencies.",
    gender: "female",
    pronouns: "she/her"
  },
  {
    id: "hardcore_hype",
    name: "Hardcore Hype",
    primaryGenre: "Hardstyle" as any,
    ego: 82,
    fame: 70,
    relationship: 0,
    status: "neutral",
    bio: "Rotterdam rave storm energy driver. Promotes massive crowd singalongs and heavy-distorted reversed kicks. Believes in ultimate raw rave brotherly solidarity.",
    gender: "male",
    pronouns: "he/him"
  },
  {
    id: "slo_mo_waves",
    name: "Slo_Mo_Waves",
    primaryGenre: "Ambient" as any,
    ego: 32,
    fame: 44,
    relationship: 15,
    status: "neutral",
    bio: "Icelandic field-recording specialist. Employs tape loops, glaciers, and distant wind turbines. Believes meditative waves should heal the community's burnout.",
    gender: "male",
    pronouns: "he/him"
  }
];

const getArtistPortrait = (artistId: string): string => {
  const mapping: { [key: string]: string } = {
    acid_core: "techno_raver_face_shadowed",
    liquid_viper: "drum_and_bass_dj_female_british",
    cosmic_gazer: "blonde_trance_musician_retro_space",
    neon_rider: "cool_outrun_jacket_sunglasses_male",
    glitch_lord: "eccentric_japanese_noise_artist",
    velvet_grid: "female_chicago_house_producer_headphones",
    subsec_zero: "nonbinary_brutalist_raver_colored_hair",
    moko_bass: "london_dubstep_female_vinyl_dj_streetwear",
    hardcore_hype: "rotterdam_hardstyle_male_neon_cap",
    slo_mo_waves: "bearded_ambient_icelandic_producer_sweater"
  };
  return `https://picsum.photos/seed/${mapping[artistId] || artistId}/100/100`;
};

const PORTRAITS_DB: { [key: string]: string } = {
  techno_purist: "/src/assets/images/avatar_techno_purist_1779785211830.png",
  edm_superstar: "/src/assets/images/avatar_edm_superstar_1779785231025.png",
  sound_designer: "/src/assets/images/avatar_sound_designer_1779785250169.png",
  nostalgia_runner: "/src/assets/images/avatar_nostalgia_runner_1779785267478.png"
};

// Lazy-loaded forum labels (needs to be before CHAT_PROMPT_CATEGORIES)
let forumLabelsCache: string[] | null = null;
const getForumLabels = (): string[] => {
  if (forumLabelsCache) return forumLabelsCache;
  try {
    const extendedLabels = getExtendedLabelsDB();
    if (extendedLabels.length > 0) {
      forumLabelsCache = extendedLabels.map(label => label.name);
    }
  } catch (e) {}
  if (!forumLabelsCache) {
    forumLabelsCache = ["Subterranean Clicks", "NeOnlyt Outrun", "Breakbeat Syndicate", "Aurora Heavenly", "Vortex Mainstage"];
  }
  return forumLabelsCache;
};
const FORUM_LABELS = (): string[] => getForumLabels();

const CHAT_PROMPT_CATEGORIES = [
  {
    id: "praise",
    categoryName: "👍 Praise",
    options: [
      { text: "Your latest set was absolute fire! The raw modular synth transitions were a masterpiece.", relBonus: 8 },
      { text: "Your vinyl EP release is incredibly driving. The low-end bass separation is top-tier.", relBonus: 9 },
    ]
  },
  {
    id: "advice",
    categoryName: "🎛️ Ask Advice",
    options: [
      { text: "I'm struggling with low-end mud in my sub-bass. Any tips on sidechaining physical hardware?", relBonus: 5 },
      { text: "How do you prevent high-end noise sweeps from overwhelming your active main chords?", relBonus: 6 },
    ]
  },
  {
    id: "gear",
    categoryName: "🔌 Sonic Tech",
    options: [
      { text: "Do you swear by authentic hardware loops or have you fully compromised to virtual plugins?", relBonus: 5 },
      { text: "I'm buying some Eurorack units. Should I start with basic VCOs or a dual transistor filter?", relBonus: 5 },
    ]
  },
  {
    id: "gossip",
    categoryName: "📣 Gossip",
    options: [
      { text: `Did you hear that rumor about ${FORUM_LABELS()[0] || 'Vortex Records'} cutting player royalty shares by 35%?`, relBonus: 4 },
      { text: "The rumor mill says that EDM festival superstar is using anonymous ghost producers from Detroit!", relBonus: 4 },
    ]
  },
  {
    id: "shade",
    categoryName: "🌶️ Roast/Beef",
    options: [
      { text: "Honestly, your performance style feels like a pre-recorded USB playlist. Are you even turning the knobs?", relBonus: -18 },
      { text: "Your new EP feels super watered down. Did you trade your underground modular soul for stream playbacks?", relBonus: -16 },
    ]
  }
];

const getProceduralReply = (artistId: string, category: string, relationship: number, ego: number): string => {
  const prefix = relationship <= -25 ? "😒 " : relationship >= 35 ? "🔥 " : "💬 ";
  
  if (relationship <= -30) {
    if (category === "shade") {
      return prefix + `Did you really just send that to me? Look, your small bedroom project has zero actual followers. Don't speak to me until you can pack a 200-person underground warehouse.`;
    }
    if (category === "praise") {
      return prefix + `Save your cheap flattery. I saw what you posted about my setups online last week. You're just trying to clout-chase off my catalog.`;
    }
    return prefix + `We have literally nothing to discuss. Go back to playing with cheap loops in your parent's cellar.`;
  }
  
  switch (artistId) {
    case "acid_core":
      if (category === "praise") {
        return prefix + `Appreciate that! But honestly, the crowd is only half the battle. If you aren't engraving your own dubplates, you're missing the true raw modular essence of techno.`;
      }
      if (category === "advice") {
        return prefix + `Low-end mud? That's because of cheap digital algorithms. Run your kick drum through an analog hardware gain booster. Cut everything below 30Hz, let the sub breathe, and bypass your digital limits.`;
      }
      if (category === "gossip") {
        const badLabel = FORUM_LABELS()[Math.floor(Math.random() * 5)] || FORUM_LABELS()[0] || 'Vortex Records';
        return prefix + `I wouldn't be surprised. ${badLabel} is run by corporate lawyers who don't know the difference between a 909 kick and a laundry tumble. Stick to underground self-releases.`;
      }
      if (category === "gear") {
        return prefix + `VCOs, obviously! Software is just mathematical emulation trying to fake physical tube warmth. Start with a solid analog dual-oscillator and let it scream through a real transistor staircase filter.`;
      }
      if (category === "shade") {
        return prefix + `Pre-recorded? I've been spinning vinyl since before you got your first cracked software DAW! I patch my Eurorack live every single set. Show some respect to the scene hardware purists.`;
      }
      break;

    case "liquid_viper":
      if (category === "praise") {
        return prefix + `Aww, thanks mate! The liquid drum & bass sound is all about that deep roller sub and organic vocal pads. Happy you're feeling the vibe.`;
      }
      if (category === "advice") {
        return prefix + `To clear up noise sweeps, use a dynamic EQ and sidechain the noise to your actual vocal hooks. It creates a beautiful breathing pocket without muddying the main frequencies.`;
      }
      if (category === "gossip") {
        return prefix + `Yeah, heard that rumor about the ghost producer. Honestly, it's sad but that's how the pop festival scene survives. No one can tour 250 dates a year and have time for actual sound engineering.`;
      }
      if (category === "gear") {
        return prefix + `Both! I use a modular rack for weird organic bass textures, but a digital software DAW is unparalleled for tight surgical EQ edits. Use whatever gets the track finished!`;
      }
      if (category === "shade") {
        return prefix + `Ouch, that's harsh! I put my absolute heart into these arrangements. But hey, feedback is part of the career—I'll just let the music speak on the dance floor.`;
      }
      break;

    case "cosmic_gazer":
      if (category === "praise") {
        return prefix + `Thank you! Trance is a spiritual bridge. When the lasers strike during the breakdown of Cosmic Ascent, the energy is pure cosmic alignment.`;
      }
      if (category === "advice") {
        return prefix + `To get euphoric lead synth power, double your saw waves, detune them heavily, and add a ping-pong stereo delay. Space out the reverb so it floats on top of the sub-bass.`;
      }
      if (category === "gossip") {
        const badLabel = FORUM_LABELS()[Math.floor(Math.random() * 5)] || FORUM_LABELS()[0] || 'Some label';
        return prefix + `${badLabel} is facing major litigation. Independent creators need to stick to collaborative publishing collectives. Keep your royalty splits clear.`;
      }
      if (category === "gear") {
        return prefix + `Hardware filters have this nostalgic, angelic quality. But modern digital wavetable plugins let you modulate shapes that physical hardware can only dream of. Mix both to touch the heavens!`;
      }
      if (category === "shade") {
        return prefix + `Haters will hate, but millions stay up till 6 AM to hear my buildups. Enjoy your empty bedroom while we light up the arena laser shows!`;
      }
      break;

    case "neon_rider":
      if (category === "praise") {
        return prefix + `Rad! Stoked to hear you're riding the outrun grid waves. 1985 aesthetics aren't just a trend, they're a physical life-mood.`;
      }
      if (category === "advice") {
        return prefix + `For sweet retro vibes, use gated reverb on your snare drums. Cut the reverb tail instantly at the grid line. It gives that punchy neon-soaked 80s kick instantly.`;
      }
      if (category === "gossip") {
        return prefix + `Ghost producers? That’s what happens when money is more important than hardware solder fumes. Stay true to the analog grid and write your own tracks.`;
      }
      if (category === "gear") {
        return prefix + `Retro polyphonic FM synthesis all the way! There's nothing like a physical DX7 or Juno-106. The warmth of drift oscillators makes your tracks sound like an old VHS soundtrack.`;
      }
      if (category === "shade") {
        return prefix + `Whoa, slow down raver! These knobs represent thousands of dollars of historical collector's tech. I'm actually modulating real-time LFO rates, not just acting.`;
      }
      break;

    case "glitch_lord":
      if (category === "praise") {
        return prefix + `Hmph. I suppose your ears can parse the microscopic phase shifts. Most bedroom brains just want simple four-on-the-floor claps.`;
      }
      if (category === "advice") {
        return prefix + `Noise is not the boundary—noise IS the composition. Do not hide it. Crank the noise sweep up, filter out the entire predictable melody, and embrace industrial chaos.`;
      }
      if (category === "gossip") {
        return prefix + `All popular music distribution labels are garbage commercial ventures designed for automated sheep streaming. Why do you even care about royalties? Live on bread and water like a true developer.`;
      }
      if (category === "gear") {
        return prefix + `I compile my own sound design kernels in raw C++ and feed it into custom analog distortion racks. If you are bought into commercial DAWs, you are already a corporate hostage.`;
      }
      if (category === "shade") {
        return prefix + `You call it pre-recorded? It is real-time stochastic generative noise modulation! Your simple linear tracks are preschool drawings compared to my mathematical equations.`;
      }
      break;

    case "velvet_grid":
      if (category === "praise") {
        return prefix + `Thank you, love! Deep house is all about centering soul, warmth, and making space. I always aim to bring dynamic, inclusive energy to my Chicago club residencies!`;
      }
      if (category === "advice") {
        return prefix + `For warm house chords, try playing minor 9th keys on a Rhodes plugin, then route it through a subtle stereo chorus and a vintage optical compressor. It gives that gorgeous 90s vinyl depth.`;
      }
      if (category === "gossip") {
        return prefix + `The industry is full of boys'-club gatekeepers and quick money schemes. That's why I curated my own independent platform, to lift up underrepresented women and non-binary artists. Unity is key.`;
      }
      if (category === "gear") {
        return prefix + `I swear by vintage MPC samplers for their unmatched swing algorithms. Plugins are convenient, but the physical feel of tapping out house beats has true human groove.`;
      }
      if (category === "shade") {
        return prefix + `No need for bitterness. I've spent two decades building spaces and supporting creators. If my groove isn't for you, there's plenty of room in the house scene.`;
      }
      break;

    case "subsec_zero":
      if (category === "praise") {
        return prefix + `System acknowledgement active. Minimal phase cancellation detected in your perception. Industrial techno is about tearing down corporate barriers.`;
      }
      if (category === "advice") {
        return prefix + `To construct brutal steam-hammer kicks, run a standard 909 kick through a parallel chain of heavy asymmetric diode clippers, then brickwall limit it. It must crash through the room frequencies.`;
      }
      if (category === "gossip") {
        return prefix + `We avoid discussion of commercial labels. Safe, decentralized, gender-inclusive warehouse spaces are the only real alternative to their automated feeds.`;
      }
      if (category === "gear") {
        return prefix + `We use custom-soldered Eurorack modules and heavy physical tube distortions. Our interfaces do not recognize standard binary presets or commercial software restrictions.`;
      }
      if (category === "shade") {
        return prefix + `Your criticisms are linear, predictable, and commercial. We construct real-time industrial chaos to shatter fragile egos like yours.`;
      }
      break;

    case "moko_bass":
      if (category === "praise") {
        return prefix + `Big up, selecta! Glad you're feeling the 140 BPM waves. Raw dubstep should hit the chest, not just the laptop speakers!`;
      }
      if (category === "advice") {
        return prefix + `Low-end mud comes from overlapping mid-range stems. Always put a low-pass filter on your sub-bass around 80Hz, write clean single sine-waves, and let the space speak between notes.`;
      }
      if (category === "gossip") {
        return prefix + `Brostep DJs have spent years gatekeeping the scene and commercializing the culture. That's why we're cutting our own dubplates and keeping the real underground alive.`;
      }
      if (category === "gear") {
        return prefix + `We play straight off acetate dubplate vinyl. Software is handy for digital distribution, but you can't emulate the physical sub-pressure of a real analog needle.`;
      }
      if (category === "shade") {
        return prefix + `Is that the best you've got? Call it what you want, but while you're clicking in boxes with a mouse, I'm playing heavy physical system baselines to packed warehouses.`;
      }
      break;

    case "hardcore_hype":
      if (category === "praise") {
        return prefix + `YEAH! ROTTERDAM ENERGY IS ALIVE! Feel that unbridled hardcore power, my friend! Let's blow the arena speakers to bits!`;
      }
      if (category === "advice") {
        return prefix + `To write a massive hardstyle lead, layer seven super-saw waves, detune them completely, high-pass at 200Hz, and run it through a heavy ping-pong delay. It should sound like standard stadium lightning!`;
      }
      if (category === "gossip") {
        return prefix + `I heard some labels are faking stream scores, but who cares about corporate politics when you've got a thousands-strong crowd singalong at 155 BPM?! Rave brotherhood rules!`;
      }
      if (category === "gear") {
        return prefix + `Access Virus TI hardware is the holy grail for raw hardstyle leads! But software synth layered combinations do the job perfectly if you distort them to hell!`;
      }
      if (category === "shade") {
        return prefix + `Pre-recorded? Hahaha, you must be dreaming! I'm running around the stage, coordinating a massive fireworks show, and hyping up 10,000 ravers! Show some spirit or stay home!`;
      }
      break;

    case "slo_mo_waves":
      if (category === "praise") {
        return prefix + `Bless you. Glad my ambient washes brought some peaceful focus to your session. We all need to breathe in this hyper-saturated digital world.`;
      }
      if (category === "advice") {
        return prefix + `To build therapeutic drone spaces, feed field recordings of wind or ocean tides into a granular delay. Stretch the grains to 5000ms, and let the stereo field drift slowly.`;
      }
      if (category === "gossip") {
        return prefix + `The industry breeds burnout and toxic obsession. Stop scrolling through forum beefs and go take a silent walk in nature. Your mind will thank you.`;
      }
      if (category === "gear") {
        return prefix + `I record straight onto old degraded reel-to-reel tape cassettes. The unpredictable magnetic wobble and natural hiss add a beautiful, therapeutic human element you can't fake.`;
      }
      if (category === "shade") {
        return prefix + `I'm not bothered by your words. I chose to step away from the fast-paced ego race a long time ago. I wish you peace on your own creative trek.`;
      }
      break;
  }
  return prefix + `Keep compounding original stems. We're all tweaking waves in the dark.`;
};

export default function SocialDramaForum({ gameState, onModifyRelationship, onTriggerDrama, onCollaborate }: SocialDramaProps) {
  const [activeTab, setActiveTab] = useState<"dms" | "ravemind">("dms");
  const allArtists = getVirtualArtistsDB();
  const [selectedArtist, setSelectedArtist] = useState<VirtualArtist>(allArtists[1] || allArtists[0]);
  const [forumThreads, setForumThreads] = useState<any[]>([]);
  const [forumFilter, setForumFilter] = useState<ForumCategory | "all">("all");
  const [selectedThread, setSelectedThread] = useState<any>(null);

  // Filtered threads based on active category
  const filteredThreads = forumFilter === "all" 
    ? forumThreads 
    : forumThreads.filter(t => t.category === forumFilter);

  // Handle thread click to view details
  const handleThreadClick = (thread: any) => {
    setSelectedThread(thread);
  };

  // Create new thread handler
  const handleCreateNewThread = () => {
    const categories: ForumCategory[] = ["general", "tech", "scene", "gossip", "drama", "tips"];
    const newThread = generateDynamicThread(categories[Math.floor(Math.random() * categories.length)], gameState);
    newThread.author = "@" + gameState.pseudonym.replace(/\s+/g, "_");
    setForumThreads(prev => addForumThread(prev, newThread));
  };

  // Persistent relationship state
  const [relations, setRelations] = useState<{ [key: string]: number }>(() => {
    try {
      const saved = localStorage.getItem("schub_producer_relations");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return allArtists.reduce((acc, a) => ({ ...acc, [a.id]: a.relationship }), {});
  });

  // Persistent DM threads mapped by artist ID
  const [dmThreads, setDmThreads] = useState<{ [key: string]: string[] }>(() => {
    try {
      const saved = localStorage.getItem("schub_producer_dm_threads");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    
    return {
      acid_core: [
        `DJ Acid_Core: "Vinyl only, pure warehouse sounds. Hit me up if you want to route some raw hardware oscillation."`
      ],
      liquid_viper: [
        `Liquid Viper: "Yo! I heard your bedroom loop designs. There's real soul in those drum claps. Drop me a DM whenever you want to cook a liquid project."`
      ],
      cosmic_gazer: [
        `Cosmic Gazer: "Welcome back! Tweaking high atmospheric delay paths in the trance dome. Any dream ideas to share?"`
      ],
      neon_rider: [
        `Neon Rider: "Keeping the 1985 synth wave alive on the outrun grid. Talk to me if you want to configure nostalgic analog layouts."`
      ],
      glitch_lord: [
        `Glitch Lord: "Microphonic phase cancelation study active. Do not bother me with amateur four-on-the-floor claps."`
      ],
      velvet_grid: [
        `DJ Velvet_Grid: "Hey babe! Chicago house grooves are all about the soul and keeping our dancefloors diverse and inclusive. Ready to lay down some Rhodes keys with me?"`
      ],
      subsec_zero: [
        `SubSec_Zero: "Scanning frequencies... System initialized. Let's configure heavy warehouse modulations. Keep it decentralized."`
      ],
      moko_bass: [
        `Moko Bass: "Heavyweight 140 BPM sound system weight here. Drop a line if you're ready to cut through the corporate dubstep gatekeeping."`
      ],
      hardcore_hype: [
        `Hardcore Hype: "ROTTERDAM SQUAD! Let's pump up the BPM to 155! Are you ready for a massive distorted kick collaboration?!"`
      ],
      slo_mo_waves: [
        `Slo_Mo_Waves: "Peace. Listening to the rain loops through warm analog tapes. Reach out if you need to chill and discuss soothing ambient spaces."`
      ]
    };
  });

  const [activePromptCategory, setActivePromptCategory] = useState<string>("praise");
  const [customInput, setCustomInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const playerImg = PORTRAITS_DB[gameState.avatarSeed as keyof typeof PORTRAITS_DB] || PORTRAITS_DB["techno_purist"];

  // Save to localStorage on changes
  useEffect(() => {
    localStorage.setItem("schub_producer_relations", JSON.stringify(relations));
  }, [relations]);

  useEffect(() => {
    localStorage.setItem("schub_producer_dm_threads", JSON.stringify(dmThreads));
  }, [dmThreads]);

  // Scroll to bottom of chat when thread updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [dmThreads, selectedArtist, isTyping]);

  // Forum thread categories
type ForumCategory = "general" | "tech" | "scene" | "gossip" | "genre" | "drama" | "tips";

// Dynamic forum thread templates
const FORUM_THREAD_TEMPLATES = {
  tech: [
    { titleTemplate: "New {gear} just dropped - thoughts?", replies: 15, previewTemplate: "Just saw the spec sheet on the new {gear}. Is it worth upgrading from my current setup?" },
    { titleTemplate: "Best plugin for {sound} synthesis in 2024?", replies: 28, previewTemplate: "Been experimenting with {sound} textures. Which VSTs do you recommend for that authentic feel?" },
    { titleTemplate: "Hardware vs Software: {question}", replies: 45, previewTemplate: "I've been going back and forth. What are your experiences with pure {type} setups?" },
    { titleTemplate: "LPB vs HPB filter讨论 - Which is better for {genre}?", replies: 33, previewTemplate: "The age-old debate continues. Low-pass or high-pass? Drop your opinions." },
    { titleTemplate: "VST cracking in 2024 - Ethical dilemma?", replies: 89, previewTemplate: "Plugins cost hundreds. Students can't afford them. Is piracy justified for learning?" },
    { titleTemplate: "The DAW wars: Which one truly is best?", replies: 156, previewTemplate: "Ableton vs FL vs Logic vs Bitwig vs Cubase. Fight me in the comments." },
    { titleTemplate: "Modular synthesis beginner guide needed", replies: 42, previewTemplate: "Just bought my first case. Where do I even start? Oscillators? VCOs?" },
    { titleTemplate: "Analog warmth - Real or myth?", replies: 78, previewTemplate: "Some say you can hear the difference. Others say it's placebo. Blind test results?" },
    { titleTemplate: "MIDI controller recommendations for live performance?", replies: 34, previewTemplate: "Need something reliable for gigging. Currently using Akai but thinking of upgrading." },
    { titleTemplate: "Cloud studios vs local setup - What's the future?", replies: 56, previewTemplate: "Splice and Soundtrap are getting popular. Will we need powerful local machines anymore?" },
  ],
  scene: [
    { titleTemplate: "Is the {city} underground scene dying?", replies: 67, previewTemplate: "Just got back from {city} and the crowds felt different. Less energy, more phone-scrolling." },
    { titleTemplate: "{genre} artists to watch this year", replies: 34, previewTemplate: "Compile your top picks for {genre} rising talents. Let's support the underground!" },
    { titleTemplate: "Festival lineup predictions for {event}", replies: 89, previewTemplate: "Who's getting main stage this year? My bets are on {artist} but..." },
    { titleTemplate: "Best warehouse venues still keeping it real?", replies: 45, previewTemplate: "Looking for underground spots that don't sell out. North America preferred." },
    { titleTemplate: "The decline of vinyl culture - Discuss", replies: 112, previewTemplate: "Everyone claims to DJ vinyl but plays from USB. The hypocrisy is real." },
    { titleTemplate: "Illegal raves making a comeback post-pandemic?", replies: 67, previewTemplate: "Hearing about more and more unsanctioned events. Is this the future?" },
    { titleTemplate: "Drug culture in clubs - Where do we draw the line?", replies: 234, previewTemplate: "The scene has a serious problem. Harm reduction vs enforcement?" },
    { titleTemplate: "Gender diversity in {genre} - Still a boys club?", replies: 145, previewTemplate: "Book more women. Book more non-binary artists. The lineup diversity is embarrassing." },
    { titleTemplate: "Sound system culture vs mainstage production", replies: 89, previewTemplate: "UK soundsystem culture needs more recognition. Bass weight > expensive visuals." },
    { titleTemplate: "Is {city} still the techno capital of the world?", replies: 178, previewTemplate: "Amsterdam and Detroit are catching up. Berlin's dominance might be ending." },
  ],
  gossip: [
    { titleTemplate: "Breaking: {artist} accused of ghost production", replies: 156, previewTemplate: "Just saw some deleted tweets. Allegations are flying on the {platform} boards. Thoughts?" },
    { titleTemplate: "Label drama: {label} cutting royalties", replies: 98, previewTemplate: "Internal documents leaked showing major royalty cuts. How do we fight this?" },
    { titleTemplate: "Underground beef: {artist1} vs {artist2}", replies: 73, previewTemplate: "Saw them go at it on Instagram stories. This beef is getting real." },
    { titleTemplate: "Exposing the pay-to-play festival circuit", replies: 201, previewTemplate: "Artists paying to get on festival lineups. This is corruption. Thread inside." },
    { titleTemplate: "Manager scammed me out of royalties - Avoid {label}", replies: 134, previewTemplate: "Signed with this management company 2 years ago. Haven't seen a single cent." },
    { titleTemplate: "Headliner no-show at underground event - Embarrassing", replies: 87, previewTemplate: "Drove 4 hours to see {artist}. They showed up 3 hours late, played 40 mins." },
    { titleTemplate: "Streaming playlist corruption exposed", replies: 167, previewTemplate: "Major playlists are charging artists for placement. Against Spotify ToS." },
    { titleTemplate: "Producer stole my unreleased track - DM me for proof", replies: 112, previewTemplate: "Found my stems in their new release. The cheeky bastards didn't even change the tempo." },
    { titleTemplate: "Industry secrets: What really happens at A&R meetings", replies: 89, previewTemplate: "Former label employee here. Ask me anything about the inner workings." },
    { titleTemplate: "Is {artist} actually playing live or just pressing play?", replies: 145, previewTemplate: "Saw their set last night. The same kick pattern for 45 minutes. Thoughts?" },
  ],
  genre: [
    { titleTemplate: "{genre} production tips for beginners", replies: 42, previewTemplate: "Starting my journey into {genre}. What's the most important element to focus on?" },
    { titleTemplate: "{genre} revival in {city}?", replies: 31, previewTemplate: "Noticed a surge of {genre} parties lately. Is the scene making a comeback?" },
    { titleTemplate: "Why is {genre} so gatekept?", replies: 178, previewTemplate: "Every genre has purists but {genre} people are on another level. Discuss." },
    { titleTemplate: "The perfect {genre} track structure breakdown", replies: 56, previewTemplate: "Been producing for 5 years. Finally cracked the formula. Thread with examples." },
    { titleTemplate: "{genre} BPM debate - What's the sweet spot?", replies: 89, previewTemplate: "Is 140 the only acceptable BPM? Can we slow it down without being posers?" },
    { titleTemplate: "Microgenres destroying {genre} culture?", replies: 134, previewTemplate: "We have 47 subgenres now. When did this get so complicated?" },
    { titleTemplate: "{genre} production software - What DAW works best?", replies: 67, previewTemplate: "Ableton for techno, FL for EDM... What about pure {genre}?" },
    { titleTemplate: "Classic {genre} albums everyone should know", replies: 112, previewTemplate: "Creating a definitive list. Drop your essential albums below." },
    { titleTemplate: "Is AI going to replace {genre} producers?", replies: 145, previewTemplate: "Suno and Udio are getting scary good. The future is uncertain." },
    { titleTemplate: "Regional {genre} scenes - Who's leading in 2024?", replies: 78, previewTemplate: "East Coast vs West Coast vs Europe vs Asia. Where's the innovation happening?" },
  ],
  drama: [
    { titleTemplate: "Calling out: {artist} for {reason}", replies: 203, previewTemplate: "This needs to be said. {artist} has been acting {behavior} and we shouldn't stay silent." },
    { titleTemplate: "Hot take: {genre} was better in {year}s", replies: 156, previewTemplate: "Controversial opinion but the {genre} from {year} had something special that we lost." },
    { titleTemplate: "This community is toxic and I'm done", replies: 289, previewTemplate: "After 10 years in the scene, I'm hanging up my headphones. Here's why." },
    { titleTemplate: "{artist} deserves to be blacklisted - Here's why", replies: 178, previewTemplate: "They've hurt too many people. The community needs to stand together." },
    { titleTemplate: "Unpopular opinion about viral TikTok DJs", replies: 234, previewTemplate: "They're actually good for the scene. Hear me out before downvoting." },
    { titleTemplate: "The real reason vinyl is dying (it's not what you think)", replies: 167, previewTemplate: "Stop blaming CDs and streaming. The real enemy is within the community." },
    { titleTemplate: "I got doxxed for having an opinion - Be careful out there", replies: 145, previewTemplate: "Posted a mild critique of a popular artist. Now my address is public." },
    { titleTemplate: "Scene elders need to step aside - Fresh blood only", replies: 112, previewTemplate: "Same names, same sound, same everything. New voices are being silenced." },
    { titleTemplate: "The 'true' {genre} debate has gone too far", replies: 98, previewTemplate: "Death threats over BPM? We need to calm down as a community." },
    { titleTemplate: "Streaming killed creativity and nobody wants to admit it", replies: 189, previewTemplate: "2-minute tracks, loudness wars, no dynamics. Thanks Spotify." },
  ],
  tips: [
    { titleTemplate: "How to get booked at {venue}?", replies: 67, previewTemplate: "Sent demos to {venue} 10 times already. What am I missing? Tips appreciated!" },
    { titleTemplate: "Studio setup tour: show us your gear", replies: 89, previewTemplate: "Let's see everyone's workspace! I'll start: I run a modular setup with {gear}." },
    { titleTemplate: "Mastering chain for {genre} - What's your go-to?", replies: 45, previewTemplate: "I've tried everything. Need that punchy, clear loudness. Share your presets!" },
    { titleTemplate: "How to approach labels without being annoying?", replies: 78, previewTemplate: "Got some tracks ready. How often should I follow up? Weekly? Monthly?" },
    { titleTemplate: "Budget studio acoustic treatment guide", replies: 112, previewTemplate: "No money for professional treatment. DIY solutions that actually work?" },
    { titleTemplate: "Building a loyal fanbase from zero", replies: 156, previewTemplate: "500 followers after 2 years. What am I doing wrong? Need actual advice." },
    { titleTemplate: "Sample clearance - Do I really need to?", replies: 89, previewTemplate: "My track using that sample got 100k plays. No strikes. Is clearance worth it?" },
    { titleTemplate: "Live performance setup on a budget", replies: 67, previewTemplate: "Want to start playing shows but my setup is bedroom only. What's essential?" },
    { titleTemplate: "Collaboration etiquette - What's the norm?", replies: 98, previewTemplate: "First collab incoming. Split revenue 50/50? What about credit order?" },
    { titleTemplate: "Music promotion that actually works in 2024", replies: 134, previewTemplate: "Tried everything. Algorithmic playlists are a scam. Where should I focus?" },
  ],
  general: [
    { titleTemplate: "Managing burnout while producing", replies: 45, previewTemplate: "Feeling exhausted from the grind. How do you balance creativity with mental health?" },
    { titleTemplate: "Best cities for bedroom producers?", replies: 78, previewTemplate: "Thinking about relocating for better scene access. Which cities have the best communities?" },
    { titleTemplate: "Day job vs music career", replies: 124, previewTemplate: "Working 9-5 and trying to produce at night. How do full-time producers survive financially?" },
    { titleTemplate: "How did you fund your first release?", replies: 89, previewTemplate: "Saving up for vinyl pressing. Takes forever. Other producers' experiences?" },
    { titleTemplate: "Producer imposter syndrome - Real talk", replies: 167, previewTemplate: "Been producing 5 years, released 20 tracks. Still feel like a fraud. Anyone else?" },
    { titleTemplate: "Ageism in the electronic music scene", replies: 134, previewTemplate: "I'm 45 and still producing. Clubs only book young artists. Is this legal?" },
    { titleTemplate: "Music production education - Worth it?", replies: 98, previewTemplate: "Considering going to audio school. Is the debt worth the connections and knowledge?" },
    { titleTemplate: "How to deal with creative block for months?", replies: 145, previewTemplate: "Haven't finished a track in 6 months. Starting to doubt everything." },
    { titleTemplate: "Health tips for producers who sit all day", replies: 78, previewTemplate: "Back problems, wrist issues, eye strain. How do you stay healthy?" },
    { titleTemplate: "Balancing family life with a music career", replies: 112, previewTemplate: "Got kids, got gigs, got almost no sleep. Stories and advice welcome." },
  ]
};

// Artists for thread mentions
const FORUM_ARTISTS = ["Acid_Core", "Liquid Viper", "Neon Rider", "Glitch Lord", "SubSec_Zero", "Moko Bass", "Hardcore Hype", "Cosmic Gazer"];

const CITIES = ["Berlin", "London", "Detroit", "Amsterdam", "Ibiza", "Tokyo", "Los Angeles", "Chicago"];
const GEAR_ITEMS = ["Eurorack modular", "Moog Subsequent 37", "TR-808", "Elektron Digitakt", "Ableton Push", "Roland Juno-106", "Korg MS-20", "Teenage Engineering OP-1"];

// Comprehensive AI-style comment templates - 50+ per category for maximum variety
const COMMENT_TEMPLATES: { [key: string]: { author: string; text: string; sentiment?: 'positive' | 'negative' | 'neutral' }[] } = {
  tech: [
    { author: "@ModularHead", text: "Swapped my entire plugin collection for hardware 3 years ago. Best decision I ever made. The tactile feedback during live sets is irreplaceable.", sentiment: "positive" },
    { author: "@PluginPirate", text: "Nobody can tell the difference in a club. Save your money. The audience cares about energy, not gear.", sentiment: "neutral" },
    { author: "@AnalogAdvocate", text: "You can literally hear the difference. ADC/DAC converters on analog gear have that harmonic distortion that makes kick drums slap.", sentiment: "positive" },
    { author: "@BedroomProducer", text: "I run a hybrid setup. MPC for sequencing, modular for textures, ITB for mixing. Best of all worlds honestly.", sentiment: "positive" },
    { author: "@DAWStan", text: "The algorithms are literally modeled after the hardware. Same filters, same EQs. You're paying for convenience not sound quality.", sentiment: "neutral" },
    { author: "@SoundSnob", text: "Only producers who've actually studied synthesis can tell the difference. Casual listeners lap up any compressed Spotify stream.", sentiment: "negative" },
    { author: "@VintageCollector", text: "My 1985 Juno-106 still works perfectly. Modern gear is built disposable. This thing will outlive me.", sentiment: "positive" },
    { author: "@CloudProducer", text: "I make more money with my laptop than artists with $50k studios. Working cheap and fast beats fancy gear.", sentiment: "positive" },
    { author: "@FilterFanatic", text: "The transistor ladder filter on the MS-20 cannot be replicated in software. It's not about algorithms, it's about component tolerances.", sentiment: "positive" },
    { author: "@AbletonNative", text: "Max for Live unlocked my entire workflow. Custom devices that do exactly what I need. No hardware comes close.", sentiment: "positive" },
    { author: "@SoftSynthDefender", text: " Serum has more modulation options than any hardware synth on the market. The era of analog supremacy is over.", sentiment: "positive" },
    { author: "@HybridSetup", text: "Analog for the soul, digital for the precision. My chain goes Eurorack → Apollo → Pro Tools. Perfect balance.", sentiment: "neutral" },
    { author: "@BitCrusher", text: "Sometimes those digital artifacts are exactly what you need. Bitcrushed drums hit different in a industrial track.", sentiment: "neutral" },
    { author: "@OscillatorLover", text: "Pure analog VCOs drift in tuning throughout the night. That's not a bug, that's a feature. The movement IS the music.", sentiment: "positive" },
    { author: "@CPUHog", text: "My plugin chain maxes out a Threadripper at 70% CPU. Worth it for the sound. Time to upgrade the machine.", sentiment: "neutral" },
    { author: "@MinimalSetup", text: "Just got an OP-1 Field and a mic. That's it. Everything else is just coping with lack of creativity.", sentiment: "negative" },
    { author: "@EurorackCultist", text: "My system costs more than a car but each module is an instrument. No two patches are ever the same.", sentiment: "positive" },
    { author: "@ITBProducer", text: "In the box workflow with proper monitoring reveals flaws in your mix. Nothing hides in the EQ.", sentiment: "neutral" },
    { author: "@VSTCollector", text: "Over 2TB of plugins. Use maybe 10 regularly. The rest is collector brain. Someone send help.", sentiment: "negative" },
    { author: "@LivePerformer", text: "Hardware fails mid-gig. Software crashes. At least with a laptop I can Alt-Tab out of problems.", sentiment: "neutral" },
    { author: "@SynthCollector", text: "Piled my Prophet, Sub 37, and Subsequent in storage. Use V Collection now. Space is expensive.", sentiment: "neutral" },
    { author: "@Pedalboard", text: "Throw an envelope follower on any synth and run it through a pedalboard. Game changer. No plugin needed.", sentiment: "positive" },
    { author: "@DawLessProducer", text: "Can't produce in a DAW. Need the immediacy of hardware. Ableton Push cut my creative block completely.", sentiment: "positive" },
    { author: "@LatencyFix", text: "New interface dropped latency to 2ms. Can't tell anymore if I'm playing hardware or software. Finally.", sentiment: "positive" },
    { author: "@PresetUser", text: "Made a track using 100% factory presets. Charted on Beatport. Authenticity is overrated.", sentiment: "negative" },
    { author: "@HardwareTrader", text: "Sold my entire hardware rig. Rebuilt in software for $200. Miss the gear, not the workflow.", sentiment: "neutral" },
    { author: "@PluginDev", text: "I'm an audio dev. Most 'analog modeled' plugins are just IIR filters with a label. Hear the difference? Probably not.", sentiment: "neutral" },
    { author: "@TapeWorm", text: "Ran everything through a Tascam 4-track before ITB. That saturation is irreplaceable. Miss those cassettes.", sentiment: "positive" },
    { author: "@Controllerist", text: "Launchpad + Launchkey + APC = full performance setup. No synths needed. The grid is my instrument.", sentiment: "positive" },
    { author: "@DIYBuilder", text: "Built my own synth from scratch. SMD soldering took 40 hours. Sounds like garbage. Zero regrets.", sentiment: "neutral" },
    { author: "@PluginTrial", text: "The trial period is too short. Need at least a month to really know if a plugin fits the workflow.", sentiment: "neutral" },
    { author: "@SoundDesignFreak", text: "Spent 6 hours designing one kick drum. Neighbour thinks I'm crazy. Worth every second.", sentiment: "positive" },
    { author: "@BudgetProducer", text: "Zoom H1n + GarageBand = my entire studio. Released on every platform. Quality isn't about money.", sentiment: "positive" },
    { author: "@SynthRental", text: "Rented a Jupiter-8 for a session. $300 well spent. Will rent again for the next release.", sentiment: "neutral" },
    { author: "@MidiController", text: "MIDI controllers don't make you a musician. You need actual instruments. But they're fun to play.", sentiment: "negative" },
    { author: "@GranularGeek", text: "Changed to granular processing for everything. Reverb becomes a synthesizer. Mind blown daily.", sentiment: "positive" },
    { author: "@ChannelStripFan", text: "Neve 1073 clone into every chain. Adds weight and air. Simple is sometimes best.", sentiment: "positive" },
    { author: "@NoEffects", text: "My latest EP is completely dry. No reverb, no delay. Raw and aggressive. People love it.", sentiment: "positive" },
    { author: "@WarmthChaser", text: "Tubes, transformers, tape. Add them all for that 'warm' sound everyone chases. It's measurable.", sentiment: "positive" },
    { author: "@ClinicalDigital", text: "Flat response monitors, linear plugins, no coloration. Accuracy over character. Fight me.", sentiment: "neutral" },
    { author: "@LoFiObsessed", text: "Recording to cassette, playing through a broken speaker, bitcrushing the result. Perfect texture.", sentiment: "positive" },
    { author: "@PluginHoarder", text: "Own every FabFilter plugin. Use Pro-Q and Pro-L. The others just sit there making me feel guilty.", sentiment: "neutral" },
    { author: "@AutomationAddict", text: "Every parameter is automated. No static sounds. The mix breathes like a living thing.", sentiment: "positive" },
    { author: "@MacroMadness", text: "Four macro knobs controlling 20 parameters. One knob turn transforms the entire track.", sentiment: "positive" },
    { author: "@ResonanceQueen", text: "Self-oscillation is not a flaw. It's an instrument. Crank that filter resonance.", sentiment: "positive" },
    { author: "@DrySignal", text: "No effects. Just straight signal chain. Guitar → Interface → DAW. Minimalism is underrated.", sentiment: "neutral" },
    { author: "@PedalSynth", text: "Running synths through guitar pedals exclusively now. The dirt is real. Cheap too.", sentiment: "positive" },
    { author: "@PolyChain", text: "Two polysynths playing together. Unison mode on both. The chords are massive.", sentiment: "positive" },
    { author: "@Monophonist", text: "Mono synths force you to be melodic. Polyphony is for people who can't compose.", sentiment: "negative" },
    { author: "@FMHater", text: "FM synthesis is math, not music. Real instruments have soul. This debate again?", sentiment: "negative" },
    { author: "@WavetableLover", text: "Modern wavetable synths do everything analog can AND more. The debate is over.", sentiment: "positive" },
  ],
  scene: [
    { author: "@RaveVeteran", text: "The scene has evolved so much since 2010. The underground moved online, now it's coming back full circle.", sentiment: "neutral" },
    { author: "@FestivalGoer", text: "Phones everywhere now. Half the crowd watching through screens. Miss when people lived in the moment.", sentiment: "negative" },
    { author: "@UndergroundPunk", text: "That's why I only play at illegal warehouse events. No cameras, no corporate sponsors, pure sound.", sentiment: "positive" },
    { author: "@InstagramDJ", text: "You need to build your brand. Social media is everything. Posting is promotion. Be everywhere.", sentiment: "positive" },
    { author: "@OldSchoolRaver", text: "Back in my day we had to wait for vinyl pressings! Now it's SoundCloud links and playlist adds.", sentiment: "neutral" },
    { author: "@TechHouseFan", text: "Berlin is still the mecca. Tresor and Berghain define the sound. Nothing else comes close.", sentiment: "positive" },
    { author: "@CocktailDJ", text: "Commercial festivals killed the underground. Every lineup looks the same. Corporate takeover complete.", sentiment: "negative" },
    { author: "@BasementBouncer", text: "Our venue still has a no-photos policy. 100% pure. Guards are strict. Scene integrity matters.", sentiment: "positive" },
    { author: "@LineupCritic", text: "Every festival sounds the same now. Cookie-cutter booking. Same 20 names rotating through every event.", sentiment: "negative" },
    { author: "@CampingCrew", text: "The vibes at camping festivals are unmatched though. Three days of music, no reality to return to.", sentiment: "positive" },
    { author: "@SoundSystemSnob", text: "Quality PA systems are rare. Most venues butcher the mix. If it doesn't rattle your chest, it's wrong.", sentiment: "neutral" },
    { author: "@DayRaver", text: "Just came for the music. None of the pretentious stuff. Buy ticket, dance, leave. Simple.", sentiment: "neutral" },
    { author: "@RavePhotog", text: "Capturing moments for the community. Art meets music. Need better photo pass access though.", sentiment: "positive" },
    { author: "@VIPScammer", text: "VIP areas killed the PLUR culture. Everyone's equal on the floor.分层 is destroying community.", sentiment: "negative" },
    { author: "@RaveRecover", text: "The afterparty is where the real magic happens. Official event ends at 2am, real party starts at 4.", sentiment: "positive" },
    { author: "@RAVEMOM", text: "Taking my 12-year-old to their first rave next month. Age-appropriate events only. They're so excited.", sentiment: "positive" },
    { author: "@DoorFeeDebate", text: "$25 cover is fine. $25 plus $15 drink minimum is robbery. Venues need to stop.", sentiment: "negative" },
    { author: "@SoundCloudSurvivor", text: "Still uploading every mix to SoundCloud. Follower count stagnant but the community is real.", sentiment: "neutral" },
    { author: "@PromoterProblems", text: "Promoted an event, sold 40 tickets, venue bumped us for a corporate party. This industry.", sentiment: "negative" },
    { author: "@RespectTheResident", text: "Resident DJs are the backbone of this scene. Stop booking touring acts over local talent.", sentiment: "positive" },
    { author: "@WaterVendor", text: "Charging $8 for water is criminal. Festivals especially. People need hydration, not price gouging.", sentiment: "negative" },
    { author: "@TapeCollector", text: "Bought a record from a DJ at the merch table. Handmade, limited run, 50 copies. This is real support.", sentiment: "positive" },
    { author: "@CrowdReader", text: "Read the room. If nobody's dancing, you're playing wrong. Adapt or leave.", sentiment: "neutral" },
    { author: "@NoiseComplaint", text: "Neighbor called cops again. Three years in this location. The struggle is real for underground spots.", sentiment: "negative" },
    { author: "@VenueHunter", text: "Found a new underground spot in an old factory. Industrial, legal, 200 capacity. Perfect.", sentiment: "positive" },
    { author: "@SetLengthDebate", text: "45-minute sets are fine for festivals. Clubs need 2-3 hour slots. Stop rushing.", sentiment: "neutral" },
    { author: "@BackToBack", text: "B2B sets are overrated. Great for Instagram, terrible for flow. Pick one DJ and let them cook.", sentiment: "negative" },
    { author: "@VinylOnly", text: "Carrying 50 kilos of records to every gig. Worth it for the reaction when you nail the drop.", sentiment: "positive" },
    { author: "@StreamingDJ", text: "Streamed to 50k viewers last night. Nobody bought tickets though. Numbers don't equal revenue.", sentiment: "negative" },
    { author: "@BoilerRoomFan", text: "Boiler Room changed everything. Underground music went global. Mixed blessing honestly.", sentiment: "neutral" },
    { author: "@ClubKitty", text: "Club kid revival is happening. Fluffy accessories and glowsticks everywhere. Nostalgia is a cycle.", sentiment: "neutral" },
    { author: "@MinimalTechno", text: "Two kick drums and a hi-hat. Four hours. Crowd was in a trance. Simple is best.", sentiment: "positive" },
    { author: "@HeadlinerHater", text: "Artists charging 10k for a headline set play the same 2-hour Spotify playlist. Lazy.", sentiment: "negative" },
    { author: "@SupportAct", text: "Opened for a major act. Crowd was talking through our entire set. Paying your dues is hard.", sentiment: "negative" },
    { author: "@RaveReunion", text: "Found my rave crew from 1995 at a reunion event. Music brings people together across decades.", sentiment: "positive" },
    { author: "@SafetyFirst", text: "Venue needs better lighting and clearer exits. Fire code violations everywhere. Reported them.", sentiment: "negative" },
    { author: "@OutdoorSeason", text: "Summer outdoor events hit different. Open air, sunset, sound system under the sky. Pure bliss.", sentiment: "positive" },
    { author: "@ClubAtmosphere", text: "The room itself is an instrument. Sound reacts to architecture. Know your venue intimately.", sentiment: "positive" },
    { author: "@LineCheckLate", text: "Headliner demanded another soundcheck at 11pm. Artists need to arrive on time. Crews are exhausted.", sentiment: "negative" },
    { author: "@EarlyRiser", text: "Daytime raves are the future. Sunday afternoon, sober crowd, no drama. Peaceful.", sentiment: "positive" },
    { author: "@CloseTight", text: "Crowd was way too packed. No room to dance. Venues need capacity limits that actually mean something.", sentiment: "negative" },
    { author: "@SurpriseGuest", text: "Legendary producer showed up unannounced, played a secret set. Magic moments like this are rare.", sentiment: "positive" },
    { author: "@GreenRave", text: "Organizing a zero-waste rave. Reusable cups, no single plastic, carbon offset. Eco-rave is possible.", sentiment: "positive" },
    { author: "@ABAFan", text: "Another boring Boiler Room at a fashion event. Music as background for luxury brand activation.", sentiment: "negative" },
    { author: "@RecordFair", text: "Vinyl fair had 50 vendors, thousands of records. Spent $400. Worth every cent.", sentiment: "positive" },
    { author: "@ClubClosure", text: "Our favorite spot is closing. Rent increased, lease not renewed. Another victim of gentrification.", sentiment: "negative" },
    { author: "@QuirkyVenue", text: "Played in a converted church last night. The reverb was insane. Acoustics made everything better.", sentiment: "positive" },
    { author: "@HypeTrain", text: "Followed the hype, bought tickets, artist no-showed. Refund process is a nightmare. Trust no PR.", sentiment: "negative" },
    { author: "@SecretLocation", text: "Received coordinates at midnight. Drove to an abandoned lot. Best party I've ever been to.", sentiment: "positive" },
    { author: "@AllNightLong", text: "14-hour set. Feet destroyed. Voice gone. Best therapy session I've ever had.", sentiment: "positive" },
    { author: "@FamilyFriendly", text: "Daycare rave event. Kids dancing, parents taking shifts. Normalizing the culture early.", sentiment: "positive" },
    { author: "@PayToPlay", text: "Promoter asked me to buy my own tickets to fill the room. Industry is broken. Refused.", sentiment: "negative" },
    { author: "@SoundGuy", text: "FOH engineer here. Artists sending generic USB sticks instead of proper stems is our pet peeve.", sentiment: "neutral" },
  ],
  gossip: [
    { author: "@SceneInsider", text: "I heard this months ago. Everyone knows but nobody speaks up. The silence protects the guilty.", sentiment: "negative" },
    { author: "@LabelWatcher", text: "Labels always screw over the small artists. Standard practice. Read contracts before signing.", sentiment: "negative" },
    { author: "@GhostProducer", text: "That's my track! I never got credit or payment. This industry is built on exploitation.", sentiment: "negative" },
    { author: "@IndustryVet", text: "This is why you always get contracts reviewed by a lawyer. Verbal agreements mean nothing.", sentiment: "neutral" },
    { author: "@MusicBlogger", text: "We're preparing a full exposé. DM for tips and evidence. Names will be published.", sentiment: "neutral" },
    { author: "@AR_Watcher", text: "That label has a history of shady deals. Research before signing. Trust me.", sentiment: "negative" },
    { author: "@Anonymous2024", text: "More artists need to speak out. Silence = complicity. I have receipts. Dropping soon.", sentiment: "negative" },
    { author: "@FanBoy98", text: "My favorite artist would never do this. You're lying. Show proof or shut up.", sentiment: "negative" },
    { author: "@ContractReader", text: "Never sign away your publishing rights. Read everything twice. Sleep on big decisions.", sentiment: "positive" },
    { author: "@RumorMill", text: "This is just the tip of the iceberg. Wait till you hear the rest. It's systemic.", sentiment: "neutral" },
    { author: "@ExLabelEmployee", text: "I worked there. The internal emails are damning. HR covered everything up. HR is useless.", sentiment: "negative" },
    { author: "@StreamRipper", text: "Piracy isn't stealing when royalties are fractions of a cent. Exposure doesn't pay rent.", sentiment: "neutral" },
    { author: "@BookingAgent", text: "The 50% deposit upfront rule exists because of artists like this. Protect yourself always.", sentiment: "positive" },
    { author: "@SoundCloudRefugee", text: "Platforms pay pennies. Artists need other revenue streams. Touring is the only real income.", sentiment: "neutral" },
    { author: "@PlagiarismHunter", text: "That drop is 90% identical to the original. The cheeky bastards didn't even change the BPM.", sentiment: "negative" },
    { author: "@DefamationLawyer", text: "Be careful what you post. Defamation laws vary by country. Consult before accusing publicly.", sentiment: "neutral" },
    { author: "@IndustryWatcher", text: "Three labels have folded this year due to financial mismanagement. Due diligence matters.", sentiment: "negative" },
    { author: "@ScamAlert", text: "Someone's impersonating artists on Instagram asking for 'management fees.' Report immediately.", sentiment: "negative" },
    { author: "@RoyaltyMath", text: "1 million streams = $400 split 4 ways = $100 each. Not a living wage. Ever.", sentiment: "negative" },
    { author: "@ManagerScam", text: "Signed with a manager who took 30% but delivered zero shows. Terminated contract. Lesson learned.", sentiment: "negative" },
    { author: "@DistributionDrama", text: "Distro took 6 months to pay. Customer support is bots. Artists need unionization.", sentiment: "negative" },
    { author: "@FakeStreams", text: "Someone bought 50k plays on my track. Now my analytics are broken. Report suspicious activity.", sentiment: "negative" },
    { author: "@PromoterNoPay", text: "Played a sold-out show. Promoter claims 'loss' and paid 20% of agreed fee. Considering legal action.", sentiment: "negative" },
    { author: "@IndustryWhisper", text: "Major playlist curator admitted to taking payments under the table. Standard practice apparently.", sentiment: "negative" },
    { author: "@ContractNegotiator", text: "Always negotiate for net 30 payment terms. Gross vs net clauses matter. Get everything in writing.", sentiment: "positive" },
    { author: "@SampleClearance", text: "Got a cease and desist for a 2-second sample. Fair use argument failed. Costs me $15k.", sentiment: "negative" },
    { author: "@MasterRight", text: "Label wants master rights in perpetuity. No deal. Walked away. Principles over advancement.", sentiment: "positive" },
    { author: "@SyncLicense", text: "Track used in a commercial without permission. DMCA filed. This happens constantly.", sentiment: "negative" },
    { author: "@BrandCollab", text: "Rejected a brand deal because of their labor practices. Money isn't worth the reputational hit.", sentiment: "positive" },
    { author: "@TaxSurprise", text: "Received a surprise tax bill for streaming income from 3 years ago. Quarterly estimates exist. Learn.", sentiment: "negative" },
    { author: "@SyncFee", text: "Film sync offered $500 for unlimited worldwide use. Declined. My rate is $5000 minimum.", sentiment: "positive" },
    { author: "@PlaylistBribe", text: "Playlist asked for $200 to add my track. Against Spotify Terms. Reported them.", sentiment: "negative" },
    { author: "@RoyaltiesOwed", text: "Mechanical royalties from 2019 just arrived. Two years late. System is broken.", sentiment: "negative" },
    { author: "@CreditDispute", text: "Producer credit missing from release. Multiple emails ignored. Escalating to label head.", sentiment: "negative" },
    { author: "@SplitDispute", text: "Collaborator wants 50% despite writing 10% of the track. Music law is complex. Consult an attorney.", sentiment: "negative" },
    { author: "@AdvanceScam", text: "Label offered $5k advance against royalties. Recouped in 3 months. Made $50k net. Good deal.", sentiment: "positive" },
    { author: "@DemoTheft", text: "Sent a demo to a label. Heard similar production 6 months later. No proof of theft though.", sentiment: "negative" },
    { author: "@BookingDouble", text: "Double-booked myself. Apologized to one promoter, paid the cancellation fee. Never again.", sentiment: "negative" },
    { author: "@VisaIssues", text: "Toured Europe without proper paperwork. Detained at border. Learn from my mistake.", sentiment: "negative" },
    { author: "@ReleaseDelay", text: "Album pushed back 3 times. Label blaming 'marketing strategy.' Fans are frustrated.", sentiment: "negative" },
    { author: "@SoundCloudDown", text: "SoundCloud went down mid-set. Livestream killed. Tech failures happen. Always have backup.", sentiment: "neutral" },
    { author: "@FeatureRequest", text: "Artist agreed to a feature, recorded vocals, then ghosted me. Track was mid anyway.", sentiment: "negative" },
    { author: "@RemixWithoutAsking", text: "Someone remixed my track without permission. It's technically illegal. I kind of respect the audacity.", sentiment: "neutral" },
    { author: "@LabelPressure", text: "Label wanted radio-friendly edits. Refused. Artistic integrity over chart placement.", sentiment: "positive" },
    { author: "@StreamingAudit", text: "Did a streaming audit. 40% of my plays were from bots. Platform did nothing.", sentiment: "negative" },
    { author: "@PressKitTheft", text: "Someone copied my entire press kit. Photos, bio, discography. Fake account reported.", sentiment: "negative" },
    { author: "@GreenRoomGreed", text: "Headliner demanded a green room with specific vodka brand and fresh flowers. At an underground party.", sentiment: "negative" },
    { author: "@BackstagePhoto", text: "Photographer took backstage photos without consent. Posted online. Personal boundaries exist.", sentiment: "negative" },
    { author: "@MerchConfiscated", text: "Venue confiscated unsold merch at the door. 'Competition for bar sales.' Unbelievable.", sentiment: "negative" },
    { author: "@RiderDrama", text: "Artist requested a live animal on stage. No, just no. Rider requests are getting ridiculous.", sentiment: "negative" },
    { author: "@NoShow", text: "Headliner no-showed. Medical emergency apparently. Sold 200 tickets. Refunded everyone.", sentiment: "negative" },
    { author: "@InterviewNoPay", text: "Podcast asked for an interview, promised 'exposure.' I'm worth at least $500. Decline.", sentiment: "negative" },
    { author: "@ChartManipulation", text: "Labels buying their own releases to chart. It's fraud. But nobody enforces it.", sentiment: "negative" },
    { author: "@IndustryInsider", text: "A&R admitted they only sign artists with pre-built audiences. No risks anymore. Sad.", sentiment: "negative" },
  ],
  drama: [
    { author: "@DramaLover", text: "This is the most entertaining thread of the year. Keep it coming! I'm here for the chaos.", sentiment: "positive" },
    { author: "@PeaceKeeper", text: "Can we not? Music is about unity, not beef. This is embarrassing.", sentiment: "negative" },
    { author: "@BattleGround", text: "They deserved to be called out. No accountability in this scene. Silence enables abuse.", sentiment: "negative" },
    { author: "@NeutralObserver", text: "Both sides have valid points. Nuanced discussion please. Cancel culture is complicated.", sentiment: "neutral" },
    { author: "@OldBeef", text: "This pales in comparison to the 2019 drama. Search the archives. That was legendary.", sentiment: "neutral" },
    { author: "@SocialMediaManager", text: "This is going to blow up. Mark my words. The algorithm loves controversy.", sentiment: "neutral" },
    { author: "@CancelCulture", text: "We need to protect the victims. Always believe the accusers until proven otherwise.", sentiment: "neutral" },
    { author: "@FreeSpeech", text: "Everyone is entitled to their career choices. Let it go. This is getting old.", sentiment: "negative" },
    { author: "@ApologyAcceptor", text: "People can change. Give them a chance to grow. Public shaming rarely helps.", sentiment: "neutral" },
    { author: "@ReceiptCollector", text: "Screenshots don't lie. Evidence or it didn't happen. The receipts are damning.", sentiment: "neutral" },
    { author: "@DramaTourist", text: "I come here for the trainwrecks. Entertainment value 10/10. This is better than Netflix.", sentiment: "positive" },
    { author: "@BridgeBuilder", text: "Let's organize a collab instead. Unity over beef. Music brings us together.", sentiment: "positive" },
    { author: "@IndustryWatch", text: "This pattern keeps repeating. The system enables bad actors. Change requires structural reform.", sentiment: "neutral" },
    { author: "@ThrowbackThread", text: "Same thing happened in 2015. History repeats itself. Nobody learns.", sentiment: "negative" },
    { author: "@NuanceNeeded", text: "Without full context, we can't judge. Wait for facts. The mob is often wrong.", sentiment: "neutral" },
    { author: "@StansAttacking", text: "The artist's stans are attacking anyone who disagrees. Cult behavior is scary.", sentiment: "negative" },
    { author: "@VictimBlaming", text: "Victim-blaming in the comments is disgusting. They came forward with courage.", sentiment: "negative" },
    { author: "@Rehabilitation", text: "They issued a proper apology with action items. That's growth. We should support that.", sentiment: "positive" },
    { author: "@ThirdParty", text: "I'm not picking sides. Both parties have histories. The truth is probably complicated.", sentiment: "neutral" },
    { author: "@MobMentality", text: "The pile-on is out of control. Death threats are never okay. Proportionate response needed.", sentiment: "negative" },
    { author: "@TruthSeeker", text: "We deserve transparency. Artists are public figures. Accountability comes with that.", sentiment: "neutral" },
    { author: "@OverIt", text: "Can't open social without this drama. Muted every keyword related. Just want music.", sentiment: "negative" },
    { author: "@Parasocial", text: "You don't know these people personally. Parasocial relationships are unhealthy.", sentiment: "neutral" },
    { author: "@SnakeOil", text: "The accuser has a history of false accusations. Research before joining the mob.", sentiment: "neutral" },
    { author: "@SystemicIssue", text: "This isn't about one person. The entire ecosystem enables exploitation.", sentiment: "neutral" },
    { author: "@SupportSurvivors", text: "If this helps one survivor come forward, the discourse is worth it.", sentiment: "positive" },
    { author: "@LegalRoute", text: "Both should settle this in court. Social media trials are never fair.", sentiment: "neutral" },
    { author: "@UnfollowBtn", text: "Unfollowed every artist involved. My mental health matters more than this.", sentiment: "neutral" },
    { author: "@DeleteTwitter", text: "This platform amplifies the worst behavior. Logging off for my sanity.", sentiment: "negative" },
    { author: "@HotTake", text: "Both artists are problematic. The scene is full of ego-maniacs. We're all complicit.", sentiment: "negative" },
    { author: "@Accountability", text: "Artists with massive platforms should be held to higher standards. Influence matters.", sentiment: "neutral" },
    { author: "@CancelBack", text: "The cancel culture reversal is funny. People love a redemption arc. Hypocrites.", sentiment: "negative" },
    { author: "@DoxxingWarning", text: "Someone posted personal info. That's illegal. Mods need to step in now.", sentiment: "negative" },
    { author: "@Journalist", text: "Music journalist here. Fact-checking both stories. Publication drops tomorrow.", sentiment: "neutral" },
    { author: "@ProducerUncle", text: "I've known Artist X for 20 years. This isn't the person I know. Nuance exists.", sentiment: "neutral" },
    { author: "@IndustryPetitioner", text: "Starting a petition for better protections. Over 2000 signatures already. Link in bio.", sentiment: "positive" },
    { author: "@FakeAccount", text: "Half the 'victims' in this thread are alt accounts. Check post history. Manufactured drama.", sentiment: "negative" },
    { author: "@TherapyTalk", text: "Everyone involved needs therapy. This level of public trauma is damaging to all.", sentiment: "neutral" },
    { author: "@OldSchoolSupport", text: "Back in the day we settled beef at the club. Physical confrontation. Honest.", sentiment: "negative" },
    { author: "@LegalFighter", text: "My lawyer sent a cease and desist. Libel is a serious offense. Choose words carefully.", sentiment: "negative" },
    { author: "@Mediator", text: "I facilitated a private conversation between both parties. Resolution in progress.", sentiment: "positive" },
    { author: "@RecordLabel", text: "Statement from our label: We take allegations seriously. Investigation underway.", sentiment: "neutral" },
    { author: "@FanDivided", text: "Longtime fan here. Can't support either party anymore. Just want the music back.", sentiment: "neutral" },
    { author: "@MutualAid", text: "Started a fundraiser for the victim. Over $10k raised. Community supports its own.", sentiment: "positive" },
    { author: "@GossipGirl", text: "I have tea. DM me. This thread is just scratching the surface.", sentiment: "negative" },
    { author: "@EvidenceDrop", text: "New documents surfaced. This changes everything. Thread will update shortly.", sentiment: "neutral" },
    { author: "@ApologyCritic", text: "That apology was calculated. Publicist wrote it. No genuine accountability.", sentiment: "negative" },
    { author: "@RedemptionArc", text: "Gave them 6 months to show change. They did. Respect earned back.", sentiment: "positive" },
    { author: "@IndustryExile", text: "Blacklisted from every major label for speaking up. Worth it for the principle.", sentiment: "negative" },
    { author: "@SideEye", text: "Other artists staying silent. They're complicit through inaction. Speak up or shut up.", sentiment: "negative" },
    { author: "@Conspiracy", text: "This drama is manufactured for publicity. Check release dates. Always a pattern.", sentiment: "negative" },
    { author: "@RealTalk", text: "The scene is rotten. This is a symptom. We need to rebuild from scratch.", sentiment: "negative" },
    { author: "@MovingOn", text: "Done engaging with this. Stream the music, ignore the drama. Separate art from artist.", sentiment: "neutral" },
  ],
  tips: [
    { author: "@BookerTips", text: "Start with smaller venues. Build your reputation locally. Bigger bookings come with relationships.", sentiment: "positive" },
    { author: "@GearReviewer", text: "That setup is solid! What's your room treatment like? The walls matter more than the gear.", sentiment: "positive" },
    { author: "@StudioArchitect", text: "Acoustic treatment matters more than expensive gear. First反射, then diffusion.", sentiment: "positive" },
    { author: "@ViralMarketer", text: "TikTok is where it's at. Post your production process. Authenticity beats polish.", sentiment: "positive" },
    { author: "@GigVeteran", text: "Network at every event. It's not what you know but who you know. Exchange numbers.", sentiment: "positive" },
    { author: "@SoundEngineer", text: "Reference tracks are your best friend. A/B constantly. Compare to commercially released tracks.", sentiment: "positive" },
    { author: "@IndiePromoter", text: "Local radio playlists are underrated. Reach out to community stations. Free promotion.", sentiment: "positive" },
    { author: "@ManagementCo", text: "Consider getting a manager after 50 gigs. Game changer. They handle business, you handle music.", sentiment: "positive" },
    { author: "@MixMaster", text: "Low-end takes up headroom. Sidechain everything to the kick. Clean and punchy.", sentiment: "positive" },
    { author: "@MasteringMaven", text: "Leave -6dB of headroom before mastering. Trust me. Your mastering engineer will thank you.", sentiment: "positive" },
    { author: "@CollaborationCoach", text: "Find producers in similar genres. Cross-pollinate audiences. Collaboration expands your reach.", sentiment: "positive" },
    { author: "@EmailTemplate", text: "My cold email template gets 30% response rate. DM me for it. Personalization is key.", sentiment: "positive" },
    { author: "@BookingFee", text: "Never play for free. Even charity gigs set bad precedent. Minimum viable fee or decline.", sentiment: "positive" },
    { author: "@SoundCloudTips", text: "Upload consistently. Algorithm favors active creators. Weekly uploads beat monthly drops.", sentiment: "positive" },
    { author: "@MusicLawyer", text: "Register your work with ASCAP immediately. Protect yourself. Copyright protection is cheap.", sentiment: "positive" },
    { author: "@BudgetStudio", text: "Start with what you have. Phone recorder + free DAW + talent = success. Gear is secondary.", sentiment: "positive" },
    { author: "@PracticeRoutine", text: "2 hours daily practice minimum. No excuses. Consistency beats talent long-term.", sentiment: "positive" },
    { author: "@BackUp", text: "3-2-1 backup rule: 3 copies, 2 formats, 1 offsite. Lost a session? Never again.", sentiment: "positive" },
    { author: "@StemExport", text: "Export stems for every track. Collaborations, remixes, fixing future mix issues. Future you thanks.", sentiment: "positive" },
    { author: "@TunerCheck", text: "Always tune vocals with Melodyne before auto-tune. The sound is more natural.", sentiment: "positive" },
    { author: "@LabelResearch", text: "Research labels before submitting. Send to 10 that fit your style, not 100 random ones.", sentiment: "positive" },
    { author: "@DAWShortcuts", text: "Learn every keyboard shortcut in your DAW. 40% time savings. Game changer for workflow.", sentiment: "positive" },
    { author: "@CreativeBlock", text: "When stuck, change one element drastically. BPM, key, genre. Break the pattern.", sentiment: "positive" },
    { author: "@SleepOnIt", text: "Finish a mix, sleep, remix in the morning. Fresh ears catch issues you missed.", sentiment: "positive" },
    { author: "@MonitorsFirst", text: "If you can only afford one upgrade, get accurate monitors. Mix translation matters.", sentiment: "positive" },
    { author: "@VocalChain", text: "Chain: De-ess → EQ → Compress → Reverb → Saturation. Clean to wild.", sentiment: "positive" },
    { author: "@EQingBass", text: "Don't boost bass frequencies. Cut around the kick to make room. Subtractive EQ wins.", sentiment: "positive" },
    { author: "@ArrangementTips", text: "Delete chorus 2. If the track works without it, you didn't need it.", sentiment: "positive" },
    { author: "@SocialCalendar", text: "Plan releases 3 months ahead. Content, promotion, distribution timeline matters.", sentiment: "positive" },
    { author: "@FanEngagement", text: "Reply to every comment in the first hour. Algorithm rewards engagement. Be present.", sentiment: "positive" },
    { author: "@PressRelease", text: "Write press releases like a journalist. Who, what, where, when, why. Be newsworthy.", sentiment: "positive" },
    { author: "@Metadata", text: "Tag every file properly. Artist, title, BPM, key, ISRC. Digital organization prevents chaos.", sentiment: "positive" },
    { author: "@CollaboratorCredit", text: "Always credit everyone who contributed. Even 1% matters for splits and reputation.", sentiment: "positive" },
    { author: "@DemoEtiquette", text: "Demo submissions: MP3, link, 2 sentences max. Labels receive hundreds daily. Be concise.", sentiment: "positive" },
    { author: "@VersionControl", text: "Save new version for every major change. 'Project_v3_FINAL_real_final.use' saves sanity.", sentiment: "positive" },
    { author: "@LoudnessWar", text: " LUFS -14 for streaming, -8 for clubs. Match the target. Consistency wins.", sentiment: "positive" },
    { author: "@KickChoice", text: "Layer 2-3 kicks. Sub for body, transient for punch, click for definition. Depth.", sentiment: "positive" },
    { author: "@FXBussing", text: "Group similar channels to buses. One reverb, one delay. Cohesion through shared processing.", sentiment: "positive" },
    { author: "@PitchCorrection", text: "Subtle pitch correction sounds natural. 100% correction sounds robotic. Choose wisely.", sentiment: "positive" },
    { author: "@SamplingEthics", text: "Clear samples before release. Even if legal, asking permission builds relationships.", sentiment: "positive" },
    { author: "@GigPrep", text: "Prepare USB, CD, and laptop backup for every gig. Technical failure is not an excuse.", sentiment: "positive" },
    { author: "@CrowdReading", text: "Watch energy levels every 3 songs. Adjust tempo and energy to match the room.", sentiment: "positive" },
    { author: "@MerchDesign", text: "Merch should be limited runs. Scarcity drives sales. Don't overproduce.", sentiment: "positive" },
    { author: "@EmailList", text: "Start an email list yesterday. Social platforms change, email is forever. Own your audience.", sentiment: "positive" },
    { author: "@ReleaseStrategy", text: "Single, then EP, then album. Drip content. Each release is a marketing moment.", sentiment: "positive" },
    { author: "@CollaborationAsk", text: "When asking for collabs, show work, not just ideas. Have beats ready to share.", sentiment: "positive" },
    { author: "@InspirationLog", text: "Keep a folder of sounds that inspired you. Reference points prevent creative block.", sentiment: "positive" },
    { author: "@TimeTracking", text: "Track hours spent per project. Know your actual hourly rate. Validate your time.", sentiment: "positive" },
    { author: "@NetworkingEvent", text: "Attend 1 industry event monthly. Bring business cards. Real relationships matter.", sentiment: "positive" },
    { author: "@BandwidthCheck", text: "If streaming takes too long, your WAVs are too big. 44.1/16 is standard.", sentiment: "positive" },
    { author: "@SetlistBalance", text: "Structure sets as stories. Build, peak, release, rebuild. Emotions matter.", sentiment: "positive" },
    { author: "@VisionDoc", text: "Write a one-page artist vision. Goals, values, aesthetic. Decision-making simplifies.", sentiment: "positive" },
    { author: "@FeedbackGiver", text: "When asking for feedback, specify what you want. 'Honest but constructive' is useless.", sentiment: "positive" },
    { author: "@StreamingPrep", text: "Spotify for Artists shows what's working. Check weekly. Data informs decisions.", sentiment: "positive" },
    { author: "@GigDiary", text: "Log every show: what worked, what didn't, crowd reaction. Future bookings improve.", sentiment: "positive" },
    { author: "@Mindset", text: "Reject perfectionism. Done beats perfect. Release, learn, iterate. Ship.", sentiment: "positive" },
  ],
  genre: [
    { author: "@GenrePurist", text: "True {genre} has soul. Most producers today don't understand the roots. Listen to the originals.", sentiment: "negative" },
    { author: "@FusionFan", text: "Mixing {genre} with other styles is the future. Pure genres are dying. Evolution is inevitable.", sentiment: "positive" },
    { author: "@BPMPolice", text: "Nobody does {genre} properly anymore. The golden age was 2005-2015. Modern tracks lack character.", sentiment: "negative" },
    { author: "@NewWave", text: "The scene is evolving. Embrace change or become irrelevant. Nostalgia is a prison.", sentiment: "neutral" },
    { author: "@UndergroundElite", text: "Commercial {genre} ruined the culture. Focus on the underground. The scene is diluted.", sentiment: "negative" },
    { author: "@PopStar", text: "Accessible {genre} brings new fans to the scene. Inclusion matters. Gatekeeping kills growth.", sentiment: "positive" },
    { author: "@ClassicDefender", text: "Every generation says this. The classics stand the test of time. History judges quality.", sentiment: "neutral" },
    { author: "@FutureSound", text: "AI is going to change everything. Adapt or die. The tools evolve, creativity persists.", sentiment: "neutral" },
    { author: "@TempoSnob", text: "Only real {genre} is at 175+ BPM. Everything else is lazy. The tempo defines the genre.", sentiment: "negative" },
    { author: "@GenreAlchemist", text: "My set blends {genre} with breaks and jungle. Fresh sound. Hybrid genres are where it's at.", sentiment: "positive" },
    { author: "@VinylOnly", text: "Digital {genre} lacks the warmth of vinyl pressings. The crackle matters. Analog soul.", sentiment: "positive" },
    { author: "@LoFiLover", text: "Low fidelity {genre} is having a moment. Embrace the grain. Lo-fi is a vibe, not a flaw.", sentiment: "positive" },
    { author: "@DarkSide", text: "{genre} should be dark and moody. Not this radio-friendly nonsense. Keep it underground.", sentiment: "negative" },
    { author: "@FestivalFriendly", text: "Make it accessible. Not everyone wants to headbang for 8 hours. Energy management matters.", sentiment: "positive" },
    { author: "@SubgenreScout", text: "Have you heard of the new micro-genres? Mind-blowing stuff. Scene evolves daily.", sentiment: "positive" },
    { author: "@ClassicRemixer", text: "Remixing {genre} classics is lazy. Create original work. Standing on shoulders is cheating.", sentiment: "negative" },
    { author: "@LiveJam", text: "{genre} needs more live instrumentation. Synths and drum machines lack soul. Humanize it.", sentiment: "positive" },
    { author: "@SampleLayer", text: "Layering field recordings with {genre} beats is underutilized. Environment as instrument.", sentiment: "positive" },
    { author: "@BPM无关", text: "Tempo is just a number. {genre} is about feeling, not math. Music transcends beats per minute.", sentiment: "neutral" },
    { author: "@GenreArchivist", text: "Building a library of obscure {genre} tracks from the 90s. History preservation matters.", sentiment: "positive" },
    { author: "@MelodicRevolution", text: "Melodic {genre} is the future. Aggressive is tired. Emotion through harmony.", sentiment: "positive" },
    { author: "@MinimalMaster", text: "Less is more. Single elements executed perfectly outperform complex arrangements.", sentiment: "positive" },
    { author: "@Maximalist", text: "{genre} should be overwhelming. Dense textures, layers upon layers. Maximum impact.", sentiment: "positive" },
    { author: "@AcousticGenre", text: "{genre} with live guitar and organic drums. Breaking the electronic mold. Innovation.", sentiment: "positive" },
    { author: "@RegionalSpecialist", text: "Detroit {genre} vs Berlin {genre}. Regional scenes have distinct flavors. Geographic identity matters.", sentiment: "neutral" },
    { author: "@VocalIntegration", text: "{genre} needs more vocals. Instrumental-only is limiting. Human voice adds dimension.", sentiment: "positive" },
    { author: "@InstrumentalDefender", text: "Pure {genre} is best without vocals. Let the synthesis speak. Words interrupt flow.", sentiment: "neutral" },
    { author: "@CulturalAppropriation", text: "Western producers appropriating {genre} without credit. Respect the origins. Educate yourself.", sentiment: "negative" },
    { author: "@GenderInclusivity", text: "More women and non-binary producers in {genre}. The scene is diversifying. Progress.", sentiment: "positive" },
    { author: "@AgeDiversity", text: "18-year-old producers releasing better {genre} than veterans. Youth wins. Fresh ears matter.", sentiment: "neutral" },
    { author: "@Traditionalist", text: "Sequencers and hardware only. DAW production is sterile. Earn your chops with real gear.", sentiment: "negative" },
    { author: "@DigitalNative", text: "I produce entirely in the box. The DAW IS my instrument. Tools don't define creativity.", sentiment: "positive" },
    { author: "@GeographicLimit", text: "{genre} requires physical location. You can't understand it remotely. Visit the source.", sentiment: "negative" },
    { author: "@GlobalScene", text: "{genre} is everywhere now. Tokyo, São Paulo, Lagos. Geographic borders are meaningless.", sentiment: "positive" },
    { author: "@OriginalSound", text: "Stop chasing trends. Develop a unique sound that {genre} evolves around, not follows.", sentiment: "positive" },
    { author: "@TrendFollower", text: "Copied the sound of that viral track. Charting now. Whatever works, right?", sentiment: "negative" },
    { author: "@Educational", text: "Teaching {genre} production to beginners. Knowledge sharing elevates the entire scene.", sentiment: "positive" },
    { author: "@CompetitionJudge", text: "Judged a {genre} production contest. 80% of entries sounded identical. Where's the creativity?", sentiment: "negative" },
    { author: "@AwardSeason", text: "{genre} awards shows are a joke. Commercial success ≠ artistic merit. Different metrics.", sentiment: "negative" },
    { author: "@UndergroundRespect", text: "Underground {genre} events are where real music happens. No cameras, no pretense.", sentiment: "positive" },
    { author: "@Mainstream {genre}", text: "Heard {genre} in a car commercial. Scene has made it. Mixed feelings honestly.", sentiment: "neutral" },
    { author: "@SoundDesignFocus", text: "{genre} production is 80% sound design. Learn synthesis, not just presets. Foundation matters.", sentiment: "positive" },
    { author: "@PresetUser", text: "Every modern {genre} track is just Serum presets. Nobody designs sounds anymore.", sentiment: "negative" },
    { author: "@CustomSynthesis", text: "Building custom synth patches takes 3 hours each. Worth it for unique textures.", sentiment: "positive" },
    { author: "@RhythmComplexity", text: "{genre} needs polyrhythms and odd time signatures. Predictability is boring.", sentiment: "positive" },
    { author: "@FourOnTheFloor", text: "Four-on-the-floor is the heartbeat. Don't overcomplicate. The kick drum is king.", sentiment: "positive" },
    { author: "@StructureRevolution", text: "Forget verse-chorus structure. {genre} can be non-linear. Arrangements should surprise.", sentiment: "positive" },
    { author: "@TraditionalStructure", text: "Even {genre} needs recognizable song structure. Listeners need markers. Hook, build, release.", sentiment: "neutral" },
    { author: "@Environmental", text: "{genre} releases should be eco-friendly. Digital only. Vinyl manufacturing pollutes.", sentiment: "positive" },
    { author: "@VinylCollector", text: "Pressed my {genre} EP on 180g vinyl. Limited to 300. Physical releases matter.", sentiment: "positive" },
    { author: "@StreamingSlave", text: "Platforms own {genre} now. Artists are content creators, not musicians. Sad reality.", sentiment: "negative" },
    { author: "@IndependentWin", text: "Zero label deals, 100% independent. {genre} on my terms. Building without compromise.", sentiment: "positive" },
    { author: "@Community {genre}", text: "This {genre} community saved my life. Music therapy through the scene. Found my people.", sentiment: "positive" },
  ],
  general: [
    { author: "@DayJobSurvivor", text: "5 years of 9-5 and music. It can be done. Discipline is key. Early mornings and late nights.", sentiment: "positive" },
    { author: "@BurnoutVictim", text: "Had to quit my job. Mental health comes first. No job is worth your sanity.", sentiment: "neutral" },
    { author: "@IndependentArtist", text: "Never had a day job. Been full-time for 8 years. Survival mode is constant.", sentiment: "neutral" },
    { author: "@PartTimeHero", text: "Teaching production part-time funds my releases. Sustainable. Best of both worlds.", sentiment: "positive" },
    { author: "@TrustFundKid", text: "To be honest, money from family allowed me to focus fully. Not everyone has that privilege.", sentiment: "neutral" },
    { author: "@Hustler", text: "Session work, weddings, bar gigs. You do what you gotta do. Pride pays no rent.", sentiment: "positive" },
    { author: "@SideHustle", text: "Content creation pays the bills. Music is my passion project. Diversified income.", sentiment: "positive" },
    { author: "@OldPro", text: "The game changed. Streaming killed album sales. Adapt or become irrelevant.", sentiment: "neutral" },
    { author: "@SpotifyStan", text: "Royalty advances saved my career. Keep pushing new releases. Consistency pays.", sentiment: "positive" },
    { author: "@BandcampBeliever", text: "Bandcamp Fridays are game changers. Direct fan support works. $8k last month.", sentiment: "positive" },
    { author: "@PatreonPioneer", text: "My patrons get exclusive stems and remixes. Community building. $3k monthly.", sentiment: "positive" },
    { author: "@SyncSeller", text: "Licensing music for film/games pays better than streaming. One sync = 100k streams.", sentiment: "positive" },
    { author: "@MerchMogul", text: "My vinyl pressing fund is almost there. Physical releases matter. Tangible art.", sentiment: "positive" },
    { author: "@TutorTeacher", text: "Online courses are passive income. Teach what you know. Knowledge pays dividends.", sentiment: "positive" },
    { author: "@CryptoBro", text: "NFTs for music are the future. Own your digital work. Royalties through smart contracts.", sentiment: "neutral" },
    { author: "@CrowdfundSuccess", text: "Kickstarter reached goal in 48 hours. Community funding validates the project.", sentiment: "positive" },
    { author: "@GrantWriter", text: "Arts grants exist. $25k this year. Apply to everything. Free money.", sentiment: "positive" },
    { author: "@Insurance", text: "Self-employed health insurance is brutal. $800 monthly. Factor it into rates.", sentiment: "negative" },
    { author: "@TaxPro", text: "Hired an accountant who specializes in musicians. Worth every penny. Write-offs everywhere.", sentiment: "positive" },
    { author: "@Retirement", text: "No employer 401k. Self-directed IRA is my only option. Future planning is hard.", sentiment: "neutral" },
    { author: "@GigCalculator", text: "Calculated my hourly rate from last year: $4.50. Not sustainable. Need changes.", sentiment: "negative" },
    { author: "@PassiveIncome", text: "Catalog generates $2k monthly passively. Build assets, not just hourly work.", sentiment: "positive" },
    { author: "@FinancialPlanner", text: "Talked to a financial advisor. Diversify income streams. Music alone is risky.", sentiment: "positive" },
    { author: "@Budgeting", text: "Living below means. $1500/month rent max. Sacrifice now, freedom later.", sentiment: "positive" },
    { author: "@CouchSurfing", text: "Touring on a shoestring. Sleeping on floors, eating ramen. Love the journey.", sentiment: "positive" },
    { author: "@VanLife", text: "Lived in a van for 2 years touring. Minimal expenses, maximum gigs. Lifestyle choice.", sentiment: "positive" },
    { author: "@Roommate", text: "Can't afford solo apartment. Roommates are a reality for most musicians. Sacrifice.", sentiment: "neutral" },
    { author: "@FamilySupport", text: "Living with parents at 32 to save money. Embarrassing but practical. Rent-free.", sentiment: "neutral" },
    { author: "@Inheritance", text: "Small inheritance allowed me to quit my job. Timing was luck. Not everyone gets that.", sentiment: "neutral" },
    { author: "@CreditScore", text: "Self-employed = variable income = bad credit. Can't get a loan. The system is rigged.", sentiment: "negative" },
    { author: "@Investor", text: "Put music earnings into index funds. Diversification beyond the art. Future security.", sentiment: "positive" },
    { author: "@RealEstate", text: "Bought a studio space. Mortgage is cheaper than rent. Asset building through music.", sentiment: "positive" },
    { author: "@Bankruptcy", text: "Music career led to bankruptcy. Lesson learned. Separate business and personal finances.", sentiment: "negative" },
    { author: "@SideBusiness", text: "Started a mastering side business. 50/50 income split now. Music and services.", sentiment: "positive" },
    { author: "@YouTubeIncome", text: "YouTube tutorials generate more than streaming. Teaching as income stream.", sentiment: "positive" },
    { author: "@PodcastHost", text: "Started a music podcast. Ad revenue supplements music income. Content is king.", sentiment: "positive" },
    { author: "@BeatsForSale", text: "Selling beats online. $500 this month. Scalable income beyond live performances.", sentiment: "positive" },
    { author: "@SamplePack", text: "Released a sample pack. $1.5k first month. Leverage your sounds. Passive income.", sentiment: "positive" },
    { author: "@RoyaltyStatement", text: "Quarterly royalties arrived. $127.43. Streaming pays nothing. Keep expectations realistic.", sentiment: "negative" },
    { author: "@SyncNegotiation", text: "Rejected a $200 sync offer. My rate is $2000. Know your worth. Don't undersell.", sentiment: "positive" },
    { author: "@AdvanceDeal", text: "Signed a label deal. $15k advance against royalties. Recoupable. Risky but exciting.", sentiment: "neutral" },
    { author: "@DistributionDeal", text: "Distribution deal means 85% to me. Keep more of the pie. Independence wins.", sentiment: "positive" },
    { author: "@PublishingAdmin", text: "Signed with a publishing admin. They collect international royalties. 15% is worth it.", sentiment: "positive" },
    { author: "@PROMembership", text: "Registered with BMI and SoundExchange. Double registration captures all royalties.", sentiment: "positive" },
    { author: "@ISRC codes", text: "Assigning ISRC codes to every track. Tracking across platforms. Professional standards.", sentiment: "positive" },
    { author: "@CoverSong", text: "Licensed a cover song. Mechanical royalties plus performance royalties. Steady income.", sentiment: "positive" },
    { author: "@RemixForHire", text: "Remixing for other artists. $1000 per remix minimum. Commission work supports creativity.", sentiment: "positive" },
    { author: "@GhostWriting", text: "Ghost producing full tracks. Confidential but lucrative. 5 tracks written this year.", sentiment: "positive" },
    { author: "@LabelAdvancement", text: "Label advanced mastering costs. They believe in the project. Good partnership.", sentiment: "positive" },
    { author: "@CrowdfundingFails", text: "Kickstarter failed at 12%. Lesson: pre-sell before asking. Validation matters.", sentiment: "negative" },
    { author: "@TipJar", text: "Added a tip jar to Bandcamp page. $200 this month. Fans want to support directly.", sentiment: "positive" },
    { author: "@WishlistFulfillment", text: "Amazon wishlist for studio gear. Fans buy equipment directly. Genius system.", sentiment: "positive" },
    { author: "@FestivalPayment", text: "Festival paid on time for once. Surprised. Good faith builds relationships.", sentiment: "positive" },
    { author: "@International", text: "European tour grossed $15k. After expenses, $3k net. International touring is expensive.", sentiment: "neutral" },
    { author: "@LivingWage", text: "Music finally pays minimum wage. Took 7 years. Don't quit your day job prematurely.", sentiment: "neutral" },
    { author: "@DreamJob", text: "This is the only job I've ever wanted. Money struggles are worth it. No regrets.", sentiment: "positive" },
  ],
};

// Get random comments for a category
const getRandomComments = (category: ForumCategory, count: number = 5): string[] => {
  const templates = COMMENT_TEMPLATES[category] || COMMENT_TEMPLATES.general;
  const shuffled = [...templates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(c => {
    let text = c.text;
    if (text.includes("{genre}")) {
      const genres = ["Techno", "House", "Drum & Bass", "Trance", "Ambient", "Industrial", "Hardcore", "Dubstep"];
      text = text.replace("{genre}", genres[Math.floor(Math.random() * genres.length)]);
    }
    return `${c.author}: ${text}`;
  });
};

// Generate a dynamic thread from template
const generateDynamicThread = (category: ForumCategory, gameState: GameState): any => {
  const templates = FORUM_THREAD_TEMPLATES[category];
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  // Fill template variables
  let title = template.titleTemplate
    .replace("{artist}", FORUM_ARTISTS[Math.floor(Math.random() * FORUM_ARTISTS.length)])
    .replace("{artist1}", FORUM_ARTISTS[Math.floor(Math.random() * FORUM_ARTISTS.length)])
    .replace("{artist2}", FORUM_ARTISTS[Math.floor(Math.random() * FORUM_ARTISTS.length)])
    .replace("{label}", FORUM_LABELS()[Math.floor(Math.random() * FORUM_LABELS().length)])
    .replace("{city}", CITIES[Math.floor(Math.random() * CITIES.length)])
    .replace("{gear}", GEAR_ITEMS[Math.floor(Math.random() * GEAR_ITEMS.length)])
    .replace("{genre}", "Techno")
    .replace("{event}", "Summer Festival 2024")
    .replace("{year}", "90")
    .replace("{sound}", "sub-bass")
    .replace("{type}", "analog")
    .replace("{venue}", "Tresor Club")
    .replace("{platform}", "RaveMind");
  
  // Handle question placeholders
  if (title.includes("{question}")) {
    const questions = ["the cost isn't justified", "soft synths won this war", "it's all about workflow"];
    title = title.replace("{question}", questions[Math.floor(Math.random() * questions.length)]);
  }
  
  // Handle reason/behavior placeholders
  if (title.includes("{reason}")) {
    const reasons = ["blocking smaller artists", "stealing sets", "unprofessional conduct"];
    title = title.replace("{reason}", reasons[Math.floor(Math.random() * reasons.length)]);
  }
  if (title.includes("{behavior}")) {
    const behaviors = ["unprofessional", "toxic to newcomers", "extremely gatekeepy"];
    title = title.replace("{behavior}", behaviors[Math.floor(Math.random() * behaviors.length)]);
  }
  
  // Generate preview with game context
  const previewAuthors = ["@BedroomProducer", "@RaveRegular", "@VinylOnly_DJ", "@SynthSnob", "@UndergroundPunk", "@ModularAddict", "@SceneVeteran", "@DAWDrifter"];
  const author = previewAuthors[Math.floor(Math.random() * previewAuthors.length)];
  
  // Hot rating influenced by player's fame
  const baseHotRating = 30 + Math.floor(Math.random() * 50);
  const fameBonus = gameState.stats.prestige > 50 ? 15 : 0;
  const hotRating = Math.min(99, baseHotRating + fameBonus);
  
  return {
    id: `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title,
    author,
    replies: template.replies + Math.floor(Math.random() * 20),
    hotRating,
    preview: template.previewTemplate
      .replace("{artist}", FORUM_ARTISTS[Math.floor(Math.random() * FORUM_ARTISTS.length)])
      .replace("{city}", CITIES[Math.floor(Math.random() * CITIES.length)])
      .replace("{gear}", GEAR_ITEMS[Math.floor(Math.random() * GEAR_ITEMS.length)])
      .replace("{genre}", "Techno")
      .replace("{year}", "90")
      .replace("{platform}", "RaveMind"),
    category,
    likes: Math.floor(Math.random() * 50) + 10,
    createdAt: Date.now() - Math.floor(Math.random() * 86400000 * 3) // Random time in last 3 days
  };
};

// Generate initial dynamic threads
const generateInitialThreads = (gameState: GameState) => {
  const categories: ForumCategory[] = ["general", "tech", "scene", "gossip", "genre", "drama", "tips"];
  const threads: any[] = [];
  
  // Start with some static interesting threads
  threads.push({
    id: "t1",
    title: "Is hardware synthesis overrated? Soft-synths sound exactly the same now",
    author: "@AnalogBoy_12",
    replies: 42,
    hotRating: 88,
    preview: "Every time some DJ says modular filters are warmer I just laugh. My pirated DAW plugins can emulate a Moog perfectly. Discuss.",
    category: "tech",
    likes: 67,
    createdAt: Date.now() - 86400000
  });
  
  threads.push({
    id: "t2",
    title: `Ghost producing scandal on ${FORUM_LABELS()[0] || 'Vortex Records'}? Rumors about EDM pop superstars`,
    author: "@SceneSnitch",
    replies: 112,
    hotRating: 95,
    preview: "Heard some reliable news that a major festival artist didn't even compile their new EP stems. It was written by an anonymous bedroom producer in Detroit.",
    category: "gossip",
    likes: 134,
    createdAt: Date.now() - 172800000
  });
  
  // Add 3-4 dynamically generated threads
  const numDynamic = 3 + Math.floor(Math.random() * 2);
  for (let i = 0; i < numDynamic; i++) {
    const cat = categories[Math.floor(Math.random() * categories.length)];
    threads.push(generateDynamicThread(cat, gameState));
  }
  
  // Add a thread mentioning player's genre
  threads.push(generateDynamicThread("genre", gameState));
  
  return threads.sort((a, b) => b.hotRating - a.hotRating);
};

// Add new thread to forum (called when player does certain actions)
const addForumThread = (threads: any[], newThread: any): any[] => {
  return [newThread, ...threads].slice(0, 15); // Keep max 15 threads
};

// Thread interaction handler
interface ForumThread {
  id: string;
  title: string;
  author: string;
  replies: number;
  hotRating: number;
  preview: string;
  category: ForumCategory;
  likes: number;
  createdAt: number;
}

  // Initialize dynamic forum threads
  useEffect(() => {
    setForumThreads(generateInitialThreads(gameState));
  }, []);

  const handleSendPromptText = async (text: string, relBonus: number, categoryId: string) => {
    if (isTyping) return;
    await processMessage(text, categoryId, relBonus);
  };

  const handleSendCustomText = async () => {
    if (!customInput.trim() || isTyping) return;
    const text = customInput;
    setCustomInput("");
    await processMessage(text, "custom", 3);
  };

  const processMessage = async (messageText: string, categoryId: string, relBonus: number) => {
    const currentArtistId = selectedArtist.id;
    const userMsg = `You: ${messageText}`;

    // Append user message immediately
    setDmThreads((prev) => {
      const thread = prev[currentArtistId] || [];
      return { ...prev, [currentArtistId]: [...thread, userMsg] };
    });

    setIsTyping(true);

    // Relationship updates
    const currentRelationship = relations[currentArtistId] !== undefined ? relations[currentArtistId] : selectedArtist.relationship;
    let newRel = Math.min(100, Math.max(-100, currentRelationship + relBonus));
    
    // Status calculations
    let statusValue = "neutral";
    if (newRel <= -30) {
      statusValue = "rival";
    } else if (newRel >= 40) {
      statusValue = "friend";
    } else if (newRel >= 15) {
      statusValue = "colleague";
    }

    onModifyRelationship(currentArtistId, relBonus, statusValue);
    setRelations((prev) => ({ ...prev, [currentArtistId]: newRel }));

    // Triggering dynamic scene consequences if they insult or flame
    if (categoryId === "shade") {
      const headline = `Twitter Flame War: ${gameState.pseudonym} vs ${selectedArtist.name}`;
      const desc = `You direct messaged some spicy shade to ${selectedArtist.name}. It got leaked onto forums as screenshots, sparking heavy social activity.`;
      onTriggerDrama(headline, desc, 8, Math.round(gameState.stats.fans * 0.05));
    }

    let replyMsg = "";
    try {
      const updatedProducer = {
        ...selectedArtist,
        relationship: newRel
      };

      const res = await fetch("/api/generate-producer-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          producer: updatedProducer,
          message: messageText,
          playerPseudonym: gameState.pseudonym || "Unknown Bedroom Producer",
          playerPrestige: gameState.stats.prestige
        })
      });

      const data = await res.json();
      if (data.response) {
        replyMsg = `${selectedArtist.name}: "${data.response}"`;
      }
    } catch (e) {
      console.warn("Gemini network error, using procedural model fallback.", e);
    }

    if (!replyMsg) {
      const fallbackBody = getProceduralReply(currentArtistId, categoryId, newRel, selectedArtist.ego);
      replyMsg = `${selectedArtist.name}: "${fallbackBody}"`;
    }

    // Delay reply to simulate active keyboard typing
    setTimeout(() => {
      setDmThreads((prev) => {
        const thread = prev[currentArtistId] || [];
        return { ...prev, [currentArtistId]: [...thread, replyMsg] };
      });
      setIsTyping(false);
    }, 1100);
  };

  const handleInteract = async (type: "feedback" | "collab" | "shade") => {
    let text = "";

    if (type === "feedback") {
      let scoreReview = "A robust track design!";
      if (selectedArtist.ego >= 85) {
        scoreReview = `"It sounds slightly generic to be honest. Sticking to simple sample packs is a bedroom habit. Upgrade your hardware synthesis."`;
      } else {
        scoreReview = `"This is clean! The groove swings nicely. Try adding a louder sidechain compression on the sub kick."`;
      }

      try {
        const response = await fetch("/api/generate-ai-emails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            artist: gameState.pseudonym || "Unknown Bedroom Producer",
            prestige: gameState.stats.prestige,
            genre: selectedArtist.primaryGenre,
            labelName: selectedArtist.name,
          }),
        });
        const data = await response.json();
        if (data.email) {
          scoreReview = `"${data.email}"`;
        }
      } catch (e) {}

      text = `${selectedArtist.name}: ${scoreReview}`;
      setDmThreads((prev) => {
        const oldThread = prev[selectedArtist.id] || [];
        return {
          ...prev,
          [selectedArtist.id]: [...oldThread, `You: Sent your latest demo stems for review.`, text]
        };
      });

      onModifyRelationship(selectedArtist.id, 10, selectedArtist.status);
      setRelations((prev) => ({ ...prev, [selectedArtist.id]: Math.min(100, (prev[selectedArtist.id] || 0) + 10) }));

    } else if (type === "collab") {
      if (gameState.stats.money < 400) {
        alert("You need at least $400 in marketing costs to fund a professional collaboration flight!");
        return;
      }
      
      const collabRel = relations[selectedArtist.id] || 0;
      if (collabRel < 20 && selectedArtist.ego > 50) {
        text = `${selectedArtist.name}: "We aren't on collaborating terms yet. Submit some demos first or buy me a drink at active DJ lounges."`;
        setDmThreads((prev) => {
          const oldThread = prev[selectedArtist.id] || [];
          return {
            ...prev,
            [selectedArtist.id]: [...oldThread, `You: Suggested a duo compilation project.`, text]
          };
        });
      } else {
        text = `${selectedArtist.name}: "Let's do this! I will send over some modular bass stems and we can co-produce this for a release."`;
        setDmThreads((prev) => {
          const oldThread = prev[selectedArtist.id] || [];
          return {
            ...prev,
            [selectedArtist.id]: [...oldThread, `You: Started a co-production pipeline.`, text]
          };
        });
        onCollaborate(selectedArtist.name, 400);
        onModifyRelationship(selectedArtist.id, 25, "colleague");
        setRelations((prev) => ({ ...prev, [selectedArtist.id]: Math.min(100, (prev[selectedArtist.id] || 0) + 25) }));
      }

    } else if (type === "shade") {
      const headline = `Twitter Flame War: ${gameState.pseudonym} slams ${selectedArtist.name}`;
      const desc = `You posted an intensive video mocking ${selectedArtist.name}'s performance styles or hardware setup. It went viral online, triggering heavy comment clicks.`;
      
      text = `${selectedArtist.name}: "Are you serious right now? Clout chasing on social forums. Keep my analog setups out of your tweets!"`;
      setDmThreads((prev) => {
        const oldThread = prev[selectedArtist.id] || [];
        return {
          ...prev,
          [selectedArtist.id]: [...oldThread, `You: Publicly shaded ${selectedArtist.name} on Twitter.`, text]
        };
      });
      onModifyRelationship(selectedArtist.id, -45, "rival");
      setRelations((prev) => ({ ...prev, [selectedArtist.id]: Math.max(-100, (prev[selectedArtist.id] || 0) - 45) }));
      onTriggerDrama(headline, desc, 12, Math.round(gameState.stats.fans * 0.08));
    }
  };

  const currentThread = dmThreads[selectedArtist.id] || [
    `${selectedArtist.name}: "Yo, what's up? I'm tweaking some oscillator filter loops."`
  ];

  return (
    <div className="space-y-6">
      
      {/* Tab Selectors */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab("dms")}
          className={`px-5 py-2.5 font-sans font-semibold text-xs border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "dms"
              ? "border-purple-500 text-purple-400 font-bold bg-slate-900/50"
              : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Virtual Artists Chat Network
        </button>
        <button
          onClick={() => setActiveTab("ravemind")}
          className={`px-5 py-2.5 font-sans font-semibold text-xs border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "ravemind"
              ? "border-purple-500 text-purple-400 font-bold bg-slate-900/50"
              : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <MessageCircleCode className="h-4 w-4" />
          RaveMind Music Forums
        </button>
      </div>

      {/* DMA Chats view */}
      {activeTab === "dms" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fadeIn">
          
          {/* Artists selection column */}
          <div className="md:col-span-5 space-y-2 max-h-[580px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-800">
            <h3 className="text-[11px] font-mono uppercase text-slate-400 tracking-wider mb-2">Scene Residents DMs</h3>
            {allArtists.map((artist) => {
              const currentFriendship = relations[artist.id] !== undefined ? relations[artist.id] : artist.relationship;
              
              return (
                <div
                  key={artist.id}
                  onClick={() => {
                    setSelectedArtist(artist);
                  }}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 justify-between ${
                    selectedArtist.id === artist.id
                      ? "bg-slate-950 border-purple-500 text-slate-100 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                      : "bg-slate-950/40 border-slate-805 hover:border-slate-750 text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={getArtistPortrait(artist.id)}
                      alt={artist.name}
                      className="h-9 w-9 rounded-full object-cover border border-[#1A1A1E]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-0.5">
                      <span className="font-bold text-xs block text-slate-250">{artist.name}</span>
                      <span className="text-[9px] font-mono text-slate-500">Focus: {artist.primaryGenre}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={`text-[8.5px] font-mono font-bold block ${
                      currentFriendship >= 35 ? "text-emerald-400" : currentFriendship <= -25 ? "text-rose-400" : "text-slate-500"
                    }`}>
                      {currentFriendship >= 35 ? "FRIEND" : currentFriendship <= -25 ? "RIVAL" : "NEUTRAL"}
                    </span>
                    <span className="text-[8px] text-slate-500 font-mono">{currentFriendship}% Relationship</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DM Dialogue Terminal */}
          <div className="md:col-span-7 bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between min-h-[420px] shadow-2xl">
            
            {/* Header bio and details with large avatar */}
            <div className="border-b border-slate-800 pb-3 mb-3 flex items-center gap-3 relative">
              <img
                src={getArtistPortrait(selectedArtist.id)}
                alt={selectedArtist.name}
                className="h-10 w-10 rounded-full border border-purple-500/40 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0 pr-12">
                <span className="text-xs font-extrabold text-[#00FF95] block tracking-tight uppercase">{selectedArtist.name}</span>
                <p className="text-[10px] text-slate-400 italic leading-snug truncate">{selectedArtist.bio}</p>
              </div>
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#00FF95] animate-pulse" />
            </div>

            {/* Conversation list with user/npc chat bubbles */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto max-h-[220px] min-h-[160px] space-y-3.5 pb-4 text-xs font-mono text-slate-350 pr-1 select-text scrollbar-thin scrollbar-thumb-slate-800"
            >
              {currentThread.map((item, id) => {
                const isYou = item.startsWith("You:");
                const senderName = isYou ? gameState.pseudonym : selectedArtist.name;
                const messageText = isYou ? item.substring(4).trim() : item.split(':').slice(1).join(':').trim();
                
                return (
                  <div
                    key={id}
                    className={`flex items-start gap-2.5 ${isYou ? "flex-row-reverse animate-slideLeft" : "flex-row animate-slideRight"}`}
                  >
                    <img
                      src={isYou ? playerImg : getArtistPortrait(selectedArtist.id)}
                      alt={senderName}
                      className="h-7 w-7 rounded-full object-cover border border-[#1A1A1E] flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div
                      className={`p-3 rounded-2xl border leading-relaxed max-w-[80%] ${
                        isYou
                          ? "bg-purple-950/20 border-purple-900/40 text-purple-200 rounded-tr-none"
                          : "bg-slate-950 border-slate-850 text-slate-200 rounded-tl-none"
                      }`}
                    >
                      <div className="text-[7.5px] text-slate-500 uppercase font-black mb-1 select-none tracking-widest">{senderName}</div>
                      <span className="text-xs whitespace-pre-wrap">{messageText}</span>
                    </div>
                  </div>
                );
              })}

              {/* Typing simulation indicator */}
              {isTyping && (
                <div className="flex items-start gap-2.5 animate-pulse">
                  <img
                    src={getArtistPortrait(selectedArtist.id)}
                    alt={selectedArtist.name}
                    className="h-7 w-7 rounded-full object-cover border border-[#1A1A1E] flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-2xl rounded-tl-none text-slate-400 flex items-center space-x-1">
                    <span className="text-[9.5px] font-bold italic tracking-wide">{selectedArtist.name} is patching modular cords...</span>
                    <span className="inline-flex gap-0.5">
                      <span className="h-1 w-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-1 w-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-1 w-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive dialogue prompt selector options */}
            <div className="border-t border-slate-850 pt-3.5 mt-2.5 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono text-purple-400 font-bold uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-[#00FF95]" />
                  Interactive Chat Options
                </span>
                
                {/* Category filters inside chat options drawer */}
                <div className="flex gap-1 overflow-x-auto select-none no-scrollbar">
                  {CHAT_PROMPT_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActivePromptCategory(cat.id)}
                      className={`text-[8.5px] px-2 py-0.5 rounded font-mono border font-bold transition-all uppercase whitespace-nowrap cursor-pointer ${
                        activePromptCategory === cat.id
                          ? "bg-purple-950/40 border-purple-500 text-purple-300"
                          : "bg-slate-950/30 border-slate-850 text-slate-500 hover:text-slate-400 hover:border-slate-800"
                      }`}
                    >
                      {cat.id === "praise" ? "👍 Praising" : cat.id === "advice" ? "🎛️ Ask Advice" : cat.id === "gear" ? "🔌 Gear" : cat.id === "gossip" ? "📣 Gossip" : "🌶️ Roast"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specific sentence buttons under active category */}
              <div className="grid grid-cols-1 gap-1.5 pt-1">
                {CHAT_PROMPT_CATEGORIES.find((cat) => cat.id === activePromptCategory)?.options.map((opt, oid) => (
                  <button
                    key={oid}
                    type="button"
                    disabled={isTyping}
                    onClick={() => handleSendPromptText(opt.text, opt.relBonus, activePromptCategory)}
                    className="text-[10px] text-left px-2.5 py-2 rounded-lg bg-[#0c0d11] border border-slate-850 hover:bg-slate-950 hover:border-purple-500/50 hover:text-[#00FF95] transition-all text-slate-300 flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span className="truncate pr-3 group-hover:translate-x-0.5 transition-transform">"{opt.text}"</span>
                    <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded flex-shrink-0 font-bold ${
                      opt.relBonus > 0 ? "bg-emerald-950/30 text-emerald-400 border border-emerald-900/40" : "bg-rose-950/30 text-rose-400 border border-rose-900/40"
                    }`}>
                      {opt.relBonus > 0 ? `+${opt.relBonus} Rel` : `${opt.relBonus} Rel`}
                    </span>
                  </button>
                ))}
              </div>

              {/* Custom typed direct chat input box */}
              <div className="flex items-center gap-2 pt-1 font-mono">
                <input
                  type="text"
                  value={customInput}
                  disabled={isTyping}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendCustomText()}
                  placeholder={isTyping ? "Please wait while they respond..." : `Type custom message to ${selectedArtist.name}...`}
                  className="bg-slate-950 border border-slate-850 focus:border-purple-500 text-slate-200 text-[10.5px] px-3.5 py-2 rounded-lg flex-1 focus:outline-none transition-colors font-mono placeholder-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  disabled={isTyping || !customInput.trim()}
                  onClick={handleSendCustomText}
                  className="bg-purple-600 hover:bg-purple-505 text-white p-2 rounded-lg border border-purple-500/20 text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Mixing major game action buttons */}
            <div className="grid grid-cols-3 gap-2 border-t border-slate-850 pt-3 mt-4">
              <button
                type="button"
                onClick={() => handleInteract("feedback")}
                className="bg-slate-800 hover:bg-slate-755 text-slate-200 text-[10px] font-mono py-1.5 rounded-lg border border-slate-705 transition-colors flex items-center justify-center gap-1 font-bold active:scale-95 cursor-pointer"
              >
                <Radio className="h-3.5 w-3.5 text-purple-400" />
                Submit Demo
              </button>

              <button
                type="button"
                onClick={() => handleInteract("collab")}
                className="bg-emerald-600 hover:bg-emerald-550 text-white text-[10px] font-mono py-1.5 rounded-lg border border-emerald-500/30 transition-all flex items-center justify-center gap-1 font-bold active:scale-95 cursor-pointer"
              >
                <UserCheck className="h-3.5 w-3.5 text-emerald-100" />
                Propose ($400)
              </button>

              <button
                type="button"
                onClick={() => handleInteract("shade")}
                className="bg-rose-950/20 hover:bg-rose-950/40 text-rose-450 border border-rose-900/40 text-[10px] font-mono py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 font-bold active:scale-95 cursor-pointer"
              >
                <Flame className="h-3.5 w-3.5" />
                Trigger beef
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RaveMind Alternative Forum view */}
      {activeTab === "ravemind" && (
        <div className="bg-[#0A0A0C] border border-[#1A1A1E] p-4.5 rounded-xl shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-sm font-display font-bold text-white tracking-tight flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-400 animate-pulse" />
                RaveMind Forums &bull; Scene Feed
              </h2>
              <p className="text-[10px] text-slate-500 mt-0.5">Anonymous board monitoring bedroom studio gossips, ghost producer scandals, and DIY hardware builds.</p>
            </div>
            <button
              type="button"
              onClick={() => setForumThreads(generateInitialThreads(gameState))}
              className="text-[9px] font-mono px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className="h-3 w-3 inline mr-1" />
              Refresh
            </button>
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            <button
              type="button"
              onClick={() => setForumFilter("all")}
              className={`text-[9px] font-mono px-2 py-1 rounded border font-bold transition-all cursor-pointer ${
                forumFilter === "all" 
                  ? "bg-purple-600/30 border-purple-500 text-purple-300" 
                  : "bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-300"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setForumFilter("tech")}
              className={`text-[9px] font-mono px-2 py-1 rounded border font-bold transition-all cursor-pointer ${
                forumFilter === "tech" 
                  ? "bg-cyan-600/30 border-cyan-500 text-cyan-300" 
                  : "bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-300"
              }`}
            >
              🔌 Tech
            </button>
            <button
              type="button"
              onClick={() => setForumFilter("scene")}
              className={`text-[9px] font-mono px-2 py-1 rounded border font-bold transition-all cursor-pointer ${
                forumFilter === "scene" 
                  ? "bg-emerald-600/30 border-emerald-500 text-emerald-300" 
                  : "bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-300"
              }`}
            >
              🏙️ Scene
            </button>
            <button
              type="button"
              onClick={() => setForumFilter("gossip")}
              className={`text-[9px] font-mono px-2 py-1 rounded border font-bold transition-all cursor-pointer ${
                forumFilter === "gossip" 
                  ? "bg-amber-600/30 border-amber-500 text-amber-300" 
                  : "bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-300"
              }`}
            >
              🍿 Gossip
            </button>
            <button
              type="button"
              onClick={() => setForumFilter("drama")}
              className={`text-[9px] font-mono px-2 py-1 rounded border font-bold transition-all cursor-pointer ${
                forumFilter === "drama" 
                  ? "bg-rose-600/30 border-rose-500 text-rose-300" 
                  : "bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-300"
              }`}
            >
              🌶️ Drama
            </button>
            <button
              type="button"
              onClick={() => setForumFilter("tips")}
              className={`text-[9px] font-mono px-2 py-1 rounded border font-bold transition-all cursor-pointer ${
                forumFilter === "tips" 
                  ? "bg-blue-600/30 border-blue-500 text-blue-300" 
                  : "bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-300"
              }`}
            >
              💡 Tips
            </button>
          </div>

          {/* Forum threads list */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredThreads.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs font-mono">
                No threads in this category yet. Check back later!
              </div>
            ) : (
              filteredThreads.map((thread) => (
                <div 
                  key={thread.id} 
                  className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-850 space-y-2 hover:border-purple-500/30 transition-all cursor-pointer group"
                  onClick={() => handleThreadClick(thread)}
                >
                  <div className="flex justify-between items-center text-[9px] font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400 font-bold">{thread.author}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                        thread.category === "tech" ? "bg-cyan-900/40 text-cyan-400" :
                        thread.category === "scene" ? "bg-emerald-900/40 text-emerald-400" :
                        thread.category === "gossip" ? "bg-amber-900/40 text-amber-400" :
                        thread.category === "drama" ? "bg-rose-900/40 text-rose-400" :
                        thread.category === "tips" ? "bg-blue-900/40 text-blue-400" :
                        "bg-slate-800 text-slate-400"
                      }`}>
                        {thread.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <span>{thread.likes} 🔥</span>
                      <span className="text-slate-600">•</span>
                      <span>{thread.replies} 💬</span>
                      <span className="text-slate-600">•</span>
                      <span className={thread.hotRating > 80 ? "text-orange-400 font-bold" : "text-slate-500"}>
                        📈 {thread.hotRating}%
                      </span>
                    </div>
                  </div>
                  <h4 className="font-sans font-bold text-[11px] text-white leading-snug group-hover:text-purple-300 transition-colors">
                    {thread.title}
                  </h4>
                  <p className="text-[10px] font-mono text-slate-500 leading-normal line-clamp-2">
                    {thread.preview}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* New thread button */}
          <div className="mt-4 pt-3 border-t border-slate-850">
            <button
              type="button"
              onClick={handleCreateNewThread}
              className="w-full text-[10px] font-mono py-2 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 rounded-lg text-slate-400 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="h-3 w-3" />
              Start New Discussion Thread
            </button>
          </div>

          {/* Selected thread detail modal */}
          {selectedThread && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
              <div className="bg-[#0c0d12] border border-slate-800 rounded-xl p-4 max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-purple-400 font-mono text-[10px]">{selectedThread.author}</span>
                    <span className={`ml-2 px-1.5 py-0.5 rounded text-[8px] font-bold ${
                      selectedThread.category === "tech" ? "bg-cyan-900/40 text-cyan-400" :
                      selectedThread.category === "scene" ? "bg-emerald-900/40 text-emerald-400" :
                      selectedThread.category === "gossip" ? "bg-amber-900/40 text-amber-400" :
                      "bg-slate-800 text-slate-400"
                    }`}>
                      {selectedThread.category}
                    </span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setSelectedThread(null)}
                    className="text-slate-500 hover:text-white text-lg"
                  >
                    ×
                  </button>
                </div>
                <h3 className="font-bold text-white text-sm mb-2">{selectedThread.title}</h3>
                <p className="text-slate-400 text-xs font-mono mb-3">{selectedThread.preview}</p>
                
                <div className="flex-1 overflow-y-auto space-y-2 mb-3">
                  {/* Dynamic comments based on thread category */}
                  {getRandomComments(selectedThread.category, 6).map((comment, i) => (
                    <div key={i} className="bg-slate-900/50 p-2 rounded text-[10px] text-slate-400 font-mono">
                      {comment}
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Add to discussion..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                  <button 
                    type="button"
                    onClick={() => setSelectedThread(null)}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded transition-colors"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
