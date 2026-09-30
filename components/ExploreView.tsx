"use client";

import { useState } from "react";
import {
  Experience,
  Filters,
  ExperienceType,
  Budget,
  DareLevel,
  WeatherCondition,
} from "@/lib/types";
import {
  typeLabels,
  budgetLabels,
  dareLabels,
  vibeLabels,
} from "@/data/experiences";
import {
  MapPin,
  Wallet,
  Zap,
  Users,
  Tag,
  Sparkles,
  Flame,
  Skull,
  Coffee,
  Compass,
  Globe,
  Sun,
  CloudRain,
  Snowflake,
} from "lucide-react";
import InteractiveBackground from "@/components/InteractiveBackground";

interface Props {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  experiences: Experience[];
  surprise: Experience | null;
  isGenerating: boolean;
  hasMatches: boolean;
  liveMeta: { liveCount: number; apis: Record<string, boolean> } | null;
  loadingLive: boolean;
  onGenerate: () => void;
  onAccept: () => void;
  onSkip: () => void;
  onLogExperience: (exp: Experience) => void;
  isSaved: boolean;
  onToggleSave: (exp: Experience) => void;
  onWantToGo: (exp: Experience) => void;
}

const ALL_TYPES: ExperienceType[] = [
  "food",
  "nightlife",
  "culture",
  "adventure",
  "wellness",
];

export default function ExploreView({
  filters,
  onFiltersChange,
  surprise,
  isGenerating,
  hasMatches,
  liveMeta,
  loadingLive,
  onGenerate,
  onAccept,
  onSkip,
}: Props) {
  const [weather, setWeather] = useState<WeatherCondition>("sunny");
  const currentLevel =
    typeof filters.dareLevel === "number" ? filters.dareLevel : 2;

  const toggleType = (type: ExperienceType) => {
    const types = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    onFiltersChange({ ...filters, types });
  };

  const getTabRotation = (index: number, level: number) => {
    if (level <= 4) return "rotate-0";
    if (level === 5) {
      const angles = [
        "rotate-3",
        "-rotate-3",
        "rotate-6",
        "-rotate-4",
        "rotate-2",
      ];
      return angles[index % angles.length];
    }
    return "rotate-0";
  };

  const cardStyleByLevel: Record<number, string> = {
    1: "bg-white border-2 border-gray-300 rounded-none shadow-sm text-gray-800 font-boring rotate-0",
    2: "bg-white/90 backdrop-blur-md border-2 border-slate-200 shadow-md rounded-2xl text-slate-900 font-sans",
    3: "bg-slate-900/90 backdrop-blur-xl border-2 border-pink-500 rounded-2xl text-pink-200 font-sans shadow-neon-pink",
    4: "bg-black/90 backdrop-blur-md border-2 border-emerald-500 rounded-none text-emerald-400 font-mono rotate-0 shadow-[0_0_25px_rgba(16,185,129,0.4)]",
    5: "bg-black/95 backdrop-blur-md border-4 border-dashed border-fuchsia-500 rounded-[45px_10px_50px_15px] text-fuchsia-300 font-mono italic uppercase tracking-widest shadow-[0_0_50px_rgba(217,70,239,0.9)] animate-chaotic-shake overflow-visible p-6",
  };

  const getWeatherBadgeStyle = (level: number) => {
    switch (level) {
      case 1:
        return "bg-gray-200 border border-gray-400 text-gray-900 rounded-none";
      case 2:
        return "bg-blue-900 border border-ie-cyan text-white rounded-md";
      case 3:
        return "bg-pink-950 border border-pink-500 text-pink-200 rounded-md";
      case 4:
        return "bg-stone-900 border border-emerald-500 text-emerald-400 rounded-none";
      case 5:
        return "bg-yellow-400 border border-black text-black font-bold rounded-none";
      default:
        return "bg-white text-black";
    }
  };

  const getActiveTabStyle = (level: number) => {
    switch (level) {
      case 1:
        return "bg-gray-800 text-white rounded-none border border-gray-900 font-boring";
      case 2:
        return "bg-[#002147] text-white rounded-lg shadow-sm font-sans";
      case 3:
        return "bg-pink-500 text-black font-black rounded-lg shadow-md shadow-pink-500/50 font-sans";
      case 4:
        return "bg-emerald-500 text-black font-bold uppercase rounded-none shadow-[0_0_15px_rgba(16,185,129,0.8)] font-mono";
      case 5:
        return "bg-yellow-400 text-black font-black uppercase rounded-none border-4 border-fuchsia-600 shadow-[0_0_25px_rgba(250,204,21,1)] scale-110 tracking-widest font-mono animate-psycho-text";
      default:
        return "bg-[#002147] text-white rounded-lg";
    }
  };

  const getSliderAccent = (level: number) => {
    switch (level) {
      case 1:
        return "accent-gray-800";
      case 2:
        return "accent-[#002147]";
      case 3:
        return "accent-pink-500";
      case 4:
        return "accent-emerald-500";
      case 5:
        return "accent-yellow-400";
      default:
        return "accent-[#002147]";
    }
  };

  const activeTabClass = getActiveTabStyle(currentLevel);
  const sliderAccent = getSliderAccent(currentLevel);

  const surpriseCardStyle: Record<number, string> = {
    1: "bg-white border-2 border-gray-300 rounded-none shadow-sm text-gray-800 font-boring",
    2: "bg-white/90 backdrop-blur-md border-2 border-slate-200 shadow-md rounded-2xl text-slate-900 font-sans",
    3: "bg-slate-900/90 backdrop-blur-xl border-2 border-pink-500 rounded-2xl text-pink-200 font-sans shadow-neon-pink",
    4: "bg-black/90 backdrop-blur-md border-2 border-emerald-500 rounded-none text-emerald-300 font-mono shadow-[0_0_25px_rgba(16,185,129,0.4)]",
    5: "bg-black/95 backdrop-blur-md border-4 border-dashed border-cyan-400 rounded-[20px_50px_25px_45px] text-cyan-300 font-mono italic uppercase tracking-widest shadow-[0_0_50px_rgba(6,182,212,0.9)] animate-chaotic-shake overflow-visible p-8",
  };

  const buttonStyles: Record<number, string> = {
    1: "bg-gray-800 text-white rounded-none border border-gray-900 hover:bg-gray-900 font-boring",
    2: "bg-[#002147] text-white rounded-xl hover:bg-[#001730] shadow-sm font-sans",
    3: "bg-pink-500 text-black font-bold rounded-xl hover:bg-pink-400 font-sans shadow-md",
    4: "bg-emerald-500 text-black font-bold uppercase rounded-xl hover:bg-emerald-400 tracking-wider font-mono shadow-[0_0_15px_rgba(16,185,129,0.8)]",
    5: "bg-gradient-to-r from-yellow-400 via-fuchsia-500 to-cyan-400 text-black font-black uppercase rounded-none hover:scale-110 tracking-widest font-mono italic border-4 border-white shadow-[0_0_35px_rgba(250,204,21,1)] animate-pulse transition-transform",
  };

  const btnClass = buttonStyles[currentLevel] || buttonStyles[2];

  const contentByLevel: Record<
    number,
    { title: string; subtitle: string; btnText: string; warningText: string }
  > = {
    1: {
      title: "Gentle Curiosity",
      subtitle: "A quiet, comfortable push outside your daily routine.",
      btnText: "Surprise Me",
      warningText:
        "No experiences match your filters. Try widening your budget or distance.",
    },
    2: {
      title: "Ready for a surprise?",
      subtitle:
        "Set your filters and let Freakend pick a Madrid experience you might never choose yourself.",
      btnText: "Surprise Me",
      warningText:
        "No experiences match your filters. Try widening your budget, distance, or freak-o-meter level.",
    },
    3: {
      title: "⚡ DROP THE BEAT ⚡",
      subtitle: "Amplified nightlife and high-energy pulses across the city.",
      btnText: "Drop Surprise",
      warningText: "⚡ NO FREAKEND MATCHES FOUND. ADJUST YOUR FILTERS ⚡",
    },
    4: {
      title: "Precision Grid",
      subtitle:
        "Structured exploration parameters tuned for optimal discovery in Madrid.",
      btnText: "Generate Route",
      warningText:
        "No matches found within current parameters. Adjust range or budget filters.",
    },
    5: {
      title: ">>> ENTER THE VOID <<<",
      subtitle: "LET THE ALGORITHM DISSOLVE YOUR REALITY IN MADRID.",
      btnText: "⚡ BREAK REALITY ⚡",
      warningText:
        "⚠️ REALITY COLLISION ERROR: ZERO EXPERIENCES FOUND IN THIS DIMENSION. EXPAND YOUR PARAMETERS ⚠️",
    },
  };

  const currentContent = contentByLevel[currentLevel] || contentByLevel[2];

  return (
    <div className="relative min-h-[80vh]">
      <InteractiveBackground currentLevel={currentLevel} weather={weather} />

      <div className="relative z-10 space-y-6">
        <div className="flex justify-end">
          <div className="flex items-center gap-1 p-1 text-xs border rounded-lg bg-black/40 backdrop-blur-md border-white/10">
            <span className="text-[9px] uppercase opacity-70 px-1 text-white">
              Weather:
            </span>
            <button
              onClick={() => setWeather("sunny")}
              className={`p-1.5 transition-all ${weather === "sunny" ? getWeatherBadgeStyle(currentLevel) : "opacity-40 hover:opacity-100 text-white"}`}
              title="Sunlight"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setWeather("rain")}
              className={`p-1.5 transition-all ${weather === "rain" ? getWeatherBadgeStyle(currentLevel) : "opacity-40 hover:opacity-100 text-white"}`}
              title="Rain"
            >
              <CloudRain className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setWeather("snow")}
              className={`p-1.5 transition-all ${weather === "snow" ? getWeatherBadgeStyle(currentLevel) : "opacity-40 hover:opacity-100 text-white"}`}
              title="Snow"
            >
              <Snowflake className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setWeather("storm")}
              className={`p-1.5 transition-all ${weather === "storm" ? getWeatherBadgeStyle(currentLevel) : "opacity-40 hover:opacity-100 text-white"}`}
              title="Storm"
            >
              <Zap className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-2">
            <div
              className={`p-5 space-y-5 transition-all duration-300 ${cardStyleByLevel[currentLevel]}`}
            >
              <h3
                className={`flex items-center gap-2 text-lg font-semibold ${currentLevel === 5 ? "font-mono uppercase font-black text-cyan-300 tracking-tighter italic animate-psycho-text" : ""}`}
              >
                <Tag className="w-5 h-5 opacity-80" />
                {currentLevel === 5
                  ? ">>> CHOOSE YOUR POISON <<<"
                  : "Set your preferences"}
              </h3>

              <div>
                <label
                  className={`block mb-2 text-sm font-medium opacity-80 ${currentLevel === 5 ? "font-black tracking-widest text-fuchsia-400" : ""}`}
                >
                  {currentLevel === 5
                    ? "EXPERIENCE_MATRIX //"
                    : "Experience type"}
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_TYPES.map((type, idx) => {
                    const rotationClass = getTabRotation(idx, currentLevel);
                    const isSelected = filters.types.includes(type);

                    let unselectedClass =
                      "bg-gray-100 text-gray-600 hover:bg-gray-200";
                    if (currentLevel === 1)
                      unselectedClass =
                        "bg-gray-100 text-gray-700 rounded-none border border-gray-300 font-boring";
                    if (currentLevel === 2)
                      unselectedClass =
                        "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200";
                    if (currentLevel === 3)
                      unselectedClass =
                        "bg-slate-800/80 text-pink-200 border border-pink-500/30 hover:bg-slate-700";
                    if (currentLevel === 4)
                      unselectedClass =
                        "bg-stone-900 text-emerald-400 border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.2)]";
                    if (currentLevel === 5)
                      unselectedClass =
                        "bg-fuchsia-950/80 text-fuchsia-300 border-2 border-cyan-400 hover:bg-cyan-950 font-black tracking-tighter shadow-[0_0_15px_rgba(6,182,212,0.5)]";

                    return (
                      <button
                        key={type}
                        onClick={() => toggleType(type)}
                        className={`px-3 py-1.5 text-sm font-medium transition-all transform ${rotationClass} ${
                          isSelected ? activeTabClass : unselectedClass
                        }`}
                      >
                        {typeLabels[type]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  className={`flex items-center gap-2 mb-2 text-sm font-medium opacity-80 ${currentLevel === 5 ? "font-black tracking-widest text-cyan-300" : ""}`}
                >
                  <Wallet className="w-4 h-4 opacity-80" />
                  {currentLevel === 5
                    ? `BUDGET_DRAIN: ${budgetLabels[filters.budget]}`
                    : `Max budget: ${budgetLabels[filters.budget]}`}
                </label>
                <input
                  type="range"
                  min={1}
                  max={4}
                  step={1}
                  value={filters.budget}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      budget: Number(e.target.value) as Budget,
                    })
                  }
                  className={`w-full cursor-pointer h-3 ${currentLevel === 5 ? "bg-fuchsia-900 border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.8)]" : ""} ${sliderAccent}`}
                />
              </div>

              <div>
                <label
                  className={`flex items-center gap-2 mb-2 text-sm font-medium opacity-80 ${currentLevel === 5 ? "font-black tracking-widest text-yellow-300" : ""}`}
                >
                  <MapPin className="w-4 h-4 opacity-80" />
                  {currentLevel === 5
                    ? `RADAR_RADIUS: ${filters.maxDistance === 100 ? "INF" : `${filters.maxDistance} KM`}`
                    : `Max distance: ${filters.maxDistance === 100 ? "Any" : `${filters.maxDistance} km`}`}
                </label>
                <input
                  type="range"
                  min={1}
                  max={100}
                  step={1}
                  value={filters.maxDistance}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      maxDistance: Number(e.target.value),
                    })
                  }
                  className={`w-full cursor-pointer h-3 ${currentLevel === 5 ? "bg-fuchsia-900 border-2 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)]" : ""} ${sliderAccent}`}
                />
              </div>

              <div>
                <label
                  className={`flex items-center gap-2 mb-2 text-sm font-medium opacity-80 ${currentLevel === 5 ? "font-black tracking-widest text-fuchsia-300" : ""}`}
                >
                  <Users className="w-4 h-4 opacity-80" />
                  {currentLevel === 5 ? "VIBE_FREQUENCY //" : "Vibe"}
                </label>
                <div className="flex gap-2">
                  {(["any", "solo", "date", "group"] as const).map(
                    (vibe, idx) => {
                      const rotationClass = getTabRotation(
                        idx + 1,
                        currentLevel,
                      );
                      const isSelected = filters.vibe === vibe;

                      let unselectedClass =
                        "bg-gray-100 text-gray-600 hover:bg-gray-200";
                      if (currentLevel === 1)
                        unselectedClass =
                          "bg-gray-100 text-gray-700 border border-gray-300 font-boring";
                      if (currentLevel === 2)
                        unselectedClass =
                          "bg-slate-100 text-slate-700 border border-slate-200";
                      if (currentLevel === 3)
                        unselectedClass =
                          "bg-slate-800/80 text-pink-200 border border-pink-500/30";
                      if (currentLevel === 4)
                        unselectedClass =
                          "bg-stone-900 text-emerald-400 border border-emerald-500/50";
                      if (currentLevel === 5)
                        unselectedClass =
                          "bg-fuchsia-950/80 text-fuchsia-300 border-2 border-yellow-400 font-black tracking-tighter shadow-[0_0_12px_rgba(250,204,21,0.4)]";

                      return (
                        <button
                          key={vibe}
                          onClick={() => onFiltersChange({ ...filters, vibe })}
                          className={`flex-1 py-2 text-sm font-medium transition-all transform ${rotationClass} ${
                            isSelected ? activeTabClass : unselectedClass
                          }`}
                        >
                          {vibeLabels[vibe]}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200/20">
                <div className="flex items-center justify-between mb-2">
                  <label
                    className={`flex items-center gap-2 text-sm font-medium ${currentLevel === 5 ? "font-black text-white tracking-widest animate-psycho-text" : ""}`}
                  >
                    <Zap className="w-4 h-4 opacity-80" />{" "}
                    {currentLevel === 5
                      ? "HALLUCINATION LEVEL"
                      : "Freak-O-Meter"}
                  </label>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 ${activeTabClass}`}
                  >
                    LEVEL {currentLevel}:{" "}
                    {dareLabels[currentLevel as DareLevel]}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={currentLevel}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      dareLevel: Number(e.target.value) as DareLevel,
                    })
                  }
                  className={`w-full h-4 appearance-none cursor-pointer ${currentLevel === 5 ? "bg-gradient-to-r from-fuchsia-600 via-cyan-400 to-yellow-400 border-2 border-white shadow-[0_0_20px_rgba(217,70,239,1)]" : "bg-gray-200"} focus:outline-none ${sliderAccent}`}
                />
              </div>
            </div>

            {loadingLive && (
              <div
                className={`text-xs flex items-center gap-2 ${currentLevel === 5 ? "text-yellow-300 font-black animate-bounce" : currentLevel === 4 ? "text-emerald-400 font-mono" : "text-ie-cyan font-semibold"}`}
              >
                <Flame className="w-3 h-3" />
                {currentLevel === 5
                  ? "SEARCHING UNTREATED FREAK EVENTS..."
                  : "Searching live events..."}
              </div>
            )}

            {liveMeta && liveMeta.liveCount > 0 && (
              <div className="flex items-center gap-1 text-xs px-2.5 py-1 bg-black/40 border border-white/10 text-ie-cyan">
                <Globe className="w-3 h-3" />
                {liveMeta.liveCount} live results
              </div>
            )}
          </div>

          <div className="space-y-6 lg:col-span-3">
            <div
              className={`p-8 text-center space-y-4 transition-all duration-300 ${surpriseCardStyle[currentLevel]}`}
            >
              {!surprise ? (
                <div className="space-y-4">
                  <div
                    className={`inline-block p-4 ${currentLevel === 1 ? "bg-gray-100 rounded-none border border-gray-300" : currentLevel === 2 ? "bg-slate-100 rounded-2xl border border-slate-200" : "bg-gray-100/10 rounded-2xl"}`}
                  >
                    {currentLevel === 5 ? (
                      <Skull className="w-10 h-10 text-yellow-300 animate-spin" />
                    ) : currentLevel === 4 ? (
                      <Flame className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                    ) : currentLevel === 3 ? (
                      <Sparkles className="w-8 h-8 text-pink-400" />
                    ) : currentLevel === 1 ? (
                      <Coffee className="w-8 h-8 text-gray-700" />
                    ) : (
                      <Compass className="w-8 h-8 text-[#002147]" />
                    )}
                  </div>
                  <h3
                    className={`text-xl font-bold ${currentLevel === 5 ? "font-black tracking-tighter text-fuchsia-400 text-2xl uppercase animate-psycho-text" : currentLevel === 4 ? "text-emerald-400 tracking-widest uppercase font-black" : currentLevel === 3 ? "text-pink-300 uppercase tracking-wide font-black" : ""}`}
                  >
                    {currentContent.title}
                  </h3>
                  <p
                    className={`text-sm opacity-80 max-w-sm mx-auto ${currentLevel === 5 ? "font-mono uppercase font-bold text-yellow-300 tracking-widest" : currentLevel === 4 ? "text-emerald-300/80 font-mono text-xs uppercase" : ""}`}
                  >
                    {currentContent.subtitle}
                  </p>
                  <button
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className={`px-6 py-3 font-bold transition-all ${btnClass}`}
                  >
                    {isGenerating ? "SUMMONING..." : currentContent.btnText}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3
                    className={`text-2xl font-black ${currentLevel === 5 ? "text-yellow-400 uppercase italic tracking-tighter animate-psycho-text text-3xl" : currentLevel === 4 ? "text-emerald-300 uppercase font-mono tracking-widest" : ""}`}
                  >
                    {surprise.title}
                  </h3>
                  <p
                    className={`text-sm opacity-80 ${currentLevel === 5 ? "font-mono uppercase tracking-widest text-fuchsia-300 font-bold" : currentLevel === 4 ? "text-emerald-400/80 font-mono" : ""}`}
                  >
                    {surprise.description}
                  </p>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={onAccept}
                      className={`px-5 py-2.5 font-bold ${btnClass}`}
                    >
                      {currentLevel === 5
                        ? "CONSUME DARE"
                        : currentLevel === 4
                          ? "Confirm Route"
                          : "Accept Dare"}
                    </button>
                    <button
                      onClick={onSkip}
                      className={`px-5 py-2.5 text-sm font-semibold opacity-70 hover:opacity-100 ${currentLevel === 5 ? "text-cyan-400 uppercase tracking-widest font-black" : currentLevel === 4 ? "text-emerald-500 font-mono" : ""}`}
                    >
                      {currentLevel === 5
                        ? "FLEE"
                        : currentLevel === 4
                          ? "Dismiss"
                          : "Skip"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {!hasMatches && (
              <div
                className={`p-4 text-xs transition-all ${
                  currentLevel === 1
                    ? "bg-gray-100 border border-gray-300 text-gray-700 font-boring"
                    : currentLevel === 2
                      ? "bg-amber-50 border border-amber-300 text-amber-800 rounded-xl font-sans shadow-sm"
                      : currentLevel === 3
                        ? "bg-pink-950/80 border-2 border-pink-500 text-pink-200 rounded-xl font-sans shadow-lg"
                        : currentLevel === 4
                          ? "bg-stone-900 border-2 border-emerald-500 text-emerald-400 font-mono tracking-widest uppercase shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                          : "bg-fuchsia-950/90 border-4 border-dashed border-yellow-400 text-yellow-300 rounded-[15px_35px_15px_30px] font-mono uppercase font-black italic tracking-widest shadow-[0_0_30px_rgba(250,204,21,0.8)] animate-psycho-text"
                }`}
              >
                {currentContent.warningText}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
