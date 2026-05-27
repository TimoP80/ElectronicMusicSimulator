import React from "react";
import { SocialNetwork, GossipEvent, NPCRole } from "../types";

interface Props {
  socialNetwork: SocialNetwork;
  gossipEvents: GossipEvent[];
  onNetworkAction: (action: string, targetId?: string) => void;
}

export default function SocialNetworkPanel({ socialNetwork, gossipEvents, onNetworkAction }: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "friend": return "text-green-400";
      case "mentor": return "text-blue-400";
      case "collaborator": return "text-purple-400";
      case "rival": return "text-red-400";
      case "enemy": return "text-red-600";
      case "fan": return "text-yellow-400";
      default: return "text-gray-400";
    }
  };

  const getGossipColor = (type: string) => {
    switch (type) {
      case "positive": return "border-green-700 bg-green-900/20";
      case "negative": return "border-red-700 bg-red-900/20";
      case "rumor": return "border-yellow-700 bg-yellow-900/20";
      case "scandal": return "border-orange-700 bg-orange-900/20";
      case "achievement": return "border-blue-700 bg-blue-900/20";
      default: return "border-gray-700 bg-gray-900/20";
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🤝</span>
        <h3 className="text-lg font-bold text-white font-orbitron">Social Network</h3>
        <div className="ml-auto flex gap-3 text-xs">
          <span className="text-green-400">+{socialNetwork.connectionsCount}</span>
          <span className="text-purple-400">C{socialNetwork.collaboratorsCount}</span>
          <span className="text-red-400">R{socialNetwork.rivalsCount}</span>
        </div>
      </div>

      {/* Reputation */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-800 rounded p-2">
          <div className="text-xs text-gray-400 mb-1">Reputation</div>
          <div className="text-lg font-bold" style={{ color: socialNetwork.reputationScore > 50 ? '#4ade80' : socialNetwork.reputationScore > 0 ? '#facc15' : '#ef4444' }}>
            {socialNetwork.reputationScore > 0 ? '+' : ''}{socialNetwork.reputationScore}
          </div>
          <div className="h-1 bg-gray-700 rounded overflow-hidden mt-1">
            <div className={`h-full ${socialNetwork.reputationScore > 50 ? 'bg-green-500' : socialNetwork.reputationScore > 0 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${Math.abs(socialNetwork.reputationScore)}%` }} />
          </div>
        </div>
        <div className="bg-gray-800 rounded p-2">
          <div className="text-xs text-gray-400 mb-1">Controversy Level</div>
          <div className="text-lg font-bold text-orange-400">{socialNetwork.controversialScore}%</div>
          <div className="h-1 bg-gray-700 rounded overflow-hidden mt-1">
            <div className="h-full bg-orange-500" style={{ width: `${socialNetwork.controversialScore}%` }} />
          </div>
        </div>
      </div>

      {/* Network */}
      <h4 className="text-sm font-semibold text-gray-300 mb-2">Your Network ({socialNetwork.network.length})</h4>
      <div className="max-h-40 overflow-y-auto space-y-1 mb-4">
        {socialNetwork.network.length === 0 ? (
          <div className="text-xs text-gray-500 italic">No connections yet. Network by meeting people at gigs and through labels.</div>
        ) : (
          socialNetwork.network.slice(0, 10).map((rel) => (
            <div key={rel.npcId} className="flex items-center gap-2 bg-gray-800 rounded p-2 text-xs">
              <span className={`font-medium ${getStatusColor(rel.status)}`}>{rel.npcName}</span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-400">{rel.role}</span>
              <span className="ml-auto" style={{ color: rel.relationship > 0 ? '#4ade80' : rel.relationship < 0 ? '#ef4444' : '#9ca3af' }}>
                {rel.relationship > 0 ? '+' : ''}{rel.relationship}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Gossip Feed */}
      <h4 className="text-sm font-semibold text-gray-300 mb-2">Scene Gossip</h4>
      <div className="max-h-48 overflow-y-auto space-y-2">
        {gossipEvents.length === 0 ? (
          <div className="text-xs text-gray-500 italic">No gossip yet. The scene is quiet...</div>
        ) : (
          gossipEvents.slice(-5).reverse().map((gossip) => (
            <div key={gossip.id} className={`text-xs p-2 rounded border ${getGossipColor(gossip.type)}`}>
              <div className="flex items-start gap-1">
                <span className="text-gray-400 shrink-0">
                  {gossip.type === "positive" ? "💚" : gossip.type === "negative" ? "💔" : gossip.type === "scandal" ? "🔥" : gossip.type === "achievement" ? "🏆" : "👂"}
                </span>
                <p className="text-gray-300">{gossip.content}</p>
              </div>
              {gossip.impact !== 0 && (
                <div className={`mt-1 text-xs ${gossip.impact > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  Impact: {gossip.impact > 0 ? '+' : ''}{gossip.impact}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
