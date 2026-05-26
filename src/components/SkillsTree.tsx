/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { GraduationCap, Award, Sliders, Volume2, UserCheck, Flame, Zap, ShieldAlert } from "lucide-react";
import { GameState, CharacterSkill } from "../types";
import { SKILLS_DB } from "../data/skills";

interface SkillsTreeProps {
  gameState: GameState;
  onLevelUpSkill: (skillId: string, pointCost: number) => void;
}

export default function SkillsTree({ gameState, onLevelUpSkill }: SkillsTreeProps) {
  
  // Categorize standard DB skills
  const productionSkills = SKILLS_DB.filter(s => s.category === "production");
  const engineeringSkills = SKILLS_DB.filter(s => s.category === "engineering");
  const performanceSkills = SKILLS_DB.filter(s => s.category === "performance");
  const marketingSkills = SKILLS_DB.filter(s => s.category === "marketing");

  const handleLearn = (skill: CharacterSkill) => {
    const currentLevel = gameState.skills[skill.id] || 0;
    if (gameState.stats.skillPoints < skill.cost) {
      alert("Requires more Skill Points! Release tracks or complete live show gigs to grow your career prestige and unlock further skill points.");
      return;
    }
    if (currentLevel >= skill.maxLevel) {
      alert("This skill category has already reached its maximum expert limit!");
      return;
    }

    onLevelUpSkill(skill.id, skill.cost);
  };

  const renderSkillCard = (skill: CharacterSkill) => {
    const currentLevel = gameState.skills[skill.id] || 0;
    const isMax = currentLevel >= skill.maxLevel;
    const hasPoints = gameState.stats.skillPoints >= skill.cost;

    return (
      <div
        key={skill.id}
        className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all bg-slate-950 ${
          isMax 
            ? "border-emerald-600/30 text-slate-100" 
            : currentLevel > 0 
            ? "border-slate-800 text-slate-300" 
            : "border-slate-900 opacity-60 text-slate-400"
        }`}
      >
        <div className="space-y-1">
          <div className="flex justify-between items-start">
            <span className="font-sans font-bold text-xs text-slate-200">{skill.name}</span>
            <span className="text-[10px] font-mono text-slate-500">
              Level {currentLevel}/{skill.maxLevel}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">{skill.description}</p>
        </div>

        {/* Purchase option */}
        <div className="mt-3.5 pt-2 border-t border-slate-900 flex justify-between items-center">
          {isMax ? (
            <span className="text-[9px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-900/30 px-2 py-0.5 rounded uppercase font-bold">
              Expert Maxed
            </span>
          ) : (
            <button
              onClick={() => handleLearn(skill)}
              disabled={!hasPoints}
              className={`text-[10px] font-mono py-1 px-3 rounded font-bold transition-all ${
                hasPoints
                  ? "bg-purple-600 hover:bg-purple-500 text-purple-50"
                  : "bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-850"
              }`}
            >
              Learn (-{skill.cost} SP)
            </button>
          )}

          <div className="flex space-x-0.5">
            {[...Array(skill.maxLevel)].map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 w-3 rounded-xs ${
                  idx < currentLevel ? "bg-purple-500" : "bg-slate-800"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Academy HUD Header showing Points */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-base font-sans font-semibold text-slate-100 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-purple-400" />
            Electronic Producer Academy
          </h2>
          <p className="text-xs text-slate-400">Upgrade your engineering, performance, and synthesizer programming levels.</p>
        </div>

        <div className="flex items-center space-x-3.5 bg-slate-950 px-4 py-2 border border-slate-800 rounded-lg">
          <Zap className="h-4.5 w-4.5 text-amber-400 animate-pulse" />
          <div className="font-mono text-xs">
            <span className="text-slate-500 block">AVAILABLE BRAINPOWER</span>
            <strong className="text-slate-100 text-sm font-black">{gameState.stats.skillPoints} Skill Points</strong>
          </div>
        </div>
      </div>

      {/* Grid containing categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Column 1: Music production loops creation */}
        <div className="space-y-3.5">
          <h3 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 pb-1.5 border-b border-slate-800">
            <Sliders className="h-4 w-4 text-purple-400" />
            Synthesizer & Loops Drafting
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {productionSkills.map(renderSkillCard)}
          </div>
        </div>

        {/* Column 2: Mixing Equalization mastering */}
        <div className="space-y-3.5">
          <h3 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 pb-1.5 border-b border-slate-800">
            <Volume2 className="h-4 w-4 text-emerald-400" />
            Hardware Signal Sound Engineering
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {engineeringSkills.map(renderSkillCard)}
          </div>
        </div>

        {/* Column 3: DJ EQ performance crowd management */}
        <div className="space-y-3.5">
          <h3 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 pb-1.5 border-b border-slate-800">
            <UserCheck className="h-4 w-4 text-sky-400" />
            Rave Booth Live Performance
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {performanceSkills.map(renderSkillCard)}
          </div>
        </div>

        {/* Column 4: Social Meme marketing VIP networking */}
        <div className="space-y-3.5">
          <h3 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 pb-1.5 border-b border-slate-800">
            <Flame className="h-4 w-4 text-rose-400" />
            Viral Marketing & Promo Hacking
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {marketingSkills.map(renderSkillCard)}
          </div>
        </div>

      </div>

      {/* Advice tip */}
      {gameState.stats.skillPoints === 0 && (
        <div className="p-3 bg-purple-500/5 border border-purple-500/10 rounded-lg flex items-center space-x-2 text-[11px] text-slate-400">
          <ShieldAlert className="h-4 w-4 text-purple-400 flex-shrink-0" />
          <span>Learn loop separation and mastering limits to instantly bump up track scores dynamically. Grow career prestige to unlock your next skill points.</span>
        </div>
      )}
    </div>
  );
}
