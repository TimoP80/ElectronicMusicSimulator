import {
  WESState, WESThread, WESPost, WebNode, WebNodeType, WebEdge, WebEdgeType,
  AttentionState, SearchIntent, SearchResult, SiteAuthority,
  ViralityData, ViralityState, ContentLifecycleData, LifecycleStage,
  ThreadDynamics, TrendState, NPC
} from "../types";

// ============================================
// INTERNAL HELPERS
// ============================================

let uidCounter = Date.now();
function uid(prefix: string): string {
  return `${prefix}_${++uidCounter}_${Math.random().toString(36).slice(2, 6)}`;
}

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
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

const URL_SAFE_RE = /[^a-z0-9]+/g;

// ============================================
// MODULE-LEVEL SINGLETON STATE
// ============================================

let _state: WESState | null = null;
let _edgeIndex: Map<string, WebEdge[]> = new Map();

const TOPIC_POOL = [
  "gear", "production_tips", "label_drama", "scene_politics", "releases",
  "mixing", "mastering", "live_sets", "vinyl", "software", "hardware",
  "genre_debate", "industry_news", "collaborations", "touring"
];

const SENTIMENT_POOL = [
  "excitement", "nostalgia", "backlash", "hype", "criticism", "support",
  "mockery", "admiration", "distrust", "optimism"
];

// ============================================
// PUBLIC API — STATE MANAGEMENT
// ============================================

export function getWESState(): WESState | null {
  return _state;
}

export function setWESState(state: WESState): void {
  _state = state;
  rebuildEdgeIndex();
}

function rebuildEdgeIndex(): void {
  _edgeIndex.clear();
  if (!_state) return;
  for (const edge of _state.edges) {
    const list = _edgeIndex.get(edge.from) || [];
    list.push(edge);
    _edgeIndex.set(edge.from, list);
  }
}

// ============================================
// CONTENT GRAPH ENGINE
// ============================================

export function addNode(node: Omit<WebNode, "id" | "createdAt">): WebNode {
  if (!_state) throw new Error("WES not initialized");
  const n: WebNode = { ...node, id: uid("wn"), createdAt: Date.now() };
  _state.nodes.push(n);
  _state.attention[n.id] = {
    views: 0, clicks: 0, dwellTime: 0, shares: 0, likes: 0,
    backlinks: 0, decayRate: 0.05 + Math.random() * 0.15, momentum: 1
  };
  _state.lifecycle.push({
    nodeId: n.id, stage: "creation", enteredAt: Date.now(), stageDuration: 0
  });
  return n;
}

export function addEdge(edge: Omit<WebEdge, "createdAt">): void {
  if (!_state) return;
  const e: WebEdge = { ...edge, createdAt: Date.now() };
  _state.edges.push(e);
  const list = _edgeIndex.get(e.from) || [];
  list.push(e);
  _edgeIndex.set(e.from, list);

  // Update backlinks count on target
  const targetAttn = _state.attention[edge.to];
  if (targetAttn) targetAttn.backlinks++;
}

export function findNodes(query: string): WebNode[] {
  if (!_state) return [];
  const q = query.toLowerCase();
  return _state.nodes.filter(n =>
    n.title.toLowerCase().includes(q) ||
    n.content.toLowerCase().includes(q) ||
    n.tags.some(t => t.toLowerCase().includes(q)) ||
    n.genre?.toLowerCase().includes(q)
  );
}

export function getNodesByType(type: WebNodeType): WebNode[] {
  if (!_state) return [];
  return _state.nodes.filter(n => n.type === type);
}

export function getNode(id: string): WebNode | undefined {
  if (!_state) return undefined;
  return _state.nodes.find(n => n.id === id);
}

export function getEdgesFrom(nodeId: string): WebEdge[] {
  return _edgeIndex.get(nodeId) || [];
}

export function getNodeUrl(node: WebNode): string {
  const slug = node.title.toLowerCase().replace(URL_SAFE_RE, "-");
  switch (node.type) {
    case "artist_page": return `https://${slug}.scene-artists.com`;
    case "label_site": return `https://${slug}-records.scene`;
    case "release_page":
    case "track_page": return `https://${slug}.scene-releases.com`;
    case "forum_thread": return `https://forum.scene/t/${node.id}`;
    case "news_article": return `https://electronic-scene.com/news/${node.id}`;
    default: return `https://electronic-scene.com/page/${node.id}`;
  }
}

// ============================================
// ATTENTION ECONOMY ENGINE
// ============================================

export function recordView(nodeId: string): void {
  if (!_state) return;
  const a = _state.attention[nodeId];
  if (!a) return;
  a.views++;
  a.momentum = Math.min(a.momentum + 0.05, 3);
}

export function recordClick(nodeId: string): void {
  if (!_state) return;
  const a = _state.attention[nodeId];
  if (!a) return;
  a.clicks++;
  a.dwellTime += Math.random() * 30;
  a.momentum = Math.min(a.momentum + 0.1, 3);
}

export function recordShare(nodeId: string): void {
  if (!_state) return;
  const a = _state.attention[nodeId];
  if (!a) return;
  a.shares++;
  a.momentum = Math.min(a.momentum + 0.3, 5);
}

export function recordLike(nodeId: string): void {
  if (!_state) return;
  const a = _state.attention[nodeId];
  if (!a) return;
  a.likes++;
}

function attentionScore(a: AttentionState, trendMultiplier: number): number {
  return (
    a.views * 0.2 +
    a.clicks * 0.3 +
    a.shares * 0.5 +
    a.backlinks * 0.7 +
    a.dwellTime * 0.4
  ) * a.momentum * trendMultiplier;
}

// ============================================
// SEARCH & RANKING ENGINE
// ============================================

function computeAuthority(nodeId: string): number {
  if (!_state) return 1;
  const auth = _state.authorities.find(a => a.nodeId === nodeId);
  if (!auth) return 1;
  return (auth.domainAuthority * 0.5 + auth.sceneReputation * 0.3 + auth.historicalSignificance * 0.2) / 100;
}

function computeFreshness(node: WebNode): number {
  const ageHrs = (Date.now() - node.createdAt) / (1000 * 60 * 60);
  return Math.max(0.1, 1 - ageHrs / 720); // fresh for ~30 days
}

function computeEngagement(nodeId: string): number {
  if (!_state) return 0.5;
  const a = _state.attention[nodeId];
  if (!a) return 0.5;
  const total = a.views + a.clicks + a.shares + a.likes;
  return Math.min(1, total / 1000);
}

function computeRelevance(node: WebNode, query: string): number {
  const q = query.toLowerCase();
  let score = 0;
  if (node.title.toLowerCase().includes(q)) score += 0.5;
  if (node.content.toLowerCase().includes(q)) score += 0.2;
  if (node.tags.some(t => t.toLowerCase().includes(q))) score += 0.2;
  if (node.genre?.toLowerCase().includes(q)) score += 0.1;
  return Math.min(1, score);
}

function getTrendBoost(node: WebNode): number {
  if (!_state) return 1;
  if (node.genre && _state.trends.genres[node.genre]) {
    return 1 + _state.trends.genres[node.genre] / 100;
  }
  for (const tag of node.tags) {
    if (_state.trends.topics[tag]) return 1 + _state.trends.topics[tag] / 200;
  }
  return 1;
}

function getTrendMultiplier(): number {
  if (!_state) return 1;
  const avg = Object.values(_state.trends.genres).reduce((s, v) => s + v, 0) /
              Math.max(1, Object.keys(_state.trends.genres).length);
  return 1 + avg / 100;
}

export function search(
  query: string,
  intent: SearchIntent = "general",
  limit = 20
): SearchResult[] {
  if (!_state) return [];
  const candidates = findNodes(query);
  const scored: SearchResult[] = candidates.map(node => {
    const rel = computeRelevance(node, query);
    const auth = computeAuthority(node.id);
    const eng = computeEngagement(node.id);
    const fresh = computeFreshness(node);
    const trend = getTrendBoost(node);
    const base = rel * auth * eng * fresh * trend;

    // Intent-based weighting
    let score = base;
    switch (intent) {
      case "news": score *= node.type === "news_article" ? 3 : 0.5; break;
      case "music": score *= (node.type === "release_page" || node.type === "track_page") ? 3 : (node.type === "artist_page" ? 2 : 0.5); break;
      case "forum": score *= node.type === "forum_thread" || node.type === "forum_post" ? 3 : 0.3; break;
      case "artist": score *= node.type === "artist_page" ? 3 : 0.4; break;
      case "label": score *= node.type === "label_site" ? 3 : 0.4; break;
      case "gossip": score *= (node.tags.includes("drama") || node.tags.includes("controversy")) ? 3 : 0.3; break;
      case "track_releases": score *= node.type === "release_page" || node.type === "track_page" ? 3 : 0.3; break;
    }

    return { node, score, relevance: rel, authority: auth, engagement: eng, freshness: fresh, trendBoost: trend };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

// ============================================
// FORUM / THREAD SYSTEM
// ============================================

export function createThread(
  title: string,
  topic: string,
  authorId: string,
  initialPost?: string
): WESThread | null {
  if (!_state) return null;
  const thread: WESThread = {
    id: uid("thr"),
    title,
    topic,
    posts: [],
    dynamics: { toxicity: Math.random() * 0.3, engagement: 1, polarization: Math.random() * 0.2 },
    createdAt: Date.now(),
    authorId,
  };
  if (initialPost) {
    thread.posts.push({
      id: uid("pst"), authorId, content: initialPost, timestamp: Date.now(), likes: 0
    });
  }
  _state.threads.push(thread);

  // Also add as web node
  addNode({
    type: "forum_thread", title, content: initialPost || "",
    url: `https://forum.scene/t/${thread.id}`,
    tags: [topic, "forum"], genre: undefined, authorId, parentId: undefined,
    metadata: { threadId: thread.id }
  });

  return thread;
}

export function addPostToThread(threadId: string, content: string, authorId: string): WESPost | null {
  if (!_state) return null;
  const thread = _state.threads.find(t => t.id === threadId);
  if (!thread) return null;
  const post: WESPost = { id: uid("pst"), authorId, content, timestamp: Date.now(), likes: 0 };
  thread.posts.push(post);

  // Evolve thread dynamics
  const toxDelta = (Math.random() - 0.5) * 0.1;
  thread.dynamics.toxicity = clamp(thread.dynamics.toxicity + toxDelta, 0, 1);
  thread.dynamics.engagement = clamp(thread.dynamics.engagement + 0.05, 0, 1);
  if (toxDelta > 0.05) {
    thread.dynamics.polarization = clamp(thread.dynamics.polarization + 0.03, 0, 1);
  }

  return post;
}

export function simulateThreadActivity(): string[] {
  if (!_state) return [];
  const events: string[] = [];
  for (const thread of _state.threads) {
    if (Math.random() < 0.3) {
      thread.dynamics.engagement = clamp(thread.dynamics.engagement + Math.random() * 0.1, 0, 1);

      // Possible post from a random NPC
      if (Math.random() < thread.dynamics.engagement * 0.2) {
        events.push(`New activity in "${thread.title}"`);
      }

      // Toxicity can escalate
      if (thread.dynamics.toxicity > 0.7 && Math.random() < 0.2) {
        thread.dynamics.polarization = clamp(thread.dynamics.polarization + 0.1, 0, 1);
        events.push(`"${thread.title}" is becoming polarized`);
      }
    }
  }
  return events;
}

// ============================================
// VIRALITY ENGINE
// ============================================

function initVirality(nodeId: string): void {
  if (!_state) return;
  if (_state.virality[nodeId]) return;
  _state.virality[nodeId] = {
    state: "dead", score: 0, amplificationFactor: 0.5 + Math.random(),
    networkDensity: Math.random(), influencerBoost: 0,
    emotionalIntensity: Math.random(), noveltyFactor: Math.random(), peakedAt: 0
  };
}

export function getVirality(nodeId: string): ViralityData | undefined {
  if (!_state) return undefined;
  return _state.virality[nodeId];
}

export function spreadVirality(): string[] {
  if (!_state) return [];
  const events: string[] = [];

  for (const [nodeId, v] of Object.entries(_state.virality)) {
    const attn = _state.attention[nodeId];
    if (!attn) continue;

    // Compute virality score
    v.score = attn.shares * v.amplificationFactor * v.networkDensity
      * (1 + v.influencerBoost) * (1 + v.emotionalIntensity) * (1 + v.noveltyFactor);

    // State machine
    switch (v.state) {
      case "dead":
        if (v.score > 10 && attn.shares > 3) {
          v.state = "gaining";
          events.push(`Content ${nodeId.slice(0, 8)} is gaining traction`);
        }
        break;
      case "gaining":
        if (v.score > 50) {
          v.state = "viral";
          v.influencerBoost = clamp(v.influencerBoost + 0.3);
          v.peakedAt = Date.now();
          events.push(`🔥 Content ${nodeId.slice(0, 8)} is going viral!`);
        }
        if (attn.shares === 0) v.state = "dead";
        break;
      case "viral":
        if (v.score > 200 || v.influencerBoost > 1) {
          v.state = "peak";
          events.push(`⚡ Content ${nodeId.slice(0, 8)} hit peak virality!`);
        }
        v.influencerBoost = clamp(v.influencerBoost - 0.05);
        break;
      case "peak":
        if (v.score < 100 || (Date.now() - v.peakedAt) > 120000) {
          v.state = "declining";
        }
        break;
      case "declining":
        if (v.score < 10 || (Date.now() - v.peakedAt) > 300000) {
          v.state = "forgotten";
        }
        break;
    }

    // Momentum feeds back into attention
    if (v.state === "viral" || v.state === "peak") {
      attn.momentum = Math.min(attn.momentum + 0.2, 5);
      attn.views += Math.floor(Math.random() * 10);
    }
  }

  return events;
}

export function triggerViralAttempt(nodeId: string, influencerNpcName?: string): boolean {
  if (!_state) return false;
  initVirality(nodeId);
  const v = _state.virality[nodeId];
  if (!v) return false;

  v.amplificationFactor = Math.min(v.amplificationFactor + 0.5, 3);
  if (influencerNpcName) {
    v.influencerBoost = Math.min(v.influencerBoost + 0.8, 3);
  }
  v.emotionalIntensity = Math.min(v.emotionalIntensity + 0.4, 1);
  v.noveltyFactor = Math.min(v.noveltyFactor + 0.3, 1);

  // Boost shares to trigger gaining state
  const attn = _state.attention[nodeId];
  if (attn) attn.shares += Math.floor(Math.random() * 5) + 2;

  if (v.state === "dead") v.state = "gaining";
  return true;
}

// ============================================
// TREND SYSTEM
// ============================================

export function recomputeTrends(hotGenre: string): string[] {
  if (!_state) return [];
  const events: string[] = [];

  // Decay all genre trends
  for (const genre of Object.keys(_state.trends.genres)) {
    _state.trends.genres[genre] = clamp(_state.trends.genres[genre] - Math.random() * 5, -50, 100);
  }

  // Boost hot genre
  _state.trends.genres[hotGenre] = clamp(
    (_state.trends.genres[hotGenre] || 0) + Math.random() * 10 + 5, -50, 100
  );

  // Random topic drift
  if (Math.random() < 0.3) {
    const topic = randomFrom(TOPIC_POOL);
    _state.trends.topics[topic] = (_state.trends.topics[topic] || 0) + Math.random() * 15 + 5;
    events.push(`Topic "${topic}" is trending`);
  }

  // Decay topics
  for (const topic of Object.keys(_state.trends.topics)) {
    _state.trends.topics[topic] = clamp(
      (_state.trends.topics[topic] || 0) - Math.random() * 10, 0, 100
    );
    if (_state.trends.topics[topic] <= 0) delete _state.trends.topics[topic];
  }

  // Random sentiment shifts
  if (Math.random() < 0.4) {
    const sentiment = randomFrom(SENTIMENT_POOL);
    _state.trends.sentiments[sentiment] = (_state.trends.sentiments[sentiment] || 0) + Math.random() * 10 + 5;
    events.push(`Sentiment "${sentiment}" is rising`);
  }

  return events;
}

export function getTrendState(): TrendState {
  if (!_state) return { genres: {}, topics: {}, sentiments: {} };
  return { ..._state.trends };
}

// ============================================
// CONTENT LIFECYCLE
// ============================================

export function updateLifecycles(): string[] {
  if (!_state) return [];
  const events: string[] = [];
  const now = Date.now();

  for (const lc of _state.lifecycle) {
    lc.stageDuration = now - lc.enteredAt;

    switch (lc.stage) {
      case "creation":
        if (lc.stageDuration > 60000) { lc.stage = "discovery"; events.push(`Content entered discovery phase`); }
        break;
      case "discovery":
        if (lc.stageDuration > 300000) { lc.stage = "growth"; }
        // Can go viral from discovery
        if (Math.random() < 0.05) { lc.stage = "viral_spike"; events.push(`⚡ Content unexpectedly going viral!`); }
        break;
      case "growth":
        if (lc.stageDuration > 600000) { lc.stage = "saturation"; }
        break;
      case "viral_spike":
        if (lc.stageDuration > 180000) { lc.stage = "saturation"; }
        break;
      case "saturation":
        if (lc.stageDuration > 1200000) { lc.stage = "decay"; }
        break;
      case "decay":
        if (lc.stageDuration > 2400000) { lc.stage = "archive"; }
        break;
    }
  }
  return events;
}

// ============================================
// NPC WEB BEHAVIOR
// ============================================

export function simulateNPCPost(npc: NPC, npcs: NPC[]): string | null {
  if (!_state) return null;

  const postFreq = npc.personality.sociability / 100;
  if (Math.random() > postFreq) return null;

  const controversyChance = npc.personality.ego / 100;
  const isControversial = Math.random() < controversyChance * 0.3;
  const isPositive = Math.random() < 0.6;

  // Pick a target
  const target = npcs.filter(n => n.id !== npc.id && Math.random() < 0.3);
  const targetName = target.length > 0 ? target[0].name : "the scene";

  if (isControversial) {
    const posts = [
      `${npc.name} called out ${targetName} for selling out.`,
      `${npc.name} sparked debate about the direction of the scene.`,
      `${npc.name} leaked an unreleased track rumor.`,
      `${npc.name} threw shade at ${targetName} in a forum post.`,
    ];
    const text = randomFrom(posts);
    const thread = createThread(
      `${npc.name}'s hot take`,
      "drama",
      npc.id,
      text
    );
    if (thread) {
      triggerViralAttempt(thread.id, npc.name);
    }
    return text;
  }

  if (isPositive) {
    const posts = [
      `${npc.name} posted a new studio snippet.`,
      `${npc.name} shared production tips on the forum.`,
      `${npc.name} endorsed ${targetName}'s latest track.`,
      `${npc.name} wrote a blog post about their creative process.`,
    ];
    const text = randomFrom(posts);
    addNode({
      type: "blog_post", title: `${npc.name}'s update`,
      content: text, url: `https://${npc.name.toLowerCase().replace(URL_SAFE_RE, "-")}.scene-blog.com`,
      tags: ["blog", npc.role || "producer"], genre: undefined, authorId: npc.id, parentId: undefined,
      metadata: {}
    });
    return text;
  }

  return null;
}

export function simulateAllNPCPosts(npcs: NPC[]): string[] {
  const events: string[] = [];
  for (const npc of npcs) {
    const result = simulateNPCPost(npc, npcs);
    if (result) events.push(result);
  }
  return events;
}

// ============================================
// SEEDING — Initialize from game state
// ============================================

export function seedWebEcosystem(
  npcs: NPC[],
  hotGenre: string,
  playerName: string,
  existingState?: WESState
): WESState {
  if (existingState) {
    _state = existingState;
    rebuildEdgeIndex();
    return _state;
  }

  const state: WESState = {
    nodes: [],
    edges: [],
    attention: {},
    authorities: [],
    virality: {},
    trends: {
      genres: { [hotGenre]: 30 },
      topics: { "new_releases": 20, "production": 15 },
      sentiments: { "excitement": 15, "hype": 10 }
    },
    threads: [],
    lifecycle: [],
    tick: 0
  };

  _state = state;

  // Create artist pages
  for (const npc of npcs) {
    const topGenre = Object.entries(npc.genreAffinities)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || hotGenre;
    const fameScore = npc.reputation.influence;

    const node = addNode({
      type: "artist_page",
      title: npc.name,
      content: `${npc.name} is a ${npc.role || "producer"} in the electronic music scene.`,
      url: `https://${npc.name.toLowerCase().replace(URL_SAFE_RE, "-")}.scene-artists.com`,
      tags: ["artist", npc.role || "producer", npc.archetype],
      genre: topGenre,
      authorId: npc.id,
      parentId: undefined,
      metadata: { fame: fameScore, ego: npc.personality.ego }
    });

    // Set initial attention proportional to influence
    if (node) {
      state.attention[node.id].views = Math.floor(fameScore * 10);
      state.attention[node.id].likes = Math.floor(fameScore * 3);

      // Authority scales with influence
      state.authorities.push({
        nodeId: node.id,
        domainAuthority: clamp(fameScore * 0.5, 10, 90),
        sceneReputation: clamp(fameScore * 0.3 + npc.personality.creativity * 0.2, 10, 90),
        historicalSignificance: Math.floor(Math.random() * 30)
      });
    }
  }

  // Set links between NPCs based on relationships
  for (const npc of npcs) {
    for (const [targetId, rel] of Object.entries(npc.relationships)) {
      const targetNpc = npcs.find(n => n.id === targetId);
      if (!targetNpc) continue;
      const fromNode = state.nodes.find(n => n.authorId === npc.id);
      const toNode = state.nodes.find(n => n.authorId === targetNpc.id);
      if (fromNode && toNode && Math.abs(rel.affinity) > 10) {
        addEdge({
          from: fromNode.id, to: toNode.id,
          type: rel.affinity > 0 ? "reference" : "mention",
          weight: Math.abs(rel.affinity) / 100
        });
      }
    }
  }

  // Create initial forum threads
  const threadTopics = [
    { title: "Best hardware for techno?", topic: "gear", post: "What's everyone using for their studio setup?" },
    { title: `${hotGenre} is dead?`, topic: "genre_debate", post: `Hot take: ${hotGenre} has been going downhill. Thoughts?` },
    { title: "Underground scene recommendations", topic: "releases", post: "Drop your latest discoveries here." },
    { title: "Label submission tips", topic: "industry_news", post: "Anyone have experience submitting demos?" },
  ];
  for (const t of threadTopics) {
    const author = randomFrom(npcs);
    createThread(t.title, t.topic, author?.id || "system", t.post);
  }

  rebuildEdgeIndex();
  return state;
}

// ============================================
// MAIN WEB TICK
// ============================================

export interface WebTickInput {
  npcs: NPC[];
  hotGenre: string;
  playerName: string;
}

export interface WebTickOutput {
  newContent: string[];
  viralEvents: string[];
  trendEvents: string[];
  forumEvents: string[];
  lifecycleEvents: string[];
  npcPostEvents: string[];
}

export function webTick(input: WebTickInput): WebTickOutput {
  if (!_state) {
    seedWebEcosystem(input.npcs, input.hotGenre, input.playerName);
  }

  _state!.tick++;

  const decayEvents = updateAttentionDecay();
  const viralEvents = spreadVirality();
  const trendEvents = recomputeTrends(input.hotGenre);
  const forumEvents = simulateThreadActivity();
  const lifecycleEvents = updateLifecycles();
  const npcPostEvents = simulateAllNPCPosts(input.npcs);

  return {
    newContent: [],
    viralEvents,
    trendEvents,
    forumEvents,
    lifecycleEvents,
    npcPostEvents,
  };
}

export function updateAttentionDecay(): string[] {
  if (!_state) return [];
  const events: string[] = [];
  for (const [id, a] of Object.entries(_state.attention)) {
    a.views = Math.max(0, a.views - Math.floor(a.views * a.decayRate * 0.01));
    a.momentum = Math.max(0.1, a.momentum - a.decayRate * 0.02);
    a.dwellTime = Math.max(0, a.dwellTime - a.decayRate * 0.5);
    if (a.momentum < 0.5 && a.views > 100 && Math.random() < 0.05) {
      a.momentum = 1 + Math.random(); // random resurgence
      events.push(`Resurgence: content ${id.slice(0, 8)} is being rediscovered`);
    }
  }
  return events;
}
