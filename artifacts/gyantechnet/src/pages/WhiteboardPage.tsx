import { useEffect, useRef, useState, useCallback } from "react";
import { FiDownload, FiRotateCcw, FiRotateCw, FiZoomIn, FiZoomOut, FiTrash2 } from "react-icons/fi";
import { cn } from "@/lib/utils";

type Tool =
  | "select" | "select-free"
  | "eraser" | "fill"
  | "eyedropper" | "zoom-in"
  | "pencil" | "brush"
  | "airbrush" | "text"
  | "line" | "curve"
  | "rect" | "roundrect"
  | "ellipse" | "triangle";

type FillMode = "outline" | "both" | "fill";
type Snapshot = ImageData;

const TOOL_GRID: { id: Tool; icon: string; label: string }[][] = [
  [{ id:"select",      icon:"⬚",  label:"Select" },       { id:"select-free", icon:"⛶", label:"Free Select" }],
  [{ id:"eraser",      icon:"🧹", label:"Eraser" },        { id:"fill",        icon:"🪣", label:"Fill Color"  }],
  [{ id:"eyedropper",  icon:"💧", label:"Pick Color" },    { id:"zoom-in",     icon:"🔍", label:"Magnifier"   }],
  [{ id:"pencil",      icon:"✏️", label:"Pencil" },        { id:"brush",       icon:"🖌️", label:"Brush"       }],
  [{ id:"airbrush",    icon:"💨", label:"Airbrush" },      { id:"text",        icon:"A",  label:"Text"        }],
  [{ id:"line",        icon:"╱",  label:"Line" },          { id:"curve",       icon:"⌒",  label:"Curve"       }],
  [{ id:"rect",        icon:"▭",  label:"Rectangle" },     { id:"roundrect",   icon:"▢",  label:"Rounded Rect"}],
  [{ id:"ellipse",     icon:"⭕", label:"Ellipse" },       { id:"triangle",    icon:"△",  label:"Triangle"    }],
];

const BRUSH_SIZES = [
  { px: 1, w: 2,  h: 2  },
  { px: 2, w: 4,  h: 3  },
  { px: 4, w: 8,  h: 5  },
  { px: 7, w: 12, h: 7  },
  { px:12, w: 18, h: 10 },
];

// Classic Windows Paint 28-color palette (2 rows × 14)
const PALETTE = [
  "#000000","#808080","#800000","#808000","#008000","#008080","#000080","#800080",
  "#808040","#004040","#0080ff","#004080","#8000ff","#804000",
  "#ffffff","#c0c0c0","#ff0000","#ffff00","#00ff00","#00ffff","#0000ff","#ff00ff",
  "#ffff80","#00ff80","#80ffff","#8080ff","#ff0080","#ff8040",
];

const CANVAS_W = 800;
const CANVAS_H = 500;

export default function WhiteboardPage() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const overlayRef  = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [tool,       setTool]      = useState<Tool>("pencil");
  const [primary,    setPrimary]   = useState("#000000");
  const [secondary,  setSecondary] = useState("#ffffff");
  const [brushSize,  setBrushSize] = useState(2);
  const [fillMode,   setFillMode]  = useState<FillMode>("outline");
  const [isDrawing,  setIsDrawing] = useState(false);
  const [startPos,   setStartPos]  = useState({ x:0, y:0 });
  const [history,    setHistory]   = useState<Snapshot[]>([]);
  const [future,     setFuture]    = useState<Snapshot[]>([]);
  const [cursor,     setCursor]    = useState({ x:0, y:0 });
  const [zoom,       setZoom]      = useState(100);

  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const getCtx = useCallback(() => {
    if (!canvasRef.current) return null;
    if (!ctxRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) { ctxRef.current = ctx; ctx.lineCap = "round"; ctx.lineJoin = "round"; }
    }
    return ctxRef.current;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas) return;
    canvas.width  = CANVAS_W;
    canvas.height = CANVAS_H;
    if (overlay) { overlay.width = CANVAS_W; overlay.height = CANVAS_H; }
    const ctx = canvas.getContext("2d")!;
    ctxRef.current = ctx;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }, []);

  // Scale mouse coords to canvas pixels (accounts for zoom)
  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x:0, y:0 };
    const rect = canvas.getBoundingClientRect();
    const sx = CANVAS_W / rect.width;
    const sy = CANVAS_H / rect.height;
    return { x: Math.round((e.clientX - rect.left) * sx), y: Math.round((e.clientY - rect.top) * sy) };
  };

  const pushHistory = useCallback(() => {
    const ctx = getCtx(); const c = canvasRef.current;
    if (!ctx || !c) return;
    setHistory(h => [...h.slice(-24), ctx.getImageData(0, 0, c.width, c.height)]);
    setFuture([]);
  }, [getCtx]);

  const undo = () => {
    const ctx = getCtx(); const c = canvasRef.current;
    if (!ctx || !c || !history.length) return;
    setFuture(f => [ctx.getImageData(0,0,c.width,c.height), ...f.slice(0,9)]);
    ctx.putImageData(history[history.length-1], 0, 0);
    setHistory(h => h.slice(0,-1));
  };

  const redo = () => {
    const ctx = getCtx(); const c = canvasRef.current;
    if (!ctx || !c || !future.length) return;
    setHistory(h => [...h, ctx.getImageData(0,0,c.width,c.height)]);
    ctx.putImageData(future[0], 0, 0);
    setFuture(f => f.slice(1));
  };

  const clearCanvas = () => {
    const ctx = getCtx(); const c = canvasRef.current;
    if (!ctx || !c) return;
    pushHistory();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
  };

  const download = (fmt: "png"|"jpg" = "png") => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    if (fmt === "jpg") {
      const tmp = document.createElement("canvas");
      tmp.width = canvas.width; tmp.height = canvas.height;
      const tc = tmp.getContext("2d")!;
      tc.fillStyle = "#ffffff"; tc.fillRect(0,0,tmp.width,tmp.height);
      tc.drawImage(canvas,0,0);
      a.href = tmp.toDataURL("image/jpeg", 0.95);
      a.download = `GyanDraw_${Date.now()}.jpg`;
    } else {
      a.href = canvas.toDataURL("image/png");
      a.download = `GyanDraw_${Date.now()}.png`;
    }
    a.click();
  };

  // Flood fill (scan-line)
  const floodFill = (x: number, y: number, fillColor: string) => {
    const canvas = canvasRef.current; const ctx = getCtx();
    if (!canvas || !ctx) return;
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = img.data;
    const idx0 = (y * canvas.width + x) * 4;
    const [tr, tg, tb, ta] = [data[idx0], data[idx0+1], data[idx0+2], data[idx0+3]];
    // parse fill color
    const tmp = document.createElement("canvas"); tmp.width = tmp.height = 1;
    const tc = tmp.getContext("2d")!; tc.fillStyle = fillColor; tc.fillRect(0,0,1,1);
    const fd = tc.getImageData(0,0,1,1).data;
    const [fr, fg, fb] = [fd[0], fd[1], fd[2]];
    if (tr===fr && tg===fg && tb===fb) return;
    const stack = [x + y * canvas.width];
    const visited = new Uint8Array(canvas.width * canvas.height);
    const W = canvas.width, H = canvas.height;
    while (stack.length) {
      const pos = stack.pop()!;
      const px = pos % W, py = Math.floor(pos / W);
      if (px<0||py<0||px>=W||py>=H||visited[pos]) continue;
      const i = pos*4;
      if (data[i]!==tr||data[i+1]!==tg||data[i+2]!==tb||data[i+3]!==ta) continue;
      visited[pos] = 1;
      data[i]=fr; data[i+1]=fg; data[i+2]=fb; data[i+3]=255;
      stack.push(pos+1, pos-1, pos+W, pos-W);
    }
    ctx.putImageData(img, 0, 0);
  };

  const drawShapeOnCtx = (
    ctx: CanvasRenderingContext2D,
    from: {x:number;y:number}, to: {x:number;y:number},
    strokeColor: string, fillColor: string, mode: FillMode, sz: number
  ) => {
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle   = fillColor;
    ctx.lineWidth   = sz;
    ctx.lineCap  = "round";
    ctx.lineJoin = "round";

    const doFillStroke = () => {
      if (mode==="fill" || mode==="both") ctx.fill();
      if (mode==="outline" || mode==="both") ctx.stroke();
    };

    if (tool==="line") {
      ctx.beginPath(); ctx.moveTo(from.x,from.y); ctx.lineTo(to.x,to.y); ctx.stroke();
    } else if (tool==="rect") {
      ctx.beginPath(); ctx.rect(from.x,from.y,to.x-from.x,to.y-from.y); doFillStroke();
    } else if (tool==="roundrect") {
      const r=12, w=to.x-from.x, h=to.y-from.y;
      ctx.beginPath();
      ctx.moveTo(from.x+r, from.y);
      ctx.lineTo(from.x+w-r, from.y); ctx.arcTo(from.x+w,from.y,    from.x+w,from.y+r,   r);
      ctx.lineTo(from.x+w,  from.y+h-r); ctx.arcTo(from.x+w,from.y+h,from.x+w-r,from.y+h,r);
      ctx.lineTo(from.x+r,  from.y+h); ctx.arcTo(from.x,   from.y+h,from.x,   from.y+h-r,r);
      ctx.lineTo(from.x,    from.y+r); ctx.arcTo(from.x,   from.y,  from.x+r, from.y,    r);
      ctx.closePath(); doFillStroke();
    } else if (tool==="ellipse") {
      const rx=Math.abs(to.x-from.x)/2, ry=Math.abs(to.y-from.y)/2;
      const cx=from.x+(to.x-from.x)/2, cy=from.y+(to.y-from.y)/2;
      ctx.beginPath(); ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2); doFillStroke();
    } else if (tool==="triangle") {
      ctx.beginPath();
      ctx.moveTo(from.x+(to.x-from.x)/2, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.lineTo(from.x, to.y);
      ctx.closePath(); doFillStroke();
    } else if (tool==="curve") {
      const mx=(from.x+to.x)/2, my=(from.y+to.y)/2;
      ctx.beginPath(); ctx.moveTo(from.x,from.y); ctx.quadraticCurveTo(mx,from.y,to.x,to.y); ctx.stroke();
    }
  };

  const sprayDot = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    ctx.save(); ctx.fillStyle = color;
    for (let i=0; i<25; i++) {
      const a = Math.random()*Math.PI*2, r = Math.random()*brushSize*5;
      ctx.globalAlpha = Math.random()*0.5+0.1;
      ctx.beginPath(); ctx.arc(x+r*Math.cos(a), y+r*Math.sin(a), 0.6, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
  };

  const clearOverlay = () => {
    const ov = overlayRef.current; if (!ov) return;
    const oc = ov.getContext("2d"); if (!oc) return;
    oc.clearRect(0, 0, ov.width, ov.height);
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getPos(e);
    const isRight = e.button === 2;
    const fg = isRight ? secondary : primary;
    const bg = isRight ? primary   : secondary;

    if (tool === "eyedropper") {
      const ctx = getCtx(); const c = canvasRef.current;
      if (!ctx || !c) return;
      const p = ctx.getImageData(pos.x, pos.y, 1, 1).data;
      const hex = "#"+[p[0],p[1],p[2]].map(v=>v.toString(16).padStart(2,"0")).join("");
      if (isRight) setSecondary(hex); else setPrimary(hex);
      return;
    }
    if (tool === "fill") { pushHistory(); floodFill(pos.x, pos.y, fg); return; }
    if (tool === "text") {
      const txt = prompt("Enter text:");
      if (!txt) return;
      pushHistory();
      const ctx = getCtx(); if (!ctx) return;
      ctx.font = `18px Arial`; ctx.fillStyle = fg;
      ctx.fillText(txt, pos.x, pos.y);
      return;
    }
    if (tool === "zoom-in") { setZoom(z => Math.min(400, z+50)); return; }

    pushHistory(); setStartPos(pos); setIsDrawing(true);

    if (tool==="pencil"||tool==="eraser"||tool==="brush") {
      const ctx = getCtx(); if (!ctx) return;
      ctx.beginPath();
      ctx.strokeStyle = tool==="eraser" ? "#ffffff" : fg;
      ctx.lineWidth   = tool==="eraser" ? brushSize*4 : (tool==="brush" ? brushSize*2.5 : brushSize);
      ctx.globalAlpha = tool==="brush" ? 0.75 : 1;
      ctx.moveTo(pos.x, pos.y);
    } else if (tool==="airbrush") {
      const ctx = getCtx(); if (!ctx) return;
      sprayDot(ctx, pos.x, pos.y, fg);
    }
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getPos(e); setCursor(pos);
    if (!isDrawing) return;
    const isRight = e.button === 2;
    const fg = isRight ? secondary : primary;
    const bg = isRight ? primary   : secondary;

    if (tool==="pencil"||tool==="eraser"||tool==="brush") {
      const ctx = getCtx(); if (!ctx) return;
      ctx.lineTo(pos.x, pos.y); ctx.stroke();
    } else if (tool==="airbrush") {
      const ctx = getCtx(); if (!ctx) return;
      sprayDot(ctx, pos.x, pos.y, fg);
    } else {
      // shape preview on overlay
      const ov = overlayRef.current; if (!ov) return;
      const oc = ov.getContext("2d"); if (!oc) return;
      oc.clearRect(0, 0, ov.width, ov.height);
      drawShapeOnCtx(oc, startPos, pos, fg, bg, fillMode, brushSize);
    }
  };

  const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    const isRight = e.button === 2;
    const fg = isRight ? secondary : primary;
    const bg = isRight ? primary   : secondary;

    const isShape = !["pencil","brush","airbrush","eraser"].includes(tool);
    if (isShape) {
      const ctx = getCtx();
      if (ctx) drawShapeOnCtx(ctx, startPos, pos, fg, bg, fillMode, brushSize);
      clearOverlay();
    } else {
      const ctx = getCtx();
      if (ctx) { ctx.closePath(); ctx.globalAlpha = 1; }
    }
    setIsDrawing(false);
  };

  const getCursor = () => {
    if (tool==="eraser")     return "cell";
    if (tool==="fill")       return "crosshair";
    if (tool==="eyedropper") return "crosshair";
    if (tool==="text")       return "text";
    if (tool==="zoom-in")    return "zoom-in";
    if (["select","select-free"].includes(tool)) return "default";
    return "crosshair";
  };

  const openColorPicker = (isBg = false) => {
    const input = document.createElement("input");
    input.type = "color"; input.value = isBg ? secondary : primary;
    input.onchange = e => { const v=(e.target as HTMLInputElement).value; isBg ? setSecondary(v) : setPrimary(v); };
    input.click();
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{background:"#d4d0c8"}} onContextMenu={e=>e.preventDefault()}>

      {/* ── Menu bar ── */}
      <div className="flex items-center gap-0.5 px-1.5 py-0.5 shrink-0 border-b border-gray-500" style={{background:"#d4d0c8"}}>
        <div className="w-5 h-5 rounded bg-orange-600 flex items-center justify-center mr-1 shrink-0 shadow-sm">
          <span className="text-white font-black text-[8px]">P</span>
        </div>
        {[
          { label:"File",   items:[{l:"New",      a:clearCanvas},{l:"Save PNG",  a:()=>download("png")},{l:"Save JPEG",a:()=>download("jpg")}] },
          { label:"Edit",   items:[{l:"Undo",a:undo},{l:"Redo",a:redo},{l:"Select All",a:()=>setTool("select")},{l:"Clear Image",a:clearCanvas}] },
          { label:"View",   items:[{l:"Zoom In",  a:()=>setZoom(z=>Math.min(400,z+50))},{l:"Zoom Out",a:()=>setZoom(z=>Math.max(25,z-50))},{l:"Normal Size",a:()=>setZoom(100)},{l:"Full Screen",a:()=>setZoom(200)}] },
          { label:"Image",  items:[{l:"Invert Colors",a:()=>{const c=getCtx();const cv=canvasRef.current;if(!c||!cv)return;const d=c.getImageData(0,0,cv.width,cv.height);for(let i=0;i<d.data.length;i+=4){d.data[i]=255-d.data[i];d.data[i+1]=255-d.data[i+1];d.data[i+2]=255-d.data[i+2];}c.putImageData(d,0,0);}},{l:"Grayscale",a:()=>{const c=getCtx();const cv=canvasRef.current;if(!c||!cv)return;const d=c.getImageData(0,0,cv.width,cv.height);for(let i=0;i<d.data.length;i+=4){const g=d.data[i]*0.3+d.data[i+1]*0.59+d.data[i+2]*0.11;d.data[i]=d.data[i+1]=d.data[i+2]=g;}c.putImageData(d,0,0);}}] },
          { label:"Colors", items:[{l:"Edit Colors…",a:()=>openColorPicker()}] },
          { label:"Help",   items:[{l:"About GyanDraw",a:()=>alert("GyanDraw — MS Paint style drawing app\nPart of GyanTechNet Platform")}] },
        ].map(menu => (
          <div key={menu.label} className="relative group">
            <button className="px-2.5 py-0.5 text-[11px] text-gray-700 hover:bg-blue-600 hover:text-white transition-all rounded-none">
              {menu.label}
            </button>
            <div className="absolute hidden group-hover:block top-full left-0 z-50 shadow-lg py-1 min-w-[140px]" style={{background:"#d4d0c8",border:"1px solid #808080"}}>
              {menu.items.map(item => (
                <button key={item.l} onClick={item.a}
                  className="w-full text-left px-4 py-1 text-[11px] text-gray-700 hover:bg-blue-600 hover:text-white transition-all">
                  {item.l}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="flex-1"/>
        <button onClick={undo} disabled={!history.length} title="Undo"
          className="p-1 rounded text-gray-600 hover:bg-white/50 disabled:opacity-30 transition-all">
          <FiRotateCcw className="w-3 h-3"/>
        </button>
        <button onClick={redo} disabled={!future.length} title="Redo"
          className="p-1 rounded text-gray-600 hover:bg-white/50 disabled:opacity-30 transition-all">
          <FiRotateCw className="w-3 h-3"/>
        </button>
        <button onClick={()=>download("png")}
          className="flex items-center gap-1 px-2 py-0.5 ml-1 rounded text-[10px] text-gray-700 font-semibold hover:bg-white/60 border border-gray-400 transition-all">
          <FiDownload className="w-3 h-3"/> Save PNG
        </button>
      </div>

      {/* ── Body: tool panel + canvas ── */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* ── Tool Panel (left sidebar, classic Paint) ── */}
        <div className="w-[54px] shrink-0 flex flex-col border-r border-gray-500" style={{background:"#d4d0c8"}}>
          {/* Tool grid */}
          <div className="p-1 pt-1.5">
            {TOOL_GRID.map((row, ri) => (
              <div key={ri} className="flex gap-0.5 mb-0.5">
                {row.map(t => (
                  <button key={t.id} onClick={()=>setTool(t.id)} title={t.label}
                    className={cn(
                      "w-[23px] h-[23px] flex items-center justify-center text-[13px] rounded-none transition-none border",
                      tool===t.id
                        ? "border-gray-700 bg-white shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3)]"
                        : "border-transparent hover:border-gray-400"
                    )} style={{lineHeight:1}}>
                    {t.icon}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Separator */}
          <div className="h-px bg-gray-500 mx-1 my-1"/>

          {/* Fill mode */}
          <div className="px-1.5 flex flex-col gap-0.5 mb-1">
            {([
              { mode:"outline" as FillMode, render: <div className="w-7 h-5 border border-black bg-transparent"/> },
              { mode:"both"    as FillMode, render: <div className="w-7 h-5 border border-black" style={{background:"#c0c0c0"}}/> },
              { mode:"fill"    as FillMode, render: <div className="w-7 h-5 border-0" style={{background:"#808080"}}/> },
            ]).map(({mode,render}) => (
              <button key={mode} onClick={()=>setFillMode(mode)} title={mode}
                className={cn("w-full flex items-center justify-center py-0.5 border transition-none",
                  fillMode===mode ? "border-gray-700 bg-white shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]" : "border-transparent hover:border-gray-400")}>
                {render}
              </button>
            ))}
          </div>

          {/* Separator */}
          <div className="h-px bg-gray-500 mx-1 my-1"/>

          {/* Brush sizes */}
          <div className="px-1.5 flex flex-col gap-1">
            {BRUSH_SIZES.map(s => (
              <button key={s.px} onClick={()=>setBrushSize(s.px)} title={`${s.px}px`}
                className={cn("w-full flex items-center justify-center py-1 border transition-none",
                  brushSize===s.px ? "border-gray-700 bg-white shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]" : "border-transparent hover:border-gray-400")}>
                <div className="rounded-full bg-black" style={{width:`${s.w}px`, height:`${s.h}px`}}/>
              </button>
            ))}
          </div>
        </div>

        {/* ── Canvas area ── */}
        <div ref={containerRef} className="flex-1 overflow-auto" style={{background:"#808080",padding:"8px"}}>
          <div className="inline-block relative" style={{lineHeight:0}}>
            <canvas ref={canvasRef}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={e=>{if(isDrawing)onMouseUp(e);}}
              style={{
                cursor: getCursor(),
                width: `${CANVAS_W*zoom/100}px`,
                height: `${CANVAS_H*zoom/100}px`,
                display:"block",
                imageRendering: zoom>100?"pixelated":"auto",
              }}
            />
            <canvas ref={overlayRef}
              className="absolute inset-0 pointer-events-none"
              style={{width:`${CANVAS_W*zoom/100}px`,height:`${CANVAS_H*zoom/100}px`,display:"block"}}
            />
            {/* Resize dots */}
            {[
              { s:"absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-[6px] h-[6px] cursor-s-resize" },
              { s:"absolute right-[-4px] top-1/2 -translate-y-1/2 w-[6px] h-[6px] cursor-e-resize" },
              { s:"absolute bottom-[-4px] right-[-4px] w-[6px] h-[6px] cursor-se-resize" },
            ].map((d,i)=>(
              <div key={i} className={d.s+" border border-gray-700"} style={{background:"#d4d0c8"}}/>
            ))}
          </div>
        </div>
      </div>

      {/* ── Color palette bar (bottom, classic Paint style) ── */}
      <div className="shrink-0 border-t border-gray-500 flex items-center gap-1.5 px-2 py-1.5" style={{background:"#d4d0c8",height:"52px"}}>
        {/* Foreground / Background stacked swatches */}
        <div className="relative w-10 h-10 shrink-0 mr-1">
          {/* Background (secondary) */}
          <button
            className="absolute bottom-0 right-0 w-7 h-7 border border-gray-600 hover:border-gray-900 cursor-pointer transition-colors"
            style={{background:secondary}}
            title="Background color (right-click a color to set)"
            onClick={()=>openColorPicker(true)}
          />
          {/* Foreground (primary) — on top */}
          <button
            className="absolute top-0 left-0 w-7 h-7 border-2 border-gray-800 hover:border-black cursor-pointer transition-colors z-10"
            style={{background:primary}}
            title="Foreground color (left-click a color to set)"
            onClick={()=>openColorPicker(false)}
          />
        </div>

        {/* Separator */}
        <div className="w-px h-8 bg-gray-500 mx-0.5 shrink-0"/>

        {/* Color palette grid (2 rows × 14) */}
        <div className="grid grid-rows-2 grid-flow-col gap-0.5">
          {PALETTE.map(c => (
            <button key={c}
              onClick={()=>setPrimary(c)}
              onContextMenu={e=>{e.preventDefault();setSecondary(c);}}
              title={c}
              className={cn(
                "w-[18px] h-[18px] border transition-transform hover:scale-110",
                primary===c   ? "border-[3px] border-black ring-1 ring-white" :
                secondary===c ? "border-[2px] border-white ring-1 ring-black" :
                                "border border-gray-400"
              )}
              style={{backgroundColor:c}}
            />
          ))}
        </div>

        {/* Right: zoom + clear */}
        <div className="flex-1"/>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={clearCanvas} title="Clear canvas"
            className="p-1.5 rounded text-gray-600 hover:text-red-700 hover:bg-white/50 transition-all">
            <FiTrash2 className="w-3.5 h-3.5"/>
          </button>
          <button onClick={()=>setZoom(z=>Math.max(25,z-25))}
            className="p-1.5 rounded text-gray-600 hover:bg-white/50 transition-all">
            <FiZoomOut className="w-3.5 h-3.5"/>
          </button>
          <span className="text-[10px] text-gray-600 w-8 text-center font-medium">{zoom}%</span>
          <button onClick={()=>setZoom(z=>Math.min(400,z+25))}
            className="p-1.5 rounded text-gray-600 hover:bg-white/50 transition-all">
            <FiZoomIn className="w-3.5 h-3.5"/>
          </button>
        </div>
      </div>

      {/* ── Status bar ── */}
      <div className="h-5 border-t border-gray-500 flex items-center px-3 gap-4 shrink-0" style={{background:"#d4d0c8"}}>
        <span className="text-[9px] text-gray-600">{cursor.x},{cursor.y}</span>
        <span className="text-gray-400 text-[9px]">|</span>
        <span className="text-[9px] text-gray-600">{CANVAS_W}×{CANVAS_H}px</span>
        <span className="text-gray-400 text-[9px]">|</span>
        <span className="text-[9px] text-gray-600">Zoom: {zoom}%</span>
        <span className="text-gray-400 text-[9px]">|</span>
        <span className="text-[9px] text-gray-600 capitalize">{tool}</span>
      </div>
    </div>
  );
}
