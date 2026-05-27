import { NPC, DialogueContext, DialogueResponse, WorldEvent, EventSeverity } from "../types";

// Cache for AI content to avoid redundant API calls
const aiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000;

function cacheKey(type: string, id: string): string {
  return `${type}:${id}:${Math.floor(Date.now() / CACHE_TTL)}`;
}

function getCached<T>(key: string): T | null {
  const entry = aiCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) return entry.data as T;
  aiCache.delete(key);
  return null;
}

function setCache(key: string, data: any): void {
  aiCache.set(key, { data, timestamp: Date.now() });
  if (aiCache.size > 200) {
    const oldest = aiCache.entries().next().value;
    if (oldest) aiCache.delete(oldest[0]);
  }
}

// 5% spike: AI-enhanced dialogue
export async function generateAIDialogue(
  npc: NPC,
  playerName: string,
  playerPrestige: number,
  trigger: string,
  gameWeek: number
): Promise<DialogueResponse | null> {
  if (Math.random() >= 0.05) return null;

  const key = cacheKey("dialogue", `${npc.id}_${gameWeek}`);
  const cached = getCached<DialogueResponse>(key);
  if (cached) return cached;

  try {
    const resp = await fetch("/api/npc/dialogue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        npc: { name: npc.name, role: npc.role },
        mood: npc.mood,
        personality: npc.personality,
        relationship: npc.relationships["player"] || { affinity: 0, trust: 0, historyLevel: "none", lastInteraction: 0, totalInteractions: 0 },
        playerName,
        playerPrestige,
        trigger,
        memorySummaries: npc.memory.summaries.slice(0, 3),
      }),
    });

    if (!resp.ok) return null;

    const data = await resp.json();
    if (!data.message || data.isFallback) return null;

    const response: DialogueResponse = {
      message: data.message,
      tone: npc.mood.currentEmotion === "neutral" ? "neutral" : "warm",
      intent: "ai_enhanced",
      relationshipDelta: 2,
    };

    setCache(key, response);
    return response;
  } catch {
    return null;
  }
}

// Premium event generation (interview, review, viral, controversy, festival)
export async function generatePremiumEvent(
  eventType: "interview" | "review" | "viral" | "controversy" | "festival_report",
  playerName: string,
  playerPrestige: number,
  npcs: NPC[],
  hotGenre: string,
  weekDisplay: string
): Promise<WorldEvent | null> {
  const key = cacheKey("premium_event", `${eventType}_${weekDisplay}`);
  const cached = getCached<{ title: string; description: string }>(key);
  if (cached) return buildPremiumWorldEvent(cached.title, cached.description, eventType, weekDisplay, npcs);

  try {
    const resp = await fetch("/api/npc/premium-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType,
        playerName,
        playerPrestige,
        npcs: npcs.map(n => ({ name: n.name, role: n.role, personality: n.personality })),
        hotGenre,
        weekDisplay,
      }),
    });

    if (!resp.ok) return null;

    const data = await resp.json();
    if (!data.title || !data.description || data.isFallback) return null;

    setCache(key, { title: data.title, description: data.description });
    return buildPremiumWorldEvent(data.title, data.description, eventType, weekDisplay, npcs);
  } catch {
    return null;
  }
}

function buildPremiumWorldEvent(
  title: string,
  description: string,
  eventType: string,
  weekDisplay: string,
  npcs: NPC[],
): WorldEvent {
  const severityMap: Record<string, EventSeverity> = {
    interview: "notable",
    review: "major",
    viral: "major",
    controversy: "major",
    festival_report: "notable",
  };

  const typeMap: Record<string, "interview" | "review" | "viral_moment" | "controversy" | "industry_event"> = {
    interview: "interview",
    review: "review",
    viral: "viral_moment",
    controversy: "controversy",
    festival_report: "industry_event",
  };

  return {
    id: `ai_${eventType}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: typeMap[eventType] || "industry_event",
    severity: severityMap[eventType] || "notable",
    title,
    description,
    timestamp: Date.now(),
    weekDisplay,
    participants: [title.split(" ")[0]],
    npcInvolved: [],
    impact: {
      fansDelta: Math.floor(Math.random() * 8) + 3,
      hypeDelta: Math.floor(Math.random() * 12) + 5,
      prestigeDelta: Math.floor(Math.random() * 3) + 1,
      moneyDelta: 0,
      npcRelationshipChanges: {},
      genreShift: {},
    },
  };
}
