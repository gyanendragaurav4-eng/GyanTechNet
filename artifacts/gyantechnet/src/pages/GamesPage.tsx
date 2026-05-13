import { useState, useEffect, useRef, useCallback } from "react";
import { FiPlay, FiX, FiSearch, FiZap, FiTarget, FiCpu, FiGrid, FiBookOpen, FiTrendingUp } from "react-icons/fi";

type Category = "Arcade" | "Classic" | "Puzzle" | "Action" | "Strategy" | "Brain";
type Game = { id: string; name: string; desc: string; category: Category; bg: string; emoji: string; featured?: boolean };

const GAMES: Game[] = [
  { id:"flappy",    name:"Flappy Bird",    desc:"Tap to fly through pipes without crashing",         category:"Arcade",   bg:"from-cyan-500 to-blue-600",      emoji:"🐦", featured:true },
  { id:"runner",    name:"Endless Runner", desc:"Jump and slide to avoid obstacles forever",          category:"Arcade",   bg:"from-pink-500 to-red-600",        emoji:"🏃" },
  { id:"whack",     name:"Whack-a-Mole",   desc:"Tap the moles before they hide underground",        category:"Arcade",   bg:"from-green-600 to-emerald-700",   emoji:"🔨" },
  { id:"doodle",    name:"Doodle Jump",    desc:"Jump on platforms as high as you can go",           category:"Arcade",   bg:"from-sky-400 to-cyan-600",        emoji:"🚀" },
  { id:"stack",     name:"Stack Tower",    desc:"Drop blocks perfectly to build the tallest tower",  category:"Arcade",   bg:"from-violet-600 to-indigo-700",   emoji:"🏗️" },
  { id:"bounce",    name:"Ball Bounce",    desc:"Smash all bricks with your bouncing ball",          category:"Arcade",   bg:"from-orange-500 to-amber-600",    emoji:"⚽" },
  { id:"dropcatch", name:"Drop Catcher",   desc:"Catch falling treasures, dodge bombs",              category:"Arcade",   bg:"from-teal-500 to-cyan-600",       emoji:"🎁" },
  { id:"heli",      name:"Helicopter",     desc:"Hold to fly through tight tunnels",                 category:"Arcade",   bg:"from-red-500 to-orange-600",      emoji:"🚁" },
  { id:"plane",     name:"Plane Dodger",   desc:"Hold to climb and dodge other planes",              category:"Arcade",   bg:"from-blue-500 to-indigo-600",     emoji:"✈️" },
  { id:"pinball",   name:"Pinball",        desc:"Flip and bounce — hit bumpers for points",          category:"Arcade",   bg:"from-purple-600 to-violet-700",   emoji:"🎱", featured:true },
  { id:"breakout",  name:"Breakout",       desc:"Smash all bricks with your bouncing ball",          category:"Arcade",   bg:"from-rose-500 to-red-600",        emoji:"🧱" },
  { id:"colorswitch",name:"Color Switch",  desc:"Match your ball's color to pass through spinners",  category:"Arcade",   bg:"from-fuchsia-500 to-pink-600",    emoji:"🎨" },
  { id:"lane",      name:"Lane Hopper",    desc:"Switch lanes to dodge incoming traffic",            category:"Arcade",   bg:"from-yellow-500 to-orange-600",   emoji:"🚗" },
  { id:"snake",     name:"Snake",          desc:"Eat food and grow without hitting walls or yourself", category:"Classic", bg:"from-emerald-500 to-green-700",  emoji:"🐍", featured:true },
  { id:"invaders",  name:"Space Invaders", desc:"Shoot alien invaders before they reach Earth",      category:"Classic",  bg:"from-slate-700 to-slate-900",     emoji:"👾" },
  { id:"pacman",    name:"Pac-Man",        desc:"Eat dots and avoid the ghosts",                     category:"Classic",  bg:"from-yellow-500 to-amber-600",    emoji:"👻" },
  { id:"frogger",   name:"Frogger",        desc:"Cross busy roads and rivers safely",                category:"Classic",  bg:"from-teal-500 to-green-700",      emoji:"🐸" },
  { id:"pong",      name:"Pong",           desc:"Classic table tennis against the AI",               category:"Classic",  bg:"from-zinc-700 to-zinc-900",       emoji:"🏓" },
  { id:"tetris",    name:"Tetris",         desc:"Stack falling blocks and clear complete lines",     category:"Puzzle",   bg:"from-purple-600 to-indigo-700",   emoji:"🧩", featured:true },
  { id:"2048",      name:"2048",           desc:"Slide tiles to reach the 2048 tile",                category:"Puzzle",   bg:"from-amber-500 to-orange-600",    emoji:"🔢", featured:true },
  { id:"memory",    name:"Memory Match",   desc:"Flip cards and find all matching pairs",            category:"Puzzle",   bg:"from-fuchsia-600 to-purple-700",  emoji:"🧠", featured:true },
  { id:"maze",      name:"Maze Runner",    desc:"Navigate through a randomly generated maze",        category:"Puzzle",   bg:"from-teal-600 to-cyan-700",       emoji:"🗺️" },
  { id:"match3",    name:"Match 3",        desc:"Swap gems to make matches of 3+",                   category:"Puzzle",   bg:"from-pink-500 to-rose-600",       emoji:"💎", featured:true },
  { id:"mines",     name:"Minesweeper",    desc:"Find all safe squares without hitting a mine",      category:"Puzzle",   bg:"from-slate-600 to-slate-800",     emoji:"💣" },
  { id:"sokoban",   name:"Sokoban",        desc:"Push boxes onto target spots",                      category:"Puzzle",   bg:"from-orange-600 to-amber-700",    emoji:"📦" },
  { id:"sudoku",    name:"Mini Sudoku",    desc:"4×4 sudoku — quick logic puzzle",                   category:"Puzzle",   bg:"from-blue-500 to-indigo-600",     emoji:"🔢" },
  { id:"15puzzle",  name:"15 Puzzle",      desc:"Slide tiles into order to solve the puzzle",        category:"Puzzle",   bg:"from-indigo-500 to-violet-600",   emoji:"🔀" },
  { id:"colorsort", name:"Color Sort",     desc:"Pour liquids to sort by color",                     category:"Puzzle",   bg:"from-green-500 to-teal-600",      emoji:"🧪" },
  { id:"blockpuz",  name:"Block Puzzle",   desc:"Drop blocks to clear lines — Tetris meets Sudoku",  category:"Puzzle",   bg:"from-violet-500 to-purple-700",   emoji:"⬛", featured:true },
  { id:"lightsout", name:"Lights Out",     desc:"Toggle lights to turn them all off",                category:"Puzzle",   bg:"from-yellow-600 to-amber-700",    emoji:"💡" },
  { id:"hanoi",     name:"Tower of Hanoi", desc:"Move all disks to the right peg",                   category:"Puzzle",   bg:"from-red-600 to-orange-700",      emoji:"🗼" },
  { id:"asteroids", name:"Asteroids",      desc:"Blast space rocks in zero gravity",                 category:"Action",   bg:"from-indigo-800 to-slate-900",    emoji:"☄️" },
  { id:"geodash",   name:"Geometry Dash",  desc:"Jump over spikes in this auto-running rhythm game", category:"Action",   bg:"from-violet-600 to-purple-800",   emoji:"🔷", featured:true },
  { id:"neon",      name:"Neon Racer",     desc:"Dodge enemy cars racing at full speed",             category:"Action",   bg:"from-cyan-600 to-blue-800",       emoji:"🏎️" },
  { id:"fruit",     name:"Fruit Slice",    desc:"Swipe to slice fruits, dodge the bombs",            category:"Action",   bg:"from-red-500 to-pink-600",        emoji:"🍎" },
  { id:"tank",      name:"Tank Battle",    desc:"Aim and blast enemy tanks",                         category:"Action",   bg:"from-green-700 to-teal-800",      emoji:"🪖" },
  { id:"sky",       name:"Sky Defender",   desc:"Shoot down waves of enemy ships",                   category:"Action",   bg:"from-blue-600 to-indigo-800",     emoji:"🛸" },
  { id:"ninja",     name:"Ninja Jump",     desc:"Wall-jump to dodge spikes & shurikens",             category:"Action",   bg:"from-slate-700 to-slate-900",     emoji:"🥷" },
  { id:"falling",   name:"Falling Cubes",  desc:"Dodge the colorful cubes raining down",             category:"Action",   bg:"from-rose-700 to-red-900",        emoji:"🟥" },
  { id:"bubble",    name:"Bubble Shooter", desc:"Aim and shoot bubbles to pop matching groups",      category:"Action",   bg:"from-teal-500 to-cyan-700",       emoji:"🫧" },
  { id:"c4",        name:"Connect Four",   desc:"Drop pieces to connect four in a row vs AI",        category:"Strategy", bg:"from-blue-600 to-indigo-700",     emoji:"🔵" },
  { id:"ttt",       name:"Tic-Tac-Toe",    desc:"Classic X vs O — can you beat the AI?",            category:"Strategy", bg:"from-green-600 to-teal-700",      emoji:"❌" },
  { id:"rps",       name:"Rock Paper Scissors", desc:"Classic hand game vs the computer",            category:"Strategy", bg:"from-violet-600 to-purple-700",   emoji:"✊" },
  { id:"gomoku",    name:"Gomoku 5",       desc:"Five-in-a-row vs the AI",                          category:"Strategy", bg:"from-slate-600 to-slate-800",     emoji:"⚫" },
  { id:"nim",       name:"Nim",            desc:"Take stones — don't take the last one!",            category:"Strategy", bg:"from-amber-600 to-orange-700",    emoji:"🪨" },
  { id:"battle",    name:"Battleship",     desc:"Find and sink all enemy ships",                     category:"Strategy", bg:"from-blue-700 to-indigo-900",     emoji:"🚢" },
  { id:"reversi",   name:"Reversi",        desc:"Flip the most discs to win",                        category:"Strategy", bg:"from-emerald-700 to-teal-900",    emoji:"🔄" },
  { id:"dots",      name:"Dots & Boxes",   desc:"Connect dots to claim boxes vs AI",                 category:"Strategy", bg:"from-indigo-500 to-purple-600",   emoji:"⬜" },
  { id:"checkers",  name:"Mini Checkers",  desc:"6×6 checkers vs the AI",                           category:"Strategy", bg:"from-red-600 to-pink-700",        emoji:"🔴" },
  { id:"simon",     name:"Simon Says",     desc:"Remember and repeat the color pattern sequence",   category:"Brain",    bg:"from-emerald-500 to-green-700",   emoji:"🟢" },
  { id:"react",     name:"Reaction Test",  desc:"Test your reaction speed — tap when it turns green", category:"Brain",  bg:"from-yellow-500 to-amber-600",    emoji:"⚡" },
  { id:"wordle",    name:"Word Guess",     desc:"Guess the 5-letter word in 6 tries",               category:"Brain",   bg:"from-green-600 to-emerald-700",   emoji:"🔤" },
  { id:"hangman",   name:"Hangman",        desc:"Guess the word before the man hangs",              category:"Brain",   bg:"from-slate-600 to-slate-800",     emoji:"🪢" },
  { id:"mathquiz",  name:"Math Quiz",      desc:"Solve quick math under time pressure",             category:"Brain",   bg:"from-blue-500 to-indigo-600",     emoji:"➕" },
  { id:"nummem",    name:"Number Memory",  desc:"Remember the digits and type them back",           category:"Brain",   bg:"from-violet-500 to-purple-700",   emoji:"🔢" },
  { id:"typing",    name:"Typing Speed",   desc:"Type words fast and accurately",                   category:"Brain",   bg:"from-teal-500 to-cyan-700",       emoji:"⌨️" },
  { id:"hilo",      name:"Higher / Lower", desc:"Will the next number be higher or lower?",         category:"Brain",   bg:"from-orange-500 to-red-600",      emoji:"📊" },
  { id:"quicktap",  name:"Quick Tap",      desc:"Tap the matching color before time runs out",      category:"Brain",   bg:"from-amber-500 to-orange-600",    emoji:"👆" },
  { id:"anagram",   name:"Anagram",        desc:"Unscramble the letters into a word",               category:"Brain",   bg:"from-purple-600 to-fuchsia-700",  emoji:"🔡" },
  { id:"spotcolor", name:"Spot the Color", desc:"Find the odd-colored tile fast",                   category:"Brain",   bg:"from-teal-500 to-green-700",      emoji:"🎨" },
  { id:"equation",  name:"Equation Builder",desc:"Build the equation to hit the target number",     category:"Brain",   bg:"from-blue-600 to-indigo-700",     emoji:"🧮" },
  { id:"pattern",   name:"Pattern Match",  desc:"Spot the next shape in the sequence",              category:"Brain",   bg:"from-pink-600 to-rose-700",       emoji:"🔷" },
];

const CAT_COUNTS: Record<string,number> = { All:62, Arcade:13, Classic:5, Puzzle:13, Action:9, Strategy:9, Brain:13 };
const FEATURED = GAMES.filter(g => g.featured);

function Btn({ onClick, children, cls="px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-bold transition-all" }: { onClick:()=>void; children:React.ReactNode; cls?:string }) {
  return <button onClick={onClick} className={cls}>{children}</button>;
}

// ─────────────────────────────────────────────────────────
// CSS 3D HELPERS (for board/strategy/brain games)
// ─────────────────────────────────────────────────────────
const board3D: React.CSSProperties = { perspective: "700px" };
const tilt3D: React.CSSProperties = { transform: "rotateX(10deg)", transformStyle: "preserve-3d" };
const tile3D: React.CSSProperties = { transform: "translateZ(6px)", boxShadow: "0 6px 0 rgba(0,0,0,0.45), 0 8px 16px rgba(0,0,0,0.25)" };
const piece3D: React.CSSProperties = { transform: "translateZ(10px)", boxShadow: "0 8px 0 rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.25)" };
const btn3D: React.CSSProperties = { transform: "translateZ(8px)", boxShadow: "0 6px 0 rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)", transition: "all 0.1s" };
const sphereCSS = (color: string): React.CSSProperties => ({
  background: color,
  boxShadow: `inset -3px -3px 8px rgba(0,0,0,0.4), inset 3px 3px 6px rgba(255,255,255,0.25), 0 3px 6px rgba(0,0,0,0.4)`,
  border: "1px solid rgba(255,255,255,0.2)"
});

// ─────────────────────────────────────────────────────────
// CANVAS 2D DRAWING HELPERS
// ─────────────────────────────────────────────────────────
type C2D = CanvasRenderingContext2D;

function rr(ctx: C2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
  ctx.arcTo(x+w,y,x+w,y+r,r); ctx.lineTo(x+w,y+h-r);
  ctx.arcTo(x+w,y+h,x+w-r,y+h,r); ctx.lineTo(x+r,y+h);
  ctx.arcTo(x,y+h,x,y+h-r,r); ctx.lineTo(x,y+r);
  ctx.arcTo(x,y,x+r,y,r); ctx.closePath();
}
function noShadow(ctx: C2D) { ctx.shadowColor="transparent"; ctx.shadowBlur=0; ctx.shadowOffsetX=0; ctx.shadowOffsetY=0; }
function setShadow(ctx: C2D, c: string, b: number, ox=0, oy=3) { ctx.shadowColor=c; ctx.shadowBlur=b; ctx.shadowOffsetX=ox; ctx.shadowOffsetY=oy; }
function lgrad(ctx: C2D, x1:number,y1:number,x2:number,y2:number,stops:[number,string][]) {
  const g=ctx.createLinearGradient(x1,y1,x2,y2); stops.forEach(([p,c])=>g.addColorStop(p,c)); return g;
}
function rgrad(ctx: C2D, cx:number,cy:number,r0:number,r1:number,stops:[number,string][]) {
  const g=ctx.createRadialGradient(cx,cy,r0,cx,cy,r1); stops.forEach(([p,c])=>g.addColorStop(p,c)); return g;
}
function drawStar(ctx: C2D, x: number, y: number, r: number, alpha: number) {
  ctx.globalAlpha=alpha; ctx.fillStyle="white";
  ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
}
function makeStars(W: number, H: number, n=80): {x:number,y:number,r:number,a:number}[] {
  return Array.from({length:n},()=>({x:Math.random()*W,y:Math.random()*H,r:0.5+Math.random()*1.5,a:0.3+Math.random()*0.7}));
}

// ─────────────────────────────────────────────────────────
// SPRITE DRAWING FUNCTIONS
// ─────────────────────────────────────────────────────────

function drawBird(ctx: C2D, x: number, y: number, alive=true, frame=0) {
  ctx.save();
  const wo = Math.sin(frame*0.4)*5;
  const wg = lgrad(ctx,x-13,y+3+wo,x+5,y+10+wo,[[0,'#E8A820'],[1,'#C47B10']]);
  ctx.fillStyle=wg; ctx.beginPath(); ctx.ellipse(x-4,y+5+wo,10,6,-0.3,0,Math.PI*2); ctx.fill();
  setShadow(ctx,'rgba(0,0,0,0.3)',6,0,2);
  ctx.fillStyle=rgrad(ctx,x-4,y-4,1,14,[[0,'#FFE66D'],[0.6,'#F5A623'],[1,'#E8921F']]);
  ctx.beginPath(); ctx.arc(x,y,13,0,Math.PI*2); ctx.fill(); noShadow(ctx);
  ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.beginPath(); ctx.ellipse(x+1,y+5,7,5,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='white'; ctx.beginPath(); ctx.arc(x+5,y-3,5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=alive?'#1a1a2e':'#ef4444'; ctx.beginPath(); ctx.arc(x+6,y-3,2.5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='white'; ctx.beginPath(); ctx.arc(x+7.5,y-4.5,1.2,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#FF6B35';
  ctx.beginPath(); ctx.moveTo(x+11,y+1); ctx.lineTo(x+21,y-1); ctx.lineTo(x+11,y+5); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='#CC4400'; ctx.lineWidth=0.8;
  ctx.beginPath(); ctx.moveTo(x+11,y+3); ctx.lineTo(x+20,y-0.5); ctx.stroke();
  ctx.restore();
}

function drawPipe(ctx: C2D, px: number, top: number, bottom: number, H: number) {
  const PW=44; ctx.save();
  const pg=lgrad(ctx,px-PW/2,0,px+PW/2,0,[[0,'#1a7a2f'],[0.25,'#3CB54A'],[0.75,'#27AE60'],[1,'#1a5c28']]);
  ctx.fillStyle=pg;
  if(top>0){ctx.fillRect(px-PW/2,0,PW,top-18);}
  ctx.fillRect(px-PW/2,bottom+18,PW,H-bottom-18);
  const cg=lgrad(ctx,px-PW/2-6,0,px+PW/2+6,0,[[0,'#155924'],[0.3,'#4CAF50'],[0.7,'#4CAF50'],[1,'#155924']]);
  ctx.fillStyle=cg;
  rr(ctx,px-PW/2-6,top-18,PW+12,20,4); ctx.fill();
  rr(ctx,px-PW/2-6,bottom-2,PW+12,20,4); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.15)';
  if(top>0){ctx.fillRect(px-PW/2+4,0,8,top-18);}
  ctx.fillRect(px-PW/2+4,bottom+18,8,H-bottom-18);
  ctx.restore();
}

function drawSkyBg(ctx: C2D, W: number, H: number) {
  ctx.fillStyle=lgrad(ctx,0,0,0,H*0.72,[[0,'#4FC3F7'],[0.5,'#81D4FA'],[1,'#B3E5FC']]);
  ctx.fillRect(0,0,W,H*0.72);
  ctx.fillStyle=lgrad(ctx,0,H*0.72,0,H,[[0,'#9CCC65'],[0.12,'#7CB342'],[0.3,'#558B2F'],[1,'#33691E']]);
  ctx.fillRect(0,H*0.72,W,H*0.28);
}

function drawCloud(ctx: C2D, x: number, y: number, s: number) {
  ctx.save(); ctx.fillStyle='rgba(255,255,255,0.85)';
  ctx.beginPath(); ctx.arc(x,y,s*0.6,0,Math.PI*2); ctx.arc(x+s*0.6,y-s*0.15,s*0.45,0,Math.PI*2); ctx.arc(x+s*1.1,y,s*0.4,0,Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawGlowBall(ctx: C2D, x: number, y: number, r: number, col: string, glow?: string) {
  ctx.save();
  if(glow){ctx.shadowColor=glow; ctx.shadowBlur=r*2;}
  ctx.fillStyle=rgrad(ctx,x-r*0.3,y-r*0.3,0,r,[[0,'rgba(255,255,255,0.9)'],[0.25,col],[1,col+'aa']]);
  ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill(); noShadow(ctx);
  ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.beginPath(); ctx.ellipse(x-r*0.2,y-r*0.3,r*0.35,r*0.2,-0.8,0,Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawBrick(ctx: C2D, x: number, y: number, w: number, h: number, col: string) {
  ctx.save();
  ctx.fillStyle=lgrad(ctx,x,y,x,y+h,[[0,col+'ff'],[1,col+'99']]);
  rr(ctx,x,y,w,h,3); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.fillRect(x+2,y+1,w-4,3);
  ctx.fillStyle='rgba(0,0,0,0.25)'; ctx.fillRect(x+2,y+h-3,w-4,2);
  ctx.strokeStyle='rgba(0,0,0,0.3)'; ctx.lineWidth=1;
  rr(ctx,x,y,w,h,3); ctx.stroke();
  ctx.restore();
}

function drawSpaceShip(ctx: C2D, x: number, y: number) {
  ctx.save();
  const body=lgrad(ctx,x-18,y,x+18,y,[[0,'#5b21b6'],[0.5,'#a78bfa'],[1,'#5b21b6']]);
  ctx.fillStyle=body;
  ctx.beginPath(); ctx.moveTo(x,y-28); ctx.lineTo(x+18,y+14); ctx.lineTo(x+6,y+8); ctx.lineTo(x,y+16); ctx.lineTo(x-6,y+8); ctx.lineTo(x-18,y+14); ctx.closePath(); ctx.fill();
  ctx.fillStyle=lgrad(ctx,x-4,y-20,x+4,y+10,[[0,'#c4b5fd'],[1,'#7c3aed']]);
  ctx.beginPath(); ctx.moveTo(x,y-20); ctx.lineTo(x+6,y+8); ctx.lineTo(x-6,y+8); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#22d3ee'; ctx.shadowColor='#22d3ee'; ctx.shadowBlur=8;
  ctx.beginPath(); ctx.ellipse(x,y+14,6,3,0,0,Math.PI*2); ctx.fill(); noShadow(ctx);
  ctx.restore();
}

function drawAlien(ctx: C2D, x: number, y: number, type: number, frame: number) {
  ctx.save();
  const cols=['#22d3ee','#a78bfa','#34d399'];
  const c=cols[type%3];
  ctx.fillStyle=c;
  if(type===0){
    ctx.beginPath(); ctx.arc(x,y,9,0,Math.PI*2); ctx.fill();
    const legOff=frame%2===0?2:-2;
    ctx.fillStyle=c; ctx.fillRect(x-10,y+6,4,5+legOff); ctx.fillRect(x+6,y+6,4,5-legOff);
    ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.arc(x-3,y-2,2,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(x+3,y-2,2,0,Math.PI*2); ctx.fill();
  } else if(type===1){
    rr(ctx,x-9,y-8,18,14,3); ctx.fill();
    ctx.fillStyle='rgba(0,0,0,0.4)'; ctx.fillRect(x-6,y-4,4,5); ctx.fillRect(x+2,y-4,4,5);
    const ao=frame%2===0?3:-3;
    ctx.fillStyle=c; ctx.fillRect(x-12,y-5,3,7+ao); ctx.fillRect(x+9,y-5,3,7-ao);
  } else {
    ctx.beginPath(); ctx.moveTo(x,y-10); ctx.lineTo(x+10,y+6); ctx.lineTo(x-10,y+6); ctx.closePath(); ctx.fill();
    ctx.fillStyle='rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2); ctx.fill();
  }
  ctx.restore();
}

function drawCar(ctx: C2D, x: number, y: number, w: number, h: number, col: string) {
  ctx.save();
  ctx.fillStyle=lgrad(ctx,x,y,x+w,y,[[0,col+'cc'],[0.5,col],[1,col+'cc']]);
  rr(ctx,x,y,w,h,6); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.15)';
  rr(ctx,x+4,y+4,w*0.42,h*0.3,3); ctx.fill();
  rr(ctx,x+w*0.5+2,y+4,w*0.42,h*0.3,3); ctx.fill();
  ctx.fillStyle='rgba(0,0,0,0.6)';
  ctx.beginPath(); ctx.arc(x+10,y+h,7,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+w-10,y+h,7,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#fbbf24'; ctx.shadowColor='#fbbf24'; ctx.shadowBlur=5;
  ctx.beginPath(); ctx.arc(x+8,y+h/2,3,0,Math.PI*2); ctx.fill();
  ctx.shadowBlur=0; ctx.fillStyle='#ef4444';
  ctx.beginPath(); ctx.arc(x+w-8,y+h/2,3,0,Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawHelicopter(ctx: C2D, x: number, y: number, frame: number) {
  ctx.save();
  const rOff=Math.sin(frame*0.3)*4;
  ctx.fillStyle=lgrad(ctx,x,y-15,x,y+8,[[0,'#a78bfa'],[1,'#7c3aed']]);
  rr(ctx,x-18,y-8,36,16,8); ctx.fill();
  ctx.fillStyle='#5b21b6'; rr(ctx,x+14,y-6,10,12,4); ctx.fill();
  ctx.fillStyle='rgba(100,180,255,0.5)'; rr(ctx,x-12,y-6,14,10,3); ctx.fill();
  ctx.fillStyle='#c4b5fd';
  ctx.save(); ctx.translate(x,y-12); ctx.rotate(rOff*0.1);
  ctx.fillRect(-30,-2,60,4); ctx.restore();
  ctx.fillStyle='#8b5cf6';
  ctx.beginPath(); ctx.moveTo(x+24,y-1); ctx.lineTo(x+35,y-5); ctx.lineTo(x+35,y+1); ctx.closePath(); ctx.fill();
  ctx.fillStyle='rgba(200,240,255,0.9)'; ctx.beginPath(); ctx.ellipse(x-5,y-3,4,5,0,0,Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawPlane(ctx: C2D, x: number, y: number, col: string, flip=false) {
  ctx.save(); if(flip){ctx.scale(-1,1); ctx.translate(-x*2,0);}
  ctx.fillStyle=lgrad(ctx,x-22,y,x+22,y,[[0,col+'99'],[0.5,col],[1,col+'99']]);
  rr(ctx,x-22,y-7,44,14,7); ctx.fill();
  ctx.fillStyle=col+'bb';
  ctx.beginPath(); ctx.moveTo(x-8,y-7); ctx.lineTo(x+8,y-7); ctx.lineTo(x+4,y-20); ctx.lineTo(x-4,y-20); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x-22,y+4); ctx.lineTo(x-8,y+4); ctx.lineTo(x-4,y+12); ctx.lineTo(x-16,y+12); ctx.closePath(); ctx.fill();
  ctx.fillStyle='rgba(150,220,255,0.6)'; rr(ctx,x-10,y-5,12,10,4); ctx.fill();
  ctx.fillStyle='#ff8c00'; ctx.shadowColor='#ff8c00'; ctx.shadowBlur=8;
  ctx.beginPath(); ctx.ellipse(x-25,y,4,3,0,0,Math.PI*2); ctx.fill(); noShadow(ctx);
  ctx.restore();
}

// ─────────────────────────────────────────────────────────
// GAME THUMBNAIL COMPONENT
// ─────────────────────────────────────────────────────────

function drawThumbScene(id: string, ctx: C2D, W: number, H: number) {
  const drawers: Record<string, ()=>void> = {
    flappy: ()=>{
      ctx.fillStyle=lgrad(ctx,0,0,0,H*0.72,[[0,'#4FC3F7'],[1,'#B3E5FC']]); ctx.fillRect(0,0,W,H*0.72);
      drawCloud(ctx,W*0.1,H*0.15,14); drawCloud(ctx,W*0.6,H*0.1,11);
      ctx.fillStyle=lgrad(ctx,0,H*0.72,0,H,[[0,'#9CCC65'],[1,'#558B2F']]); ctx.fillRect(0,H*0.72,W,H*0.28);
      ctx.fillStyle='#4CAF50';
      ctx.fillRect(W*0.62,0,16,H*0.34); ctx.fillRect(W*0.59,H*0.34-6,22,7);
      ctx.fillRect(W*0.62,H*0.54,16,H*0.2); ctx.fillRect(W*0.59,H*0.54,22,7);
      ctx.fillStyle='#FFE66D'; ctx.beginPath(); ctx.arc(W*0.28,H*0.45,8,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#FF6B35'; ctx.beginPath(); ctx.moveTo(W*0.28+7,H*0.45); ctx.lineTo(W*0.28+13,H*0.45-2); ctx.lineTo(W*0.28+7,H*0.45+4); ctx.closePath(); ctx.fill();
      ctx.fillStyle='white'; ctx.beginPath(); ctx.arc(W*0.28+3,H*0.45-3,3,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(W*0.28+4,H*0.45-3,1.5,0,Math.PI*2); ctx.fill();
    },
    runner: ()=>{
      ctx.fillStyle=lgrad(ctx,0,0,0,H,[[0,'#1a1a2e'],[1,'#16213e']]); ctx.fillRect(0,0,W,H);
      for(let i=0;i<4;i++){ctx.fillStyle=`rgba(100,120,200,${0.15+i*0.05})`; ctx.fillRect(i*W/4,H*0.2,W/4-2,H*0.5);}
      ctx.fillStyle='#334155'; ctx.fillRect(0,H*0.75,W,H*0.25);
      ctx.strokeStyle='#4b5563'; ctx.lineWidth=1; ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(0,H*0.75); ctx.lineTo(W,H*0.75); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle='#818cf8'; rr(ctx,W*0.2,H*0.52,12,18,3); ctx.fill();
      ctx.fillStyle='#fbbf24'; ctx.beginPath(); ctx.arc(W*0.2+6,H*0.52-7,7,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#ef4444'; rr(ctx,W*0.65,H*0.55,14,20,2); ctx.fill();
    },
    snake: ()=>{
      ctx.fillStyle='#0d1117'; ctx.fillRect(0,0,W,H);
      for(let i=0;i<W;i+=8){ctx.strokeStyle='rgba(255,255,255,0.04)'; ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,H); ctx.stroke();}
      for(let j=0;j<H;j+=8){ctx.beginPath(); ctx.moveTo(0,j); ctx.lineTo(W,j); ctx.stroke();}
      const segs=[{x:4,y:4},{x:3,y:4},{x:2,y:4},{x:2,y:3},{x:2,y:2},{x:3,y:2},{x:4,y:2},{x:4,y:1}];
      segs.forEach((s,i)=>{ctx.fillStyle=i===0?'#4ade80':'#22c55e'; rr(ctx,s.x*10+W/2-20,s.y*10+H/2-20,9,9,3); ctx.fill();});
      ctx.fillStyle='#ef4444'; ctx.beginPath(); ctx.arc(W*0.72,H*0.38,5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#86efac'; ctx.beginPath(); ctx.arc(segs[0].x*10+W/2-20+4,segs[0].y*10+H/2-20+3,2,0,Math.PI*2); ctx.fill();
    },
    tetris: ()=>{
      ctx.fillStyle='#0f172a'; ctx.fillRect(0,0,W,H);
      const pieces=[{x:1,y:0,w:4,h:1,c:'#22d3ee'},{x:0,y:1,w:2,h:2,c:'#fbbf24'},{x:2,y:1,w:1,h:2,c:'#7c3aed'},{x:3,y:1,w:2,h:1,c:'#22c55e'}];
      const SZ=12;
      pieces.forEach(p=>{ctx.fillStyle=p.c; for(let r=0;r<p.h;r++)for(let c=0;c<p.w;c++){rr(ctx,p.x*SZ+c*SZ+4,p.y*SZ+r*SZ+H/2-40,SZ-2,SZ-2,2); ctx.fill(); ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.fillRect(p.x*SZ+c*SZ+5,p.y*SZ+r*SZ+H/2-39,SZ-4,2); ctx.fillStyle=p.c;}});
      const bottom=[[0,'#ef4444'],[1,'#f97316'],[2,'#22c55e'],[3,'#3b82f6'],[4,'#a855f7']];
      bottom.forEach(([c,col])=>{ctx.fillStyle=col as string; rr(ctx,(c as number)*SZ+4,H*0.6,SZ-2,H*0.4-4,2); ctx.fill();});
    },
    "2048": ()=>{
      ctx.fillStyle='#1c1007'; ctx.fillRect(0,0,W,H);
      const tiles=[{v:2048,c:'#7c3aed'},{v:512,c:'#d97706'},{v:128,c:'#b45309'},{v:32,c:'#f97316'},{v:16,c:'#ef4444'},{v:8,c:'#dc2626'},{v:4,c:'#fde68a'},{v:2,c:'#fef3c7'},{v:2,c:'#fef3c7'}];
      tiles.forEach((t,i)=>{
        const col=i%3, row=Math.floor(i/3);
        ctx.fillStyle=t.c; rr(ctx,4+col*26,4+row*26,24,24,4); ctx.fill();
        ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.font=`bold ${t.v>99?8:t.v>9?9:11}px sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(String(t.v),4+col*26+12,4+row*26+12);
        ctx.fillStyle='white'; ctx.font=`bold ${t.v>99?7:t.v>9?8:10}px sans-serif`;
        ctx.fillText(String(t.v),4+col*26+12,4+row*26+12);
      });
    },
    memory: ()=>{
      ctx.fillStyle='#1a0a2e'; ctx.fillRect(0,0,W,H);
      const emojis=['🐶','🐱','🦊','🐻','?','?','?','?'];
      emojis.forEach((e,i)=>{
        const c=i%4, r=Math.floor(i/4);
        ctx.fillStyle=i<4?'#7c3aed':'rgba(255,255,255,0.1)'; rr(ctx,2+c*20,H/2-30+r*24,18,18,4); ctx.fill();
        if(i<4){ctx.font='11px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(e,2+c*20+9,H/2-30+r*24+9);}
        else{ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.font='bold 10px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('?',2+c*20+9,H/2-30+r*24+9);}
      });
    },
    match3: ()=>{
      ctx.fillStyle='#0d0d1e'; ctx.fillRect(0,0,W,H);
      const colors=['#ef4444','#3b82f6','#22c55e','#fbbf24','#a855f7','#ec4899'];
      for(let r=0;r<4;r++)for(let c=0;c<4;c++){
        const col=colors[(r*4+c+r)%6];
        setShadow(ctx,col,4); ctx.fillStyle=rgrad(ctx,4+c*20+5,H/2-40+r*20+5,1,9,[[0,'white'],[0.3,col],[1,col+'66']]);
        ctx.beginPath(); ctx.arc(4+c*20+9,H/2-40+r*20+9,8,0,Math.PI*2); ctx.fill(); noShadow(ctx);
      }
    },
    breakout: ()=>{
      ctx.fillStyle='#020817'; ctx.fillRect(0,0,W,H);
      makeStars(W,H,30).forEach(s=>drawStar(ctx,s.x,s.y,s.r,s.a));
      const bw=[[5,'#ef4444'],[5,'#f97316'],[5,'#fbbf24'],[5,'#22c55e'],[5,'#3b82f6']];
      bw.forEach(([cnt,c],ri)=>{for(let ci=0;ci<(cnt as number);ci++){drawBrick(ctx,4+ci*16,H*0.1+ri*11,14,9,c as string);}});
      ctx.fillStyle=lgrad(ctx,W*0.25,H*0.8,W*0.75,H*0.8,[[0,'#4a5568'],[0.5,'#7c3aed'],[1,'#4a5568']]);
      rr(ctx,W*0.22,H*0.8,W*0.56,7,4); ctx.fill();
      drawGlowBall(ctx,W*0.5,H*0.65,5,'#fbbf24','#fbbf2488');
    },
    pinball: ()=>{
      ctx.fillStyle=lgrad(ctx,0,0,0,H,[[0,'#0a0a1a'],[1,'#0f1a2f']]); ctx.fillRect(0,0,W,H);
      [{x:W*0.3,y:H*0.3,r:12,c:'#7c3aed'},{x:W*0.7,y:H*0.3,r:12,c:'#ec4899'},{x:W*0.5,y:H*0.2,r:10,c:'#22d3ee'}].forEach(b=>{
        setShadow(ctx,b.c,10); ctx.fillStyle=b.c; ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill(); noShadow(ctx);
        ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.arc(b.x-3,b.y-3,b.r*0.35,0,Math.PI*2); ctx.fill();
      });
      drawGlowBall(ctx,W*0.5,H*0.55,6,'#fbbf24','#fbbf2466');
      ctx.fillStyle='#4f46e5'; rr(ctx,W*0.1,H*0.8,W*0.28,10,5); ctx.fill(); rr(ctx,W*0.62,H*0.8,W*0.28,10,5); ctx.fill();
    },
    invaders: ()=>{
      ctx.fillStyle='#020817'; ctx.fillRect(0,0,W,H);
      makeStars(W,H,40).forEach(s=>drawStar(ctx,s.x,s.y,s.r,s.a));
      for(let r=0;r<3;r++)for(let c=0;c<5;c++){
        ctx.fillStyle=['#22d3ee','#a78bfa','#34d399'][r];
        const ax=8+c*16, ay=8+r*14;
        ctx.beginPath(); ctx.arc(ax+5,ay+5,6,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.arc(ax+3,ay+4,1.5,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(ax+7,ay+4,1.5,0,Math.PI*2); ctx.fill();
      }
      drawSpaceShip(ctx,W/2,H*0.82);
    },
    pong: ()=>{
      ctx.fillStyle='#0f172a'; ctx.fillRect(0,0,W,H);
      ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=2; ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(W/2,0); ctx.lineTo(W/2,H); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle='#7c3aed'; rr(ctx,6,H/2-18,10,36,5); ctx.fill();
      ctx.fillStyle='#ef4444'; rr(ctx,W-16,H/2-18,10,36,5); ctx.fill();
      drawGlowBall(ctx,W*0.6,H*0.45,6,'white','rgba(255,255,255,0.4)');
    },
    frogger: ()=>{
      ctx.fillStyle='#16a34a'; ctx.fillRect(0,0,W,H*0.2); ctx.fillRect(0,H*0.8,W,H*0.2);
      ctx.fillStyle='#374151'; ctx.fillRect(0,H*0.2,W,H*0.6);
      ctx.strokeStyle='#fbbf24'; ctx.lineWidth=1; ctx.setLineDash([6,4]);
      ctx.beginPath(); ctx.moveTo(0,H/2); ctx.lineTo(W,H/2); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle='#22c55e'; ctx.beginPath(); ctx.arc(W/2,H*0.85,7,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#86efac'; ctx.beginPath(); ctx.arc(W/2-3,H*0.85-4,2,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(W/2+3,H*0.85-4,2,0,Math.PI*2); ctx.fill();
      drawCar(ctx,W*0.1,H*0.35,24,12,'#ef4444'); drawCar(ctx,W*0.6,H*0.6,24,12,'#3b82f6');
    },
    asteroids: ()=>{
      ctx.fillStyle='#020817'; ctx.fillRect(0,0,W,H);
      makeStars(W,H,50).forEach(s=>drawStar(ctx,s.x,s.y,s.r,s.a));
      ctx.strokeStyle='#94a3b8'; ctx.lineWidth=1.5;
      [[W*0.2,H*0.3,18],[W*0.7,H*0.2,12],[W*0.6,H*0.7,15]].forEach(([x,y,r])=>{
        ctx.beginPath(); ctx.moveTo(x,y-r); ctx.lineTo(x+r*0.7,y-r*0.3); ctx.lineTo(x+r,y+r*0.4); ctx.lineTo(x+r*0.3,y+r); ctx.lineTo(x-r*0.4,y+r*0.7); ctx.lineTo(x-r,y); ctx.lineTo(x-r*0.5,y-r*0.6); ctx.closePath(); ctx.stroke();
      });
      ctx.strokeStyle='#a78bfa'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(W/2,H*0.6); ctx.lineTo(W/2+10,H*0.76); ctx.lineTo(W/2-10,H*0.76); ctx.closePath(); ctx.stroke();
    },
    geodash: ()=>{
      ctx.fillStyle=lgrad(ctx,0,0,0,H,[[0,'#1a0533'],[1,'#2d1065']]); ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#7c3aed'; ctx.fillRect(0,H*0.72,W,H*0.28);
      ctx.save(); ctx.translate(W*0.25,H*0.62); ctx.rotate(0.4);
      ctx.fillStyle='#60a5fa'; rr(ctx,-9,-9,18,18,3); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.fillRect(-6,-6,8,3); ctx.restore();
      const spikes=[W*0.5,W*0.65,W*0.78];
      spikes.forEach(sx=>{ctx.fillStyle='#ef4444'; ctx.beginPath(); ctx.moveTo(sx,H*0.72); ctx.lineTo(sx+8,H*0.72); ctx.lineTo(sx+4,H*0.52); ctx.closePath(); ctx.fill();});
    },
    neon: ()=>{
      ctx.fillStyle='#0a0a14'; ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#1e293b'; ctx.fillRect(W*0.15,0,W*0.7,H);
      const neonLines=['#22d3ee','#a855f7','#22d3ee'];
      [W*0.15,W/2,W*0.85].forEach((x,i)=>{ctx.strokeStyle=neonLines[i]; ctx.lineWidth=1; ctx.shadowColor=neonLines[i]; ctx.shadowBlur=5; ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); noShadow(ctx);});
      ctx.fillStyle='#7c3aed'; setShadow(ctx,'#7c3aed',8); rr(ctx,W/2-10,H*0.7,20,28,4); ctx.fill(); noShadow(ctx);
      ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.fillRect(W/2-6,H*0.74,8,6);
      const ecolors=['#ef4444','#22c55e'];
      ecolors.forEach((ec,i)=>{ctx.fillStyle=ec; rr(ctx,W*(i===0?0.18:0.58)-10,H*0.25,20,28,4); ctx.fill();});
    },
    fruit: ()=>{
      ctx.fillStyle='#0f172a'; ctx.fillRect(0,0,W,H);
      [[W*0.2,H*0.3,'#ef4444'],[W*0.55,H*0.2,'#f97316'],[W*0.4,H*0.6,'#22c55e'],[W*0.7,H*0.55,'#eab308']].forEach(([x,y,c])=>{
        drawGlowBall(ctx,x as number,y as number,12,c as string,c+'66');
        ctx.fillStyle='#22c55e'; ctx.fillRect((x as number)-2,(y as number)-20,3,8);
        ctx.fillStyle=c as string; ctx.font='8px sans-serif'; ctx.textAlign='center'; ctx.fillText('✕',(x as number),(y as number));
      });
      ctx.strokeStyle='rgba(255,255,255,0.8)'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(W*0.05,H*0.4); ctx.lineTo(W*0.85,H*0.3); ctx.stroke();
    },
    tank: ()=>{
      ctx.fillStyle='#1a2e1a'; ctx.fillRect(0,0,W,H);
      for(let i=0;i<W;i+=12)for(let j=0;j<H;j+=12){if((i/12+j/12)%2===0){ctx.fillStyle='rgba(0,0,0,0.15)'; ctx.fillRect(i,j,12,12);}}
      ctx.fillStyle='#22c55e'; rr(ctx,W/2-14,H*0.65,28,22,4); ctx.fill();
      ctx.fillStyle='#16a34a'; ctx.beginPath(); ctx.arc(W/2,H*0.65+11,7,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#4ade80'; ctx.fillRect(W/2-2,H*0.65+11-14,4,14);
      ctx.fillStyle='#ef4444'; rr(ctx,W*0.18-12,H*0.3,24,18,4); ctx.fill();
      ctx.fillStyle='#dc2626'; ctx.fillRect(W*0.18-2,H*0.3+4,4,12);
    },
    sky: ()=>{
      ctx.fillStyle='#020817'; ctx.fillRect(0,0,W,H);
      makeStars(W,H,40).forEach(s=>drawStar(ctx,s.x,s.y,s.r,s.a));
      drawSpaceShip(ctx,W/2,H*0.8);
      [[W*0.2,H*0.2],[W*0.6,H*0.15],[W*0.8,H*0.3]].forEach(([x,y])=>{
        ctx.fillStyle='#22d3ee'; setShadow(ctx,'#22d3ee',6);
        ctx.beginPath(); ctx.ellipse(x as number,y as number,10,6,0,0,Math.PI*2); ctx.fill(); noShadow(ctx);
        ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect((x as number)-4,(y as number)-2,8,4);
      });
    },
    ninja: ()=>{
      ctx.fillStyle='#0f172a'; ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#1e293b'; ctx.fillRect(0,0,12,H); ctx.fillRect(W-12,0,12,H);
      ctx.fillStyle='#334155';
      ctx.beginPath(); ctx.moveTo(16,H*0.35); ctx.lineTo(W-16,H*0.35); ctx.lineTo(W-16,H*0.42); ctx.lineTo(16,H*0.42); ctx.fill();
      ctx.beginPath(); ctx.moveTo(16,H*0.6); ctx.lineTo(W-16,H*0.6); ctx.lineTo(W-16,H*0.67); ctx.lineTo(16,H*0.67); ctx.fill();
      ctx.fillStyle='#1e293b'; ctx.beginPath(); ctx.arc(W/2,H*0.22,7,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#334155'; rr(ctx,W/2-6,H*0.28,12,16,3); ctx.fill();
      ctx.strokeStyle='#a78bfa'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(W*0.6,H*0.2); ctx.lineTo(W*0.7,H*0.3); ctx.moveTo(W*0.65,H*0.2); ctx.lineTo(W*0.75,H*0.3); ctx.stroke();
    },
    falling: ()=>{
      ctx.fillStyle='#0f172a'; ctx.fillRect(0,0,W,H);
      [['#ef4444',W*0.15,H*0.15],['#3b82f6',W*0.55,H*0.08],['#a855f7',W*0.35,H*0.3],['#22d3ee',W*0.72,H*0.25],['#f97316',W*0.2,H*0.5]].forEach(([c,x,y])=>{
        ctx.save(); ctx.translate(x as number,y as number); ctx.rotate(0.4);
        setShadow(ctx,c as string,6); ctx.fillStyle=c as string; rr(ctx,-8,-8,16,16,3); ctx.fill(); noShadow(ctx);
        ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.fillRect(-5,-5,6,3); ctx.restore();
      });
      ctx.fillStyle='#a78bfa'; setShadow(ctx,'#a78bfa',10); ctx.beginPath(); ctx.arc(W/2,H*0.82,9,0,Math.PI*2); ctx.fill(); noShadow(ctx);
    },
    bubble: ()=>{
      ctx.fillStyle=lgrad(ctx,0,0,0,H,[[0,'#0a2a3a'],[1,'#042030']]); ctx.fillRect(0,0,W,H);
      const gc=[['#ef4444',W*0.1,H*0.1],['#3b82f6',W*0.35,H*0.1],['#22c55e',W*0.6,H*0.1],['#fbbf24',W*0.82,H*0.1],['#a855f7',W*0.22,H*0.25],['#ef4444',W*0.5,H*0.25],['#3b82f6',W*0.72,H*0.25]];
      gc.forEach(([c,x,y])=>{drawGlowBall(ctx,x as number,y as number,9,c as string,c+'44');});
      drawGlowBall(ctx,W/2,H*0.82,10,'#22c55e','#22c55e55');
      ctx.strokeStyle='rgba(100,200,255,0.3)'; ctx.lineWidth=1; ctx.setLineDash([2,2]);
      ctx.beginPath(); ctx.moveTo(W/2,H*0.72); ctx.lineTo(W/2,H*0.5); ctx.stroke(); ctx.setLineDash([]);
    },
    c4: ()=>{
      ctx.fillStyle='#1d4ed8'; ctx.fillRect(0,0,W,H);
      for(let r=0;r<4;r++)for(let c=0;c<5;c++){
        const v=r===3&&c===1?1:r===3&&c===2?1:r===3&&c===3?1:r===2&&c===3?1:r===3&&c===4?2:r===2&&c===4?2:0;
        ctx.fillStyle=v===1?'#ef4444':v===2?'#fbbf24':'#1e40af'; ctx.beginPath(); ctx.arc(8+c*16,10+r*14,6,0,Math.PI*2); ctx.fill();
      }
    },
    ttt: ()=>{
      ctx.fillStyle='#0f172a'; ctx.fillRect(0,0,W,H);
      ctx.strokeStyle='rgba(255,255,255,0.3)'; ctx.lineWidth=2;
      [W/3,W*2/3].forEach(x=>{ctx.beginPath(); ctx.moveTo(x,4); ctx.lineTo(x,H-4); ctx.stroke();});
      [H/3,H*2/3].forEach(y=>{ctx.beginPath(); ctx.moveTo(4,y); ctx.lineTo(W-4,y); ctx.stroke();});
      const board=['X','O','X','','X','O','O','','X'];
      board.forEach((v,i)=>{if(!v)return; const c=i%3, r=Math.floor(i/3), cx=W/6+c*W/3, cy=H/6+r*H/3;
        if(v==='X'){ctx.strokeStyle='#7c3aed'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(cx-9,cy-9); ctx.lineTo(cx+9,cy+9); ctx.moveTo(cx+9,cy-9); ctx.lineTo(cx-9,cy+9); ctx.stroke();}
        else{ctx.strokeStyle='#ef4444'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(cx,cy,9,0,Math.PI*2); ctx.stroke();}
      });
    },
    rps: ()=>{
      ctx.fillStyle='#1a0a2e'; ctx.fillRect(0,0,W,H);
      ctx.font='28px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('✊',W*0.22,H*0.55); ctx.fillText('✋',W*0.5,H*0.4); ctx.fillText('✌️',W*0.78,H*0.6);
    },
    colorswitch: ()=>{
      ctx.fillStyle='#0f172a'; ctx.fillRect(0,0,W,H);
      const rings=[{y:H*0.45,r:22},{y:H*0.65,r:18}];
      const ringColors=['#ef4444','#3b82f6','#22c55e','#eab308'];
      rings.forEach(({y,r})=>{ringColors.forEach((_,i)=>{ctx.strokeStyle=ringColors[i]; ctx.lineWidth=6; ctx.beginPath(); ctx.arc(W/2,y,r,(i*Math.PI/2)-0.03,(i+1)*Math.PI/2+0.03); ctx.stroke();});});
      drawGlowBall(ctx,W/2,H*0.78,8,'#22c55e','#22c55e55');
    },
    lane: ()=>{
      ctx.fillStyle='#1e293b'; ctx.fillRect(0,0,W,H);
      const lanes=[W*0.2,W*0.5,W*0.8];
      ctx.strokeStyle='#fbbf24'; ctx.lineWidth=1; ctx.setLineDash([5,4]);
      lanes.forEach(x=>{ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();}); ctx.setLineDash([]);
      drawCar(ctx,lanes[1]-12,H*0.65,24,32,'#7c3aed');
      drawCar(ctx,lanes[0]-12,H*0.2,24,32,'#ef4444'); drawCar(ctx,lanes[2]-12,H*0.3,24,32,'#22c55e');
    },
    maze: ()=>{
      ctx.fillStyle='#0f172a'; ctx.fillRect(0,0,W,H);
      const S=10;
      [[0,0,6,1],[0,1,1,4],[3,1,4,1],[0,5,3,1],[4,2,2,1],[2,3,3,1]].forEach(([x,y,w,h])=>{ctx.fillStyle='#1e3a8a'; ctx.fillRect(x*S,y*S,w*S,h*S);});
      ctx.fillStyle='#7c3aed'; ctx.beginPath(); ctx.arc(S/2,S/2,4,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#22c55e'; ctx.beginPath(); ctx.arc(W-S/2,H-S/2,4,0,Math.PI*2); ctx.fill();
    },
    simon: ()=>{
      ctx.fillStyle='#0a1a0a'; ctx.fillRect(0,0,W,H);
      [['#ef4444',W*0.2,H*0.3],['#3b82f6',W*0.6,H*0.3],['#22c55e',W*0.2,H*0.7],['#fbbf24',W*0.6,H*0.7]].forEach(([c,x,y],i)=>{
        setShadow(ctx,i===0?c as string:'transparent',i===0?12:0); ctx.fillStyle=i===0?c as string:(c as string)+'66'; rr(ctx,(x as number)-18,(y as number)-18,36,36,8); ctx.fill(); noShadow(ctx);
      });
    },
    mathquiz: ()=>{
      ctx.fillStyle='#0a1628'; ctx.fillRect(0,0,W,H);
      ctx.fillStyle='rgba(59,130,246,0.15)'; rr(ctx,6,H*0.2,W-12,H*0.4,8); ctx.fill();
      ctx.fillStyle='white'; ctx.font='bold 16px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('7 × 8 = ?',W/2,H*0.4);
      ctx.fillStyle='#22c55e'; rr(ctx,6,H*0.68,W/2-10,H*0.2,6); ctx.fill();
      ctx.fillStyle='white'; ctx.font='bold 12px sans-serif'; ctx.fillText('56',W/4,H*0.78);
      ctx.fillStyle='#ef4444'; rr(ctx,W/2+4,H*0.68,W/2-10,H*0.2,6); ctx.fill();
      ctx.fillStyle='white'; ctx.fillText('42',W*0.75,H*0.78);
    },
    gomoku: ()=>{
      ctx.fillStyle='#78350f'; ctx.fillRect(0,0,W,H);
      for(let i=1;i<7;i++){ctx.strokeStyle='rgba(0,0,0,0.3)'; ctx.lineWidth=0.8; ctx.beginPath(); ctx.moveTo(i*W/7,0); ctx.lineTo(i*W/7,H); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0,i*H/7); ctx.lineTo(W,i*H/7); ctx.stroke();}
      [[2,2,'#1a1a1a'],[3,3,'#1a1a1a'],[4,3,'#1a1a1a'],[2,4,'white'],[3,4,'white'],[4,4,'#1a1a1a']].forEach(([c,r,col])=>{ctx.fillStyle=col as string; ctx.beginPath(); ctx.arc((c as number)*W/7,(r as number)*H/7,6,0,Math.PI*2); ctx.fill();});
    },
    nim: ()=>{
      ctx.fillStyle='#1c1005'; ctx.fillRect(0,0,W,H);
      [[3,H*0.25],[5,H*0.5],[7,H*0.75]].forEach(([cnt,y])=>{
        for(let i=0;i<(cnt as number);i++){
          setShadow(ctx,'#b45309',6); ctx.fillStyle='#f59e0b';
          ctx.beginPath(); ctx.arc(10+i*14,y as number,7,0,Math.PI*2); ctx.fill(); noShadow(ctx);
          ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.arc(10+i*14-2,(y as number)-3,2.5,0,Math.PI*2); ctx.fill();
        }
      });
    },
    battle: ()=>{
      ctx.fillStyle='#0c1a2e'; ctx.fillRect(0,0,W,H);
      ctx.fillStyle='rgba(59,130,246,0.2)'; ctx.fillRect(0,0,W,H);
      for(let r=0;r<5;r++)for(let c=0;c<5;c++){ctx.strokeStyle='rgba(100,150,200,0.2)'; ctx.strokeRect(6+c*14,6+r*14,13,13);}
      [[1,1],[2,1],[1,2],[3,3],[3,4]].forEach(([c,r])=>{ctx.fillStyle='#ef4444'; ctx.fillRect(6+c*14+2,6+r*14+2,10,10);});
      ctx.font='16px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('💥',W*0.7,H*0.7);
    },
    reversi: ()=>{
      ctx.fillStyle='#064e3b'; ctx.fillRect(0,0,W,H);
      for(let i=1;i<5;i++){ctx.strokeStyle='rgba(0,0,0,0.3)'; ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(i*W/5,0); ctx.lineTo(i*W/5,H); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0,i*H/5); ctx.lineTo(W,i*H/5); ctx.stroke();}
      [[1,1,'w'],[2,2,'w'],[3,3,'w'],[1,2,'b'],[2,1,'b'],[2,3,'b'],[3,2,'b']].forEach(([c,r,t])=>{
        const x=(c as number)*W/5+W/10, y=(r as number)*H/5+H/10;
        ctx.fillStyle=t==='w'?'white':'#1f2937'; ctx.beginPath(); ctx.arc(x,y,7,0,Math.PI*2); ctx.fill();
      });
    },
    dots: ()=>{
      ctx.fillStyle='#0f0f1f'; ctx.fillRect(0,0,W,H);
      for(let r=0;r<5;r++)for(let c=0;c<5;c++){ctx.fillStyle='white'; ctx.beginPath(); ctx.arc(10+c*16,10+r*14,2,0,Math.PI*2); ctx.fill();}
      ctx.strokeStyle='#7c3aed'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(10,10); ctx.lineTo(26,10); ctx.moveTo(10,24); ctx.lineTo(26,24); ctx.moveTo(10,10); ctx.lineTo(10,24); ctx.stroke();
      ctx.fillStyle='rgba(124,58,237,0.3)'; ctx.fillRect(11,11,15,12);
      ctx.strokeStyle='rgba(239,68,68,0.6)'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(26,10); ctx.lineTo(42,10); ctx.moveTo(26,24); ctx.lineTo(42,24); ctx.stroke();
    },
    checkers: ()=>{
      ctx.fillStyle='#064e3b'; ctx.fillRect(0,0,W,H);
      for(let r=0;r<6;r++)for(let c=0;c<6;c++){if((r+c)%2===0){ctx.fillStyle='#15803d'; ctx.fillRect(c*13,r*10,13,10);}}
      [[1,0],[3,0],[0,1],[2,1],[1,4],[3,4],[0,5],[2,5]].forEach(([c,r])=>{
        ctx.fillStyle=r<2?'#475569':'#ef4444'; ctx.beginPath(); ctx.arc(c*13+6,r*10+5,5,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.beginPath(); ctx.arc(c*13+4,r*10+3,2,0,Math.PI*2); ctx.fill();
      });
    },
    wordle: ()=>{
      ctx.fillStyle='#0f172a'; ctx.fillRect(0,0,W,H);
      [['#22c55e','R'],['#eab308','E'],['rgba(255,255,255,0.2)','A'],['rgba(255,255,255,0.2)','C'],['rgba(255,255,255,0.2)','T']].forEach(([bg,l],i)=>{
        ctx.fillStyle=bg as string; rr(ctx,4+i*16,H*0.3,14,14,3); ctx.fill();
        ctx.fillStyle='white'; ctx.font='bold 9px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(l,4+i*16+7,H*0.3+7);
      });
    },
    hangman: ()=>{
      ctx.fillStyle='#0f172a'; ctx.fillRect(0,0,W,H);
      ctx.strokeStyle='#94a3b8'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(W*0.2,H*0.9); ctx.lineTo(W*0.8,H*0.9); ctx.moveTo(W*0.4,H*0.9); ctx.lineTo(W*0.4,H*0.1); ctx.lineTo(W*0.65,H*0.1); ctx.lineTo(W*0.65,H*0.22); ctx.stroke();
      ctx.strokeStyle='#f87171'; ctx.beginPath(); ctx.arc(W*0.65,H*0.3,8,0,Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W*0.65,H*0.38); ctx.lineTo(W*0.65,H*0.58); ctx.moveTo(W*0.52,H*0.44); ctx.lineTo(W*0.78,H*0.44); ctx.moveTo(W*0.65,H*0.58); ctx.lineTo(W*0.55,H*0.72); ctx.moveTo(W*0.65,H*0.58); ctx.lineTo(W*0.75,H*0.72); ctx.stroke();
    },
    react: ()=>{
      ctx.fillStyle=lgrad(ctx,0,0,0,H,[[0,'#0a1628'],[1,'#051025']]); ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#1a2540'; rr(ctx,W*0.1,H*0.25,W*0.8,H*0.5,12); ctx.fill();
      ctx.fillStyle='#22c55e'; setShadow(ctx,'#22c55e',16); ctx.beginPath(); ctx.arc(W/2,H/2,22,0,Math.PI*2); ctx.fill(); noShadow(ctx);
      ctx.fillStyle='white'; ctx.font='bold 12px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('TAP!',W/2,H/2);
    },
    typing: ()=>{
      ctx.fillStyle='#0a1628'; ctx.fillRect(0,0,W,H);
      ctx.fillStyle='rgba(255,255,255,0.07)'; rr(ctx,4,H*0.25,W-8,H*0.35,6); ctx.fill();
      const txt='The quick'; let ox=8, oy=H*0.42;
      txt.split('').forEach(ch=>{ctx.fillStyle=Math.random()>0.4?'#4ade80':'#f87171'; ctx.font='10px monospace'; ctx.fillText(ch,ox,oy); ox+=7;});
      ctx.fillStyle='white'; ctx.fillRect(ox+1,oy-10,1.5,12);
      rr(ctx,4,H*0.68,W-8,H*0.2,6); ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.1)'; for(let r=0;r<3;r++)for(let c=0;c<8;c++){ctx.strokeRect(4+c*10,H*0.7+r*8,9,7);}
    },
    hilo: ()=>{
      ctx.fillStyle='#1c0a04'; ctx.fillRect(0,0,W,H);
      ctx.fillStyle='rgba(249,115,22,0.15)'; rr(ctx,W*0.15,H*0.2,W*0.7,H*0.45,10); ctx.fill();
      ctx.fillStyle='white'; ctx.font='bold 28px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('42',W/2,H*0.42);
      ctx.fillStyle='#22c55e'; rr(ctx,W*0.08,H*0.72,W*0.38,H*0.2,8); ctx.fill();
      ctx.fillStyle='#ef4444'; rr(ctx,W*0.54,H*0.72,W*0.38,H*0.2,8); ctx.fill();
      ctx.fillStyle='white'; ctx.font='bold 10px sans-serif'; ctx.fillText('⬆ Hi',W*0.27,H*0.82); ctx.fillText('⬇ Lo',W*0.73,H*0.82);
    },
    quicktap: ()=>{
      ctx.fillStyle='#0f172a'; ctx.fillRect(0,0,W,H);
      [['#ef4444',W*0.25,H*0.3],['#3b82f6',W*0.62,H*0.3],['#22c55e',W*0.25,H*0.65],['#fbbf24',W*0.62,H*0.65]].forEach(([c,x,y],i)=>{
        setShadow(ctx,i===1?c as string:'transparent',i===1?10:0); ctx.fillStyle=c as string; rr(ctx,(x as number)-18,(y as number)-16,36,32,8); ctx.fill(); noShadow(ctx);
        if(i===1){ctx.strokeStyle='white'; ctx.lineWidth=2; rr(ctx,(x as number)-18,(y as number)-16,36,32,8); ctx.stroke();}
      });
    },
    anagram: ()=>{
      ctx.fillStyle='#1a0a2e'; ctx.fillRect(0,0,W,H);
      'TINLSE'.split('').forEach((l,i)=>{
        ctx.fillStyle=i===0?'#7c3aed':'rgba(124,58,237,0.4)'; rr(ctx,4+i*13,H*0.3,12,16,3); ctx.fill();
        ctx.fillStyle='white'; ctx.font='bold 9px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(l,4+i*13+6,H*0.3+8);
      });
      ctx.fillStyle='white'; ctx.font='10px sans-serif'; ctx.fillText('→',W/2-2,H*0.6);
      'LISTEN'.split('').forEach((l,i)=>{
        ctx.fillStyle='#22c55e'; rr(ctx,4+i*13,H*0.68,12,16,3); ctx.fill();
        ctx.fillStyle='white'; ctx.font='bold 9px sans-serif'; ctx.fillText(l,4+i*13+6,H*0.76);
      });
    },
    spotcolor: ()=>{
      ctx.fillStyle='#0f172a'; ctx.fillRect(0,0,W,H);
      for(let r=0;r<4;r++)for(let c=0;c<4;c++){
        const isOdd=r===1&&c===2;
        ctx.fillStyle=isOdd?'#f97316':'#ef4444'; rr(ctx,4+c*19,4+r*17,17,15,3); ctx.fill();
        if(isOdd){ctx.strokeStyle='white'; ctx.lineWidth=1.5; rr(ctx,4+c*19,4+r*17,17,15,3); ctx.stroke();}
      }
    },
    equation: ()=>{
      ctx.fillStyle='#0a1628'; ctx.fillRect(0,0,W,H);
      ctx.fillStyle='rgba(124,58,237,0.2)'; rr(ctx,W*0.1,H*0.15,W*0.8,H*0.25,8); ctx.fill();
      ctx.fillStyle='#a78bfa'; ctx.font='bold 11px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('Target: 24',W/2,H*0.27);
      const nums=[4,6,3,8];
      nums.forEach((n,i)=>{ctx.fillStyle='#7c3aed'; rr(ctx,4+i*20,H*0.5,18,18,4); ctx.fill(); ctx.fillStyle='white'; ctx.font='bold 11px sans-serif'; ctx.fillText(String(n),4+i*20+9,H*0.59);});
      ['+','-','×','÷'].forEach((op,i)=>{ctx.fillStyle='rgba(255,255,255,0.1)'; rr(ctx,4+i*20,H*0.72,18,16,4); ctx.fill(); ctx.fillStyle='white'; ctx.font='bold 10px sans-serif'; ctx.fillText(op,4+i*20+9,H*0.80);});
    },
    pattern: ()=>{
      ctx.fillStyle='#1a0a2e'; ctx.fillRect(0,0,W,H);
      const shapes=['⬛','🟥','🔵','⬛','🟥','?'];
      shapes.forEach((s,i)=>{
        ctx.fillStyle=i===shapes.length-1?'rgba(255,255,255,0.05)':'rgba(255,255,255,0.08)'; rr(ctx,4+i*14,H*0.35,13,16,3); ctx.fill();
        ctx.font='9px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle='white';
        if(s!=='?') ctx.fillText(s,4+i*14+6,H*0.43); else {ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.fillText('?',4+i*14+6,H*0.43);}
      });
      ctx.fillStyle='#7c3aed'; rr(ctx,W*0.15,H*0.62,W*0.7,H*0.2,6); ctx.fill();
      ctx.fillStyle='white'; ctx.font='10px sans-serif'; ctx.textAlign='center'; ctx.fillText('Select pattern',W/2,H*0.72);
    },
    mines: ()=>{
      ctx.fillStyle='#1e293b'; ctx.fillRect(0,0,W,H);
      for(let r=0;r<6;r++)for(let c=0;c<6;c++){
        const v=((r===1&&c===2)||(r===3&&c===4))?'💣':((r===0&&c===0)||(r===2&&c===1))?'✓':null;
        ctx.fillStyle=v==='✓'?'#334155':v==='💣'?'#7f1d1d':'#475569'; rr(ctx,3+c*13,3+r*10,12,9,2); ctx.fill();
        if(v){ctx.font='7px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(v,3+c*13+6,3+r*10+4);}
        else{ctx.fillStyle='rgba(255,255,255,0.08)'; ctx.fillRect(3+c*13+1,3+r*10+1,4,2);}
      }
    },
    sokoban: ()=>{
      ctx.fillStyle='#0f172a'; ctx.fillRect(0,0,W,H);
      ctx.font='14px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ['🟦','⬛','🟦','⬛','🟦','🟦','⬛','🤸','📦','🎯'].forEach((e,i)=>{const r=Math.floor(i/5),c=i%5; ctx.fillText(e,8+c*16,8+r*18);});
    },
    sudoku: ()=>{
      ctx.fillStyle='#0a1628'; ctx.fillRect(0,0,W,H);
      ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1;
      for(let i=0;i<=4;i++){ctx.beginPath(); ctx.moveTo(i*W/4+8,8); ctx.lineTo(i*W/4+8,H-8); ctx.stroke(); ctx.beginPath(); ctx.moveTo(8,i*H/4+8); ctx.lineTo(W-8,i*H/4+8); ctx.stroke();}
      [[1,0,0],[2,0,3],[3,0,1],[4,0,2],[1,1,3],[2,1,4],[4,1,1],[1,2,2],[3,2,4],[1,3,4],[2,3,2],[3,3,3]].forEach(([v,r,c])=>{
        ctx.fillStyle=r===0?'rgba(255,255,255,0.15)':'rgba(124,58,237,0.3)'; rr(ctx,8+c*W/4+2,8+r*H/4+2,(W-16)/4-4,(H-16)/4-4,3); ctx.fill();
        ctx.fillStyle='white'; ctx.font=`bold ${(H-16)/8}px sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(String(v),8+c*W/4+W/8,8+r*H/4+H/8);
      });
    },
    "15puzzle": ()=>{
      ctx.fillStyle='#1e1b4b'; ctx.fillRect(0,0,W,H);
      const tiles=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,0,15];
      tiles.forEach((v,i)=>{const r=Math.floor(i/4),c=i%4; if(!v)return; ctx.fillStyle='#4f46e5'; rr(ctx,2+c*20,2+r*20,18,18,4); ctx.fill(); ctx.fillStyle='white'; ctx.font='bold 9px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(String(v),2+c*20+9,2+r*20+9);});
    },
    colorsort: ()=>{
      ctx.fillStyle='#0a1628'; ctx.fillRect(0,0,W,H);
      const tubes=[[0,1,2,3],[3,2,0,1],[1,3,2,0],[],[],[]];
      const cols=['#ef4444','#3b82f6','#22c55e','#fbbf24'];
      tubes.slice(0,4).forEach((t,i)=>{
        ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1; rr(ctx,6+i*18,H*0.15,15,H*0.7,4); ctx.stroke();
        t.forEach((b,j)=>{ctx.fillStyle=cols[b]; ctx.beginPath(); ctx.arc(6+i*18+7,H*0.8-j*12,5,0,Math.PI*2); ctx.fill();});
      });
    },
    blockpuz: ()=>{
      ctx.fillStyle='#0f172a'; ctx.fillRect(0,0,W,H);
      const SZ=9;
      for(let r=0;r<8;r++)for(let c=0;c<8;c++){ctx.fillStyle='rgba(255,255,255,0.03)'; rr(ctx,4+c*SZ,4+r*SZ,SZ-1,SZ-1,1); ctx.fill();}
      [[0,3,'#7c3aed'],[0,4,'#7c3aed'],[0,5,'#7c3aed'],[1,3,'#7c3aed']].forEach(([r,c,col])=>{ctx.fillStyle=col as string; rr(ctx,4+(c as number)*SZ,4+(r as number)*SZ,SZ-1,SZ-1,2); ctx.fill(); ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.fillRect(4+(c as number)*SZ+1,4+(r as number)*SZ+1,SZ-4,2);});
      [[3,0,'#ef4444'],[3,1,'#ef4444']].forEach(([r,c,col])=>{ctx.fillStyle=col as string; rr(ctx,4+(c as number)*SZ,4+(r as number)*SZ,SZ-1,SZ-1,2); ctx.fill();});
    },
    lightsout: ()=>{
      ctx.fillStyle='#0f172a'; ctx.fillRect(0,0,W,H);
      const on=[true,false,true,false,false,true,false,true,false,false,true,false,false,false,true,false,true,false,false,true,false,false,false,true,false];
      on.forEach((v,i)=>{const r=Math.floor(i/5),c=i%5; if(v){setShadow(ctx,'#fbbf24',8); ctx.fillStyle='#fbbf24';} else {noShadow(ctx); ctx.fillStyle='#1e293b';} rr(ctx,4+c*16,4+r*16,14,14,3); ctx.fill(); noShadow(ctx);});
    },
    hanoi: ()=>{
      ctx.fillStyle='#1c0a00'; ctx.fillRect(0,0,W,H);
      [[W*0.18,[[4,'#ef4444'],[3,'#f97316'],[2,'#fbbf24'],[1,'#22c55e']]],[W*0.5,[]],[W*0.82,[]]].forEach(([x,disks])=>{
        ctx.fillStyle='#92400e'; ctx.fillRect((x as number)-2,H*0.2,4,H*0.65); ctx.fillRect((x as number)-20,H*0.82,40,6);
        (disks as [number,string][]).forEach(([d,c],j)=>{ctx.fillStyle=c; rr(ctx,(x as number)-d*6,H*0.78-j*10,d*12,8,3); ctx.fill();});
      });
    },
    nummem: ()=>{
      ctx.fillStyle='#0f172a'; ctx.fillRect(0,0,W,H);
      ctx.fillStyle='rgba(124,58,237,0.2)'; rr(ctx,8,H*0.2,W-16,H*0.35,8); ctx.fill();
      ctx.fillStyle='white'; ctx.font='bold 18px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('7 3 9 2',W/2,H*0.37);
      ctx.fillStyle='rgba(255,255,255,0.05)'; rr(ctx,8,H*0.62,W-16,H*0.25,8); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.font='14px sans-serif'; ctx.fillText('? ? ? ?',W/2,H*0.74);
    },
    whack: ()=>{
      ctx.fillStyle='#1a0d00'; ctx.fillRect(0,0,W,H);
      for(let r=0;r<3;r++)for(let c=0;c<3;c++){
        ctx.fillStyle='#78350f'; ctx.beginPath(); ctx.ellipse(12+c*26,12+r*20,10,7,0,0,Math.PI*2); ctx.fill();
        if(r===1&&c===1){ctx.fillStyle='#f59e0b'; ctx.beginPath(); ctx.arc(12+c*26,9+r*20,7,0,Math.PI*2); ctx.fill(); ctx.font='10px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('🐭',12+c*26,9+r*20);}
      }
    },
    doodle: ()=>{
      ctx.fillStyle='#f0f4f8'; ctx.fillRect(0,0,W,H);
      ctx.strokeStyle='#c7d2fe'; ctx.lineWidth=0.5;
      for(let i=0;i<W;i+=8){ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,H); ctx.stroke();}
      for(let j=0;j<H;j+=8){ctx.beginPath(); ctx.moveTo(0,j); ctx.lineTo(W,j); ctx.stroke();}
      [[W*0.15,H*0.5,W*0.25],[W*0.5,H*0.35,W*0.3],[W*0.75,H*0.2,W*0.2]].forEach(([x,y,pw])=>{
        ctx.fillStyle='#6366f1'; rr(ctx,(x as number)-(pw as number)/2,y as number,(pw as number),10,3); ctx.fill();
      });
      ctx.fillStyle='#4f46e5'; ctx.beginPath(); ctx.arc(W*0.5,H*0.22,7,0,Math.PI*2); ctx.fill();
    },
    dropcatch: ()=>{
      ctx.fillStyle='#0f172a'; ctx.fillRect(0,0,W,H);
      [[W*0.2,H*0.2,'#fbbf24'],[W*0.6,H*0.1,'#a855f7'],[W*0.8,H*0.35,'#22d3ee'],[W*0.3,H*0.5,'#1e293b']].forEach(([x,y,c],i)=>{
        if(i===3){ctx.font='16px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('💣',x as number,y as number);}
        else drawGlowBall(ctx,x as number,y as number,9,c as string,c+'55');
      });
      ctx.fillStyle='#7c3aed'; rr(ctx,W*0.3,H*0.82,W*0.4,14,5); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.fillRect(W*0.33,H*0.84,W*0.14,4);
    },
    heli: ()=>{
      ctx.fillStyle=lgrad(ctx,0,0,0,H,[[0,'#87CEEB'],[1,'#B0E0FF']]); ctx.fillRect(0,0,W,H);
      drawCloud(ctx,W*0.6,H*0.15,14); drawCloud(ctx,W*0.1,H*0.2,10);
      ctx.fillStyle='#374151'; ctx.fillRect(W*0.6,0,14,H*0.35); ctx.fillRect(W*0.6,H*0.5,14,H*0.5);
      drawHelicopter(ctx,W*0.28,H*0.42,20);
    },
    plane: ()=>{
      ctx.fillStyle=lgrad(ctx,0,0,0,H,[[0,'#60a5fa'],[1,'#dbeafe']]); ctx.fillRect(0,0,W,H);
      drawCloud(ctx,W*0.5,H*0.15,12); drawCloud(ctx,W*0.8,H*0.35,9);
      drawPlane(ctx,W*0.25,H*0.5,'#60a5fa');
      drawPlane(ctx,W*0.7,H*0.3,'#ef4444',true); drawPlane(ctx,W*0.65,H*0.65,'#ef4444',true);
    },
  };
  (drawers[id] ?? (()=>{
    ctx.fillStyle=lgrad(ctx,0,0,0,H,[[0,'#1a0533'],[1,'#0a1628']]); ctx.fillRect(0,0,W,H);
    makeStars(W,H,25).forEach(s=>drawStar(ctx,s.x,s.y,s.r,s.a));
  }))();
}

function GameThumbnail({ game }: { game: Game }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv)return;
    const ctx=cv.getContext('2d')!; const W=cv.width,H=cv.height;
    ctx.clearRect(0,0,W,H);
    drawThumbScene(game.id,ctx,W,H);
  },[game.id]);
  return <canvas ref={ref} width={84} height={64} style={{borderRadius:10,display:'block'}} />;
}

// ─────────────────────────────────────────────────────────
// CANVAS ARCADE GAMES — RICH 2D RENDERING
// ─────────────────────────────────────────────────────────

function FlappyBird() {
  const cv = useRef<HTMLCanvasElement>(null);
  const g = useRef({bird:{y:200,vy:0},pipes:[] as {x:number,gap:number}[],score:0,alive:true,started:false,frame:0});
  const raf = useRef(0);
  const [score,setScore]=useState(0); const [alive,setAlive]=useState(true); const [started,setStarted]=useState(false);
  const clouds = useRef(makeStars(340,400,0).map(()=>({x:Math.random()*400,y:Math.random()*120+10,s:14+Math.random()*18,spd:0.3+Math.random()*0.4})));

  const jump=useCallback(()=>{
    if(!g.current.alive){g.current={bird:{y:200,vy:0},pipes:[],score:0,alive:true,started:true,frame:0};setScore(0);setAlive(true);setStarted(true);return;}
    g.current.started=true; g.current.bird.vy=-7; setStarted(true);
  },[]);

  useEffect(()=>{
    const c=cv.current!; const W=340,H=400;
    const ctx=c.getContext('2d')!;
    const onKey=(e:KeyboardEvent)=>{if(e.code==="Space"){e.preventDefault();jump();}};
    window.addEventListener("keydown",onKey);
    const loop=()=>{
      const s=g.current;
      if(s.started&&s.alive){
        s.bird.vy+=0.45; s.bird.y+=s.bird.vy; s.frame++;
        clouds.current.forEach(cl=>{cl.x-=cl.spd; if(cl.x<-40)cl.x=W+20;});
        if(s.frame%80===0)s.pipes.push({x:W,gap:70+Math.random()*120});
        for(const p of s.pipes){p.x-=3; if(Math.abs(p.x-70)<24){if(s.bird.y<p.gap||s.bird.y>p.gap+130){s.alive=false;setAlive(false);}} if(p.x===68){s.score++;setScore(s.score);}}
        s.pipes=s.pipes.filter(p=>p.x>-60);
        if(s.bird.y>H-30||s.bird.y<8){s.alive=false;setAlive(false);}
      }
      // Draw
      ctx.clearRect(0,0,W,H);
      drawSkyBg(ctx,W,H);
      clouds.current.forEach(cl=>drawCloud(ctx,cl.x,cl.y,cl.s));
      // Ground detail
      ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.fillRect(0,H*0.72-4,W,4);
      s.pipes.forEach(p=>drawPipe(ctx,p.x,p.gap,p.gap+130,H));
      drawBird(ctx,70,s.bird.y,s.alive,s.frame);
      raf.current=requestAnimationFrame(loop);
    };
    raf.current=requestAnimationFrame(loop);
    return()=>{cancelAnimationFrame(raf.current);window.removeEventListener("keydown",onKey);};
  },[jump]);

  return(
    <div className="flex flex-col items-center gap-2">
      <div className="text-white font-bold text-lg">Score: {score}</div>
      <div className="relative">
        <canvas ref={cv} width={340} height={400} className="rounded-xl border border-white/10 cursor-pointer" onClick={jump}/>
        {!started&&<div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl"><div className="text-white font-bold text-lg">Tap / Space to Start</div></div>}
        {!alive&&started&&<div className="absolute inset-0 flex items-center justify-center bg-black/65 rounded-xl"><div className="text-center text-white"><div className="font-black text-xl">Game Over! Score: {score}</div><div className="text-sm opacity-70 mt-1">Tap to restart</div></div></div>}
      </div>
      <div className="text-white/40 text-xs">Tap or Space to flap</div>
    </div>
  );
}

function EndlessRunner() {
  const cv = useRef<HTMLCanvasElement>(null);
  const g = useRef({y:178,vy:0,onGround:true,obs:[] as {x:number,h:number}[],score:0,alive:true,frame:0,speed:4});
  const raf = useRef(0);
  const [score,setScore]=useState(0); const [alive,setAlive]=useState(true);
  const buildings = useRef(Array.from({length:6},(_,i)=>({x:i*80+Math.random()*40,w:30+Math.random()*40,h:40+Math.random()*60})));

  const jump=useCallback(()=>{
    if(!g.current.alive){g.current={y:178,vy:0,onGround:true,obs:[],score:0,alive:true,frame:0,speed:4};setScore(0);setAlive(true);return;}
    if(g.current.onGround){g.current.vy=-12;g.current.onGround=false;}
  },[]);

  useEffect(()=>{
    const c=cv.current!; const W=360,H=220,GROUND=188;
    const ctx=c.getContext('2d')!;
    const onKey=(e:KeyboardEvent)=>{if(e.code==="Space"||e.key==="ArrowUp"){e.preventDefault();jump();}};
    window.addEventListener("keydown",onKey);
    const loop=()=>{
      const s=g.current;
      if(s.alive){
        s.vy+=0.7; s.y+=s.vy; if(s.y>=GROUND){s.y=GROUND;s.vy=0;s.onGround=true;}
        s.frame++; s.score=Math.floor(s.frame/10); setScore(s.score);
        if(s.frame%80===0)s.obs.push({x:W,h:22+Math.random()*28});
        s.speed=4+s.score/200;
        buildings.current.forEach(b=>{b.x-=s.speed*0.3; if(b.x+b.w<0)b.x=W+Math.random()*80;});
        for(const o of s.obs){o.x-=s.speed; if(o.x<95&&o.x>45&&s.y+20>GROUND-o.h&&s.y<GROUND+10){s.alive=false;setAlive(false);}}
        s.obs=s.obs.filter(o=>o.x>-30);
      }
      ctx.clearRect(0,0,W,H);
      // Dark city sky
      ctx.fillStyle=lgrad(ctx,0,0,0,H,[[0,'#0f172a'],[0.6,'#1e293b'],[1,'#0f172a']]); ctx.fillRect(0,0,W,H);
      // Stars
      for(let i=0;i<20;i++){ctx.fillStyle=`rgba(255,255,255,${0.2+Math.random()*0.3})`; ctx.beginPath(); ctx.arc((s.frame*0.1+i*37)%W,Math.random()*80,0.7,0,Math.PI*2); ctx.fill();}
      // Buildings
      buildings.current.forEach(b=>{
        ctx.fillStyle=lgrad(ctx,b.x,GROUND-b.h,b.x+b.w,GROUND,[[0,'#334155'],[1,'#1e293b']]);
        ctx.fillRect(b.x,GROUND-b.h,b.w,b.h);
        for(let wy=GROUND-b.h+6;wy<GROUND-6;wy+=10)for(let wx=b.x+4;wx<b.x+b.w-4;wx+=8){
          if(Math.random()>0.5){ctx.fillStyle='rgba(255,230,100,0.4)'; ctx.fillRect(wx,wy,5,6);}
        }
      });
      // Ground
      ctx.fillStyle=lgrad(ctx,0,GROUND,0,H,[[0,'#334155'],[1,'#1e293b']]); ctx.fillRect(0,GROUND,W,H-GROUND);
      ctx.fillStyle='rgba(255,255,255,0.06)'; ctx.fillRect(0,GROUND,W,2);
      // Obstacles
      s.obs.forEach(o=>{
        const og=lgrad(ctx,o.x-12,0,o.x+12,0,[[0,'#7f1d1d'],[0.5,'#ef4444'],[1,'#7f1d1d']]);
        ctx.fillStyle=og; rr(ctx,o.x-12,GROUND-o.h,24,o.h,3); ctx.fill();
        ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.fillRect(o.x-9,GROUND-o.h,6,o.h*0.6);
      });
      // Character
      const cy=s.y; const legSwing=Math.sin(s.frame*0.4)*8;
      // Shadow
      ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(71,GROUND+2,10,3,0,0,Math.PI*2); ctx.fill();
      // Body
      setShadow(ctx,'rgba(0,0,0,0.3)',4,0,2);
      ctx.fillStyle=lgrad(ctx,60,cy,82,cy+26,[[0,'#818cf8'],[1,'#6366f1']]);
      rr(ctx,60,cy,22,26,4); ctx.fill(); noShadow(ctx);
      ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.fillRect(62,cy+3,8,3);
      // Head
      ctx.fillStyle=rgrad(ctx,70,cy-12,1,9,[[0,'#fef3c7'],[1,'#fbbf24']]);
      ctx.beginPath(); ctx.arc(71,cy-8,9,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#1a1a1a'; ctx.beginPath(); ctx.arc(74,cy-9,2,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='white'; ctx.beginPath(); ctx.arc(75,cy-10,0.8,0,Math.PI*2); ctx.fill();
      // Legs
      ctx.fillStyle='#475569';
      ctx.fillRect(62,cy+22,7,8+legSwing*0.5); ctx.fillRect(73,cy+22,7,8-legSwing*0.5);
      // Arms
      ctx.strokeStyle='#6366f1'; ctx.lineWidth=4; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(60,cy+8); ctx.lineTo(52,cy+18-legSwing*0.3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(82,cy+8); ctx.lineTo(90,cy+18+legSwing*0.3); ctx.stroke();
      raf.current=requestAnimationFrame(loop);
    };
    raf.current=requestAnimationFrame(loop);
    return()=>{cancelAnimationFrame(raf.current);window.removeEventListener("keydown",onKey);};
  },[jump]);

  return(
    <div className="flex flex-col items-center gap-2">
      <div className="text-white font-bold">Score: {score}</div>
      <div className="relative">
        <canvas ref={cv} width={360} height={220} className="rounded-xl border border-white/10 cursor-pointer" onClick={jump}/>
        {!alive&&<div className="absolute inset-0 flex items-center justify-center bg-black/65 rounded-xl"><div className="text-white font-black">Game Over! Tap to restart</div></div>}
      </div>
      <div className="text-white/40 text-xs">Tap or Space to jump</div>
    </div>
  );
}

function SnakeGame() {
  const cv = useRef<HTMLCanvasElement>(null);
  const state = useRef({snake:[{x:10,y:10}],dir:{x:1,y:0},food:{x:15,y:10},score:0,dead:false});
  const raf = useRef(0);
  const [score,setScore]=useState(0); const [dead,setDead]=useState(false);
  const SIZE=22,COLS=18,ROWS=16;
  const reset=()=>{state.current={snake:[{x:10,y:10}],dir:{x:1,y:0},food:{x:15,y:10},score:0,dead:false};setScore(0);setDead(false);};

  useEffect(()=>{
    const c=cv.current!; const W=COLS*SIZE,H=ROWS*SIZE;
    const ctx=c.getContext('2d')!;
    const onKey=(e:KeyboardEvent)=>{
      const d=state.current.dir;
      if(e.key==="ArrowUp"&&d.y!==1)state.current.dir={x:0,y:-1};
      if(e.key==="ArrowDown"&&d.y!==-1)state.current.dir={x:0,y:1};
      if(e.key==="ArrowLeft"&&d.x!==1)state.current.dir={x:-1,y:0};
      if(e.key==="ArrowRight"&&d.x!==-1)state.current.dir={x:1,y:0};
    };
    window.addEventListener("keydown",onKey);
    const iv=setInterval(()=>{
      const s=state.current; if(s.dead)return;
      const head={x:s.snake[0].x+s.dir.x,y:s.snake[0].y+s.dir.y};
      if(head.x<0||head.x>=COLS||head.y<0||head.y>=ROWS||s.snake.some(p=>p.x===head.x&&p.y===head.y)){s.dead=true;setDead(true);return;}
      s.snake.unshift(head);
      if(head.x===s.food.x&&head.y===s.food.y){s.score++;setScore(s.score);s.food={x:Math.floor(Math.random()*COLS),y:Math.floor(Math.random()*ROWS)};}
      else s.snake.pop();
    },120);
    const loop=()=>{
      const s=state.current;
      ctx.clearRect(0,0,W,H);
      // Background with grid
      ctx.fillStyle='#0d1117'; ctx.fillRect(0,0,W,H);
      for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
        if((r+c)%2===0){ctx.fillStyle='rgba(255,255,255,0.025)'; ctx.fillRect(c*SIZE,r*SIZE,SIZE,SIZE);}
      }
      // Food: red apple
      const fx=s.food.x*SIZE+SIZE/2, fy=s.food.y*SIZE+SIZE/2;
      setShadow(ctx,'#ef4444',8);
      ctx.fillStyle=rgrad(ctx,fx-2,fy-2,1,SIZE/2-2,[[0,'#fca5a5'],[0.4,'#ef4444'],[1,'#991b1b']]);
      ctx.beginPath(); ctx.arc(fx,fy,SIZE/2-3,0,Math.PI*2); ctx.fill(); noShadow(ctx);
      ctx.fillStyle='#4ade80'; ctx.beginPath(); ctx.moveTo(fx,fy-SIZE/2+1); ctx.lineTo(fx+3,fy-SIZE/2-4); ctx.lineTo(fx-1,fy-SIZE/2-3); ctx.closePath(); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.beginPath(); ctx.arc(fx-3,fy-3,3,0,Math.PI*2); ctx.fill();
      // Snake body
      s.snake.forEach((p,i)=>{
        const sx=p.x*SIZE, sy=p.y*SIZE;
        const ratio=1-i/Math.max(s.snake.length,1);
        const g2=rgrad(ctx,sx+SIZE/2-3,sy+SIZE/2-3,1,SIZE/2-1,[[0,`rgba(134,239,172,${0.9})`],[0.4,`rgba(34,197,94,${ratio*0.9+0.1})`],[1,`rgba(21,128,61,${ratio*0.8+0.1})`]]);
        ctx.fillStyle=g2;
        rr(ctx,sx+2,sy+2,SIZE-4,SIZE-4,i===0?8:5); ctx.fill();
        if(i===0){
          // Eyes
          const next=s.snake[1]||{x:p.x-s.dir.x,y:p.y-s.dir.y};
          const dx=p.x-next.x, dy=p.y-next.y;
          const ex1=sx+SIZE/2+dy*5-dx*3, ey1=sy+SIZE/2+dx*5-dy*3;
          const ex2=sx+SIZE/2-dy*5-dx*3, ey2=sy+SIZE/2-dx*5-dy*3;
          ctx.fillStyle='white'; ctx.beginPath(); ctx.arc(ex1,ey1,3.5,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(ex2,ey2,3.5,0,Math.PI*2); ctx.fill();
          ctx.fillStyle='#1a1a1a'; ctx.beginPath(); ctx.arc(ex1+dx,ey1+dy,2,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(ex2+dx,ey2+dy,2,0,Math.PI*2); ctx.fill();
          // Tongue
          if(Math.floor(Date.now()/400)%2===0){ctx.strokeStyle='#f43f5e'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(sx+SIZE/2+dx*8,sy+SIZE/2+dy*8); ctx.lineTo(sx+SIZE/2+dx*13+dy*3,sy+SIZE/2+dy*13+dx*3); ctx.moveTo(sx+SIZE/2+dx*13-dy*3,sy+SIZE/2+dy*13-dx*3); ctx.lineTo(sx+SIZE/2+dx*8,sy+SIZE/2+dy*8); ctx.stroke();}
        } else {
          ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.fillRect(sx+4,sy+3,SIZE-10,3);
        }
      });
      raf.current=requestAnimationFrame(loop);
    };
    raf.current=requestAnimationFrame(loop);
    return()=>{clearInterval(iv);cancelAnimationFrame(raf.current);window.removeEventListener("keydown",onKey);};
  },[]);

  return(
    <div className="flex flex-col items-center gap-3">
      <div className="text-white font-bold text-lg">Score: {score}</div>
      <canvas ref={cv} width={COLS*SIZE} height={ROWS*SIZE} className="rounded-lg border border-white/10"/>
      {dead&&<Btn onClick={reset}>Restart</Btn>}
      <div className="text-white/50 text-xs">Arrow keys to move</div>
    </div>
  );
}

function StackTower() {
  const cv = useRef<HTMLCanvasElement>(null);
  const g = useRef({blocks:[] as {x:number,w:number,y:number}[],moving:{x:0,w:100,dir:1},score:0,alive:true,started:false});
  const raf = useRef(0);
  const [score,setScore]=useState(0); const [alive,setAlive]=useState(true);
  const BLOCK_COLORS=['#7c3aed','#6d28d9','#8b5cf6','#a78bfa','#5b21b6','#4c1d95','#c4b5fd'];

  const drop=useCallback(()=>{
    if(!g.current.alive){g.current={blocks:[],moving:{x:0,w:100,dir:1},score:0,alive:true,started:false};setScore(0);setAlive(true);return;}
    const s=g.current; s.started=true;
    const top=s.blocks[s.blocks.length-1];
    if(!top){s.blocks.push({x:s.moving.x,w:s.moving.w,y:360});s.score++;setScore(s.score);s.moving={x:0,w:s.moving.w,dir:1};return;}
    const overlap=Math.min(s.moving.x+s.moving.w,top.x+top.w)-Math.max(s.moving.x,top.x);
    if(overlap<=0){s.alive=false;setAlive(false);return;}
    const nx=Math.max(s.moving.x,top.x);
    s.blocks.push({x:nx,w:overlap,y:top.y-26});
    s.score++;setScore(s.score);s.moving={x:0,w:overlap,dir:1};
  },[]);

  useEffect(()=>{
    const c=cv.current!; const W=280,H=420;
    const ctx=c.getContext('2d')!;
    const onKey=(e:KeyboardEvent)=>{if(e.code==="Space"){e.preventDefault();drop();}};
    window.addEventListener("keydown",onKey);
    const loop=()=>{
      const s=g.current;
      if(s.alive&&s.started){s.moving.x+=s.moving.dir*3.5; if(s.moving.x+s.moving.w>W||s.moving.x<0)s.moving.dir*=-1;}
      ctx.clearRect(0,0,W,H);
      // Background
      ctx.fillStyle=lgrad(ctx,0,0,0,H,[[0,'#0a0518'],[0.5,'#0d0d1e'],[1,'#050312']]); ctx.fillRect(0,0,W,H);
      // Stars
      for(let i=0;i<15;i++){ctx.fillStyle=`rgba(255,255,255,${0.1+Math.random()*0.2})`; ctx.beginPath(); ctx.arc(Math.random()*W,Math.random()*H,0.8,0,Math.PI*2); ctx.fill();}
      // Placed blocks
      s.blocks.forEach((b,i)=>{
        const col=BLOCK_COLORS[i%BLOCK_COLORS.length];
        setShadow(ctx,'rgba(0,0,0,0.5)',8,0,4);
        ctx.fillStyle=lgrad(ctx,b.x,b.y,b.x,b.y+24,[[0,col+'ff'],[1,col+'99']]);
        rr(ctx,b.x+1,b.y,b.w-2,24,4); ctx.fill(); noShadow(ctx);
        ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.fillRect(b.x+4,b.y+2,b.w-10,4);
        ctx.fillStyle='rgba(0,0,0,0.2)'; ctx.fillRect(b.x+2,b.y+20,b.w-4,3);
      });
      // Moving block
      if(s.alive){
        const movingY=s.blocks.length>0?s.blocks[s.blocks.length-1].y-30:380;
        const mc=BLOCK_COLORS[(s.blocks.length)%BLOCK_COLORS.length];
        ctx.fillStyle=lgrad(ctx,s.moving.x,movingY,s.moving.x,movingY+24,[[0,mc+'ee'],[1,mc+'aa']]);
        rr(ctx,s.moving.x+1,movingY,s.moving.w-2,24,4); ctx.fill();
        ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.fillRect(s.moving.x+4,movingY+2,s.moving.w-10,4);
        // Guide line
        if(s.blocks.length>0){
          const top=s.blocks[s.blocks.length-1];
          ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=1; ctx.setLineDash([3,4]);
          ctx.beginPath(); ctx.moveTo(top.x,movingY+12); ctx.lineTo(s.moving.x,movingY+12); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(top.x+top.w,movingY+12); ctx.lineTo(s.moving.x+s.moving.w,movingY+12); ctx.stroke();
          ctx.setLineDash([]);
        }
      }
      raf.current=requestAnimationFrame(loop);
    };
    raf.current=requestAnimationFrame(loop);
    return()=>{cancelAnimationFrame(raf.current);window.removeEventListener("keydown",onKey);};
  },[drop]);

  return(
    <div className="flex flex-col items-center gap-2">
      <div className="text-white font-bold">Score: {score}</div>
      <div className="relative">
        <canvas ref={cv} width={280} height={420} className="rounded-xl border border-white/10 cursor-pointer" onClick={drop}/>
        {!g.current.started&&<div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl"><div className="text-white font-bold">Tap to drop blocks!</div></div>}
        {!alive&&<div className="absolute inset-0 flex items-center justify-center bg-black/65 rounded-xl"><div className="text-center text-white"><div className="font-black text-xl">Game Over! Score: {score}</div><div className="text-sm opacity-70">Tap to restart</div></div></div>}
      </div>
      <div className="text-white/40 text-xs">Tap or Space to drop</div>
    </div>
  );
}

function BreakoutGame() {
  const cv = useRef<HTMLCanvasElement>(null);
  const g = useRef({ball:{x:180,y:300,vx:3,vy:-4},paddle:{x:140,w:80},bricks:[] as {x:number,y:number,alive:boolean,color:string}[],score:0,alive:true,won:false});
  const raf = useRef(0);
  const [score,setScore]=useState(0); const [alive,setAlive]=useState(true); const [won,setWon]=useState(false);
  const BCOLORS=['#ef4444','#f97316','#eab308','#22c55e','#3b82f6'];
  const stars = useRef(makeStars(360,420));
  const initBricks=()=>{const br=[];for(let r=0;r<5;r++)for(let c=0;c<8;c++)br.push({x:c*42+10,y:r*28+40,alive:true,color:BCOLORS[r]});return br;};
  const reset=useCallback(()=>{g.current={ball:{x:180,y:300,vx:3,vy:-4},paddle:{x:140,w:80},bricks:initBricks(),score:0,alive:true,won:false};setScore(0);setAlive(true);setWon(false);},[]);
  if(!g.current.bricks.length) g.current.bricks=initBricks();

  useEffect(()=>{
    const c=cv.current!; const W=360,H=420;
    const ctx=c.getContext('2d')!;
    const onMouse=(e:MouseEvent)=>{const r=c.getBoundingClientRect();g.current.paddle.x=e.clientX-r.left-g.current.paddle.w/2;};
    const onTouch=(e:TouchEvent)=>{e.preventDefault();const r=c.getBoundingClientRect();g.current.paddle.x=e.touches[0].clientX-r.left-g.current.paddle.w/2;};
    c.addEventListener("mousemove",onMouse); c.addEventListener("touchmove",onTouch,{passive:false});
    const loop=()=>{
      const s=g.current;
      if(s.alive&&!s.won){
        s.ball.x+=s.ball.vx; s.ball.y+=s.ball.vy;
        if(s.ball.x<8||s.ball.x>W-8)s.ball.vx*=-1;
        if(s.ball.y<8)s.ball.vy*=-1;
        if(s.ball.y>H+20){s.alive=false;setAlive(false);}
        const px=Math.max(0,Math.min(W-s.paddle.w,s.paddle.x));
        if(s.ball.y>H-55&&s.ball.y<H-32&&s.ball.x>px&&s.ball.x<px+s.paddle.w){s.ball.vy=-Math.abs(s.ball.vy);s.ball.vx=((s.ball.x-px-s.paddle.w/2)/s.paddle.w)*8;}
        for(const br of s.bricks){if(!br.alive)continue;if(s.ball.x>br.x&&s.ball.x<br.x+38&&s.ball.y>br.y&&s.ball.y<br.y+22){br.alive=false;s.ball.vy*=-1;s.score++;setScore(s.score);}}
        if(s.bricks.every(b=>!b.alive)){s.won=true;setWon(true);}
      }
      ctx.clearRect(0,0,W,H);
      // Space bg
      ctx.fillStyle='#020817'; ctx.fillRect(0,0,W,H);
      stars.current.forEach(st=>drawStar(ctx,st.x,st.y,st.r,st.a));
      // Bricks
      s.bricks.forEach(br=>{if(br.alive)drawBrick(ctx,br.x,br.y,36,20,br.color);});
      // Paddle
      const px=Math.max(0,Math.min(W-s.paddle.w,s.paddle.x));
      setShadow(ctx,'#818cf8',10);
      ctx.fillStyle=lgrad(ctx,px,H-48,px+s.paddle.w,H-48,[[0,'#4f46e5'],[0.5,'#818cf8'],[1,'#4f46e5']]);
      rr(ctx,px,H-48,s.paddle.w,14,7); ctx.fill(); noShadow(ctx);
      ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.fillRect(px+4,H-47,s.paddle.w-8,4);
      // Ball
      drawGlowBall(ctx,s.ball.x,s.ball.y,9,'#fbbf24','#fbbf2499');
      raf.current=requestAnimationFrame(loop);
    };
    raf.current=requestAnimationFrame(loop);
    return()=>{cancelAnimationFrame(raf.current);c.removeEventListener("mousemove",onMouse);c.removeEventListener("touchmove",onTouch);};
  },[]);

  return(
    <div className="flex flex-col items-center gap-2">
      <div className="text-white font-bold">Score: {score}</div>
      <div className="relative">
        <canvas ref={cv} width={360} height={420} className="rounded-xl border border-white/10 cursor-pointer" onClick={()=>{if(!g.current.alive||g.current.won)reset();}}/>
        {!alive&&<div className="absolute inset-0 flex items-center justify-center bg-black/65 rounded-xl"><div className="text-white text-center"><div className="font-black text-xl">Game Over!</div><div className="text-sm opacity-70">Click anywhere to restart</div></div></div>}
        {won&&<div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl"><div className="text-yellow-400 font-black text-2xl">🎉 You Win!</div></div>}
      </div>
      <div className="text-white/40 text-xs">Move mouse / touch to control paddle</div>
    </div>
  );
}

function DropCatcher() {
  const cv = useRef<HTMLCanvasElement>(null);
  const g = useRef({items:[] as {x:number,y:number,type:"gem"|"bomb",color:string}[],bucket:160,score:0,lives:3,alive:true,frame:0});
  const raf = useRef(0);
  const [score,setScore]=useState(0); const [lives,setLives]=useState(3); const [alive,setAlive]=useState(true);
  const GEM_COLORS=['#f59e0b','#22c55e','#3b82f6','#a855f7','#ec4899','#22d3ee'];

  useEffect(()=>{
    const c=cv.current!; const W=340,H=380;
    const ctx=c.getContext('2d')!;
    const onMouse=(e:MouseEvent)=>{const r=c.getBoundingClientRect();g.current.bucket=e.clientX-r.left;};
    c.addEventListener("mousemove",onMouse);
    const loop=()=>{
      const s=g.current;
      if(s.alive){
        s.frame++;
        if(s.frame%40===0)s.items.push({x:Math.random()*W,y:0,type:Math.random()<0.2?"bomb":"gem",color:GEM_COLORS[Math.floor(Math.random()*GEM_COLORS.length)]});
        for(const it of s.items){
          it.y+=3;
          if(it.y>H-42&&Math.abs(it.x-s.bucket)<38){
            if(it.type==="gem"){s.score++;setScore(s.score);}
            else{s.lives--;setLives(s.lives);if(s.lives<=0){s.alive=false;setAlive(false);}}
            it.y=H+20;
          }
        }
        s.items=s.items.filter(it=>it.y<H+10);
      }
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle=lgrad(ctx,0,0,0,H,[[0,'#0f172a'],[1,'#1e293b']]); ctx.fillRect(0,0,W,H);
      // Items
      s.items.forEach(it=>{
        if(it.type==="gem"){
          // Diamond gem
          setShadow(ctx,it.color,10);
          ctx.fillStyle=rgrad(ctx,it.x-4,it.y-4,1,12,[[0,'white'],[0.3,it.color],[1,it.color+'88']]);
          ctx.beginPath(); ctx.moveTo(it.x,it.y-13); ctx.lineTo(it.x+10,it.y-2); ctx.lineTo(it.x,it.y+11); ctx.lineTo(it.x-10,it.y-2); ctx.closePath(); ctx.fill(); noShadow(ctx);
          ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.moveTo(it.x,it.y-13); ctx.lineTo(it.x+5,it.y-2); ctx.lineTo(it.x,it.y-5); ctx.lineTo(it.x-5,it.y-2); ctx.closePath(); ctx.fill();
        } else {
          // Bomb
          ctx.fillStyle=rgrad(ctx,it.x-3,it.y-3,1,11,[[0,'#475569'],[1,'#0f172a']]);
          ctx.beginPath(); ctx.arc(it.x,it.y,11,0,Math.PI*2); ctx.fill();
          ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.beginPath(); ctx.arc(it.x-3,it.y-4,4,0,Math.PI*2); ctx.fill();
          ctx.strokeStyle='#92400e'; ctx.lineWidth=2;
          ctx.beginPath(); ctx.moveTo(it.x+4,it.y-10); ctx.quadraticCurveTo(it.x+12,it.y-18,it.x+8,it.y-22); ctx.stroke();
          setShadow(ctx,'#fbbf24',4); ctx.fillStyle='#fbbf24'; ctx.beginPath(); ctx.arc(it.x+8,it.y-22,3,0,Math.PI*2); ctx.fill(); noShadow(ctx);
        }
      });
      // Bucket
      const bx=s.bucket;
      const bucketGrad=lgrad(ctx,bx-38,H-44,bx+38,H-44,[[0,'#5b21b6'],[0.5,'#7c3aed'],[1,'#5b21b6']]);
      ctx.fillStyle=bucketGrad;
      ctx.beginPath(); ctx.moveTo(bx-38,H-44); ctx.lineTo(bx-30,H-12); ctx.lineTo(bx+30,H-12); ctx.lineTo(bx+38,H-44); ctx.closePath(); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.fillRect(bx-32,H-42,12,H*0.06);
      ctx.strokeStyle='#a78bfa'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(bx-38,H-44); ctx.lineTo(bx+38,H-44); ctx.stroke();
      raf.current=requestAnimationFrame(loop);
    };
    raf.current=requestAnimationFrame(loop);
    return()=>{cancelAnimationFrame(raf.current);c.removeEventListener("mousemove",onMouse);};
  },[]);

  return(
    <div className="flex flex-col items-center gap-2">
      <div className="text-white font-bold">Score: {score} ❤️{lives}</div>
      <div className="relative">
        <canvas ref={cv} width={340} height={380} className="rounded-xl border border-white/10 cursor-pointer"
          onClick={()=>{if(!g.current.alive){g.current={items:[],bucket:160,score:0,lives:3,alive:true,frame:0};setScore(0);setLives(3);setAlive(true);}}}/>
        {!alive&&<div className="absolute inset-0 flex items-center justify-center bg-black/65 rounded-xl"><div className="text-white text-center"><div className="font-black text-xl">Game Over! Score: {score}</div><div className="text-sm opacity-70">Click to restart</div></div></div>}
      </div>
      <div className="text-white/40 text-xs">Move mouse to catch gems, avoid bombs</div>
    </div>
  );
}

function HelicopterGame() {
  const cv = useRef<HTMLCanvasElement>(null);
  const g = useRef({y:130,vy:0,holding:false,dist:0,alive:true,walls:[] as {x:number,top:number,bot:number}[]});
  const raf = useRef(0);
  const [dist,setDist]=useState(0); const [alive,setAlive]=useState(true);
  const clouds = useRef([{x:200,y:40,s:18},{x:80,y:70,s:14},{x:300,y:55,s:16}]);

  useEffect(()=>{
    const c=cv.current!; const W=360,H=260;
    const ctx=c.getContext('2d')!;
    const onDown=()=>{if(!g.current.alive){g.current={y:130,vy:0,holding:false,dist:0,alive:true,walls:[]};setDist(0);setAlive(true);return;}g.current.holding=true;};
    const onUp=()=>{g.current.holding=false;};
    c.addEventListener("mousedown",onDown); c.addEventListener("mouseup",onUp);
    c.addEventListener("touchstart",onDown,{passive:true}); c.addEventListener("touchend",onUp);
    const onKey=(e:KeyboardEvent)=>{if(e.code==="Space"){e.type==="keydown"?onDown():onUp();e.preventDefault();}};
    window.addEventListener("keydown",onKey);
    let frame=0;
    const loop=()=>{
      const s=g.current; frame++;
      if(s.alive){
        s.vy+=s.holding?-0.6:0.5; s.y+=s.vy; s.dist++; setDist(s.dist);
        clouds.current.forEach(cl=>{cl.x-=1.5; if(cl.x<-40)cl.x=W+20;});
        if(s.dist%80===0){const mid=60+Math.random()*100;s.walls.push({x:W,top:mid-40,bot:mid+40});}
        for(const w of s.walls){w.x-=3;if(w.x<90&&w.x>60){if(s.y<w.top||s.y>w.bot){s.alive=false;setAlive(false);}}}
        if(s.y<10||s.y>H-10){s.alive=false;setAlive(false);}
        s.walls=s.walls.filter(w=>w.x>-20);
      }
      ctx.clearRect(0,0,W,H);
      // Sky
      ctx.fillStyle=lgrad(ctx,0,0,0,H,[[0,'#7dd3fc'],[1,'#dbeafe']]); ctx.fillRect(0,0,W,H);
      clouds.current.forEach(cl=>drawCloud(ctx,cl.x,cl.y,cl.s));
      // Walls
      s.walls.forEach(w=>{
        const wg=lgrad(ctx,w.x-20,0,w.x+20,0,[[0,'#475569'],[0.5,'#64748b'],[1,'#475569']]);
        ctx.fillStyle=wg; ctx.fillRect(w.x-20,0,40,w.top);
        ctx.fillRect(w.x-20,w.bot,40,H-w.bot);
        // Wall cap lines
        ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.fillRect(w.x-20,w.top-2,40,2); ctx.fillRect(w.x-20,w.bot,40,2);
      });
      // Helicopter
      drawHelicopter(ctx,50,s.y,frame);
      raf.current=requestAnimationFrame(loop);
    };
    raf.current=requestAnimationFrame(loop);
    return()=>{cancelAnimationFrame(raf.current);c.removeEventListener("mousedown",onDown);c.removeEventListener("mouseup",onUp);c.removeEventListener("touchstart",onDown);c.removeEventListener("touchend",onUp);window.removeEventListener("keydown",onKey);};
  },[]);

  return(
    <div className="flex flex-col items-center gap-2">
      <div className="text-white font-bold">Distance: {dist}</div>
      <div className="relative">
        <canvas ref={cv} width={360} height={260} className="rounded-xl border border-white/10 cursor-pointer select-none"/>
        {!alive&&<div className="absolute inset-0 flex items-center justify-center bg-black/65 rounded-xl"><div className="text-white font-black">Crashed! Tap to restart</div></div>}
      </div>
      <div className="text-white/40 text-xs">Hold mouse/tap to fly up</div>
    </div>
  );
}

function PlaneDodger() {
  const cv = useRef<HTMLCanvasElement>(null);
  const g = useRef({y:130,vy:0,holding:false,score:0,alive:true,planes:[] as {x:number,y:number}[],frame:0});
  const raf = useRef(0);
  const [score,setScore]=useState(0); const [alive,setAlive]=useState(true);

  useEffect(()=>{
    const c=cv.current!; const W=360,H=280;
    const ctx=c.getContext('2d')!;
    const onDown=()=>{if(!g.current.alive){g.current={y:130,vy:0,holding:false,score:0,alive:true,planes:[],frame:0};setScore(0);setAlive(true);return;}g.current.holding=true;};
    const onUp=()=>g.current.holding=false;
    c.addEventListener("mousedown",onDown); c.addEventListener("mouseup",onUp);
    c.addEventListener("touchstart",onDown,{passive:true}); c.addEventListener("touchend",onUp);
    const onKey=(e:KeyboardEvent)=>{if(e.code==="Space"||e.key==="ArrowUp"){if(e.type==="keydown")onDown();else onUp();e.preventDefault();}};
    window.addEventListener("keydown",onKey);
    const clouds=[{x:60,y:30,s:20},{x:200,y:55,s:16},{x:310,y:25,s:14}];
    const loop=()=>{
      const s=g.current;
      if(s.alive){
        s.vy+=s.holding?-0.5:0.4; s.y=Math.max(10,Math.min(H-30,s.y+s.vy));
        s.frame++; s.score=Math.floor(s.frame/15); setScore(s.score);
        clouds.forEach(cl=>{cl.x-=1.2; if(cl.x<-40)cl.x=W+20;});
        if(s.frame%60===0) s.planes.push({x:W,y:20+Math.random()*(H-60)});
        for(const p of s.planes){p.x-=5;if(Math.abs(p.x-70)<32&&Math.abs(p.y-s.y)<24){s.alive=false;setAlive(false);}}
        s.planes=s.planes.filter(p=>p.x>-30);
      }
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle=lgrad(ctx,0,0,0,H,[[0,'#60a5fa'],[0.6,'#93c5fd'],[1,'#bfdbfe']]); ctx.fillRect(0,0,W,H);
      clouds.forEach(cl=>drawCloud(ctx,cl.x,cl.y,cl.s));
      s.planes.forEach(p=>drawPlane(ctx,p.x,p.y,'#ef4444',true));
      drawPlane(ctx,70,s.y,'#3b82f6');
      raf.current=requestAnimationFrame(loop);
    };
    raf.current=requestAnimationFrame(loop);
    return()=>{cancelAnimationFrame(raf.current);c.removeEventListener("mousedown",onDown);c.removeEventListener("mouseup",onUp);c.removeEventListener("touchstart",onDown);c.removeEventListener("touchend",onUp);window.removeEventListener("keydown",onKey);};
  },[]);

  return(
    <div className="flex flex-col items-center gap-2">
      <div className="text-white font-bold">Score: {score}</div>
      <div className="relative">
        <canvas ref={cv} width={360} height={280} className="rounded-xl border border-white/10 cursor-pointer select-none"/>
        {!alive&&<div className="absolute inset-0 flex items-center justify-center bg-black/65 rounded-xl"><div className="text-white text-center"><div className="font-black">Crashed! Score: {score}</div><div className="text-sm opacity-70">Click to restart</div></div></div>}
      </div>
      <div className="text-white/40 text-xs">Hold to climb, release to drop</div>
    </div>
  );
}

function PinballGame() {
  const cv = useRef<HTMLCanvasElement>(null);
  const g = useRef({ball:{x:180,y:300,vx:2,vy:-5},lFlip:false,rFlip:false,score:0,alive:true});
  const raf = useRef(0);
  const [score,setScore]=useState(0); const [alive,setAlive]=useState(true);
  const bumperDefs=[{x:100,y:120,r:20,c:'#7c3aed'},{x:180,y:80,r:20,c:'#ec4899'},{x:260,y:120,r:20,c:'#22d3ee'},{x:140,y:170,r:15,c:'#f97316'},{x:220,y:170,r:15,c:'#22c55e'}];

  useEffect(()=>{
    const c=cv.current!; const W=360,H=500;
    const ctx=c.getContext('2d')!;
    const onKey=(e:KeyboardEvent)=>{
      if(e.key==="ArrowLeft"||e.key==="z"||e.key==="Z")g.current.lFlip=e.type==="keydown";
      if(e.key==="ArrowRight"||e.key==="/"||e.key==="x"||e.key==="X")g.current.rFlip=e.type==="keydown";
    };
    window.addEventListener("keydown",onKey); window.addEventListener("keyup",onKey);
    const loop=()=>{
      const s=g.current;
      if(s.alive){
        s.ball.vy+=0.3; s.ball.x+=s.ball.vx; s.ball.y+=s.ball.vy;
        if(s.ball.x<14||s.ball.x>W-14)s.ball.vx*=-1;
        if(s.ball.y<12)s.ball.vy=Math.abs(s.ball.vy);
        for(const b of bumperDefs){const dx=s.ball.x-b.x,dy=s.ball.y-b.y,dist=Math.sqrt(dx*dx+dy*dy);if(dist<b.r+10){const nx=dx/dist,ny=dy/dist;s.ball.vx=nx*6;s.ball.vy=ny*6;s.score+=10;setScore(sc=>sc+10);}}
        const la=s.lFlip?-0.4:0.5, ra=s.rFlip?-0.5:0.3;
        const hitFlipper=(fx1:number,fy1:number,fx2:number,fy2:number)=>{const dx=fx2-fx1,dy=fy2-fy1,len=Math.sqrt(dx*dx+dy*dy);const t=((s.ball.x-fx1)*dx+(s.ball.y-fy1)*dy)/(len*len);if(t<0||t>1)return;const px=fx1+t*dx,py=fy1+t*dy;const ddx=s.ball.x-px,ddy=s.ball.y-py;const d=Math.sqrt(ddx*ddx+ddy*ddy);if(d<12){s.ball.vy=-Math.abs(s.ball.vy)-2;s.ball.vx=(s.ball.x-180)/20;}};
        hitFlipper(60,H-60,60+80*Math.cos(la),H-60+80*Math.sin(la));
        hitFlipper(W-60,H-60,W-60-80*Math.cos(ra),H-60+80*Math.sin(ra));
        if(s.ball.y>H+20){s.alive=false;setAlive(false);}
      }
      ctx.clearRect(0,0,W,H);
      // Table background
      ctx.fillStyle=lgrad(ctx,0,0,0,H,[[0,'#060614'],[0.5,'#0a0a1e'],[1,'#060614']]); ctx.fillRect(0,0,W,H);
      // Table borders
      ctx.fillStyle='#1e293b'; ctx.fillRect(0,0,8,H); ctx.fillRect(W-8,0,8,H);
      // Bumpers with glow
      bumperDefs.forEach(b=>{
        setShadow(ctx,b.c,15);
        ctx.fillStyle=rgrad(ctx,b.x-b.r*0.3,b.y-b.r*0.3,1,b.r,[[0,'white'],[0.3,b.c],[1,b.c+'88']]);
        ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill(); noShadow(ctx);
        ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(b.x-b.r*0.25,b.y-b.r*0.25,b.r*0.3,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle=b.c; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(b.x,b.y,b.r+3,0,Math.PI*2); ctx.stroke();
      });
      // Ball
      drawGlowBall(ctx,s.ball.x,s.ball.y,11,'#e2e8f0','rgba(200,200,200,0.4)');
      // Flippers
      const la2=s.lFlip?-0.4:0.5, ra2=s.rFlip?-0.5:0.3;
      const lx2=60+80*Math.cos(la2), ly2=H-60+80*Math.sin(la2);
      const rx2=W-60-80*Math.cos(ra2), ry2=H-60+80*Math.sin(ra2);
      ctx.save();
      setShadow(ctx,'#4f46e5',8);
      ctx.strokeStyle=lgrad(ctx,60,H-60,lx2,ly2,[[0,'#818cf8'],[1,'#4f46e5']]);
      ctx.lineWidth=14; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(60,H-60); ctx.lineTo(lx2,ly2); ctx.stroke();
      ctx.strokeStyle=lgrad(ctx,W-60,H-60,rx2,ry2,[[0,'#818cf8'],[1,'#4f46e5']]);
      ctx.beginPath(); ctx.moveTo(W-60,H-60); ctx.lineTo(rx2,ry2); ctx.stroke();
      noShadow(ctx); ctx.restore();
      raf.current=requestAnimationFrame(loop);
    };
    raf.current=requestAnimationFrame(loop);
    return()=>{cancelAnimationFrame(raf.current);window.removeEventListener("keydown",onKey);window.removeEventListener("keyup",onKey);};
  },[]);

  const restart=()=>{g.current={ball:{x:180,y:300,vx:2,vy:-5},lFlip:false,rFlip:false,score:0,alive:true};setScore(0);setAlive(true);};
  return(
    <div className="flex flex-col items-center gap-2">
      <div className="text-white font-bold">Score: {score}</div>
      <div className="relative">
        <canvas ref={cv} width={360} height={500} className="rounded-xl border border-white/10 cursor-pointer" onClick={()=>{if(!g.current.alive)restart();}}/>
        {!alive&&<div className="absolute inset-0 flex items-center justify-center bg-black/65 rounded-xl"><div className="text-white text-center"><div className="font-black text-xl">Game Over! {score}</div><div className="text-sm opacity-70">Click to restart</div></div></div>}
      </div>
      <div className="text-white/40 text-xs">Z/← = Left flipper · X/→ = Right flipper</div>
    </div>
  );
}

function ColorSwitch() {
  const cv = useRef<HTMLCanvasElement>(null);
  const g = useRef({ball:{y:380,vy:0},rings:[{y:250,angle:0},{y:120,angle:Math.PI/2}],score:0,alive:true,started:false,ballColor:0});
  const raf = useRef(0);
  const [score,setScore]=useState(0); const [alive,setAlive]=useState(true); const [started,setStarted]=useState(false);
  const COLORS=['#ef4444','#3b82f6','#22c55e','#eab308'];

  const tap=useCallback(()=>{
    if(!g.current.alive){g.current={ball:{y:380,vy:0},rings:[{y:250,angle:0},{y:120,angle:Math.PI/2}],score:0,alive:true,started:false,ballColor:0};setScore(0);setAlive(true);setStarted(false);return;}
    g.current.started=true; g.current.ball.vy=-9; setStarted(true);
  },[]);

  useEffect(()=>{
    const c=cv.current!; const W=280,H=440;
    const ctx=c.getContext('2d')!;
    const onKey=(e:KeyboardEvent)=>{if(e.code==="Space"){e.preventDefault();tap();}};
    window.addEventListener("keydown",onKey);
    const loop=()=>{
      const s=g.current;
      if(s.started&&s.alive){
        s.ball.vy+=0.5; s.ball.y+=s.ball.vy;
        for(const r of s.rings){r.angle+=0.04;}
        for(const r of s.rings){const dy=s.ball.y-r.y,dist=Math.abs(dy);if(dist>52&&dist<72){const ballAngle=Math.atan2(0,dy<0?1:-1)+Math.PI/4;const sector=Math.floor(((ballAngle-r.angle+Math.PI*10)%(Math.PI*2))/(Math.PI/2))%4;if(sector!==s.ballColor){s.alive=false;setAlive(false);}else{s.ball.vy=-9;s.score++;s.ballColor=Math.floor(Math.random()*4);setScore(s.score);}}}
        if(s.ball.y>H+20){s.alive=false;setAlive(false);}
      }
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle='#0a0a1e'; ctx.fillRect(0,0,W,H);
      // Grid lines
      ctx.strokeStyle='rgba(255,255,255,0.03)'; ctx.lineWidth=1;
      for(let i=0;i<W;i+=20){ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,H); ctx.stroke();}
      for(let j=0;j<H;j+=20){ctx.beginPath(); ctx.moveTo(0,j); ctx.lineTo(W,j); ctx.stroke();}
      // Rings as 4-segment arcs
      s.rings.forEach(r=>{
        COLORS.forEach((col,i)=>{
          setShadow(ctx,col,6);
          ctx.strokeStyle=col; ctx.lineWidth=10;
          ctx.beginPath(); ctx.arc(W/2,r.y,62,r.angle+i*Math.PI/2+0.05,r.angle+(i+1)*Math.PI/2-0.05); ctx.stroke();
          noShadow(ctx);
        });
        ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(W/2,r.y,62,0,Math.PI*2); ctx.stroke();
      });
      // Ball
      setShadow(ctx,COLORS[s.ballColor],12);
      drawGlowBall(ctx,W/2,s.ball.y,12,COLORS[s.ballColor],COLORS[s.ballColor]+'66');
      noShadow(ctx);
      raf.current=requestAnimationFrame(loop);
    };
    raf.current=requestAnimationFrame(loop);
    return()=>{cancelAnimationFrame(raf.current);window.removeEventListener("keydown",onKey);};
  },[tap]);

  return(
    <div className="flex flex-col items-center gap-2">
      <div className="text-white font-bold">Score: {score}</div>
      <div className="relative">
        <canvas ref={cv} width={280} height={440} className="rounded-xl border border-white/10 cursor-pointer" onClick={tap}/>
        {!started&&<div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl"><div className="text-white font-bold">Tap to Start</div></div>}
        {!alive&&started&&<div className="absolute inset-0 flex items-center justify-center bg-black/65 rounded-xl"><div className="text-white text-center"><div className="font-black">Score: {score}</div><div className="text-sm opacity-70">Tap to restart</div></div></div>}
      </div>
      <div className="text-white/40 text-xs">Match your ball color to the ring section</div>
    </div>
  );
}

function LaneHopper() {
  const LANES=[80,160,240];
  const cv = useRef<HTMLCanvasElement>(null);
  const g = useRef({lane:1,cars:[] as {lane:number,y:number,color:string}[],score:0,alive:true,frame:0});
  const raf = useRef(0);
  const [score,setScore]=useState(0); const [alive,setAlive]=useState(true);
  const CAR_COLORS=['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#a855f7'];

  useEffect(()=>{
    const c=cv.current!; const W=320,H=420;
    const ctx=c.getContext('2d')!;
    let roadOff=0;
    const onKey=(e:KeyboardEvent)=>{
      if(e.key==="ArrowLeft"&&g.current.lane>0){g.current.lane--;e.preventDefault();}
      if(e.key==="ArrowRight"&&g.current.lane<2){g.current.lane++;e.preventDefault();}
    };
    window.addEventListener("keydown",onKey);
    const loop=()=>{
      const s=g.current;
      if(s.alive){
        s.frame++; s.score=Math.floor(s.frame/20); setScore(s.score);
        const speed=3+s.score/200; roadOff=(roadOff+speed)%60;
        if(s.frame%50===0){const l=Math.floor(Math.random()*3);s.cars.push({lane:l,y:-60,color:CAR_COLORS[Math.floor(Math.random()*CAR_COLORS.length)]});}
        for(const car of s.cars){
          (car as any).y+=speed;
          if(Math.abs((car as any).y-340)<32&&car.lane===s.lane){s.alive=false;setAlive(false);}
        }
        s.cars=s.cars.filter(car=>(car as any).y<H+30);
      }
      ctx.clearRect(0,0,W,H);
      // Road
      ctx.fillStyle='#1e293b'; ctx.fillRect(0,0,W,H);
      // Lane markings (scrolling)
      ctx.strokeStyle='rgba(255,220,50,0.25)'; ctx.lineWidth=2; ctx.setLineDash([30,24]);
      ctx.lineDashOffset=-roadOff;
      [W/3,W*2/3].forEach(x=>{ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();});
      ctx.setLineDash([]); ctx.lineDashOffset=0;
      // Road edges
      ctx.fillStyle='#94a3b8'; ctx.fillRect(0,0,4,H); ctx.fillRect(W-4,0,4,H);
      // Trees/scenery
      for(let ty=0;ty<H;ty+=40){ctx.fillStyle='#166534'; ctx.beginPath(); ctx.arc(10,(ty+roadOff)%H,8,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(W-10,(ty+roadOff+20)%H,8,0,Math.PI*2); ctx.fill();}
      // Enemy cars
      s.cars.forEach(car=>drawCar(ctx,LANES[car.lane]-18,(car as any).y-28,36,56,car.color));
      // Player car
      setShadow(ctx,'#7c3aed',10);
      ctx.fillStyle=lgrad(ctx,LANES[s.lane]-18,340-28,LANES[s.lane]+18,340+28,[[0,'#8b5cf6'],[0.5,'#7c3aed'],[1,'#5b21b6']]);
      rr(ctx,LANES[s.lane]-18,340-28,36,56,6); ctx.fill(); noShadow(ctx);
      ctx.fillStyle='rgba(180,240,255,0.6)'; rr(ctx,LANES[s.lane]-12,340-22,22,16,4); ctx.fill();
      ctx.fillStyle='#fbbf24'; setShadow(ctx,'#fbbf24',8); ctx.beginPath(); ctx.arc(LANES[s.lane]-8,340+26,4,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(LANES[s.lane]+8,340+26,4,0,Math.PI*2); ctx.fill(); noShadow(ctx);
      ctx.fillStyle='#374151'; ctx.beginPath(); ctx.arc(LANES[s.lane]-16,340+22,6,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(LANES[s.lane]+16,340+22,6,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(LANES[s.lane]-16,340-22,6,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(LANES[s.lane]+16,340-22,6,0,Math.PI*2); ctx.fill();
      raf.current=requestAnimationFrame(loop);
    };
    raf.current=requestAnimationFrame(loop);
    return()=>{cancelAnimationFrame(raf.current);window.removeEventListener("keydown",onKey);};
  },[]);

  return(
    <div className="flex flex-col items-center gap-2">
      <div className="text-white font-bold">Score: {score}</div>
      <div className="relative">
        <canvas ref={cv} width={320} height={420} className="rounded-xl border border-white/10 cursor-pointer"
          onClick={()=>{if(!g.current.alive){g.current={lane:1,cars:[],score:0,alive:true,frame:0};setScore(0);setAlive(true);}}}/>
        {!alive&&<div className="absolute inset-0 flex items-center justify-center bg-black/65 rounded-xl"><div className="text-white text-center"><div className="font-black">Crash! Score: {score}</div><div className="text-sm opacity-70">Click to restart</div></div></div>}
      </div>
      <div className="text-white/40 text-xs">Arrow keys ← → to switch lanes</div>
    </div>
  );
}

function SpaceInvaders() {
  const cv = useRef<HTMLCanvasElement>(null);
  const g = useRef({player:{x:180},bullets:[] as {x:number,y:number}[],aliens:[] as {x:number,y:number,alive:boolean}[],abombs:[] as {x:number,y:number}[],dir:1,score:0,alive:true,frame:0});
  const raf = useRef(0);
  const [score,setScore]=useState(0); const [alive,setAlive]=useState(true);
  const stars = useRef(makeStars(360,420));
  const initAliens=()=>{const a=[];for(let r=0;r<3;r++)for(let c=0;c<8;c++)a.push({x:60+c*30,y:50+r*30,alive:true});return a;};
  if(!g.current.aliens.length) g.current.aliens=initAliens();

  useEffect(()=>{
    const c=cv.current!; const W=360,H=420;
    const ctx=c.getContext('2d')!;
    let frame=0;
    const onKey=(e:KeyboardEvent)=>{
      const s=g.current;
      if(e.key==="ArrowLeft")s.player.x=Math.max(20,s.player.x-15);
      if(e.key==="ArrowRight")s.player.x=Math.min(W-20,s.player.x+15);
      if(e.key===" "){e.preventDefault();s.bullets.push({x:s.player.x,y:H-60});}
    };
    window.addEventListener("keydown",onKey);
    const loop=()=>{
      const s=g.current; frame++;
      if(s.alive){
        s.frame++; const speed=0.5+s.score/200;
        if(s.frame%30===0){let edge=false;for(const a of s.aliens){if(!a.alive)continue;a.x+=s.dir*(speed*10);if(a.x>W-30||a.x<20)edge=true;}if(edge){s.dir*=-1;for(const a of s.aliens)a.y+=16;}}
        if(s.frame%60===0){const alive2=s.aliens.filter(a=>a.alive);if(alive2.length){const shooter=alive2[Math.floor(Math.random()*alive2.length)];s.abombs.push({x:shooter.x,y:shooter.y});}}
        for(const b of s.bullets)b.y-=8;
        for(const b of s.abombs)b.y+=5;
        for(const a of s.aliens){if(!a.alive)continue;for(const b of s.bullets){if(Math.abs(b.x-a.x)<14&&Math.abs(b.y-a.y)<14){a.alive=false;b.y=-100;s.score+=10;setScore(s.score);}}}
        for(const b of s.abombs){if(Math.abs(b.x-s.player.x)<16&&Math.abs(b.y-(H-50))<16){s.alive=false;setAlive(false);}}
        for(const a of s.aliens){if(a.alive&&a.y>H-80){s.alive=false;setAlive(false);}}
        if(s.aliens.every(a=>!a.alive)){s.aliens=initAliens();s.score+=50;setScore(s.score);}
        s.bullets=s.bullets.filter(b=>b.y>0);
        s.abombs=s.abombs.filter(b=>b.y<H);
      }
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle='#020817'; ctx.fillRect(0,0,W,H);
      stars.current.forEach(st=>drawStar(ctx,st.x,st.y,st.r,st.a+Math.sin(frame*0.02+st.x)*0.2));
      // Aliens
      s.aliens.filter(a=>a.alive).forEach((a,i)=>{
        const type=Math.floor(i/8);
        drawAlien(ctx,a.x,a.y,type,frame);
      });
      // Player ship
      drawSpaceShip(ctx,s.player.x,H-44);
      // Bullets
      s.bullets.forEach(b=>{
        setShadow(ctx,'#fbbf24',8); ctx.fillStyle='#fbbf24';
        rr(ctx,b.x-2,b.y,4,14,2); ctx.fill(); noShadow(ctx);
      });
      // Enemy bombs
      s.abombs.forEach(b=>{
        setShadow(ctx,'#ef4444',8); ctx.fillStyle='#ef4444';
        ctx.beginPath(); ctx.moveTo(b.x,b.y-7); ctx.lineTo(b.x+4,b.y); ctx.lineTo(b.x,b.y+7); ctx.lineTo(b.x-4,b.y); ctx.closePath(); ctx.fill(); noShadow(ctx);
      });
      // Ground line
      ctx.strokeStyle='rgba(124,58,237,0.4)'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(0,H-26); ctx.lineTo(W,H-26); ctx.stroke();
      raf.current=requestAnimationFrame(loop);
    };
    raf.current=requestAnimationFrame(loop);
    return()=>{cancelAnimationFrame(raf.current);window.removeEventListener("keydown",onKey);};
  },[]);

  return(
    <div className="flex flex-col items-center gap-2">
      <div className="text-white font-bold">Score: {score}</div>
      <div className="relative">
        <canvas ref={cv} width={360} height={420} className="rounded-xl border border-white/10 cursor-pointer"
          onClick={()=>{if(!g.current.alive){g.current={player:{x:180},bullets:[],aliens:initAliens(),abombs:[],dir:1,score:0,alive:true,frame:0};setScore(0);setAlive(true);}}}/>
        {!alive&&<div className="absolute inset-0 flex items-center justify-center bg-black/65 rounded-xl"><div className="text-white text-center"><div className="font-black">Game Over! {score} pts</div><div className="text-sm opacity-70">Click to restart</div></div></div>}
      </div>
      <div className="text-white/40 text-xs">← → move · Space shoot</div>
    </div>
  );
}

function FroggerGame() {
  const cv = useRef<HTMLCanvasElement>(null);
  const g = useRef({frog:{x:180,y:380},cars:[] as {x:number,y:number,w:number,dir:1|-1,color:string}[],score:0,alive:true,frame:0});
  const raf = useRef(0);
  const [score,setScore]=useState(0); const [alive,setAlive]=useState(true);
  const ROWS2=[100,180,260];
  const SPEEDS=[2,-1.5,2.5,-2,1.8];
  const CAR_COLORS=['#ef4444','#f97316','#3b82f6','#a855f7','#22d3ee'];
  const initCars=()=>{const cars:{x:number,y:number,w:number,dir:1|-1,color:string}[]=[];ROWS2.forEach((y,ri)=>{for(let i=0;i<3;i++)cars.push({x:i*130+Math.random()*80,y,w:50+Math.random()*25,dir:(ri%2===0?1:-1) as 1|-1,color:CAR_COLORS[ri%CAR_COLORS.length]});});return cars;};
  if(!g.current.cars.length) g.current.cars=initCars();

  useEffect(()=>{
    const c=cv.current!; const W=360,H=420;
    const ctx=c.getContext('2d')!;
    const onKey=(e:KeyboardEvent)=>{
      const s=g.current;
      if(e.key==="ArrowLeft"){s.frog.x=Math.max(20,s.frog.x-40);}
      if(e.key==="ArrowRight"){s.frog.x=Math.min(W-20,s.frog.x+40);}
      if(e.key==="ArrowUp"){s.frog.y=Math.max(30,s.frog.y-40);}
      if(e.key==="ArrowDown"){s.frog.y=Math.min(400,s.frog.y+40);}
      if(s.frog.y<30){s.score++;setScore(s.score);s.frog={x:180,y:380};}
    };
    window.addEventListener("keydown",onKey);
    const loop=()=>{
      const s=g.current;
      if(s.alive){
        s.frame++;
        for(const car of s.cars){car.x+=SPEEDS[ROWS2.indexOf(car.y)%SPEEDS.length];if(car.x>W+car.w)car.x=-car.w-20;if(car.x<-car.w-20)car.x=W+car.w;}
        for(const car of s.cars){if(Math.abs(car.x+car.w/2-s.frog.x)<car.w/2+10&&Math.abs(car.y-s.frog.y)<18){s.alive=false;setAlive(false);}}
      }
      ctx.clearRect(0,0,W,H);
      // Grass areas
      ctx.fillStyle=lgrad(ctx,0,0,0,60,[[0,'#166534'],[1,'#15803d']]); ctx.fillRect(0,0,W,60);
      ctx.fillStyle=lgrad(ctx,0,380,0,H,[[0,'#15803d'],[1,'#166534']]); ctx.fillRect(0,380,W,40);
      // Grass detail
      ctx.fillStyle='rgba(134,239,172,0.2)';
      for(let i=0;i<W;i+=8){ctx.fillRect(i,4,3,14); ctx.fillRect(i+3,386,3,12);}
      // Road sections
      ROWS2.forEach(y=>{
        ctx.fillStyle=lgrad(ctx,0,y-30,0,y+30,[[0,'#1e293b'],[0.5,'#334155'],[1,'#1e293b']]);
        ctx.fillRect(0,y-30,W,60);
        ctx.strokeStyle='rgba(250,204,21,0.2)'; ctx.lineWidth=1; ctx.setLineDash([20,15]);
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); ctx.setLineDash([]);
      });
      // Safe zones
      ctx.fillStyle='rgba(0,0,0,0.15)'; [60,300].forEach(y=>ctx.fillRect(0,y,W,20));
      // Cars
      s.cars.forEach(car=>{
        const cx=car.dir===1?car.x:car.x+car.w;
        drawCar(ctx,cx-car.w*(car.dir===1?0:1)-car.w*(car.dir>0?0:0),car.y-16,car.w,32,car.color);
      });
      // Frog
      const fx=s.frog.x, fy=s.frog.y;
      setShadow(ctx,'rgba(0,0,0,0.3)',6,0,3);
      ctx.fillStyle=rgrad(ctx,fx-5,fy-5,1,14,[[0,'#86efac'],[0.5,'#22c55e'],[1,'#15803d']]);
      ctx.beginPath(); ctx.arc(fx,fy,13,0,Math.PI*2); ctx.fill(); noShadow(ctx);
      ctx.fillStyle='#86efac'; ctx.beginPath(); ctx.arc(fx-5,fy-8,5,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(fx+5,fy-8,5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#1a1a1a'; ctx.beginPath(); ctx.arc(fx-5,fy-8,2.5,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(fx+5,fy-8,2.5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='white'; ctx.beginPath(); ctx.arc(fx-4,fy-9,1,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(fx+6,fy-9,1,0,Math.PI*2); ctx.fill();
      raf.current=requestAnimationFrame(loop);
    };
    raf.current=requestAnimationFrame(loop);
    return()=>{cancelAnimationFrame(raf.current);window.removeEventListener("keydown",onKey);};
  },[]);

  return(
    <div className="flex flex-col items-center gap-2">
      <div className="text-white font-bold">Score: {score}</div>
      <div className="relative">
        <canvas ref={cv} width={360} height={420} className="rounded-xl border border-white/10 cursor-pointer"
          onClick={()=>{if(!g.current.alive){g.current={frog:{x:180,y:380},cars:initCars(),score:0,alive:true,frame:0};setScore(0);setAlive(true);}}}/>
        {!alive&&<div className="absolute inset-0 flex items-center justify-center bg-black/65 rounded-xl"><div className="text-white font-black">Squished! Click to retry</div></div>}
      </div>
      <div className="text-white/40 text-xs">Arrow keys to hop — reach the top!</div>
    </div>
  );
}

function PongGame() {
  const cv = useRef<HTMLCanvasElement>(null);
  const g = useRef({ball:{x:180,y:200,vx:4,vy:3},player:{y:170},ai:{y:170},score:{p:0,ai:0}});
  const raf = useRef(0);
  const [scoreP,setScoreP]=useState(0); const [scoreAI,setScoreAI]=useState(0);

  useEffect(()=>{
    const c=cv.current!; const W=360,H=400;
    const ctx=c.getContext('2d')!;
    const onMouse=(e:MouseEvent)=>{const r=c.getBoundingClientRect();g.current.player.y=e.clientY-r.top-40;};
    const onTouch=(e:TouchEvent)=>{const r=c.getBoundingClientRect();g.current.player.y=e.touches[0].clientY-r.top-40;};
    c.addEventListener("mousemove",onMouse); c.addEventListener("touchmove",onTouch,{passive:true});
    let pCounter=0;
    const loop=()=>{
      const s=g.current; pCounter++;
      s.ball.x+=s.ball.vx; s.ball.y+=s.ball.vy;
      if(s.ball.y<8||s.ball.y>H-8)s.ball.vy*=-1;
      const py=Math.max(0,Math.min(H-80,s.player.y));
      if(s.ball.x<32&&s.ball.x>20&&s.ball.y>py&&s.ball.y<py+80)s.ball.vx=Math.abs(s.ball.vx)+0.3;
      s.ai.y+=(s.ball.y-s.ai.y-40)*0.08;
      const ay=Math.max(0,Math.min(H-80,s.ai.y));
      if(s.ball.x>W-32&&s.ball.x<W-20&&s.ball.y>ay&&s.ball.y<ay+80)s.ball.vx=-(Math.abs(s.ball.vx)+0.3);
      if(s.ball.x<0){s.score.ai++;setScoreAI(s.score.ai);s.ball={x:180,y:200,vx:4,vy:3};}
      if(s.ball.x>W){s.score.p++;setScoreP(s.score.p);s.ball={x:180,y:200,vx:-4,vy:3};}

      ctx.clearRect(0,0,W,H);
      ctx.fillStyle='#0f172a'; ctx.fillRect(0,0,W,H);
      // Mid line
      ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=2; ctx.setLineDash([8,8]);
      ctx.beginPath(); ctx.moveTo(W/2,0); ctx.lineTo(W/2,H); ctx.stroke(); ctx.setLineDash([]);
      // Center circle
      ctx.strokeStyle='rgba(255,255,255,0.04)'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(W/2,H/2,50,0,Math.PI*2); ctx.stroke();
      // Paddles
      setShadow(ctx,'#7c3aed',12);
      ctx.fillStyle=lgrad(ctx,14,py,24,py+80,[[0,'#8b5cf6'],[1,'#6d28d9']]);
      rr(ctx,14,py,14,80,7); ctx.fill(); noShadow(ctx);
      ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.fillRect(17,py+4,5,16);
      setShadow(ctx,'#ef4444',12);
      ctx.fillStyle=lgrad(ctx,W-28,ay,W-14,ay+80,[[0,'#f87171'],[1,'#dc2626']]);
      rr(ctx,W-28,ay,14,80,7); ctx.fill(); noShadow(ctx);
      ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.fillRect(W-26,ay+4,5,16);
      // Ball
      const trailAlpha=0.3;
      ctx.fillStyle=`rgba(255,255,255,${trailAlpha})`; ctx.beginPath(); ctx.arc(s.ball.x-s.ball.vx*2,s.ball.y-s.ball.vy*2,5,0,Math.PI*2); ctx.fill();
      drawGlowBall(ctx,s.ball.x,s.ball.y,9,'white','rgba(200,200,255,0.5)');
      raf.current=requestAnimationFrame(loop);
    };
    raf.current=requestAnimationFrame(loop);
    return()=>{cancelAnimationFrame(raf.current);c.removeEventListener("mousemove",onMouse);c.removeEventListener("touchmove",onTouch);};
  },[]);

  return(
    <div className="flex flex-col items-center gap-2">
      <div className="text-white font-bold text-xl">{scoreP} : {scoreAI}</div>
      <canvas ref={cv} width={360} height={400} className="rounded-xl border border-white/10"/>
      <div className="text-white/40 text-xs">Move mouse up/down to control your paddle</div>
    </div>
  );
}

function AsteroidsGame() {
  const cv = useRef<HTMLCanvasElement>(null);
  const g = useRef({ship:{x:200,y:200,angle:0,vx:0,vy:0},bullets:[] as {x:number,y:number,vx:number,vy:number,life:number}[],rocks:[] as {x:number,y:number,vx:number,vy:number,r:number,points:number[]}[],score:0,alive:true,keys:{} as Record<string,boolean>});
  const raf = useRef(0);
  const [score,setScore]=useState(0); const [alive,setAlive]=useState(true);
  const stars = useRef(makeStars(400,400));
  const makeRockPoints=(r:number)=>Array.from({length:10},(_,i)=>{const a=i*Math.PI*2/10;const rr2=r*(0.7+Math.random()*0.5);return Math.cos(a)*rr2+Math.sin(a)*rr2+rr2;});
  const initRocks=()=>Array.from({length:5},(_,i)=>({x:50+i*70,y:50,vx:(Math.random()-0.5)*2,vy:(Math.random()-0.5)*2,r:25+Math.random()*15,points:Array.from({length:10},(_,k)=>{const a=k*Math.PI*2/10;const rv=25+Math.random()*10;return rv;})}));
  if(!g.current.rocks.length) g.current.rocks=initRocks();

  function drawRock(ctx: C2D, x: number, y: number, r: number, points: number[], angle: number) {
    ctx.save();
    ctx.strokeStyle='#94a3b8'; ctx.lineWidth=2; ctx.fillStyle='rgba(51,65,85,0.7)';
    ctx.shadowColor='#94a3b8'; ctx.shadowBlur=3;
    ctx.beginPath();
    points.forEach((rv,i)=>{const a=i*Math.PI*2/points.length+angle; if(i===0)ctx.moveTo(x+Math.cos(a)*rv,y+Math.sin(a)*rv); else ctx.lineTo(x+Math.cos(a)*rv,y+Math.sin(a)*rv);});
    ctx.closePath(); ctx.fill(); ctx.stroke(); noShadow(ctx);
    ctx.restore();
  }

  useEffect(()=>{
    const c=cv.current!; const W=400,H=400;
    const ctx=c.getContext('2d')!;
    let rockAngles: number[]=[];
    const onKey=(e:KeyboardEvent)=>{
      g.current.keys[e.code]=e.type==="keydown";
      if(e.code==="Space"&&e.type==="keydown"){const s=g.current.ship;g.current.bullets.push({x:s.x,y:s.y,vx:Math.sin(s.angle)*10,vy:-Math.cos(s.angle)*10,life:40});}
      e.preventDefault();
    };
    window.addEventListener("keydown",onKey); window.addEventListener("keyup",onKey);
    const loop=()=>{
      const s=g.current;
      if(rockAngles.length!==s.rocks.length)rockAngles=s.rocks.map(()=>0);
      if(s.alive){
        const k=s.keys;
        if(k["ArrowLeft"]||k["KeyA"])s.ship.angle-=0.06;
        if(k["ArrowRight"]||k["KeyD"])s.ship.angle+=0.06;
        if(k["ArrowUp"]||k["KeyW"]){s.ship.vx+=Math.sin(s.ship.angle)*0.3;s.ship.vy-=Math.cos(s.ship.angle)*0.3;}
        s.ship.vx*=0.98; s.ship.vy*=0.98;
        s.ship.x=(s.ship.x+s.ship.vx+W)%W; s.ship.y=(s.ship.y+s.ship.vy+H)%H;
        for(const b of s.bullets){b.x=(b.x+b.vx+W)%W;b.y=(b.y+b.vy+H)%H;b.life--;}
        for(const r of s.rocks){r.x=(r.x+r.vx+W)%W;r.y=(r.y+r.vy+H)%H;}
        rockAngles.forEach((_,i)=>rockAngles[i]+=0.01);
        s.bullets=s.bullets.filter(b=>b.life>0);
        const newRocks: typeof s.rocks=[];
        for(let ri=0;ri<s.rocks.length;ri++){const r=s.rocks[ri];let hit=false;for(const b of s.bullets){if(Math.hypot(b.x-r.x,b.y-r.y)<r.r){hit=true;b.life=0;s.score+=10;setScore(s.score);if(r.r>15){for(let _=0;_<2;_++)newRocks.push({x:r.x,y:r.y,vx:(Math.random()-0.5)*3,vy:(Math.random()-0.5)*3,r:r.r*0.55,points:Array.from({length:8},()=>r.r*0.55*(0.7+Math.random()*0.5))});} break;}}if(!hit)newRocks.push(r);}
        s.rocks=newRocks;
        if(!s.rocks.length)s.rocks=initRocks();
        for(const r of s.rocks){if(Math.hypot(s.ship.x-r.x,s.ship.y-r.y)<r.r-5){s.alive=false;setAlive(false);}}
      }
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle='#020817'; ctx.fillRect(0,0,W,H);
      stars.current.forEach(st=>drawStar(ctx,st.x,st.y,st.r,st.a));
      s.rocks.forEach((r,ri)=>drawRock(ctx,r.x,r.y,r.r,r.points,rockAngles[ri]||0));
      s.bullets.forEach(b=>{setShadow(ctx,'#fbbf24',8); ctx.fillStyle='#fbbf24'; ctx.beginPath(); ctx.arc(b.x,b.y,3,0,Math.PI*2); ctx.fill(); noShadow(ctx);});
      // Ship (vector style)
      if(s.alive){
        const {x,y,angle}=s.ship;
        ctx.save(); ctx.translate(x,y); ctx.rotate(angle);
        setShadow(ctx,'#a78bfa',8);
        ctx.strokeStyle='#c4b5fd'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(0,-16); ctx.lineTo(12,14); ctx.lineTo(0,9); ctx.lineTo(-12,14); ctx.closePath(); ctx.stroke();
        if(s.keys["ArrowUp"]||s.keys["KeyW"]){ctx.strokeStyle='#f97316'; ctx.beginPath(); ctx.moveTo(-5,9); ctx.lineTo(0,22); ctx.lineTo(5,9); ctx.stroke();}
        noShadow(ctx); ctx.restore();
      }
      raf.current=requestAnimationFrame(loop);
    };
    raf.current=requestAnimationFrame(loop);
    return()=>{cancelAnimationFrame(raf.current);window.removeEventListener("keydown",onKey);window.removeEventListener("keyup",onKey);};
  },[]);

  return(
    <div className="flex flex-col items-center gap-2">
      <div className="text-white font-bold">Score: {score}</div>
      <div className="relative">
        <canvas ref={cv} width={400} height={400} className="rounded-xl border border-white/10 cursor-pointer"
          onClick={()=>{if(!g.current.alive){g.current={ship:{x:200,y:200,angle:0,vx:0,vy:0},bullets:[],rocks:initRocks(),score:0,alive:true,keys:{}};setScore(0);setAlive(true);}}}/>
        {!alive&&<div className="absolute inset-0 flex items-center justify-center bg-black/65 rounded-xl"><div className="text-white text-center"><div className="font-black">Game Over! {score}</div><div className="text-sm opacity-70">Click to restart</div></div></div>}
      </div>
      <div className="text-white/40 text-xs">WASD / Arrows to move · Space to shoot</div>
    </div>
  );
}

function GeometryDash() {
  const cv = useRef<HTMLCanvasElement>(null);
  const g = useRef({y:240,vy:0,onGround:true,obstacles:[] as {x:number,h:number,type:"spike"|"block"}[],score:0,alive:true,frame:0});
  const raf = useRef(0);
  const [score,setScore]=useState(0); const [alive,setAlive]=useState(true);
  const jump=useCallback(()=>{
    if(!g.current.alive){g.current={y:240,vy:0,onGround:true,obstacles:[],score:0,alive:true,frame:0};setScore(0);setAlive(true);return;}
    if(g.current.onGround){g.current.vy=-13;g.current.onGround=false;}
  },[]);

  useEffect(()=>{
    const c=cv.current!; const W=400,H=300,GROUND=258;
    const ctx=c.getContext('2d')!;
    const onKey=(e:KeyboardEvent)=>{if(e.code==="Space"||e.key==="ArrowUp"){e.preventDefault();jump();}};
    window.addEventListener("keydown",onKey);
    const loop=()=>{
      const s=g.current; const spd=6+s.score/300;
      if(s.alive){
        s.vy+=0.8; s.y+=s.vy;
        if(s.y>=GROUND){s.y=GROUND;s.vy=0;s.onGround=true;}
        s.frame++; s.score=Math.floor(s.frame/10); setScore(s.score);
        if(s.frame%70===0)s.obstacles.push({x:W,h:28+Math.random()*22,type:Math.random()<0.5?"spike":"block"});
        for(const o of s.obstacles){o.x-=spd;if(o.x<88&&o.x>46){const inY=s.y+22>GROUND+2-o.h&&s.y<GROUND+2;if(inY){s.alive=false;setAlive(false);}}}
        s.obstacles=s.obstacles.filter(o=>o.x>-40);
      }
      ctx.clearRect(0,0,W,H);
      // Gradient background
      ctx.fillStyle=lgrad(ctx,0,0,0,H,[[0,'#1a0533'],[0.4,'#2d1065'],[0.8,'#1a0533'],[1,'#0d0d1e']]); ctx.fillRect(0,0,W,H);
      // Background grid lines
      ctx.strokeStyle='rgba(124,58,237,0.08)'; ctx.lineWidth=1;
      for(let i=0;i<W;i+=40){ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,H); ctx.stroke();}
      for(let j=0;j<H;j+=30){ctx.beginPath(); ctx.moveTo(0,j); ctx.lineTo(W,j); ctx.stroke();}
      // Ground platform
      ctx.fillStyle=lgrad(ctx,0,GROUND,0,H,[[0,'#7c3aed'],[1,'#4c1d95']]);
      ctx.fillRect(0,GROUND,W,H-GROUND);
      setShadow(ctx,'#a78bfa',10); ctx.fillStyle='#a78bfa'; ctx.fillRect(0,GROUND,W,3); noShadow(ctx);
      // Obstacles
      s.obstacles.forEach(o=>{
        if(o.type==="spike"){
          setShadow(ctx,'#ef4444',8);
          ctx.fillStyle=lgrad(ctx,o.x-14,GROUND,o.x+14,GROUND-o.h,[[0,'#ef4444'],[1,'#fca5a5']]);
          ctx.beginPath(); ctx.moveTo(o.x-14,GROUND+2); ctx.lineTo(o.x,GROUND-o.h); ctx.lineTo(o.x+14,GROUND+2); ctx.closePath(); ctx.fill(); noShadow(ctx);
          ctx.strokeStyle='rgba(255,255,255,0.4)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(o.x-14,GROUND+2); ctx.lineTo(o.x,GROUND-o.h); ctx.stroke();
        } else {
          setShadow(ctx,'#f97316',8);
          ctx.fillStyle=lgrad(ctx,o.x-14,GROUND-o.h,o.x+14,GROUND,[[0,'#fbbf24'],[1,'#f97316']]);
          rr(ctx,o.x-14,GROUND-o.h,28,o.h,4); ctx.fill(); noShadow(ctx);
          ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.fillRect(o.x-10,GROUND-o.h+3,8,4);
        }
      });
      // Player cube (spinning when airborne)
      const spin=s.onGround?0:s.frame*0.2;
      ctx.save(); ctx.translate(64,s.y+11); ctx.rotate(spin);
      setShadow(ctx,'#60a5fa',12);
      ctx.fillStyle=lgrad(ctx,-11,-11,11,11,[[0,'#93c5fd'],[1,'#3b82f6']]);
      rr(ctx,-11,-11,22,22,4); ctx.fill(); noShadow(ctx);
      ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.fillRect(-7,-7,7,4);
      // X decoration
      ctx.strokeStyle='rgba(255,255,255,0.3)'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(-5,-5); ctx.lineTo(5,5); ctx.moveTo(5,-5); ctx.lineTo(-5,5); ctx.stroke();
      ctx.restore();
      // Speed lines
      ctx.strokeStyle='rgba(255,255,255,0.04)'; ctx.lineWidth=1;
      for(let i=0;i<6;i++){const lx=(s.frame*spd*0.5+i*80)%W; ctx.beginPath(); ctx.moveTo(W-lx,GROUND-30-i*20); ctx.lineTo(W-lx-40,GROUND-30-i*20); ctx.stroke();}
      raf.current=requestAnimationFrame(loop);
    };
    raf.current=requestAnimationFrame(loop);
    return()=>{cancelAnimationFrame(raf.current);window.removeEventListener("keydown",onKey);};
  },[jump]);

  return(
    <div className="flex flex-col items-center gap-2">
      <div className="text-white font-bold">Score: {score}</div>
      <div className="relative">
        <canvas ref={cv} width={400} height={300} className="rounded-xl border border-white/10 cursor-pointer" onClick={jump}/>
        {!alive&&<div className="absolute inset-0 flex items-center justify-center bg-black/65 rounded-xl"><div className="text-white text-center"><div className="font-black">Score: {score}</div><div className="text-sm opacity-70">Tap to restart</div></div></div>}
      </div>
      <div className="text-white/40 text-xs">Tap or Space to jump over obstacles</div>
    </div>
  );
}

function NeonRacer() {
  const cv = useRef<HTMLCanvasElement>(null);
  const g = useRef({lane:1,cars:[] as {x:number,y:number,color:string}[],score:0,alive:true,frame:0,moving:{left:false,right:false}});
  const raf = useRef(0);
  const [score,setScore]=useState(0); const [alive,setAlive]=useState(true);
  const LANESX=[80,200,320];
  const CARCOLORS=['#ef4444','#22c55e','#f97316','#a855f7','#22d3ee'];

  useEffect(()=>{
    const c=cv.current!; const W=400,H=500;
    const ctx=c.getContext('2d')!;
    let roadOff=0;
    const onKey=(e:KeyboardEvent)=>{if(e.key==="ArrowLeft")g.current.moving.left=e.type==="keydown";if(e.key==="ArrowRight")g.current.moving.right=e.type==="keydown";};
    window.addEventListener("keydown",onKey); window.addEventListener("keyup",onKey);
    const loop=()=>{
      const s=g.current; const speed=4+s.score/500;
      if(s.alive){
        if(s.moving.left&&s.lane>0)s.lane--;
        if(s.moving.right&&s.lane<2)s.lane++;
        s.moving.left=false; s.moving.right=false;
        s.frame++; s.score=Math.floor(s.frame/20); setScore(s.score);
        roadOff=(roadOff+speed*2)%80;
        if(s.frame%60===0)s.cars.push({x:LANESX[Math.floor(Math.random()*3)],y:-50,color:CARCOLORS[Math.floor(Math.random()*CARCOLORS.length)]});
        for(const car of s.cars){car.y+=speed;if(car.y>H-80&&car.y<H-20&&car.x===LANESX[s.lane]){s.alive=false;setAlive(false);}}
        s.cars=s.cars.filter(car=>car.y<H+10);
      }
      ctx.clearRect(0,0,W,H);
      // Dark road
      ctx.fillStyle='#090914'; ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#111827'; ctx.fillRect(20,0,W-40,H);
      // Lane lines (neon)
      const neonCols=['#22d3ee','#a855f7','#22d3ee'];
      [W/3+20,W*2/3+20].forEach((x,i)=>{
        setShadow(ctx,neonCols[i],6);
        ctx.strokeStyle=neonCols[i]+'88'; ctx.lineWidth=1.5; ctx.setLineDash([30,20]); ctx.lineDashOffset=-roadOff;
        ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset=0; noShadow(ctx);
      });
      // Road edge neon
      setShadow(ctx,'#22d3ee',8); ctx.strokeStyle='#22d3ee44'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(20,0); ctx.lineTo(20,H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W-20,0); ctx.lineTo(W-20,H); ctx.stroke(); noShadow(ctx);
      // Speed lines
      ctx.strokeStyle='rgba(255,255,255,0.03)'; ctx.lineWidth=1;
      for(let i=0;i<8;i++){const ly=(roadOff*5+i*70)%H; ctx.beginPath(); ctx.moveTo(50,ly); ctx.lineTo(50,ly+30); ctx.stroke(); ctx.beginPath(); ctx.moveTo(W-50,ly+15); ctx.lineTo(W-50,ly+45); ctx.stroke();}
      // Enemy cars
      s.cars.forEach(car=>{
        setShadow(ctx,car.color,10);
        ctx.fillStyle=lgrad(ctx,car.x-18,car.y-30,car.x+18,car.y+30,[[0,car.color+'88'],[0.5,car.color],[1,car.color+'88']]);
        rr(ctx,car.x-18,car.y-30,36,60,6); ctx.fill(); noShadow(ctx);
        ctx.fillStyle='rgba(200,240,255,0.5)'; rr(ctx,car.x-12,car.y-22,22,16,4); ctx.fill();
        setShadow(ctx,car.color,6); ctx.fillStyle=car.color+'cc';
        ctx.beginPath(); ctx.arc(car.x-10,car.y+26,5,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(car.x+10,car.y+26,5,0,Math.PI*2); ctx.fill(); noShadow(ctx);
      });
      // Player car
      const px=LANESX[s.lane];
      setShadow(ctx,'#7c3aed',16);
      ctx.fillStyle=lgrad(ctx,px-18,H-90,px+18,H-30,[[0,'#8b5cf6'],[0.5,'#7c3aed'],[1,'#4c1d95']]);
      rr(ctx,px-18,H-90,36,60,6); ctx.fill(); noShadow(ctx);
      ctx.fillStyle='rgba(180,240,255,0.6)'; rr(ctx,px-12,H-82,22,16,4); ctx.fill();
      setShadow(ctx,'#fbbf24',10); ctx.fillStyle='#fbbf24';
      ctx.beginPath(); ctx.arc(px-8,H-32,5,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(px+8,H-32,5,0,Math.PI*2); ctx.fill(); noShadow(ctx);
      raf.current=requestAnimationFrame(loop);
    };
    raf.current=requestAnimationFrame(loop);
    return()=>{cancelAnimationFrame(raf.current);window.removeEventListener("keydown",onKey);window.removeEventListener("keyup",onKey);};
  },[]);

  return(
    <div className="flex flex-col items-center gap-2">
      <div className="text-white font-bold">Score: {score}</div>
      <div className="relative">
        <canvas ref={cv} width={400} height={500} className="rounded-xl border border-white/10 cursor-pointer"
          onClick={()=>{if(!g.current.alive){g.current={lane:1,cars:[],score:0,alive:true,frame:0,moving:{left:false,right:false}};setScore(0);setAlive(true);}}}/>
        {!alive&&<div className="absolute inset-0 flex items-center justify-center bg-black/65 rounded-xl"><div className="text-white text-center"><div className="font-black">Crashed! Score: {score}</div><div className="text-sm opacity-70">Click to restart</div></div></div>}
      </div>
      <div className="flex gap-3"><button onMouseDown={()=>g.current.lane=Math.max(0,g.current.lane-1)} className="px-6 py-2 bg-white/10 rounded-lg text-white font-bold hover:bg-white/20">← Left</button><button onMouseDown={()=>g.current.lane=Math.min(2,g.current.lane+1)} className="px-6 py-2 bg-white/10 rounded-lg text-white font-bold hover:bg-white/20">Right →</button></div>
      <div className="text-white/40 text-xs">Arrow keys or buttons to change lanes</div>
    </div>
  );
}

function FruitSlice() {
  const cv = useRef<HTMLCanvasElement>(null);
  const g = useRef({fruits:[] as {x:number,y:number,vx:number,vy:number,type:string,sliced:boolean,r:number,color:string}[],score:0,lives:3,alive:true,frame:0,mouse:{x:0,y:0,px:0,py:0,down:false},trail:[] as {x:number,y:number}[]});
  const raf = useRef(0);
  const [score,setScore]=useState(0); const [lives,setLives]=useState(3); const [alive,setAlive]=useState(true);
  const FCOLORS=['#ef4444','#f97316','#eab308','#a855f7','#ec4899','#22c55e'];
  const FEMOJIS=['🍎','🍊','🍋','🍇','🍓','🍐'];

  useEffect(()=>{
    const c=cv.current!; const W=360,H=420;
    const ctx=c.getContext('2d')!;
    const onMove=(e:MouseEvent)=>{const r=c.getBoundingClientRect();const s=g.current.mouse;s.px=s.x;s.py=s.y;s.x=e.clientX-r.left;s.y=e.clientY-r.top;s.down=!!(e.buttons&1);};
    const onTouch=(e:TouchEvent)=>{e.preventDefault();const r=c.getBoundingClientRect();const s=g.current.mouse;s.px=s.x;s.py=s.y;s.x=e.touches[0].clientX-r.left;s.y=e.touches[0].clientY-r.top;s.down=true;};
    const onTouchEnd=()=>g.current.mouse.down=false;
    c.addEventListener("mousemove",onMove); c.addEventListener("touchmove",onTouch,{passive:false}); c.addEventListener("touchend",onTouchEnd);
    const loop=()=>{
      const s=g.current;
      if(s.alive){
        s.frame++;
        if(s.mouse.down){s.trail.push({x:s.mouse.x,y:s.mouse.y});if(s.trail.length>12)s.trail.shift();}else{if(s.trail.length>0)s.trail.pop();}
        if(s.frame%50===0){const x=Math.random()*W;const isBomb=s.frame%200<40;s.fruits.push({x,y:H,vx:(Math.random()-0.5)*4,vy:-(12+Math.random()*6),type:isBomb?"bomb":"fruit",sliced:false,r:22,color:isBomb?"#1e293b":FCOLORS[Math.floor(Math.random()*FCOLORS.length)]});}
        for(const f of s.fruits){
          f.x+=f.vx; f.y+=f.vy; f.vy+=0.4;
          if(!f.sliced&&s.mouse.down){const dx=s.mouse.x-s.mouse.px,dy=s.mouse.y-s.mouse.py;const steps=Math.ceil(Math.hypot(dx,dy)/5);for(let t=0;t<=steps;t++){const sx=s.mouse.px+dx*t/steps,sy=s.mouse.py+dy*t/steps;if(Math.hypot(sx-f.x,sy-f.y)<f.r+10){f.sliced=true;if(f.type==="bomb"){s.lives--;setLives(s.lives);if(s.lives<=0){s.alive=false;setAlive(false);}}else{s.score++;setScore(s.score);}break;}}}
          if(!f.sliced&&f.y>H+10&&f.type!=="bomb"){s.lives--;setLives(s.lives);if(s.lives<=0){s.alive=false;setAlive(false);}}
        }
        s.fruits=s.fruits.filter(f=>f.y<H+60&&!f.sliced);
      }
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle=lgrad(ctx,0,0,0,H,[[0,'#0f172a'],[1,'#1e293b']]); ctx.fillRect(0,0,W,H);
      // Particles/sparkle bg
      for(let i=0;i<5;i++){ctx.fillStyle=`rgba(255,255,255,${0.01+Math.random()*0.02})`; ctx.beginPath(); ctx.arc(Math.random()*W,Math.random()*H,1,0,Math.PI*2); ctx.fill();}
      // Fruits
      s.fruits.forEach((f,fi)=>{
        if(f.type==="bomb"){
          drawGlowBall(ctx,f.x,f.y,f.r,'#334155','rgba(100,100,100,0.3)');
          ctx.strokeStyle='#92400e'; ctx.lineWidth=2;
          ctx.beginPath(); ctx.moveTo(f.x+6,f.y-f.r); ctx.quadraticCurveTo(f.x+14,f.y-f.r-10,f.x+10,f.y-f.r-16); ctx.stroke();
          setShadow(ctx,'#fbbf24',6); ctx.fillStyle='#fbbf24'; ctx.beginPath(); ctx.arc(f.x+10,f.y-f.r-16,4,0,Math.PI*2); ctx.fill(); noShadow(ctx);
          ctx.font='14px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('💣',f.x,f.y);
        } else {
          setShadow(ctx,f.color,8);
          drawGlowBall(ctx,f.x,f.y,f.r,f.color,f.color+'44');
          noShadow(ctx);
          ctx.font='18px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(FEMOJIS[FCOLORS.indexOf(f.color)%FEMOJIS.length],f.x,f.y);
        }
      });
      // Slice trail
      if(s.trail.length>2){
        ctx.save();
        ctx.strokeStyle='rgba(255,255,255,0.9)'; ctx.lineWidth=2.5; ctx.lineCap='round'; ctx.lineJoin='round';
        ctx.shadowColor='white'; ctx.shadowBlur=10;
        ctx.beginPath(); s.trail.forEach((pt,i)=>{if(i===0)ctx.moveTo(pt.x,pt.y);else ctx.lineTo(pt.x,pt.y);});
        ctx.globalAlpha=0.8; ctx.stroke(); ctx.globalAlpha=1; noShadow(ctx); ctx.restore();
      }
      raf.current=requestAnimationFrame(loop);
    };
    raf.current=requestAnimationFrame(loop);
    return()=>{cancelAnimationFrame(raf.current);c.removeEventListener("mousemove",onMove);c.removeEventListener("touchmove",onTouch);c.removeEventListener("touchend",onTouchEnd);};
  },[]);

  return(
    <div className="flex flex-col items-center gap-2">
      <div className="text-white font-bold">Score: {score} ❤️{lives}</div>
      <div className="relative">
        <canvas ref={cv} width={360} height={420} className="rounded-xl border border-white/10 cursor-pointer select-none"
          onClick={()=>{if(!g.current.alive){g.current={fruits:[],score:0,lives:3,alive:true,frame:0,mouse:{x:0,y:0,px:0,py:0,down:false},trail:[]};setScore(0);setLives(3);setAlive(true);}}}/>
        {!alive&&<div className="absolute inset-0 flex items-center justify-center bg-black/65 rounded-xl"><div className="text-white text-center"><div className="font-black">Score: {score}</div><div className="text-sm opacity-70">Click to restart</div></div></div>}
      </div>
      <div className="text-white/40 text-xs">Drag to slice fruits · avoid bombs!</div>
    </div>
  );
}

function TankBattle() {
  const cv = useRef<HTMLCanvasElement>(null);
  const g = useRef({tank:{x:200,y:350,angle:0},bullets:[] as {x:number,y:number,vx:number,vy:number}[],enemies:[] as {x:number,y:number,angle:number,hp:number}[],score:0,alive:true,keys:{} as Record<string,boolean>,frame:0});
  const raf = useRef(0);
  const [score,setScore]=useState(0); const [alive,setAlive]=useState(true);
  const initEnemies=()=>Array(4).fill(null).map((_,i)=>({x:80+i*80,y:60+Math.random()*80,angle:Math.PI,hp:2}));
  if(!g.current.enemies.length) g.current.enemies=initEnemies();

  function drawTank(ctx: C2D, x: number, y: number, angle: number, col: string) {
    ctx.save(); ctx.translate(x,y); ctx.rotate(angle);
    setShadow(ctx,'rgba(0,0,0,0.5)',8,0,3);
    ctx.fillStyle=lgrad(ctx,-14,-14,14,14,[[0,col+'bb'],[0.5,col],[1,col+'99']]);
    rr(ctx,-14,-14,28,28,5); ctx.fill(); noShadow(ctx);
    ctx.fillStyle=col+'dd'; ctx.beginPath(); ctx.arc(0,0,8,0,Math.PI*2); ctx.fill();
    setShadow(ctx,col,6); ctx.fillStyle=col; ctx.fillRect(-3,-18,6,18); noShadow(ctx);
    ctx.strokeStyle='rgba(0,0,0,0.3)'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(-14,-8); ctx.lineTo(-14,8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(14,-8); ctx.lineTo(14,8); ctx.stroke();
    // Treads
    ctx.fillStyle='rgba(0,0,0,0.25)';
    for(let i=-3;i<=3;i++){ctx.fillRect(-16,i*4-1,3,3); ctx.fillRect(13,i*4-1,3,3);}
    ctx.restore();
  }

  useEffect(()=>{
    const c=cv.current!; const W=400,H=420;
    const ctx=c.getContext('2d')!;
    const onKey=(e:KeyboardEvent)=>{g.current.keys[e.code]=e.type==="keydown";if(e.code==="Space"&&e.type==="keydown"){const t=g.current.tank;g.current.bullets.push({x:t.x+Math.sin(t.angle)*24,y:t.y-Math.cos(t.angle)*24,vx:Math.sin(t.angle)*10,vy:-Math.cos(t.angle)*10});}e.preventDefault();};
    window.addEventListener("keydown",onKey); window.addEventListener("keyup",onKey);
    const loop=()=>{
      const s=g.current; s.frame++;
      if(s.alive){
        const k=s.keys;
        if(k["ArrowLeft"]||k["KeyA"])s.tank.angle-=0.08;
        if(k["ArrowRight"]||k["KeyD"])s.tank.angle+=0.08;
        if(k["ArrowUp"]||k["KeyW"]){s.tank.x=Math.max(20,Math.min(W-20,s.tank.x+Math.sin(s.tank.angle)*3));s.tank.y=Math.max(20,Math.min(H-20,s.tank.y-Math.cos(s.tank.angle)*3));}
        for(const b of s.bullets){b.x+=b.vx;b.y+=b.vy;}
        s.bullets=s.bullets.filter(b=>b.x>0&&b.x<W&&b.y>0&&b.y<H);
        for(const e of s.enemies){e.angle=Math.atan2(s.tank.x-e.x,s.tank.y-e.y);e.x+=Math.sin(e.angle)*0.8;e.y+=Math.cos(e.angle)*0.8;if(Math.hypot(e.x-s.tank.x,e.y-s.tank.y)<26){s.alive=false;setAlive(false);}}
        const alive: typeof s.enemies=[];
        for(const e of s.enemies){let hit=false;for(const b of s.bullets){if(Math.hypot(b.x-e.x,b.y-e.y)<18){b.x=-100;e.hp--;if(e.hp<=0){s.score+=100;setScore(s.score);hit=true;}break;}}if(!hit)alive.push(e);}
        s.enemies=alive;if(!s.enemies.length){s.enemies=initEnemies().map(e=>({...e,hp:3}));}
      }
      ctx.clearRect(0,0,W,H);
      // Terrain
      ctx.fillStyle='#1a2e1a'; ctx.fillRect(0,0,W,H);
      for(let i=0;i<W;i+=20)for(let j=0;j<H;j+=20){if((i/20+j/20)%3===0){ctx.fillStyle='rgba(0,0,0,0.12)'; ctx.fillRect(i,j,20,20);}else if((i/20+j/20)%5===0){ctx.fillStyle='rgba(255,255,255,0.02)'; ctx.fillRect(i,j,20,20);}}
      // Decorations
      for(let i=0;i<4;i++){ctx.fillStyle='#134e2a'; ctx.beginPath(); ctx.arc(30+i*100,30,12,0,Math.PI*2); ctx.fill();}
      // Enemy tanks
      s.enemies.forEach(e=>drawTank(ctx,e.x,e.y,e.angle,'#ef4444'));
      // Player tank
      drawTank(ctx,s.tank.x,s.tank.y,s.tank.angle,'#22c55e');
      // Bullets
      s.bullets.forEach(b=>{setShadow(ctx,'#fbbf24',10); drawGlowBall(ctx,b.x,b.y,5,'#fbbf24','#fbbf2488'); noShadow(ctx);});
      raf.current=requestAnimationFrame(loop);
    };
    raf.current=requestAnimationFrame(loop);
    return()=>{cancelAnimationFrame(raf.current);window.removeEventListener("keydown",onKey);window.removeEventListener("keyup",onKey);};
  },[]);

  return(
    <div className="flex flex-col items-center gap-2">
      <div className="text-white font-bold">Score: {score}</div>
      <div className="relative">
        <canvas ref={cv} width={400} height={420} className="rounded-xl border border-white/10 cursor-pointer"
          onClick={()=>{if(!g.current.alive){g.current={tank:{x:200,y:350,angle:0},bullets:[],enemies:initEnemies(),score:0,alive:true,keys:{},frame:0};setScore(0);setAlive(true);}}}/>
        {!alive&&<div className="absolute inset-0 flex items-center justify-center bg-black/65 rounded-xl"><div className="text-white text-center"><div className="font-black">Destroyed! {score}</div><div className="text-sm opacity-70">Click to restart</div></div></div>}
      </div>
      <div className="text-white/40 text-xs">WASD / Arrows move · Space shoot</div>
    </div>
  );
}

function SkyDefender() {
  const cv = useRef<HTMLCanvasElement>(null);
  const g = useRef({ship:{x:190},bullets:[] as {x:number,y:number}[],enemies:[] as {x:number,y:number,hp:number}[],bombs:[] as {x:number,y:number}[],score:0,alive:true,frame:0,keys:{} as Record<string,boolean>});
  const raf = useRef(0);
  const [score,setScore]=useState(0); const [alive,setAlive]=useState(true);
  const stars = useRef(makeStars(380,450));

  useEffect(()=>{
    const c=cv.current!; const W=380,H=450;
    const ctx=c.getContext('2d')!;
    const onKey=(e:KeyboardEvent)=>{g.current.keys[e.code]=e.type==="keydown";if(e.code==="Space"&&e.type==="keydown")g.current.bullets.push({x:g.current.ship.x,y:H-60});e.preventDefault();};
    window.addEventListener("keydown",onKey); window.addEventListener("keyup",onKey);
    let frame=0;
    const loop=()=>{
      const s=g.current; frame++;
      if(s.alive){
        const k=s.keys;
        if(k["ArrowLeft"]||k["KeyA"])s.ship.x=Math.max(20,s.ship.x-4);
        if(k["ArrowRight"]||k["KeyD"])s.ship.x=Math.min(W-20,s.ship.x+4);
        s.frame++;
        if(s.frame%40===0){for(let i=0;i<3;i++)s.enemies.push({x:60+i*120+Math.random()*60,y:-20,hp:2});}
        for(const e of s.enemies)e.y+=1.5;
        for(const b of s.bullets)b.y-=8;
        for(const bm of s.bombs)bm.y+=4;
        if(s.frame%30===0&&s.enemies.length>0){const e=s.enemies[Math.floor(Math.random()*s.enemies.length)];s.bombs.push({x:e.x,y:e.y});}
        const alive2: typeof s.enemies=[];
        for(const e of s.enemies){let hit=false;for(const b of s.bullets){if(Math.abs(b.x-e.x)<18&&Math.abs(b.y-e.y)<18){b.y=-100;e.hp--;if(e.hp<=0){s.score+=10;setScore(s.score);hit=true;}break;}}if(!hit&&e.y<H)alive2.push(e);}
        s.enemies=alive2;
        for(const bm of s.bombs){if(Math.abs(bm.x-s.ship.x)<18&&Math.abs(bm.y-(H-60))<18){s.alive=false;setAlive(false);}}
        s.bullets=s.bullets.filter(b=>b.y>0);
        s.bombs=s.bombs.filter(b=>b.y<H);
      }
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle='#020817'; ctx.fillRect(0,0,W,H);
      stars.current.forEach(st=>drawStar(ctx,st.x,st.y,st.r,st.a+Math.sin(frame*0.02+st.x)*0.15));
      // Nebula bg
      ctx.fillStyle='rgba(124,58,237,0.04)'; ctx.beginPath(); ctx.ellipse(W*0.3,H*0.3,100,80,0.3,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(6,182,212,0.03)'; ctx.beginPath(); ctx.ellipse(W*0.7,H*0.6,80,60,-0.4,0,Math.PI*2); ctx.fill();
      // Enemies (UFOs)
      s.enemies.forEach(e=>{
        setShadow(ctx,'#22d3ee',8);
        ctx.fillStyle=lgrad(ctx,e.x-14,e.y,e.x+14,e.y,[[0,'#164e63'],[0.5,'#22d3ee'],[1,'#164e63']]);
        ctx.beginPath(); ctx.ellipse(e.x,e.y,14,6,0,0,Math.PI*2); ctx.fill(); noShadow(ctx);
        ctx.fillStyle='rgba(150,240,255,0.5)'; ctx.beginPath(); ctx.ellipse(e.x,e.y-5,7,5,0,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle='rgba(34,211,238,0.4)'; ctx.lineWidth=1; ctx.beginPath(); ctx.ellipse(e.x,e.y+2,16,8,0,0,Math.PI*2); ctx.stroke();
      });
      // Player ship
      drawSpaceShip(ctx,s.ship.x,H-60);
      // Bullets
      s.bullets.forEach(b=>{setShadow(ctx,'#fbbf24',10); ctx.fillStyle='#fbbf24'; rr(ctx,b.x-2.5,b.y,5,16,2); ctx.fill(); noShadow(ctx);});
      // Bombs
      s.bombs.forEach(b=>{setShadow(ctx,'#f97316',8); ctx.fillStyle='#f97316'; ctx.beginPath(); ctx.moveTo(b.x,b.y-8); ctx.lineTo(b.x+5,b.y); ctx.lineTo(b.x,b.y+8); ctx.lineTo(b.x-5,b.y); ctx.closePath(); ctx.fill(); noShadow(ctx);});
      // Ground glow
      ctx.fillStyle=lgrad(ctx,0,H-30,0,H,[[0,'rgba(124,58,237,0.3)'],[1,'rgba(124,58,237,0.1)']]); ctx.fillRect(0,H-30,W,30);
      raf.current=requestAnimationFrame(loop);
    };
    raf.current=requestAnimationFrame(loop);
    return()=>{cancelAnimationFrame(raf.current);window.removeEventListener("keydown",onKey);window.removeEventListener("keyup",onKey);};
  },[]);

  return(
    <div className="flex flex-col items-center gap-2">
      <div className="text-white font-bold">Score: {score}</div>
      <div className="relative">
        <canvas ref={cv} width={380} height={450} className="rounded-xl border border-white/10 cursor-pointer"
          onClick={()=>{if(!g.current.alive){g.current={ship:{x:190},bullets:[],enemies:[],bombs:[],score:0,alive:true,frame:0,keys:{}};setScore(0);setAlive(true);}}}/>
        {!alive&&<div className="absolute inset-0 flex items-center justify-center bg-black/65 rounded-xl"><div className="text-white text-center"><div className="font-black">Score: {score}</div><div className="text-sm opacity-70">Click to restart</div></div></div>}
      </div>
      <div className="text-white/40 text-xs">← → move · Space shoot</div>
    </div>
  );
}

function NinjaJump() {
  const cv = useRef<HTMLCanvasElement>(null);
  const g = useRef({x:160,y:250,vy:0,score:0,alive:true,frame:0,walls:[] as {h:number}[]});
  const raf = useRef(0);
  const [score,setScore]=useState(0); const [alive,setAlive]=useState(true);
  const jump=useCallback(()=>{
    if(!g.current.alive){g.current={x:160,y:250,vy:0,score:0,alive:true,frame:0,walls:[]};setScore(0);setAlive(true);return;}
    g.current.vy=-12;
  },[]);

  useEffect(()=>{
    const c=cv.current!; const W=320,H=440;
    const ctx=c.getContext('2d')!;
    const onKey=(e:KeyboardEvent)=>{if(e.code==="Space"||e.key==="ArrowUp"){e.preventDefault();jump();}};
    window.addEventListener("keydown",onKey);
    const loop=()=>{
      const s=g.current;
      if(s.alive){
        s.vy+=0.5; s.y+=s.vy; s.frame++; s.score=Math.floor(s.frame/15); setScore(s.score);
        if(s.x<50){s.x=50;s.vy=Math.min(s.vy,-2);}if(s.x>W-50){s.x=W-50;s.vy=Math.min(s.vy,-2);}
        if(s.frame%90===0)s.walls.push({h:100+Math.random()*80});
        for(const w of s.walls){if(s.x>40&&s.x<W-40&&s.y>w.h&&s.y<w.h+32){s.alive=false;setAlive(false);}}
        s.walls=s.walls.filter(w=>w.h<H+20);
        if(s.y>H){s.alive=false;setAlive(false);}
        if(s.y>100&&s.frame%40===0){s.x=s.x<W/2?W-60:60;}
      }
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle=lgrad(ctx,0,0,0,H,[[0,'#0f172a'],[1,'#1a1a2e']]); ctx.fillRect(0,0,W,H);
      // Side walls
      ctx.fillStyle=lgrad(ctx,0,0,40,0,[[0,'#1e293b'],[1,'#334155']]);
      ctx.fillRect(0,0,40,H);
      ctx.fillStyle=lgrad(ctx,W-40,0,W,0,[[0,'#334155'],[1,'#1e293b']]);
      ctx.fillRect(W-40,0,40,H);
      ctx.strokeStyle='rgba(148,163,184,0.15)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(40,0); ctx.lineTo(40,H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W-40,0); ctx.lineTo(W-40,H); ctx.stroke();
      // Obstacles
      s.walls.forEach(w=>{
        ctx.fillStyle=lgrad(ctx,40,w.h,W-40,w.h+32,[[0,'#7f1d1d'],[0.5,'#dc2626'],[1,'#7f1d1d']]);
        ctx.fillRect(40,w.h,W-80,32);
        ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.fillRect(42,w.h+1,W-84,4);
        // Spikes
        for(let sx=48;sx<W-48;sx+=12){ctx.fillStyle='#fbbf24'; ctx.beginPath(); ctx.moveTo(sx,w.h); ctx.lineTo(sx+6,w.h-8); ctx.lineTo(sx+12,w.h); ctx.fill();}
      });
      // Ninja
      ctx.save();
      const nx=s.x, ny=s.y;
      setShadow(ctx,'rgba(0,0,0,0.4)',6,0,3);
      ctx.fillStyle='#1e1b4b'; ctx.beginPath(); ctx.arc(nx,ny-22,9,0,Math.PI*2); ctx.fill(); noShadow(ctx);
      ctx.fillStyle='#0f172a'; ctx.beginPath(); ctx.arc(nx,ny-22,9,-0.8,Math.PI+0.8); ctx.fill();
      ctx.fillStyle='rgba(200,200,200,0.8)'; ctx.fillRect(nx-7,ny-26,14,3);
      ctx.fillStyle='#334155'; rr(ctx,nx-9,ny-14,18,22,4); ctx.fill();
      ctx.strokeStyle='#475569'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(nx-9,ny-3); ctx.lineTo(nx-20,ny+10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(nx+9,ny-3); ctx.lineTo(nx+20,ny+10); ctx.stroke();
      // Shurikens
      if(s.frame%60===0){
        ctx.fillStyle='#94a3b8'; ctx.save(); ctx.translate(s.x>W/2?s.x-40:s.x+40,s.y-10); ctx.rotate(s.frame*0.3);
        for(let a=0;a<4;a++){ctx.save(); ctx.rotate(a*Math.PI/2); ctx.fillRect(-6,-2,12,4); ctx.restore();}
        ctx.restore();
      }
      ctx.restore();
      raf.current=requestAnimationFrame(loop);
    };
    raf.current=requestAnimationFrame(loop);
    return()=>{cancelAnimationFrame(raf.current);window.removeEventListener("keydown",onKey);};
  },[jump]);

  return(
    <div className="flex flex-col items-center gap-2">
      <div className="text-white font-bold">Score: {score}</div>
      <div className="relative">
        <canvas ref={cv} width={320} height={440} className="rounded-xl border border-white/10 cursor-pointer" onClick={jump}/>
        {!alive&&<div className="absolute inset-0 flex items-center justify-center bg-black/65 rounded-xl"><div className="text-white text-center"><div className="font-black">Score: {score}</div><div className="text-sm opacity-70">Click to restart</div></div></div>}
      </div>
      <div className="text-white/40 text-xs">Tap / Space to wall-jump</div>
    </div>
  );
}

function FallingCubes() {
  const cv = useRef<HTMLCanvasElement>(null);
  const g = useRef({playerX:180,cubes:[] as {x:number,y:number,color:string,size:number,angle:number}[],score:0,alive:true,frame:0});
  const raf = useRef(0);
  const [score,setScore]=useState(0); const [alive,setAlive]=useState(true);
  const CUBECOLORS=['#ef4444','#f97316','#3b82f6','#a855f7','#22d3ee','#22c55e'];

  useEffect(()=>{
    const c=cv.current!; const W=360,H=400;
    const ctx=c.getContext('2d')!;
    const onMouse=(e:MouseEvent)=>{const r=c.getBoundingClientRect();g.current.playerX=e.clientX-r.left;};
    const onTouch=(e:TouchEvent)=>{const r=c.getBoundingClientRect();g.current.playerX=e.touches[0].clientX-r.left;};
    const onKey=(e:KeyboardEvent)=>{if(e.key==="ArrowLeft")g.current.playerX=Math.max(20,g.current.playerX-20);if(e.key==="ArrowRight")g.current.playerX=Math.min(W-20,g.current.playerX+20);};
    c.addEventListener("mousemove",onMouse); c.addEventListener("touchmove",onTouch,{passive:true});
    window.addEventListener("keydown",onKey);
    const loop=()=>{
      const s=g.current; const speed=3+s.score/300;
      if(s.alive){
        s.frame++; s.score=Math.floor(s.frame/20); setScore(s.score);
        if(s.frame%30===0)s.cubes.push({x:Math.random()*W,y:-20,color:CUBECOLORS[Math.floor(Math.random()*CUBECOLORS.length)],size:18+Math.random()*18,angle:Math.random()*Math.PI});
        for(const cube of s.cubes){cube.y+=speed; cube.angle+=0.05; if(cube.y>H-40&&Math.abs(cube.x-s.playerX)<cube.size/2+14){s.alive=false;setAlive(false);}}
        s.cubes=s.cubes.filter(cube=>cube.y<H+10);
      }
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle=lgrad(ctx,0,0,0,H,[[0,'#0f172a'],[1,'#1e293b']]); ctx.fillRect(0,0,W,H);
      // Grid
      ctx.strokeStyle='rgba(255,255,255,0.02)'; ctx.lineWidth=1;
      for(let i=0;i<W;i+=20){ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,H); ctx.stroke();}
      for(let j=0;j<H;j+=20){ctx.beginPath(); ctx.moveTo(0,j); ctx.lineTo(W,j); ctx.stroke();}
      // Cubes
      s.cubes.forEach(cube=>{
        ctx.save(); ctx.translate(cube.x,cube.y); ctx.rotate(cube.angle);
        const hs=cube.size/2;
        setShadow(ctx,cube.color,8);
        ctx.fillStyle=lgrad(ctx,-hs,-hs,hs,hs,[[0,cube.color+'ff'],[1,cube.color+'88']]);
        rr(ctx,-hs,-hs,cube.size,cube.size,4); ctx.fill(); noShadow(ctx);
        ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.fillRect(-hs+3,-hs+3,cube.size-8,4);
        ctx.strokeStyle='rgba(0,0,0,0.3)'; ctx.lineWidth=1;
        rr(ctx,-hs,-hs,cube.size,cube.size,4); ctx.stroke();
        ctx.restore();
      });
      // Player orb
      setShadow(ctx,'#a78bfa',16);
      ctx.fillStyle=rgrad(ctx,s.playerX-5,H-36,2,18,[[0,'#c4b5fd'],[0.4,'#8b5cf6'],[1,'#4c1d95']]);
      ctx.beginPath(); ctx.arc(s.playerX,H-30,18,0,Math.PI*2); ctx.fill(); noShadow(ctx);
      ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.beginPath(); ctx.ellipse(s.playerX-5,H-38,7,4,-0.5,0,Math.PI*2); ctx.fill();
      // Glow ring
      ctx.strokeStyle='rgba(167,139,250,0.3)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(s.playerX,H-30,24,0,Math.PI*2); ctx.stroke();
      raf.current=requestAnimationFrame(loop);
    };
    raf.current=requestAnimationFrame(loop);
    return()=>{cancelAnimationFrame(raf.current);c.removeEventListener("mousemove",onMouse);c.removeEventListener("touchmove",onTouch);window.removeEventListener("keydown",onKey);};
  },[]);

  return(
    <div className="flex flex-col items-center gap-2">
      <div className="text-white font-bold">Score: {score}</div>
      <div className="relative">
        <canvas ref={cv} width={360} height={400} className="rounded-xl border border-white/10 cursor-pointer"
          onClick={()=>{if(!g.current.alive){g.current={playerX:180,cubes:[],score:0,alive:true,frame:0};setScore(0);setAlive(true);}}}/>
        {!alive&&<div className="absolute inset-0 flex items-center justify-center bg-black/65 rounded-xl"><div className="text-white text-center"><div className="font-black">Score: {score}</div><div className="text-sm opacity-70">Click to restart</div></div></div>}
      </div>
      <div className="text-white/40 text-xs">Move mouse / arrows to dodge falling cubes</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// DOM / CSS GAMES (kept with same logic)
// ─────────────────────────────────────────────────────────

function WhackMole() {
  const [holes,setHoles]=useState<boolean[]>(Array(9).fill(false));
  const [score,setScore]=useState(0); const [timeLeft,setTimeLeft]=useState(30); const [playing,setPlaying]=useState(false);
  useEffect(()=>{
    if(!playing)return;
    const timeTick=setInterval(()=>setTimeLeft(t=>{if(t<=1){setPlaying(false);return 0;}return t-1;}),1000);
    const moleInterval=setInterval(()=>{const idx=Math.floor(Math.random()*9);setHoles(h=>{const n=[...h];n[idx]=true;return n;});setTimeout(()=>setHoles(h=>{const n=[...h];n[idx]=false;return n;}),700);},500);
    return()=>{clearInterval(timeTick);clearInterval(moleInterval);};
  },[playing]);
  const whack=(i:number)=>{if(!playing||!holes[i])return;setScore(s=>s+1);setHoles(h=>{const n=[...h];n[i]=false;return n;});};
  const start=()=>{setScore(0);setTimeLeft(30);setPlaying(true);setHoles(Array(9).fill(false));};
  return(
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-6 text-white font-bold"><span>Score: {score}</span><span className={timeLeft<=5?"text-red-400":""}>Time: {timeLeft}s</span></div>
      {!playing?<Btn onClick={start} cls="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-lg">{timeLeft===0?`Final: ${score} — Play Again`:"Start"}</Btn>:(
        <div style={board3D}><div className="grid grid-cols-3 gap-3" style={tilt3D}>
          {holes.map((h,i)=>(
            <button key={i} onClick={()=>whack(i)} style={{...tile3D, transform: h?"translateZ(14px) scale(1.1)":"translateZ(4px)"}}
              className={`w-20 h-20 rounded-full transition-all text-3xl flex items-center justify-center ${h?"bg-amber-500 cursor-crosshair shadow-[0_0_20px_rgba(245,158,11,0.6)]":"bg-amber-900/50 border-2 border-amber-800/60"}`}>
              {h ? <span style={{filter:"drop-shadow(0 4px 8px rgba(0,0,0,0.5))"}}>🐭</span> : ""}
            </button>
          ))}
        </div></div>
      )}
    </div>
  );
}

function TicTacToe() {
  const [board,setBoard]=useState<(string|null)[]>(Array(9).fill(null));
  const [xTurn,setXTurn]=useState(true); const [msg,setMsg]=useState("Your turn (X)");
  const win=(b:(string|null)[])=>{const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];for(const[a,b1,c]of lines)if(b[a]&&b[a]===b[b1]&&b[a]===b[c])return b[a];return b.every(Boolean)?"draw":null;};
  const aiMove=useCallback((b:(string|null)[])=>{const empty=b.map((v,i)=>v===null?i:-1).filter(i=>i>=0);const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];for(const mark of["O","X"])for(const[a,b1,c]of lines){const row=[b[a],b[b1],b[c]];if(row.filter(v=>v===mark).length===2&&row.includes(null)){const idx=[a,b1,c][row.indexOf(null)];if(empty.includes(idx))return idx;}}if(b[4]===null)return 4;return empty[Math.floor(Math.random()*empty.length)];},[]);
  const click=(i:number)=>{if(board[i]||!xTurn)return;const nb=[...board];nb[i]="X";const w=win(nb);if(w){setBoard(nb);setMsg(w==="draw"?"Draw!":"You win! 🎉");return;}setBoard(nb);setXTurn(false);setTimeout(()=>{const ai=aiMove(nb);if(ai===undefined)return;const nb2=[...nb];nb2[ai]="O";const w2=win(nb2);setBoard(nb2);setXTurn(true);setMsg(w2==="draw"?"Draw!":w2?"AI wins!":"Your turn (X)");},300);};
  const reset=()=>{setBoard(Array(9).fill(null));setXTurn(true);setMsg("Your turn (X)");};
  return(
    <div className="flex flex-col items-center gap-4">
      <div className="text-white font-bold text-lg">{msg}</div>
      <div style={board3D}><div className="grid grid-cols-3 gap-2" style={tilt3D}>
        {board.map((v,i)=>(
          <button key={i} onClick={()=>click(i)} style={{...piece3D, transform: v?"translateZ(16px)":"translateZ(6px)"}}
            className={`w-20 h-20 rounded-xl text-3xl font-black flex items-center justify-center transition-all ${v==="X"?"bg-violet-600 text-white":v==="O"?"bg-rose-600 text-white":"bg-white/10 hover:bg-white/20 text-white"}`}>
            {v}
          </button>
        ))}
      </div></div>
      <Btn onClick={reset}>New Game</Btn>
    </div>
  );
}

function Game2048() {
  const newBoard=()=>{const b=Array(4).fill(null).map(()=>Array(4).fill(0));addTile(b);addTile(b);return b;};
  const addTile=(b:number[][])=>{const empty:[number,number][]=[];b.forEach((row,r)=>row.forEach((v,c)=>{if(!v)empty.push([r,c]);}));if(!empty.length)return;const[r,c]=empty[Math.floor(Math.random()*empty.length)];b[r][c]=Math.random()<0.9?2:4;};
  const[board,setBoard]=useState(newBoard);
  const[score,setScore]=useState(0);
  const slide=(row:number[])=>{let r=row.filter(v=>v);let sc=0;for(let i=0;i<r.length-1;i++)if(r[i]===r[i+1]){r[i]*=2;sc+=r[i];r.splice(i+1,1);}while(r.length<4)r.push(0);return{row:r,sc};};
  const move=(dir:string)=>{const b=board.map(r=>[...r]);let sc=0;let changed=false;const doSlide=(arr:number[])=>{const res=slide(arr);sc+=res.sc;const changed2=arr.some((v,i)=>v!==res.row[i]);return{row:res.row,changed:changed2};};if(dir==="left")b.forEach((row,r)=>{const{row:nr,changed:c}=doSlide(row);b[r]=nr;if(c)changed=true;});if(dir==="right")b.forEach((row,r)=>{const rev=[...row].reverse();const{row:nr,changed:c}=doSlide(rev);b[r]=nr.reverse();if(c)changed=true;});if(dir==="up")[0,1,2,3].forEach(c=>{const col=b.map(r=>r[c]);const{row:nr,changed:cc}=doSlide(col);nr.forEach((v,r)=>b[r][c]=v);if(cc)changed=true;});if(dir==="down")[0,1,2,3].forEach(c=>{const col=b.map(r=>r[c]).reverse();const{row:nr,changed:cc}=doSlide(col);[...nr].reverse().forEach((v,r)=>b[r][c]=v);if(cc)changed=true;});if(changed){addTile(b);setScore(s=>s+sc);setBoard(b);}};
  useEffect(()=>{const h=(e:KeyboardEvent)=>{if(e.key==="ArrowLeft")move("left");if(e.key==="ArrowRight")move("right");if(e.key==="ArrowUp")move("up");if(e.key==="ArrowDown")move("down");};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);});
  const colors:Record<number,string>={0:"bg-white/10 text-transparent",2:"bg-amber-100 text-gray-800",4:"bg-amber-200 text-gray-800",8:"bg-orange-400 text-white",16:"bg-orange-500 text-white",32:"bg-red-400 text-white",64:"bg-red-500 text-white",128:"bg-yellow-400 text-white",256:"bg-yellow-500 text-white",512:"bg-yellow-600 text-white",1024:"bg-violet-500 text-white",2048:"bg-violet-700 text-white"};
  return(
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-6"><span className="text-white font-bold">Score: {score}</span></div>
      <div style={board3D}><div className="grid grid-cols-4 gap-2 bg-amber-900/50 p-3 rounded-xl" style={tilt3D}>
        {board.flat().map((v,i)=>(
          <div key={i} style={{...tile3D}} className={`w-16 h-16 rounded-lg font-black text-lg flex items-center justify-center transition-all ${colors[v]||"bg-violet-800 text-white"}`}>
            {v||""}
          </div>
        ))}
      </div></div>
      <div className="flex gap-2">{["←","↑","↓","→"].map((a,i)=>(<button key={i} onClick={()=>move(["left","up","down","right"][i])} className="w-10 h-10 bg-white/10 rounded-lg text-white font-bold hover:bg-white/20">{a}</button>))}</div>
      <Btn onClick={()=>{setBoard(newBoard());setScore(0);}}>New Game</Btn>
    </div>
  );
}

function MemoryMatchGame() {
  const emojis=["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼"];
  const shuffle=()=>[...emojis,...emojis].sort(()=>Math.random()-0.5).map((e,i)=>({id:i,emoji:e,flipped:false,matched:false}));
  const[cards,setCards]=useState(shuffle);
  const[sel,setSel]=useState<number[]>([]);
  const[moves,setMoves]=useState(0);
  const[lock,setLock]=useState(false);
  const flip=(id:number)=>{if(lock||cards[id].flipped||cards[id].matched||sel.length===2)return;const nc=cards.map(c=>c.id===id?{...c,flipped:true}:c);const ns=[...sel,id];setCards(nc);setSel(ns);if(ns.length===2){setMoves(m=>m+1);setLock(true);setTimeout(()=>{const[a,b]=ns;setCards(prev=>prev.map(c=>({...c,matched:c.matched||(c.id===a||c.id===b)&&prev[a].emoji===prev[b].emoji,flipped:c.matched||(c.id===a||c.id===b)&&prev[a].emoji===prev[b].emoji?true:c.id===a||c.id===b?false:c.flipped})));setSel([]);setLock(false);},700);}};
  const won=cards.every(c=>c.matched);
  return(
    <div className="flex flex-col items-center gap-3">
      <div className="text-white font-bold">Moves: {moves} {won&&"— You won! 🎉"}</div>
      <div className="grid grid-cols-4 gap-2">
        {cards.map(c=>(
          <div key={c.id} style={{perspective:"200px",width:64,height:64,cursor:"pointer"}} onClick={()=>flip(c.id)}>
            <div style={{width:"100%",height:"100%",transformStyle:"preserve-3d",transition:"transform 0.4s",transform:c.flipped||c.matched?"rotateY(180deg)":"rotateY(0deg)"}}>
              <div style={{position:"absolute",inset:0,backfaceVisibility:"hidden",background:"rgba(255,255,255,0.1)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,boxShadow:"0 4px 0 rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)"}}>?</div>
              <div style={{position:"absolute",inset:0,backfaceVisibility:"hidden",background:"#7c3aed",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,transform:"rotateY(180deg)",boxShadow:"0 4px 0 rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)"}}>{c.emoji}</div>
            </div>
          </div>
        ))}
      </div>
      <Btn onClick={()=>{setCards(shuffle());setSel([]);setMoves(0);setLock(false);}}>New Game</Btn>
    </div>
  );
}

function RockPaperScissors() {
  const choices=["✊","✋","✌️"];
  const[score,setScore]=useState({p:0,ai:0});
  const[result,setResult]=useState<string|null>(null);
  const[aiPick,setAiPick]=useState<string|null>(null);
  const play=(i:number)=>{const ai=Math.floor(Math.random()*3);setAiPick(choices[ai]);const win=(i-ai+3)%3;const r=win===1?"You win! 🎉":win===2?"AI wins 🤖":"Draw!";setResult(r);if(win===1)setScore(s=>({...s,p:s.p+1}));else if(win===2)setScore(s=>({...s,ai:s.ai+1}));};
  return(
    <div className="flex flex-col items-center gap-4">
      <div className="text-white font-bold text-lg">You {score.p} – {score.ai} AI</div>
      {result&&<div className="text-2xl font-black text-white">{result}</div>}
      {aiPick&&<div className="text-5xl">{aiPick} <span className="text-white/40 text-base">AI chose</span></div>}
      <div className="flex gap-4">
        {choices.map((c,i)=>(
          <button key={i} onClick={()=>play(i)} style={{...btn3D}} className="w-20 h-20 rounded-2xl bg-white/10 hover:bg-white/25 text-4xl flex items-center justify-center transition-all hover:scale-110">{c}</button>
        ))}
      </div>
      <Btn onClick={()=>{setScore({p:0,ai:0});setResult(null);setAiPick(null);}}>Reset</Btn>
    </div>
  );
}

function MathQuiz() {
  const gen=()=>{const ops=["+","-","×"];const op=ops[Math.floor(Math.random()*3)];const a=Math.floor(Math.random()*20)+1,b=Math.floor(Math.random()*20)+1;const ans=op==="+"?a+b:op==="-"?a-b:a*b;return{q:`${a} ${op} ${b} = ?`,ans};};
  const[q,setQ]=useState(gen);
  const[input,setInput]=useState(""); const[score,setScore]=useState(0); const[streak,setStreak]=useState(0); const[fb,setFb]=useState<string|null>(null); const[timeLeft,setTimeLeft]=useState(10);
  useEffect(()=>{const iv=setInterval(()=>{setTimeLeft(t=>{if(t<=1){setFb("⏱️ Time's up!");setStreak(0);setTimeout(()=>{setQ(gen());setInput("");setFb(null);setTimeLeft(10);},1000);return 10;}return t-1;});},1000);return()=>clearInterval(iv);},[q]);
  const submit=()=>{if(parseInt(input)===q.ans){setScore(s=>s+1);setStreak(s=>s+1);setFb("✅ Correct!");}else{setStreak(0);setFb(`❌ Answer: ${q.ans}`);}setTimeout(()=>{setQ(gen());setInput("");setFb(null);setTimeLeft(10);},800);};
  return(
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-6 text-white font-bold"><span>Score: {score}</span><span>🔥{streak}</span><span className={`${timeLeft<=3?"text-red-400":""}`}>{timeLeft}s</span></div>
      <div style={{...piece3D}} className="text-4xl font-black text-white bg-white/10 px-8 py-6 rounded-2xl">{q.q}</div>
      {fb&&<div className="text-xl font-bold text-white">{fb}</div>}
      <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} type="number" style={{...tile3D}} className="w-32 text-center text-2xl font-bold bg-white/10 border border-white/20 rounded-xl py-3 text-white outline-none focus:border-blue-400" placeholder="?" autoFocus/>
      <Btn onClick={submit} cls="px-8 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold">Submit</Btn>
    </div>
  );
}

function HangmanGame() {
  const words=["PYTHON","REACT","GITHUB","ARCADE","NEURAL","PIXEL","QUANTUM","COSMOS","GYAN","MATRIX"];
  const newGame=()=>words[Math.floor(Math.random()*words.length)];
  const[word,setWord]=useState(newGame);
  const[guessed,setGuessed]=useState<Set<string>>(new Set());
  const wrong=[...guessed].filter(l=>!word.includes(l)).length;
  const won=[...word].every(l=>guessed.has(l));
  const lost=wrong>=6;
  const parts=["😐","😟","😰","😨","😱","💀","☠️"];
  const guess=(l:string)=>{if(!guessed.has(l)&&!won&&!lost)setGuessed(g=>new Set([...g,l]));};
  const reset=()=>{setWord(newGame());setGuessed(new Set());};
  return(
    <div className="flex flex-col items-center gap-4">
      <div style={{...piece3D,borderRadius:40,padding:"12px 20px",background:"rgba(255,255,255,0.05)"}} className="text-6xl">{parts[wrong]}</div>
      <div className="text-white/60 text-sm">Wrong: {wrong}/6</div>
      <div className="flex gap-2 text-3xl font-bold text-white my-2">
        {[...word].map((l,i)=>(<span key={i} style={{...tile3D}} className={`border-b-2 border-white/50 w-8 text-center rounded ${guessed.has(l)?"text-white":"text-transparent"}`}>{l}</span>))}
      </div>
      {(won||lost)&&<div className="text-xl font-black text-white">{won?"You won! 🎉":`Lost! Word: ${word}`}</div>}
      <div className="grid grid-cols-9 gap-1">
        {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(l=>(
          <button key={l} onClick={()=>guess(l)} disabled={guessed.has(l)||won||lost}
            style={!guessed.has(l)?btn3D:{}}
            className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${guessed.has(l)?(word.includes(l)?"bg-green-600 text-white":"bg-red-700/50 text-white/30"):"bg-white/10 hover:bg-white/25 text-white"}`}>
            {l}
          </button>
        ))}
      </div>
      <Btn onClick={reset} cls="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-bold">New Word</Btn>
    </div>
  );
}

function ReactionTest() {
  const[state,setState]=useState<"wait"|"ready"|"go"|"result">("wait");
  const[times,setTimes]=useState<number[]>([]);
  const startRef=useRef(0);
  const timerRef=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
  const start=()=>{setState("ready");const delay=1000+Math.random()*3000;timerRef.current=setTimeout(()=>{setState("go");startRef.current=Date.now();},delay);};
  const tap=()=>{if(state==="go"){const t=Date.now()-startRef.current;setTimes(ts=>[...ts,t].slice(-5));setState("result");}else if(state==="ready"){clearTimeout(timerRef.current);setState("wait");}};
  const avg=times.length?Math.round(times.reduce((a,b)=>a+b)/times.length):0;
  return(
    <div className="flex flex-col items-center gap-4">
      <div className="text-white/60 text-sm">Avg: {avg}ms | Last {times.length} attempts</div>
      <button onClick={state==="wait"||state==="result"?start:tap}
        style={{boxShadow:state==="go"?"0 0 40px rgba(34,197,94,0.6), 0 12px 0 rgba(0,0,0,0.4)":"0 12px 0 rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.2)", transform:state==="go"?"translateZ(20px) scale(1.05)":"translateZ(12px)", transition:"all 0.15s"}}
        className={`w-56 h-56 rounded-full text-2xl font-black text-white shadow-2xl active:scale-95 ${state==="go"?"bg-green-500":state==="ready"?"bg-red-600":"bg-violet-700 hover:bg-violet-600"}`}>
        {state==="wait"?"Tap to Start":state==="ready"?"Wait...":state==="go"?"TAP NOW!":`${times[times.length-1]}ms`}
      </button>
      {times.length>0&&<div className="text-white/60 text-xs">Best: {Math.min(...times)}ms</div>}
    </div>
  );
}

function TypingSpeed() {
  const texts=["The quick brown fox jumps over the lazy dog","React is a JavaScript library for building user interfaces","Practice makes perfect when you type fast","GyanTechNet is the future of intelligent AI"];
  const[text]=useState(texts[Math.floor(Math.random()*texts.length)]);
  const[input,setInput]=useState(""); const[start,setStart]=useState<number|null>(null); const[done,setDone]=useState(false);
  const handleChange=(v:string)=>{if(!start)setStart(Date.now());setInput(v);if(v===text)setDone(true);};
  const elapsed=start?(Date.now()-start)/1000:0;
  const wpm=done?Math.round((text.split(" ").length/(elapsed/60))):0;
  const acc=input.length?Math.round([...input].filter((c,i)=>c===text[i]).length/input.length*100):100;
  return(
    <div className="flex flex-col gap-4 max-w-lg">
      <div className="flex gap-6 text-white font-bold"><span>WPM: {done?wpm:"—"}</span><span>Accuracy: {acc}%</span></div>
      <div style={{...tile3D}} className="bg-white/5 rounded-xl p-4 text-lg leading-relaxed font-mono">
        {[...text].map((c,i)=>(<span key={i} className={i<input.length?(input[i]===c?"text-green-400":"text-red-400 bg-red-500/20"):i===input.length?"border-b-2 border-white text-white/60":"text-white/40"}>{c}</span>))}
      </div>
      {done?<div className="text-xl font-black text-green-400 text-center">Done! {wpm} WPM 🎉</div>:<textarea value={input} onChange={e=>handleChange(e.target.value)} style={{...tile3D}} className="bg-white/10 border border-white/20 rounded-xl p-3 text-white outline-none focus:border-teal-400 resize-none" rows={2} placeholder="Start typing..."/>}
    </div>
  );
}

function HiLo() {
  const[current,setCurrent]=useState(()=>Math.floor(Math.random()*100)+1);
  const[score,setScore]=useState(0); const[streak,setStreak]=useState(0); const[fb,setFb]=useState<string|null>(null);
  const nextNum=()=>Math.floor(Math.random()*100)+1;
  const[next,setNext]=useState(nextNum);
  const guess=(higher:boolean)=>{const correct=higher?(next>current):(next<current);if(correct){setScore(s=>s+1);setStreak(s=>s+1);setFb("✅ Correct!");}else{setStreak(0);setFb("❌ Wrong!");}setTimeout(()=>{setCurrent(next);setNext(nextNum());setFb(null);},700);};
  return(
    <div className="flex flex-col items-center gap-5">
      <div className="flex gap-6 text-white font-bold"><span>Score: {score}</span><span>Streak: 🔥{streak}</span></div>
      <div style={{...piece3D,borderRadius:24,padding:"24px 40px"}} className="text-7xl font-black text-white bg-white/10">{current}</div>
      {fb&&<div className="text-xl font-bold text-white">{fb}</div>}
      <div className="text-white/50">Will the next number be...</div>
      <div className="flex gap-4">
        <button onClick={()=>guess(true)} style={btn3D} className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white rounded-2xl text-2xl font-bold">⬆️ Higher</button>
        <button onClick={()=>guess(false)} style={btn3D} className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-2xl font-bold">⬇️ Lower</button>
      </div>
    </div>
  );
}

function WordGuess() {
  const words=["REACT","BRAIN","GAMER","PIXEL","FLAME","CLOUD","SPARK","SWIFT","QUEST","BLEND"];
  const[target]=useState(()=>words[Math.floor(Math.random()*words.length)]);
  const[guesses,setGuesses]=useState<string[]>([]);
  const[current,setCurrent]=useState("");
  const won=guesses[guesses.length-1]===target;
  const lost=guesses.length>=6&&!won;
  const submit=()=>{if(current.length!==5)return;setGuesses(g=>[...g,current.toUpperCase()]);setCurrent("");};
  const getTiles=(g:string)=>[...g].map((l,i)=>({l,cls:l===target[i]?"bg-green-600":target.includes(l)?"bg-yellow-600":"bg-white/20"}));
  return(
    <div className="flex flex-col items-center gap-3">
      <div className="text-white/60 text-sm">Guess the 5-letter word in 6 tries</div>
      <div style={board3D}><div style={{...tilt3D, transformOrigin:"center top"}} className="flex flex-col gap-2">
        {Array(6).fill(null).map((_,r)=>(
          <div key={r} className="flex gap-2">
            {Array(5).fill(null).map((_,c)=>{const g2=guesses[r];const letter=g2?g2[c]:(r===guesses.length&&!won&&!lost?current[c]:"");const cls=g2?getTiles(g2)[c].cls:"bg-white/10 border border-white/20";return(
              <div key={c} style={g2?piece3D:tile3D} className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl font-black text-white ${cls}`}>{letter||""}</div>
            );})}
          </div>
        ))}
      </div></div>
      {won&&<div className="text-green-400 font-black text-xl">You got it! 🎉</div>}
      {lost&&<div className="text-red-400 font-black text-xl">Word: {target}</div>}
      {!won&&!lost&&(<div className="flex gap-2 mt-2"><input value={current} onChange={e=>setCurrent(e.target.value.toUpperCase().slice(0,5))} onKeyDown={e=>e.key==="Enter"&&submit()} style={tile3D} className="w-36 text-center text-xl font-bold bg-white/10 border border-white/20 rounded-xl py-2 text-white outline-none uppercase focus:border-green-400" placeholder="WORD" maxLength={5}/><button onClick={submit} style={btn3D} className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold">Enter</button></div>)}
    </div>
  );
}

function SimonSays() {
  const colors=["bg-red-500","bg-blue-500","bg-green-500","bg-yellow-500"];
  const[seq,setSeq]=useState<number[]>([]);
  const[playerSeq,setPlayerSeq]=useState<number[]>([]);
  const[active,setActive]=useState<number|null>(null);
  const[phase,setPhase]=useState<"idle"|"show"|"input"|"fail">("idle");
  const[score,setScore]=useState(0);
  const playSeq=async(s:number[])=>{setPhase("show");for(const n of s){await new Promise(r=>setTimeout(r,400));setActive(n);await new Promise(r=>setTimeout(r,500));setActive(null);}setPhase("input");};
  const start=()=>{const s=[Math.floor(Math.random()*4)];setSeq(s);setPlayerSeq([]);setScore(0);playSeq(s);};
  const tap=(i:number)=>{if(phase!=="input")return;const ns=[...playerSeq,i];setPlayerSeq(ns);if(ns[ns.length-1]!==seq[ns.length-1]){setPhase("fail");return;}if(ns.length===seq.length){setScore(s=>s+1);const next=[...seq,Math.floor(Math.random()*4)];setSeq(next);setPlayerSeq([]);setTimeout(()=>playSeq(next),600);}};
  return(
    <div className="flex flex-col items-center gap-4">
      <div className="text-white font-bold text-lg">Score: {score}</div>
      {phase==="idle"&&<Btn onClick={start} cls="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-lg">Start</Btn>}
      {phase==="fail"&&<div className="flex flex-col items-center gap-3"><div className="text-red-400 font-black text-xl">Wrong! Score: {score}</div><Btn onClick={start} cls="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold">Play Again</Btn></div>}
      {(phase==="show"||phase==="input")&&(
        <div style={{perspective:"600px"}}>
          <div className="grid grid-cols-2 gap-3" style={{transform:"rotateX(15deg)",transformStyle:"preserve-3d"}}>
            {colors.map((c,i)=>(
              <button key={i} onClick={()=>tap(i)}
                style={{transform:active===i?"translateZ(20px) scale(1.08)":"translateZ(8px)",boxShadow:active===i?"0 0 30px rgba(255,255,255,0.5), 0 8px 0 rgba(0,0,0,0.4)":"0 8px 0 rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.2)",transition:"all 0.15s"}}
                className={`w-28 h-28 rounded-2xl ${c} ${active===i?"brightness-200":"opacity-60 hover:opacity-90"}`}
              />
            ))}
          </div>
        </div>
      )}
      {phase==="show"&&<div className="text-white/60">Watch the pattern...</div>}
      {phase==="input"&&<div className="text-white/60">Repeat it! ({playerSeq.length}/{seq.length})</div>}
    </div>
  );
}

function ConnectFour() {
  const ROWS=6,COLS=7;
  const empty=()=>Array(ROWS).fill(null).map(()=>Array(COLS).fill(0));
  const[board,setBoard]=useState(empty);
  const[turn,setTurn]=useState(1);
  const[winner,setWinner]=useState(0);
  const checkWin=(b:number[][],p:number)=>{for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const dirs=[[0,1],[1,0],[1,1],[1,-1]];for(const[dr,dc]of dirs){let cnt=0;for(let k=0;k<4;k++){const nr=r+dr*k,nc=c+dc*k;if(nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&b[nr][nc]===p)cnt++;else break;}if(cnt===4)return true;}}return false;};
  const drop=(col:number)=>{if(winner||turn!==1)return;const nb=board.map(r=>[...r]);for(let r=ROWS-1;r>=0;r--){if(!nb[r][col]){nb[r][col]=1;break;}}setBoard(nb);if(checkWin(nb,1)){setWinner(1);return;}setTurn(2);setTimeout(()=>{const empty2=[];for(let c2=0;c2<COLS;c2++)if(nb[0][c2]===0)empty2.push(c2);if(!empty2.length)return;const ac=empty2[Math.floor(Math.random()*empty2.length)];const nb2=nb.map(r=>[...r]);for(let r2=ROWS-1;r2>=0;r2--){if(!nb2[r2][ac]){nb2[r2][ac]=2;break;}}setBoard(nb2);if(checkWin(nb2,2))setWinner(2);setTurn(1);},400);};
  return(
    <div className="flex flex-col items-center gap-3">
      <div className="text-white font-bold">{winner?`Player ${winner===1?"1 (You)":"2 (AI)"} wins! 🎉`:`Turn: ${turn===1?"You (🔴)":"AI (🟡)"}`}</div>
      <div style={board3D}><div className="bg-blue-900 p-2 rounded-xl" style={{...tilt3D,borderRadius:16}}>
        {board.map((row,r)=>(
          <div key={r} className="flex gap-1 mb-1">
            {row.map((v,c)=>(
              <button key={c} onClick={()=>drop(c)} style={v?{...piece3D}:{...tile3D}} className={`w-9 h-9 rounded-full transition-all ${v===1?"bg-red-500":v===2?"bg-yellow-400":"bg-blue-700/80 hover:bg-blue-600"}`}/>
            ))}
          </div>
        ))}
      </div></div>
      <Btn onClick={()=>{setBoard(empty());setTurn(1);setWinner(0);}}>New Game</Btn>
    </div>
  );
}

function NumberMemory() {
  const[phase,setPhase]=useState<"show"|"input"|"result">("show");
  const[level,setLevel]=useState(1);
  const[number,setNumber]=useState(()=>String(Math.floor(Math.random()*9)+1));
  const[input,setInput]=useState(""); const[score,setScore]=useState(0);
  useEffect(()=>{if(phase==="show"){const t=setTimeout(()=>setPhase("input"),1000+level*300);return()=>clearTimeout(t);}return undefined;},[phase,level]);
  const submit=()=>{if(input===number){setScore(l=>l+1);setLevel(l=>l+1);const n=String(Math.floor(Math.random()*Math.pow(10,level+1))).padStart(level+1,"0").slice(0,level+1);setNumber(n);setInput("");setPhase("show");}else{setPhase("result");}};
  return(
    <div className="flex flex-col items-center gap-4">
      <div className="text-white font-bold">Level: {level} | Score: {score}</div>
      {phase==="show"&&<div style={piece3D} className="text-6xl font-black text-white tracking-widest bg-white/10 px-8 py-6 rounded-2xl">{number}</div>}
      {phase==="input"&&<><div className="text-white/60">Type the number you saw</div><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} style={tile3D} className="text-center text-3xl font-bold bg-white/10 border border-white/20 rounded-xl py-3 px-6 text-white outline-none focus:border-violet-400 w-48" autoFocus/><Btn onClick={submit}>Submit</Btn></>}
      {phase==="result"&&<><div className="text-red-400 font-black text-xl">Wrong! Number was: {number}</div><Btn onClick={()=>{setLevel(1);setScore(0);const n=String(Math.floor(Math.random()*9)+1);setNumber(n);setInput("");setPhase("show");}}>Try Again</Btn></>}
    </div>
  );
}

function QuickTap() {
  const clrs=["bg-red-500","bg-blue-500","bg-green-500","bg-yellow-500","bg-purple-500","bg-pink-500"];
  const names=["red","blue","green","yellow","purple","pink"];
  const[target,setTarget]=useState(0); const[score,setScore]=useState(0); const[timeLeft,setTimeLeft]=useState(30); const[playing,setPlaying]=useState(false);
  useEffect(()=>{if(!playing)return;const iv=setInterval(()=>setTimeLeft(t=>{if(t<=1){setPlaying(false);return 0;}return t-1;}),1000);return()=>clearInterval(iv);},[playing]);
  const tap=(i:number)=>{if(!playing||timeLeft<=0)return;if(i===target){setScore(s=>s+1);setTarget(Math.floor(Math.random()*6));}else setScore(s=>Math.max(0,s-1));};
  const start=()=>{setScore(0);setTimeLeft(30);setPlaying(true);setTarget(Math.floor(Math.random()*6));};
  return(
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-6 text-white font-bold"><span>Score: {score}</span><span>Time: {timeLeft}s</span></div>
      {!playing?<Btn onClick={start} cls="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-bold text-lg">Start</Btn>:(
        <><div className="text-white text-lg">Tap: <span className={`font-black ${clrs[target].replace("bg-","text-")}`}>{names[target].toUpperCase()}</span></div>
        <div style={board3D}><div className="grid grid-cols-3 gap-3" style={tilt3D}>
          {clrs.map((c,i)=>(
            <button key={i} onClick={()=>tap(i)} style={{...btn3D,transform:i===target?"translateZ(16px) scale(1.05)":"translateZ(6px)"}}
              className={`w-24 h-24 rounded-2xl ${c} transition-all ${i===target?"ring-4 ring-white/60":""}`}/>
          ))}
        </div></div></>
      )}
      {timeLeft===0&&<div className="text-xl font-black text-white">Final Score: {score} 🏆</div>}
    </div>
  );
}

function MinesweeperGame() {
  const ROWS=8,COLS=8,MINES=10;
  const init=()=>{const cells=Array(ROWS*COLS).fill(null).map((_,i)=>({id:i,mine:false,revealed:false,flagged:false,count:0}));let placed=0;while(placed<MINES){const i=Math.floor(Math.random()*ROWS*COLS);if(!cells[i].mine){cells[i].mine=true;placed++;}}cells.forEach((c,i)=>{if(c.mine)return;const r=Math.floor(i/COLS),col=i%COLS;let cnt=0;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const nr=r+dr,nc=col+dc;if(nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&cells[nr*COLS+nc].mine)cnt++;}c.count=cnt;});return cells;};
  type Cell={id:number;mine:boolean;revealed:boolean;flagged:boolean;count:number};
  const[cells,setCells]=useState<Cell[]>(init);
  const[dead,setDead]=useState(false); const[won,setWon]=useState(false);
  const reveal=(id:number,cs=cells):Cell[]=>{if(cs[id].revealed||cs[id].flagged)return cs;const nc=[...cs];nc[id]={...nc[id],revealed:true};if(nc[id].count===0&&!nc[id].mine){const r=Math.floor(id/COLS),c=id%COLS;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const nr=r+dr,nc2=c+dc;if(nr>=0&&nr<ROWS&&nc2>=0&&nc2<COLS)return reveal(nr*COLS+nc2,nc);}}return nc;};
  const click=(id:number)=>{if(dead||won||cells[id].revealed||cells[id].flagged)return;if(cells[id].mine){const nc=cells.map(c=>({...c,revealed:c.mine?true:c.revealed}));setCells(nc);setDead(true);return;}const nc=reveal(id);setCells(nc);if(nc.filter(c=>!c.mine).every(c=>c.revealed))setWon(true);};
  const flag=(e:React.MouseEvent,id:number)=>{e.preventDefault();if(cells[id].revealed)return;setCells(cs=>cs.map(c=>c.id===id?{...c,flagged:!c.flagged}:c));};
  const cntColors=["","text-blue-400","text-green-400","text-red-400","text-violet-400","text-orange-400","text-teal-400","text-pink-400","text-white"];
  return(
    <div className="flex flex-col items-center gap-3">
      <div className="text-white font-bold">{dead?"💥 Boom!":won?"🎉 Cleared!":"Find the mines!"}</div>
      <div style={board3D}><div className={`grid gap-1 p-2 rounded-xl bg-slate-800/50`} style={{gridTemplateColumns:`repeat(${COLS},32px)`,...tilt3D}}>
        {cells.map(c=>(
          <button key={c.id} onClick={()=>click(c.id)} onContextMenu={e=>flag(e,c.id)}
            style={c.revealed?tile3D:btn3D}
            className={`w-8 h-8 rounded text-xs font-bold transition-all ${c.revealed?(c.mine?"bg-red-600":"bg-slate-600/50"):"bg-slate-500 hover:bg-slate-400"} ${c.flagged?"bg-amber-500":""}`}>
            {c.revealed?(c.mine?"💥":(c.count>0?<span className={cntColors[c.count]}>{c.count}</span>:"")):c.flagged?"🚩":""}
          </button>
        ))}
      </div></div>
      <Btn onClick={()=>{setCells(init());setDead(false);setWon(false);}}>New Game</Btn>
      <div className="text-white/40 text-xs">Left click reveal · Right click flag</div>
    </div>
  );
}

function Puzzle15() {
  const shuffle2=()=>{const t=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0].sort(()=>Math.random()-0.5);return t;};
  const[tiles,setTiles]=useState(shuffle2);
  const move=(i:number)=>{const blank=tiles.indexOf(0);const r=Math.floor(i/4),c=i%4,rb=Math.floor(blank/4),cb=blank%4;if(Math.abs(r-rb)+Math.abs(c-cb)!==1)return;const nt=[...tiles];[nt[i],nt[blank]]=[nt[blank],nt[i]];setTiles(nt);};
  const won=tiles.every((v,i)=>i===15?v===0:v===i+1);
  return(
    <div className="flex flex-col items-center gap-3">
      {won&&<div className="text-yellow-400 font-black text-xl">Solved! 🎉</div>}
      <div style={board3D}><div className="grid grid-cols-4 gap-1.5" style={tilt3D}>
        {tiles.map((v,i)=>(
          <button key={i} onClick={()=>move(i)} style={v?piece3D:{}}
            className={`w-14 h-14 rounded-lg text-lg font-black transition-all ${v===0?"bg-transparent":won?"bg-green-600 text-white":"bg-indigo-600 hover:bg-indigo-500 text-white"}`}>
            {v||""}
          </button>
        ))}
      </div></div>
      <Btn onClick={()=>setTiles(shuffle2())} cls="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold">Shuffle</Btn>
    </div>
  );
}

function LightsOut() {
  const init2=()=>Array(25).fill(null).map(()=>Math.random()>0.5);
  const[grid,setGrid]=useState(init2);
  const toggle=(i:number,g=grid)=>g.map((v,j)=>{const r=Math.floor(j/5),c=j%5,ri=Math.floor(i/5),ci=i%5;return(j===i||j===i-5||j===i+5||(r===ri&&Math.abs(c-ci)===1))?!v:v;});
  const click=(i:number)=>setGrid(g=>toggle(i,g));
  const won=grid.every(v=>!v);
  return(
    <div className="flex flex-col items-center gap-3">
      {won&&<div className="text-yellow-400 font-black text-xl">All lights out! 🎉</div>}
      <div style={board3D}><div className="grid grid-cols-5 gap-2" style={tilt3D}>
        {grid.map((v,i)=>(
          <button key={i} onClick={()=>click(i)}
            style={{transform:v?"translateZ(12px)":"translateZ(2px)",boxShadow:v?"0 0 16px rgba(250,204,21,0.8), 0 6px 0 rgba(0,0,0,0.3)":"0 4px 0 rgba(0,0,0,0.4)",transition:"all 0.2s"}}
            className={`w-12 h-12 rounded-lg transition-all ${v?"bg-yellow-400":"bg-slate-800 border border-slate-600"}`}/>
        ))}
      </div></div>
      <Btn onClick={()=>setGrid(init2())} cls="px-6 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-bold">New Puzzle</Btn>
    </div>
  );
}

function AnagramGame() {
  const pairs=[["LISTEN","SILENT"],["HEART","EARTH"],["RACE","CARE"],["CATS","ACTS"],["GAMER","MARGE"],["NIGHT","THING"],["ANGEL","GLEAN"]];
  const[idx,setIdx]=useState(0); const[input,setInput]=useState(""); const[score,setScore]=useState(0); const[fb,setFb]=useState<string|null>(null);
  const[word,anagram]=pairs[idx%pairs.length];
  const scramble=anagram.split("").sort(()=>Math.random()-0.5).join("");
  const submit=()=>{if(input.toUpperCase()===word){setScore(s=>s+1);setFb("✅ Correct!");}else{setFb(`❌ Answer: ${word}`);}setTimeout(()=>{setIdx(i=>i+1);setInput("");setFb(null);},900);};
  return(
    <div className="flex flex-col items-center gap-4">
      <div className="text-white font-bold text-lg">Score: {score}</div>
      <div className="text-white/60 text-sm">Unscramble this word:</div>
      <div className="flex gap-2">
        {scramble.split("").map((l,i)=>(<div key={i} style={piece3D} className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center text-white font-black text-lg">{l}</div>))}
      </div>
      {fb&&<div className="text-xl font-bold text-white">{fb}</div>}
      <input value={input} onChange={e=>setInput(e.target.value.toUpperCase())} onKeyDown={e=>e.key==="Enter"&&submit()} style={tile3D} className="text-center text-xl font-bold bg-white/10 border border-white/20 rounded-xl py-2 px-4 text-white outline-none uppercase focus:border-fuchsia-400 w-40"/>
      <Btn onClick={submit} cls="px-8 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-lg font-bold">Submit</Btn>
    </div>
  );
}

function TetrisGame() {
  const PIECES=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,1,0],[0,1,1]],[[0,1,1],[1,1,0]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]]];
  const COLORS=["#22d3ee","#fbbf24","#a855f7","#22c55e","#ef4444","#f97316","#3b82f6"];
  const W=10,H=20;
  type Board=(number|null)[][];
  const empty=():Board=>Array(H).fill(null).map(()=>Array(W).fill(null));
  const[board,setBoard]=useState<Board>(empty);
  const[piece,setPiece]=useState(()=>{const i=Math.floor(Math.random()*7);return{shape:PIECES[i],color:COLORS[i],x:3,y:0};});
  const[score,setScore]=useState(0); const[gameOver,setGameOver]=useState(false);
  const collide=(b:Board,p:typeof piece,ox=0,oy=0)=>p.shape.some((row,r)=>row.some((v,c)=>v&&(p.y+r+oy>=H||p.x+c+ox<0||p.x+c+ox>=W||(b[p.y+r+oy]?.[p.x+c+ox]!=null))));
  const lock=useCallback((b:Board,p:typeof piece)=>{const nb=b.map(r=>[...r]);p.shape.forEach((row,r)=>row.forEach((v,c)=>{if(v)nb[p.y+r][p.x+c]=COLORS.indexOf(p.color);}));let cleared=0;const filtered=nb.filter(row=>row.some(v=>v===null));cleared=H-filtered.length;while(filtered.length<H)filtered.unshift(Array(W).fill(null));setBoard(filtered);setScore(s=>s+[0,40,100,300,1200][cleared]);const ni=Math.floor(Math.random()*7);const np={shape:PIECES[ni],color:COLORS[ni],x:3,y:0};if(collide(filtered,np))setGameOver(true);else setPiece(np);},[collide]);
  useEffect(()=>{if(gameOver)return;const iv=setInterval(()=>{setPiece(p=>{if(collide(board,p,0,1)){lock(board,p);return p;}return{...p,y:p.y+1};});},500);return()=>clearInterval(iv);},[board,gameOver,collide,lock]);
  useEffect(()=>{const h=(e:KeyboardEvent)=>{if(gameOver)return;if(e.key==="ArrowLeft")setPiece(p=>collide(board,p,-1,0)?p:{...p,x:p.x-1});if(e.key==="ArrowRight")setPiece(p=>collide(board,p,1,0)?p:{...p,x:p.x+1});if(e.key==="ArrowDown")setPiece(p=>{if(collide(board,p,0,1)){lock(board,p);return p;}return{...p,y:p.y+1};});if(e.key==="ArrowUp"){const r=piece.shape[0].map((_,i)=>piece.shape.map(row=>row[i]).reverse());setPiece(p=>{const rot={...p,shape:r};return collide(board,rot)?p:rot;});}e.preventDefault();};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[board,gameOver,collide,lock,piece.shape]);
  const CELL=26;
  return(
    <div className="flex flex-col items-center gap-3">
      <div className="text-white font-bold">Score: {score} {gameOver&&"— Game Over!"}</div>
      <div style={{perspective:"800px"}}>
        <div className="border border-white/10 rounded-lg overflow-hidden" style={{display:"grid",gridTemplateColumns:`repeat(${W},${CELL}px)`,transform:"rotateX(6deg)",transformStyle:"preserve-3d"}}>
          {board.map((row,r)=>row.map((v,c)=>{
            const inPiece=piece.shape.some((pr,pi)=>pr.some((pv,pc)=>pv&&piece.y+pi===r&&piece.x+pc===c));
            const color=inPiece?piece.color:(v!==null?COLORS[v]:null);
            return(<div key={`${r}-${c}`} style={{width:CELL,height:CELL,background:color||"rgba(255,255,255,0.03)",border:color?"1px solid rgba(0,0,0,0.3)":"1px solid rgba(255,255,255,0.04)",transform:color?"translateZ(4px)":"none",boxShadow:color?"0 4px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)":"none",transition:"all 0.1s"}}/>);
          }))}
        </div>
      </div>
      {gameOver&&<Btn onClick={()=>{setBoard(empty());setScore(0);setGameOver(false);const i=Math.floor(Math.random()*7);setPiece({shape:PIECES[i],color:COLORS[i],x:3,y:0});}}>New Game</Btn>}
      <div className="text-white/40 text-xs">← → move · ↑ rotate · ↓ drop</div>
    </div>
  );
}

function MazeRunner() {
  const W2=19,H2=19;
  const generate=()=>{const grid:boolean[][]=Array(H2).fill(null).map(()=>Array(W2).fill(true));const carve=(x:number,y:number)=>{grid[y][x]=false;const dirs=[[0,-2],[0,2],[-2,0],[2,0]].sort(()=>Math.random()-0.5);for(const[dx,dy]of dirs){const nx=x+dx,ny=y+dy;if(nx>0&&nx<W2-1&&ny>0&&ny<H2-1&&grid[ny][nx]){grid[y+dy/2][x+dx/2]=false;carve(nx,ny);}}};carve(1,1);grid[H2-2][W2-2]=false;return grid;};
  const[maze]=useState(generate);
  const[pos,setPos]=useState({x:1,y:1}); const[steps,setSteps]=useState(0);
  const won=pos.x===W2-2&&pos.y===H2-2;
  const move=(dx:number,dy:number)=>{const nx=pos.x+dx,ny=pos.y+dy;if(nx<0||nx>=W2||ny<0||ny>=H2||maze[ny][nx])return;setPos({x:nx,y:ny});setSteps(s=>s+1);};
  useEffect(()=>{const h=(e:KeyboardEvent)=>{if(e.key==="ArrowLeft")move(-1,0);if(e.key==="ArrowRight")move(1,0);if(e.key==="ArrowUp")move(0,-1);if(e.key==="ArrowDown")move(0,1);}; window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[pos,maze]);
  const CELL=18;
  return(
    <div className="flex flex-col items-center gap-3">
      <div className="text-white font-bold">Steps: {steps} {won&&"🎉 Solved!"}</div>
      <div style={{perspective:"800px"}}>
        <div className="rounded-lg overflow-hidden border border-white/10" style={{display:"grid",gridTemplateColumns:`repeat(${W2},${CELL}px)`,transform:"rotateX(8deg)",transformStyle:"preserve-3d"}}>
          {maze.map((row,y)=>row.map((wall,x)=>{const isPlayer=pos.x===x&&pos.y===y;const isExit=x===W2-2&&y===H2-2;return(<div key={`${x}-${y}`} style={{width:CELL,height:CELL,background:wall?"#1e3a8a":isPlayer?"#7c3aed":isExit?"#22c55e":"#0f172a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,transform:(!wall&&!isPlayer)?isExit?"translateZ(3px)":"translateZ(1px)":wall?"translateZ(0px)":"translateZ(6px)"}}>{isPlayer?"😮":isExit&&!isPlayer?"🏁":""}</div>);}))}
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <button onClick={()=>move(0,-1)} className="w-10 h-10 bg-white/10 rounded-lg text-white font-bold hover:bg-white/20">↑</button>
        <div className="flex gap-1"><button onClick={()=>move(-1,0)} className="w-10 h-10 bg-white/10 rounded-lg text-white font-bold hover:bg-white/20">←</button><button onClick={()=>move(0,1)} className="w-10 h-10 bg-white/10 rounded-lg text-white font-bold hover:bg-white/20">↓</button><button onClick={()=>move(1,0)} className="w-10 h-10 bg-white/10 rounded-lg text-white font-bold hover:bg-white/20">→</button></div>
      </div>
    </div>
  );
}

function Match3Game() {
  const GEMCOLORS=["#ef4444","#3b82f6","#22c55e","#fbbf24","#a855f7","#ec4899"];
  const SIZE=7;
  const newGrid=()=>Array(SIZE).fill(null).map(()=>Array(SIZE).fill(null).map(()=>Math.floor(Math.random()*GEMCOLORS.length)));
  const[grid,setGrid]=useState(newGrid);
  const[sel,setSel]=useState<{r:number,c:number}|null>(null);
  const[score,setScore]=useState(0);
  const findMatches=(g:number[][])=>{const matched=new Set<string>();for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE-2;c++)if(g[r][c]===g[r][c+1]&&g[r][c]===g[r][c+2])for(let k=0;k<3;k++)matched.add(`${r},${c+k}`);for(let c=0;c<SIZE;c++)for(let r=0;r<SIZE-2;r++)if(g[r][c]===g[r+1][c]&&g[r][c]===g[r+2][c])for(let k=0;k<3;k++)matched.add(`${r+k},${c}`);return matched;};
  const collapse=(g:number[][])=>{const ng=g.map(r=>[...r]);for(let c=0;c<SIZE;c++){const col=ng.map(r=>r[c]).filter(v=>v!==-1);while(col.length<SIZE)col.unshift(Math.floor(Math.random()*GEMCOLORS.length));ng.forEach((r,i)=>r[c]=col[i]);}return ng;};
  const click=(r:number,c:number)=>{if(!sel){setSel({r,c});return;}const{r:sr,c:sc}=sel;setSel(null);if(Math.abs(r-sr)+Math.abs(c-sc)!==1)return;const ng=grid.map(row=>[...row]);[ng[r][c],ng[sr][sc]]=[ng[sr][sc],ng[r][c]];const matches=findMatches(ng);if(!matches.size){[ng[r][c],ng[sr][sc]]=[ng[sr][sc],ng[r][c]];return;}const ng2=ng.map(row=>[...row]);for(const m of matches){const[mr,mc]=m.split(",").map(Number);ng2[mr][mc]=-1;}setScore(s=>s+matches.size*10);setGrid(collapse(ng2));};
  return(
    <div className="flex flex-col items-center gap-3">
      <div className="text-white font-bold">Score: {score}</div>
      <div style={board3D}><div className="flex flex-col gap-1" style={tilt3D}>
        {grid.map((row,r)=>(
          <div key={r} className="flex gap-1">
            {row.map((v,c)=>(
              <button key={c} onClick={()=>click(r,c)}
                style={v!==-1?{...piece3D,background:GEMCOLORS[v],borderRadius:8,boxShadow:`0 6px 0 ${GEMCOLORS[v]}88, inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.2)`,transform:sel?.r===r&&sel?.c===c?"translateZ(18px) scale(1.1)":"translateZ(8px)"}:{}}
                className={`w-10 h-10 rounded-lg transition-all ${v===-1?"bg-transparent":""} ${sel?.r===r&&sel?.c===c?"ring-2 ring-white":""} hover:brightness-110`}/>
            ))}
          </div>
        ))}
      </div></div>
      <Btn onClick={()=>{setGrid(newGrid());setScore(0);setSel(null);}}>New Game</Btn>
      <div className="text-white/40 text-xs">Click two adjacent gems to swap</div>
    </div>
  );
}

function SokobanGame() {
  const LEVEL=["########","#@  .  #","# $ #  #","#   $. #","#  .   #","########"];
  type Cell=" "|"#"|"@"|"$"|"."|"*"|"+";
  const parse=(l:string[]):Cell[][]=>l.map(row=>[...row].map(c=>c as Cell));
  const[board,setBoard]=useState(()=>parse(LEVEL));
  const[moves,setMoves]=useState(0); const[won,setWon]=useState(false);
  const move=(dx:number,dy:number)=>{if(won)return;const nb=board.map(r=>[...r]);const py=board.findIndex(r=>r.includes("@")||r.includes("+"));const px=board[py].findIndex(c=>c==="@"||c==="+");const ny=py+dy,nx=px+dx;if(nb[ny]?.[nx]==="#")return;if(nb[ny][nx]==="$"||nb[ny][nx]==="*"){const by=ny+dy,bx=nx+dx;if(nb[by]?.[bx]==="#"||nb[by]?.[bx]==="$"||nb[by]?.[bx]==="*")return;nb[by][bx]=nb[by][bx]==="."?"*":"$";nb[ny][nx]=nb[ny][nx]==="*"?"+":"@";}else{const fromCell=nb[py][px]==="+"?".":"  "[0] as Cell;nb[ny][nx]=nb[ny][nx]==="."?"+":"@";nb[py][px]=fromCell;}setBoard(nb);setMoves(m=>m+1);if(nb.flat().every(c=>c!=="$"))setWon(true);};
  useEffect(()=>{const h=(e:KeyboardEvent)=>{if(e.key==="ArrowLeft")move(-1,0);if(e.key==="ArrowRight")move(1,0);if(e.key==="ArrowUp")move(0,-1);if(e.key==="ArrowDown")move(0,1);}; window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[board]);
  const GLYPHS:Record<string,string>={"#":"🟦","@":"🤸","$":"📦",".":"🎯","*":"✅","+":"🏃"," ":"⬛"};
  return(
    <div className="flex flex-col items-center gap-3">
      <div className="text-white font-bold">Moves: {moves} {won&&"🎉 Solved!"}</div>
      <div style={board3D}><div style={{transform:"rotateX(10deg)",transformStyle:"preserve-3d"}}>
        {board.map((row,r)=>(<div key={r} className="flex">{row.map((c,i)=>(<span key={i} style={{fontSize:24,lineHeight:1,transform:c==="@"||c==="+"?"translateZ(8px)":"translateZ(2px)",display:"inline-block"}}>{GLYPHS[c]||"⬛"}</span>))}</div>))}
      </div></div>
      <div className="flex flex-col items-center gap-1"><button onClick={()=>move(0,-1)} className="w-10 h-10 bg-white/10 rounded-lg text-white font-bold">↑</button><div className="flex gap-1"><button onClick={()=>move(-1,0)} className="w-10 h-10 bg-white/10 rounded-lg text-white font-bold">←</button><button onClick={()=>move(0,1)} className="w-10 h-10 bg-white/10 rounded-lg text-white font-bold">↓</button><button onClick={()=>move(1,0)} className="w-10 h-10 bg-white/10 rounded-lg text-white font-bold">→</button></div></div>
      <Btn onClick={()=>{setBoard(parse(LEVEL));setMoves(0);setWon(false);}}>Reset</Btn>
    </div>
  );
}

function SudokuGame() {
  const PUZZLE=[[1,0,0,4],[0,0,1,0],[0,1,0,0],[4,0,0,1]];
  const SOLUTION=[[1,2,3,4],[3,4,1,2],[2,1,4,3],[4,3,2,1]];
  const[grid,setGrid]=useState(PUZZLE.map(r=>[...r]));
  const[selected,setSelected]=useState<{r:number,c:number}|null>(null);
  const[errors,setErrors]=useState<Set<string>>(new Set());
  const isFixed=(r:number,c:number)=>PUZZLE[r][c]!==0;
  const input=(v:number)=>{if(!selected||isFixed(selected.r,selected.c))return;const ng=grid.map(r=>[...r]);ng[selected.r][selected.c]=v;setGrid(ng);const errs=new Set<string>();ng.forEach((row,r)=>row.forEach((cell,c)=>{if(cell!==0&&cell!==SOLUTION[r][c])errs.add(`${r},${c}`);}));setErrors(errs);};
  const won=grid.every((row,r)=>row.every((v,c)=>v===SOLUTION[r][c]));
  return(
    <div className="flex flex-col items-center gap-4">
      {won&&<div className="text-yellow-400 font-black text-xl">Solved! 🎉</div>}
      <div style={board3D}><div className="grid grid-cols-4 gap-1 p-2 bg-white/5 rounded-xl border border-white/10" style={tilt3D}>
        {grid.map((row,r)=>row.map((v,c)=>(
          <button key={`${r}-${c}`} onClick={()=>setSelected({r,c})} style={v?piece3D:tile3D}
            className={`w-14 h-14 rounded-lg text-xl font-black transition-all border-2 ${isFixed(r,c)?"bg-white/10 text-white/50 border-transparent":errors.has(`${r},${c}`)?"bg-red-500/20 text-red-400 border-red-500/50":selected?.r===r&&selected?.c===c?"bg-primary/20 text-primary border-primary/50":"bg-white/5 text-white border-white/10 hover:border-primary/30"}`}>
            {v||""}
          </button>
        )))}
      </div></div>
      <div className="flex gap-2">{[1,2,3,4].map(n=>(<button key={n} onClick={()=>input(n)} style={btn3D} className="w-12 h-12 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-lg">{n}</button>))}</div>
      <Btn onClick={()=>{setGrid(PUZZLE.map(r=>[...r]));setSelected(null);setErrors(new Set());}}>Reset</Btn>
    </div>
  );
}

function ColorSortGame() {
  const COLS2=["#ef4444","#3b82f6","#22c55e","#fbbf24"];
  const initTubes=()=>[[0,1,2,3],[1,0,3,2],[2,3,0,1],[3,2,1,0],[],[]];
  const[tubes,setTubes]=useState(initTubes);
  const[sel,setSel]=useState<number|null>(null); const[moves,setMoves]=useState(0);
  const canPour=(from:number,to:number)=>{if(from===to||!tubes[from].length)return false;if(tubes[to].length===4)return false;if(!tubes[to].length)return true;return tubes[from][tubes[from].length-1]===tubes[to][tubes[to].length-1];};
  const pour=(from:number,to:number)=>{if(!canPour(from,to))return;const nt=tubes.map(t=>[...t]);const ball=nt[from].pop()!;nt[to].push(ball);setTubes(nt);setMoves(m=>m+1);setSel(null);};
  const click=(i:number)=>{if(sel===null){if(tubes[i].length)setSel(i);}else{if(canPour(sel,i))pour(sel,i);else setSel(i===sel?null:tubes[i].length?i:null);}};
  const won=tubes.slice(0,4).every(t=>t.length===4&&t.every(b=>b===t[0]));
  return(
    <div className="flex flex-col items-center gap-4">
      <div className="text-white font-bold">Moves: {moves} {won&&"🎉 Sorted!"}</div>
      <div style={board3D}><div className="flex gap-3" style={{transform:"rotateX(8deg)",transformStyle:"preserve-3d"}}>
        {tubes.map((tube,i)=>(
          <button key={i} onClick={()=>click(i)}
            className={`flex flex-col-reverse items-center gap-1 p-2 rounded-xl border-2 transition-all ${sel===i?"border-white":"border-white/20 hover:border-white/50"}`}
            style={{minWidth:44,minHeight:120,transform:sel===i?"translateZ(12px)":"translateZ(4px)",boxShadow:sel===i?"0 8px 0 rgba(0,0,0,0.4)":"0 4px 0 rgba(0,0,0,0.3)"}}>
            {tube.map((b,j)=>(<div key={j} className="w-8 h-8 rounded-full" style={{...sphereCSS(COLS2[b]),width:32,height:32}}/>))}
            {tube.length===0&&<div className="w-8 h-8 rounded-full border border-dashed border-white/20"/>}
          </button>
        ))}
      </div></div>
      <Btn onClick={()=>{setTubes(initTubes());setMoves(0);setSel(null);}}>Reset</Btn>
    </div>
  );
}

function BlockPuzzleGame() {
  const BOARD_SIZE=8;
  const PIECES_SET=[[[1,1,1]],[[1],[1],[1]],[[1,1],[1,1]],[[1,1,1],[1,0,0]],[[1,1,1],[0,0,1]],[[1,0],[1,1]],[[0,1],[1,1]]];
  const newPiece=()=>PIECES_SET[Math.floor(Math.random()*PIECES_SET.length)];
  const[board,setBoard]=useState<number[][]>(()=>Array(BOARD_SIZE).fill(null).map(()=>Array(BOARD_SIZE).fill(0)));
  const[pieces,setPieces]=useState([newPiece(),newPiece(),newPiece()]);
  const[score,setScore]=useState(0); const[selIdx,setSelIdx]=useState<number|null>(null); const[gameOver,setGameOver]=useState(false);
  const canPlace=(b:number[][],piece:number[][],r:number,c:number)=>piece.every((row,dr)=>row.every((v,dc)=>!v||((r+dr)<BOARD_SIZE&&(c+dc)<BOARD_SIZE&&b[r+dr][c+dc]===0)));
  const place=(r:number,c:number)=>{if(selIdx===null||gameOver)return;const piece=pieces[selIdx];if(!canPlace(board,piece,r,c))return;const nb=board.map(row=>[...row]);piece.forEach((row,dr)=>row.forEach((v,dc)=>{if(v)nb[r+dr][c+dc]=selIdx+1;}));let cleared=0;const toRemove=new Set<string>();for(let i=0;i<BOARD_SIZE;i++){if(nb[i].every(v=>v>0)){for(let j=0;j<BOARD_SIZE;j++)toRemove.add(`${i},${j}`);cleared++;}if(nb.every(row=>row[i]>0)){for(let j=0;j<BOARD_SIZE;j++)toRemove.add(`${j},${i}`);cleared++;}}for(const k of toRemove){const[ri,ci]=k.split(",").map(Number);nb[ri][ci]=0;}setScore(s=>s+piece.flat().reduce((a,v)=>a+v,0)*10+cleared*50);const np=[...pieces];np[selIdx]=newPiece();setPieces(np);setBoard(nb);setSelIdx(null);if(np.every(p=>!Array(BOARD_SIZE).fill(null).some((_,r2)=>Array(BOARD_SIZE).fill(null).some((_,c2)=>canPlace(nb,p,r2,c2)))))setGameOver(true);};
  const PIECE_COLORS=["#7c3aed","#ef4444","#22c55e","#f97316","#3b82f6","#ec4899","#fbbf24"];
  return(
    <div className="flex flex-col items-center gap-3">
      <div className="text-white font-bold">Score: {score} {gameOver&&"— Game Over!"}</div>
      <div style={board3D}><div className="grid gap-0.5 bg-white/5 p-1.5 rounded-xl border border-white/10" style={{gridTemplateColumns:`repeat(${BOARD_SIZE},28px)`,...tilt3D}}>
        {board.map((row,r)=>row.map((v,c)=>(
          <button key={`${r}-${c}`} onClick={()=>place(r,c)}
            style={{width:28,height:28,borderRadius:4,background:v?PIECE_COLORS[(v-1)%PIECE_COLORS.length]:"rgba(255,255,255,0.05)",transform:v?"translateZ(6px)":"none",boxShadow:v?"0 4px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)":"none",transition:"all 0.1s"}}
            className="hover:ring-1 hover:ring-white/40"/>
        )))}
      </div></div>
      <div className="flex gap-3">{pieces.map((p,i)=>(<button key={i} onClick={()=>setSelIdx(i)} style={{...btn3D,padding:8,borderRadius:12,border:`2px solid ${selIdx===i?"white":"rgba(255,255,255,0.2)"}`}}>
        <div className="flex flex-col gap-0.5">{p.map((row,r)=>(<div key={r} className="flex gap-0.5">{row.map((v,c)=>(<div key={c} className="w-5 h-5 rounded" style={{background:v?PIECE_COLORS[i]:""}}/>))}</div>))}</div>
      </button>))}</div>
      {gameOver&&<Btn onClick={()=>{setBoard(Array(BOARD_SIZE).fill(null).map(()=>Array(BOARD_SIZE).fill(0)));setPieces([newPiece(),newPiece(),newPiece()]);setScore(0);setGameOver(false);setSelIdx(null);}}>New Game</Btn>}
    </div>
  );
}

function TowerOfHanoi() {
  const[disks,setDisks]=useState(4);
  const[pegs,setPegs]=useState<number[][]>(()=>[[4,3,2,1],[],[]]);
  const[sel,setSel]=useState<number|null>(null); const[moves,setMoves]=useState(0); const[won,setWon]=useState(false);
  const click=(i:number)=>{if(won)return;if(sel===null){if(pegs[i].length)setSel(i);}else{if(i!==sel){const np=pegs.map(p=>[...p]);const top=np[sel][np[sel].length-1];if(!np[i].length||np[i][np[i].length-1]>top){np[i].push(np[sel].pop()!);setPegs(np);setMoves(m=>m+1);if(np[2].length===disks)setWon(true);}else{setSel(null);return;}}setSel(null);}};
  const reset=(n:number)=>{setDisks(n);setPegs([Array.from({length:n},(_,i)=>n-i),[],[]]);setSel(null);setMoves(0);setWon(false);};
  const DCOLORS=["#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#7c3aed"];
  return(
    <div className="flex flex-col items-center gap-4">
      <div className="text-white font-bold">Moves: {moves} {won&&"🎉 Solved!"}</div>
      <div className="flex gap-2 text-white/50 text-xs">Disks: {[3,4,5].map(n=>(<button key={n} onClick={()=>reset(n)} className={`px-2 py-1 rounded ${disks===n?"bg-white/20":"hover:bg-white/10"}`}>{n}</button>))}</div>
      <div style={{perspective:"700px"}}>
        <div className="flex gap-6 items-end pb-4" style={{transform:"rotateX(10deg)",transformStyle:"preserve-3d"}}>
          {pegs.map((peg,i)=>(
            <div key={i} onClick={()=>click(i)} className={`flex flex-col-reverse items-center gap-1 cursor-pointer ${sel===i?"opacity-100":"opacity-80 hover:opacity-100"}`} style={{minWidth:100,minHeight:140}}>
              <div style={{position:"relative",width:8,height:144,background:"#92400e",borderRadius:4,transform:"translateZ(4px)",boxShadow:"0 4px 8px rgba(0,0,0,0.4)"}}/>
              {peg.map((d,j)=>(<div key={j} className="h-7 rounded flex items-center justify-center text-white font-bold text-sm transition-all" style={{width:d*16+20,background:DCOLORS[(d-1)%DCOLORS.length],position:"relative",zIndex:j,transform:"translateZ(6px)",boxShadow:"0 6px 0 rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.2)"}}>{d}</div>))}
              <div style={{width:96,height:8,background:"#92400e",borderRadius:4,marginTop:4,transform:"translateZ(2px)",boxShadow:"0 4px 0 rgba(0,0,0,0.3)"}}/>
            </div>
          ))}
        </div>
      </div>
      <Btn onClick={()=>reset(disks)}>Reset</Btn>
    </div>
  );
}

function GomokuGame() {
  const SIZE=11;
  const[board,setBoard]=useState<(0|1|2)[][]>(()=>Array(SIZE).fill(null).map(()=>Array(SIZE).fill(0)));
  const[turn,setTurn]=useState<1|2>(1); const[winner,setWinner]=useState(0);
  const checkWin=(b:(0|1|2)[][],p:number)=>{for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){const dirs=[[0,1],[1,0],[1,1],[1,-1]];for(const[dr,dc]of dirs){let cnt=0;for(let k=0;k<5;k++){const nr=r+dr*k,nc=c+dc*k;if(nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&b[nr][nc]===p)cnt++;else break;}if(cnt===5)return true;}}return false;};
  const aiMove=(b:(0|1|2)[][])=>{const empty=[];for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)if(!b[r][c])empty.push([r,c]);for(const p of[2,1])for(const[r,c]of empty){const t=b.map(row=>[...row]);t[r][c]=p as 0|1|2;if(checkWin(t,p))return[r,c];}const center=empty.filter(([r,c])=>Math.abs(r-5)<3&&Math.abs(c-5)<3);return(center.length?center:empty)[Math.floor(Math.random()*(center.length||empty.length))];};
  const click=(r:number,c:number)=>{if(board[r][c]||winner||turn!==1)return;const nb=board.map(row=>[...row]);nb[r][c]=1;if(checkWin(nb,1)){setBoard(nb);setWinner(1);return;}setBoard(nb);setTurn(2);setTimeout(()=>{const[ar,ac]=aiMove(nb);const nb2=nb.map(row=>[...row]);nb2[ar][ac]=2;setBoard(nb2);if(checkWin(nb2,2))setWinner(2);else setTurn(1);},200);};
  const CELL=28;
  return(
    <div className="flex flex-col items-center gap-3">
      <div className="text-white font-bold">{winner?`Player ${winner===1?"(You) ⚫":"(AI) ⚪"} wins!`:`Turn: ${turn===1?"You ⚫":"AI ⚪"}`}</div>
      <div style={board3D}>
        <div className="bg-amber-900/40 p-2 rounded-xl border border-amber-700/30" style={{display:"grid",gridTemplateColumns:`repeat(${SIZE},${CELL}px)`,...tilt3D}}>
          {board.map((row,r)=>row.map((v,c)=>(
            <button key={`${r}-${c}`} onClick={()=>click(r,c)} style={{width:CELL,height:CELL,background:"transparent",border:"1px solid rgba(120,80,20,0.3)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              {v===1&&<div style={{...sphereCSS("#1f2937"),width:20,height:20,borderRadius:"50%",border:"2px solid #374151"}}/>}
              {v===2&&<div style={{...sphereCSS("white"),width:20,height:20,borderRadius:"50%",border:"2px solid #d1d5db"}}/>}
            </button>
          )))}
        </div>
      </div>
      <Btn onClick={()=>{setBoard(Array(SIZE).fill(null).map(()=>Array(SIZE).fill(0)));setTurn(1);setWinner(0);}}>New Game</Btn>
    </div>
  );
}

function NimGame() {
  const[piles,setPiles]=useState([3,5,7]);
  const[turn,setTurn]=useState<"player"|"ai">("player");
  const[winner,setWinner]=useState<string|null>(null);
  const take=(pile:number,count:number)=>{if(turn!=="player"||winner)return;const np=[...piles];np[pile]-=count;setPiles(np);if(np.every(p=>p===0)){setWinner("You win! 🎉");return;}setTurn("ai");setTimeout(()=>{const xor=np.reduce((a,b)=>a^b,0);let ap=[...np];if(xor===0){const pi=ap.findIndex(p=>p>0);if(pi>=0)ap[pi]--;}else{for(let i=0;i<ap.length;i++){const t=ap[i]^xor;if(t<ap[i]){ap[i]=t;break;}}}setPiles(ap);if(ap.every(p=>p===0))setWinner("AI wins!");else setTurn("player");},600);};
  return(
    <div className="flex flex-col items-center gap-5">
      <div className="text-white font-bold text-lg">{winner||`Turn: ${turn==="player"?"Your turn":"AI thinking..."}`}</div>
      <div className="flex flex-col gap-4">
        {piles.map((count,i)=>(
          <div key={i} className="flex items-center gap-3">
            <span className="text-white/50 w-6">#{i+1}</span>
            <div className="flex gap-1">
              {Array(count).fill(null).map((_,j)=>(
                <div key={j} onClick={()=>take(i,j+1)}
                  style={{width:32,height:32,borderRadius:"50%",cursor:"pointer",...sphereCSS("#f59e0b"),boxShadow:"0 4px 0 #b45309, 0 4px 8px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.3)"}}
                  className="hover:brightness-125 transition-all"/>
              ))}
            </div>
            <span className="text-white/30 text-sm">{count}</span>
          </div>
        ))}
      </div>
      <div className="text-white/40 text-xs">Click a stone to take it (and all to its right)</div>
      <Btn onClick={()=>{setPiles([3,5,7]);setTurn("player");setWinner(null);}}>New Game</Btn>
    </div>
  );
}

function BattleshipGame() {
  const SIZE=7; const SHIPS=[3,2,2,1];
  const placeShips=()=>{const grid:number[][]=Array(SIZE).fill(null).map(()=>Array(SIZE).fill(0));for(const s of SHIPS){let placed=false;while(!placed){const horiz=Math.random()<0.5,r=Math.floor(Math.random()*SIZE),c=Math.floor(Math.random()*SIZE);const maxC=horiz?SIZE-s:SIZE,maxR=horiz?SIZE:SIZE-s;if(r<maxR&&c<maxC){const ok=Array.from({length:s},(_,i)=>horiz?grid[r][c+i]:grid[r+i][c]).every(v=>!v);if(ok){for(let i=0;i<s;i++){if(horiz)grid[r][c+i]=1;else grid[r+i][c]=1;}placed=true;}}}}return grid;};
  const[ships]=useState(placeShips);
  const[revealed,setRevealed]=useState<boolean[][]>(()=>Array(SIZE).fill(null).map(()=>Array(SIZE).fill(false)));
  const[hits,setHits]=useState(0); const total=ships.flat().reduce((a,v)=>a+v,0); const[won,setWon]=useState(false);
  const fire=(r:number,c:number)=>{if(revealed[r][c]||won)return;const nr=revealed.map(row=>[...row]);nr[r][c]=true;setRevealed(nr);if(ships[r][c]){const h=hits+1;setHits(h);if(h===total)setWon(true);}};
  return(
    <div className="flex flex-col items-center gap-3">
      <div className="text-white font-bold">Hits: {hits}/{total} {won&&"🎉 Fleet sunk!"}</div>
      <div style={board3D}><div className="grid gap-1" style={{gridTemplateColumns:`repeat(${SIZE},44px)`,...tilt3D}}>
        {Array(SIZE).fill(null).map((_,r)=>Array(SIZE).fill(null).map((_,c)=>{const hit=revealed[r][c]&&ships[r][c];const miss=revealed[r][c]&&!ships[r][c];return(
          <button key={`${r}-${c}`} onClick={()=>fire(r,c)}
            style={hit?{...piece3D,background:"#ef4444"}:miss?{...tile3D}:btn3D}
            className={`w-11 h-11 rounded-lg font-bold text-lg transition-all border-2 ${hit?"border-red-400 text-white":miss?"bg-blue-900 border-blue-700 text-white/50":"bg-blue-800/40 border-blue-700/30 hover:border-blue-400"}`}>
            {hit?"💥":miss?"○":""}
          </button>
        );}))
        }
      </div></div>
      <Btn onClick={()=>{setRevealed(Array(SIZE).fill(null).map(()=>Array(SIZE).fill(false)));setHits(0);setWon(false);}}>New Game</Btn>
    </div>
  );
}

function ReversiGame() {
  const SIZE=8;
  const init=()=>{const b:number[][]=Array(SIZE).fill(null).map(()=>Array(SIZE).fill(0));b[3][3]=2;b[4][4]=2;b[3][4]=1;b[4][3]=1;return b;};
  const[board,setBoard]=useState(init); const[turn,setTurn]=useState(1); const[score,setScore]=useState({p:2,ai:2});
  const DIRS=[[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]];
  const flips=(b:number[][],r:number,c:number,p:number)=>{if(b[r][c])return[];const opp=3-p;const toFlip:number[][]=[];for(const[dr,dc]of DIRS){const line:number[][]=[];let nr=r+dr,nc=c+dc;while(nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&b[nr][nc]===opp){line.push([nr,nc]);nr+=dr;nc+=dc;}if(line.length&&nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&b[nr][nc]===p)toFlip.push(...line);}return toFlip;};
  const place=(r:number,c:number,p:number,b:number[][])=>{const f=flips(b,r,c,p);if(!f.length)return null;const nb=b.map(row=>[...row]);nb[r][c]=p;for(const[fr,fc]of f)nb[fr][fc]=p;return nb;};
  const click=(r:number,c:number)=>{if(turn!==1)return;const nb=place(r,c,1,board);if(!nb)return;setBoard(nb);const s={p:nb.flat().filter(v=>v===1).length,ai:nb.flat().filter(v=>v===2).length};setScore(s);setTurn(2);setTimeout(()=>{const empty=[];for(let r2=0;r2<SIZE;r2++)for(let c2=0;c2<SIZE;c2++)if(!nb[r2][c2]&&flips(nb,r2,c2,2).length)empty.push([r2,c2]);if(!empty.length){setTurn(1);return;}const[ar,ac]=empty[Math.floor(Math.random()*empty.length)];const nb2=place(ar,ac,2,nb)!;setBoard(nb2);setScore({p:nb2.flat().filter(v=>v===1).length,ai:nb2.flat().filter(v=>v===2).length});setTurn(1);},400);};
  const CELL=34;
  return(
    <div className="flex flex-col items-center gap-3">
      <div className="text-white font-bold">You ⚫{score.p} · AI ⚪{score.ai}</div>
      <div style={board3D}><div className="bg-emerald-900/40 p-1 rounded-xl border border-emerald-700/30" style={{display:"grid",gridTemplateColumns:`repeat(${SIZE},${CELL}px)`,...tilt3D}}>
        {board.map((row,r)=>row.map((v,c)=>{const canPlay=turn===1&&!v&&flips(board,r,c,1).length;return(
          <button key={`${r}-${c}`} onClick={()=>click(r,c)} style={{width:CELL,height:CELL,background:"transparent",border:"1px solid rgba(0,100,0,0.3)",display:"flex",alignItems:"center",justifyContent:"center"}} className={canPlay?"hover:bg-white/10":""}>
            {v===1&&<div style={{...sphereCSS("#1f2937"),width:24,height:24,borderRadius:"50%",border:"2px solid #374151"}}/>}
            {v===2&&<div style={{...sphereCSS("white"),width:24,height:24,borderRadius:"50%",border:"2px solid #d1d5db"}}/>}
            {!v&&canPlay&&<div className="w-3 h-3 rounded-full bg-white/20"/>}
          </button>
        );}))
        }
      </div></div>
      <Btn onClick={()=>{setBoard(init());setTurn(1);setScore({p:2,ai:2});}}>New Game</Btn>
    </div>
  );
}

function DotsBoxesGame() {
  const SIZE=5;
  type Line={h:boolean[][];v:boolean[][]};
  const initLines=():Line=>({h:Array(SIZE+1).fill(null).map(()=>Array(SIZE).fill(false)),v:Array(SIZE).fill(null).map(()=>Array(SIZE+1).fill(false))});
  const[lines,setLines]=useState(initLines);
  const[boxes,setBoxes]=useState<number[][]>(()=>Array(SIZE).fill(null).map(()=>Array(SIZE).fill(0)));
  const[score,setScore]=useState({p:0,ai:0}); const[turn,setTurn]=useState(1);
  const checkBoxes=(l:Line)=>{const nb:number[][]=Array(SIZE).fill(null).map(()=>Array(SIZE).fill(0));let scored=false;for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){if(l.h[r][c]&&l.h[r+1][c]&&l.v[r][c]&&l.v[r][c+1]){nb[r][c]=turn;scored=true;}}return{nb,scored};};
  const drawLine=(type:"h"|"v",r:number,c:number,p:number)=>{const nl:Line={h:lines.h.map(row=>[...row]),v:lines.v.map(row=>[...row])};nl[type][r][c]=true;const{nb,scored}=checkBoxes(nl);let newScore={...score};if(scored){if(p===1)newScore.p+=nb.flat().filter(v=>v===1).length-boxes.flat().filter(v=>v===1).length;else newScore.ai+=nb.flat().filter(v=>v===2).length-boxes.flat().filter(v=>v===2).length;}setLines(nl);setBoxes(nb);setScore(newScore);if(!scored)setTurn(t=>t===1?2:1);if(p===1&&!scored){setTimeout(()=>{const empty:["h"|"v",number,number][]=[];for(let i=0;i<SIZE+1;i++)for(let j=0;j<SIZE;j++){if(!nl.h[i]?.[j])empty.push(["h",i,j]);}for(let i=0;i<SIZE;i++)for(let j=0;j<SIZE+1;j++){if(!nl.v[i]?.[j])empty.push(["v",i,j]);}if(empty.length){const[t2,r2,c2]=empty[Math.floor(Math.random()*empty.length)];drawLine(t2,r2,c2,2);}},300);}};
  return(
    <div className="flex flex-col items-center gap-3">
      <div className="text-white font-bold">You: {score.p} · AI: {score.ai}</div>
      <div style={board3D}><div className="relative" style={{width:SIZE*50+10,height:SIZE*50+10,...tilt3D}}>
        {Array(SIZE+1).fill(null).map((_,r)=>Array(SIZE).fill(null).map((_,c)=>(<button key={`h-${r}-${c}`} onClick={()=>!lines.h[r]?.[c]&&turn===1&&drawLine("h",r,c,1)} style={{position:"absolute",left:c*50+10,top:r*50-3,width:36,height:12,background:lines.h[r]?.[c]?"#7c3aed":"rgba(255,255,255,0.1)",borderRadius:4,transform:lines.h[r]?.[c]?"translateZ(6px)":"translateZ(2px)",boxShadow:lines.h[r]?.[c]?"0 4px 0 rgba(0,0,0,0.3)":"none"}} className="hover:bg-white/30 transition-all"/>)))}
        {Array(SIZE).fill(null).map((_,r)=>Array(SIZE+1).fill(null).map((_,c)=>(<button key={`v-${r}-${c}`} onClick={()=>!lines.v[r]?.[c]&&turn===1&&drawLine("v",r,c,1)} style={{position:"absolute",left:c*50-3,top:r*50+10,width:12,height:36,background:lines.v[r]?.[c]?"#7c3aed":"rgba(255,255,255,0.1)",borderRadius:4,transform:lines.v[r]?.[c]?"translateZ(6px)":"translateZ(2px)",boxShadow:lines.v[r]?.[c]?"0 4px 0 rgba(0,0,0,0.3)":"none"}} className="hover:bg-white/30 transition-all"/>)))}
        {Array(SIZE).fill(null).map((_,r)=>Array(SIZE).fill(null).map((_,c)=>(<div key={`box-${r}-${c}`} style={{position:"absolute",left:c*50+10,top:r*50+10,width:36,height:36,background:boxes[r][c]===1?"rgba(124,58,237,0.4)":boxes[r][c]===2?"rgba(239,68,68,0.4)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,transform:boxes[r][c]?"translateZ(3px)":"none"}}>{boxes[r][c]===1?"🟣":boxes[r][c]===2?"🔴":""}</div>)))}
        {Array(SIZE+1).fill(null).map((_,r)=>Array(SIZE+1).fill(null).map((_,c)=>(<div key={`dot-${r}-${c}`} style={{position:"absolute",left:c*50+1,top:r*50+1,width:14,height:14,borderRadius:"50%",...sphereCSS("white")}}/>)))}
      </div></div>
      <Btn onClick={()=>{setLines(initLines());setBoxes(Array(SIZE).fill(null).map(()=>Array(SIZE).fill(0)));setScore({p:0,ai:0});setTurn(1);}}>New Game</Btn>
    </div>
  );
}

function MiniCheckers() {
  const SIZE=6;
  const init=()=>{const b:number[][]=Array(SIZE).fill(null).map(()=>Array(SIZE).fill(0));for(let r=0;r<2;r++)for(let c=0;c<SIZE;c++)if((r+c)%2===1)b[r][c]=2;for(let r=SIZE-2;r<SIZE;r++)for(let c=0;c<SIZE;c++)if((r+c)%2===1)b[r][c]=1;return b;};
  const[board,setBoard]=useState(init); const[sel,setSel]=useState<[number,number]|null>(null); const[turn,setTurn]=useState(1); const[winner,setWinner]=useState(0);
  const getMoves=(b:number[][],r:number,c:number,p:number)=>{const moves:[[number,number],[number,number]][]=[],dir=p===1?-1:1;for(const dc of[-1,1]){const nr=r+dir,nc=c+dc;if(nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE){if(!b[nr][nc])moves.push([[r,c],[nr,nc]]);else if(b[nr][nc]!==p){const jr=nr+dir,jc=nc+dc;if(jr>=0&&jr<SIZE&&jc>=0&&jc<SIZE&&!b[jr][jc])moves.push([[r,c],[jr,jc]]);}}}return moves;};
  const click=(r:number,c:number)=>{if(winner||turn!==1)return;if(!sel){if(board[r][c]===1)setSel([r,c]);}else{const valid=getMoves(board,sel[0],sel[1],1).find(([_,[tr,tc]])=>tr===r&&tc===c);if(valid){const nb=board.map(row=>[...row]);nb[r][c]=1;nb[sel[0]][sel[1]]=0;if(Math.abs(r-sel[0])===2)nb[(r+sel[0])/2][(c+sel[1])/2]=0;setBoard(nb);setSel(null);if(!nb.flat().some(v=>v===2)){setWinner(1);return;}setTurn(2);setTimeout(()=>{const allMoves:[[number,number],[number,number]][]=[];for(let r2=0;r2<SIZE;r2++)for(let c2=0;c2<SIZE;c2++)if(nb[r2][c2]===2)allMoves.push(...getMoves(nb,r2,c2,2));if(!allMoves.length){setWinner(1);return;}const[from,to]=allMoves[Math.floor(Math.random()*allMoves.length)];const nb2=nb.map(row=>[...row]);nb2[to[0]][to[1]]=2;nb2[from[0]][from[1]]=0;if(Math.abs(to[0]-from[0])===2)nb2[(to[0]+from[0])/2][(to[1]+from[1])/2]=0;setBoard(nb2);if(!nb2.flat().some(v=>v===1))setWinner(2);else setTurn(1);},400);}else setSel(null);}};
  const CELL=46;
  return(
    <div className="flex flex-col items-center gap-3">
      <div className="text-white font-bold">{winner?`${winner===1?"You":"AI"} win! 🎉`:`Turn: ${turn===1?"You 🔴":"AI ⚫"}`}</div>
      <div style={board3D}><div className="rounded-xl overflow-hidden border border-white/10" style={{display:"grid",gridTemplateColumns:`repeat(${SIZE},${CELL}px)`,...tilt3D}}>
        {board.map((row,r)=>row.map((v,c)=>{const dark=(r+c)%2===1;const isSelected=sel?.[0]===r&&sel?.[1]===c;return(
          <div key={`${r}-${c}`} onClick={()=>click(r,c)} style={{width:CELL,height:CELL,background:dark?"#1a2e1a":"#2d4a2d",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",outline:isSelected?"3px solid #fbbf24":"none"}}>
            {v===1&&<div style={{width:36,height:36,borderRadius:"50%",...sphereCSS("#ef4444"),border:"2px solid #fca5a5"}}/>}
            {v===2&&<div style={{width:36,height:36,borderRadius:"50%",...sphereCSS("#1e293b"),border:"2px solid #475569"}}/>}
          </div>
        );}))
        }
      </div></div>
      <Btn onClick={()=>{setBoard(init());setTurn(1);setWinner(0);setSel(null);}}>New Game</Btn>
    </div>
  );
}

function SpotColorGame() {
  const COLORS=["#ef4444","#f97316","#3b82f6","#22c55e","#a855f7","#ec4899"];
  const gen=()=>{const base=Math.floor(Math.random()*COLORS.length);const odd=base===COLORS.length-1?base-1:base+1;const size=4+Math.floor(Math.random()*4);const total=size*size;const oddIdx=Math.floor(Math.random()*total);return{base,odd,total,oddIdx,size};};
  const[level,setLevel]=useState(gen); const[score,setScore]=useState(0); const[streak,setStreak]=useState(0); const[fb,setFb]=useState<string|null>(null);
  const click=(idx:number)=>{if(idx===level.oddIdx){setScore(s=>s+1);setStreak(s=>s+1);setFb("✅ Correct!");}else{setStreak(0);setFb("❌ Wrong!");}setTimeout(()=>{setLevel(gen());setFb(null);},700);};
  return(
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-6 text-white font-bold"><span>Score: {score}</span><span>🔥{streak}</span></div>
      <div className="text-white/60 text-sm">Find the slightly different color!</div>
      {fb&&<div className="text-xl font-bold text-white">{fb}</div>}
      <div style={board3D}><div className="grid gap-1" style={{gridTemplateColumns:`repeat(${level.size},36px)`,...tilt3D}}>
        {Array(level.total).fill(null).map((_,i)=>(
          <button key={i} onClick={()=>click(i)}
            style={{width:36,height:36,borderRadius:6,background:COLORS[i===level.oddIdx?level.odd:level.base],transform:i===level.oddIdx?"translateZ(8px)":"translateZ(4px)",boxShadow:"0 4px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",transition:"all 0.1s"}}
            className="hover:brightness-125 active:scale-95"/>
        ))}
      </div></div>
    </div>
  );
}

function EquationBuilder() {
  const gen=()=>{const target=Math.floor(Math.random()*20)+5;const nums=Array(6).fill(null).map(()=>Math.floor(Math.random()*9)+1);return{target,nums};};
  const[level,setLevel]=useState(gen); const[expr,setExpr]=useState<string[]>([]); const[result,setResult]=useState<number|null>(null); const[score,setScore]=useState(0); const[fb,setFb]=useState<string|null>(null);
  const addNum=(n:number,i:number)=>{if(expr.includes(`n${i}`))return;setExpr(e=>[...e,`n${i}:${n}`]);};
  const addOp=(op:string)=>{setExpr(e=>[...e,op]);};
  const evalExpr=()=>{const str=expr.map(t=>t.startsWith("n")?t.split(":")[1]:t).join(" ");try{const r=Function(`"use strict";return(${str})`)();setResult(r);if(r===level.target){setScore(s=>s+1);setFb("✅ Correct!");setTimeout(()=>{setLevel(gen());setExpr([]);setResult(null);setFb(null);},900);}else setFb(`= ${r}, need ${level.target}`);}catch{setFb("Invalid expression");}};
  return(
    <div className="flex flex-col items-center gap-4">
      <div className="text-white font-bold">Score: {score}</div>
      <div style={piece3D} className="text-3xl font-black text-primary bg-white/10 px-8 py-4 rounded-2xl">Target: {level.target}</div>
      <div style={tile3D} className="min-h-10 px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-white font-mono text-lg flex items-center gap-1 flex-wrap min-w-[200px]">
        {expr.length?expr.map((t,i)=>(<span key={i} className="text-white/80">{t.startsWith("n")?t.split(":")[1]:t}</span>)):<span className="text-white/20">build expression…</span>}
      </div>
      {fb&&<div className="text-lg font-bold text-white">{fb}</div>}
      <div className="flex flex-wrap gap-2 justify-center">{level.nums.map((n,i)=>(<button key={i} onClick={()=>addNum(n,i)} disabled={expr.includes(`n${i}`)} style={btn3D} className="w-10 h-10 rounded-lg bg-violet-600 disabled:opacity-30 text-white font-bold hover:bg-violet-500">{n}</button>))}</div>
      <div className="flex gap-2">{["+","-","*","(",")",].map(op=>(<button key={op} onClick={()=>addOp(op)} style={btn3D} className="w-10 h-10 rounded-lg bg-white/10 text-white font-bold hover:bg-white/20">{op}</button>))}</div>
      <div className="flex gap-2"><Btn onClick={evalExpr} cls="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold">=</Btn><Btn onClick={()=>{setExpr([]);setResult(null);setFb(null);}}>Clear</Btn><Btn onClick={()=>{setLevel(gen());setExpr([]);setResult(null);setFb(null);}}>Skip</Btn></div>
    </div>
  );
}

function PatternMatch() {
  const SHAPES=["⬛","🟥","🔵","⭐","💎","🔷"];
  const gen=()=>{const len=4+Math.floor(Math.random()*3);const seq=Array(len).fill(null).map(()=>SHAPES[Math.floor(Math.random()*4)]);const next=seq[Math.floor(Math.random()*3)];return{seq,next,choices:[next,...SHAPES.filter(s=>s!==next).slice(0,3)].sort(()=>Math.random()-0.5)};};
  const[level,setLevel]=useState(gen); const[score,setScore]=useState(0); const[streak,setStreak]=useState(0); const[fb,setFb]=useState<string|null>(null);
  const click=(s:string)=>{if(s===level.next){setScore(sc=>sc+1);setStreak(sc=>sc+1);setFb("✅ Correct!");}else{setStreak(0);setFb(`❌ Was: ${level.next}`);}setTimeout(()=>{setLevel(gen());setFb(null);},700);};
  return(
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-6 text-white font-bold"><span>Score: {score}</span><span>🔥{streak}</span></div>
      <div className="text-white/60 text-sm">What comes next in the pattern?</div>
      <div className="flex gap-2 items-center text-4xl flex-wrap justify-center">{level.seq.map((s,i)=>(<span key={i} style={{display:"inline-block",transform:"translateZ(4px)",filter:"drop-shadow(0 4px 6px rgba(0,0,0,0.4))"}}>{s}</span>))}<span className="text-white/20 text-2xl mx-2">→</span><span className="text-white/20 text-4xl">?</span></div>
      {fb&&<div className="text-xl font-bold text-white">{fb}</div>}
      <div className="flex gap-3 flex-wrap justify-center">
        {level.choices.map((s,i)=>(<button key={i} onClick={()=>click(s)} style={btn3D} className="w-16 h-16 rounded-2xl bg-white/10 hover:bg-white/20 text-3xl flex items-center justify-center transition-all hover:scale-105">{s}</button>))}
      </div>
    </div>
  );
}

function BubbleShooter() {
  const COLORS=["#ef4444","#3b82f6","#22c55e","#fbbf24","#a855f7"];
  const ROWS=6,COLS=8;
  const newGrid=():( string|null)[][]=>Array(ROWS).fill(null).map(()=>Array(COLS).fill(null).map(()=>COLORS[Math.floor(Math.random()*COLORS.length)]));
  const[grid,setGrid]=useState<(string|null)[][]>(newGrid);
  const[angle,setAngle]=useState(270);
  const[current,setCurrent]=useState(()=>COLORS[Math.floor(Math.random()*COLORS.length)]);
  const[score,setScore]=useState(0); const[won,setWon]=useState(false);
  const onMove=(e:React.MouseEvent<HTMLDivElement>)=>{const r=e.currentTarget.getBoundingClientRect();const cx=r.width/2;const dx=e.clientX-r.left-cx,dy=e.clientY-r.top-r.height;const a=Math.atan2(dx,-dy)*(180/Math.PI);setAngle(Math.max(210,Math.min(330,a+270)));};
  const shoot=()=>{const radians=(angle-270)*Math.PI/180;let bx=160,by=340;let stepX=Math.sin(radians)*20,stepY=-Math.cos(radians)*20;const ng=grid.map(r=>[...r]);let placed=false;
    for(let step=0;step<30&&!placed;step++){bx+=stepX;by+=stepY;if(bx<0||bx>320){stepX*=-1;}const col=Math.round(bx/40),row=Math.round(by/40);if(row>=0&&row<ROWS&&col>=0&&col<COLS&&ng[row][col]===null){ng[row][col]=current;placed=true;const toRemove:Set<string>=new Set();const check=(r2:number,c2:number)=>{if(r2<0||r2>=ROWS||c2<0||c2>=COLS||ng[r2][c2]!==current||toRemove.has(`${r2},${c2}`))return;toRemove.add(`${r2},${c2}`);[[0,1],[0,-1],[1,0],[-1,0]].forEach(([dr,dc])=>check(r2+dr,c2+dc));};check(row,col);if(toRemove.size>=3){for(const k of toRemove){const[r2,c2]=k.split(",").map(Number);ng[r2][c2]=null;}setScore(s=>s+toRemove.size*10);}}}
    setGrid(ng);setCurrent(COLORS[Math.floor(Math.random()*COLORS.length)]);if(ng.flat().every(v=>v===null))setWon(true);};
  const CELL=40;
  return(
    <div className="flex flex-col items-center gap-3">
      <div className="text-white font-bold">Score: {score} {won&&"🎉 Cleared!"}</div>
      <div className="relative bg-[#0f172a] border border-white/10 rounded-xl overflow-hidden select-none" style={{width:320,height:380}} onMouseMove={onMove} onClick={shoot}>
        <div style={{display:"grid",gridTemplateColumns:`repeat(${COLS},${CELL}px)`}}>
          {grid.map((row,r)=>row.map((cl,cc)=>(
            <div key={`${r}-${cc}`} style={{width:CELL,height:CELL,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {cl&&<div style={{width:32,height:32,borderRadius:"50%",...sphereCSS(cl)}}/>}
            </div>
          )))}
        </div>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:80,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",paddingBottom:8}}>
          <div style={{width:40,height:40,borderRadius:"50%",...sphereCSS(current),border:"2px solid rgba(255,255,255,0.4)"}}/>
        </div>
      </div>
      <Btn onClick={()=>{setGrid(newGrid());setScore(0);setWon(false);}}>New Game</Btn>
      <div className="text-white/40 text-xs">Move mouse to aim · click to shoot</div>
    </div>
  );
}

function PacManGame() {
  const GRID=["############################","#............##............#","#.####.#####.##.#####.####.#","#o####.#####.##.#####.####o#","#.####.#####.##.#####.####.#","#..........................#","#.####.##.########.##.####.#","#.####.##.########.##.####.#","#......##....##....##......#","######.#####.##.#####.######","     #.#####.##.#####.#     ","     #.##          ##.#     ","     #.## ###  ### ##.#     ","######.## #      # ##.######","      .   #      #   .      ","######.## #      # ##.######","     #.## ######## ##.#     ","     #.##          ##.#     ","     #.## ######## ##.#     ","######.## ######## ##.######","#............##............#","#.####.#####.##.#####.####.#","#o..##................##..o#","###.##.##.########.##.##.###","#......##....##....##......#","#.##########.##.##########.#","#..........................#","############################"];
  const SIZE=14;const COLS=28;const ROWS=28;
  const initMap=()=>GRID.map(row=>[...row].map(c=>c));
  const[map,setMap]=useState(initMap);
  const[pos,setPos]=useState({x:14,y:14});
  const[score,setScore]=useState(0);
  const[dir,setDir]=useState({x:0,y:0});
  const[ghosts,setGhosts]=useState([{x:13,y:11,c:"#ef4444"},{x:14,y:11,c:"#ec4899"},{x:15,y:11,c:"#22d3ee"}]);
  const dotsLeft=map.flat().filter(c=>c==="."||c==="o").length;
  useEffect(()=>{
    const iv=setInterval(()=>{
      if(dir.x===0&&dir.y===0)return;
      const nx=pos.x+dir.x,ny=pos.y+dir.y;
      if(ny<0||ny>=ROWS||nx<0||nx>=COLS||map[ny][nx]==="#")return;
      const nm=map.map(r=>[...r]);const cell=nm[ny][nx];
      if(cell==="."||cell==="o"){nm[ny][nx]=" ";setScore(s=>s+(cell==="o"?50:10));setMap(nm);}
      setPos({x:nx,y:ny});
      setGhosts(gs=>gs.map(gh=>{const moves=[{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}].filter(d=>{const gx=gh.x+d.x,gy=gh.y+d.y;return gx>=0&&gx<COLS&&gy>=0&&gy<ROWS&&map[gy][gx]!=="#";});if(!moves.length)return gh;const mv=moves[Math.floor(Math.random()*moves.length)];return{...gh,x:gh.x+mv.x,y:gh.y+mv.y};}));
    },150);
    const onKey=(e:KeyboardEvent)=>{if(e.key==="ArrowLeft")setDir({x:-1,y:0});if(e.key==="ArrowRight")setDir({x:1,y:0});if(e.key==="ArrowUp")setDir({x:0,y:-1});if(e.key==="ArrowDown")setDir({x:0,y:1});};
    window.addEventListener("keydown",onKey);
    return()=>{clearInterval(iv);window.removeEventListener("keydown",onKey);};
  },[dir,pos,map]);
  const hit=ghosts.some(g=>g.x===pos.x&&g.y===pos.y);
  return(
    <div className="flex flex-col items-center gap-2">
      <div className="text-white font-bold">Score: {score} {dotsLeft===0&&"🎉 You Win!"} {hit&&"💀 Caught!"}</div>
      <div style={{perspective:"800px"}}>
        <div className="bg-[#000022] rounded-lg overflow-hidden" style={{display:"grid",gridTemplateColumns:`repeat(${COLS},${SIZE}px)`,transform:"rotateX(5deg)",transformStyle:"preserve-3d"}}>
          {map.map((row,y)=>row.map((cell,x)=>{const isPac=pos.x===x&&pos.y===y;const ghost=ghosts.find(g=>g.x===x&&g.y===y);return(
            <div key={`${x}-${y}`} style={{width:SIZE,height:SIZE,background:cell==="#"?"#1e3a8a":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:cell==="o"?10:6,transform:cell==="#"?"translateZ(4px)":isPac?"translateZ(8px)":"translateZ(0px)"}}>
              {isPac?<span style={{fontSize:10}}>😮</span>:ghost?<span style={{color:ghost.c,fontSize:10}}>👻</span>:cell==="."?<span style={{color:"#fbbf24"}}>•</span>:cell==="o"?<span style={{color:"#fbbf24"}}>⬤</span>:null}
            </div>
          );}))}
        </div>
      </div>
      <div className="flex gap-2">{[["↑",{x:0,y:-1}],["↓",{x:0,y:1}],["←",{x:-1,y:0}],["→",{x:1,y:0}]].map(([label,d])=>(<button key={label as string} onClick={()=>setDir(d as {x:number,y:number})} className="w-10 h-10 bg-white/10 rounded-lg text-white font-bold hover:bg-white/20">{label as string}</button>))}</div>
      {(hit||dotsLeft===0)&&<Btn onClick={()=>{setMap(initMap());setPos({x:14,y:14});setScore(0);setDir({x:0,y:0});setGhosts([{x:13,y:11,c:"#ef4444"},{x:14,y:11,c:"#ec4899"},{x:15,y:11,c:"#22d3ee"}]);}}>New Game</Btn>}
      <div className="text-white/40 text-xs">Arrow keys to move</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// GAME COMPONENTS MAP
// ─────────────────────────────────────────────────────────
const GAME_COMPONENTS: Record<string, React.ComponentType<{name:string}>> = {
  flappy:     ()=><FlappyBird />,
  runner:     ()=><EndlessRunner />,
  whack:      ()=><WhackMole />,
  doodle:     ()=><FlappyBird />,
  stack:      ()=><StackTower />,
  bounce:     ()=><BreakoutGame />,
  dropcatch:  ()=><DropCatcher />,
  heli:       ()=><HelicopterGame />,
  plane:      ()=><PlaneDodger />,
  pinball:    ()=><PinballGame />,
  breakout:   ()=><BreakoutGame />,
  colorswitch:()=><ColorSwitch />,
  lane:       ()=><LaneHopper />,
  snake:      ()=><SnakeGame />,
  invaders:   ()=><SpaceInvaders />,
  pacman:     ()=><PacManGame />,
  frogger:    ()=><FroggerGame />,
  pong:       ()=><PongGame />,
  tetris:     ()=><TetrisGame />,
  "2048":     ()=><Game2048 />,
  memory:     ()=><MemoryMatchGame />,
  maze:       ()=><MazeRunner />,
  match3:     ()=><Match3Game />,
  mines:      ()=><MinesweeperGame />,
  sokoban:    ()=><SokobanGame />,
  sudoku:     ()=><SudokuGame />,
  "15puzzle": ()=><Puzzle15 />,
  colorsort:  ()=><ColorSortGame />,
  blockpuz:   ()=><BlockPuzzleGame />,
  lightsout:  ()=><LightsOut />,
  hanoi:      ()=><TowerOfHanoi />,
  asteroids:  ()=><AsteroidsGame />,
  geodash:    ()=><GeometryDash />,
  neon:       ()=><NeonRacer />,
  fruit:      ()=><FruitSlice />,
  tank:       ()=><TankBattle />,
  sky:        ()=><SkyDefender />,
  ninja:      ()=><NinjaJump />,
  falling:    ()=><FallingCubes />,
  bubble:     ()=><BubbleShooter />,
  c4:         ()=><ConnectFour />,
  ttt:        ()=><TicTacToe />,
  rps:        ()=><RockPaperScissors />,
  gomoku:     ()=><GomokuGame />,
  nim:        ()=><NimGame />,
  battle:     ()=><BattleshipGame />,
  reversi:    ()=><ReversiGame />,
  dots:       ()=><DotsBoxesGame />,
  checkers:   ()=><MiniCheckers />,
  simon:      ()=><SimonSays />,
  react:      ()=><ReactionTest />,
  wordle:     ()=><WordGuess />,
  hangman:    ()=><HangmanGame />,
  mathquiz:   ()=><MathQuiz />,
  nummem:     ()=><NumberMemory />,
  typing:     ()=><TypingSpeed />,
  hilo:       ()=><HiLo />,
  quicktap:   ()=><QuickTap />,
  anagram:    ()=><AnagramGame />,
  spotcolor:  ()=><SpotColorGame />,
  equation:   ()=><EquationBuilder />,
  pattern:    ()=><PatternMatch />,
};

// ─────────────────────────────────────────────────────────
// GAME MODAL
// ─────────────────────────────────────────────────────────
function GameModal({ game, onClose }: { game: Game; onClose: () => void }) {
  const Comp = GAME_COMPONENTS[game.id];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0d0d1e] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className={`flex items-center justify-between p-4 bg-gradient-to-r ${game.bg} rounded-t-2xl`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{game.emoji}</span>
            <div>
              <div className="text-white font-black text-lg">{game.name}</div>
              <div className="text-white/70 text-xs">{game.desc}</div>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-all"><FiX /></button>
        </div>
        <div className="p-6 flex flex-col items-center">
          {Comp ? <Comp name={game.name}/> : <div className="text-white/50">Game not available</div>}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN GAMES PAGE
// ─────────────────────────────────────────────────────────
const CAT_ICONS: Record<string, React.ReactNode> = {
  All: <FiGrid className="w-3 h-3" />,
  Arcade: <FiZap className="w-3 h-3" />,
  Classic: <FiStar className="w-3 h-3" />,
  Puzzle: <FiTarget className="w-3 h-3" />,
  Action: <FiTrendingUp className="w-3 h-3" />,
  Strategy: <FiCpu className="w-3 h-3" />,
  Brain: <FiBrain className="w-3 h-3" />,
};

function FiStar({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
}
function FiBrain({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.96-3 2.5 2.5 0 0 1 1-4.8V8.3a2.5 2.5 0 0 1 3.46-2.3M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.96-3 2.5 2.5 0 0 0-1-4.8V8.3a2.5 2.5 0 0 0-3.46-2.3"/></svg>;
}

export default function GamesPage() {
  const CATS = ["All", "Arcade", "Classic", "Puzzle", "Action", "Strategy", "Brain"];
  const [activeCat, setActiveCat] = useState("All");
  const [search, setSearch] = useState("");
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [played, setPlayed] = useState<Set<string>>(new Set());

  const filtered = GAMES.filter(g => {
    const matchCat = activeCat === "All" || g.category === activeCat;
    const matchSearch = !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const open = (g: Game) => {
    setActiveGame(g);
    setPlayed(p => new Set([...p, g.id]));
  };

  return (
    <div className="h-full flex flex-col bg-[#06060f]">
      {activeGame && <GameModal game={activeGame} onClose={() => setActiveGame(null)} />}

      <div className="px-6 pt-6 pb-3 shrink-0">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl">🎮</span>
          <div>
            <h1 className="text-white font-black text-2xl">Games</h1>
            <p className="text-white/40 text-xs">62 fully playable games — rich 2D graphics</p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-3 shrink-0">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search 62 games..."
            className="w-full bg-[#0d0d1e] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-violet-500/50" />
        </div>
      </div>

      <div className="px-6 pb-3 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
        {CATS.map(c=>(
          <button key={c} onClick={()=>setActiveCat(c)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeCat===c?"bg-violet-600 text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]":"bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20"}`}>
            {CAT_ICONS[c]}
            {c}
            {c!=="All"&&<span className="text-xs opacity-60">{CAT_COUNTS[c]}</span>}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 no-scrollbar">
        {activeCat==="All"&&!search&&(
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <FiZap className="text-yellow-400 w-4 h-4" />
              <span className="text-white font-bold text-sm">Featured Picks</span>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {FEATURED.map(g=>(
                <button key={g.id} onClick={()=>open(g)}
                  className={`shrink-0 w-36 h-24 rounded-2xl bg-gradient-to-br ${g.bg} flex flex-col items-center justify-center gap-1.5 hover:scale-105 transition-all shadow-lg relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10"/>
                  <span className="text-4xl relative z-10">{g.emoji}</span>
                  <span className="text-white font-bold text-xs relative z-10 drop-shadow">{g.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-3 flex items-center gap-2">
          <span className="text-white font-bold text-sm">{activeCat==="All"?"All Games":activeCat}</span>
          <span className="text-white/30 text-xs">({filtered.length})</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(g=>(
            <div key={g.id} className="bg-[#0d0d1e] border border-white/8 rounded-2xl overflow-hidden hover:border-violet-500/30 transition-all hover:-translate-y-1 group cursor-pointer" onClick={()=>open(g)}>
              <div className={`h-32 bg-gradient-to-br ${g.bg} relative flex items-center justify-center overflow-hidden`}>
                <div className="absolute inset-0 bg-black/20"/>
                <div className="flex items-center justify-center gap-3 relative z-10">
                  <div className="rounded-xl overflow-hidden shadow-2xl" style={{boxShadow:'0 8px 24px rgba(0,0,0,0.5)'}}>
                    <GameThumbnail game={g} />
                  </div>
                </div>
                <span className="absolute top-2 right-2 text-[10px] font-bold bg-black/50 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">{g.category}</span>
                <span className="absolute top-2 left-2 text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full backdrop-blur-sm">{g.emoji}</span>
                {played.has(g.id)&&<span className="absolute bottom-2 right-2 text-[10px] bg-amber-500/80 text-white px-1.5 py-0.5 rounded-full backdrop-blur-sm">Played</span>}
              </div>
              <div className="p-3">
                <div className="text-white font-bold text-sm mb-1">{g.name}</div>
                <div className="text-white/40 text-xs mb-3 leading-relaxed line-clamp-2">{g.desc}</div>
                <button
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-violet-600/20 hover:bg-violet-600/40 border border-violet-500/30 hover:border-violet-500/60 text-violet-300 hover:text-white rounded-lg text-xs font-bold transition-all group-hover:bg-violet-600/30">
                  <FiPlay className="w-3 h-3 ml-0.5" /> Play Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
