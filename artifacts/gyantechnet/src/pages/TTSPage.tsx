import { useState, useEffect, useRef, useCallback } from "react";
import { FiVolume2, FiPlay, FiDownload, FiMic, FiLoader, FiStopCircle, FiCopy, FiCheck, FiRefreshCw } from "react-icons/fi";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "tts",     label: "Text to Speech", icon: "🔊" },
  { id: "stt",     label: "Speech to Text", icon: "🎤" },
  { id: "clone",   label: "Voice Clone",    icon: "🧬" },
  { id: "library", label: "Voice Library",  icon: "📚" },
];

const VOICES: { id: string; name: string; lang: string; desc: string; langCode: string; preferFemale?: boolean }[] = [
  { id: "narrator",   name: "Narrator",    lang: "EN", langCode: "en-US", desc: "Deep, authoritative" },
  { id: "friendly",   name: "Friendly",    lang: "EN", langCode: "en-US", desc: "Warm, approachable",   preferFemale: true },
  { id: "news",       name: "News Anchor", lang: "EN", langCode: "en-US", desc: "Professional" },
  { id: "british",    name: "British",     lang: "EN", langCode: "en-GB", desc: "Crisp accent" },
  { id: "hindi",      name: "Hindi",       lang: "HI", langCode: "hi-IN", desc: "Native Hindi", preferFemale: true },
  { id: "playful",    name: "Playful",     lang: "EN", langCode: "en-US", desc: "Fun, energetic",       preferFemale: true },
  { id: "boy",        name: "Boy",         lang: "EN", langCode: "en-US", desc: "Young, cheerful" },
  { id: "boyHindi",   name: "Boy (Hindi)", lang: "HI", langCode: "hi-IN", desc: "Young Hindi" },
  { id: "dramatic",   name: "Dramatic",    lang: "EN", langCode: "en-US", desc: "Intense, theatrical" },
  { id: "aussie",     name: "Australian",  lang: "EN", langCode: "en-AU", desc: "Aussie accent" },
  { id: "whisper",    name: "Whisperer",   lang: "EN", langCode: "en-US", desc: "Soft, close",          preferFemale: true },
  { id: "audio",      name: "Audiobook",   lang: "EN", langCode: "en-US", desc: "Story telling" },
  { id: "commercial", name: "Commercial",  lang: "EN", langCode: "en-US", desc: "Ad-style" },
];

const SAMPLE_TEXTS: Record<string, string> = {
  Welcome:      "Welcome to GyanTechNet AI — the most advanced AI platform built in India.",
  Hindi:        "नमस्ते, मैं ज्ञानटेकनेट AI हूँ। आपकी कैसे सहायता कर सकता हूँ?",
  Pangram:      "The quick brown fox jumps over the lazy dog.",
  Story:        "Once upon a time, in a land powered by artificial intelligence, a curious developer built something extraordinary.",
  News:         "Breaking: GyanTechNet AI launches revolutionary multi-mode chat system, transforming how millions interact with AI.",
  Poem:         "In circuits deep, where neurons spark, a mind awakens in the dark.",
  Motivational: "Every expert was once a beginner. Every champion started as a challenger. Keep going.",
  Tech:         "Neural networks process information through weighted connections, enabling machines to learn from experience.",
};

const LIBRARY_VOICES = [
  { name: "Aria",   lang: "English",  gender: "Female", style: "Conversational" },
  { name: "Marcus", lang: "English",  gender: "Male",   style: "Narration" },
  { name: "Priya",  lang: "Hindi",    gender: "Female", style: "News" },
  { name: "Raj",    lang: "Hindi",    gender: "Male",   style: "Casual" },
  { name: "Sophie", lang: "French",   gender: "Female", style: "Elegant" },
  { name: "Kenji",  lang: "Japanese", gender: "Male",   style: "Professional" },
];

export default function TTSPage() {
  const [tab, setTab]         = useState("tts");
  const [voice, setVoice]     = useState("narrator");
  const [text, setText]       = useState("");
  const [speed, setSpeed]     = useState(1.0);
  const [pitch, setPitch]     = useState(1.0);
  const [volume, setVolume]   = useState(0.9);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);

  // STT state
  const [recording, setRecording]   = useState(false);
  const [transcript, setTranscript] = useState("");
  const [sttError, setSttError]     = useState<string | null>(null);
  const [copied, setCopied]         = useState(false);

  const utteranceRef    = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef  = useRef<any>(null);
  const interimRef      = useRef("");

  // Load browser TTS voices (async on some browsers)
  useEffect(() => {
    const load = () => {
      const v = window.speechSynthesis?.getVoices() ?? [];
      if (v.length) setBrowserVoices(v);
    };
    load();
    window.speechSynthesis?.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", load);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch { /* ignore */ }
      }
    };
  }, []);

  // Pick the best matching browser voice for a preset
  const getBrowserVoice = useCallback((presetId: string): SpeechSynthesisVoice | null => {
    if (!browserVoices.length) return null;
    const preset = VOICES.find(v => v.id === presetId);
    if (!preset) return browserVoices[0] ?? null;

    // First try to match exact language code
    let candidates = browserVoices.filter(v => v.lang.toLowerCase().startsWith(preset.langCode.toLowerCase().split("-")[0]));
    if (!candidates.length) candidates = browserVoices;

    // Then try to match by language region
    const regionMatch = candidates.filter(v => v.lang.toLowerCase() === preset.langCode.toLowerCase());
    if (regionMatch.length) candidates = regionMatch;

    // Filter by gender hint if available
    if (preset.preferFemale !== undefined) {
      const genderHint = preset.preferFemale ? ["female", "woman", "girl", "aria", "samantha", "victoria", "karen", "monica", "priya", "zira"] : ["male", "man", "daniel", "alex", "tom", "david", "jorge"];
      const genderMatch = candidates.filter(v => genderHint.some(h => v.name.toLowerCase().includes(h)));
      if (genderMatch.length) return genderMatch[0];
    }

    return candidates[0] ?? null;
  }, [browserVoices]);

  // Text-to-Speech
  const handleSpeak = useCallback(() => {
    if (!text.trim()) return;

    // If already playing, stop
    if (playing) {
      window.speechSynthesis?.cancel();
      setPlaying(false);
      setLoading(false);
      return;
    }

    if (!window.speechSynthesis) {
      alert("Text-to-Speech is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate   = speed;
    utterance.pitch  = pitch;
    utterance.volume = volume;

    const bv = getBrowserVoice(voice);
    if (bv) utterance.voice = bv;

    utterance.onstart = () => { setLoading(false); setPlaying(true); };
    utterance.onend   = () => { setPlaying(false); setLoading(false); };
    utterance.onerror = (e) => {
      if (e.error !== "interrupted") {
        setPlaying(false); setLoading(false);
      }
    };

    utteranceRef.current = utterance;
    setLoading(true);
    window.speechSynthesis.speak(utterance);
  }, [text, playing, speed, pitch, volume, voice, getBrowserVoice]);

  // Speech-to-Text
  const toggleRecording = useCallback(() => {
    if (recording) {
      try { recognitionRef.current?.stop(); } catch { /* ignore */ }
      setRecording(false);
      return;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setSttError("Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }

    setSttError(null);
    interimRef.current = "";

    const recognition = new SR();
    recognition.continuous     = true;
    recognition.interimResults = true;
    recognition.lang           = voice.includes("Hindi") || voice === "hindi" || voice === "boyHindi" ? "hi-IN" : "en-IN";

    recognition.onresult = (e: any) => {
      let finalText = "";
      let interimText = "";
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalText += e.results[i][0].transcript + " ";
        } else {
          interimText += e.results[i][0].transcript;
        }
      }
      interimRef.current = interimText;
      setTranscript(finalText.trim() + (interimText ? " " + interimText : ""));
    };

    recognition.onerror = (e: any) => {
      if (e.error !== "aborted" && e.error !== "no-speech") {
        setSttError(`Recognition error: ${e.error}. Please allow microphone access.`);
      }
      setRecording(false);
    };

    recognition.onend = () => setRecording(false);

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setRecording(true);
    } catch {
      setSttError("Could not start recording. Check microphone permissions.");
    }
  }, [recording, voice]);

  const copyTranscript = () => {
    navigator.clipboard.writeText(transcript).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const useTranscriptForTTS = () => {
    setText(transcript);
    setTab("tts");
  };

  const selectedVoice = VOICES.find(v => v.id === voice)!;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const estTime = Math.max(1, Math.round(wordCount / (speed * 2.5)));

  return (
    <div className="flex h-full bg-[#06060f] overflow-hidden">

      {/* ── Left panel ── */}
      <div className="hidden sm:flex w-[220px] shrink-0 border-r border-white/[0.05] bg-[#08081a] flex-col overflow-hidden">
        <div className="px-4 py-3.5 border-b border-white/[0.05] flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <FiVolume2 className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h2 className="text-[13px] font-bold text-white">Text to Speech</h2>
            <p className="text-[10px] text-white/35">{browserVoices.length || "—"} voices available</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="p-2 border-b border-white/[0.05]">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn(
                "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] font-medium transition-all mb-0.5",
                tab === t.id
                  ? "bg-primary/15 text-primary"
                  : "text-white/40 hover:bg-white/[0.04] hover:text-white/70"
              )}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Voice list (TTS tab only) */}
        {tab === "tts" && (
          <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-0.5">
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest px-2 py-1">Voice Presets</p>
            {VOICES.map(v => (
              <button key={v.id} onClick={() => setVoice(v.id)}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[11px] transition-all",
                  voice === v.id
                    ? "bg-primary/15 text-primary"
                    : "text-white/45 hover:bg-white/[0.04] hover:text-white/70"
                )}>
                <div className="min-w-0">
                  <div className="font-medium truncate">{v.name}</div>
                  <div className="text-[9px] text-white/25 truncate">{v.desc}</div>
                </div>
                <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 ml-1",
                  v.lang === "HI" ? "bg-orange-500/20 text-orange-400" : "bg-blue-500/20 text-blue-400")}>
                  {v.lang}
                </span>
              </button>
            ))}
          </div>
        )}

        {tab === "library" && (
          <div className="flex-1 overflow-y-auto no-scrollbar p-2">
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest px-2 py-1">Voice Library</p>
            {LIBRARY_VOICES.map(v => (
              <div key={v.name} className="px-2.5 py-2 rounded-lg border border-white/[0.05] mb-1 hover:border-primary/30 hover:bg-primary/[0.04] cursor-pointer transition-all">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[12px] font-semibold text-white/80">{v.name}</span>
                  <span className="text-[9px] text-white/30">{v.gender}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-primary/70">{v.lang}</span>
                  <span className="text-white/20">·</span>
                  <span className="text-[10px] text-white/35">{v.style}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-5 gap-3 sm:gap-4">

        {/* Mobile-only tab + voice picker */}
        <div className="sm:hidden space-y-2">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cn("flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap shrink-0 border transition-all",
                  tab === t.id ? "bg-primary/15 border-primary/40 text-primary" : "border-white/[0.09] text-white/40 bg-white/[0.03]")}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          {tab === "tts" && (
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {VOICES.slice(0, 8).map(v => (
                <button key={v.id} onClick={() => setVoice(v.id)}
                  className={cn("px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap shrink-0 border transition-all",
                    voice === v.id ? "bg-purple-500/15 border-purple-500/40 text-purple-400" : "border-white/[0.09] text-white/40 bg-white/[0.03]")}>
                  {v.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── TTS TAB ── */}
        {tab === "tts" && (
          <>
            {/* Active voice badge + sample presets */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-2">
                  <span className="text-primary text-[11px] font-bold">{selectedVoice.name}</span>
                  <span className="text-[10px] text-white/35 hidden sm:inline">{selectedVoice.desc}</span>
                </div>
                {wordCount > 0 && (
                  <span className="text-[10px] text-white/25 hidden sm:inline">~{estTime}s · {wordCount} words</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {Object.keys(SAMPLE_TEXTS).slice(0, 5).map(s => (
                  <button key={s} onClick={() => setText(SAMPLE_TEXTS[s])}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.07] text-[10px] text-white/40 hover:text-white/70 hover:border-white/15 whitespace-nowrap transition-all shrink-0">
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Text area */}
            <div className="flex-1 min-h-0 relative">
              <textarea value={text} onChange={e => setText(e.target.value)}
                placeholder="Enter text to convert to speech…"
                className="w-full h-full bg-[#0d0d1e] border border-white/[0.08] rounded-2xl p-4 resize-none text-[14px] text-white placeholder:text-white/20 outline-none focus:border-primary/35 transition-all no-scrollbar leading-relaxed" />
              <div className="absolute bottom-3 right-3 text-[10px] text-white/20">{text.length} chars</div>
            </div>

            {/* Controls */}
            <div className="bg-[#0d0d1e] border border-white/[0.07] rounded-2xl p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[11px] font-semibold text-white/50">Speed</span>
                    <span className="text-[11px] font-bold text-primary">{speed.toFixed(1)}x</span>
                  </div>
                  <input type="range" min="0.5" max="2" step="0.1" value={speed} onChange={e => setSpeed(parseFloat(e.target.value))}
                    className="w-full accent-purple-500 h-1.5 rounded-full cursor-pointer" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[11px] font-semibold text-white/50">Pitch</span>
                    <span className="text-[11px] font-bold text-primary">{pitch.toFixed(1)}x</span>
                  </div>
                  <input type="range" min="0.5" max="2" step="0.1" value={pitch} onChange={e => setPitch(parseFloat(e.target.value))}
                    className="w-full accent-purple-500 h-1.5 rounded-full cursor-pointer" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[11px] font-semibold text-white/50">Volume</span>
                    <span className="text-[11px] font-bold text-primary">{Math.round(volume * 100)}%</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.05" value={volume} onChange={e => setVolume(parseFloat(e.target.value))}
                    className="w-full accent-purple-500 h-1.5 rounded-full cursor-pointer" />
                </div>
              </div>

              {/* Playback bar */}
              {playing && (
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex gap-0.5 items-end h-5">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} className="w-1 bg-gradient-to-t from-primary to-pink-400 rounded-full animate-pulse"
                        style={{ height: `${Math.random() * 14 + 6}px`, animationDelay: `${i * 0.07}s` }} />
                    ))}
                  </div>
                  <span className="text-[10px] text-white/40 flex-1">Speaking… (click Stop to pause)</span>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={handleSpeak} disabled={!text.trim() || loading}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-primary to-violet-600 text-white text-[12px] font-semibold rounded-xl disabled:opacity-40 transition-all hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] active:scale-[0.98] disabled:cursor-not-allowed">
                  {loading ? <FiLoader className="w-3.5 h-3.5 animate-spin" /> : playing ? <FiStopCircle className="w-3.5 h-3.5" /> : <FiPlay className="w-3.5 h-3.5" />}
                  {loading ? "Loading voices…" : playing ? "Stop" : "Speak"}
                </button>
                <button onClick={() => { window.speechSynthesis?.cancel(); setPlaying(false); setLoading(false); setText(""); }}
                  disabled={!text.trim()}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.05] border border-white/[0.08] text-[12px] text-white/60 rounded-xl hover:bg-white/[0.08] transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed">
                  <FiRefreshCw className="w-3.5 h-3.5" /> Clear
                </button>
              </div>

              {!browserVoices.length && (
                <p className="text-[10px] text-amber-400/70 mt-2 text-center">Loading voices… If speech doesn't start, please refresh the page.</p>
              )}
            </div>
          </>
        )}

        {/* ── STT TAB ── */}
        {tab === "stt" && (
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex-1 rounded-2xl bg-[#0d0d1e] border border-white/[0.07] flex flex-col items-center justify-center gap-4 p-8">
              <button onClick={toggleRecording}
                className={cn("w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-95",
                  recording
                    ? "bg-red-500/20 border-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse"
                    : "bg-primary/10 border-2 border-primary hover:shadow-[0_0_30px_rgba(124,58,237,0.3)]"
                )}>
                <FiMic className={cn("w-8 h-8", recording ? "text-red-400" : "text-primary")} />
              </button>
              <div className="text-[14px] font-semibold text-white/60">
                {recording ? "Recording… Click to stop" : "Click to start recording"}
              </div>
              {recording && (
                <div className="flex gap-1 items-end h-8">
                  {[3, 5, 8, 6, 4, 7, 5, 3, 6, 4, 8, 5].map((h, i) => (
                    <div key={i} className="w-1.5 bg-gradient-to-t from-primary to-pink-400 rounded-full animate-pulse"
                      style={{ height: h * 4 + "px", animationDelay: `${i * 0.08}s` }} />
                  ))}
                </div>
              )}
              {sttError && (
                <div className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-center max-w-xs">
                  {sttError}
                </div>
              )}
            </div>

            <div className="bg-[#0d0d1e] border border-white/[0.07] rounded-2xl p-4 min-h-[100px]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold text-white/30">Transcription</p>
                {transcript && (
                  <div className="flex gap-2">
                    <button onClick={copyTranscript}
                      className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/70 transition-colors">
                      {copied ? <FiCheck className="w-3 h-3 text-emerald-400" /> : <FiCopy className="w-3 h-3" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                    <button onClick={useTranscriptForTTS}
                      className="flex items-center gap-1 text-[10px] text-primary hover:text-violet-300 transition-colors">
                      <FiVolume2 className="w-3 h-3" /> Use in TTS
                    </button>
                  </div>
                )}
              </div>
              {transcript ? (
                <p className="text-[13px] text-white/80 leading-relaxed">{transcript}</p>
              ) : (
                <p className="text-[13px] text-white/30">{recording ? "Listening…" : "Your transcribed text will appear here…"}</p>
              )}
            </div>
          </div>
        )}

        {/* ── CLONE TAB ── */}
        {tab === "clone" && (
          <div className="flex-1 flex flex-col gap-4 items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <span className="text-3xl">🧬</span>
            </div>
            <h3 className="text-[16px] font-bold text-white/70">Voice Cloning</h3>
            <p className="text-[13px] text-white/35 max-w-xs">Upload a 30-second audio sample to clone any voice with AI precision.</p>
            <div className="border-2 border-dashed border-white/[0.10] rounded-2xl p-8 w-full max-w-xs hover:border-primary/30 transition-colors cursor-pointer">
              <div className="text-2xl mb-2">🎤</div>
              <div className="text-[12px] text-white/40">Upload audio sample</div>
              <div className="text-[10px] text-white/25 mt-1">MP3, WAV, M4A · 30s min</div>
            </div>
            <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-[11px] text-primary">
              Available on Gyan Pro & Ultra
            </div>
          </div>
        )}

        {/* ── LIBRARY TAB (mobile) ── */}
        {tab === "library" && (
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-3">{browserVoices.length || "—"} Voices Available</p>
            <div className="space-y-1">
              {(browserVoices.length ? browserVoices.slice(0, 30) : LIBRARY_VOICES).map((v: any, i) => (
                <div key={i} className="px-3 py-2.5 rounded-xl border border-white/[0.05] hover:border-primary/25 hover:bg-primary/[0.04] cursor-pointer transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-white/80">{v.name || "Voice " + (i + 1)}</span>
                    <span className="text-[9px] text-white/30">{v.lang}</span>
                  </div>
                  {v.localService !== undefined && (
                    <div className="text-[10px] text-white/30 mt-0.5">{v.localService ? "Built-in" : "Network"}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
