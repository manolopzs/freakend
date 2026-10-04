"use client";

import { useMemo, useState } from "react";
import {
  Experience,
  Filters,
  ExperienceType,
  Budget,
  DareLevel,
  WeatherForecast,
  WeatherCondition,
} from "@/lib/types";
import { typeLabels, budgetLabels, vibeLabels } from "@/data/experiences";
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
  Calendar,
} from "lucide-react";
import InteractiveBackground from "@/components/InteractiveBackground";
import DareAcceptedToast from "@/components/DareAcceptedToast";

interface Props {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  experiences: Experience[];
  surprise: Experience | null;
  isGenerating: boolean;
  hasMatches: boolean;
  loadingLive: boolean;
  forecast: WeatherForecast | null;
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

const toLocalDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

export default function ExploreView({
  filters,
  onFiltersChange,
  surprise,
  isGenerating,
  hasMatches,
  loadingLive,
  forecast,
  onGenerate,
  onAccept,
  onSkip,
}: Props) {
  // Next 7 days of selectable dates ("Any time" = no date filter).
  const dateOptions = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const label =
          i === 0
            ? "Today"
            : i === 1
            ? "Tomorrow"
            : d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" });
        return { value: toLocalDateStr(d), label };
      }),
    []
  );

  // Forecast only applies when a specific date is selected; "Any time" is neutral.
  const forecastDay = filters.date
    ? forecast?.days.find((d) => d.date === filters.date) ?? null
    : null;
  const activeWeather: WeatherCondition = forecastDay?.weather ?? "sunny";

  const [acceptedDare, setAcceptedDare] = useState<Experience | null>(null);
  const handleAccept = () => {
    if (!surprise) return;
    onAccept();
    setAcceptedDare(surprise);
  };

  const currentLevel = (
    typeof filters.dareLevel === "number" ? filters.dareLevel : 2
  ) as DareLevel;

  const toggleType = (type: ExperienceType | "all") => {
    if (type === "all") {
      onFiltersChange({ ...filters, types: [...ALL_TYPES] });
      return;
    }
    const types = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    onFiltersChange({ ...filters, types });
  };

  const getLevelEmojis = (level: DareLevel) => {
    switch (level) {
      case 1:
        return {
          food: "☕",
          nightlife: "🍸",
          culture: "🏛️",
          adventure: "🚶",
          wellness: "🌿",
        };
      case 2:
        return {
          food: "🍷",
          nightlife: "🍻",
          culture: "🎟️",
          adventure: "🚲",
          wellness: "🧘",
        };
      case 3:
        return {
          food: "🔥",
          nightlife: "⚡",
          culture: "🎭",
          adventure: "🧗",
          wellness: "🔮",
        };
      case 4:
        return {
          food: "🧪",
          nightlife: "🚀",
          culture: "🌌",
          adventure: "🛸",
          wellness: "🧬",
        };
      case 5:
        return {
          food: "🍄",
          nightlife: "👁️‍🗨️",
          culture: "🌀",
          adventure: "⚡",
          wellness: "🔮",
        };
      default:
        return {
          food: "🍽️",
          nightlife: "🍻",
          culture: "🎨",
          adventure: "🏔️",
          wellness: "🧘",
        };
    }
  };

  const emojis = getLevelEmojis(currentLevel);

  const cardStyleByLevel: Record<DareLevel, string> = {
    1: "bg-white border-2 border-gray-300 rounded-none shadow-sm text-gray-800 font-boring",
    2: "bg-white/90 backdrop-blur-md border-2 border-slate-200 shadow-md rounded-2xl text-slate-900 font-sans",
    3: "bg-slate-900/90 backdrop-blur-xl border-2 border-pink-500 rounded-2xl text-pink-200 font-sans shadow-neon-pink",
    4: "bg-black/90 backdrop-blur-md border-2 border-emerald-500 rounded-none text-emerald-400 font-mono shadow-[0_0_25px_rgba(16,185,129,0.4)]",
    5: "bg-black/95 backdrop-blur-md border-4 border-dashed border-fuchsia-500 rounded-[35px_15px_40px_20px] text-fuchsia-300 font-mono shadow-[0_0_60px_rgba(217,70,239,1)] animate-chaotic-shake p-6 rotate-1",
  };

  const getActiveTabStyle = (level: DareLevel) => {
    switch (level) {
      case 1:
        return "bg-gray-800 text-white rounded-none border border-gray-900 font-boring text-sm";
      case 2:
        return "bg-[#002147] text-white rounded-lg shadow-sm font-sans text-sm";
      case 3:
        return "bg-pink-500 text-black font-bold rounded-lg shadow-md shadow-pink-500/50 font-sans text-sm";
      case 4:
        return "bg-emerald-500 text-black font-bold rounded-none shadow-[0_0_15px_rgba(16,185,129,0.8)] font-mono text-sm";
      case 5:
        return "bg-fuchsia-600 text-yellow-300 font-bold rounded-none border-4 border-cyan-400 shadow-[0_0_40px_rgba(6,182,212,1)] font-mono animate-psycho-text animate-chaotic-shake text-sm";
      default:
        return "bg-[#002147] text-white rounded-lg text-sm";
    }
  };

  const getSliderAccent = (level: DareLevel) => {
    switch (level) {
      case 1:
        return "accent-gray-800 bg-gray-200";
      case 2:
        return "accent-[#002147] bg-slate-200 border-2 border-slate-400";
      case 3:
        return "accent-pink-500 bg-pink-950 border border-pink-500/40";
      case 4:
        return "accent-emerald-500 bg-stone-800 border border-emerald-500/40";
      case 5:
        return "accent-yellow-400 bg-fuchsia-950 border-2 border-cyan-400 animate-chaotic-shake";
      default:
        return "accent-[#002147]";
    }
  };

  const getSecondaryButtonStyle = (level: DareLevel) => {
    switch (level) {
      case 1:
        return "border-gray-400 text-gray-800 bg-white hover:bg-gray-100 font-semibold";
      case 2:
        return "border-slate-400 text-slate-800 bg-white hover:bg-slate-100 font-semibold";
      case 3:
        return "border-pink-500/40 text-pink-200 bg-pink-950/40 hover:bg-pink-950/60";
      case 4:
        return "border-emerald-500 text-emerald-400 bg-emerald-950/30 hover:bg-emerald-950/50 font-mono";
      case 5:
        return "border-cyan-400 text-cyan-300 bg-cyan-950/30 hover:bg-cyan-950/50 font-mono animate-chaotic-shake";
      default:
        return "border-slate-400 text-slate-800 bg-white hover:bg-slate-100 font-semibold";
    }
  };

  const activeTabClass = getActiveTabStyle(currentLevel);
  const secondaryButtonClass = getSecondaryButtonStyle(currentLevel);
  const sliderAccent = getSliderAccent(currentLevel);

  const customLevelNames: Record<DareLevel, string> = {
    1: "Tame",
    2: "IE Appropriate",
    3: "Todos Santos",
    4: "Enter the Matrix",
    5: "You Gone",
  };

  const contentByLevel: Record<
    DareLevel,
    { title: string; subtitle: string; btnText: string; warningText: string }
  > = {
    1: {
      title: "Tame Exploration",
      subtitle: "A quiet, comfortable push outside your daily routine.",
      btnText: "Surprise Me",
      warningText:
        "No experiences match your filters. Try widening your budget or distance.",
    },
    2: {
      title: "IE Appropriate",
      subtitle:
        "Structured networking and polished Madrid outings suitable for the cohort.",
      btnText: "Surprise Me",
      warningText:
        "No experiences match your filters. Try widening your budget, distance, or freak-o-meter level.",
    },
    3: {
      title: "Todos Santos Vibe",
      subtitle:
        "High energy, late nights, and vibrant social immersion across the city.",
      btnText: "Drop Surprise",
      warningText: "⚡ NO FREAKEND MATCHES FOUND. ADJUST YOUR FILTERS ⚡",
    },
    4: {
      title: "Enter the Matrix",
      subtitle:
        "Deep exploration parameters tuned for clandestine discovery in Madrid.",
      btnText: "Generate Route",
      warningText:
        "No matches found within current parameters. Adjust range or budget filters.",
    },
    5: {
      title: "You Gone",
      subtitle: "TOTAL REALITY DISSOLUTION. UNKNOWN TERRITORY AWAITS.",
      btnText: "⚡ BREAK REALITY ⚡",
      warningText:
        "⚠️ REALITY COLLISION ERROR: ZERO EXPERIENCES FOUND IN THIS DIMENSION. EXPAND YOUR PARAMETERS ⚠️",
    },
  };

  const currentContent = contentByLevel[currentLevel] || contentByLevel[2];

  return (
    <div
      className={`relative min-h-[80vh] ${currentLevel === 5 ? "animate-chaotic-shake" : ""}`}
    >
      <InteractiveBackground
        currentLevel={currentLevel}
        weather={activeWeather}
      />

      <div className="relative z-10 space-y-6">
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-2">
            {/* Filters Box */}
            <div
              className={`p-5 space-y-5 transition-all duration-300 ${cardStyleByLevel[currentLevel]}`}
            >
              <h3
                className={`flex items-center gap-2 text-sm font-semibold ${currentLevel === 5 ? "font-mono font-bold text-yellow-300 animate-psycho-text animate-chaotic-shake" : ""}`}
              >
                <Tag className="w-4 h-4 opacity-80" />
                {currentLevel === 5
                  ? "CHOOSE YOUR POISON"
                  : "Set your preferences"}
              </h3>

              {/* Date selection */}
              <div>
                <label
                  className={`block mb-2 text-sm font-medium opacity-80 ${currentLevel === 5 ? "font-bold text-fuchsia-400 animate-chaotic-shake" : ""}`}
                >
                  <Calendar className="inline w-4 h-4 mr-1 opacity-80" /> Date
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onFiltersChange({ ...filters, date: null })}
                    className={`px-3 py-1.5 text-sm font-medium transition-all ${
                      filters.date === null
                        ? activeTabClass
                        : currentLevel === 5
                          ? "bg-fuchsia-950 text-cyan-300 border-2 border-fuchsia-500 animate-chaotic-shake text-sm"
                          : currentLevel === 4
                            ? "bg-stone-900 text-emerald-400 border border-emerald-500/50 text-sm"
                            : currentLevel === 3
                              ? "bg-slate-800/80 text-pink-200 border border-pink-500/30 hover:bg-slate-700 text-sm"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300 text-sm"
                    }`}
                  >
                    Any time
                  </button>
                  {dateOptions.map((opt) => {
                    const isSelected = filters.date === opt.value;
                    const unselectedClass =
                      currentLevel === 5
                        ? "bg-fuchsia-950 text-cyan-300 border-2 border-fuchsia-500 animate-chaotic-shake text-sm"
                        : currentLevel === 4
                          ? "bg-stone-900 text-emerald-400 border border-emerald-500/50 text-sm"
                          : currentLevel === 3
                            ? "bg-slate-800/80 text-pink-200 border border-pink-500/30 hover:bg-slate-700 text-sm"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300 text-sm";
                    return (
                      <button
                        key={opt.value}
                        onClick={() => onFiltersChange({ ...filters, date: opt.value })}
                        className={`px-3 py-1.5 text-sm font-medium transition-all ${
                          isSelected ? activeTabClass : unselectedClass
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Experience Types */}
              <div>
                <label
                  className={`block mb-2 text-sm font-medium opacity-80 ${currentLevel === 5 ? "font-bold text-fuchsia-400 animate-chaotic-shake" : ""}`}
                >
                  {currentLevel === 5 ? "EXPERIENCE MATRIX" : "Experience type"}
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => toggleType("all")}
                    className={`px-3 py-1.5 text-sm font-medium transition-all ${
                      filters.types.length === ALL_TYPES.length
                        ? activeTabClass
                        : currentLevel === 5
                          ? "bg-fuchsia-950 text-cyan-300 border-2 border-fuchsia-500 animate-chaotic-shake text-sm"
                          : "bg-gray-100 text-gray-700 border border-gray-300 text-sm"
                    }`}
                  >
                    🌟 All
                  </button>
                  {ALL_TYPES.map((type) => {
                    const isSelected = filters.types.includes(type);
                    const emoji = emojis[type as keyof typeof emojis] || "✨";
                    const label = typeLabels[type];

                    const unselectedClass =
                      currentLevel === 1
                        ? "bg-gray-100 text-gray-700 border border-gray-300 font-boring text-sm"
                        : currentLevel === 2
                          ? "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 text-sm"
                          : currentLevel === 3
                            ? "bg-slate-800/80 text-pink-200 border border-pink-500/30 hover:bg-slate-700 text-sm"
                            : currentLevel === 4
                              ? "bg-stone-900 text-emerald-400 border border-emerald-500/50 text-sm"
                              : "bg-fuchsia-950/90 text-cyan-300 border-2 border-yellow-400 font-medium shadow-[0_0_20px_rgba(250,204,21,0.6)] animate-chaotic-shake text-sm";

                    return (
                      <button
                        key={type}
                        onClick={() => toggleType(type)}
                        className={`px-3 py-1.5 text-sm font-medium transition-all transform ${
                          isSelected ? activeTabClass : unselectedClass
                        }`}
                      >
                        {emoji} {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  className={`flex items-center gap-2 mb-2 text-sm font-medium opacity-80 ${currentLevel === 5 ? "font-bold text-cyan-300 animate-chaotic-shake" : ""}`}
                >
                  <Wallet className="w-4 h-4 opacity-80" />
                  {currentLevel === 5
                    ? `Budget Drain: ${budgetLabels[filters.budget]}`
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
                  className={`w-full cursor-pointer h-3 rounded-lg ${currentLevel === 5 ? "bg-black border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,1)] animate-chaotic-shake accent-yellow-400" : sliderAccent}`}
                />
              </div>

              <div>
                <label
                  className={`flex items-center gap-2 mb-2 text-sm font-medium opacity-80 ${currentLevel === 5 ? "font-bold text-yellow-300 animate-chaotic-shake" : ""}`}
                >
                  <MapPin className="w-4 h-4 opacity-80" />
                  {currentLevel === 5
                    ? `Radar Radius: ${filters.maxDistance === 100 ? "INF" : `${filters.maxDistance} KM`}`
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
                  className={`w-full cursor-pointer h-3 rounded-lg ${currentLevel === 5 ? "bg-black border-2 border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,1)] animate-chaotic-shake accent-cyan-400" : sliderAccent}`}
                />
              </div>

              <div>
                <label
                  className={`flex items-center gap-2 mb-2 text-sm font-medium opacity-80 ${currentLevel === 5 ? "font-bold text-fuchsia-300 animate-chaotic-shake" : ""}`}
                >
                  <Users className="w-4 h-4 opacity-80" />
                  {currentLevel === 5 ? "Vibe Frequency" : "Vibe"}
                </label>
                <div className="flex gap-2">
                  {(["any", "solo", "date", "group"] as const).map((vibe) => {
                    const isSelected = filters.vibe === vibe;
                    const unselectedClass =
                      currentLevel === 1
                        ? "bg-gray-100 text-gray-700 border border-gray-300 font-boring text-sm"
                        : currentLevel === 2
                          ? "bg-slate-100 text-slate-700 border border-slate-200 text-sm"
                          : currentLevel === 3
                            ? "bg-slate-800/80 text-pink-200 border border-pink-500/30 text-sm"
                            : currentLevel === 4
                              ? "bg-stone-900 text-emerald-400 border border-emerald-500/50 text-sm"
                              : "bg-fuchsia-950/90 text-cyan-300 border-2 border-yellow-400 font-medium shadow-[0_0_15px_rgba(250,204,21,0.5)] animate-chaotic-shake text-sm";

                    return (
                      <button
                        key={vibe}
                        onClick={() => onFiltersChange({ ...filters, vibe })}
                        className={`flex-1 py-2 text-sm font-medium transition-all ${
                          isSelected ? activeTabClass : unselectedClass
                        }`}
                      >
                        {vibeLabels[vibe]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200/20">
                <div className="flex items-center justify-between mb-2">
                  <label
                    className={`flex items-center gap-2 text-sm font-medium ${currentLevel === 5 ? "font-bold text-white animate-psycho-text animate-chaotic-shake" : ""}`}
                  >
                    <Zap className="w-4 h-4 opacity-80" />{" "}
                    {currentLevel === 5
                      ? "Hallucination Level"
                      : "Freak-O-Meter"}
                  </label>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 ${activeTabClass}`}
                  >
                    Level {currentLevel}: {customLevelNames[currentLevel]}
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
                  className={`w-full h-4 appearance-none cursor-pointer rounded-lg ${currentLevel === 5 ? "bg-black border-4 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,1)] animate-chaotic-shake accent-cyan-400 rotate-1" : sliderAccent}`}
                />
              </div>
            </div>

            {/* Live Weather Widget */}
            <div
              className={`p-4 flex items-center justify-between text-sm backdrop-blur-md border rounded-xl shadow-sm ${currentLevel === 3 ? "bg-slate-900/80 border-pink-500/50 text-pink-200" : currentLevel === 5 ? "bg-fuchsia-950/90 border-4 border-dashed border-cyan-400 text-cyan-300 font-mono animate-chaotic-shake" : currentLevel >= 4 ? "bg-black/80 border-emerald-500/50 text-emerald-300 font-mono" : "bg-white/80 border-slate-200 text-slate-800"}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl leading-none">{forecastDay?.icon ?? "🗓️"}</span>
                <div>
                  <p className="text-xs font-bold tracking-wider uppercase">
                    Madrid, Spain
                  </p>
                  <p className="text-xs capitalize opacity-80">
                    {filters.date
                      ? forecastDay
                        ? `${forecastDay.condition} • ${forecastDay.tempMax}° / ${forecastDay.tempMin}°`
                        : "Forecast unavailable"
                      : "Select a date for forecast"}
                  </p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-black/20 uppercase tracking-widest font-bold">
                {filters.date ? "Live forecast" : "Any time"}
              </span>
            </div>

            {loadingLive && (
              <div
                className={`text-xs flex items-center gap-2 ${currentLevel === 5 ? "text-yellow-300 font-bold animate-bounce animate-chaotic-shake" : currentLevel === 4 ? "text-emerald-400 font-mono" : "text-ie-cyan font-semibold"}`}
              >
                <Flame className="w-3 h-3" />
                {currentLevel === 5
                  ? "Searching untreated freak events..."
                  : "Searching live events..."}
              </div>
            )}

          </div>

          <div className="space-y-6 lg:col-span-3">
            <div
              className={`p-8 text-center space-y-4 transition-all duration-300 ${cardStyleByLevel[currentLevel]}`}
            >
              {!surprise ? (
                <div className="space-y-4">
                  <div
                    className={`inline-block p-4 ${currentLevel === 1 ? "bg-gray-100 rounded-none border border-gray-300" : currentLevel === 2 ? "bg-slate-100 rounded-2xl border border-slate-200" : "bg-gray-100/10 rounded-2xl"}`}
                  >
                    {currentLevel === 5 ? (
                      <Skull className="w-12 h-12 text-yellow-300 animate-spin animate-chaotic-shake" />
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
                    className={`text-lg font-bold ${currentLevel === 5 ? "font-bold text-yellow-300 uppercase animate-psycho-text animate-chaotic-shake" : currentLevel === 4 ? "text-emerald-400 tracking-widest uppercase font-bold" : currentLevel === 3 ? "text-pink-300 uppercase tracking-wide font-bold" : ""}`}
                  >
                    {currentContent.title}
                  </h3>
                  <p
                    className={`text-sm opacity-80 max-w-sm mx-auto ${currentLevel === 5 ? "font-mono font-bold text-cyan-300 animate-chaotic-shake" : currentLevel === 4 ? "text-emerald-300/80 font-mono text-xs uppercase" : ""}`}
                  >
                    {currentContent.subtitle}
                  </p>
                  <button
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className={`px-6 py-3 font-semibold transition-all ${activeTabClass}`}
                  >
                    {isGenerating ? "SUMMONING..." : currentContent.btnText}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3
                    className={`text-xl font-bold ${currentLevel === 5 ? "text-yellow-400 uppercase animate-psycho-text animate-chaotic-shake" : currentLevel === 4 ? "text-emerald-300 uppercase font-mono tracking-widest" : ""}`}
                  >
                    {surprise.title}
                  </h3>
                  <p
                    className={`text-sm opacity-80 ${currentLevel === 5 ? "font-mono text-cyan-300 font-bold animate-chaotic-shake" : currentLevel === 4 ? "text-emerald-400/80 font-mono" : ""}`}
                  >
                    {surprise.description}
                  </p>
                  <div className="space-y-3 pt-2">
                    {surprise.eventUrl && (
                      <div className="flex justify-center">
                        <a
                          href={surprise.eventUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className={`px-5 py-2.5 text-sm font-semibold border rounded-lg transition-colors ${secondaryButtonClass}`}
                        >
                          Event page
                        </a>
                      </div>
                    )}
                    <div className="flex flex-wrap justify-center gap-3">
                      <button
                        onClick={handleAccept}
                        className={`px-5 py-2.5 font-semibold ${activeTabClass}`}
                      >
                        {currentLevel === 5
                          ? "CONSUME DARE"
                          : currentLevel === 4
                            ? "Confirm Route"
                            : "Accept Dare"}
                      </button>
                      <button
                        onClick={onSkip}
                        className={`px-5 py-2.5 text-sm font-semibold opacity-70 hover:opacity-100 ${currentLevel === 5 ? "text-cyan-400 uppercase font-bold animate-chaotic-shake" : currentLevel === 4 ? "text-emerald-500 font-mono" : ""}`}
                      >
                        {currentLevel === 5
                          ? "FLEE"
                          : currentLevel === 4
                            ? "Dismiss"
                            : "Skip"}
                      </button>
                    </div>
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
                          : "bg-fuchsia-950/90 border-4 border-dashed border-yellow-400 text-yellow-300 rounded-[15px_35px_15px_30px] font-mono uppercase font-bold italic tracking-widest shadow-[0_0_30px_rgba(250,204,21,0.8)] animate-psycho-text animate-chaotic-shake"
                }`}
              >
                {currentContent.warningText}
              </div>
            )}
          </div>
        </div>
      </div>

      {acceptedDare && (
        <DareAcceptedToast
          experience={acceptedDare}
          level={currentLevel}
          onClose={() => setAcceptedDare(null)}
        />
      )}
    </div>
  );
}
