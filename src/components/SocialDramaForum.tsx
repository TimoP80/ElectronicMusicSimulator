/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, RefreshCw, Send, Radio, UserCheck, Flame, Users, Sparkles, MessageCircleCode } from "lucide-react";
import { GameState, VirtualArtist } from "../types";

interface SocialDramaProps {
  gameState: GameState;
  onModifyRelationship: (artistId: string, delta: number, status: string) => void;
  onTriggerDrama: (title: string, desc: string, hypeAward: number, fanChange: number) => void;
  onCollaborate: (artistName: string, fee: number) => void;
}

export const VIRTUAL_ARTISTS_DB: VirtualArtist[] = [
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
      { text: "Did you hear that rumor about Vortex Records cutting player royalty shares by 35%?", relBonus: 4 },
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
        return prefix + `I wouldn't be surprised. Vortex Records is run by corporate lawyers who don't know the difference between a 909 kick and a laundry tumble. Stick to underground self-releases.`;
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
        return prefix + `Vortex is facing major litigation. Independent creators need to stick to collaborative publishing collectives. Keep your royalty splits clear.`;
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
  const [selectedArtist, setSelectedArtist] = useState<VirtualArtist>(VIRTUAL_ARTISTS_DB[1]);
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
    return VIRTUAL_ARTISTS_DB.reduce((acc, a) => ({ ...acc, [a.id]: a.relationship }), {});
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
  ],
  scene: [
    { titleTemplate: "Is the {city} underground scene dying?", replies: 67, previewTemplate: "Just got back from {city} and the crowds felt different. Less energy, more phone-scrolling." },
    { titleTemplate: "{genre} artists to watch this year", replies: 34, previewTemplate: "Compile your top picks for {genre} rising talents. Let's support the underground!" },
    { titleTemplate: "Festival lineup predictions for {event}", replies: 89, previewTemplate: "Who's getting main stage this year? My bets are on {artist} but..." },
  ],
  gossip: [
    { titleTemplate: "Breaking: {artist} accused of ghost production", replies: 156, previewTemplate: "Just saw some deleted tweets. Allegations are flying on the {platform} boards. Thoughts?" },
    { titleTemplate: "Label drama: {label} cutting royalties", replies: 98, previewTemplate: "Internal documents leaked showing major royalty cuts. How do we fight this?" },
    { titleTemplate: "Underground beef: {artist1} vs {artist2}", replies: 73, previewTemplate: "Saw them go at it on Instagram stories. This beef is getting real." },
  ],
  genre: [
    { titleTemplate: "{genre} production tips for beginners", replies: 42, previewTemplate: "Starting my journey into {genre}. What's the most important element to focus on?" },
    { titleTemplate: "{genre} revival in {city}?", replies: 31, previewTemplate: "Noticed a surge of {genre} parties lately. Is the scene making a comeback?" },
  ],
  drama: [
    { titleTemplate: "Calling out: {artist} for {reason}", replies: 203, previewTemplate: "This needs to be said. {artist} has been acting {behavior} and we shouldn't stay silent." },
    { titleTemplate: "Hot take: {genre} was better in {year}s", replies: 156, previewTemplate: "Controversial opinion but the {genre} from {year} had something special that we lost." },
  ],
  tips: [
    { titleTemplate: "How to get booked at {venue}?", replies: 67, previewTemplate: "Sent demos to {venue} 10 times already. What am I missing? Tips appreciated!" },
    { titleTemplate: "Studio setup tour: show us your gear", replies: 89, previewTemplate: "Let's see everyone's workspace! I'll start: I run a modular setup with {gear}." },
  ],
  general: [
    { titleTemplate: "Managing burnout while producing", replies: 45, previewTemplate: "Feeling exhausted from the grind. How do you balance creativity with mental health?" },
    { titleTemplate: "Best cities for bedroom producers?", replies: 78, previewTemplate: "Thinking about relocating for better scene access. Which cities have the best communities?" },
    { titleTemplate: "Day job vs music career", replies: 124, previewTemplate: "Working 9-5 and trying to produce at night. How do full-time producers survive financially?" },
  ]
};

// Artists for thread mentions
const FORUM_ARTISTS = ["Acid_Core", "Liquid Viper", "Neon Rider", "Glitch Lord", "SubSec_Zero", "Moko Bass", "Hardcore Hype", "Cosmic Gazer"];
const FORUM_LABELS = ["Subterranean Clicks", "NeOnlyt Outrun", "Breakbeat Syndicate", "Aurora Heavenly", "Vortex Mainstage"];
const CITIES = ["Berlin", "London", "Detroit", "Amsterdam", "Ibiza", "Tokyo", "Los Angeles", "Chicago"];
const GEAR_ITEMS = ["Eurorack modular", "Moog Subsequent 37", "TR-808", "Elektron Digitakt", "Ableton Push", "Roland Juno-106", "Korg MS-20", "Teenage Engineering OP-1"];

// Generate a dynamic thread from template
const generateDynamicThread = (category: ForumCategory, gameState: GameState): any => {
  const templates = FORUM_THREAD_TEMPLATES[category];
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  // Fill template variables
  let title = template.titleTemplate
    .replace("{artist}", FORUM_ARTISTS[Math.floor(Math.random() * FORUM_ARTISTS.length)])
    .replace("{artist1}", FORUM_ARTISTS[Math.floor(Math.random() * FORUM_ARTISTS.length)])
    .replace("{artist2}", FORUM_ARTISTS[Math.floor(Math.random() * FORUM_ARTISTS.length)])
    .replace("{label}", FORUM_LABELS[Math.floor(Math.random() * FORUM_LABELS.length)])
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
    title: "Ghost producing scandal on Vortex records? Rumors about EDM pop superstars",
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
            {VIRTUAL_ARTISTS_DB.map((artist) => {
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
                  {/* Simulated comments */}
                  {["@SceneRegular: This is so accurate!", "@BedroomProducer: Disagree but respect the take", "@VinylCollector: Someone needs to say it"].map((comment, i) => (
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
