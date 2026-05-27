import React from "react";
import { MentalState } from "../types";

interface Props {
  mentalState: MentalState;
  onRecover: (method: string) => void;
  money: number;
}

const recoveryOptions = [
  { id: "vacation", label: "Take a Vacation", cost: 500, icon: "🌴", desc: "Reduce exhaustion & stress dramatically" },
  { id: "therapy", label: "Therapy Session", cost: 150, icon: "🛋️", desc: "Reduce anxiety & isolation" },
  { id: "studio_retreat", label: "Studio Retreat", cost: 300, icon: "🏔️", desc: "Break creative blocks" },
  { id: "collaboration", label: "Collaborate", cost: 100, icon: "🤝", desc: "Reduce isolation & gain inspiration" },
  { id: "genre_switch", label: "Switch Genres", cost: 50, icon: "🔄", desc: "Break creative blocks" },
];

export default function MentalHealthPanel({ mentalState, onRecover, money }: Props) {
  const getStateColor = (value: number, inverted = false) => {
    const v = inverted ? 100 - value : value;
    if (v < 30) return "text-green-400";
    if (v < 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getBarColor = (value: number, inverted = false) => {
    const v = inverted ? 100 - value : value;
    if (v < 30) return "bg-green-500";
    if (v < 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🧠</span>
        <h3 className="text-lg font-bold text-white font-orbitron">Mental State</h3>
        <span className={`ml-auto text-sm px-2 py-1 rounded ${
          mentalState.creativeState === "flow" ? "bg-green-900 text-green-400" :
          mentalState.creativeState === "breakthrough" ? "bg-purple-900 text-purple-400" :
          mentalState.creativeState === "blocked" ? "bg-red-900 text-red-400" :
          mentalState.creativeState === "burnt_out" ? "bg-orange-900 text-orange-400" :
          "bg-gray-800 text-gray-400"
        }`}>
          {mentalState.creativeState.replace("_", " ").toUpperCase()}
        </span>
      </div>

      {mentalState.creativeState === "breakthrough" && (
        <div className="bg-purple-900/30 border border-purple-700 rounded p-3 mb-4 text-purple-300 text-sm animate-pulse">
          💡 Creative Breakthrough! Everything is clicking! Make music now!
        </div>
      )}

      {mentalState.creativeState === "burnt_out" && (
        <div className="bg-red-900/30 border border-red-700 rounded p-3 mb-4 text-red-300 text-sm">
          🔥 You are severely burnt out! Take recovery actions immediately. Track quality is heavily reduced.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: "Exhaustion", value: mentalState.exhaustion, icon: "😫" },
          { label: "Stress", value: mentalState.stress, icon: "😰" },
          { label: "Anxiety", value: mentalState.anxiety, icon: "😬" },
          { label: "Creative Block", value: mentalState.creativeBlock, icon: "🧱" },
          { label: "Confidence", value: mentalState.confidence, icon: "💪", inverted: true },
          { label: "Ego", value: mentalState.ego, icon: "👑" },
          { label: "Overexposure", value: mentalState.overexposure, icon: "📸" },
          { label: "Isolation", value: mentalState.isolation, icon: "🏠" },
        ].map(stat => (
          <div key={stat.label} className="bg-gray-800 rounded p-2">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{stat.icon} {stat.label}</span>
              <span className={getStateColor(stat.value, stat.inverted)}>{stat.value}%</span>
            </div>
            <div className="h-1.5 bg-gray-700 rounded overflow-hidden">
              <div className={`h-full ${getBarColor(stat.value, stat.inverted)}`}
                style={{ width: `${stat.value}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Addiction Risk: <span className={
            mentalState.addictionRisk === "none" ? "text-green-400" :
            mentalState.addictionRisk === "low" ? "text-yellow-400" :
            mentalState.addictionRisk === "moderate" ? "text-orange-400" :
            mentalState.addictionRisk === "high" ? "text-red-400" : "text-red-600"
          }>{mentalState.addictionRisk.toUpperCase()}</span></span>
          <span>Breakthroughs: {mentalState.breakthroughs}</span>
        </div>
      </div>

      <h4 className="text-sm font-semibold text-gray-300 mb-2">Recovery Actions</h4>
      <div className="grid grid-cols-1 gap-2">
        {recoveryOptions.map(option => {
          const canAfford = money >= option.cost;
          return (
            <button
              key={option.id}
              onClick={() => onRecover(option.id)}
              disabled={!canAfford}
              className={`flex items-center gap-2 p-2 rounded text-left text-sm transition ${
                canAfford
                  ? "bg-gray-800 hover:bg-gray-700 text-gray-200"
                  : "bg-gray-900 text-gray-600 cursor-not-allowed"
              }`}
            >
              <span>{option.icon}</span>
              <div className="flex-1">
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-gray-500">{option.desc}</div>
              </div>
              <span className="text-xs text-gray-400">${option.cost}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
