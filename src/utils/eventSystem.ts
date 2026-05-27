import {
  NPC, NPCMood, WorldEvent, WorldEventType, EventSeverity, EventImpact,
  NPCAction, WorldTickResult, MusicGenre, GameState
} from "../types";
import { updateNPCMood, updateRelationship, consolidateMemories, addMemoryEvent } from "./npcSystem";

// Generate a unique ID
function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}

function weightedRandom(weights: number[]): number {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

// ============================================
// NPC TICK — Update all NPC states
// ============================================

export function processNPCTick(npcs: NPC[], currentWeek: number): { updatedNpcs: NPC[]; actions: NPCAction[] } {
  const updatedNpcs: NPC[] = [];
  const allActions: NPCAction[] = [];

  for (const npc of npcs) {
    let updated = { ...npc };

    // Decay mood toward equilibrium
    const decayedMood: NPCMood = {
      ...updated.mood,
      energy: clamp(updated.mood.energy + (updated.mood.energy > 60 ? -5 : 3)),
      burnout: clamp(updated.mood.burnout - 2),
      inspiration: clamp(updated.mood.inspiration + (updated.mood.inspiration < 40 ? 5 : -3)),
    };
    if (decayedMood.burnout < 40 && decayedMood.energy > 40) {
      decayedMood.currentEmotion = "neutral";
    }
    updated.mood = decayedMood;

    // Decay relationships toward neutral
    for (const [targetId, rel] of Object.entries(updated.relationships)) {
      if (Math.abs(rel.affinity) > 5) {
        const decayDirection = rel.affinity > 0 ? -1 : 1;
        updated.relationships[targetId] = {
          ...rel,
          affinity: clamp(rel.affinity + decayDirection * 1, -100, 100)
        };
      }
    }

    // Consolidate memories weekly
    updated.memory = consolidateMemories(updated.memory);

    // Generate NPC action based on personality + state
    const action = generateNPCAction(updated);
    if (action) allActions.push(action);

    // Progress goals
    updated.goals = updated.goals.map(g => {
      if (!g.active) return g;
      const progress = g.type === "release" ? 5 + Math.random() * 10 : 3 + Math.random() * 7;
      const newProgress = Math.min(100, g.progress + progress);
      return { ...g, progress: newProgress, active: newProgress < 100 };
    });

    updatedNpcs.push(updated);
  }

  return { updatedNpcs, actions: allActions };
}

// ============================================
// NPC ACTION GENERATOR
// ============================================

function generateNPCAction(npc: NPC): NPCAction | null {
  const roll = Math.random();

  if (npc.mood.burnout > 60 && roll < 0.3) {
    return { npcId: npc.id, type: "rest", description: `${npc.name} is taking a break to recover.`, priority: npc.mood.burnout };
  }

  if (npc.personality.sociability > 60 && roll < 0.4) {
    return { npcId: npc.id, type: "socialize", description: `${npc.name} hits the scene to network.`, priority: npc.personality.sociability };
  }

  if (npc.personality.ego > 65 && npc.reputation.underground > 50 && roll < 0.3) {
    return { npcId: npc.id, type: "feud", description: `${npc.name} starts stirring up drama.`, priority: npc.personality.ego };
  }

  if (npc.mood.inspiration > 50 && roll < 0.4) {
    const goal = npc.goals.find(g => g.active && g.type === "release");
    return {
      npcId: npc.id,
      type: goal ? "release" : "produce",
      description: `${npc.name} is working on new music.`,
      priority: npc.mood.inspiration
    };
  }

  return null;
}

// ============================================
// SCENE EVENT GENERATOR
// ============================================

export function generateSceneEvent(
  npcs: NPC[],
  weekDisplay: string,
  hotGenre: string
): WorldEvent | null {
  const roll = Math.random();

  if (roll < 0.25) return generateIndustryEvent(npcs, weekDisplay, hotGenre);
  if (roll < 0.5) return generateNPCInteractionEvent(npcs, weekDisplay);
  if (roll < 0.75) return generateTrendEvent(weekDisplay, hotGenre);
  return generateControversyEvent(npcs, weekDisplay);
}

function generateIndustryEvent(npcs: NPC[], weekDisplay: string, hotGenre: string): WorldEvent | null {
  const npc = npcs.length > 0 ? randomFrom(npcs) : null;
  const variants = [
    { title: `New ${hotGenre} Festival Announced`, desc: `A major festival is coming, featuring top ${hotGenre} talent.`, severity: "notable" as EventSeverity },
    { title: "Record Store Day Exclusive Pressing", desc: "Limited vinyl releases are dropping this week.", severity: "minor" as EventSeverity },
    { title: "Streaming Platform Updates Royalty Model", desc: "New payment structure could affect independent artists.", severity: "notable" as EventSeverity },
  ];
  if (npc) {
    variants.push({
      title: `${npc.name} Signs Distribution Deal`,
      desc: `${npc.name} has secured a major distribution deal, expanding their reach.`,
      severity: "major" as EventSeverity
    });
  }

  const picked = randomFrom(variants);
  return {
    id: uid("indevt"),
    type: "industry_event",
    severity: picked.severity,
    title: picked.title,
    description: picked.desc,
    timestamp: Date.now(),
    weekDisplay,
    participants: npc ? [npc.name] : [],
    npcInvolved: npc ? [npc.id] : [],
    impact: {
      fansDelta: npc ? Math.floor(Math.random() * 50) + 10 : 0,
      hypeDelta: npc ? Math.floor(Math.random() * 5) + 2 : 3,
      prestigeDelta: 0,
      moneyDelta: 0,
      npcRelationshipChanges: {},
      genreShift: { [hotGenre]: Math.floor(Math.random() * 5) + 2 }
    }
  };
}

function generateNPCInteractionEvent(npcs: NPC[], weekDisplay: string): WorldEvent | null {
  if (npcs.length < 2) return null;

  const shuffled = [...npcs].sort(() => Math.random() - 0.5);
  const a = shuffled[0];
  const b = shuffled[1];

  const relAtoB = a.relationships[b.id]?.affinity || 0;
  const isFriendly = relAtoB > 20;
  const isHostile = relAtoB < -20;

  if (isHostile && Math.random() < 0.5) {
    return {
      id: uid("feud"),
      type: "feud",
      severity: "notable",
      title: `${a.name} Calls Out ${b.name}`,
      description: `${a.name} publicly criticized ${b.name}, citing creative differences. The scene is buzzing.`,
      timestamp: Date.now(),
      weekDisplay,
      participants: [a.name, b.name],
      npcInvolved: [a.id, b.id],
      impact: {
        fansDelta: 0,
        hypeDelta: Math.floor(Math.random() * 10) + 5,
        prestigeDelta: 0,
        moneyDelta: 0,
        npcRelationshipChanges: { [a.id]: -15, [b.id]: -10 },
        genreShift: {}
      }
    };
  }

  if (isFriendly && Math.random() < 0.5) {
    return {
      id: uid("collab"),
      type: "collaboration",
      severity: "notable",
      title: `${a.name} & ${b.name} Team Up`,
      description: `Word is ${a.name} and ${b.name} are working on a collaborative project. Expect big things.`,
      timestamp: Date.now(),
      weekDisplay,
      participants: [a.name, b.name],
      npcInvolved: [a.id, b.id],
      impact: {
        fansDelta: Math.floor(Math.random() * 100) + 20,
        hypeDelta: Math.floor(Math.random() * 10) + 5,
        prestigeDelta: Math.floor(Math.random() * 3) + 1,
        moneyDelta: 0,
        npcRelationshipChanges: { [a.id]: 10, [b.id]: 10 },
        genreShift: {}
      }
    };
  }

  return null;
}

function generateTrendEvent(weekDisplay: string, hotGenre: string): WorldEvent {
  const variants = [
    `${hotGenre} is experiencing a resurgence in underground clubs.`,
    `Producers are experimenting with ${hotGenre}-influenced sounds this season.`,
    `A new wave of ${hotGenre} artists is emerging from the bedroom producer scene.`,
  ];
  return {
    id: uid("trend"),
    type: "trend_shift",
    severity: "notable",
    title: `${hotGenre} Scene Heating Up`,
    description: randomFrom(variants),
    timestamp: Date.now(),
    weekDisplay,
    participants: [],
    impact: {
      fansDelta: 0,
      hypeDelta: 3,
      prestigeDelta: 0,
      moneyDelta: 0,
      npcRelationshipChanges: {},
      genreShift: { [hotGenre]: 5 }
    }
  };
}

function generateControversyEvent(npcs: NPC[], weekDisplay: string): WorldEvent | null {
  if (npcs.length === 0) return null;
  const npc = randomFrom(npcs);
  return {
    id: uid("controv"),
    type: "controversy",
    severity: "major",
    title: `${npc.name} Sparks Controversy`,
    description: `${npc.name} made headlines with controversial comments about the current state of electronic music.`,
    timestamp: Date.now(),
    weekDisplay,
    participants: [npc.name],
    npcInvolved: [npc.id],
    impact: {
      fansDelta: -Math.floor(Math.random() * 30) - 10,
      hypeDelta: Math.floor(Math.random() * 15) + 10,
      prestigeDelta: -Math.floor(Math.random() * 5),
      moneyDelta: 0,
      npcRelationshipChanges: { [npc.id]: -5 },
      genreShift: {}
    }
  };
}

// ============================================
// MAIN WORLD TICK
// ============================================

export async function processWorldTick(
  npcs: NPC[],
  weekDisplay: string,
  hotGenre: string,
  sceneTick: number,
  playerName?: string,
  playerPrestige?: number
): Promise<{
  updatedNpcs: NPC[];
  newEvents: WorldEvent[];
  npcActions: NPCAction[];
}> {
  // NPC tick
  const { updatedNpcs, actions } = processNPCTick(npcs, weekDisplay === "W1" ? 1 : 0);

  // Generate events
  const newEvents: WorldEvent[] = [];

  if (sceneTick % 2 === 0) {
    const event = generateSceneEvent(updatedNpcs, weekDisplay, hotGenre);
    if (event) newEvents.push(event);
  }

  // Every 4 weeks, generate an industry event
  if (sceneTick % 4 === 0) {
    const event = generateIndustryEvent(updatedNpcs, weekDisplay, hotGenre);
    if (event) newEvents.push(event);
  }

  // Every 8 weeks, attempt premium AI event
  if (sceneTick > 0 && sceneTick % 8 === 0 && playerName && typeof window !== "undefined") {
    try {
      const { generatePremiumEvent } = await import("./npcAI");
      const types = ["interview", "review", "viral", "controversy", "festival_report"] as const;
      const eventType = types[Math.floor(Math.random() * types.length)];
      const premiumEvent = await generatePremiumEvent(
        eventType,
        playerName,
        playerPrestige ?? 50,
        updatedNpcs,
        hotGenre,
        weekDisplay
      );
      if (premiumEvent) newEvents.push(premiumEvent);
    } catch {
      // AI unavailable — proceed with deterministic events only
    }
  }

  return {
    updatedNpcs,
    newEvents,
    npcActions: actions
  };
}

// ============================================
// EVENT IMPACT APPLICATION
// ============================================

export function applyEventImpact(event: WorldEvent, state: GameState): GameState {
  let updated = { ...state };

  updated.stats = {
    ...updated.stats,
    fans: Math.max(0, updated.stats.fans + event.impact.fansDelta),
    hype: clamp(updated.stats.hype + event.impact.hypeDelta),
    prestige: clamp(updated.stats.prestige + event.impact.prestigeDelta),
    money: Math.max(0, updated.stats.money + event.impact.moneyDelta),
  };

  // Apply NPC relationship changes
  if (event.npcInvolved) {
    updated.npcs = updated.npcs.map(npc => {
      const delta = event.impact.npcRelationshipChanges[npc.id];
      if (!delta) return npc;
      return {
        ...npc,
        relationships: updateRelationship(npc.relationships, npc.id, { affinity: delta, trust: Math.abs(delta) / 2 })
      };
    });
  }

  return updated;
}
