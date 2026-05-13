import { useState } from "react";
import { FiVideo, FiLink, FiCopy, FiMic, FiMicOff, FiVideoOff, FiPhone, FiUsers, FiShare2, FiCheck, FiPlus } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const RECENT_ROOMS = [
  { id:"GYAN-42XK", name:"Team Standup", participants:5, time:"Yesterday, 10:30 AM" },
  { id:"GYAN-9PQR", name:"Client Demo",  participants:3, time:"Oct 28, 2:00 PM" },
  { id:"GYAN-7MNB", name:"Design Review",participants:4, time:"Oct 25, 11:00 AM" },
];

export default function MeetPage() {
  const { user } = useAuth();
  const [name, setName]             = useState(user?.name || "");
  const [roomId, setRoomId]         = useState("");
  const [joined, setJoined]         = useState(false);
  const [generatedRoom, setGeneratedRoom] = useState<string|null>(null);
  const [mic, setMic]               = useState(true);
  const [cam, setCam]               = useState(true);
  const [copied, setCopied]         = useState(false);

  const newCall = () => {
    const id = "GYAN-" + Math.random().toString(36).substring(2, 6).toUpperCase();
    setGeneratedRoom(id);
    setRoomId(id);
  };

  const joinCall = () => { if (name.trim() && roomId.trim()) setJoined(true); };

  const copyRoom = () => {
    navigator.clipboard.writeText(`Join my GyanMeet: ${generatedRoom || roomId}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (joined) {
    const participants = ["You", "Priya Sharma", "Rahul Gupta", "Vikram Patel"].slice(0, 3);
    return (
      <div className="h-full flex flex-col bg-[#010108] overflow-hidden">
        {/* Video grid */}
        <div className="flex-1 grid grid-cols-2 gap-2 p-3 overflow-hidden">
          {/* Self */}
          <div className="relative bg-[#0d0d20] rounded-2xl overflow-hidden flex items-center justify-center border border-white/[0.07]">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-2xl font-black text-white">
              {(name || "Y").charAt(0).toUpperCase()}
            </div>
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white text-[11px] font-medium">{name || "You"} (you)</span>
            </div>
            {!mic && (
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                <FiMicOff className="w-3 h-3 text-red-400" />
              </div>
            )}
          </div>

          {participants.slice(1).map((p, i) => (
            <div key={i} className="relative bg-[#0d0d20] rounded-2xl overflow-hidden flex items-center justify-center border border-white/[0.07]">
              <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white",
                ["bg-gradient-to-br from-pink-600 to-rose-600","bg-gradient-to-br from-emerald-600 to-teal-600","bg-gradient-to-br from-amber-600 to-orange-600"][i])}>
                {p.charAt(0)}
              </div>
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
                <span className="text-white text-[11px] font-medium">{p}</span>
              </div>
            </div>
          ))}

          {/* Empty slot */}
          <div className="bg-[#0a0a18] rounded-2xl border border-dashed border-white/[0.08] flex items-center justify-center">
            <div className="text-center">
              <FiUsers className="w-8 h-8 text-white/15 mx-auto mb-2" />
              <div className="text-white/20 text-[11px]">Waiting for others...</div>
            </div>
          </div>
        </div>

        {/* Controls bar */}
        <div className="h-16 bg-[#08081a] border-t border-white/[0.06] flex items-center justify-center gap-3 px-4 shrink-0">
          <div className="flex items-center gap-2 mr-4">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white/50 text-[12px] font-mono font-semibold">{roomId}</span>
          </div>

          <button onClick={() => setMic(v => !v)}
            className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-all",
              mic ? "bg-white/[0.1] text-white hover:bg-white/[0.15]" : "bg-red-500/20 text-red-400 hover:bg-red-500/30")}>
            {mic ? <FiMic className="w-5 h-5" /> : <FiMicOff className="w-5 h-5" />}
          </button>
          <button onClick={() => setCam(v => !v)}
            className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-all",
              cam ? "bg-white/[0.1] text-white hover:bg-white/[0.15]" : "bg-red-500/20 text-red-400 hover:bg-red-500/30")}>
            {cam ? <FiVideo className="w-5 h-5" /> : <FiVideoOff className="w-5 h-5" />}
          </button>
          <button onClick={copyRoom}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-white/[0.1] text-white hover:bg-white/[0.15] transition-all">
            {copied ? <FiCheck className="w-5 h-5 text-emerald-400" /> : <FiShare2 className="w-5 h-5" />}
          </button>
          <button onClick={() => { setJoined(false); setRoomId(""); setGeneratedRoom(null); }}
            className="w-14 h-12 rounded-full flex items-center justify-center bg-red-500 text-white hover:bg-red-600 transition-all shadow-[0_4px_12px_rgba(239,68,68,0.4)]">
            <FiPhone className="w-5 h-5 rotate-[135deg]" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#06060f] overflow-y-auto no-scrollbar">
      <div className="max-w-lg mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
            <FiVideo className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-white font-black text-3xl mb-2">GyanMeet</h1>
          <p className="text-white/40 text-[14px]">Encrypted video calls · Instant rooms · No sign-in required</p>
        </div>

        {/* Your name */}
        <div className="mb-5">
          <label className="text-[10px] text-white/30 uppercase font-bold tracking-widest block mb-1.5">Your Name</label>
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="Enter your display name..."
            className="w-full bg-[#0d0d1e] border border-white/[0.09] rounded-2xl px-4 py-3 text-white text-[14px] outline-none placeholder:text-white/20 focus:border-emerald-500/40 transition-all" />
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 gap-3 mb-6">
          {/* New Meeting */}
          <button onClick={newCall}
            className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-[0_8px_24px_rgba(16,185,129,0.3)] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <FiPlus className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-[14px]">New Meeting</div>
              <div className="text-white/70 text-[12px]">Start an instant video call</div>
            </div>
          </button>

          {/* Join Room */}
          <div className="bg-[#0d0d1e] border border-white/[0.08] rounded-2xl p-4">
            <div className="text-[11px] text-white/35 font-semibold uppercase tracking-widest mb-2">Join a Meeting</div>
            <div className="flex gap-2">
              <input value={roomId} onChange={e => setRoomId(e.target.value.toUpperCase())}
                onKeyDown={e => { if (e.key === "Enter") joinCall(); }}
                placeholder="Enter room code (e.g. GYAN-42XK)"
                className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-[13px] outline-none placeholder:text-white/20 focus:border-emerald-500/40 transition-all font-mono" />
              <button onClick={joinCall} disabled={!name.trim() || !roomId.trim()}
                className="px-4 py-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 font-bold text-[13px] border border-emerald-500/25 hover:bg-emerald-600/30 disabled:opacity-30 transition-all">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Generated room */}
        {generatedRoom && (
          <div className="bg-emerald-500/[0.07] border border-emerald-500/20 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300 font-bold text-[12px]">Room Created!</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 bg-white/[0.06] rounded-xl px-3 py-2.5 font-mono text-white/80 text-[13px] font-semibold tracking-widest">
                {generatedRoom}
              </div>
              <button onClick={copyRoom}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600/20 text-emerald-300 text-[12px] font-bold border border-emerald-500/20 hover:bg-emerald-600/30 transition-all">
                {copied ? <FiCheck className="w-3.5 h-3.5" /> : <FiCopy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <button onClick={joinCall} disabled={!name.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-[13px] hover:from-emerald-500 hover:to-teal-500 disabled:opacity-30 shadow-[0_4px_12px_rgba(16,185,129,0.3)] transition-all">
              <FiVideo className="w-4 h-4" /> Start Meeting
            </button>
          </div>
        )}

        {/* Recent calls */}
        {RECENT_ROOMS.length > 0 && (
          <div>
            <div className="text-[10px] text-white/25 uppercase font-bold tracking-widest mb-2.5">Recent Meetings</div>
            {RECENT_ROOMS.map(room => (
              <button key={room.id} onClick={() => { setRoomId(room.id); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-all text-left group mb-1.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <FiVideo className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white/80 text-[12.5px] font-semibold">{room.name}</div>
                  <div className="text-white/30 text-[10.5px]">{room.time} · {room.participants} participants</div>
                </div>
                <div className="font-mono text-[10px] text-white/20 group-hover:text-white/40 transition-colors">{room.id}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
