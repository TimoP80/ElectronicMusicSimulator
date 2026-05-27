import { NPC, NPCPersonality, NPCMood, NPCReputation, NPCGoal, MemoryEvent, MemorySummary, NPCRole, NPCArchetype, NPCRelationshipData, DialogueContext, DialogueResponse, MusicGenre } from "../types";

// Archetype → personality templates
const ARCHETYPE_PERSONALITIES: Record<NPCArchetype, { personality: Partial<NPCPersonality>; roles: NPCRole[] }> = {
  techno_purist: {
    personality: { openness: 25, ego: 60, creativity: 40, commercialism: 10, emotionality: 45, sociability: 20 },
    roles: ["producer", "dj"]
  },
  experimental: {
    personality: { openness: 85, ego: 40, creativity: 90, commercialism: 15, emotionality: 60, sociability: 40 },
    roles: ["producer", "dj"]
  },
  commercial: {
    personality: { openness: 50, ego: 70, creativity: 30, commercialism: 85, emotionality: 35, sociability: 70 },
    roles: ["producer", "dj", "label_exec"]
  },
  underground_legend: {
    personality: { openness: 45, ego: 75, creativity: 65, commercialism: 5, emotionality: 50, sociability: 25 },
    roles: ["producer", "dj", "label_exec"]
  },
  rising_star: {
    personality: { openness: 70, ego: 45, creativity: 60, commercialism: 40, emotionality: 55, sociability: 65 },
    roles: ["producer", "dj"]
  },
  mentor: {
    personality: { openness: 80, ego: 25, creativity: 50, commercialism: 30, emotionality: 40, sociability: 80 },
    roles: ["producer", "dj", "label_exec", "journalist"]
  },
  rival: {
    personality: { openness: 30, ego: 85, creativity: 50, commercialism: 40, emotionality: 75, sociability: 35 },
    roles: ["producer", "dj"]
  },
  scene_elder: {
    personality: { openness: 40, ego: 50, creativity: 35, commercialism: 30, emotionality: 30, sociability: 45 },
    roles: ["producer", "label_exec", "promoter"]
  },
  industry_shark: {
    personality: { openness: 55, ego: 80, creativity: 25, commercialism: 90, emotionality: 25, sociability: 75 },
    roles: ["label_exec", "promoter", "manager"]
  },
  bedroom_producer: {
    personality: { openness: 35, ego: 30, creativity: 70, commercialism: 20, emotionality: 50, sociability: 15 },
    roles: ["producer"]
  }
};

const GENRE_LIST = Object.values(MusicGenre).filter(v => typeof v === "string") as string[];
const NPC_FIRST_NAMES = ["Kai", "Luna", "Zara", "Milo", "Nova", "Ravi", "Sage", "Ivy", "Ash", "Remy", "Ezra", "Aria", "Onyx", "Jade", "Zion", "Vega", "Lennon", "Sora", "Indigo", "Phoenix"];
const NPC_LAST_NAMES = ["Wave", "Circuit", "Drift", "Flux", "Filter", "Echo", "Pulse", "Byte", "Phase", "Reverb", "Synth", "Beat", "Groove", "Tone", "Chord"];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}

function jitter(base: number, range: number): number {
  return clamp(base + (Math.random() - 0.5) * range * 2);
}

export function generateNPCName(): string {
  return `${randomFrom(NPC_FIRST_NAMES)} ${randomFrom(NPC_LAST_NAMES)}`;
}

export function pickArchetypeForRole(role: NPCRole): NPCArchetype {
  const candidates = (Object.keys(ARCHETYPE_PERSONALITIES) as NPCArchetype[])
    .filter(k => ARCHETYPE_PERSONALITIES[k].roles.includes(role));
  return candidates.length ? randomFrom(candidates) : "bedroom_producer";
}

export function generatePersonality(archetype: NPCArchetype, seed?: number): NPCPersonality {
  const base = ARCHETYPE_PERSONALITIES[archetype].personality;
  return {
    openness: jitter(base.openness || 50, 15),
    ego: jitter(base.ego || 50, 15),
    creativity: jitter(base.creativity || 50, 15),
    commercialism: jitter(base.commercialism || 50, 15),
    emotionality: jitter(base.emotionality || 50, 15),
    sociability: jitter(base.sociability || 50, 15)
  };
}

export function generateGenreAffinities(archetype: NPCArchetype): Record<string, number> {
  const affinities: Record<string, number> = {};
  const genreCount = 2 + Math.floor(Math.random() * 3);
  const shuffled = [...GENRE_LIST].sort(() => Math.random() - 0.5);

  if (archetype === "techno_purist") {
    affinities["Techno"] = 90 + Math.floor(Math.random() * 10);
    affinities[shuffled[0]] = 30 + Math.floor(Math.random() * 30);
  } else if (archetype === "commercial") {
    affinities["House"] = 80 + Math.floor(Math.random() * 15);
    affinities["Pop"] = 60 + Math.floor(Math.random() * 30);
  } else {
    for (let i = 0; i < genreCount; i++) {
      affinities[shuffled[i]] = 40 + Math.floor(Math.random() * 55);
    }
  }
  return affinities;
}

export function generateReputation(fame: number, archetype: NPCArchetype): NPCReputation {
  const isUnderground = ["techno_purist", "experimental", "underground_legend", "bedroom_producer"].includes(archetype);
  return {
    underground: isUnderground ? clamp(fame + jitter(10, 20)) : clamp(fame * 0.3 + jitter(5, 15)),
    mainstream: isUnderground ? clamp(fame * 0.2 + jitter(5, 10)) : clamp(fame + jitter(10, 20)),
    technicalSkill: clamp(30 + Math.random() * 50 + (archetype === "techno_purist" ? 20 : 0)),
    influence: clamp(fame * 0.6 + jitter(10, 20))
  };
}

export function createDefaultMood(): NPCMood {
  return {
    energy: 60 + Math.floor(Math.random() * 30),
    burnout: Math.floor(Math.random() * 20),
    inspiration: 40 + Math.floor(Math.random() * 40),
    currentEmotion: "neutral"
  };
}

export function generateGoals(npc: NPC): NPCGoal[] {
  const goals: NPCGoal[] = [];
  if (npc.role === "producer" || npc.role === "dj") {
    goals.push({
      id: `goal_release_${npc.id}`,
      type: "release",
      urgency: 30 + Math.floor(Math.random() * 50),
      progress: 0,
      active: true
    });
  }
  if (npc.personality.sociability > 60 && npc.personality.openness > 50) {
    goals.push({
      id: `goal_collab_${npc.id}`,
      type: "collaboration",
      urgency: 20 + Math.floor(Math.random() * 40),
      progress: 0,
      active: true
    });
  }
  if (npc.personality.ego > 70) {
    goals.push({
      id: `goal_prestige_${npc.id}`,
      type: "prestige",
      urgency: 50 + Math.floor(Math.random() * 40),
      progress: 0,
      active: true
    });
  }
  return goals;
}

export function createNPC(opts: {
  id?: string;
  name?: string;
  role?: NPCRole;
  archetype?: NPCArchetype;
  genreAffinities?: Record<string, number>;
  fame?: number;
  bio?: string;
}): NPC {
  const role = opts.role || randomFrom(["producer", "dj", "label_exec", "promoter", "journalist"] as NPCRole[]);
  const archetype = opts.archetype || pickArchetypeForRole(role);
  const name = opts.name || generateNPCName();
  const fame = opts.fame !== undefined ? opts.fame : 20 + Math.floor(Math.random() * 60);

  const npc: NPC = {
    id: opts.id || `npc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name,
    role,
    archetype,
    genreAffinities: opts.genreAffinities || generateGenreAffinities(archetype),
    personality: generatePersonality(archetype),
    reputation: generateReputation(fame, archetype),
    mood: createDefaultMood(),
    relationships: {},
    memory: { events: [], summaries: [] },
    goals: [],
    flags: [],
    avatarSeed: name.replace(/\s+/g, ""),
    bio: opts.bio || `${name} is a ${role.replace("_", " ")} in the electronic music scene.`
  };

  npc.goals = generateGoals(npc);
  return npc;
}

export function createNPCsFromVirtualArtists(artists: Array<{ name: string; primaryGenre: MusicGenre; fame: number; ego: number; bio: string }>): NPC[] {
  return artists.map((a, i) => createNPC({
    id: `npc_virtual_${i}`,
    name: a.name,
    role: "producer",
    archetype: a.ego > 70 ? "rival" : a.fame > 60 ? "scene_elder" : "rising_star",
    fame: a.fame,
    bio: a.bio
  }));
}

export function updateNPCMood(npc: NPC, actions: { produced?: boolean; gigged?: boolean; rested?: boolean; released?: boolean; socialized?: boolean }): NPCMood {
  const m = { ...npc.mood };
  if (actions.produced) m.energy = clamp(m.energy - 8); else m.energy = clamp(m.energy + 3, 0, 100);
  if (actions.gigged) { m.energy = clamp(m.energy - 15); m.inspiration = clamp(m.inspiration + 8); }
  if (actions.rested) { m.energy = clamp(m.energy + 20); m.burnout = clamp(m.burnout - 15); }
  if (actions.released) { m.inspiration = clamp(m.inspiration + 10); m.burnout = clamp(m.burnout + 5); }
  if (actions.socialized) { m.energy = clamp(m.energy - 3); m.inspiration = clamp(m.inspiration + 5); }

  m.burnout = clamp(m.burnout + 2 - Math.random() * 5);
  m.energy = clamp(m.energy - 2 + (m.inspiration > 50 ? 3 : 0));

  if (m.burnout > 70) m.currentEmotion = "burnt_out";
  else if (m.inspiration > 70) m.currentEmotion = "inspired";
  else if (m.energy < 30) m.currentEmotion = "angry";
  else if (m.energy > 70 && m.inspiration > 50) m.currentEmotion = "excited";
  else m.currentEmotion = "neutral";

  return m;
}

export function updateRelationship(
  relationships: Record<string, NPCRelationshipData>,
  targetId: string,
  delta: { affinity?: number; trust?: number }
): Record<string, NPCRelationshipData> {
  const existing = relationships[targetId];
  const updated = { ...relationships };
  updated[targetId] = {
    affinity: existing ? clamp(existing.affinity + (delta.affinity || 0), -100, 100) : (delta.affinity || 0),
    trust: existing ? clamp(existing.trust + (delta.trust || 0), 0, 100) : (delta.trust || 0),
    historyWeight: existing ? Math.min(100, existing.historyWeight + 5) : 5,
    lastInteraction: Date.now()
  };
  return updated;
}

export function addMemoryEvent(npc: NPC, event: Omit<MemoryEvent, "id" | "timestamp">): NPC {
  const newEvent: MemoryEvent = {
    ...event,
    id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now()
  };
  return {
    ...npc,
    memory: {
      events: [newEvent, ...npc.memory.events].slice(0, 100),
      summaries: npc.memory.summaries
    }
  };
}

export function consolidateMemories(memory: { events: MemoryEvent[]; summaries: MemorySummary[] }): { events: MemoryEvent[]; summaries: MemorySummary[] } {
  const now = Date.now();
  const DAY_MS = 86400000;

  const recentEvents = memory.events.filter(e => now - e.timestamp < DAY_MS * 7);
  const oldEvents = memory.events.filter(e => now - e.timestamp >= DAY_MS * 7);

  const topicGroups = new Map<string, MemoryEvent[]>();
  for (const event of oldEvents) {
    const topic = event.participants.sort().join("+");
    if (!topicGroups.has(topic)) topicGroups.set(topic, []);
    topicGroups.get(topic)!.push(event);
  }

  const newSummaries: MemorySummary[] = [];
  for (const [topic, events] of topicGroups) {
    if (events.length < 2) {
      recentEvents.push(...events);
      continue;
    }
    const totalImpact = events.reduce((s, e) => s + Math.abs(e.impact.relationshipDelta) + Math.abs(e.impact.reputationDelta), 0);
    const importance = clamp(totalImpact / events.length * 5);
    if (importance > 10) {
      newSummaries.push({
        topic,
        importance,
        summary: `${events.length} interactions with ${topic}. Net impact: ${totalImpact > 0 ? "positive" : "negative"}.`,
        relatedNpcs: [...new Set(events.flatMap(e => e.participants))],
        weightDecay: 1.0
      });
    } else {
      recentEvents.push(...events);
    }
  }

  const decayedSummaries = memory.summaries.map(s => ({
    ...s,
    weightDecay: Math.max(0, s.weightDecay - 0.1),
    importance: s.weightDecay > 0.3 ? s.importance : s.importance * 0.5
  })).filter(s => s.importance > 5);

  return {
    events: recentEvents.slice(0, 50),
    summaries: [...newSummaries, ...decayedSummaries].slice(0, 30)
  };
}

export function createDialogueContext(
  npc: NPC,
  player: { fame: number; genre: string; name: string },
  trigger: DialogueContext["trigger"]
): DialogueContext {
  const rel = npc.relationships[player.name] || { affinity: 0, trust: 0, historyWeight: 0, lastInteraction: 0 };
  const historyLevel: DialogueContext["relationship"]["historyLevel"] =
    rel.historyWeight < 5 ? "none" :
    rel.historyWeight < 20 ? "acquaintance" :
    rel.affinity > 30 ? "friend" : "rival";

  return {
    npc,
    playerFame: player.fame,
    playerGenre: player.genre,
    playerPseudonym: player.name,
    relationship: {
      affinity: rel.affinity,
      trust: rel.trust,
      historyLevel
    },
    sceneState: {
      genreTrends: {},
      currentEvents: []
    },
    trigger
  };
}

// AI-enhanced dialogue wrapper (5% spike)
export async function generateDialogueResponseWithAI(
  ctx: DialogueContext,
  gameWeek: number
): Promise<DialogueResponse> {
  if (typeof window !== "undefined") {
    try {
      const { generateAIDialogue } = await import("./npcAI");
      const aiResponse = await generateAIDialogue(
        ctx.npc,
        ctx.playerPseudonym || "the player",
        ctx.playerFame,
        ctx.trigger,
        gameWeek
      );
      if (aiResponse) return aiResponse;
    } catch {
      // fall through to deterministic
    }
  }
  return generateDialogueResponse(ctx);
}

export function generateDialogueResponse(ctx: DialogueContext): DialogueResponse {
  const { npc, relationship, trigger } = ctx;

  // Custom message uses a separate handler
  if (trigger === "custom_message") return customDialogue(npc, ctx);

  if (relationship.historyLevel === "none") {
    return templateGreeting(npc, ctx);
  }
  if (npc.mood.currentEmotion === "burnt_out") {
    return burnoutDialogue(npc);
  }
  if (relationship.affinity > 50) {
    return friendlyDialogue(npc, ctx);
  }
  if (relationship.affinity < -30) {
    return hostileDialogue(npc, ctx);
  }
  return neutralDialogue(npc, ctx);
}

function templateGreeting(npc: NPC, ctx: DialogueContext): DialogueResponse {
  const greetings = [
    `Hey. You're ${ctx.playerFame > 30 ? "that producer everyone's talking about" : "new around here"}, huh? I'm ${npc.name}.`,
    `Oh, ${npc.name}. Heard of you. What's up?`,
    `${npc.name}. What brings you my way?`,
  ];
  return {
    message: randomFrom(greetings),
    tone: npc.personality.sociability > 60 ? "warm" : "reserved",
    intent: "greeting",
    relationshipDelta: 2
  };
}

function burnoutDialogue(npc: NPC): DialogueResponse {
  const lines = [
    `Man, I'm running on fumes. This industry never sleeps.`,
    `Not now. I've been in the studio for 48 hours straight.`,
    `*rubs eyes* Sorry, what were you saying? Been a long week.`,
  ];
  return {
    message: randomFrom(lines),
    tone: "tired",
    intent: "venting",
    relationshipDelta: 1
  };
}

function friendlyDialogue(npc: NPC, ctx: DialogueContext): DialogueResponse {
  const lines = [
    `Good to see you! Your last track was solid. We should work together sometime.`,
    `Hey! Was just thinking about that ${ctx.playerGenre} track you showed me. Let's jam.`,
    `You're killing it lately. Keep pushing that sound.`,
  ];
  return {
    message: randomFrom(lines),
    tone: "warm",
    intent: "collaboration",
    relationshipDelta: 3
  };
}

function hostileDialogue(npc: NPC, ctx: DialogueContext): DialogueResponse {
  const lines = [
    `You? Here? Don't you have some commercial gig to play?`,
    `I don't have time for posers. Come back when you've earned some real cred.`,
    `*scoffs* Your sound is killing the scene. Do us all a favor and tune your monitors.`,
  ];
  return {
    message: randomFrom(lines),
    tone: "cold",
    intent: "conflict",
    relationshipDelta: -5
  };
}

function neutralDialogue(npc: NPC, ctx: DialogueContext): DialogueResponse {
  const lines = [
    `${ctx.playerGenre} scene has been interesting lately. What's your take?`,
    `Heard you've been making moves. Respect the hustle.`,
    `You been following the trends? ${ctx.playerGenre} is shifting. Better keep up.`,
  ];
  return {
    message: randomFrom(lines),
    tone: "neutral",
    intent: "discussion",
    relationshipDelta: 1
  };
}

function customDialogue(npc: NPC, ctx: DialogueContext): DialogueResponse {
  const responses = [
    `Interesting take. I've been thinking about that lately too.`,
    `Yeah, I see what you mean. The scene's been shifting that direction.`,
    `Huh, hadn't considered that angle. You might be onto something.`,
    `Not sure I agree, but I respect the perspective.`,
    `That's... actually a solid point. Keep talking.`,
    `*nods thoughtfully* Go on.`,
  ];
  return {
    message: randomFrom(responses),
    tone: npc.personality.ego > 60 ? "reserved" : "thoughtful",
    intent: "discussion",
    relationshipDelta: 2
  };
}
