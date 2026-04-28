// complexFlow.js — Complex Potential Flow Visualizer
// Drop this file next to index.html and add: <script src="complexFlow.js"></script>

(function () {

// ─── Inject styles ────────────────────────────────────────────────────────────
const style = document.createElement('style');
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&family=Fraunces:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0c0f;
    --bg-elev: #0d1014;
    --panel: #0f1215;
    --border: #1e2428;
    --border-soft: #161a1e;
    --accent: #4af0c8;
    --accent-soft: rgba(74,240,200,0.08);
    --accent2: #f0a44a;
    --text: #c8d4dc;
    --dim: #4a5a64;
    --dim-2: #6b7a82;
    --error: #f05a4a;
  }

  html, body {
    background: var(--bg);
    color: var(--text);
    font-family: 'JetBrains Mono', monospace;
    height: 100%;
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
  }

  #cf-root { display: flex; flex-direction: column; height: 100vh; }

  #cf-header {
    padding: 14px 24px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: baseline; gap: 16px; flex-shrink: 0;
    background: linear-gradient(180deg, var(--bg-elev), var(--bg));
  }
  #cf-header h1 {
    font-family: 'Fraunces', serif; font-weight: 400;
    font-size: 1.15rem; letter-spacing: 0.04em; color: var(--accent);
  }
  #cf-header span {
    font-size: 0.68rem; color: var(--dim);
    letter-spacing: 0.18em; text-transform: uppercase;
  }

  #cf-split { display: flex; flex: 1; overflow: hidden; }

  #cf-left {
    width: 320px; flex-shrink: 0;
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    padding: 22px 20px; gap: 18px;
    background: var(--panel);
    overflow-y: auto; overflow-x: hidden;
  }
  #cf-left::-webkit-scrollbar { width: 6px; }
  #cf-left::-webkit-scrollbar-track { background: transparent; }
  #cf-left::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  #cf-left::-webkit-scrollbar-thumb:hover { background: var(--dim); }

  .cf-section-label {
    font-size: 0.62rem; letter-spacing: 0.18em;
    text-transform: uppercase; color: var(--dim-2); margin-bottom: 6px;
  }
  .cf-input-group { display: flex; flex-direction: column; gap: 6px; }
  .cf-input-row {
    display: flex; align-items: center; gap: 8px;
    background: var(--bg); border: 1px solid var(--border);
    border-radius: 5px; padding: 9px 12px;
    transition: border-color 0.18s, box-shadow 0.18s;
  }
  .cf-input-row:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }
  .cf-input-row.error {
    border-color: var(--error);
    box-shadow: 0 0 0 3px rgba(240,90,74,0.08);
  }
  .cf-input-prefix { font-size: 0.75rem; color: var(--dim-2); white-space: nowrap; }

  #cf-func-input, #cf-region-input {
    background: none; border: none; outline: none;
    color: var(--accent2); font-family: 'JetBrains Mono', monospace;
    font-size: 0.92rem; flex: 1; min-width: 0;
  }
  #cf-region-input { color: var(--text); font-size: 0.82rem; }
  #cf-region-input::placeholder { color: var(--dim); }

  #cf-error-msg, #cf-region-error { font-size: 0.7rem; color: var(--error); min-height: 1em; }

  #cf-preset-select {
    width: 100%; background: var(--bg); border: 1px solid var(--border);
    color: var(--accent2); font-family: 'JetBrains Mono', monospace;
    font-size: 0.82rem; padding: 9px 32px 9px 12px; border-radius: 5px;
    outline: none; cursor: pointer;
    transition: border-color 0.18s, box-shadow 0.18s;
    appearance: none; -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%234a5a64'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 12px center;
  }
  #cf-preset-select:hover { border-color: var(--dim); }
  #cf-preset-select:focus {
    border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft);
  }
  #cf-preset-select optgroup { color: var(--dim); font-size: 0.65rem; }
  #cf-preset-select option { color: var(--accent2); background: var(--panel); font-size: 0.8rem; }

  #cf-gamma-group.disabled { opacity: 0.4; pointer-events: none; }
  #cf-gamma-group.disabled #cf-gamma-hint { display: block; }
  #cf-gamma-group:not(.disabled) #cf-gamma-hint { display: none; }

  #cf-gamma-val[contenteditable] {
    cursor: text; border-bottom: 1px dashed var(--dim);
    padding: 0 3px; border-radius: 2px; min-width: 2.4em; text-align: right;
    outline: none; transition: border-color 0.15s, color 0.15s, background 0.15s;
    font-feature-settings: 'tnum';
  }
  #cf-gamma-val[contenteditable]:hover { border-bottom-color: var(--dim-2); color: var(--text); }
  #cf-gamma-val[contenteditable]:focus {
    border-bottom-color: var(--accent); color: var(--accent);
    background: var(--accent-soft);
  }

  .cf-controls { display: flex; flex-direction: column; gap: 12px; }
  .cf-slider-group { display: flex; flex-direction: column; gap: 6px; }
  .cf-slider-label {
    display: flex; justify-content: space-between;
    font-size: 0.7rem; color: var(--dim-2);
  }
  .cf-slider-label span:last-child {
    color: var(--text); font-feature-settings: 'tnum';
  }

  input[type="range"] {
    -webkit-appearance: none; width: 100%; height: 3px;
    background: var(--border); border-radius: 2px; outline: none;
    cursor: pointer;
  }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none; width: 14px; height: 14px;
    border-radius: 50%; background: var(--accent); cursor: pointer;
    box-shadow: 0 0 0 0 var(--accent-soft);
    transition: box-shadow 0.15s, transform 0.1s;
  }
  input[type="range"]::-webkit-slider-thumb:hover { box-shadow: 0 0 0 6px var(--accent-soft); }
  input[type="range"]::-webkit-slider-thumb:active { transform: scale(1.1); }
  input[type="range"]::-moz-range-thumb {
    width: 14px; height: 14px; border-radius: 50%;
    background: var(--accent); border: none; cursor: pointer;
  }

  .cf-toggle-row { display: flex; gap: 6px; }
  .cf-toggle-btn {
    flex: 1; background: var(--bg); border: 1px solid var(--border);
    color: var(--dim-2); font-family: 'JetBrains Mono', monospace;
    font-size: 0.68rem; padding: 7px 6px; border-radius: 4px;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s, background 0.15s;
    text-align: center; letter-spacing: 0.02em;
  }
  .cf-toggle-btn:hover { color: var(--text); border-color: var(--dim); }
  .cf-toggle-btn.active {
    border-color: var(--accent); color: var(--accent); background: var(--accent-soft);
  }

  #cf-kutta-btn {
    background: var(--accent-soft); border: 1px solid var(--accent);
    color: var(--accent); font-family: 'JetBrains Mono', monospace;
    font-size: 0.74rem; padding: 8px; border-radius: 4px; cursor: pointer;
    transition: background 0.15s, transform 0.05s; letter-spacing: 0.05em;
  }
  #cf-kutta-btn:hover { background: rgba(74,240,200,0.18); }
  #cf-kutta-btn:active { transform: translateY(1px); }

  #cf-draw-btn {
    background: var(--accent-soft); border: 1px solid var(--accent);
    color: var(--accent); font-family: 'JetBrains Mono', monospace;
    font-size: 0.78rem; letter-spacing: 0.18em; padding: 11px;
    border-radius: 5px; cursor: pointer;
    transition: background 0.18s, transform 0.05s;
    margin-top: auto; flex-shrink: 0;
  }
  #cf-draw-btn:hover { background: rgba(74,240,200,0.18); }
  #cf-draw-btn:active { transform: translateY(1px); }

  #cf-right { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  #cf-canvas-wrap { flex: 1; position: relative; overflow: hidden; }
  #cf-canvas { display: block; width: 100%; height: 100%; cursor: crosshair; }

  #cf-legend {
    position: absolute; top: 14px; right: 18px;
    font-size: 0.66rem; color: var(--dim-2);
    text-align: right; line-height: 1.9;
    font-family: 'JetBrains Mono', monospace;
    pointer-events: none;
    background: rgba(10,12,15,0.55);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    padding: 7px 11px; border-radius: 4px;
    border: 1px solid var(--border-soft);
  }
  #cf-legend .stream { color: var(--accent); }
  #cf-legend .equip  { color: var(--accent2); }

  #cf-coords {
    position: absolute; bottom: 14px; right: 18px;
    font-size: 0.7rem; color: var(--text);
    font-family: 'JetBrains Mono', monospace;
    background: rgba(10,12,15,0.6);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    padding: 8px 12px; border-radius: 4px;
    border: 1px solid var(--border-soft);
    line-height: 1.65; pointer-events: none;
    min-width: 195px;
  }
  #cf-coords .label { color: var(--dim-2); }
  #cf-coords .val   { font-feature-settings: 'tnum'; }

  .cf-clear-btn {
    background: none; border: none; color: var(--dim);
    font-family: 'JetBrains Mono', monospace; font-size: 0.74rem;
    cursor: pointer; padding: 2px 5px; border-radius: 3px;
    transition: color 0.15s, background 0.15s;
  }
  .cf-clear-btn:hover { color: var(--error); background: rgba(240,90,74,0.08); }
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
            <option value="" data-f="z^2" data-region="">stagnation flow  (π/2 corner)</option>
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
            <option value="" data-f="(z - i*sqrt2(z))/sqrt(2)" data-region="" data-circ="gw" data-circr="1">flat plate  α=π/4</option>
            <option value="" data-f="(5+3*i)/(2*sqrt(2))*z+(-3-5*i)/(2*sqrt(2))*sqrt2(z)" data-region="x*x/6.25+y*y/2.25-0.95" data-circ="gw" data-circr="2">ellipse  a=5/2, b=3/2, α=π/4</option>
          </optgroup>
          <optgroup label="── Other ──">
            <option value="" data-f="sin(z)" data-region="">sinusoidal  (sin z)</option>
            <option value="" data-f="cosh(z)" data-region="">hyperbolic  (cosh z)</option>
          </optgroup>
        </select>
      </div>

      <div id="cf-joukowski-controls" style="display:none; flex-direction:column; gap:10px;">
        <div class="cf-section-label">Joukowski airfoil</div>
        <div class="cf-slider-group">
          <div class="cf-slider-label"><span>R (radius)</span><span id="cf-jR-val">1.0</span></div>
          <input type="range" id="cf-jR-slider" min="0.5" max="2" step="0.05" value="1">
        </div>
        <div class="cf-slider-group">
          <div class="cf-slider-label"><span>a (thickness)</span><span id="cf-ja-val">0.10</span></div>
          <input type="range" id="cf-ja-slider" min="0" max="0.4" step="0.01" value="0.1">
        </div>
        <div class="cf-slider-group">
          <div class="cf-slider-label"><span>b (camber)</span><span id="cf-jb-val">0.10</span></div>
          <input type="range" id="cf-jb-slider" min="0" max="0.4" step="0.01" value="0.1">
        </div>
        <div class="cf-slider-group">
          <div class="cf-slider-label"><span>α (angle of attack)</span><span id="cf-jalpha-val">0.10</span></div>
          <input type="range" id="cf-jalpha-slider" min="-0.5" max="0.5" step="0.01" value="0.1">
        </div>
        <button id="cf-kutta-btn">✦ Apply Kutta condition</button>
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
            <span id="cf-gamma-val" contenteditable="true" spellcheck="false" title="Click to enter exact value">0.0</span>
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
        <div id="cf-coords">
          <div><span class="label">z    = </span><span class="val" id="cf-coord-z">—</span></div>
          <div><span class="label">f(z) = </span><span class="val" id="cf-coord-fz">—</span></div>
          <div><span class="label">|f|  = </span><span class="val" id="cf-coord-abs">—</span></div>
          <div><span class="label">arg  = </span><span class="val" id="cf-coord-arg">—</span></div>
        </div>
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
  // sqrt(z^2 - 4) with branch chosen so dot(z, sqrt2) >= 0 (same side as z)
  sqrt2: (z) => {
    const a = z[0]*z[0]-z[1]*z[1]-4, b = 2*z[0]*z[1];
    const r = Math.sqrt(a*a+b*b);
    const theta = Math.atan2(b,a);
    const mag = Math.sqrt(r);
    const re = mag*Math.cos(theta/2);
    const im = mag*Math.sin(theta/2);
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

// ─── Joukowski airfoil ────────────────────────────────────────────────────────
function getJoukowskiParams() {
  const R     = parseFloat(document.getElementById('cf-jR-slider').value);
  const a     = parseFloat(document.getElementById('cf-ja-slider').value);
  const b     = parseFloat(document.getElementById('cf-jb-slider').value);
  const alpha = parseFloat(document.getElementById('cf-jalpha-slider').value);
  const gamma = parseFloat(document.getElementById('cf-gamma-val').textContent);
  const z0r = -a, z0i = b;
  const rho = Math.sqrt((R - z0r)**2 + z0i**2);
  return { R, a, b, alpha, gamma, z0r, z0i, rho };
}

function kuttaGamma() {
  const { R, alpha, rho, z0i } = getJoukowskiParams();
  const beta = Math.asin(z0i / rho);
  return -4 * Math.PI * rho * Math.sin(alpha + beta);
}

function buildJoukowskiFn(gamma) {
  const { R, alpha, z0r, z0i, rho } = getJoukowskiParams();
  const cosA = Math.cos(alpha), sinA = Math.sin(alpha);
  return (w) => {
    const wr = w[0], wi = w[1];
    const ar = wr*wr - wi*wi - 4*R*R, ai = 2*wr*wi;
    const sr = Math.sqrt(ar*ar + ai*ai);
    const stheta = Math.atan2(ai, ar);
    const smag = Math.sqrt(sr);
    let sqr = smag*Math.cos(stheta/2), sqi = smag*Math.sin(stheta/2);
    const zr1 = (wr+sqr)/2, zi1 = (wi+sqi)/2;
    const zr2 = (wr-sqr)/2, zi2 = (wi-sqi)/2;
    const mod1 = zr1*zr1+zi1*zi1, mod2 = zr2*zr2+zi2*zi2;
    const zr = mod1 >= mod2 ? zr1 : zr2;
    const zi = mod1 >= mod2 ? zi1 : zi2;

    const dzr = zr - z0r, dzi = zi - z0i;
    const dz2 = dzr*dzr + dzi*dzi;

    const t1r = dzr*cosA + dzi*sinA, t1i = dzi*cosA - dzr*sinA;
    const r2 = rho*rho / dz2;
    const t2r = r2*(dzr*cosA + dzi*sinA), t2i = r2*(dzi*cosA - dzr*sinA);
    const logMag = Math.log(Math.sqrt(dz2) / rho);
    const logArg = Math.atan2(dzi, dzr);
    const scale = gamma / (2 * Math.PI);
    const t3r = scale * logArg, t3i = -scale * logMag;

    return [t1r + t2r + t3r, t1i + t2i + t3i];
  };
}

function buildJoukowskiRegion() {
  const { R, z0r, z0i, rho } = getJoukowskiParams();
  return (x, y) => {
    const wr = x, wi = y;
    const ar = wr*wr - wi*wi - 4*R*R, ai = 2*wr*wi;
    const sr = Math.sqrt(ar*ar + ai*ai);
    const stheta = Math.atan2(ai, ar);
    const smag = Math.sqrt(sr);
    const sqr = smag*Math.cos(stheta/2), sqi = smag*Math.sin(stheta/2);
    const zr1=(wr+sqr)/2, zi1=(wi+sqi)/2;
    const zr2=(wr-sqr)/2, zi2=(wi-sqi)/2;
    const mod1=zr1*zr1+zi1*zi1, mod2=zr2*zr2+zi2*zi2;
    const zr = mod1>=mod2?zr1:zr2, zi = mod1>=mod2?zi1:zi2;
    const dr = zr - z0r, di = zi - z0i;
    return dr*dr + di*di - rho*rho;
  };
}

// ─── Canvas & state ───────────────────────────────────────────────────────────
const canvas = document.getElementById('cf-canvas');
const ctx = canvas.getContext('2d');

let showStream=true, showEquip=true, showColor=false;
let showVectors=false, showParticles=false;
let regionFn = null;
let currentF = null;
let currentRange = 3;
let animFrameId = null;
let circMode = null;
let joukowskiMode = false;

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

// ─── Velocity from f (centered difference for symmetry & accuracy) ───────────
// w = df/dz = u - iv  =>  u = Re(w), v = -Im(w)
function velocity(f, x, y) {
  const h = 1e-4;
  try {
    const fp = f([x+h, y]);
    const fm = f([x-h, y]);
    const dwRe = (fp[0]-fm[0])/(2*h);
    const dwIm = (fp[1]-fm[1])/(2*h);
    return [dwRe, -dwIm];
  } catch(e) { return [0,0]; }
}

// ─── Vector field ─────────────────────────────────────────────────────────────
function drawVectorField(f, W, H, range) {
  const COLS = 22, ROWS = 16;
  const dx = W/COLS, dy = H/ROWS;
  const maxArrow = Math.min(dx, dy) * 0.42;

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
      if (isFinite(spd) && spd > maxSpd) maxSpd = spd;
      vecs.push({px, py, u, v, spd});
    }
  }

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const vec of vecs) {
    if (!vec) continue;
    const {px, py, u, v, spd} = vec;
    if (!isFinite(spd) || spd < 1e-10) continue;
    const t = Math.min(1, spd/maxSpd);
    const len = t * maxArrow;
    const sx = u * W/(2*range);
    const sy = -v * H/(2*range);
    const slen = Math.sqrt(sx*sx+sy*sy);
    if (slen < 1e-12) continue;
    const ex = px + (sx/slen)*len;
    const ey = py + (sy/slen)*len;
    const r = Math.round(20 + t*54);
    const g = Math.round(80 + t*160);
    const b = Math.round(80 + t*120);
    ctx.strokeStyle = `rgb(${r},${g},${b})`;
    ctx.lineWidth = devicePixelRatio * 1.0;
    ctx.globalAlpha = 0.55 + 0.4*t;

    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(ex, ey);
    ctx.stroke();

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
  const dt = 0.06 * speedMult;
  const trailLen = getTrailLen();

  for (const p of particles) {
    p.age++;
    if (p.age > p.maxAge) { Object.assign(p, makeParticle(range)); continue; }

    const mx = p.mx, my = p.my;
    if (inRegion(mx, my)) { Object.assign(p, makeParticle(range)); continue; }

    const px =  (mx / (2*range) + 0.5) * W;
    const py = (-my / (2*range) + 0.5) * H;
    p.trail.push([px, py]);
    if (p.trail.length > trailLen) p.trail.shift();

    const [u, v] = velocity(f, mx, my);
    if (!isFinite(u) || !isFinite(v)) { Object.assign(p, makeParticle(range)); continue; }
    const spd = Math.sqrt(u*u + v*v);
    if (spd < 1e-10) { p.age = p.maxAge; continue; }

    const k = dt / spd;
    const mx2 = mx + k*u, my2 = my + k*v;
    const [u2, v2] = velocity(f, mx2, my2);
    const spd2 = Math.sqrt(u2*u2 + v2*v2);
    if (!isFinite(spd2) || spd2 < 1e-10) { Object.assign(p, makeParticle(range)); continue; }

    p.mx += 0.5*dt*(u/spd + u2/spd2);
    p.my += 0.5*dt*(v/spd + v2/spd2);

    if (Math.abs(p.mx) > range*1.05 || Math.abs(p.my) > range*1.05) {
      Object.assign(p, makeParticle(range));
    }
  }
}

function drawParticles() {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const p of particles) {
    if (p.trail.length < 2) continue;
    const fade = Math.min(1, p.age / 20);
    for (let i = 1; i < p.trail.length; i++) {
      const t = i / p.trail.length;
      ctx.globalAlpha = t * fade * 0.85;
      ctx.strokeStyle = '#4af0c8';
      ctx.lineWidth = devicePixelRatio * (0.8 + t*0.8);
      ctx.beginPath();
      ctx.moveTo(p.trail[i-1][0], p.trail[i-1][1]);
      ctx.lineTo(p.trail[i][0],   p.trail[i][1]);
      ctx.stroke();
    }
    const [hx, hy] = p.trail[p.trail.length-1];
    ctx.globalAlpha = fade * 0.95;
    ctx.fillStyle = '#9ff8e2';
    ctx.beginPath();
    ctx.arc(hx, hy, devicePixelRatio*1.6, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ─── Domain coloring helper (hue=arg(f), L=banded log|f|) ────────────────────
function hslToRgb(h, s, l) {
  const k = n => (n + h*12) % 12;
  const a = s * Math.min(l, 1-l);
  const f = n => l - a * Math.max(-1, Math.min(k(n)-3, 9-k(n), 1));
  return [f(0)*255, f(8)*255, f(4)*255];
}

// ─── Static draw (level curves etc) ──────────────────────────────────────────
function resizeCanvas() {
  const wrap = canvas.parentElement;
  canvas.width  = wrap.clientWidth  * devicePixelRatio;
  canvas.height = wrap.clientHeight * devicePixelRatio;
  canvas.style.width  = wrap.clientWidth  + 'px';
  canvas.style.height = wrap.clientHeight + 'px';
}

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

  // percentile-based contour range so streamlines concentrate near features
  function percentileRange(vals, loP, hiP) {
    const finite = Array.from(vals).filter(isFinite).sort((a,b)=>a-b);
    if (!finite.length) return [0, 1];
    const lo = finite[Math.floor(loP * finite.length)];
    const hi = finite[Math.floor(hiP * finite.length)];
    return [lo, hi];
  }
  const [imLo, imHi] = percentileRange(imVals, 0.05, 0.95);
  const [reLo, reHi] = percentileRange(reVals, 0.05, 0.95);

  // domain coloring (hue from arg(f), lightness banded by log2|f|),
  // sampled by bilinear interpolation from the GRID×GRID we just built.
  if (showColor) {
    const img = oc_ctx.createImageData(W, H);
    const data32 = new Uint32Array(img.data.buffer);
    const TWO_PI = Math.PI*2;
    for (let py=0; py<H; py++) {
      const gy = (py/(H-1)) * (GRID-1);
      const iy0 = Math.floor(gy), fy = gy - iy0;
      const iy1 = Math.min(iy0+1, GRID-1);
      for (let px=0; px<W; px++) {
        const gx = (px/(W-1)) * (GRID-1);
        const ix0 = Math.floor(gx), fx = gx - ix0;
        const ix1 = Math.min(ix0+1, GRID-1);

        const i00 = iy0*GRID+ix0, i10 = iy0*GRID+ix1;
        const i01 = iy1*GRID+ix0, i11 = iy1*GRID+ix1;
        const re = (1-fx)*(1-fy)*reVals[i00] + fx*(1-fy)*reVals[i10]
                 + (1-fx)*fy   *reVals[i01] + fx*fy   *reVals[i11];
        const im = (1-fx)*(1-fy)*imVals[i00] + fx*(1-fy)*imVals[i10]
                 + (1-fx)*fy   *imVals[i01] + fx*fy   *imVals[i11];

        if (!isFinite(re) || !isFinite(im)) {
          data32[py*W+px] = 0xFF0a0c0f; continue;
        }
        const arg = Math.atan2(im, re);
        const h = ((arg + Math.PI) / TWO_PI);
        const mag = Math.sqrt(re*re + im*im);
        let l;
        if (mag === 0) l = 0.04;
        else {
          const band = Math.log2(mag);
          const frac = band - Math.floor(band);
          l = 0.18 + 0.22 * frac;
        }
        const [r, g, b] = hslToRgb(h, 0.65, l);
        data32[py*W+px] = (255<<24) | (b<<16) | (g<<8) | r;
      }
    }
    oc_ctx.putImageData(img, 0, 0);
  }

  drawAxesTo(oc_ctx, W, H, range);

  if (regionFn) {
    const mask = document.createElement('canvas');
    mask.width = W; mask.height = H;
    const mc = mask.getContext('2d');
    const mimg = mc.createImageData(W, H);
    const md = mimg.data;
    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const x = (px/W-0.5)*2*range, y = -((py/H-0.5)*2*range);
        if (inRegion(x, y)) {
          const i = (py*W+px)*4;
          md[i]=255; md[i+1]=255; md[i+2]=255; md[i+3]=255;
        }
      }
    }
    mc.putImageData(mimg, 0, 0);

    const lc = document.createElement('canvas');
    lc.width = W; lc.height = H;
    const lctx = lc.getContext('2d');
    if(showStream) {
      drawLevelCurvesTo(lctx, imVals,GRID,W,H,imLo,imHi,nlines,'#4af0c8',0.85,[]);
      if(circMode && circMode !== 'joukowski') {
        drawLevelCurvesTo(lctx, imVals,GRID,W,H,imLo,imHi,0,'#4af0c8',1.0,[0]);
      }
    }
    if(showEquip) drawLevelCurvesTo(lctx, reVals,GRID,W,H,reLo,reHi,nlines,'#f0a44a',0.5,[]);
    lctx.globalCompositeOperation = 'destination-out';
    lctx.drawImage(mask, 0, 0);
    lctx.globalCompositeOperation = 'source-over';
    oc_ctx.drawImage(lc, 0, 0);
  } else {
    if(showStream) {
      drawLevelCurvesTo(oc_ctx, imVals,GRID,W,H,imLo,imHi,nlines,'#4af0c8',0.85,[]);
      if(circMode && circMode !== 'joukowski') {
        drawLevelCurvesTo(oc_ctx, imVals,GRID,W,H,imLo,imHi,0,'#4af0c8',1.0,[0]);
      }
    }
    if(showEquip) drawLevelCurvesTo(oc_ctx, reVals,GRID,W,H,reLo,reHi,nlines,'#f0a44a',0.5,[]);
  }

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

// ─── Top-level draw orchestration ─────────────────────────────────────────────
function fullDraw() {
  stopAnimation();
  resizeCanvas();
  const errEl  = document.getElementById('cf-error-msg');
  const rowEl  = document.getElementById('cf-input-row');
  let f;

  if (joukowskiMode) {
    const gamma = parseFloat(document.getElementById('cf-gamma-val').textContent) || 0;
    f = buildJoukowskiFn(gamma);
    regionFn = buildJoukowskiRegion();
    errEl.textContent = '';
    rowEl.classList.remove('error');
  } else {
    const expr = document.getElementById('cf-func-input').value.trim();
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
    const gamma = parseFloat(document.getElementById('cf-gamma-slider').value);
    if (circMode && gamma !== 0) {
      const baseF = f;
      const scale = -gamma / (2 * Math.PI);
      f = (z) => {
        const base = baseF(z);
        let logArg;
        if (circMode === 'z') {
          const R = parseFloat(document.getElementById('cf-preset-select')
            .options[document.getElementById('cf-preset-select').selectedIndex]
            .dataset.circr || '1');
          logArg = C.div(z, [R, 0]);
        } else {
          const R = parseFloat(document.getElementById('cf-preset-select')
            .options[document.getElementById('cf-preset-select').selectedIndex]
            .dataset.circr || '1');
          const sw = C.sqrt2(z);
          const gw = C.mul([0.5, 0], C.add(z, sw));
          logArg = C.div(gw, [R, 0]);
        }
        const logVal = C.log(logArg);
        const circ = [-scale * logVal[1], scale * logVal[0]];
        return C.add(base, circ);
      };
    }
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

function redrawStatic() {
  if (!currentF) { fullDraw(); return; }
  currentRange = parseFloat(document.getElementById('cf-range-slider').value);
  const nlines = parseInt(document.getElementById('cf-nlines-slider').value);
  const W = canvas.width, H = canvas.height;
  staticCache = buildStaticCache(currentF, W, H, currentRange, nlines);
  if (!showParticles) {
    ctx.clearRect(0,0,W,H);
    ctx.drawImage(staticCache, 0, 0);
    if (showVectors) drawVectorField(currentF, W, H, currentRange);
  }
}

// ─── Animation loop ───────────────────────────────────────────────────────────
function startAnimation() {
  if (animFrameId) return;
  function frame() {
    if (!currentF || !showParticles) { animFrameId = null; return; }
    const W = canvas.width, H = canvas.height;
    const speed = parseFloat(document.getElementById('cf-speed-slider').value);

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

// ─── Axis / curve helpers ────────────────────────────────────────────────────
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
  c.lineCap='round'; c.lineJoin='round';
  const levels = [];
  for(let k=1;k<nlines;k++) levels.push(vmin+(vmax-vmin)*k/nlines);
  if(extraLevels) for(const lv of extraLevels) levels.push(lv);

  let dmin=Infinity, dmax=-Infinity;
  for(let i=0;i<vals.length;i++){
    if(isFinite(vals[i])){ if(vals[i]<dmin)dmin=vals[i]; if(vals[i]>dmax)dmax=vals[i]; }
  }
  const nCorner = Math.max(3, Math.floor(nlines/6));
  for(let k=1;k<=nCorner;k++){
    levels.push(dmin+(vmin-dmin)*k/nCorner);
    levels.push(vmax+(dmax-vmax)*k/nCorner);
  }

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

// Marching squares with saddle disambiguation via cell-center average.
// Corner bits: 8=TL(v00), 4=TR(v10), 2=BR(v11), 1=BL(v01)
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
    case 1: return[s(L(),B())];
    case 2: return[s(B(),R())];
    case 3: return[s(L(),R())];
    case 4: return[s(T(),R())];
    case 5: { // saddle: TR & BL above
      const avg = (v00+v10+v11+v01)*0.25;
      return avg>=lv
        ? [s(T(),L()), s(B(),R())]
        : [s(T(),R()), s(L(),B())];
    }
    case 6: return[s(T(),B())];
    case 7: return[s(T(),L())];
    case 8: return[s(T(),L())];
    case 9: return[s(T(),B())];
    case 10: { // saddle: TL & BR above
      const avg = (v00+v10+v11+v01)*0.25;
      return avg>=lv
        ? [s(T(),R()), s(L(),B())]
        : [s(T(),L()), s(B(),R())];
    }
    case 11: return[s(T(),R())];
    case 12: return[s(L(),R())];
    case 13: return[s(B(),R())];
    case 14: return[s(L(),B())];
    default: return[];
  }
}

// ─── Region input wiring ──────────────────────────────────────────────────────
function applyRegion() {
  const expr = document.getElementById('cf-region-input').value.trim();
  const errEl = document.getElementById('cf-region-error');
  const rowEl = document.getElementById('cf-region-row');
  if (!expr) {
    if (regionFn === null) { errEl.textContent = ''; rowEl.classList.remove('error'); return; }
    regionFn = null;
    errEl.textContent = '';
    rowEl.classList.remove('error');
    redrawStatic();
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
  redrawStatic();
}

document.getElementById('cf-region-input').addEventListener('keydown', e => { if(e.key==='Enter') applyRegion(); });
document.getElementById('cf-region-input').addEventListener('blur', applyRegion);
document.getElementById('cf-region-clear').addEventListener('click', () => {
  document.getElementById('cf-region-input').value = '';
  applyRegion();
});

// ─── UI wiring ────────────────────────────────────────────────────────────────
document.getElementById('cf-draw-btn').addEventListener('click', fullDraw);
document.getElementById('cf-func-input').addEventListener('keydown', e => { if(e.key==='Enter') fullDraw(); });

document.getElementById('cf-range-slider').addEventListener('input', function(){
  document.getElementById('cf-range-val').textContent = parseFloat(this.value).toFixed(1);
  redrawStatic();
});
document.getElementById('cf-nlines-slider').addEventListener('input', function(){
  document.getElementById('cf-nlines-val').textContent = this.value;
  redrawStatic();
});
document.getElementById('cf-gamma-slider').addEventListener('input', function(){
  document.getElementById('cf-gamma-val').textContent = parseFloat(this.value).toFixed(2);
  fullDraw();
});

const gammaVal = document.getElementById('cf-gamma-val');
function applyGammaText() {
  const v = parseFloat(gammaVal.textContent);
  if (!isFinite(v)) { gammaVal.textContent = parseFloat(document.getElementById('cf-gamma-slider').value).toFixed(2); return; }
  const clamped = Math.max(-50, Math.min(50, v));
  gammaVal.textContent = clamped.toFixed(2);
  const slider = document.getElementById('cf-gamma-slider');
  slider.value = Math.max(parseFloat(slider.min), Math.min(parseFloat(slider.max), clamped));
  fullDraw();
}
gammaVal.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') { e.preventDefault(); this.blur(); }
  if (e.key === 'Escape') { this.textContent = parseFloat(document.getElementById('cf-gamma-slider').value).toFixed(2); this.blur(); }
});
gammaVal.addEventListener('blur', applyGammaText);
gammaVal.addEventListener('focus', function() {
  const range = document.createRange();
  range.selectNodeContents(this);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
});

document.getElementById('cf-gamma-group').classList.add('disabled');

document.getElementById('cf-preset-select').addEventListener('change', function(){
  const opt = this.options[this.selectedIndex];
  const f = opt.dataset.f;
  const region = opt.dataset.region || '';
  const circ = opt.dataset.circ || null;

  const isJoukowski = opt.value === 'joukowski';
  joukowskiMode = isJoukowski;
  document.getElementById('cf-joukowski-controls').style.display = isJoukowski ? 'flex' : 'none';

  if (!isJoukowski) {
    if (!f) return;
    document.getElementById('cf-func-input').value = f;
    document.getElementById('cf-region-input').value = region;
    regionFn = region ? compileRegion(region) : null;
  }

  circMode = isJoukowski ? 'joukowski' : circ;
  document.getElementById('cf-gamma-slider').value = 0;
  document.getElementById('cf-gamma-val').textContent = '0.00';
  const gammaGroup = document.getElementById('cf-gamma-group');
  if (circMode) { gammaGroup.classList.remove('disabled'); }
  else { gammaGroup.classList.add('disabled'); }
  fullDraw();
});

['cf-jR-slider','cf-ja-slider','cf-jb-slider','cf-jalpha-slider'].forEach(id => {
  document.getElementById(id).addEventListener('input', function(){
    const valId = id.replace('slider','val');
    document.getElementById(valId).textContent = parseFloat(this.value).toFixed(2);
    if (joukowskiMode) fullDraw();
  });
});

document.getElementById('cf-kutta-btn').addEventListener('click', function(){
  const gamma = kuttaGamma();
  document.getElementById('cf-gamma-val').textContent = gamma.toFixed(3);
  document.getElementById('cf-gamma-slider').value = Math.max(-12, Math.min(12, gamma));
  fullDraw();
});

document.getElementById('cf-btn-stream').addEventListener('click', function(){
  showStream=this.classList.toggle('active');
  redrawStatic();
});
document.getElementById('cf-btn-equip').addEventListener('click', function(){
  showEquip=this.classList.toggle('active');
  document.getElementById('cf-leg-equip').style.opacity=showEquip?'1':'0.3';
  redrawStatic();
});
document.getElementById('cf-btn-color').addEventListener('click', function(){
  showColor=this.classList.toggle('active');
  redrawStatic();
});

document.getElementById('cf-btn-vectors').addEventListener('click', function(){
  showVectors=this.classList.toggle('active');
  if (!showParticles) {
    if (currentF && staticCache) {
      const W=canvas.width, H=canvas.height;
      ctx.clearRect(0,0,W,H);
      ctx.drawImage(staticCache,0,0);
      if (showVectors) drawVectorField(currentF, W, H, currentRange);
    } else { fullDraw(); }
  }
});

document.getElementById('cf-btn-particles').addEventListener('click', function(){
  showParticles=this.classList.toggle('active');
  if (showParticles) {
    if (!currentF) { fullDraw(); return; }
    const count = parseInt(document.getElementById('cf-pcount-slider').value);
    initParticles(count, currentRange);
    startAnimation();
  } else {
    stopAnimation();
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
  const len = parseInt(this.value);
  for (const p of particles) {
    if (p.trail.length > len) p.trail.splice(0, p.trail.length - len);
  }
});

// ─── Cursor coords (z, f(z), |f|, arg) ───────────────────────────────────────
const fmtNum = v => {
  if (!isFinite(v)) return '∞';
  const a = Math.abs(v);
  if (a !== 0 && (a < 1e-3 || a >= 1e4)) return v.toExponential(2);
  return v.toFixed(3);
};
const fmtComplex = (re, im) => {
  if (!isFinite(re) || !isFinite(im)) return '∞';
  const ip = im >= 0 ? '+' : '−';
  return `${fmtNum(re)} ${ip} ${fmtNum(Math.abs(im))}i`;
};
const elZ   = document.getElementById('cf-coord-z');
const elFz  = document.getElementById('cf-coord-fz');
const elAbs = document.getElementById('cf-coord-abs');
const elArg = document.getElementById('cf-coord-arg');

canvas.addEventListener('mousemove', function(e){
  const r=canvas.getBoundingClientRect();
  const range=parseFloat(document.getElementById('cf-range-slider').value);
  const x=((e.clientX-r.left)/r.width-0.5)*2*range;
  const y=-(((e.clientY-r.top)/r.height-0.5)*2*range);
  elZ.textContent = fmtComplex(x, y);
  if (currentF) {
    let fz; try { fz = currentF([x, y]); } catch(_) { fz = [NaN, NaN]; }
    const re=fz[0], im=fz[1];
    elFz.textContent  = fmtComplex(re, im);
    const m = Math.sqrt(re*re + im*im);
    elAbs.textContent = isFinite(m) ? fmtNum(m) : '∞';
    const a = Math.atan2(im, re);
    elArg.textContent = isFinite(a) ? `${fmtNum(a)} (${fmtNum(a*180/Math.PI)}°)` : '—';
  } else {
    elFz.textContent = elAbs.textContent = elArg.textContent = '—';
  }
});
canvas.addEventListener('mouseleave', () => {
  elZ.textContent = elFz.textContent = elAbs.textContent = elArg.textContent = '—';
});

// ─── Debounced resize ────────────────────────────────────────────────────────
let resizeTimer = null;
window.addEventListener('resize', () => {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(fullDraw, 120);
});

setTimeout(fullDraw, 100);

})();
