/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CharacterSkill } from "../types";

export const SKILLS_DB: CharacterSkill[] = [
  // PRODUCTION
  {
    id: "sound_design",
    name: "Oscillator Modulation",
    description: "Improves your unique sound signature. Boosts original track sound design score by +15% per level.",
    level: 1,
    maxLevel: 5,
    cost: 1,
    category: "production",
  },
  {
    id: "sampling",
    name: "Creative Sampling",
    description: "Digging through old records to find perfect grooves. Boosts track catchiness score by +12% per level.",
    level: 1,
    maxLevel: 5,
    cost: 1,
    category: "production",
  },
  {
    id: "arrangement",
    name: "Build-up Drafting",
    description: "Drafting epic tension-release grids. Increases track dancefloor score and complexity by +10% per level.",
    level: 1,
    maxLevel: 5,
    cost: 1,
    category: "production",
  },

  // ENGINEERING / MIXING
  {
    id: "mixing_eq",
    name: "Frequencies Separation (EQ)",
    description: "Clearing mud in low-mids. Boosts track mixing/mastering quality by +16% per level.",
    level: 1,
    maxLevel: 5,
    cost: 1,
    category: "engineering",
  },
  {
    id: "limiting_compression",
    name: "Loudness Maximizing (Limiter)",
    description: "Sidechaining and saturation to match the industrial standards. Boosts track loudness & energy rating by +12%.",
    level: 1,
    maxLevel: 5,
    cost: 1,
    category: "engineering",
  },

  // PERFORMANCE
  {
    id: "dj_eq_mixing",
    name: "Seamless Fades & Sweeps",
    description: "Smooth club EQ blending. Keeps the crowd energy stable during DJ mixing minigames. Resets crowd mistakes.",
    level: 1,
    maxLevel: 5,
    cost: 1,
    category: "performance",
  },
  {
    id: "crowd_interaction",
    name: "Stage Mic Hype",
    description: "Screaming into the mic or doing epic drops on cue. Multiplies gig payout by +15% and increases venue hype boost.",
    level: 1,
    maxLevel: 5,
    cost: 1,
    category: "performance",
  },
  {
    id: "audiovisual_integration",
    name: "Audio-Reactive Laser Setup",
    description: "Choreographing lights and stroboscopes with your track loops. Multiplies prestige gained from gigs by +20%.",
    level: 1,
    maxLevel: 5,
    cost: 1,
    category: "performance",
  },

  // MARKETING
  {
    id: "marketing_memes",
    name: "Viral Social Meme Hacking",
    description: "Posting quirky videos featuring your tracks alongside cats or gear disasters. Increases track self-released starting play counts by +25%.",
    level: 1,
    maxLevel: 5,
    cost: 1,
    category: "marketing",
  },
  {
    id: "networking_egos",
    name: "VIP Guestlist Networking",
    description: "Buying drinks for other famous producers/labels to slip them a USB drive of your demos. Boosts label acceptance rates and lowers travel fees.",
    level: 1,
    maxLevel: 5,
    cost: 1,
    category: "marketing",
  }
];
