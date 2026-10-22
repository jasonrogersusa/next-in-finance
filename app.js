// ============================================================================
// [Excel]lent Portrait — Live Webcam Self-Portrait + Animated Quant Visualizations
// ============================================================================

(function () {
  const DATA = window.EXCELLENT_DATA;

  // --- Tactile Web Audio Feedback ---
  class SoundEngine {
    constructor() {
      this.ctx = null;
    }
    getContext() {
      if (typeof window === "undefined") return null;
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    }
    playTick(freq = 760, duration = 0.02) {
      try {
        const ctx = this.getContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.55, ctx.currentTime + duration);
        gain.gain.setValueAtTime(0.025, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch {}
    }
    playShutter() {
      try {
        const ctx = this.getContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        [1150, 840].forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(f, now + i * 0.055);
          osc.frequency.exponentialRampToValueAtTime(220, now + i * 0.055 + 0.05);
          gain.gain.setValueAtTime(0.11, now + i * 0.055);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.055 + 0.05);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.055);
          osc.stop(now + i * 0.055 + 0.05);
        });
      } catch {}
    }
    playChime() {
      try {
        const ctx = this.getContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.055);
          gain.gain.setValueAtTime(0.055, now + idx * 0.055);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.055 + 0.22);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.055);
          osc.stop(now + idx * 0.055 + 0.22);
        });
      } catch {}
    }
  }

  const sfx = new SoundEngine();

  // --- Core Application State ---
  const state = {
    industry: "capital_markets",
    // sceneMode controls whether we render the Live Webcam Self-Portrait OR one of the 5 animated Quantitative Financial Artworks!
    // 'webcam' | 'vol_surface_3d' | 'lorenz_attractor' | 'capital_globe' | 'bull_candlesticks' | 'quant_skyline' | 'upload'
    sceneMode: "webcam",
    quantModel: "dcf_sensitivity",
    activeConnectors: new Set(["sp_capiq", "moodys", "pitchbook", "sec_edgar", "factset"]),

    cameraStatus: "requesting",
    isPaused: false,
    mirrored: true,
    uploadedImage: null,

    // Grid & Facial Clarity Defaults
    cols: 76,
    rows: 54,
    cellAspect: 1.35,
    zoom: 1.0,
    palette: "truecolor_pro",
    cellDataMode: "quant_auto",

    faceClarity: 72,
    textBlendOpacity: 0.42,
    adaptiveMerge: true,
    gridlines: true,
    hoverLoupe: true,
    brightness: 4,
    contrast: 16,
    saturation: 10,

    // Live Market Simulation Variables
    liveMarketTick: true,
    marketSentimentShift: 0.0, // -5.0% to +5.0%
    sp500Live: 5842.47,
    nasdaqLive: 20314.80,
    ust10yLive: 4.08,
    liveSecurityQuotes: {},

    // Progressive Cell-by-Cell Paint Animation
    isPainting: false,
    paintProgress: 1.0,
    paintStartTime: 0,
    paintDuration: 1500,

    activeCell: { col: 36, row: 24 },
    hoverCell: null,
    mousePos: { x: 0, y: 0 },

    activeTab: "live",
    snapshots: [],
    currentFrame: null,
    fps: 30
  };

  function initQuotes() {
    DATA.securities.forEach((sec) => {
      state.liveSecurityQuotes[sec.ticker] = {
        price: sec.price,
        change: sec.change,
        flash: 0,
        flashTime: 0
      };
    });
  }
  initQuotes();

  function colToLetter(col) {
    let c = col;
    let s = "";
    while (c >= 0) {
      s = String.fromCharCode((c % 26) + 65) + s;
      c = Math.floor(c / 26) - 1;
    }
    return s;
  }

  function cellCoordToString(cell) {
    return `${colToLetter(cell.col)}${cell.row + 1}`;
  }

  function rgbToHex(r, g, b) {
    const clamp = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
    return `#${clamp(r)}${clamp(g)}${clamp(b)}`.toUpperCase();
  }

  function normCDF(x) {
    const a1 = 0.254829592,
      a2 = -0.284496736,
      a3 = 1.421413741,
      a4 = -1.453152027,
      a5 = 1.061405429,
      p = 0.3275911;
    const sign = x < 0 ? -1 : 1;
    const absX = Math.abs(x) / Math.sqrt(2.0);
    const t = 1.0 / (1.0 + p * absX);
    const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
    return 0.5 * (1.0 + sign * y);
  }

  // ============================================================================
  // GEMINI QUANTITATIVE CALCULATION ENGINE (Per-Cell Math)
  // ============================================================================
  function computeCellQuantMetrics(sec, quote, col, row, cols, rows, lum) {
    const price = quote ? quote.price : sec.price;
    const chg = quote ? quote.change : sec.change;
    const uCol = col / Math.max(1, cols - 1);
    const vRow = row / Math.max(1, rows - 1);
    const rf = state.ust10yLive / 100;

    switch (state.quantModel) {
      case "dcf_sensitivity": {
        const wacc = 0.072 + vRow * 0.046 - state.marketSentimentShift * 0.0015;
        const termG = 0.015 + uCol * 0.030;
        const spread = Math.max(0.022, wacc - termG);
        const baseSpread = 0.06;
        const impliedPrice = +(price * (baseSpread / spread)).toFixed(price > 1000 ? 0 : 1);
        const upsidePct = +(((impliedPrice - price) / price) * 100).toFixed(1);
        const sign = upsidePct >= 0 ? "+" : "";
        return {
          shortCell: `${sec.ticker} $${impliedPrice}`,
          mergedCell: `${sec.ticker} $${impliedPrice} (${sign}${upsidePct}%)`,
          loupeLine1: `${sec.ticker} DCF: $${impliedPrice}`,
          loupeLine2: `WACC ${(wacc * 100).toFixed(1)}% | g ${(termG * 100).toFixed(1)}%`,
          formula: `=GEMINI.DCF("${sec.ticker}", FCF:$${sec.fcfB}B, WACC:${(wacc * 100).toFixed(2)}%, g:${(termG * 100).toFixed(2)}%) // Implied: $${impliedPrice} (${sign}${upsidePct}% vs Spot)`
        };
      }

      case "monte_carlo": {
        const sigma = (sec.iv || 25) / 100;
        const mu = 0.09 + state.marketSentimentShift * 0.015;
        const tHorizon = 0.1 + uCol * 0.9;
        const zScore = (lum / 255 - 0.5) * 3.6;
        const simPrice = +(
          price * Math.exp((mu - 0.5 * sigma * sigma) * tHorizon + sigma * Math.sqrt(tHorizon) * zScore)
        ).toFixed(price > 1000 ? 0 : 1);
        const zSign = zScore >= 0 ? "+" : "";
        return {
          shortCell: `${sec.ticker} $${simPrice}`,
          mergedCell: `${sec.ticker} $${simPrice} (${zSign}${zScore.toFixed(1)}σ)`,
          loupeLine1: `Path: $${simPrice} (${zSign}${zScore.toFixed(2)}σ)`,
          loupeLine2: `σ=${(sigma * 100).toFixed(0)}% | T=${tHorizon.toFixed(2)}y`,
          formula: `=GEMINI.MONTE_CARLO("${sec.ticker}", S0:$${price}, μ:${(mu * 100).toFixed(1)}%, σ:${(sigma * 100).toFixed(1)}%, T:${tHorizon.toFixed(2)}y, Z:${zSign}${zScore.toFixed(2)}σ) // Sim: $${simPrice}`
        };
      }

      case "black_scholes": {
        const moneyness = 0.85 + uCol * 0.30;
        const strike = +(price * moneyness).toFixed(price > 1000 ? 0 : 1);
        const T = 0.08 + vRow * 0.92;
        const smileBoost = Math.pow(moneyness - 1.0, 2) * 1.4;
        const sigma = (sec.iv / 100) * (1 + smileBoost - state.marketSentimentShift * 0.02);
        const d1 =
          (Math.log(price / strike) + (rf + 0.5 * sigma * sigma) * T) /
          (sigma * Math.sqrt(T));
        const delta = normCDF(d1);
        const gamma =
          Math.exp(-0.5 * d1 * d1) / (Math.sqrt(2 * Math.PI) * price * sigma * Math.sqrt(T));
        return {
          shortCell: `Δ${delta.toFixed(2)} σ${(sigma * 100).toFixed(0)}%`,
          mergedCell: `${sec.ticker} Δ${delta.toFixed(2)} IV:${(sigma * 100).toFixed(1)}%`,
          loupeLine1: `${sec.ticker} Δ:${delta.toFixed(2)} Γ:${gamma.toFixed(3)}`,
          loupeLine2: `K:$${strike} | IV:${(sigma * 100).toFixed(1)}%`,
          formula: `=GEMINI.BLACK_SCHOLES("${sec.ticker}", S:$${price}, K:$${strike}, T:${T.toFixed(2)}y, r:${(rf * 100).toFixed(2)}%, IV:${(sigma * 100).toFixed(1)}%) // Δ=${delta.toFixed(3)} | Γ=${gamma.toFixed(4)}`
        };
      }

      case "credit_var": {
        const stressFactor = Math.max(0.4, 1.0 - state.marketSentimentShift * 0.12 + vRow * 0.4);
        const pdBps = Math.round((sec.pdBps || 20) * stressFactor);
        const lgdPct = Math.round(35 + (1 - lum / 255) * 25);
        const expLossBps = ((pdBps * lgdPct) / 100).toFixed(1);
        return {
          shortCell: `${sec.rating} ${pdBps}bp`,
          mergedCell: `${sec.ticker} ${sec.rating} • PD:${pdBps}bp`,
          loupeLine1: `${sec.ticker} [${sec.rating}] PD:${pdBps}bps`,
          loupeLine2: `LGD:${lgdPct}% | EL:${expLossBps}bp`,
          formula: `=GEMINI.CREDIT_VAR("${sec.ticker}", Rating:"${sec.rating}", PD:${pdBps}bps, LGD:${lgdPct}%, Conf:99.0%) // Expected Loss: ${expLossBps}bps`
        };
      }

      case "efficient_frontier":
      default: {
        const expReturn = 0.06 + (chg / 100) * 2.2 + (lum / 255) * 0.08 + state.marketSentimentShift * 0.008;
        const vol = (sec.iv || 22) / 100;
        const sharpe = ((expReturn - rf) / vol).toFixed(2);
        const rho = (0.35 + uCol * 0.55).toFixed(2);
        return {
          shortCell: `${sec.ticker} SR:${sharpe}`,
          mergedCell: `${sec.ticker} SR:${sharpe} β:${sec.beta}`,
          loupeLine1: `${sec.ticker} Sharpe: ${sharpe}`,
          loupeLine2: `β:${sec.beta} | ρ:${rho} | σ:${(vol * 100).toFixed(0)}%`,
          formula: `=GEMINI.MARKOWITZ("${sec.ticker}", E[R]:${(expReturn * 100).toFixed(1)}%, Rf:${(rf * 100).toFixed(2)}%, σ:${(vol * 100).toFixed(1)}%, β:${sec.beta}) // Sharpe Ratio: ${sharpe}`
        };
      }
    }
  }

  function formatCellString(px, isMerged2x) {
    if (state.cellDataMode === "none" || !px.sec) return "";
    if (state.cellDataMode === "quant_auto" && px.quant) {
      return isMerged2x ? px.quant.mergedCell : px.quant.shortCell;
    }
    const sec = px.sec;
    const q = state.liveSecurityQuotes[sec.ticker] || sec;
    const sign = q.change >= 0 ? "+" : "";

    switch (state.cellDataMode) {
      case "industry_metric":
        return isMerged2x ? `${sec.ticker} ${sec.industryMetric}` : sec.industryMetric;
      case "ticker_delta":
        return isMerged2x ? `${sec.ticker} ${sign}${q.change.toFixed(1)}%` : `${sec.ticker}${sign}${q.change.toFixed(0)}%`;
      case "credit_rating":
        return isMerged2x ? `${sec.ticker} • ${sec.rating}` : `${sec.ticker} ${sec.rating}`;
      case "sparkline":
        return isMerged2x ? `${sec.ticker} ${sec.spark}` : sec.spark.slice(0, 4);
      case "formula":
        return isMerged2x ? `=QUANT("${sec.ticker}")` : `=${sec.ticker}`;
      default:
        return isMerged2x ? px.quant.mergedCell : px.quant.shortCell;
    }
  }

  // ============================================================================
  // 5 ANIMATED QUANTITATIVE FINANCIAL PICTURES / SCENES (Rendered into Cells!)
  // ============================================================================
  function drawAnimatedQuantScene(ctx, w, h, t, mode) {
    ctx.save();
    const sentiment = state.marketSentimentShift; // -5 to +5

    if (mode === "vol_surface_3d") {
      // 1. 3D Implied Volatility & Yield Surface Wave (Isometric 3D Terrain)
      ctx.fillStyle = "#060913";
      ctx.fillRect(0, 0, w, h);

      const gridX = 28;
      const gridZ = 22;
      for (let z = 0; z < gridZ; z++) {
        const nz = z / (gridZ - 1); // 0 (back) to 1 (front)
        for (let x = 0; x < gridX; x++) {
          const nx = x / (gridX - 1); // 0 (left) to 1 (right)
          // Volatility smile + travelling wave equation
          const smile = Math.pow(nx - 0.5, 2) * 2.2;
          const wave =
            Math.sin(nx * 6.0 + t * 2.2) * 0.35 +
            Math.cos(nz * 5.0 - t * 1.6) * 0.35 +
            sentiment * 0.08;
          const elev = Math.max(0, Math.min(1, 0.35 + smile * 0.45 + wave * 0.35));

          // Isometric projection onto (w, h)
          const isoX = w * 0.5 + (nx - nz) * (w * 0.44);
          const isoY = h * 0.24 + (nx + nz) * (h * 0.34) - elev * (h * 0.32);

          // Color by elevation: deep indigo valleys -> cyan/emerald mid -> solar gold peaks
          let r, g, b;
          if (elev < 0.4) {
            const u = elev / 0.4;
            r = 16 + u * 20;
            g = 24 + u * 140;
            b = 90 + u * 140;
          } else if (elev < 0.72) {
            const u = (elev - 0.4) / 0.32;
            r = 36 + u * 180;
            g = 164 + u * 70;
            b = 230 - u * 160;
          } else {
            const u = (elev - 0.72) / 0.28;
            r = 216 + u * 39;
            g = 234 + u * 20;
            b = 70 + u * 140;
          }

          ctx.fillStyle = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
          const dotR = Math.max(1.8, (w / 32) * (0.65 + nz * 0.55));
          ctx.beginPath();
          ctx.arc(isoX, isoY, dotR, 0, Math.PI * 2);
          ctx.fill();

          // Vertical pillar glow under high peaks
          if (elev > 0.55) {
            ctx.fillStyle = `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, 0.28)`;
            ctx.fillRect(isoX - dotR * 0.45, isoY, dotR * 0.9, elev * (h * 0.22));
          }
        }
      }
    } else if (mode === "lorenz_attractor") {
      // 2. Quantitative Chaos & Stochastic Butterfly Attractor (3D Rotating Lorenz System)
      // Connects directly to Slide 2's "Butterfly in Excel" AND stochastic differential equations!
      ctx.fillStyle = "#050811";
      ctx.fillRect(0, 0, w, h);

      let lx = 0.1,
        ly = 0,
        lz = 0;
      const sigma = 10,
        rho = 28,
        beta = 8 / 3,
        dt = 0.0065;
      const angle = t * 0.55;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      for (let i = 0; i < 1800; i++) {
        const dx = sigma * (ly - lx) * dt;
        const dy = (lx * (rho - lz) - ly) * dt;
        const dz = (lx * ly - beta * lz) * dt;
        lx += dx;
        ly += dy;
        lz += dz;

        if (i < 80) continue;

        // 3D rotation around Z/Y axis
        const rx = lx * cosA - ly * sinA;
        const ry = lx * sinA + ly * cosA;
        const projX = w * 0.5 + (rx / 24) * (w * 0.44);
        const projY = h * 0.88 - (lz / 48) * (h * 0.78);

        const phase = (i / 1800 + t * 0.15) % 1;
        let r, g, b;
        if (rx < 0) {
          // Left wing: Emerald & Electric Cyan (Bull Regime)
          r = 16 + phase * 60;
          g = 185 + Math.sin(phase * Math.PI) * 70;
          b = 129 + (1 - phase) * 120;
        } else {
          // Right wing: Solar Gold, Amber & Magenta (Volatility Regime)
          r = 245;
          g = 90 + Math.sin(phase * Math.PI) * 145;
          b = 40 + (1 - phase) * 160;
        }

        ctx.fillStyle = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
        const sz = Math.max(1.6, w * 0.032 * (0.6 + (ry + 25) / 50));
        ctx.beginPath();
        ctx.arc(projX, projY, sz, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (mode === "capital_globe") {
      // 3. Gemini Global Liquidity & Capital Flow Network (3D Rotating Sphere + Orbital Streams)
      ctx.fillStyle = "#050914";
      ctx.fillRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.5;
      const radius = Math.min(w, h) * 0.40;

      // Core ambient glow
      const coreGlow = ctx.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius * 1.15);
      coreGlow.addColorStop(0, "rgba(16, 185, 129, 0.45)");
      coreGlow.addColorStop(0.55, "rgba(56, 189, 248, 0.22)");
      coreGlow.addColorStop(1, "rgba(5, 9, 20, 0)");
      ctx.fillStyle = coreGlow;
      ctx.fillRect(0, 0, w, h);

      // 3D Latitude / Longitude financial hub nodes
      const latSteps = 10;
      const lonSteps = 20;
      for (let lat = 1; lat < latSteps; lat++) {
        const theta = (lat / latSteps) * Math.PI;
        const sinT = Math.sin(theta);
        const cosT = Math.cos(theta);

        for (let lon = 0; lon < lonSteps; lon++) {
          const phi = (lon / lonSteps) * Math.PI * 2 + t * 0.7;
          const x3d = sinT * Math.cos(phi);
          const z3d = sinT * Math.sin(phi);
          const y3d = cosT;

          if (z3d < -0.15) continue; // Backface culling for crisp 3D depth

          const px = cx + x3d * radius;
          const py = cy + y3d * radius;
          const depth = (z3d + 1) * 0.5; // 0..1

          const isHub = (lat + lon) % 5 === 0;
          if (isHub) {
            ctx.fillStyle = sentiment < -1 ? "#F87171" : "#FBBF24";
            ctx.beginPath();
            ctx.arc(px, py, Math.max(2.0, w * 0.036 * depth), 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = `rgba(56, 225, 248, ${0.35 + depth * 0.65})`;
            ctx.beginPath();
            ctx.arc(px, py, Math.max(1.2, w * 0.022 * depth), 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Orbital High-Frequency Capital Rings
      for (let ring = 0; ring < 2; ring++) {
        const tilt = ring === 0 ? 0.38 : -0.42;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(tilt);
        for (let p = 0; p < 36; p++) {
          const a = (p / 36) * Math.PI * 2 + t * (ring === 0 ? 1.8 : -1.5);
          const rx = Math.cos(a) * (radius * 1.22);
          const ry = Math.sin(a) * (radius * 0.36);
          ctx.fillStyle = ring === 0 ? "#00FF88" : "#A855F7";
          ctx.beginPath();
          ctx.arc(rx, ry, Math.max(1.5, w * 0.024), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    } else if (mode === "bull_candlesticks") {
      // 4. Wall Street Charging Bull & Live Algorithmic Candlesticks
      const isBear = sentiment < -1.0;
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, isBear ? "#220910" : "#081c15");
      bg.addColorStop(1, "#06080e");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Animated Candlestick Chart across the backdrop
      const numCandles = 14;
      for (let i = 0; i < numCandles; i++) {
        const u = i / (numCandles - 1);
        const cx = w * 0.06 + u * (w * 0.88);
        const wave = Math.sin(i * 0.65 + t * 2.0) * 0.16 + (u - 0.3) * 0.25 + sentiment * 0.04;
        const isUp = Math.cos(i * 1.3 + t * 1.5) + sentiment * 0.3 >= 0;
        const bodyH = Math.max(h * 0.08, Math.abs(Math.sin(i + t)) * (h * 0.22));
        const bodyY = h * (0.55 - wave) - bodyH / 2;

        ctx.strokeStyle = isUp ? "#10B981" : "#F43F5E";
        ctx.lineWidth = Math.max(1, w * 0.012);
        ctx.beginPath();
        ctx.moveTo(cx, bodyY - h * 0.06);
        ctx.lineTo(cx, bodyY + bodyH + h * 0.06);
        ctx.stroke();

        ctx.fillStyle = isUp ? "#00FF88" : "#FB7185";
        ctx.fillRect(cx - w * 0.022, bodyY, w * 0.044, bodyH);
      }

      // Glowing Golden Charging Bull Silhouette in foreground
      const bx = w * 0.48 + Math.sin(t * 2.2) * (w * 0.015);
      const by = h * 0.58 + Math.cos(t * 4.4) * (h * 0.012);

      // Bull muscular torso & shoulders
      const bullGrad = ctx.createLinearGradient(bx - w * 0.25, by - h * 0.2, bx + w * 0.25, by + h * 0.2);
      bullGrad.addColorStop(0, "#F59E0B");
      bullGrad.addColorStop(0.5, "#FDE047");
      bullGrad.addColorStop(1, "#D97706");
      ctx.fillStyle = bullGrad;

      ctx.beginPath();
      ctx.ellipse(bx - w * 0.06, by, w * 0.22, h * 0.17, -0.12, 0, Math.PI * 2);
      ctx.fill();

      // Powerful Shoulder Hump
      ctx.beginPath();
      ctx.arc(bx + w * 0.08, by - h * 0.06, w * 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Head & Charging Horns
      ctx.fillStyle = "#FEF08A";
      ctx.beginPath();
      ctx.ellipse(bx + w * 0.22, by - h * 0.04, w * 0.10, h * 0.09, 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = Math.max(2, w * 0.032);
      ctx.beginPath();
      ctx.moveTo(bx + w * 0.22, by - h * 0.10);
      ctx.quadraticCurveTo(bx + w * 0.30, by - h * 0.28, bx + w * 0.38, by - h * 0.18);
      ctx.stroke();
    } else if (mode === "quant_skyline") {
      // 5. Institutional Order-Book & Liquidity Skyline (Animated City of Data Towers)
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#05070e");
      sky.addColorStop(0.6, "#0d1629");
      sky.addColorStop(1, "#112233");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Falling Digital Market Rain in sky
      for (let s = 0; s < 18; s++) {
        const sx = ((s * 19) % 17) * (w / 17) + w * 0.02;
        const sy = ((t * 28 + s * 31) % (h * 0.85));
        ctx.fillStyle = "rgba(0, 255, 136, 0.55)";
        ctx.fillRect(sx, sy, Math.max(1.5, w * 0.018), h * 0.08);
      }

      // Liquidity Skyscrapers pulsing with market volume
      const towers = 11;
      for (let i = 0; i < towers; i++) {
        const tx = (i / towers) * w;
        const tw = (w / towers) * 0.84;
        const baseArch = 0.35 + Math.sin((i / (towers - 1)) * Math.PI) * 0.42;
        const livePulse = Math.sin(t * 2.4 + i * 1.1) * 0.06 + sentiment * 0.02;
        const th = Math.max(h * 0.2, Math.min(h * 0.88, h * (baseArch + livePulse)));
        const ty = h - th;

        ctx.fillStyle = "#141d2f";
        ctx.fillRect(tx, ty, tw, th);

        // Glowing illuminated data windows on each skyscraper
        const winRows = 10;
        for (let wr = 0; wr < winRows; wr++) {
          const wy = ty + (wr / winRows) * th + 2;
          const lit = Math.sin(wr * 2.1 + i * 1.7 + t * 1.5) > -0.2;
          if (lit) {
            ctx.fillStyle = wr < 2 ? "#00FF88" : (i + wr) % 3 === 0 ? "#38BDF8" : "#FBBF24";
            ctx.fillRect(tx + tw * 0.15, wy, tw * 0.7, Math.max(1.5, (th / winRows) * 0.55));
          }
        }
      }
    }
    ctx.restore();
  }

  // Fallback portrait when webcam is selected but camera permission is denied
  function drawFallbackCameraPortrait(ctx, w, h, t) {
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, "#1e293b");
    bgGrad.addColorStop(1, "#0f172a");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    const cx = w * 0.5 + Math.sin(t * 0.7) * (w * 0.012);
    const cy = h * 0.46 + Math.cos(t * 0.9) * (h * 0.01);
    const r = Math.min(w, h) * 0.29;

    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 1.5, r * 1.45, r * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.36, cy + r * 0.82);
    ctx.lineTo(cx + r * 0.36, cy + r * 0.82);
    ctx.lineTo(cx, cy + r * 1.55);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#1c1917";
    ctx.beginPath();
    ctx.ellipse(cx, cy - r * 0.12, r * 0.86, r * 0.96, 0, 0, Math.PI * 2);
    ctx.fill();

    const skinGrad = ctx.createRadialGradient(cx - r * 0.12, cy - r * 0.1, r * 0.08, cx, cy, r * 0.85);
    skinGrad.addColorStop(0, "#fde6d2");
    skinGrad.addColorStop(0.6, "#eac09e");
    skinGrad.addColorStop(1, "#b88662");
    ctx.fillStyle = skinGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.05, r * 0.74, r * 0.88, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#292524";
    ctx.fillRect(cx - r * 0.44, cy - r * 0.18, r * 0.28, r * 0.06);
    ctx.fillRect(cx + r * 0.16, cy - r * 0.18, r * 0.28, r * 0.06);

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.30, cy - r * 0.06, r * 0.13, r * 0.075, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + r * 0.30, cy - r * 0.06, r * 0.13, r * 0.075, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.arc(cx - r * 0.30, cy - r * 0.06, r * 0.065, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.30, cy - r * 0.06, r * 0.065, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#7c2d12";
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.32, r * 0.28, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.33, r * 0.21, 0.12 * Math.PI, 0.88 * Math.PI);
    ctx.fill();
  }

  function getIndustrySecuritiesPool() {
    let pool = DATA.securities.filter(
      (s) => s.industry === state.industry && state.activeConnectors.has(s.connector)
    );
    if (pool.length < 4) {
      pool = DATA.securities.filter((s) => s.industry === state.industry);
    }
    if (pool.length === 0) {
      pool = DATA.securities.slice();
    }
    return pool.slice().sort((a, b) => {
      const qa = state.liveSecurityQuotes[a.ticker] || a;
      const qb = state.liveSecurityQuotes[b.ticker] || b;
      return qa.change - qb.change;
    });
  }

  function applyFacialClarityEnhancement(imgData, cols, rows, strength0to100) {
    if (strength0to100 <= 0) return imgData;
    const src = imgData.data;
    const out = new Uint8ClampedArray(src.length);
    const amount = (strength0to100 / 100) * 1.35;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const idx = (y * cols + x) * 4;
        if (x === 0 || x === cols - 1 || y === 0 || y === rows - 1) {
          out[idx] = src[idx];
          out[idx + 1] = src[idx + 1];
          out[idx + 2] = src[idx + 2];
          out[idx + 3] = 255;
          continue;
        }
        const top = ((y - 1) * cols + x) * 4;
        const bot = ((y + 1) * cols + x) * 4;
        const lft = (y * cols + (x - 1)) * 4;
        const rgt = (y * cols + (x + 1)) * 4;

        for (let ch = 0; ch < 3; ch++) {
          const center = src[idx + ch];
          const avg = (src[top + ch] + src[bot + ch] + src[lft + ch] + src[rgt + ch]) * 0.25;
          out[idx + ch] = Math.max(0, Math.min(255, Math.round(center + (center - avg) * amount)));
        }
        out[idx + 3] = 255;
      }
    }
    return { data: out, width: cols, height: rows };
  }

  function mapPixelColor(r, g, b) {
    let nr = r,
      ng = g,
      nb = b;

    if (state.brightness !== 0) {
      const bShift = (state.brightness / 100) * 110;
      nr += bShift;
      ng += bShift;
      nb += bShift;
    }
    if (state.contrast !== 0) {
      const factor = (259 * (state.contrast + 100)) / (100 * (259 - state.contrast));
      nr = factor * (nr - 128) + 128;
      ng = factor * (ng - 128) + 128;
      nb = factor * (nb - 128) + 128;
    }
    if (state.saturation !== 0) {
      const l = 0.299 * nr + 0.587 * ng + 0.114 * nb;
      const s = (state.saturation + 100) / 100;
      nr = l + (nr - l) * s;
      ng = l + (ng - l) * s;
      nb = l + (nb - l) * s;
    }

    nr = Math.max(0, Math.min(255, nr));
    ng = Math.max(0, Math.min(255, ng));
    nb = Math.max(0, Math.min(255, ng >= 0 ? nb : 0));

    let lum = Math.round(0.299 * nr + 0.587 * ng + 0.114 * nb);

    const pal = DATA.palettes[state.palette];
    if (pal && pal.stops && pal.stops.length > 0) {
      const shiftedLum = Math.max(0, Math.min(255, lum + state.marketSentimentShift * 5.5));
      const t = (shiftedLum / 255) * (pal.stops.length - 1);
      const idx = Math.floor(t);
      const frac = t - idx;
      const c1 = pal.stops[Math.min(idx, pal.stops.length - 1)];
      const c2 = pal.stops[Math.min(idx + 1, pal.stops.length - 1)];
      nr = c1[0] + (c2[0] - c1[0]) * frac;
      ng = c1[1] + (c2[1] - c1[1]) * frac;
      nb = c1[2] + (c2[2] - c1[2]) * frac;
    } else {
      if (state.marketSentimentShift > 0.1) {
        ng = Math.min(255, ng + state.marketSentimentShift * 6.5);
        nr = Math.max(0, nr - state.marketSentimentShift * 1.5);
      } else if (state.marketSentimentShift < -0.1) {
        nr = Math.min(255, nr + Math.abs(state.marketSentimentShift) * 7.5);
        ng = Math.max(0, ng - Math.abs(state.marketSentimentShift) * 3.0);
      }
    }

    const fr = Math.round(nr);
    const fg = Math.round(ng);
    const fb = Math.round(nb);
    lum = Math.round(0.299 * fr + 0.587 * fg + 0.114 * fb);

    return { r: fr, g: fg, b: fb, hex: rgbToHex(fr, fg, fb), lum };
  }

  function getToneMatchedTextColor(px, opacity0to1) {
    const dir = px.lum > 135 ? -1 : 1;
    const shift = Math.round((35 + opacity0to1 * 135) * dir);
    const tr = Math.max(0, Math.min(255, px.r + shift));
    const tg = Math.max(0, Math.min(255, px.g + shift));
    const tb = Math.max(0, Math.min(255, px.b + shift));
    return `rgb(${tr}, ${tg}, ${tb})`;
  }

  function drawSourceAspectCorrect(octx, sourceEl, srcW, srcH, dstCols, dstRows, mirror) {
    const targetPhysicalAspect = (dstCols * state.cellAspect) / dstRows;
    const srcAspect = srcW / srcH;

    let cropW = srcW,
      cropH = srcH,
      cropX = 0,
      cropY = 0;

    if (srcAspect > targetPhysicalAspect) {
      cropW = srcH * targetPhysicalAspect;
      cropX = (srcW - cropW) * 0.5;
    } else {
      cropH = srcW / targetPhysicalAspect;
      cropY = (srcH - cropH) * 0.5;
    }

    octx.save();
    if (mirror) {
      octx.translate(dstCols, 0);
      octx.scale(-1, 1);
    }
    octx.drawImage(sourceEl, cropX, cropY, cropW, cropH, 0, 0, dstCols, dstRows);
    octx.restore();
  }

  // --- Webcam Setup ---
  const hiddenVideo = document.createElement("video");
  hiddenVideo.autoplay = true;
  hiddenVideo.muted = true;
  hiddenVideo.playsInline = true;

  const offscreenCanvas = document.createElement("canvas");
  let mediaStream = null;
  let animTime = 0;

  async function startWebcam() {
    state.cameraStatus = "requesting";
    renderToolbarStatus();
    try {
      if (mediaStream) {
        mediaStream.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false
      });
      mediaStream = stream;
      hiddenVideo.srcObject = stream;
      await hiddenVideo.play();
      state.cameraStatus = "ready";
    } catch (err) {
      console.warn("Live webcam unavailable; using fallback portrait:", err);
      state.cameraStatus = "simulated";
    }
    renderAllUI();
  }

  function triggerCellByCellPaint(duration = 1400) {
    state.isPainting = true;
    state.paintProgress = 0.02;
    state.paintStartTime = performance.now();
    state.paintDuration = duration;
    sfx.playShutter();
  }

  // --- Live Market Tick Engine ---
  setInterval(() => {
    if (!state.liveMarketTick) return;
    const now = performance.now();
    const spDelta = (Math.random() - 0.492 + state.marketSentimentShift * 0.025) * 2.1;
    state.sp500Live = +(Math.max(4200, state.sp500Live + spDelta)).toFixed(2);
    state.nasdaqLive = +(Math.max(14000, state.nasdaqLive + spDelta * 3.6)).toFixed(2);
    state.ust10yLive = +(Math.max(2.5, Math.min(6.0, state.ust10yLive + (Math.random() - 0.5) * 0.01))).toFixed(2);

    for (let i = 0; i < 4; i++) {
      const sec = DATA.securities[Math.floor(Math.random() * DATA.securities.length)];
      const q = state.liveSecurityQuotes[sec.ticker];
      if (q) {
        const stepPct = (Math.random() - 0.49) * 0.24;
        const newChange = +(sec.change + state.marketSentimentShift * 1.15 + stepPct).toFixed(2);
        q.flash = newChange >= q.change ? 1 : -1;
        q.flashTime = now;
        q.change = newChange;
        q.price = +(sec.price * (1 + (newChange - sec.change) / 100)).toFixed(sec.price > 1000 ? 0 : 2);
      }
    }
    updateLiveHeaderNumbers();
  }, 700);

  function applyMarketSentimentToQuotes() {
    const now = performance.now();
    DATA.securities.forEach((sec) => {
      const q = state.liveSecurityQuotes[sec.ticker];
      if (q) {
        const beta = sec.industry === "capital_markets" ? 1.25 : sec.industry === "banking" ? 1.05 : 0.8;
        const newChange = +(sec.change + state.marketSentimentShift * beta).toFixed(2);
        q.flash = newChange >= q.change ? 1 : -1;
        q.flashTime = now;
        q.change = newChange;
        q.price = +(sec.price * (1 + (newChange - sec.change) / 100)).toFixed(sec.price > 1000 ? 0 : 2);
      }
    });
    state.sp500Live = +(5842.47 * (1 + state.marketSentimentShift / 100)).toFixed(2);
    state.nasdaqLive = +(20314.80 * (1 + (state.marketSentimentShift * 1.2) / 100)).toFixed(2);
    updateLiveHeaderNumbers();
  }

  // --- Frame Capture & Matrix Builder ---
  let frameCounter = 0;
  let lastFpsCheck = performance.now();

  function captureAndBuildMatrix(timestamp) {
    requestAnimationFrame(captureAndBuildMatrix);

    if (state.isPainting) {
      const elapsed = timestamp - state.paintStartTime;
      state.paintProgress = Math.min(1.0, elapsed / state.paintDuration);
      if (state.paintProgress >= 1.0) {
        state.isPainting = false;
        sfx.playChime();
      }
    }

    if (state.activeTab !== "live") {
      drawSpreadsheetCanvas();
      return;
    }

    if (!state.isPaused) {
      animTime += 0.032;
      const cols = state.cols;
      const rows = state.rows;
      if (offscreenCanvas.width !== cols || offscreenCanvas.height !== rows) {
        offscreenCanvas.width = cols;
        offscreenCanvas.height = rows;
      }
      const octx = offscreenCanvas.getContext("2d", { willReadFrequently: true });

      if (state.sceneMode === "webcam") {
        if (state.cameraStatus === "ready" && hiddenVideo.readyState >= 2) {
          drawSourceAspectCorrect(
            octx,
            hiddenVideo,
            hiddenVideo.videoWidth || 640,
            hiddenVideo.videoHeight || 480,
            cols,
            rows,
            state.mirrored
          );
        } else {
          drawFallbackCameraPortrait(octx, cols, rows, animTime);
        }
      } else if (state.sceneMode === "upload" && state.uploadedImage) {
        drawSourceAspectCorrect(
          octx,
          state.uploadedImage,
          state.uploadedImage.width,
          state.uploadedImage.height,
          cols,
          rows,
          false
        );
      } else {
        // Render one of the 5 Animated Quantitative Financial Artworks into the offscreen grid!
        drawAnimatedQuantScene(octx, cols, rows, animTime, state.sceneMode);
      }

      const rawImgData = octx.getImageData(0, 0, cols, rows);
      const sharpened =
        state.sceneMode === "webcam" || state.sceneMode === "upload"
          ? applyFacialClarityEnhancement(rawImgData, cols, rows, state.faceClarity)
          : rawImgData;
      const data = sharpened.data;

      const pool = getIndustrySecuritiesPool();
      const pixels = [];
      const totalCells = cols * rows;
      const maxPaintCellIndex = Math.floor(state.paintProgress * totalCells);

      for (let r = 0; r < rows; r++) {
        const rowArr = [];
        for (let c = 0; c < cols; c++) {
          const flatIdx = r * cols + c;
          const idx = flatIdx * 4;
          const mapped = mapPixelColor(data[idx], data[idx + 1], data[idx + 2]);

          const normLum = mapped.lum / 255;
          const baseIdx = Math.floor(normLum * (pool.length - 1));
          const offset = (r * 5 + c * 3) % Math.max(1, Math.min(3, pool.length));
          const secIdx = Math.max(0, Math.min(pool.length - 1, baseIdx + (normLum > 0.5 ? -offset : offset)));
          const sec = pool[secIdx] || pool[0];
          const quote = state.liveSecurityQuotes[sec.ticker] || sec;
          const quant = computeCellQuantMetrics(sec, quote, c, r, cols, rows, mapped.lum);

          rowArr.push({
            ...mapped,
            sec,
            quant,
            painted: !state.isPainting || flatIdx <= maxPaintCellIndex,
            mergedSpan: 1,
            skipRender: false
          });
        }
        pixels.push(rowArr);
      }

      // Smart Background Merging
      if (state.adaptiveMerge && state.cellDataMode !== "none") {
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols - 1; c++) {
            const cur = pixels[r][c];
            const nxt = pixels[r][c + 1];
            if (cur.skipRender || !cur.painted || !nxt.painted) continue;

            const diffNext =
              Math.abs(cur.r - nxt.r) + Math.abs(cur.g - nxt.g) + Math.abs(cur.b - nxt.b);
            const below = r < rows - 1 ? pixels[r + 1][c] : cur;
            const diffVertical =
              Math.abs(cur.r - below.r) + Math.abs(cur.g - below.g) + Math.abs(cur.b - below.b);

            if (diffNext < 10 && diffVertical < 12 && (r + c) % 2 === 0) {
              cur.mergedSpan = 2;
              nxt.skipRender = true;
              c++;
            }
          }
        }
      }

      state.currentFrame = {
        cols,
        rows,
        pixels,
        timestamp: Date.now()
      };
    }

    frameCounter++;
    if (timestamp - lastFpsCheck >= 1000) {
      state.fps = Math.round((frameCounter * 1000) / (timestamp - lastFpsCheck));
      frameCounter = 0;
      lastFpsCheck = timestamp;
      const fpsEl = document.getElementById("status-fps");
      if (fpsEl) fpsEl.textContent = `${state.fps} FPS • ${(state.cols * state.rows * state.fps).toLocaleString()} Quant Calcs/s`;
    }

    drawSpreadsheetCanvas();
  }

  // --- Main Spreadsheet Canvas Renderer ---
  function drawSpreadsheetCanvas() {
    const canvas = document.getElementById("spreadsheet-webcam-canvas");
    const container = document.getElementById("spreadsheet-grid-container");
    if (!canvas || !container) return;

    const frame =
      state.activeTab === "live"
        ? state.currentFrame
        : state.snapshots.find((s) => s.id === state.activeTab) || state.currentFrame;

    if (!frame || !frame.pixels) return;

    const dpr = window.devicePixelRatio || 1;
    const rowHeaderW = 42;
    const colHeaderH = 22;
    const cols = frame.cols;
    const rows = frame.rows;

    const rect = container.getBoundingClientRect();
    const availW = Math.max(320, rect.width - rowHeaderW - 8);
    const availH = Math.max(240, rect.height - colHeaderH - 8);

    const fitCellH = Math.min(availH / rows, availW / (cols * state.cellAspect));
    const cellH = Math.max(8, Math.round(fitCellH * state.zoom));
    const cellW = Math.max(10, Math.round(cellH * state.cellAspect));

    const totalGridW = rowHeaderW + cols * cellW;
    const totalGridH = colHeaderH + rows * cellH;
    const viewW = Math.max(totalGridW, Math.floor(rect.width));
    const viewH = Math.max(totalGridH, Math.floor(rect.height));

    const offsetX = Math.max(0, Math.floor((viewW - totalGridW) / 2));
    const offsetY = Math.max(0, Math.floor((viewH - totalGridH) / 2));

    canvas._gridLayout = { offsetX, offsetY, rowHeaderW, colHeaderH, cellW, cellH, cols, rows };

    if (canvas.width !== viewW * dpr || canvas.height !== viewH * dpr) {
      canvas.width = viewW * dpr;
      canvas.height = viewH * dpr;
      canvas.style.width = `${viewW}px`;
      canvas.style.height = `${viewH}px`;
    }

    const ctx = canvas.getContext("2d", { alpha: false });
    ctx.save();
    ctx.scale(dpr, dpr);

    ctx.fillStyle = "#080a0f";
    ctx.fillRect(0, 0, viewW, viewH);

    const originX = offsetX + rowHeaderW;
    const originY = offsetY + colHeaderH;

    // Render Spreadsheet Cells
    for (let r = 0; r < rows; r++) {
      const y = originY + r * cellH;
      for (let c = 0; c < cols; c++) {
        const px = frame.pixels[r] && frame.pixels[r][c];
        if (!px || px.skipRender) continue;

        const span = px.mergedSpan || 1;
        const x = originX + c * cellW;
        const w = span * cellW;

        if (!px.painted) {
          ctx.fillStyle = "#0e121b";
          ctx.fillRect(x, y, w, cellH);
          continue;
        }

        ctx.fillStyle = px.hex;
        ctx.fillRect(x, y, w, cellH);

        if (state.cellDataMode !== "none" && w >= 16 && cellH >= 9) {
          ctx.fillStyle = getToneMatchedTextColor(px, state.textBlendOpacity);
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const fontSize = Math.max(6, Math.min(11, Math.floor(cellH * 0.54)));
          ctx.font = `600 ${fontSize}px "JetBrains Mono", Consolas, monospace`;

          const text = formatCellString(px, span > 1);
          if (text) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(x + 1, y + 1, w - 2, cellH - 2);
            ctx.clip();
            ctx.fillText(text, x + w / 2, y + cellH / 2);
            ctx.restore();
          }
        }

        if (state.gridlines) {
          ctx.strokeStyle = "rgba(12, 16, 24, 0.24)";
          ctx.lineWidth = 0.75;
          ctx.strokeRect(x + 0.5, y + 0.5, w, cellH);
        }
      }
    }

    // Active Cell Selection Outline
    const actX = originX + state.activeCell.col * cellW;
    const actY = originY + state.activeCell.row * cellH;
    ctx.strokeStyle = "#00FF88";
    ctx.lineWidth = 2;
    ctx.strokeRect(actX + 0.5, actY + 0.5, cellW, cellH);

    // Column & Row Headers
    ctx.fillStyle = "#121621";
    ctx.fillRect(offsetX, offsetY, rowHeaderW, colHeaderH);
    ctx.strokeStyle = "#242c3f";
    ctx.strokeRect(offsetX + 0.5, offsetY + 0.5, rowHeaderW, colHeaderH);

    for (let c = 0; c < cols; c++) {
      const x = originX + c * cellW;
      const isAct = c === state.activeCell.col || (state.hoverCell && c === state.hoverCell.col);
      ctx.fillStyle = isAct ? "#1d2638" : "#121621";
      ctx.fillRect(x, offsetY, cellW, colHeaderH);
      ctx.strokeStyle = "#242c3f";
      ctx.strokeRect(x + 0.5, offsetY + 0.5, cellW, colHeaderH);
      if (isAct) {
        ctx.fillStyle = "#00FF88";
        ctx.fillRect(x, offsetY + colHeaderH - 2, cellW, 2);
      }
      if (cellW >= 16 || c % 2 === 0) {
        ctx.fillStyle = isAct ? "#00FF88" : "#8b95a5";
        ctx.font = '600 9px -apple-system, BlinkMacSystemFont, "Inter", sans-serif';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(colToLetter(c), x + cellW / 2, offsetY + colHeaderH / 2);
      }
    }

    for (let r = 0; r < rows; r++) {
      const y = originY + r * cellH;
      const isAct = r === state.activeCell.row || (state.hoverCell && r === state.hoverCell.row);
      ctx.fillStyle = isAct ? "#1d2638" : "#121621";
      ctx.fillRect(offsetX, y, rowHeaderW, cellH);
      ctx.strokeStyle = "#242c3f";
      ctx.strokeRect(offsetX + 0.5, y + 0.5, rowHeaderW, cellH);
      if (isAct) {
        ctx.fillStyle = "#00FF88";
        ctx.fillRect(offsetX + rowHeaderW - 2, y, 2, cellH);
      }
      if (cellH >= 11 || r % 2 === 0) {
        ctx.fillStyle = isAct ? "#00FF88" : "#8b95a5";
        ctx.font = '600 9px -apple-system, BlinkMacSystemFont, "Inter", sans-serif';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(r + 1), offsetX + rowHeaderW / 2, y + cellH / 2);
      }
    }

    // Hover Magnifier Loupe
    if (state.hoverLoupe && state.hoverCell) {
      drawDataMagnifierLoupe(ctx, frame, state.hoverCell, state.mousePos, viewW, viewH);
    }

    ctx.restore();
    updateFormulaBar(frame);
  }

  function drawDataMagnifierLoupe(ctx, frame, centerCell, mousePos, viewW, viewH) {
    const radiusCols = 2;
    const radiusRows = 2;
    const loupeCellW = 74;
    const loupeCellH = 28;
    const loupeW = (radiusCols * 2 + 1) * loupeCellW;
    const loupeH = (radiusRows * 2 + 1) * loupeCellH + 28;

    let lx = mousePos.x + 22;
    let ly = mousePos.y - loupeH / 2;
    if (lx + loupeW + 12 > viewW) lx = mousePos.x - loupeW - 22;
    if (ly < 10) ly = 10;
    if (ly + loupeH + 10 > viewH) ly = viewH - loupeH - 10;

    ctx.save();
    ctx.fillStyle = "rgba(9, 12, 18, 0.96)";
    ctx.strokeStyle = "#38BDF8";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(lx, ly, loupeW, loupeH, 8);
    ctx.fill();
    ctx.stroke();

    const centerPx =
      frame.pixels[centerCell.row] && frame.pixels[centerCell.row][centerCell.col];
    const sec = centerPx ? centerPx.sec : null;
    const modelObj = DATA.quantModels[state.quantModel];

    ctx.fillStyle = "#141A29";
    ctx.fillRect(lx + 1, ly + 1, loupeW - 2, 26);
    ctx.fillStyle = "#00FF88";
    ctx.font = '700 10px "JetBrains Mono", monospace';
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const headerText = sec
      ? `🔍 ${cellCoordToString(centerCell)} • ${sec.name} (${sec.ticker}) • ${modelObj ? modelObj.shortBadge : ""}`
      : `🔍 Cell ${cellCoordToString(centerCell)}`;
    ctx.fillText(headerText, lx + 8, ly + 14);

    const gridStartY = ly + 27;
    for (let dr = -radiusRows; dr <= radiusRows; dr++) {
      for (let dc = -radiusCols; dc <= radiusCols; dc++) {
        const r = centerCell.row + dr;
        const c = centerCell.col + dc;
        const cx = lx + (dc + radiusCols) * loupeCellW;
        const cy = gridStartY + (dr + radiusRows) * loupeCellH;

        if (r >= 0 && r < frame.rows && c >= 0 && c < frame.cols) {
          const px = frame.pixels[r][c];
          ctx.fillStyle = px.hex;
          ctx.fillRect(cx, cy, loupeCellW, loupeCellH);

          if (px.quant) {
            ctx.fillStyle = px.lum > 135 ? "#090B10" : "#FFFFFF";
            ctx.font = '700 8.5px "JetBrains Mono", monospace';
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(px.quant.loupeLine1, cx + loupeCellW / 2, cy + 9);

            ctx.font = '500 7.5px "JetBrains Mono", monospace';
            ctx.fillStyle = px.lum > 135 ? "rgba(9,11,16,0.78)" : "rgba(255,255,255,0.85)";
            ctx.fillText(px.quant.loupeLine2, cx + loupeCellW / 2, cy + 20);
          }

          ctx.strokeStyle = dr === 0 && dc === 0 ? "#00FF88" : "rgba(15, 20, 30, 0.5)";
          ctx.lineWidth = dr === 0 && dc === 0 ? 2 : 1;
          ctx.strokeRect(cx + 0.5, cy + 0.5, loupeCellW - 1, loupeCellH - 1);
        } else {
          ctx.fillStyle = "#0B0E16";
          ctx.fillRect(cx, cy, loupeCellW, loupeCellH);
        }
      }
    }
    ctx.restore();
  }

  function updateFormulaBar(frame) {
    if (!frame || !frame.pixels) return;
    const target = state.hoverCell || state.activeCell;
    const px = frame.pixels[target.row] && frame.pixels[target.row][target.col];
    if (!px) return;

    const addrEl = document.getElementById("formula-cell-address");
    const fxEl = document.getElementById("formula-bar-input");
    const swatchEl = document.getElementById("formula-color-swatch");
    const metaEl = document.getElementById("formula-cell-meta");

    if (addrEl) addrEl.value = cellCoordToString(target);
    if (fxEl && px.quant) fxEl.value = px.quant.formula;
    if (swatchEl) swatchEl.style.backgroundColor = px.hex;
    if (metaEl && px.sec) {
      const conn = DATA.connectors.find((c) => c.id === px.sec.connector);
      metaEl.innerHTML = `<span class="text-[#38BDF8] font-semibold">${conn ? conn.shortName : "Data"}</span> • <span>${px.sec.name}</span>`;
    }
  }

  function updateLiveHeaderNumbers() {
    const ind = DATA.industries[state.industry];
    const lbl1 = document.getElementById("live-idx1-label");
    const val1 = document.getElementById("live-idx1-val");
    const lbl2 = document.getElementById("live-idx2-label");
    const val2 = document.getElementById("live-idx2-val");

    const pct = ((state.sp500Live - 5842.47) / 5842.47) * 100 + 0.65;
    const sign = pct >= 0 ? "+" : "";

    if (lbl1 && ind) lbl1.textContent = `${ind.indexName}:`;
    if (val1) {
      val1.innerHTML = `${state.sp500Live.toLocaleString()} <span class="${pct >= 0 ? "text-[#00FF88]" : "text-[#F87171]"}">(${sign}${pct.toFixed(2)}%)</span>`;
    }
    if (lbl2 && ind) lbl2.textContent = `${ind.secondaryName}:`;
    if (val2) val2.textContent = state.nasdaqLive.toLocaleString();
  }

  function renderIndustryButtons() {
    const container = document.getElementById("industry-selector-group");
    if (!container) return;
    container.innerHTML = Object.values(DATA.industries)
      .map((ind) => {
        const active = state.industry === ind.id;
        return `
          <button
            type="button"
            data-industry="${ind.id}"
            class="ind-btn px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
              active
                ? "bg-[#107C41] border-[#00FF88] text-white shadow-sm"
                : "bg-[#141824] border-[#262F45] text-[#94A3B8] hover:text-white hover:bg-[#1B2232]"
            }"
          >
            <span>${ind.name}</span>
            <span class="hidden xl:inline text-[10px] opacity-80 font-normal">(${ind.metricLabel})</span>
          </button>
        `;
      })
      .join("");

    container.querySelectorAll(".ind-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        sfx.playTick(820);
        state.industry = btn.getAttribute("data-industry");
        renderIndustryButtons();
        renderTickerTape();
        updateLiveHeaderNumbers();
      });
    });
  }

  function renderConnectorsStrip() {
    const container = document.getElementById("connectors-strip");
    if (!container) return;
    container.innerHTML = DATA.connectors
      .map((conn) => {
        const active = state.activeConnectors.has(conn.id);
        return `
          <button
            type="button"
            data-conn="${conn.id}"
            class="conn-pill px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
              active
                ? "bg-[#172234] text-white border-[#38BDF8]/60"
                : "bg-[#10141D] text-[#64748B] border-[#202636] opacity-55 hover:opacity-90"
            }"
          >
            <span class="w-1.5 h-1.5 rounded-full" style="background:${active ? conn.color : "#475569"}"></span>
            <span>${conn.shortName}</span>
          </button>
        `;
      })
      .join("");

    container.querySelectorAll(".conn-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        sfx.playTick();
        const id = btn.getAttribute("data-conn");
        if (state.activeConnectors.has(id) && state.activeConnectors.size > 1) {
          state.activeConnectors.delete(id);
        } else {
          state.activeConnectors.add(id);
        }
        renderConnectorsStrip();
      });
    });
  }

  function renderTickerTape() {
    const track = document.getElementById("live-ticker-track");
    if (!track) return;
    const pool = DATA.securities.filter((s) => s.industry === state.industry);
    const items = pool.map((sec) => {
      const q = state.liveSecurityQuotes[sec.ticker] || sec;
      const sign = q.change >= 0 ? "+" : "";
      const color = q.change >= 0 ? "text-[#00FF88]" : "text-[#F87171]";
      return `
        <div class="inline-flex items-center gap-1.5 px-3 py-0.5 text-[11px] font-mono-code border-r border-[#1C2230]">
          <span class="font-bold text-white">${sec.ticker}</span>
          <span class="text-[#94A3B8]">$${q.price.toLocaleString()}</span>
          <span class="${color} font-semibold">${sign}${q.change.toFixed(2)}%</span>
          <span class="text-[10px] px-1.5 rounded bg-[#161E2E] text-[#38BDF8]">${sec.industryMetric}</span>
        </div>
      `;
    });
    track.innerHTML = items.join("") + items.join("");
  }

  function renderToolbarStatus() {
    const camBtn = document.getElementById("btn-webcam-status");
    if (!camBtn) return;
    if (state.sceneMode === "webcam" && state.cameraStatus === "ready") {
      camBtn.innerHTML = `<span class="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse"></span><span>LIVE CAM</span>`;
      camBtn.className =
        "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-[#064E3B] text-[#6EE7B7] border border-[#059669] cursor-pointer";
    } else {
      camBtn.innerHTML = `<span>📹 Switch to Webcam</span>`;
      camBtn.className =
        "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-[#1E293B] hover:bg-[#28354A] text-[#7DD3FC] border border-[#38BDF8]/40 cursor-pointer";
    }
  }

  function renderBottomTabs() {
    const container = document.getElementById("sheet-tabs-container");
    if (!container) return;

    let html = `
      <button
        type="button"
        id="tab-btn-live"
        class="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-t border-b-2 transition-colors cursor-pointer ${
          state.activeTab === "live"
            ? "bg-[#1A1E29] text-[#00FF88] border-[#00FF88]"
            : "text-[#94A3B8] hover:bg-[#161B24] border-transparent"
        }"
      >
        <span class="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse"></span>
        <span>Live_Canvas_Sheet</span>
      </button>
    `;

    state.snapshots.forEach((snap) => {
      const isAct = state.activeTab === snap.id;
      html += `
        <button
          type="button"
          data-snap-id="${snap.id}"
          class="snap-tab-btn flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-t border-b-2 transition-colors cursor-pointer ${
            isAct
              ? "bg-[#1A1E29] text-[#38BDF8] border-[#38BDF8]"
              : "text-[#94A3B8] hover:bg-[#161B24] border-transparent"
          }"
        >
          <span>📸 ${snap.title}</span>
        </button>
      `;
    });

    container.innerHTML = html;

    document.getElementById("tab-btn-live")?.addEventListener("click", () => {
      sfx.playTick();
      state.activeTab = "live";
      renderBottomTabs();
    });

    container.querySelectorAll(".snap-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        sfx.playTick();
        state.activeTab = btn.getAttribute("data-snap-id");
        renderBottomTabs();
      });
    });
  }

  function takeSnapshot() {
    if (!state.currentFrame) return;
    sfx.playShutter();
    const id = `snap_${Date.now()}`;
    const copy = JSON.parse(JSON.stringify(state.currentFrame));
    state.snapshots.push({
      id,
      title: `Snapshot_${state.snapshots.length + 1}`,
      ...copy
    });
    state.activeTab = id;
    renderBottomTabs();
  }

  function buildColoredSpreadsheetHtml(frame) {
    let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"></head><body><table border="1" style="border-collapse:collapse; font-family:monospace; font-size:8px;">`;
    for (let r = 0; r < frame.rows; r++) {
      html += `<tr>`;
      for (let c = 0; c < frame.cols; c++) {
        const px = frame.pixels[r][c];
        const fg = getToneMatchedTextColor(px, 0.55);
        const text = formatCellString(px, false);
        html += `<td style="background-color:${px.hex}; color:${fg}; width:38px; height:16px; text-align:center;">${text}</td>`;
      }
      html += `</tr>`;
    }
    html += `</table></body></html>`;
    return html;
  }

  function downloadExcelFile() {
    if (!state.currentFrame) return;
    sfx.playChime();
    const html = buildColoredSpreadsheetHtml(state.currentFrame);
    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Excellent_Portrait_${state.sceneMode}_${Date.now()}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function copyForGoogleSheets() {
    if (!state.currentFrame) return;
    sfx.playChime();
    const html = buildColoredSpreadsheetHtml(state.currentFrame);
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([html], { type: "text/html" }),
            "text/plain": new Blob(["[Excel]lent Financial Portrait"], { type: "text/plain" })
          })
        ]);
      } else {
        await navigator.clipboard.writeText(html);
      }
      showToast("Copied colored financial spreadsheet! Open Google Sheets or Excel and press Cmd+V.");
    } catch {
      showToast("Copied spreadsheet matrix!");
    }
  }

  function downloadHighResPng() {
    const canvas = document.getElementById("spreadsheet-webcam-canvas");
    if (!canvas) return;
    sfx.playChime();
    const prevHover = state.hoverCell;
    state.hoverCell = null;
    drawSpreadsheetCanvas();
    const url = canvas.toDataURL("image/png");
    state.hoverCell = prevHover;
    const a = document.createElement("a");
    a.href = url;
    a.download = `Excellent_Portrait_${state.sceneMode}_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function showToast(msg) {
    const toast = document.getElementById("toast-notification");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 3400);
  }

  function renderAllUI() {
    renderIndustryButtons();
    renderConnectorsStrip();
    renderTickerTape();
    renderToolbarStatus();
    renderBottomTabs();
    updateLiveHeaderNumbers();
  }

  // --- Wire Up DOM Controls ---
  window.addEventListener("DOMContentLoaded", () => {
    renderAllUI();
    startWebcam();
    requestAnimationFrame(captureAndBuildMatrix);

    // Primary Scene / Quant Visual Mode Selector
    const sceneSel = document.getElementById("select-scene-mode");
    if (sceneSel) {
      sceneSel.addEventListener("change", (e) => {
        const val = e.target.value;
        sfx.playChime();
        if (val === "upload") {
          document.getElementById("input-upload-photo")?.click();
          return;
        }
        state.sceneMode = val;

        // Automatically pair each animated quantitative scene with its matching mathematical formula engine!
        if (val === "vol_surface_3d") {
          state.quantModel = "black_scholes";
        } else if (val === "lorenz_attractor") {
          state.quantModel = "monte_carlo";
        } else if (val === "capital_globe") {
          state.quantModel = "efficient_frontier";
        } else if (val === "bull_candlesticks") {
          state.quantModel = "dcf_sensitivity";
        } else if (val === "quant_skyline") {
          state.quantModel = "credit_var";
        } else if (val === "webcam" && state.cameraStatus !== "ready") {
          startWebcam();
        }
        renderToolbarStatus();
      });
    }

    document.getElementById("btn-webcam-status")?.addEventListener("click", () => {
      state.sceneMode = "webcam";
      const sceneSelEl = document.getElementById("select-scene-mode");
      if (sceneSelEl) sceneSelEl.value = "webcam";
      startWebcam();
    });

    const fileInput = document.getElementById("input-upload-photo");
    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = new Image();
          img.onload = () => {
            state.uploadedImage = img;
            state.sceneMode = "upload";
            renderToolbarStatus();
            triggerCellByCellPaint(1400);
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    const pauseBtn = document.getElementById("btn-pause-stream");
    if (pauseBtn) {
      pauseBtn.addEventListener("click", () => {
        sfx.playTick();
        state.isPaused = !state.isPaused;
        pauseBtn.textContent = state.isPaused ? "▶ Resume" : "⏸ Freeze";
      });
    }

    document.getElementById("btn-repaint-cells")?.addEventListener("click", () => triggerCellByCellPaint(1500));

    document.getElementById("select-cell-mode")?.addEventListener("change", (e) => {
      sfx.playTick();
      state.cellDataMode = e.target.value;
    });

    document.getElementById("select-palette")?.addEventListener("change", (e) => {
      sfx.playTick();
      state.palette = e.target.value;
    });

    document.getElementById("select-grid-res")?.addEventListener("change", (e) => {
      sfx.playTick();
      const [c, r] = e.target.value.split("x").map(Number);
      state.cols = c;
      state.rows = r;
      state.activeCell = { col: Math.floor(c / 2), row: Math.floor(r / 2) };
    });

    const claritySlider = document.getElementById("slider-face-clarity");
    const clarityLabel = document.getElementById("label-face-clarity");
    if (claritySlider) {
      claritySlider.addEventListener("input", (e) => {
        state.faceClarity = Number(e.target.value);
        if (clarityLabel) clarityLabel.textContent = `${state.faceClarity}%`;
      });
    }

    const textBlendSlider = document.getElementById("slider-text-blend");
    const textBlendLabel = document.getElementById("label-text-blend");
    if (textBlendSlider) {
      textBlendSlider.addEventListener("input", (e) => {
        const pct = Number(e.target.value);
        state.textBlendOpacity = pct / 100;
        if (textBlendLabel) textBlendLabel.textContent = `${pct}%`;
      });
    }

    const sentimentSlider = document.getElementById("slider-market-sentiment");
    const sentimentLabel = document.getElementById("label-market-sentiment");
    if (sentimentSlider) {
      sentimentSlider.addEventListener("input", (e) => {
        state.marketSentimentShift = parseFloat(e.target.value);
        if (sentimentLabel) {
          const sign = state.marketSentimentShift >= 0 ? "+" : "";
          sentimentLabel.textContent = `${sign}${state.marketSentimentShift.toFixed(1)}%`;
          sentimentLabel.className = `font-mono-code text-xs font-bold w-11 text-right ${
            state.marketSentimentShift > 0
              ? "text-[#00FF88]"
              : state.marketSentimentShift < 0
              ? "text-[#F87171]"
              : "text-[#CBD5E1]"
          }`;
        }
        applyMarketSentimentToQuotes();
        renderTickerTape();
      });
    }

    const mergeBtn = document.getElementById("btn-toggle-merge");
    if (mergeBtn) {
      mergeBtn.addEventListener("click", () => {
        sfx.playTick();
        state.adaptiveMerge = !state.adaptiveMerge;
        mergeBtn.className = `px-2.5 py-1 rounded text-xs font-medium border transition-colors cursor-pointer ${
          state.adaptiveMerge
            ? "bg-[#064E3B] text-[#00FF88] border-[#059669]"
            : "bg-[#1A2030] text-[#94A3B8] border-[#2E384D]"
        }`;
      });
    }

    const loupeBtn = document.getElementById("btn-toggle-loupe");
    if (loupeBtn) {
      loupeBtn.addEventListener("click", () => {
        sfx.playTick();
        state.hoverLoupe = !state.hoverLoupe;
        loupeBtn.className = `px-2.5 py-1 rounded text-xs font-medium border transition-colors cursor-pointer ${
          state.hoverLoupe
            ? "bg-[#16273C] text-[#38BDF8] border-[#38BDF8]/60"
            : "bg-[#1A2030] text-[#94A3B8] border-[#2E384D]"
        }`;
      });
    }

    const zoomIn = document.getElementById("btn-zoom-in");
    const zoomOut = document.getElementById("btn-zoom-out");
    const zoomLbl = document.getElementById("label-zoom");
    if (zoomIn) {
      zoomIn.addEventListener("click", () => {
        sfx.playTick();
        state.zoom = Math.min(2.5, +(state.zoom + 0.2).toFixed(2));
        if (zoomLbl) zoomLbl.textContent = `${Math.round(state.zoom * 100)}%`;
      });
    }
    if (zoomOut) {
      zoomOut.addEventListener("click", () => {
        sfx.playTick();
        state.zoom = Math.max(0.6, +(state.zoom - 0.2).toFixed(2));
        if (zoomLbl) zoomLbl.textContent = `${Math.round(state.zoom * 100)}%`;
      });
    }

    document.getElementById("btn-take-snapshot")?.addEventListener("click", takeSnapshot);
    document.getElementById("btn-copy-sheets")?.addEventListener("click", copyForGoogleSheets);
    document.getElementById("btn-dl-excel")?.addEventListener("click", downloadExcelFile);
    document.getElementById("btn-dl-png")?.addEventListener("click", downloadHighResPng);

    // Canvas Mouse Interaction
    const canvas = document.getElementById("spreadsheet-webcam-canvas");
    if (canvas) {
      const getCellFromMouse = (ev) => {
        const rect = canvas.getBoundingClientRect();
        const x = ev.clientX - rect.left;
        const y = ev.clientY - rect.top;
        state.mousePos = { x, y };
        const L = canvas._gridLayout;
        if (!L) return null;
        const gx = x - (L.offsetX + L.rowHeaderW);
        const gy = y - (L.offsetY + L.colHeaderH);
        if (gx < 0 || gy < 0) return null;
        const col = Math.floor(gx / L.cellW);
        const row = Math.floor(gy / L.cellH);
        if (col >= 0 && col < L.cols && row >= 0 && row < L.rows) {
          return { col, row };
        }
        return null;
      };

      canvas.addEventListener("mousedown", (ev) => {
        const cell = getCellFromMouse(ev);
        if (!cell) return;
        sfx.playTick(700);
        state.activeCell = cell;
      });

      canvas.addEventListener("mousemove", (ev) => {
        state.hoverCell = getCellFromMouse(ev);
      });

      canvas.addEventListener("mouseleave", () => {
        state.hoverCell = null;
      });
    }
  });
})();
