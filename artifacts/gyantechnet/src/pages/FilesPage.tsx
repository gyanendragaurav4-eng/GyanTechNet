import { useState } from "react";
import { FiFolder, FiUpload, FiFileText, FiImage, FiVideo, FiMoreVertical, FiSearch, FiGrid, FiList, FiDownload, FiTrash2, FiStar, FiX } from "react-icons/fi";
import { cn } from "@/lib/utils";

type FileItem = {
  id:number; name:string; size:string; date:string; type:string;
  icon:typeof FiFileText; color:string; starred:boolean;
};

const FILES: FileItem[] = [
  { id:1, name:"GyanTechNet_Proposal_2026.pdf", size:"2.4 MB",  date:"Today",    type:"PDF",     icon:FiFileText, color:"bg-red-500/20 text-red-400",    starred:true },
  { id:2, name:"Design_Assets_v2.zip",          size:"42.1 MB", date:"Yesterday",type:"Archive", icon:FiFolder,   color:"bg-amber-500/20 text-amber-400", starred:false },
  { id:3, name:"Hero_Banner_Final.png",          size:"4.8 MB",  date:"Oct 25",   type:"Image",   icon:FiImage,    color:"bg-blue-500/20 text-blue-400",   starred:true },
  { id:4, name:"Product_Demo_V1.mp4",            size:"128 MB",  date:"Oct 22",   type:"Video",   icon:FiVideo,    color:"bg-violet-500/20 text-violet-400",starred:false },
  { id:5, name:"Q3_Financial_Report.xlsx",       size:"1.2 MB",  date:"Oct 20",   type:"Sheet",   icon:FiFileText, color:"bg-emerald-500/20 text-emerald-400",starred:false },
  { id:6, name:"Team_Headshots.zip",             size:"78.3 MB", date:"Oct 18",   type:"Archive", icon:FiFolder,   color:"bg-amber-500/20 text-amber-400", starred:false },
  { id:7, name:"Brand_Guidelines.pdf",           size:"5.7 MB",  date:"Oct 15",   type:"PDF",     icon:FiFileText, color:"bg-red-500/20 text-red-400",    starred:true },
  { id:8, name:"Landing_Page_Screenshot.png",    size:"876 KB",  date:"Oct 10",   type:"Image",   icon:FiImage,    color:"bg-blue-500/20 text-blue-400",   starred:false },
];

const FOLDERS = [
  { name:"All Files",   icon:"📁", count:8 },
  { name:"Documents",   icon:"📄", count:3 },
  { name:"Images",      icon:"🖼️", count:2 },
  { name:"Videos",      icon:"🎬", count:1 },
  { name:"Archives",    icon:"📦", count:2 },
  { name:"Starred",     icon:"⭐", count:3 },
];

export default function FilesPage() {
  const [files, setFiles]       = useState<FileItem[]>(FILES);
  const [view, setView]         = useState<"grid"|"list">("grid");
  const [folder, setFolder]     = useState("All Files");
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState<number|null>(null);
  const [contextMenu, setContextMenu] = useState<{id:number;x:number;y:number}|null>(null);
  const [dragging, setDragging] = useState(false);

  const toggleStar = (id: number) => setFiles(p => p.map(f => f.id === id ? {...f, starred:!f.starred} : f));
  const deleteFile = (id: number) => { setFiles(p => p.filter(f => f.id !== id)); if (selected === id) setSelected(null); };

  const filtered = files.filter(f => {
    if (folder === "Starred" && !f.starred) return false;
    if (folder === "Documents" && f.type !== "PDF" && f.type !== "Sheet") return false;
    if (folder === "Images" && f.type !== "Image") return false;
    if (folder === "Videos" && f.type !== "Video") return false;
    if (folder === "Archives" && f.type !== "Archive") return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalSize = files.reduce((a, f) => a + parseFloat(f.size), 0).toFixed(1);

  return (
    <div className="flex h-full bg-[#06060f] overflow-hidden" onClick={() => { setContextMenu(null); setSelected(null); }}>

      {/* Sidebar */}
      <div className="hidden sm:flex w-52 shrink-0 bg-[#08081a] border-r border-white/[0.06] flex-col">
        <div className="px-3 pt-3 pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-xl bg-amber-600/20 flex items-center justify-center">
              <FiFolder className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <h2 className="text-white font-bold text-[13px]">GyanFiles</h2>
          </div>
          <label
            className={cn("w-full flex items-center justify-center gap-2 py-2 rounded-xl cursor-pointer text-[12px] font-bold border transition-all",
              dragging ? "bg-primary/20 border-primary text-primary" : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20")}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); }}
          >
            <FiUpload className="w-3.5 h-3.5" />
            {dragging ? "Drop to upload" : "Upload"}
            <input type="file" multiple className="sr-only" />
          </label>
        </div>

        {/* Storage */}
        <div className="px-3 py-2.5 border-b border-white/[0.06]">
          <div className="flex items-center justify-between text-[10px] text-white/30 mb-1.5">
            <span>Storage Used</span>
            <span className="text-white/50 font-semibold">{totalSize} MB / 200 GB</span>
          </div>
          <div className="h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-blue-600 rounded-full" style={{ width:`${parseFloat(totalSize)/2000*100}%` }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-0.5">
          {FOLDERS.map(f => (
            <button key={f.name} onClick={() => setFolder(f.name)}
              className={cn("w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[12px] font-medium transition-all",
                folder === f.name ? "bg-white/[0.08] text-white" : "text-white/35 hover:bg-white/[0.04] hover:text-white")}>
              <span className="text-[14px]">{f.icon}</span>
              <span className="flex-1 text-left">{f.name}</span>
              <span className="text-[10px] text-white/20">{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <div className="h-12 border-b border-white/[0.06] bg-[#08081a] flex items-center gap-3 px-3 shrink-0">
          <span className="text-white font-bold text-[13px]">{folder}</span>
          <span className="text-white/25 text-[11px]">{filtered.length} items</span>
          <div className="flex-1" />
          <div className="relative">
            <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search files..."
              className="bg-white/[0.04] border border-white/[0.08] rounded-xl pl-7 pr-3 py-1.5 text-white text-[11.5px] w-44 outline-none placeholder:text-white/20 focus:border-white/[0.2] transition-all" />
          </div>
          <button onClick={() => setView(v => v === "grid" ? "list" : "grid")}
            className="p-2 rounded-lg bg-white/[0.04] text-white/40 hover:text-white border border-white/[0.07] transition-all">
            {view === "grid" ? <FiList className="w-3.5 h-3.5" /> : <FiGrid className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Files grid / list */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-2">
              <div className="text-4xl opacity-20">📂</div>
              <div className="text-white/25 text-[13px]">No files in {folder}</div>
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
              {filtered.map(f => (
                <div key={f.id}
                  onClick={e => { e.stopPropagation(); setSelected(f.id); }}
                  onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setContextMenu({ id:f.id, x:e.clientX, y:e.clientY }); }}
                  className={cn("bg-[#0d0d1e] border rounded-2xl p-4 cursor-pointer group transition-all",
                    selected === f.id ? "border-primary/40 ring-1 ring-primary/20" : "border-white/[0.07] hover:border-white/[0.15]")}>
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", f.color)}>
                      <f.icon className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={e => { e.stopPropagation(); toggleStar(f.id); }} className={cn("p-1 rounded-lg transition-all", f.starred ? "text-amber-400" : "text-white/20 hover:text-amber-400")}>
                        <FiStar className="w-3 h-3" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); setContextMenu({ id:f.id, x:e.clientX, y:e.clientY }); }} className="p-1 text-white/20 hover:text-white rounded-lg transition-all">
                        <FiMoreVertical className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-medium text-[11.5px] text-white/70 truncate mb-1" title={f.name}>{f.name}</h3>
                  <div className="flex items-center justify-between text-[10px] text-white/25">
                    <span>{f.size}</span>
                    <span className={cn("font-bold px-1.5 py-0.5 rounded-full text-[8.5px]", f.color)}>{f.type}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map(f => (
                <div key={f.id}
                  onClick={e => { e.stopPropagation(); setSelected(f.id); }}
                  className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer group transition-all",
                    selected === f.id ? "bg-primary/[0.06] ring-1 ring-primary/20" : "hover:bg-white/[0.03]")}>
                  <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0", f.color)}>
                    <f.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white/75 text-[12.5px] font-medium truncate">{f.name}</div>
                    <div className="text-white/25 text-[10.5px]">{f.date} · {f.size}</div>
                  </div>
                  <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full hidden sm:block", f.color)}>{f.type}</span>
                  {f.starred && <FiStar className="w-3 h-3 text-amber-400 shrink-0" />}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={e => { e.stopPropagation(); toggleStar(f.id); }} className="p-1.5 text-white/20 hover:text-amber-400 rounded-lg transition-all">
                      <FiStar className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); deleteFile(f.id); }} className="p-1.5 text-white/20 hover:text-red-400 rounded-lg transition-all">
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div className="fixed z-50 bg-[#0d0d1e] border border-white/[0.1] rounded-xl shadow-xl overflow-hidden"
          style={{ left:contextMenu.x, top:contextMenu.y }} onClick={e => e.stopPropagation()}>
          {[
            { label:"Download",  icon:FiDownload, action:() => {} },
            { label:"Star",      icon:FiStar,     action:() => toggleStar(contextMenu.id) },
            { label:"Delete",    icon:FiTrash2,   action:() => { deleteFile(contextMenu.id); setContextMenu(null); }, danger:true },
          ].map(item => (
            <button key={item.label} onClick={() => { item.action(); setContextMenu(null); }}
              className={cn("flex items-center gap-2.5 w-full px-4 py-2.5 text-[12.5px] hover:bg-white/[0.06] transition-all",
                (item as { danger?: boolean }).danger ? "text-red-400" : "text-white/70")}>
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
