// complexFlow.js — Complex Potential Flow Visualizer
// Drop this file next to index.html and add: <script src="complexFlow.js"></script>

(function () {

// ─── Inject styles ────────────────────────────────────────────────────────────
const style = document.createElement('style');
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&family=Fraunces:ital,wght@0,300;0,400;1,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0c0f;
    --panel: #0f1215;
    --border: #1e2428;
    --accent: #4af0c8;
    --accent2: #f0a44a;
    --text: #c8d4dc;
    --dim: #4a5a64;
    --error: #f05a4a;
  }

  html, body {
    background: var(--bg);
    color: var(--text);
    font-family: 'JetBrains Mono', monospace;
    height: 100%;
    overflow: hidden;
  }

  #cf-root { display: flex; flex-direction: column; height: 100vh; }

  #cf-header {
    padding: 12px 24px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: baseline; gap: 16px; flex-shrink: 0;
  }
  #cf-header h1 {
    font-family: 'Fraunces', serif; font-weight: 300;
    font-size: 1.1rem; letter-spacing: 0.05em; color: var(--accent);
  }
  #cf-header span { font-size: 0.7rem; color: var(--dim); letter-spacing: 0.1em; text-transform: uppercase; }

  #cf-split { display: flex; flex: 1; overflow: hidden; }

  #cf-left {
    width: 320px; flex-shrink: 0;
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    padding: 20px; gap: 16px;
    background: var(--panel);
    overflow-y: auto; overflow-x: hidden;
  }
  #cf-left::-webkit-scrollbar { width: 4px; }
  #cf-left::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  .cf-section-label {
    font-size: 0.65rem; letter-spacing: 0.15em;
    text-transform: uppercase; color: var(--dim); margin-bottom: 4px;
  }
  .cf-input-group { display: flex; flex-direction: column; gap: 6px; }
  .cf-input-row {
    display: flex; align-items: center; gap: 8px;
    background: var(--bg); border: 1px solid var(--border);
    border-radius: 4px; padding: 8px 12px; transition: border-color 0.2s;
  }
  .cf-input-row:focus-within { border-color: var(--accent); }
  .cf-input-row.error { border-color: var(--error); }
  .cf-input-prefix { font-size: 0.75rem; color: var(--dim); white-space: nowrap; }

  #cf-func-input, #cf-region-input {
    background: none; border: none; outline: none;
    color: var(--accent2); font-family: 'JetBrains Mono', monospace;
    font-size: 0.9rem; flex: 1; min-width: 0;
  }

  #cf-error-msg, #cf-region-error { font-size: 0.7rem; color: var(--error); min-height: 1em; }

  .cf-presets { display: flex; flex-direction: column; gap: 6px; }
  .cf-preset-btn {
    background: var(--bg); border: 1px solid var(--border);
    color: var(--text); font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem; padding: 7px 12px; border-radius: 4px;
    cursor: pointer; text-align: left; transition: all 0.15s;
    display: flex; justify-content: space-between; align-items: center;
  }
  .cf-preset-btn:hover { border-color: var(--accent); color: var(--accent); }
  .cf-preset-name { color: var(--dim); font-size: 0.65rem; }

  #cf-preset-select {
    width: 100%; background: var(--bg); border: 1px solid var(--border);
    color: var(--accent2); font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem; padding: 8px 10px; border-radius: 4px;
    outline: none; cursor: pointer; transition: border-color 0.2s;
    appearance: none; -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%234a5a64'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 10px center;
  }
  #cf-preset-select:focus { border-color: var(--accent); }
  #cf-preset-select optgroup { color: var(--dim); font-size: 0.65rem; }
  #cf-preset-select option { color: var(--accent2); background: var(--panel); font-size: 0.8rem; }

  #cf-gamma-group.disabled { opacity: 0.4; pointer-events: none; }
  #cf-gamma-group.disabled #cf-gamma-hint { display: block; }
  #cf-gamma-group:not(.disabled) #cf-gamma-hint { display: none; }

  .cf-controls { display: flex; flex-direction: column; gap: 10px; }
  .cf-slider-group { display: flex; flex-direction: column; gap: 4px; }
  .cf-slider-label { display: flex; justify-content: space-between; font-size: 0.68rem; color: var(--dim); }

  input[type="range"] {
    -webkit-appearance: none; width: 100%; height: 2px;
    background: var(--border); border-radius: 2px; outline: none;
  }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none; width: 12px; height: 12px;
    border-radius: 50%; background: var(--accent); cursor: pointer;
  }

  .cf-toggle-row { display: flex; gap: 8px; }
  .cf-toggle-btn {
    flex: 1; background: var(--bg); border: 1px solid var(--border);
    color: var(--dim); font-family: 'JetBrains Mono', monospace;
    font-size: 0.68rem; padding: 6px; border-radius: 4px;
    cursor: pointer; transition: all 0.15s; text-align: center;
  }
  .cf-toggle-btn.active {
    border-color: var(--accent); color: var(--accent);
    background: rgba(74,240,200,0.06);
  }

  #cf-draw-btn {
    background: rgba(74,240,200,0.1); border: 1px solid var(--accent);
    color: var(--accent); font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem; letter-spacing: 0.1em; padding: 10px;
    border-radius: 4px; cursor: pointer; transition: all 0.2s;
    margin-top: auto; flex-shrink: 0;
  }
  #cf-draw-btn:hover { background: rgba(74,240,200,0.2); }

  #cf-right { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  #cf-canvas-wrap { flex: 1; position: relative; overflow: hidden; }
  #cf-canvas { display: block; width: 100%; height: 100%; }

  #cf-legend {
    position: absolute; top: 12px; right: 16px;
    font-size: 0.65rem; color: var(--dim);
    text-align: right; line-height: 1.8; font-family: 'JetBrains Mono', monospace;
  }
  #cf-legend .stream { color: var(--accent); }
  #cf-legend .equip  { color: var(--accent2); }

  #cf-coords {
    position: absolute; bottom: 12px; right: 16px;
    font-size: 0.65rem; color: var(--dim); font-family: 'JetBrains Mono', monospace;
  }

  .cf-clear-btn {
    background: none; border: none; color: var(--dim);
    font-family: 'JetBrains Mono', monospace; font-size: 0.68rem;
    cursor: pointer; padding: 2px 4px; border-radius: 3px; transition: color 0.15s;
  }
  .cf-clear-btn:hover { color: var(--error); }
`;
document.head.appendChild(style);

// ─── Inject HTML ──────────────────────────────────────────────────────────────
document.body.innerHTML = `
<div id="cf-root">
  <header id="cf-header">
    <h1>Complex Potential Flow</h1>
    <span>streamline visualizer</span>
  </header>
  <div id="cf-split">
    <div id="cf-left">

      <div class="cf-input-group">
        <div class="cf-section-label">Preset</div>
        <select id="cf-preset-select">
          <optgroup label="── Basic flows ──">
            <option value="" data-f="z" data-region="">uniform flow</option>
            <option value="" data-f="z^2" data-region="">stagnation flow</option>
            <option value="" data-f="z^3" data-region="">corner flow π/2</option>
            <option value="" data-f="z^(pi/3*3/pi*3)" data-region="">wedge π/3  (w³)</option>
            <option value="" data-f="exp(z)" data-region="">channel flow  (eʷ)</option>
          </optgroup>
          <optgroup label="── Sources / sinks ──">
            <option value="" data-f="log(z)" data-region="">line source  (log z)</option>
            <option value="" data-f="1/z" data-region="">doublet  (1/z)</option>
            <option value="" data-f="log((z-1)/(z+1))" data-region="">source-sink dipole</option>
            <option value="" data-f="z^2 + 2*log(z)" data-region="">source in corner</option>
          </optgroup>
          <optgroup label="── Cylinders &amp; obstacles ──">
            <option value="" data-f="z + 1/z" data-region="x*x+y*y-0.95" data-circ="z" data-circr="1">cylinder  R=1, α=0</option>
            <option value="" data-f="exp(-i*pi/4)*z + 4*exp(i*pi/4)/z" data-region="x*x+y*y-3.85" data-circ="z" data-circr="2">cylinder  R=2, α=π/4</option>
            <option value="" data-f="(5+3*i)/(2*sqrt(2))*z+(-3-5*i)/(2*sqrt(2))*sqrt2(z)" data-region="x*x/6.25+y*y/2.25-0.95" data-circ="gw">ellipse  a=5/2, b=3/2, α=π/4</option>
          </optgroup>
          <optgroup label="── Other ──">
            <option value="" data-f="sin(z)" data-region="">sinusoidal  (sin z)</option>
            <option value="" data-f="cosh(z)" data-region="">hyperbolic  (cosh z)</option>
          </optgroup>
        </select>
      </div>

      <div class="cf-input-group">
        <div class="cf-section-label">Custom potential f(z)</div>
        <div class="cf-input-row" id="cf-input-row">
          <span class="cf-input-prefix">f(z) =</span>
          <input type="text" id="cf-func-input" value="z^2" autocomplete="off" spellcheck="false" />
        </div>
        <div id="cf-error-msg"></div>
      </div>

      <div class="cf-input-group">
        <div class="cf-section-label">Region overlay <span style="font-size:0.6rem;color:var(--dim);text-transform:none;letter-spacing:0">(x,y) — shade where f &lt; 0</span></div>
        <div class="cf-input-row" id="cf-region-row">
          <input type="text" id="cf-region-input" placeholder="e.g. x^2+y^2-1" autocomplete="off" spellcheck="false" />
          <button class="cf-clear-btn" id="cf-region-clear" title="Clear region">✕</button>
        </div>
        <div id="cf-region-error"></div>
      </div>

      <div class="cf-controls">
        <div class="cf-section-label">View</div>
        <div class="cf-slider-group">
          <div class="cf-slider-label"><span>Range</span><span id="cf-range-val">3.0</span></div>
          <input type="range" id="cf-range-slider" min="0.5" max="10" step="0.1" value="3">
        </div>
        <div class="cf-slider-group">
          <div class="cf-slider-label"><span>Streamlines</span><span id="cf-nlines-val">24</span></div>
          <input type="range" id="cf-nlines-slider" min="4" max="60" step="2" value="24">
        </div>
        <div class="cf-toggle-row">
          <button class="cf-toggle-btn active" id="cf-btn-stream">Streamlines</button>
          <button class="cf-toggle-btn active" id="cf-btn-equip">Equipotentials</button>
          <button class="cf-toggle-btn" id="cf-btn-color">Color map</button>
        </div>
      </div>

      <div class="cf-controls">
        <div class="cf-section-label">Physics</div>
        <div class="cf-slider-group" id="cf-gamma-group">
          <div class="cf-slider-label">
            <span id="cf-gamma-label">Circulation Γ</span>
            <span id="cf-gamma-val">0.0</span>
          </div>
          <input type="range" id="cf-gamma-slider" min="-12" max="12" step="0.25" value="0">
          <div id="cf-gamma-hint" style="font-size:0.6rem;color:var(--dim);margin-top:2px;">select a cylinder or ellipse preset to enable</div>
        </div>
      </div>

      <div class="cf-controls">
        <div class="cf-section-label">Vectors &amp; particles</div>
        <div class="cf-toggle-row">
          <button class="cf-toggle-btn" id="cf-btn-vectors">Vector field</button>
          <button class="cf-toggle-btn" id="cf-btn-particles">Particles</button>
        </div>
        <div class="cf-slider-group">
          <div class="cf-slider-label"><span>Particle speed</span><span id="cf-speed-val">1.0</span></div>
          <input type="range" id="cf-speed-slider" min="0.2" max="5" step="0.1" value="1">
        </div>
        <div class="cf-slider-group">
          <div class="cf-slider-label"><span>Particle count</span><span id="cf-pcount-val">120</span></div>
          <input type="range" id="cf-pcount-slider" min="20" max="400" step="10" value="120">
        </div>
        <div class="cf-slider-group">
          <div class="cf-slider-label"><span>Trail length</span><span id="cf-trail-val">18</span></div>
          <input type="range" id="cf-trail-slider" min="1" max="60" step="1" value="18">
        </div>
      </div>

      <button id="cf-draw-btn">▶ PLOT</button>
    </div>

    <div id="cf-right">
      <div id="cf-canvas-wrap">
        <canvas id="cf-canvas"></canvas>
        <div id="cf-legend">
          <div class="stream">— streamlines (Im f = const)</div>
          <div class="equip" id="cf-leg-equip">— equipotentials (Re f = const)</div>
        </div>
        <div id="cf-coords"></div>
      </div>
    </div>
  </div>
</div>
`;

// ─── Complex arithmetic ───────────────────────────────────────────────────────
const C = {
  add: ([ar,ai],[br,bi]) => [ar+br, ai+bi],
  sub: ([ar,ai],[br,bi]) => [ar-br, ai-bi],
  mul: ([ar,ai],[br,bi]) => [ar*br-ai*bi, ar*bi+ai*br],
  div: ([ar,ai],[br,bi]) => { const d=br*br+bi*bi; return [(ar*br+ai*bi)/d,(ai*br-ar*bi)/d]; },
  pow: (z,n) => {
    const r=Math.sqrt(z[0]*z[0]+z[1]*z[1]); if(r===0)return[0,0];
    const theta=Math.atan2(z[1],z[0]), mag=Math.exp(n*Math.log(r));
    return [mag*Math.cos(n*theta), mag*Math.sin(n*theta)];
  },
  powC: (z,w) => {
    const r=Math.sqrt(z[0]*z[0]+z[1]*z[1]); if(r===0)return[0,0];
    const theta=Math.atan2(z[1],z[0]), logz=[Math.log(r),theta];
    const wl=C.mul(w,logz), mag=Math.exp(wl[0]);
    return [mag*Math.cos(wl[1]), mag*Math.sin(wl[1])];
  },
  log: ([a,b]) => [Math.log(Math.sqrt(a*a+b*b)), Math.atan2(b,a)],
  exp: ([a,b]) => { const m=Math.exp(a); return [m*Math.cos(b),m*Math.sin(b)]; },
  sin: ([a,b]) => [Math.sin(a)*Math.cosh(b), Math.cos(a)*Math.sinh(b)],
  cos: ([a,b]) => [Math.cos(a)*Math.cosh(b), -Math.sin(a)*Math.sinh(b)],
  tan: (z) => C.div(C.sin(z),C.cos(z)),
  sinh: ([a,b]) => [Math.sinh(a)*Math.cos(b), Math.cosh(a)*Math.sin(b)],
  cosh: ([a,b]) => [Math.cosh(a)*Math.cos(b), Math.sinh(a)*Math.sin(b)],
  tanh: (z) => C.div(C.sinh(z),C.cosh(z)),
  sqrt: (z) => C.pow(z,0.5),
  sqrt2: (z) => {
    const a = z[0]*z[0]-z[1]*z[1]-4, b = 2*z[0]*z[1];
    const r = Math.sqrt(a*a+b*b);
    const theta = Math.atan2(b,a);
    const mag = Math.sqrt(r);
    const re = mag*Math.cos(theta/2);
    const im = mag*Math.sin(theta/2);
    // choose branch so that Re(conj(z) * sqrt) > 0, i.e. same direction as z
    const dot = z[0]*re + z[1]*im;
    return dot >= 0 ? [re,im] : [-re,-im];
  },
  abs: (z) => [Math.sqrt(z[0]*z[0]+z[1]*z[1]),0],
  re: ([a]) => [a,0],
  im: ([,b]) => [b,0],
  conj: ([a,b]) => [a,-b],
};

// ─── Expression parser ────────────────────────────────────────────────────────
class ComplexParser {
  constructor(expr) { this.tokens = this.tokenize(expr.trim()); this.ti = 0; }

  tokenize(s) {
    const tokens = [];
    let i = 0;
    while(i < s.length) {
      if(/\s/.test(s[i])) { i++; continue; }
      if(/\d/.test(s[i]) || (s[i]==='.'&&/\d/.test(s[i+1]))) {
        let num=''; while(i<s.length&&/[\d.]/.test(s[i]))num+=s[i++];
        tokens.push({type:'num',val:parseFloat(num)});
      } else if(/[a-zA-Z]/.test(s[i])) {
        let id=''; while(i<s.length&&/[a-zA-Z0-9_]/.test(s[i]))id+=s[i++];
        tokens.push({type:'id',val:id});
      } else if(s[i]==='^'||(s[i]==='*'&&s[i+1]==='*')) {
        tokens.push({type:'op',val:'^'}); i+=(s[i]==='*'?2:1);
      } else if('+-*/(),'.includes(s[i])) {
        tokens.push({type:'op',val:s[i++]});
      } else { i++; }
    }
    tokens.push({type:'eof'});
    return tokens;
  }

  peek() { return this.tokens[this.ti]; }
  consume() { return this.tokens[this.ti++]; }
  expect(v) { const t=this.consume(); if(t.val!==v) throw new Error(`Expected '${v}', got '${t.val}'`); }
  parse() { const n=this.parseExpr(); if(this.peek().type!=='eof') throw new Error('Unexpected token: '+this.peek().val); return n; }
  parseExpr() { return this.parseAdd(); }
  parseAdd() {
    let left=this.parseMul();
    while(this.peek().val==='+'||this.peek().val==='-') {
      const op=this.consume().val, right=this.parseMul();
      left={op:op==='+'?'add':'sub',left,right};
    }
    return left;
  }
  parseMul() {
    let left=this.parseUnary();
    while(this.peek().val==='*'||this.peek().val==='/') {
      const op=this.consume().val, right=this.parseUnary();
      left={op:op==='*'?'mul':'div',left,right};
    }
    return left;
  }
  parseUnary() {
    if(this.peek().val==='-'){this.consume();return{op:'neg',arg:this.parsePow()};}
    if(this.peek().val==='+'){this.consume();}
    return this.parsePow();
  }
  parsePow() {
    const base=this.parseAtom();
    if(this.peek().val==='^'){this.consume();return{op:'pow',base,exp:this.parseUnary()};}
    return base;
  }
  parseAtom() {
    const t=this.peek();
    if(t.type==='num'){this.consume();return{op:'num',val:t.val};}
    if(t.type==='id'){
      this.consume();
      const name=t.val.toLowerCase();
      if(name==='z')return{op:'z'};
      if(name==='i')return{op:'num_c',val:[0,1]};
      if(name==='pi')return{op:'num',val:Math.PI};
      if(name==='e'&&this.peek().val!=='(')return{op:'num',val:Math.E};
      if(this.peek().val==='('){
        this.consume();
        const arg=this.parseExpr();
        this.expect(')');
        return{op:'fn',fn:name,arg};
      }
      throw new Error(`Unknown identifier: ${t.val}`);
    }
    if(t.val==='('){this.consume();const e=this.parseExpr();this.expect(')');return e;}
    throw new Error(`Unexpected token: ${t.val}`);
  }
}

function evalNode(node, z) {
  switch(node.op) {
    case 'z':     return z;
    case 'num':   return [node.val, 0];
    case 'num_c': return node.val;
    case 'add':   return C.add(evalNode(node.left,z), evalNode(node.right,z));
    case 'sub':   return C.sub(evalNode(node.left,z), evalNode(node.right,z));
    case 'mul':   return C.mul(evalNode(node.left,z), evalNode(node.right,z));
    case 'div':   return C.div(evalNode(node.left,z), evalNode(node.right,z));
    case 'neg':   return C.mul([-1,0], evalNode(node.arg,z));
    case 'pow': {
      const b=evalNode(node.base,z), e=evalNode(node.exp,z);
      return e[1]===0 ? C.pow(b,e[0]) : C.powC(b,e);
    }
    case 'fn': {
      const a=evalNode(node.arg,z), fn=node.fn;
      if(C[fn]) return C[fn](a);
      throw new Error(`Unknown function: ${fn}`);
    }
    default: throw new Error(`Unknown op: ${node.op}`);
  }
}

function compileFn(expr) {
  const ast = new ComplexParser(expr).parse();
  return z => evalNode(ast, z);
}

// ─── Canvas & state ───────────────────────────────────────────────────────────
const canvas = document.getElementById('cf-canvas');
const ctx = canvas.getContext('2d');

let showStream=true, showEquip=true, showColor=false;
let showVectors=false, showParticles=false;
let regionFn = null;
let currentF = null;   // compiled complex potential, kept for animation
let currentRange = 3;
let animFrameId = null;
let circMode = null;  // null | 'z' | 'gw'

// ─── Region helpers ───────────────────────────────────────────────────────────
function compileRegion(expr) {
  if (!expr.trim()) return null;
  const s = expr.replace(/\^/g, '**');
  const fn = new Function('x', 'y', `"use strict"; return (${s});`);
  fn(0, 0);
  return fn;
}

function inRegion(x, y) {
  if (!regionFn) return false;
  try { return regionFn(x, y) < 0; } catch(e) { return false; }
}

// ─── Velocity from f (complex derivative df/dz numerically) ──────────────────
// w = df/dz = u - iv  =>  u = Re(w), v = -Im(w)
function velocity(f, x, y) {
  const h = 1e-4;
  try {
    const fz1 = f([x+h, y]);
    const fz0 = f([x,   y]);
    const dwRe = (fz1[0]-fz0[0])/h;
    const dwIm = (fz1[1]-fz0[1])/h;
    return [dwRe, -dwIm]; // (u, v)
  } catch(e) { return [0,0]; }
}

// ─── Draw region overlay ──────────────────────────────────────────────────────
function drawRegionOverlay(W, H, range) {
  if (!regionFn) return;
  const tmp = document.createElement('canvas');
  tmp.width = W; tmp.height = H;
  const tc = tmp.getContext('2d');
  const img = tc.createImageData(W, H);
  const d = img.data;
  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const x = (px/W - 0.5)*2*range;
      const y = -((py/H - 0.5)*2*range);
      if (inRegion(x, y)) {
        const i = (py*W+px)*4;
        d[i]=22; d[i+1]=28; d[i+2]=32; d[i+3]=195;
      }
    }
  }
  tc.putImageData(img, 0, 0);
  ctx.drawImage(tmp, 0, 0);
}

// ─── Vector field ─────────────────────────────────────────────────────────────
function drawVectorField(f, W, H, range) {
  const COLS = 22, ROWS = 16;
  const dx = W/COLS, dy = H/ROWS;
  const maxArrow = Math.min(dx, dy) * 0.42;

  // collect all speeds to normalize
  const vecs = [];
  let maxSpd = 0;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const px = (col+0.5)*dx, py = (row+0.5)*dy;
      const x = (px/W-0.5)*2*range;
      const y = -((py/H-0.5)*2*range);
      if (inRegion(x,y)) { vecs.push(null); continue; }
      const [u,v] = velocity(f, x, y);
      const spd = Math.sqrt(u*u+v*v);
      if (spd > maxSpd) maxSpd = spd;
      vecs.push({px, py, u, v, spd});
    }
  }

  ctx.save();
  for (const vec of vecs) {
    if (!vec) continue;
    const {px, py, u, v, spd} = vec;
    if (!isFinite(spd) || spd < 1e-10) continue;
    const len = Math.min(1, spd/maxSpd) * maxArrow;
    // scale math velocity to canvas pixels, accounting for aspect ratio
    const sx = u * W/(2*range);
    const sy = -v * H/(2*range);
    const slen = Math.sqrt(sx*sx+sy*sy);
    const ex = px + (sx/slen)*len;
    const ey = py + (sy/slen)*len;
    const t = Math.min(1, spd/maxSpd);
    // color from dim teal to bright teal
    const r = Math.round(20 + t*54);
    const g = Math.round(80 + t*160);
    const b = Math.round(80 + t*120);
    ctx.strokeStyle = `rgb(${r},${g},${b})`;
    ctx.lineWidth = devicePixelRatio * 1.0;
    ctx.globalAlpha = 0.55 + 0.4*t;

    // shaft
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    // arrowhead
    const ang = Math.atan2(ey-py, ex-px);
    const hs = Math.max(3, len*0.32);
    ctx.beginPath();
    ctx.moveTo(ex - hs*Math.cos(ang-0.4), ey - hs*Math.sin(ang-0.4));
    ctx.lineTo(ex, ey);
    ctx.lineTo(ex - hs*Math.cos(ang+0.4), ey - hs*Math.sin(ang+0.4));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ─── Particle system ──────────────────────────────────────────────────────────
function getTrailLen() { const el=document.getElementById("cf-trail-slider"); return el?parseInt(el.value):18; }
let particles = [];

function initParticles(count, range) {
  particles = [];
  for (let i = 0; i < count; i++) {
    particles.push(makeParticle(range));
  }
}

function makeParticle(range) {
  // store position in math coords (x right, y up)
  const _r = range || currentRange || 3;
  return {
    mx: (Math.random()-0.5)*2*_r,
    my: (Math.random()-0.5)*2*_r,
    trail: [],
    age: Math.floor(Math.random() * 60),
    maxAge: 60 + Math.floor(Math.random() * 80),
  };
}

function stepParticles(f, W, H, range, speedMult) {
  // Work entirely in math coords (x: right, y: up).
  const dt = 0.06 * speedMult;

  for (const p of particles) {
    p.age++;
    if (p.age > p.maxAge) { Object.assign(p, makeParticle(range)); continue; }

    const mx = p.mx, my = p.my;
    if (inRegion(mx, my)) { Object.assign(p, makeParticle(range)); continue; }

    // push canvas-coord position into trail
    const px =  (mx / (2*range) + 0.5) * W;
    const py = (-my / (2*range) + 0.5) * H;
    p.trail.push([px, py]);
    if (p.trail.length > getTrailLen()) p.trail.shift();

    // velocity at current math position
    const [u, v] = velocity(f, mx, my);
    if (!isFinite(u) || !isFinite(v)) { Object.assign(p, makeParticle(range)); continue; }
    const spd = Math.sqrt(u*u + v*v);
    if (spd < 1e-10) { p.age = p.maxAge; continue; }

    // RK2 step in math coords
    const k = dt / spd;
    const mx2 = mx + k*u, my2 = my + k*v;
    const [u2, v2] = velocity(f, mx2, my2);
    const spd2 = Math.sqrt(u2*u2 + v2*v2);
    if (!isFinite(spd2) || spd2 < 1e-10) { Object.assign(p, makeParticle(range)); continue; }

    p.mx += 0.5*dt*(u/spd + u2/spd2);
    p.my += 0.5*dt*(v/spd + v2/spd2);

    // recycle if out of view
    if (Math.abs(p.mx) > range*1.05 || Math.abs(p.my) > range*1.05) {
      Object.assign(p, makeParticle(range));
    }
  }
}

function drawParticles() {
  ctx.save();
  for (const p of particles) {
    if (p.trail.length < 2) continue;
    const fade = Math.min(1, p.age / 20);
    for (let i = 1; i < p.trail.length; i++) {
      const t = i / p.trail.length;
      ctx.globalAlpha = t * fade * 0.85;
      ctx.strokeStyle = '#4af0c8';
      ctx.lineWidth = devicePixelRatio * (0.8 + t*0.8);
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(p.trail[i-1][0], p.trail[i-1][1]);
      ctx.lineTo(p.trail[i][0],   p.trail[i][1]);
      ctx.stroke();
    }
    // dot at head
    if (p.trail.length > 0) {
      const [hx, hy] = p.trail[p.trail.length-1];
      ctx.globalAlpha = fade * 0.9;
      ctx.fillStyle = '#4af0c8';
      ctx.beginPath();
      ctx.arc(hx, hy, devicePixelRatio*1.5, 0, Math.PI*2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ─── Static draw (level curves etc) ──────────────────────────────────────────
function resizeCanvas() {
  const wrap = canvas.parentElement;
  canvas.width  = wrap.clientWidth  * devicePixelRatio;
  canvas.height = wrap.clientHeight * devicePixelRatio;
  canvas.style.width  = wrap.clientWidth  + 'px';
  canvas.style.height = wrap.clientHeight + 'px';
}

// Cached static layer (streamlines, axes, region) drawn to an offscreen canvas
let staticCache = null;

function buildStaticCache(f, W, H, range, nlines) {
  const oc = document.createElement('canvas');
  oc.width = W; oc.height = H;
  const oc_ctx = oc.getContext('2d');

  oc_ctx.fillStyle='#0a0c0f';
  oc_ctx.fillRect(0,0,W,H);

  const GRID=400;
  const imVals=new Float32Array(GRID*GRID);
  const reVals=new Float32Array(GRID*GRID);
  let imMin=Infinity,imMax=-Infinity,reMin=Infinity,reMax=-Infinity;

  for(let iy=0;iy<GRID;iy++){
    for(let ix=0;ix<GRID;ix++){
      const x=(ix/(GRID-1)-0.5)*2*range;
      const y=-((iy/(GRID-1)-0.5)*2*range);
      let fz; try{fz=f([x,y]);}catch(e){fz=[NaN,NaN];}
      const im=fz[1],re=fz[0];
      imVals[iy*GRID+ix]=im; reVals[iy*GRID+ix]=re;
      if(isFinite(im)){if(im<imMin)imMin=im;if(im>imMax)imMax=im;}
      if(isFinite(re)){if(re<reMin)reMin=re;if(re>reMax)reMax=re;}
    }
  }

  if(showColor){
    const img=oc_ctx.createImageData(W,H);
    for(let py=0;py<H;py++){
      for(let px=0;px<W;px++){
        const x=(px/W-0.5)*2*range, y=-((py/H-0.5)*2*range);
        let fz; try{fz=f([x,y]);}catch(e){fz=[0,0];}
        const t=(fz[1]-imMin)/(imMax-imMin+1e-10);
        const i=(py*W+px)*4;
        img.data[i]=5+t*20; img.data[i+1]=20+t*40; img.data[i+2]=25+t*50; img.data[i+3]=255;
      }
    }
    oc_ctx.putImageData(img,0,0);
  }

  // draw axes onto oc_ctx
  drawAxesTo(oc_ctx, W, H, range);

  // draw level curves, clipped to exterior of obstacle if region is defined
  if (regionFn) {
    // build clip path: scan boundary pixels of region and use as clip
    oc_ctx.save();
    oc_ctx.beginPath();
    // add full canvas rect then subtract obstacle via even-odd rule
    oc_ctx.rect(0, 0, W, H);
    // trace obstacle boundary at reduced resolution for clip path
    const CS = 4; // clip step in pixels
    let inPrev = false;
    for (let py = 0; py < H; py += CS) {
      for (let px = 0; px < W; px += CS) {
        const x = (px/W-0.5)*2*range, y = -((py/H-0.5)*2*range);
        const inNow = inRegion(x, y);
        if (inNow && !inPrev) oc_ctx.moveTo(px, py);
        if (inNow) oc_ctx.lineTo(px+CS, py);
        inPrev = inNow;
      }
      inPrev = false;
    }
    oc_ctx.clip('evenodd');
  }

  if(showStream) {
    drawLevelCurvesTo(oc_ctx, imVals,GRID,W,H,imMin,imMax,nlines,'#4af0c8',0.85,[]);
    if(circMode) {
      drawLevelCurvesTo(oc_ctx, imVals,GRID,W,H,imMin,imMax,0,'#4af0c8',1.0,[0]);
    }
  }
  if(showEquip) drawLevelCurvesTo(oc_ctx, reVals,GRID,W,H,reMin,reMax,nlines,'#f0a44a',0.5,[]);

  if (regionFn) oc_ctx.restore();

  // region overlay on top to cover any boundary artifacts
  if (regionFn) {
    const tmp = document.createElement('canvas');
    tmp.width = W; tmp.height = H;
    const tc = tmp.getContext('2d');
    const img = tc.createImageData(W, H);
    const d = img.data;
    for (let py=0; py<H; py++) for (let px=0; px<W; px++) {
      const x=(px/W-0.5)*2*range, y=-((py/H-0.5)*2*range);
      if (inRegion(x,y)) {
        const i=(py*W+px)*4;
        d[i]=22; d[i+1]=28; d[i+2]=32; d[i+3]=255;
      }
    }
    tc.putImageData(img,0,0);
    oc_ctx.drawImage(tmp,0,0);
  }

  return oc;
}

function draw() {
  stopAnimation();
  resizeCanvas();
  const expr   = document.getElementById('cf-func-input').value.trim();
  const errEl  = document.getElementById('cf-error-msg');
  const rowEl  = document.getElementById('cf-input-row');
  let f;
  try {
    f = compileFn(expr);
    f([1,0]);
    errEl.textContent = '';
    rowEl.classList.remove('error');
  } catch(e) {
    errEl.textContent = '⚠ ' + e.message;
    rowEl.classList.add('error');
    return;
  }

  // wrap with circulation term if Gamma != 0 and circMode is set
  const gamma = parseFloat(document.getElementById('cf-gamma-slider').value);
  if (circMode && gamma !== 0) {
    const baseF = f;
    const scale = -gamma / (2 * Math.PI); // coefficient of i*Log(...)
    f = (z) => {
      const base = baseF(z);
      // compute log argument depending on mode
      let logArg;
      if (circMode === 'z') {
        // normalize by R so Im(log(z/R)) = 0 on |z|=R boundary
        const R = parseFloat(document.getElementById('cf-preset-select')
          .options[document.getElementById('cf-preset-select').selectedIndex]
          .dataset.circr || '1');
        logArg = C.div(z, [R, 0]);
      } else {
        // circMode === 'gw': log(g(w)/R) where g(w) = (w + sqrt2(w))/2, R=2
        const sw = C.sqrt2(z);
        const gw = C.mul([0.5, 0], C.add(z, sw));
        logArg = C.div(gw, [2, 0]);
      }
      // -i*Gamma/(2pi) * Log(logArg) = scale * i * Log(logArg)
      const logVal = C.log(logArg);
      // multiply by i*scale: i*scale * (a+ib) = (-scale*b, scale*a)
      const circ = [-scale * logVal[1], scale * logVal[0]];
      return C.add(base, circ);
    };
  }

  currentF = f;
  currentRange = parseFloat(document.getElementById('cf-range-slider').value);
  const nlines = parseInt(document.getElementById('cf-nlines-slider').value);
  const W = canvas.width, H = canvas.height;

  staticCache = buildStaticCache(f, W, H, currentRange, nlines);

  ctx.clearRect(0,0,W,H);
  ctx.drawImage(staticCache, 0, 0);

  if (showVectors) drawVectorField(f, W, H, currentRange);

  if (showParticles) {
    const count = parseInt(document.getElementById('cf-pcount-slider').value);
    initParticles(count, currentRange);
    startAnimation();
  }
}

// ─── Animation loop ───────────────────────────────────────────────────────────
function startAnimation() {
  if (animFrameId) return;
  function frame() {
    if (!currentF || !showParticles) { animFrameId = null; return; }
    const W = canvas.width, H = canvas.height;
    const speed = parseFloat(document.getElementById('cf-speed-slider').value);

    // restore static layer
    ctx.clearRect(0,0,W,H);
    if (staticCache) ctx.drawImage(staticCache, 0, 0);
    if (showVectors) drawVectorField(currentF, W, H, currentRange);

    stepParticles(currentF, W, H, currentRange, speed);
    drawParticles();

    animFrameId = requestAnimationFrame(frame);
  }
  animFrameId = requestAnimationFrame(frame);
}

function stopAnimation() {
  if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
  particles = [];
}

// ─── Axis / curve helpers that accept a context argument ─────────────────────
function drawAxesTo(c, W, H, range) {
  const cx=W/2, cy=H/2, sx=W/(2*range), sy=H/(2*range);
  c.save();
  const step=niceStep(range);
  c.strokeStyle='#1e2428'; c.lineWidth=1; c.setLineDash([1,4]);
  for(let v=-range;v<=range;v+=step){
    const px=cx+v*sx, py=cy-v*sy;
    c.beginPath();c.moveTo(px,0);c.lineTo(px,H);c.stroke();
    c.beginPath();c.moveTo(0,py);c.lineTo(W,py);c.stroke();
  }
  c.setLineDash([]);
  c.strokeStyle='#2e3c44'; c.lineWidth=1.5;
  c.beginPath();c.moveTo(cx,0);c.lineTo(cx,H);c.stroke();
  c.beginPath();c.moveTo(0,cy);c.lineTo(W,cy);c.stroke();
  c.fillStyle='#3a4e58';
  c.font=`${10*devicePixelRatio}px JetBrains Mono,monospace`;
  c.textAlign='center';
  for(let v=-range+step;v<range;v+=step){
    if(Math.abs(v)<step*0.1)continue;
    const px=cx+v*sx, py=cy+v*sy;
    c.fillText(fmt(v),px,cy+14*devicePixelRatio);
    c.textAlign='right';
    c.fillText(fmt(v)+'i',cx-6*devicePixelRatio,py+4*devicePixelRatio);
    c.textAlign='center';
  }
  c.restore();
}

function drawLevelCurvesTo(c, vals,N,W,H,vmin,vmax,nlines,color,alpha,extraLevels){
  c.save();
  // build list of levels to draw
  const levels = [];
  for(let k=1;k<nlines;k++) levels.push(vmin+(vmax-vmin)*k/nlines);
  if(extraLevels) for(const lv of extraLevels) levels.push(lv);

  for(const level of levels){
    const isExtra = extraLevels && extraLevels.includes(level);
    c.strokeStyle = color;
    c.lineWidth = devicePixelRatio * (isExtra ? 2.2 : 1.2);
    c.globalAlpha = isExtra ? 1.0 : alpha;
    c.beginPath();
    for(let iy=0;iy<N-1;iy++){
      for(let ix=0;ix<N-1;ix++){
        const v00=vals[iy*N+ix],v10=vals[iy*N+ix+1],v01=vals[(iy+1)*N+ix],v11=vals[(iy+1)*N+ix+1];
        if(!isFinite(v00)||!isFinite(v10)||!isFinite(v01)||!isFinite(v11))continue;
        for(const s of msSegs(v00,v10,v01,v11,level,ix,iy,N,W,H)){
          c.moveTo(s[0],s[1]); c.lineTo(s[2],s[3]);
        }
      }
    }
    c.stroke();
  }
  c.restore();
}

function niceStep(r){
  const raw=r/3, pow=Math.pow(10,Math.floor(Math.log10(raw))), f=raw/pow;
  return f<1.5?pow:f<3.5?2*pow:f<7.5?5*pow:10*pow;
}
function fmt(v){
  if(Math.abs(v)<1e-10)return'0';
  return Number.isInteger(v)?String(v):v.toFixed(1);
}

function msSegs(v00,v10,v01,v11,lv,ix,iy,N,W,H){
  const b=v=>v>=lv?1:0;
  const ci=b(v00)*8+b(v10)*4+b(v11)*2+b(v01);
  if(ci===0||ci===15)return[];
  const x0=ix/N*W,x1=(ix+1)/N*W,y0=iy/N*H,y1=(iy+1)/N*H;
  const l=(a,b,va,vb)=>a+(b-a)*(lv-va)/(vb-va);
  const T=()=>[l(x0,x1,v00,v10),y0], B=()=>[l(x0,x1,v01,v11),y1];
  const L=()=>[x0,l(y0,y1,v00,v01)], R=()=>[x1,l(y0,y1,v10,v11)];
  const s=(a,b)=>[...a,...b];
  switch(ci){
    case 1:return[s(L(),B())]; case 2:return[s(B(),R())]; case 3:return[s(L(),R())];
    case 4:return[s(T(),R())]; case 5:return[s(T(),R()),s(L(),B())]; case 6:return[s(T(),B())];
    case 7:return[s(T(),L())]; case 8:return[s(T(),L())]; case 9:return[s(T(),B())];
    case 10:return[s(T(),L()),s(B(),R())]; case 11:return[s(T(),R())];
    case 12:return[s(L(),R())]; case 13:return[s(B(),R())]; case 14:return[s(L(),B())];
    default:return[];
  }
}

// ─── Region input wiring ──────────────────────────────────────────────────────
function applyRegion() {
  const expr = document.getElementById('cf-region-input').value.trim();
  const errEl = document.getElementById('cf-region-error');
  const rowEl = document.getElementById('cf-region-row');
  if (!expr) {
    regionFn = null;
    errEl.textContent = '';
    rowEl.classList.remove('error');
    draw();
    return;
  }
  try {
    regionFn = compileRegion(expr);
    errEl.textContent = '';
    rowEl.classList.remove('error');
  } catch(e) {
    regionFn = null;
    errEl.textContent = '⚠ ' + e.message.replace(/.*:/,'').trim();
    rowEl.classList.add('error');
  }
  draw();
}

document.getElementById('cf-region-input').addEventListener('keydown', e => { if(e.key==='Enter') applyRegion(); });
document.getElementById('cf-region-input').addEventListener('blur', applyRegion);
document.getElementById('cf-region-clear').addEventListener('click', () => {
  document.getElementById('cf-region-input').value = '';
  applyRegion();
});

// ─── UI wiring ────────────────────────────────────────────────────────────────
document.getElementById('cf-draw-btn').addEventListener('click', draw);
document.getElementById('cf-func-input').addEventListener('keydown', e => { if(e.key==='Enter')draw(); });

document.getElementById('cf-range-slider').addEventListener('input', function(){
  document.getElementById('cf-range-val').textContent = parseFloat(this.value).toFixed(1);
  draw();
});
document.getElementById('cf-nlines-slider').addEventListener('input', function(){
  document.getElementById('cf-nlines-val').textContent = this.value;
  draw();
});
document.getElementById('cf-gamma-slider').addEventListener('input', function(){
  document.getElementById('cf-gamma-val').textContent = parseFloat(this.value).toFixed(1);
  draw();
});

// initialize gamma group state
document.getElementById('cf-gamma-group').classList.add('disabled');

document.getElementById('cf-preset-select').addEventListener('change', function(){
  const opt = this.options[this.selectedIndex];
  const f = opt.dataset.f;
  const region = opt.dataset.region || '';
  const circ = opt.dataset.circ || null;
  if (!f) return;
  document.getElementById('cf-func-input').value = f;
  document.getElementById('cf-region-input').value = region;
  circMode = circ;
  // reset gamma
  document.getElementById('cf-gamma-slider').value = 0;
  document.getElementById('cf-gamma-val').textContent = '0.0';
  // enable/disable gamma group
  const gammaGroup = document.getElementById('cf-gamma-group');
  if (circMode) {
    gammaGroup.classList.remove('disabled');
  } else {
    gammaGroup.classList.add('disabled');
  }
  applyRegion();
  draw();
});

document.getElementById('cf-btn-stream').addEventListener('click', function(){
  showStream=this.classList.toggle('active');
  draw();
});
document.getElementById('cf-btn-equip').addEventListener('click', function(){
  showEquip=this.classList.toggle('active');
  document.getElementById('cf-leg-equip').style.opacity=showEquip?'1':'0.3';
  draw();
});
document.getElementById('cf-btn-color').addEventListener('click', function(){
  showColor=this.classList.toggle('active');
  draw();
});

document.getElementById('cf-btn-vectors').addEventListener('click', function(){
  showVectors=this.classList.toggle('active');
  if (!showParticles) {
    // just redraw static + vectors, no animation needed
    if (currentF && staticCache) {
      const W=canvas.width, H=canvas.height;
      ctx.clearRect(0,0,W,H);
      ctx.drawImage(staticCache,0,0);
      if (showVectors) drawVectorField(currentF, W, H, currentRange);
    } else { draw(); }
  }
});

document.getElementById('cf-btn-particles').addEventListener('click', function(){
  showParticles=this.classList.toggle('active');
  if (showParticles) {
    if (!currentF) { draw(); return; }
    const count = parseInt(document.getElementById('cf-pcount-slider').value);
    initParticles(count, currentRange);
    startAnimation();
  } else {
    stopAnimation();
    // restore static view
    if (staticCache) {
      const W=canvas.width, H=canvas.height;
      ctx.clearRect(0,0,W,H);
      ctx.drawImage(staticCache,0,0);
      if (showVectors) drawVectorField(currentF, W, H, currentRange);
    }
  }
});

document.getElementById('cf-speed-slider').addEventListener('input', function(){
  document.getElementById('cf-speed-val').textContent = parseFloat(this.value).toFixed(1);
});
document.getElementById('cf-pcount-slider').addEventListener('input', function(){
  document.getElementById('cf-pcount-val').textContent = this.value;
  if (showParticles && currentF) {
    initParticles(parseInt(this.value), currentRange);
  }
});
document.getElementById('cf-trail-slider').addEventListener('input', function(){
  document.getElementById('cf-trail-val').textContent = this.value;
  // trim existing trails immediately to new length
  const len = parseInt(this.value);
  for (const p of particles) {
    if (p.trail.length > len) p.trail.splice(0, p.trail.length - len);
  }
});

canvas.addEventListener('mousemove', function(e){
  const r=canvas.getBoundingClientRect();
  const range=parseFloat(document.getElementById('cf-range-slider').value);
  const x=((e.clientX-r.left)/r.width-0.5)*2*range;
  const y=-(((e.clientY-r.top)/r.height-0.5)*2*range);
  document.getElementById('cf-coords').textContent =
    `z = ${x>=0?'+':''}${x.toFixed(3)} ${y>=0?'+':''}${y.toFixed(3)}i`;
});

window.addEventListener('resize', draw);
setTimeout(draw, 100);

})();
