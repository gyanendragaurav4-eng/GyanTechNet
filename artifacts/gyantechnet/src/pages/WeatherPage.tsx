import { useState } from "react";
import {
  FiCloud, FiSearch, FiMapPin, FiWind, FiDroplet, FiEye, FiZap, FiRefreshCw,
} from "react-icons/fi";
import { cn } from "@/lib/utils";

const CITIES = ["Bihar Sharif","Delhi","Mumbai","Bangalore","Kolkata","Chennai","Hyderabad","Pune","Jaipur","London","New York","Tokyo","Dubai","Singapore","Sydney"];

const MOCK_WEATHER: Record<string, {
  temp: number; feels: number; desc: string; emoji: string;
  humidity: number; wind: number; visibility: number; uvIndex: number;
  high: number; low: number; aqi: number;
  forecast: { day: string; emoji: string; high: number; low: number; desc: string }[];
  hourly: { time: string; emoji: string; temp: number }[];
}> = {
  "Bihar Sharif": { temp:31, feels:36, desc:"Partly Cloudy", emoji:"⛅", humidity:68, wind:14, visibility:8, uvIndex:7, high:34, low:24, aqi:72, forecast:[{day:"Mon",emoji:"🌤️",high:34,low:24,desc:"Partly Cloudy"},{day:"Tue",emoji:"🌧️",high:29,low:21,desc:"Light Rain"},{day:"Wed",emoji:"⛈️",high:27,low:20,desc:"Thunderstorm"},{day:"Thu",emoji:"🌤️",high:31,low:23,desc:"Partly Cloudy"},{day:"Fri",emoji:"☀️",high:33,low:24,desc:"Sunny"},{day:"Sat",emoji:"☀️",high:35,low:25,desc:"Clear"},{day:"Sun",emoji:"⛅",high:32,low:23,desc:"Partly Cloudy"}], hourly:[{time:"Now",emoji:"⛅",temp:31},{time:"2PM",emoji:"⛅",temp:33},{time:"4PM",emoji:"🌤️",temp:34},{time:"6PM",emoji:"🌤️",temp:32},{time:"8PM",emoji:"🌙",temp:29},{time:"10PM",emoji:"🌙",temp:27},{time:"12AM",emoji:"🌙",temp:25}] },
  "Delhi": { temp:38, feels:43, desc:"Hazy Sunshine", emoji:"🌅", humidity:45, wind:18, visibility:6, uvIndex:9, high:40, low:28, aqi:156, forecast:[{day:"Mon",emoji:"☀️",high:40,low:28,desc:"Sunny"},{day:"Tue",emoji:"🌤️",high:38,low:27,desc:"Hazy"},{day:"Wed",emoji:"⛅",high:35,low:26,desc:"Partly Cloudy"},{day:"Thu",emoji:"🌧️",high:32,low:24,desc:"Rain"},{day:"Fri",emoji:"🌧️",high:30,low:22,desc:"Rainy"},{day:"Sat",emoji:"⛅",high:33,low:23,desc:"Partly Cloudy"},{day:"Sun",emoji:"☀️",high:36,low:25,desc:"Sunny"}], hourly:[{time:"Now",emoji:"🌅",temp:38},{time:"2PM",emoji:"☀️",temp:40},{time:"4PM",emoji:"☀️",temp:39},{time:"6PM",emoji:"🌤️",temp:36},{time:"8PM",emoji:"🌙",temp:32},{time:"10PM",emoji:"🌙",temp:30},{time:"12AM",emoji:"🌙",temp:28}] },
  "Mumbai": { temp:28, feels:35, desc:"Humid & Cloudy", emoji:"🌧️", humidity:89, wind:22, visibility:5, uvIndex:5, high:30, low:25, aqi:64, forecast:[{day:"Mon",emoji:"🌧️",high:30,low:25,desc:"Rain"},{day:"Tue",emoji:"⛈️",high:28,low:24,desc:"Heavy Rain"},{day:"Wed",emoji:"🌧️",high:29,low:25,desc:"Rain"},{day:"Thu",emoji:"⛅",high:30,low:25,desc:"Partly Cloudy"},{day:"Fri",emoji:"⛅",high:31,low:25,desc:"Partly Cloudy"},{day:"Sat",emoji:"🌧️",high:29,low:24,desc:"Rain"},{day:"Sun",emoji:"⛈️",high:27,low:23,desc:"Thunderstorm"}], hourly:[{time:"Now",emoji:"🌧️",temp:28},{time:"2PM",emoji:"🌧️",temp:29},{time:"4PM",emoji:"⛈️",temp:27},{time:"6PM",emoji:"🌧️",temp:26},{time:"8PM",emoji:"🌧️",temp:25},{time:"10PM",emoji:"⛅",temp:25},{time:"12AM",emoji:"🌙",temp:24}] },
  "London": { temp:14, feels:11, desc:"Overcast", emoji:"🌫️", humidity:82, wind:28, visibility:7, uvIndex:2, high:16, low:10, aqi:22, forecast:[{day:"Mon",emoji:"🌫️",high:16,low:10,desc:"Overcast"},{day:"Tue",emoji:"🌧️",high:14,low:9,desc:"Rain"},{day:"Wed",emoji:"🌧️",high:13,low:8,desc:"Rain"},{day:"Thu",emoji:"⛅",high:15,low:9,desc:"Partly Cloudy"},{day:"Fri",emoji:"🌤️",high:17,low:11,desc:"Mostly Sunny"},{day:"Sat",emoji:"☀️",high:18,low:11,desc:"Sunny"},{day:"Sun",emoji:"⛅",high:16,low:10,desc:"Partly Cloudy"}], hourly:[{time:"Now",emoji:"🌫️",temp:14},{time:"2PM",emoji:"⛅",temp:16},{time:"4PM",emoji:"🌫️",temp:15},{time:"6PM",emoji:"🌧️",temp:13},{time:"8PM",emoji:"🌧️",temp:12},{time:"10PM",emoji:"🌙",temp:11},{time:"12AM",emoji:"🌙",temp:10}] },
};

const DEFAULT = MOCK_WEATHER["Bihar Sharif"];

const AQI_LEVELS = [
  { max:50,  label:"Good",       color:"text-emerald-400", bg:"bg-emerald-500/15" },
  { max:100, label:"Moderate",   color:"text-amber-400",   bg:"bg-amber-500/15" },
  { max:150, label:"Unhealthy (Sensitive)", color:"text-orange-400", bg:"bg-orange-500/15" },
  { max:200, label:"Unhealthy",  color:"text-red-400",     bg:"bg-red-500/15" },
  { max:999, label:"Hazardous",  color:"text-purple-400",  bg:"bg-purple-500/15" },
];

function aqiInfo(aqi: number) {
  return AQI_LEVELS.find(l => aqi <= l.max) || AQI_LEVELS[AQI_LEVELS.length - 1];
}

export default function WeatherPage() {
  const [search, setSearch] = useState("Bihar Sharif");
  const [unit, setUnit] = useState<"C"|"F">("C");
  const [aiInsight, setAiInsight] = useState<string|null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const w = MOCK_WEATHER[search] || DEFAULT;
  const convert = (c: number) => unit === "C" ? c : Math.round(c * 9/5 + 32);
  const unitLabel = `°${unit}`;

  const getAiInsight = async () => {
    setAiLoading(true); setAiInsight(null);
    try {
      const res = await fetch("/api/chat", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          messages:[{ role:"user", content:`Weather in ${search}: ${w.temp}°C, ${w.desc}, humidity ${w.humidity}%, wind ${w.wind} km/h, AQI ${w.aqi}. Give 3-4 short practical tips for today (what to wear, outdoor activities, health advice, commute tips). Keep it concise.` }],
          mode:"Normal", model:"openai/gpt-4o-mini",
        }),
      });
      const data = await res.json();
      setAiInsight(data.content || "");
    } catch { setAiInsight("Could not get AI insight."); }
    setAiLoading(false);
  };

  const bgGradient = w.emoji.includes("🌧️") || w.emoji.includes("⛈️")
    ? "from-slate-800/40 to-blue-900/30"
    : w.emoji.includes("☀️") || w.emoji.includes("🌅")
    ? "from-amber-800/20 to-orange-900/15"
    : "from-indigo-900/30 to-blue-900/20";

  const aqiData = aqiInfo(w.aqi);

  return (
    <div className="h-full overflow-y-auto no-scrollbar bg-[#06060f] p-4">
      <div className="max-w-3xl mx-auto">

        {/* Search */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search city..."
              className="w-full bg-[#0d0d1e] border border-white/[0.09] rounded-2xl pl-10 pr-4 py-3 text-white text-[14px] outline-none placeholder:text-white/20 focus:border-blue-500/40 transition-all" />
          </div>
          <div className="flex items-center bg-white/[0.05] border border-white/[0.08] rounded-xl p-1">
            {(["C","F"] as const).map(u => (
              <button key={u} onClick={() => setUnit(u)}
                className={cn("w-9 h-9 rounded-lg text-[12px] font-bold transition-all",
                  unit === u ? "bg-primary text-white shadow" : "text-white/40 hover:text-white")}>
                °{u}
              </button>
            ))}
          </div>
        </div>

        {/* Quick cities */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto no-scrollbar">
          {CITIES.slice(0, 10).map(city => (
            <button key={city} onClick={() => setSearch(city)}
              className={cn("shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold transition-all border",
                search === city ? "bg-blue-500/20 text-blue-300 border-blue-500/25" : "text-white/35 border-white/[0.07] hover:text-white bg-white/[0.03]")}>
              {city}
            </button>
          ))}
        </div>

        {/* Main card */}
        <div className={cn("rounded-3xl p-6 mb-4 relative overflow-hidden border border-white/[0.08] bg-gradient-to-br", bgGradient)}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FiMapPin className="w-4 h-4 text-white/50" />
                  <span className="text-white/60 text-[14px] font-medium">{search}</span>
                </div>
                <div className="text-[72px] font-black text-white leading-none">
                  {convert(w.temp)}{unitLabel}
                </div>
                <div className="text-white/60 text-[16px] mt-1">{w.desc}</div>
                <div className="text-white/40 text-[13px]">Feels like {convert(w.feels)}{unitLabel} · H:{convert(w.high)}{unitLabel} L:{convert(w.low)}{unitLabel}</div>
              </div>
              <div className="text-8xl">{w.emoji}</div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3 mt-5">
              {[
                { icon:FiDroplet, label:"Humidity",    value:`${w.humidity}%`,    color:"text-blue-400" },
                { icon:FiWind,    label:"Wind",         value:`${w.wind} km/h`,   color:"text-cyan-400" },
                { icon:FiEye,     label:"Visibility",   value:`${w.visibility} km`,color:"text-violet-400" },
                { icon:FiZap,     label:"UV Index",     value:w.uvIndex.toString(),color:"text-amber-400" },
              ].map(s => (
                <div key={s.label} className="bg-white/[0.06] backdrop-blur-sm rounded-2xl p-3 text-center border border-white/[0.06]">
                  <s.icon className={cn("w-4 h-4 mx-auto mb-1", s.color)} />
                  <div className="text-white font-bold text-[14px]">{s.value}</div>
                  <div className="text-white/35 text-[10px]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Hourly forecast */}
          <div className="bg-[#0d0d1e] border border-white/[0.07] rounded-2xl p-4">
            <h3 className="text-white/50 text-[11px] font-bold uppercase tracking-widest mb-3">Hourly Forecast</h3>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {w.hourly.map((h, i) => (
                <div key={i} className={cn("flex flex-col items-center gap-1 shrink-0 px-3 py-2.5 rounded-xl transition-all",
                  i === 0 ? "bg-blue-500/20 border border-blue-500/25" : "bg-white/[0.03] border border-white/[0.05]")}>
                  <span className="text-white/45 text-[10px] font-medium">{h.time}</span>
                  <span className="text-xl">{h.emoji}</span>
                  <span className="text-white font-bold text-[13px]">{convert(h.temp)}{unitLabel}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AQI */}
          <div className="bg-[#0d0d1e] border border-white/[0.07] rounded-2xl p-4">
            <h3 className="text-white/50 text-[11px] font-bold uppercase tracking-widest mb-3">Air Quality Index</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("text-4xl font-black", aqiData.color)}>{w.aqi}</div>
              <div>
                <div className={cn("text-[12px] font-bold px-3 py-1 rounded-full", aqiData.color, aqiData.bg)}>{aqiData.label}</div>
                <div className="text-white/35 text-[10px] mt-1">AQI Scale: 0-500</div>
              </div>
            </div>
            <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500"
                style={{ width: `${Math.min(w.aqi / 300 * 100, 100)}%` }} />
            </div>
            <div className="flex justify-between text-[9px] text-white/20 mt-1">
              <span>Good</span><span>Moderate</span><span>Unhealthy</span><span>Hazardous</span>
            </div>
          </div>
        </div>

        {/* 7-day forecast */}
        <div className="bg-[#0d0d1e] border border-white/[0.07] rounded-2xl p-4 mb-4">
          <h3 className="text-white/50 text-[11px] font-bold uppercase tracking-widest mb-3">7-Day Forecast</h3>
          <div className="space-y-2">
            {w.forecast.map((f, i) => (
              <div key={i} className={cn("flex items-center gap-3 px-2 py-2 rounded-xl transition-all", i === 0 && "bg-blue-500/[0.07] border border-blue-500/10")}>
                <span className="text-white/50 text-[12.5px] font-semibold w-8">{f.day}</span>
                <span className="text-xl w-7 text-center">{f.emoji}</span>
                <span className="text-white/40 text-[11px] flex-1">{f.desc}</span>
                <span className="text-white font-bold text-[12px] w-12 text-right">{convert(f.high)}{unitLabel}</span>
                <span className="text-white/30 text-[12px] w-12 text-right">{convert(f.low)}{unitLabel}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI insight */}
        <div className="bg-[#0d0d1e] border border-white/[0.07] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FiZap className="w-4 h-4 text-violet-400" />
              <span className="text-white/60 text-[12px] font-bold">AI Weather Advisor</span>
            </div>
            <button onClick={getAiInsight} disabled={aiLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-500/15 text-violet-300 text-[11px] font-bold hover:bg-violet-500/25 border border-violet-500/20 transition-all disabled:opacity-50">
              {aiLoading ? <FiRefreshCw className="w-3 h-3 animate-spin" /> : <FiZap className="w-3 h-3" />}
              {aiLoading ? "Thinking..." : "Get Tips"}
            </button>
          </div>
          {aiInsight ? (
            <div className="text-white/65 text-[13px] leading-relaxed whitespace-pre-wrap">{aiInsight}</div>
          ) : (
            <div className="text-white/25 text-[12px]">Click "Get Tips" for AI-powered weather advice, outfit suggestions, and health tips for today.</div>
          )}
        </div>
      </div>
    </div>
  );
}
