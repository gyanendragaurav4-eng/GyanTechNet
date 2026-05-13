import { useEffect, useRef, useState, useCallback } from "react";
import { FiEdit2, FiDownload, FiTrash2, FiMinus } from "react-icons/fi";
import { cn } from "@/lib/utils";

type ToolId = "pen" | "brush" | "eraser" | "line" | "rect" | "circle" | "fill";

const TOOLS: { id: ToolId; emoji: string; label: string }[] = [
  { id:"pen",    emoji:"✏️", label:"Pen" },
  { id:"brush",  emoji:"🖌️", label:"Brush" },
  { id:"eraser", emoji:"⬜", label:"Eraser" },
  { id:"line",   emoji:"╱",  label:"Line" },
  { id:"rect",   emoji:"▭",  label:"Rectangle" },
  { id:"circle", emoji:"○",  label:"Ellipse" },
  { id:"fill",   emoji:"🪣", label:"Fill" },
];

const PALETTE = [
  "#ffffff","#d1d5db","#9ca3af","#6b7280","#374151","#111827",
  "#ef4444","#f97316","#eab308","#22c55e","#14b8a6","#06b6d4",
  "#3b82f6","#6366f1","#a855f7","#ec4899","#7c3aed","#10b981",
];

const SIZES = [2, 5, 10, 20, 40];

export default function DrawPage() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const ctxRef     = useRef<CanvasRenderingContext2D | null>(null);
  const historyRef = useRef<ImageData[]>([]);
  const redoRef    = useRef<ImageData[]>([]);

  const [tool, setTool]     = useState<ToolId>("pen");
  const [color, setColor]   = useState("#ffffff");
  const [size, setSize]     = useState(5);
  const [opacity, setOpacity] = useState(100);
  const [drawing, setDrawing] = useState(false);
  const startRef = useRef({ x:0, y:0 });

  const initCanvas = useCallback(() => {
    const canvas  = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay) return;
    const parent  = canvas.parentElement;
    if (!parent) return;
    const w = parent.clientWidth, h = parent.clientHeight;
    canvas.width  = overlay.width  = w;
    canvas.height = overlay.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.fillStyle = "#0a0a16";
    ctx.fillRect(0, 0, w, h);
    ctxRef.current = ctx;
    historyRef.current = [];
    redoRef.current    = [];
  }, []);

  useEffect(() => {
    initCanvas();
    const ro = new ResizeObserver(() => initCanvas());
    const parent = canvasRef.current?.parentElement;
    if (parent) ro.observe(parent);
    return () => ro.disconnect();
  }, [initCanvas]);

  const saveHistory = () => {
    const cv = canvasRef.current;
    const ctx = ctxRef.current;
    if (!cv || !ctx) return;
    historyRef.current.push(ctx.getImageData(0, 0, cv.width, cv.height));
    if (historyRef.current.length > 60) historyRef.current.shift();
    redoRef.current = [];
  };

  const undo = useCallback(() => {
    const cv = canvasRef.current; const ctx = ctxRef.current;
    if (!cv || !ctx || historyRef.current.length === 0) return;
    redoRef.current.push(ctx.getImageData(0, 0, cv.width, cv.height));
    const prev = historyRef.current.pop()!;
    ctx.putImageData(prev, 0, 0);
  }, []);

  const redo = useCallback(() => {
    const cv = canvasRef.current; const ctx = ctxRef.current;
    if (!cv || !ctx || redoRef.current.length === 0) return;
    historyRef.current.push(ctx.getImageData(0, 0, cv.width, cv.height));
    const next = redoRef.current.pop()!;
    ctx.putImageData(next, 0, 0);
  }, []);

  const getXY = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x:0, y:0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return { x:(e.touches[0].clientX - rect.left)*scaleX, y:(e.touches[0].clientY - rect.top)*scaleY };
    }
    return { x:(e.clientX - rect.left)*scaleX, y:(e.clientY - rect.top)*scaleY };
  };

  const drawShapePreview = (x: number, y: number) => {
    const ov = overlayRef.current; if (!ov) return;
    const ctx = ov.getContext("2d"); if (!ctx) return;
    ctx.clearRect(0, 0, ov.width, ov.height);
    const sx = startRef.current.x, sy = startRef.current.y;
    ctx.strokeStyle = color;
    ctx.lineWidth   = size;
    ctx.globalAlpha = opacity / 100;
    ctx.setLineDash([6,4]);
    ctx.beginPath();
    if (tool === "line") {
      ctx.moveTo(sx, sy); ctx.lineTo(x, y);
    } else if (tool === "rect") {
      ctx.rect(sx, sy, x - sx, y - sy);
    } else if (tool === "circle") {
      const rx = (x - sx) / 2, ry = (y - sy) / 2;
      ctx.ellipse(sx + rx, sy + ry, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const floodFill = (x: number, y: number) => {
    const cv = canvasRef.current; const ctx = ctxRef.current;
    if (!cv || !ctx) return;
    const imgData = ctx.getImageData(0, 0, cv.width, cv.height);
    const data    = imgData.data;
    const px      = Math.round(x), py = Math.round(y);
    const idx     = (py * cv.width + px) * 4;
    const [tr, tg, tb, ta] = [data[idx], data[idx+1], data[idx+2], data[idx+3]];
    const fillRgb = parseInt(color.replace("#",""),16);
    const fr = (fillRgb >> 16) & 0xff, fg = (fillRgb >> 8) & 0xff, fb = fillRgb & 0xff;
    if (tr===fr && tg===fg && tb===fb) return;
    const match = (i: number) => Math.abs(data[i]-tr)<20 && Math.abs(data[i+1]-tg)<20 && Math.abs(data[i+2]-tb)<20 && Math.abs(data[i+3]-ta)<20;
    const stack = [[px, py]];
    const visited = new Uint8Array(cv.width * cv.height);
    while (stack.length) {
      const [cx, cy] = stack.pop()!;
      if (cx<0||cy<0||cx>=cv.width||cy>=cv.height) continue;
      const i2 = cy * cv.width + cx;
      if (visited[i2]) continue; visited[i2] = 1;
      const i = i2 * 4;
      if (!match(i)) continue;
      data[i]=fr; data[i+1]=fg; data[i+2]=fb; data[i+3]=255;
      stack.push([cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]);
    }
    ctx.putImageData(imgData, 0, 0);
  };

  const onDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const { x, y } = getXY(e);
    const ctx = ctxRef.current; if (!ctx) return;
    saveHistory();
    if (tool === "fill") { floodFill(x, y); return; }
    startRef.current = { x, y };
    if (tool === "pen" || tool === "brush" || tool === "eraser") {
      ctx.globalAlpha = opacity / 100;
      ctx.lineWidth   = tool === "brush" ? size * 2.5 : size;
      if (tool === "eraser") { ctx.globalCompositeOperation = "destination-out"; }
      else { ctx.globalCompositeOperation = "source-over"; ctx.strokeStyle = color; }
      ctx.beginPath(); ctx.moveTo(x, y);
    }
    setDrawing(true);
  };

  const onMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return; e.preventDefault();
    const { x, y } = getXY(e);
    const ctx = ctxRef.current; if (!ctx) return;
    if (tool === "pen" || tool === "brush" || tool === "eraser") {
      ctx.lineTo(x, y); ctx.stroke();
    } else if (["line","rect","circle"].includes(tool)) {
      drawShapePreview(x, y);
    }
  };

  const onUp = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return; e.preventDefault();
    const { x, y } = getXY(e);
    const ctx = ctxRef.current;
    const ov  = overlayRef.current;
    if (ctx && ov) {
      ov.getContext("2d")?.clearRect(0, 0, ov.width, ov.height);
      const sx = startRef.current.x, sy = startRef.current.y;
      if (["line","rect","circle"].includes(tool)) {
        ctx.strokeStyle = color; ctx.lineWidth = size; ctx.globalAlpha = opacity/100;
        ctx.globalCompositeOperation = "source-over";
        ctx.beginPath();
        if (tool === "line") { ctx.moveTo(sx, sy); ctx.lineTo(x, y); }
        else if (tool === "rect") { ctx.rect(sx, sy, x - sx, y - sy); }
        else if (tool === "circle") {
          const rx=(x-sx)/2, ry=(y-sy)/2;
          ctx.ellipse(sx+rx, sy+ry, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI*2);
        }
        ctx.stroke();
      }
    }
    if (ctx) { ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1; ctx.closePath(); }
    setDrawing(false);
  };

  const clearCanvas = () => {
    const cv = canvasRef.current; const ctx = ctxRef.current;
    if (!cv || !ctx) return;
    saveHistory();
    ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    ctx.fillStyle = "#0a0a16"; ctx.fillRect(0, 0, cv.width, cv.height);
  };

  const downloadPNG = () => {
    const cv = canvasRef.current; if (!cv) return;
    const a  = document.createElement("a"); a.download = "gyandraw.png";
    a.href = cv.toDataURL("image/png"); a.click();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey||e.metaKey) && e.key === "z") { e.preventDefault(); undo(); }
      if ((e.ctrlKey||e.metaKey) && e.key === "y") { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  return (
    <div className="flex flex-col h-full bg-[#06060f] overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.06] bg-[#08081a] shrink-0">
        <FiEdit2 className="w-4 h-4 text-primary shrink-0" />
        <span className="text-white font-bold text-[13px] mr-2">GyanDraw</span>

        {/* Palette */}
        <div className="flex items-center gap-1 flex-wrap flex-1 min-w-0">
          {PALETTE.map(c => (
            <button key={c} onClick={() => setColor(c)}
              style={{ backgroundColor: c }}
              className={cn("w-5 h-5 rounded-full border-2 transition-transform hover:scale-110",
                color === c ? "border-white scale-125" : "border-transparent")} />
          ))}
          <input type="color" value={color} onChange={e => setColor(e.target.value)}
            className="w-6 h-6 rounded-full overflow-hidden cursor-pointer shrink-0 border-2 border-white/20" title="Custom color" />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Opacity */}
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-white/25 text-[10px]">Opacity</span>
            <input type="range" min="10" max="100" value={opacity} onChange={e => setOpacity(+e.target.value)}
              className="w-16 accent-primary h-1" />
            <span className="text-white/40 text-[10px] w-6">{opacity}%</span>
          </div>

          <button onClick={undo}
            className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/40 text-[11px] hover:text-white transition-all" title="Undo (Ctrl+Z)">
            ↩
          </button>
          <button onClick={redo}
            className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/40 text-[11px] hover:text-white transition-all" title="Redo (Ctrl+Y)">
            ↪
          </button>
          <button onClick={clearCanvas}
            className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/40 text-[11px] hover:text-red-400 transition-all flex items-center gap-1">
            <FiTrash2 className="w-3 h-3" /> Clear
          </button>
          <button onClick={downloadPNG}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-[12px] font-bold hover:bg-primary/90 transition-all shadow-[0_2px_8px_rgba(124,58,237,0.3)]">
            <FiDownload className="w-3.5 h-3.5" /> PNG
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left toolbar */}
        <div className="w-12 shrink-0 bg-[#08081a] border-r border-white/[0.06] flex flex-col items-center py-2 gap-1">
          {TOOLS.map(t => (
            <button key={t.id} onClick={() => setTool(t.id)} title={t.label}
              className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-[16px] transition-all",
                tool === t.id ? "bg-primary/20 border border-primary/40 text-primary shadow-[0_0_8px_rgba(124,58,237,0.3)]" : "text-white/35 hover:text-white hover:bg-white/[0.05]")}>
              {t.emoji}
            </button>
          ))}
          <div className="w-7 h-px bg-white/[0.1] my-1" />
          {/* Stroke sizes */}
          {SIZES.map(s => (
            <button key={s} onClick={() => setSize(s)} title={`Size ${s}`}
              className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                size === s ? "bg-white/[0.1] border border-white/[0.2]" : "hover:bg-white/[0.05]")}>
              <FiMinus className="text-white/50" style={{ width:Math.min(s*1.5,20), height:Math.min(s*1.5,20) }} />
            </button>
          ))}
        </div>

        {/* Canvas area */}
        <div className="flex-1 relative overflow-hidden bg-[#0a0a16] cursor-crosshair">
          <canvas ref={canvasRef}
            onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
            onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
            className="absolute inset-0 touch-none select-none"
            style={{ width:"100%", height:"100%" }} />
          <canvas ref={overlayRef}
            className="absolute inset-0 pointer-events-none"
            style={{ width:"100%", height:"100%" }} />

          {/* Current tool indicator */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-sm border border-white/[0.08] px-3 py-1.5 rounded-xl pointer-events-none">
            <span className="text-[14px]">{TOOLS.find(t=>t.id===tool)?.emoji}</span>
            <span className="text-white/50 text-[11px] font-medium">{TOOLS.find(t=>t.id===tool)?.label}</span>
            <div className="w-3 h-3 rounded-full border border-white/30" style={{ backgroundColor:color }} />
            <span className="text-white/30 text-[10px]">size {size}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
