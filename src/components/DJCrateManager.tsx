import React, { useState } from "react";
import { DJCrate, DJSet, DJPerformanceResult, MusicGenre, DJPerformanceStats } from "../types";

interface Props {
  crates: DJCrate[];
  sets: DJSet[];
  onAddCrate: (name: string, genre: string) => void;
  onStartSet: (crateId: string, venueName: string, slot: string) => void;
  onCompleteSet: (setId: string) => void;
}

export default function DJCrateManager({ crates, sets, onAddCrate, onStartSet, onCompleteSet }: Props) {
  const [newCrateName, setNewCrateName] = useState("");
  const [newCrateGenre, setNewCrateGenre] = useState("Techno");
  const [selectedCrate, setSelectedCrate] = useState<string | null>(null);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🎧</span>
        <h3 className="text-lg font-bold text-white font-orbitron">DJ Setup</h3>
        <span className="ml-auto text-xs text-gray-400">{crates.length} crates</span>
      </div>

      {/* Crates */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">Track Crates</h4>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newCrateName}
            onChange={(e) => setNewCrateName(e.target.value)}
            placeholder="Crate name..."
            className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white"
          />
          <select
            value={newCrateGenre}
            onChange={(e) => setNewCrateGenre(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white"
          >
            {["Techno", "House", "Trance", "Drum & Bass", "Dubstep", "Synthwave", "Experimental"].map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <button
            onClick={() => { if (newCrateName.trim()) { onAddCrate(newCrateName, newCrateGenre); setNewCrateName(""); } }}
            className="bg-cyan-700 hover:bg-cyan-600 text-white px-3 py-1 rounded text-xs"
          >
            + Crate
          </button>
        </div>

        <div className="space-y-1 max-h-32 overflow-y-auto">
          {crates.map(crate => (
            <div
              key={crate.id}
              className={`flex items-center gap-2 p-2 rounded text-xs cursor-pointer transition ${
                selectedCrate === crate.id ? "bg-cyan-900/30 border border-cyan-700" : "bg-gray-800 hover:bg-gray-700"
              }`}
              onClick={() => setSelectedCrate(crate.id)}
            >
              <span className="text-gray-400">📀</span>
              <span className="text-gray-200 font-medium">{crate.name}</span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-400">{crate.tracks.length} tracks</span>
              <span className="text-gray-500">{crate.bpmRange.min}-{crate.bpmRange.max} BPM</span>
            </div>
          ))}
        </div>
      </div>

      {/* DJ Sets */}
      <div>
        <h4 className="text-sm font-semibold text-gray-300 mb-2">Recent Sets</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {sets.filter(s => s.completed).slice(-5).reverse().map(set => (
            <div key={set.id} className="bg-gray-800 rounded p-2">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-gray-200 font-medium">{set.name}</span>
                  <span className="text-gray-500 ml-2">at {set.venueId}</span>
                </div>
                <span className={set.performance.overallScore > 70 ? "text-green-400" : set.performance.overallScore > 40 ? "text-yellow-400" : "text-red-400"}>
                  Score: {set.performance.overallScore}
                </span>
              </div>
              <div className="flex gap-2 mt-1 text-xs text-gray-500">
                <span>🎯 {set.performance.stats.crowdControl}% control</span>
                <span>⚡ Peak: {set.performance.crowdPeakEnergy}%</span>
                <span>👥 +{set.performance.fanChange} fans</span>
                <span>💰 ${set.performance.moneyEarned}</span>
              </div>
              {set.performance.encoreAchieved && (
                <div className="text-xs text-purple-400 mt-1">🎬 ENCORE ACHIEVED!</div>
              )}
            </div>
          ))}
          {sets.filter(s => s.completed).length === 0 && (
            <div className="text-xs text-gray-500 italic">No sets performed yet. Book a gig and start your DJ journey!</div>
          )}
        </div>
      </div>
    </div>
  );
}
