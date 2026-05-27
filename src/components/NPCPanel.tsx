import React, { useState, useMemo } from "react";
import { NPC, NPCMood, NPCPersonality, DialogueResponse, DialogueContext, NPCRelationshipData, WorldEvent, EventSeverity } from "../types";
import { generateDialogueResponse, generateDialogueResponseWithAI, createDialogueContext, updateRelationship, addMemoryEvent, consolidateMemories } from "../utils/npcSystem";

interface Props {
  npcs: NPC[];
  playerName: string;
  playerFame: number;
  playerGenre: string;
  onUpdateNpcs: (npcs: NPC[]) => void;
  worldEvents?: WorldEvent[];
  gameWeek?: number;
}

function moodEmoji(m: NPCMood): string {
  switch (m.currentEmotion) {
    case "excited": return "🤩";
    case "angry": return "😤";
    case "burnt_out": return "😩";
    case "inspired": return "✨";
    default: return "😐";
  }
}

function moodLabel(m: NPCMood): string {
  return `${m.currentEmotion.replace("_", " ")} (E:${m.energy} B:${m.burnout} I:${m.inspiration})`;
}

function personalityBar(value: number, label: string, color: string) {
  return (
    <div key={label} className="flex items-center gap-2 text-[10px]">
      <span className="w-20 text-slate-400 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-700 rounded overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="w-6 text-right text-slate-500">{value}</span>
    </div>
  );
}

const archetypeColors: Record<string, string> = {
  techno_purist: "text-orange-400 bg-orange-900/20 border-orange-700",
  experimental: "text-purple-400 bg-purple-900/20 border-purple-700",
  commercial: "text-blue-400 bg-blue-900/20 border-blue-700",
  underground_legend: "text-red-400 bg-red-900/20 border-red-700",
  rising_star: "text-cyan-400 bg-cyan-900/20 border-cyan-700",
  mentor: "text-green-400 bg-green-900/20 border-green-700",
  rival: "text-rose-400 bg-rose-900/20 border-rose-700",
  scene_elder: "text-amber-400 bg-amber-900/20 border-amber-700",
  industry_shark: "text-yellow-400 bg-yellow-900/20 border-yellow-700",
  bedroom_producer: "text-slate-400 bg-slate-900/20 border-slate-700",
};

export default function NPCPanel({ npcs, playerName, playerFame, playerGenre, onUpdateNpcs, worldEvents = [], gameWeek = 0 }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chatLog, setChatLog] = useState<{ from: string; msg: string }[]>([]);
  const [lastResponse, setLastResponse] = useState<DialogueResponse | null>(null);
  const [customMsg, setCustomMsg] = useState("");
  const [eventTab, setEventTab] = useState<"chat" | "events">("chat");

  const selected = useMemo(() => npcs.find(n => n.id === selectedId), [npcs, selectedId]);

  const processResponse = (response: DialogueResponse, npc: NPC) => {
    setLastResponse(response);
    setChatLog(prev => [...prev, { from: npc.name, msg: response.message }]);
    let updated = { ...npc };
    updated.relationships = updateRelationship(
      updated.relationships,
      playerName,
      { affinity: response.relationshipDelta, trust: Math.abs(response.relationshipDelta) }
    );
    if (response.memoryEvent) {
      updated = addMemoryEvent(updated, response.memoryEvent);
    }
    updated.memory = consolidateMemories(updated.memory);
    const newNpcs = npcs.map(n => n.id === npc.id ? updated : n);
    onUpdateNpcs(newNpcs);
  };

  const handleInteract = (trigger: DialogueContext["trigger"]) => {
    if (!selected) return;

    // Log player action for preset buttons
    if (trigger !== "custom_message") {
      const actionLabels: Record<string, string> = {
        greeting: `👋 Greeted ${selected.name}`,
        collaboration_request: `🤝 Proposed collaboration to ${selected.name}`,
        random_chat: `💬 Started a chat with ${selected.name}`,
        conflict: `⚔️ Provoked ${selected.name}`,
        farewell: `👋 Said farewell to ${selected.name}`,
        custom_message: "",
      };
      setChatLog(prev => [...prev, { from: playerName || "You", msg: actionLabels[trigger] || trigger }]);
    }

    const ctx = createDialogueContext(
      selected,
      { fame: playerFame, genre: playerGenre, name: playerName },
      trigger
    );
    ctx.sceneState.genreTrends = {};
    ctx.sceneState.currentEvents = [];

    // Synchronous deterministic response immediately
    const immediate = generateDialogueResponse(ctx);
    processResponse(immediate, selected);

    // Async AI upgrade in background (fire-and-forget)
    generateDialogueResponseWithAI(ctx, gameWeek ?? 0).then(aiResponse => {
      if (aiResponse && aiResponse.message !== immediate.message) {
        // Replace last log entry with AI response
        setChatLog(prev => [...prev.slice(0, -1), { from: selected!.name, msg: aiResponse.message }]);
        setLastResponse(aiResponse);
        let updated = { ...selected! };
        updated.relationships = updateRelationship(
          updated.relationships,
          playerName,
          { affinity: aiResponse.relationshipDelta, trust: Math.abs(aiResponse.relationshipDelta) }
        );
        if (aiResponse.memoryEvent) {
          updated = addMemoryEvent(updated, aiResponse.memoryEvent);
        }
        updated.memory = consolidateMemories(updated.memory);
        const newNpcs = npcs.map(n => n.id === selected!.id ? updated : n);
        onUpdateNpcs(newNpcs);
      }
    });
  };

  const handleSendCustom = () => {
    if (!customMsg.trim() || !selected) return;
    setChatLog(prev => [...prev, { from: playerName, msg: customMsg.trim() }]);
    handleInteract("custom_message");
    setCustomMsg("");
  };

  const getAffinityColor = (v: number) => {
    if (v > 30) return "text-green-400";
    if (v > 0) return "text-yellow-400";
    if (v > -30) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* NPC Roster */}
      <div className="bg-[#0A0A0C] border border-[#1A1A1E] p-4 rounded-xl shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🎤</span>
          <h3 className="text-sm font-bold text-white font-orbitron">Scene NPCs</h3>
          <span className="ml-auto text-[10px] text-slate-500">{npcs.length} characters</span>
        </div>

        <div className="space-y-1 max-h-[500px] overflow-y-auto">
          {npcs.map(npc => (
            <button
              key={npc.id}
              onClick={() => { setSelectedId(npc.id); setLastResponse(null); }}
              className={`w-full text-left p-2 rounded-lg text-[11px] transition-all cursor-pointer flex items-center gap-2 ${
                selectedId === npc.id
                  ? "bg-[#1A1A1E] border border-[#00FF95]/40 text-white"
                  : "hover:bg-[#111114] text-slate-400 border border-transparent"
              }`}
            >
              <span className="text-base">{moodEmoji(npc.mood)}</span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white truncate">{npc.name}</div>
                <div className="text-[9px] text-slate-500">{npc.role.replace("_", " ")}</div>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded border ${archetypeColors[npc.archetype] || ""}`}>
                {npc.archetype.replace(/_/g, " ")}
              </span>
            </button>
          ))}
          {npcs.length === 0 && (
            <div className="text-[10px] text-slate-600 italic p-4 text-center">No NPCs in the scene yet.</div>
          )}
        </div>
      </div>

      {/* NPC Detail */}
      <div className="bg-[#0A0A0C] border border-[#1A1A1E] p-4 rounded-xl shadow-md">
        {selected ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-[#1A1A1E] pb-2">
              <span className="text-xl">{moodEmoji(selected.mood)}</span>
              <div>
                <h3 className="text-sm font-bold text-white">{selected.name}</h3>
                <span className="text-[10px] text-slate-500">{selected.role.replace("_", " ")}</span>
              </div>
              <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded border ${archetypeColors[selected.archetype] || ""}`}>
                {selected.archetype.replace(/_/g, " ")}
              </span>
            </div>

            <div className="text-[10px] text-slate-400 leading-relaxed">{selected.bio}</div>

            {/* Mood */}
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Mood</span>
              <div className="text-[11px] text-slate-300">{moodLabel(selected.mood)}</div>
            </div>

            {/* Personality */}
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Personality</span>
              <div className="space-y-0.5 mt-1">
                {personalityBar(selected.personality.openness, "Openness", "bg-cyan-500")}
                {personalityBar(selected.personality.ego, "Ego", "bg-red-500")}
                {personalityBar(selected.personality.creativity, "Creativity", "bg-purple-500")}
                {personalityBar(selected.personality.commercialism, "Commercial", "bg-blue-500")}
                {personalityBar(selected.personality.emotionality, "Emotional", "bg-pink-500")}
                {personalityBar(selected.personality.sociability, "Social", "bg-green-500")}
              </div>
            </div>

            {/* Reputation */}
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Reputation</span>
              <div className="grid grid-cols-2 gap-1 mt-1">
                <div className="text-[10px]"><span className="text-slate-500">Underground:</span> <span className="text-amber-400">{selected.reputation.underground}</span></div>
                <div className="text-[10px]"><span className="text-slate-500">Mainstream:</span> <span className="text-blue-400">{selected.reputation.mainstream}</span></div>
                <div className="text-[10px]"><span className="text-slate-500">Skill:</span> <span className="text-cyan-400">{selected.reputation.technicalSkill}</span></div>
                <div className="text-[10px]"><span className="text-slate-500">Influence:</span> <span className="text-purple-400">{selected.reputation.influence}</span></div>
              </div>
            </div>

            {/* Relationship */}
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Relationship</span>
              {selected.relationships[playerName] ? (
                <div className="grid grid-cols-3 gap-1 mt-1">
                  <div className="text-[10px]"><span className="text-slate-500">Affinity:</span> <span className={getAffinityColor(selected.relationships[playerName].affinity)}>{selected.relationships[playerName].affinity > 0 ? "+" : ""}{selected.relationships[playerName].affinity}</span></div>
                  <div className="text-[10px]"><span className="text-slate-500">Trust:</span> <span className="text-green-400">{selected.relationships[playerName].trust}%</span></div>
                  <div className="text-[10px]"><span className="text-slate-500">History:</span> <span className="text-slate-400">{selected.relationships[playerName].historyWeight}</span></div>
                </div>
              ) : (
                <div className="text-[10px] text-slate-600 italic">No relationship yet. Start a conversation.</div>
              )}
            </div>

            {/* Memory */}
            {selected.memory.summaries.length > 0 && (
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Memories</span>
                <div className="space-y-1 mt-1 max-h-24 overflow-y-auto">
                  {selected.memory.summaries.slice(0, 3).map((s, i) => (
                    <div key={i} className="text-[9px] text-slate-500 bg-[#111114] p-1.5 rounded">
                      <span className="text-slate-400 font-bold">{s.topic}:</span> {s.summary}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Goals */}
            {selected.goals.filter(g => g.active).length > 0 && (
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Goals</span>
                <div className="space-y-1 mt-1">
                  {selected.goals.filter(g => g.active).slice(0, 3).map(g => (
                    <div key={g.id} className="flex items-center gap-2 text-[10px]">
                      <span className={`w-1.5 h-1.5 rounded-full ${g.urgency > 60 ? "bg-red-500" : "bg-yellow-500"}`} />
                      <span className="text-slate-400 capitalize">{g.type.replace("_", " ")}</span>
                      <span className="ml-auto text-slate-600">{g.progress}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Genre affinities */}
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Genre Affinities</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {Object.entries(selected.genreAffinities).slice(0, 4).map(([genre, val]) => (
                  <span key={genre} className="text-[9px] bg-[#111114] text-slate-400 px-1.5 py-0.5 rounded border border-[#1A1A1E]">
                    {genre} <span className="text-cyan-400">{val}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-slate-600 text-[11px] italic">
            Select an NPC to view details
          </div>
        )}
      </div>

      {/* Chat / Interaction / Events */}
      <div className="bg-[#0A0A0C] border border-[#1A1A1E] p-4 rounded-xl shadow-md flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setEventTab("chat")}
            className={`text-[11px] px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              eventTab === "chat" ? "bg-[#00FF95]/20 text-[#00FF95] border border-[#00FF95]/40" : "text-slate-500 hover:text-white"
            }`}
          >
            💬 Chat
          </button>
          <button
            onClick={() => setEventTab("events")}
            className={`text-[11px] px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              eventTab === "events" ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "text-slate-500 hover:text-white"
            }`}
          >
            📰 Events {worldEvents.length > 0 && <span className="ml-1 text-[9px] text-amber-400">{worldEvents.length}</span>}
          </button>
        </div>

        {eventTab === "chat" ? (
          <>
            {/* Chat log */}
            <div className="flex-1 space-y-2 overflow-y-auto max-h-[300px] mb-3">
              {chatLog.length === 0 ? (
                <div className="text-[10px] text-slate-600 italic text-center py-8">
                  No conversation yet. Interact with an NPC.
                </div>
              ) : (
                chatLog.slice(-20).map((entry, i) => (
                  <div key={i} className="bg-[#111114] rounded-lg p-2">
                    <div className="text-[9px] text-slate-500 font-bold mb-0.5">{entry.from}</div>
                    <div className="text-[11px] text-slate-300">{entry.msg}</div>
                  </div>
                ))
              )}
              {lastResponse && (
                <div className="text-[9px] text-slate-600 flex gap-2">
                  <span className={lastResponse.relationshipDelta > 0 ? "text-green-500" : "text-red-500"}>
                    {lastResponse.relationshipDelta > 0 ? "+" : ""}{lastResponse.relationshipDelta} affinity
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-600 capitalize">{lastResponse.tone}</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            {selected && (
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleInteract("greeting")} className="bg-[#00FF95]/10 border border-[#00FF95]/30 text-[#00FF95] text-[10px] px-3 py-2 rounded-lg hover:bg-[#00FF95]/20 transition cursor-pointer">👋 Greet</button>
                <button onClick={() => handleInteract("collaboration_request")} className="bg-purple-900/20 border border-purple-700/30 text-purple-400 text-[10px] px-3 py-2 rounded-lg hover:bg-purple-900/30 transition cursor-pointer">🤝 Collaborate</button>
                <button onClick={() => handleInteract("random_chat")} className="bg-cyan-900/20 border border-cyan-700/30 text-cyan-400 text-[10px] px-3 py-2 rounded-lg hover:bg-cyan-900/30 transition cursor-pointer">💬 Chat</button>
                <button onClick={() => handleInteract("conflict")} className="bg-red-900/20 border border-red-700/30 text-red-400 text-[10px] px-3 py-2 rounded-lg hover:bg-red-900/30 transition cursor-pointer">⚔️ Provoke</button>
              </div>
            )}
            {/* Custom message input */}
            {selected && (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={customMsg}
                  onChange={e => setCustomMsg(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSendCustom()}
                  placeholder="Type a custom message..."
                  className="flex-1 bg-[#050507] border border-[#1A1A1E] rounded-lg px-3 py-2 text-white text-[11px] focus:border-[#00FF95] outline-none font-mono"
                />
                <button onClick={handleSendCustom}
                  className="px-3 py-2 bg-[#00FF95] text-black font-bold rounded-lg text-[10px] hover:bg-[#00FF95]/90 transition cursor-pointer shrink-0">
                  Send
                </button>
              </div>
            )}
            {!selected && (
              <div className="text-[10px] text-slate-600 italic text-center py-4">Select an NPC first</div>
            )}
          </>
        ) : (
          /* Events feed */
          <div className="flex-1 space-y-2 overflow-y-auto max-h-[400px]">
            {worldEvents.length === 0 ? (
              <div className="text-[10px] text-slate-600 italic text-center py-8">No scene events yet. Advance time to generate events.</div>
            ) : (
              worldEvents.slice(0, 30).map(evt => {
                const severityColor = evt.severity === "legendary" ? "text-purple-400 border-purple-700" : evt.severity === "major" ? "text-red-400 border-red-700" : evt.severity === "notable" ? "text-amber-400 border-amber-700" : "text-slate-400 border-slate-700";
                const typeIcon = evt.type === "feud" ? "⚔️" : evt.type === "collaboration" ? "🤝" : evt.type === "trend_shift" ? "📈" : evt.type === "controversy" ? "🔥" : evt.type === "industry_event" ? "🏢" : "📰";
                return (
                  <div key={evt.id} className={`border-l-2 ${severityColor} bg-[#111114] rounded-r-lg p-2 text-[10px]`}>
                    <div className="flex items-center gap-1 mb-0.5">
                      <span>{typeIcon}</span>
                      <span className="text-white font-bold">{evt.title}</span>
                      <span className="ml-auto text-slate-600 text-[8px]">{evt.weekDisplay}</span>
                    </div>
                    <p className="text-slate-400">{evt.description}</p>
                    <div className="flex gap-2 mt-1 text-[8px] text-slate-600">
                      {evt.impact.fansDelta !== 0 && <span className={evt.impact.fansDelta > 0 ? "text-green-600" : "text-red-600"}>{evt.impact.fansDelta > 0 ? "+" : ""}{evt.impact.fansDelta} fans</span>}
                      {evt.impact.hypeDelta !== 0 && <span className={evt.impact.hypeDelta > 0 ? "text-green-600" : "text-red-600"}>{evt.impact.hypeDelta > 0 ? "+" : ""}{evt.impact.hypeDelta} hype</span>}
                      {evt.participants.length > 0 && <span className="text-slate-600">{evt.participants.join(", ")}</span>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
