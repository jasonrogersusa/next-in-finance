// ============================================================================
// [Excel]lent Portrait — Industry Financial Data & Gemini Quantitative Models
// ============================================================================

window.EXCELLENT_DATA = {
  industries: {
    capital_markets: {
      id: "capital_markets",
      name: "Capital Markets",
      badge: "Equities • Valuation • M&A",
      metricLabel: "EV/EBITDA & P/E",
      indexName: "S&P 500",
      indexBase: 5842.47,
      secondaryName: "NASDAQ 100",
      secondaryBase: 20314.80,
      rateName: "10Y UST",
      rateBase: 4.08
    },
    banking: {
      id: "banking",
      name: "Banking & Lending",
      badge: "CET1 • NIM • Credit Risk",
      metricLabel: "CET1 & NIM %",
      indexName: "KBW Bank Index",
      indexBase: 118.64,
      secondaryName: "IG CDX Spread",
      secondaryBase: 52.40,
      rateName: "2Y/10Y Curve",
      rateBase: 0.16
    },
    insurance: {
      id: "insurance",
      name: "Insurance & Actuarial",
      badge: "Combined Ratio • VaR • Float",
      metricLabel: "Combined Ratio",
      indexName: "S&P Insurance",
      indexBase: 742.15,
      secondaryName: "Cat Bond Yield",
      secondaryBase: 9.45,
      rateName: "30Y Muni",
      rateBase: 3.82
    }
  },

  // Gemini Agent Quantitative Calculation Modes (replaces generic art presets!)
  // Every mode keeps your LIVE WEBCAM on while changing the complex financial calculation
  // that Gemini is computing across the cells and background of your portrait.
  quantModels: {
    dcf_sensitivity: {
      id: "dcf_sensitivity",
      name: "🧮 Gemini DCF Sensitivity (WACC × Terminal Growth)",
      shortBadge: "2-Way DCF Matrix",
      description: "Computes live Discounted Cash Flow intrinsic value across WACC (7.2%–11.8%) and Terminal Growth (1.5%–4.5%) in every cell."
    },
    monte_carlo: {
      id: "monte_carlo",
      name: "🎲 Monte Carlo Stochastic Fan (10,000 Paths)",
      shortBadge: "dS = μSdt + σSdW",
      description: "Simulates live Geometric Brownian Motion price trajectories and 95% confidence cones radiating across the spreadsheet behind your portrait."
    },
    black_scholes: {
      id: "black_scholes",
      name: "📐 Black-Scholes Option Greeks & Vol Surface",
      shortBadge: "Δ Delta • Γ Gamma • σ IV",
      description: "Calculates live Black-Scholes Implied Volatility surfaces and Option Greeks (Delta, Gamma, Vega) mapped to pixel luminance and moneyness."
    },
    credit_var: {
      id: "credit_var",
      name: "🏛️ Basel III Credit VaR & Default Transition Matrix",
      shortBadge: "99% VaR • PD × LGD",
      description: "Runs live Moody's credit migration probabilities, Loss Given Default (LGD), and 99% Tail Value-at-Risk stress calculations."
    },
    efficient_frontier: {
      id: "efficient_frontier",
      name: "🧬 Markowitz Covariance & Sharpe Optimizer",
      shortBadge: "Sharpe • β Beta • ρ Corr",
      description: "Computes cross-asset rolling correlation (ρ), portfolio Beta (β), and risk-adjusted Sharpe ratios across connected data sources."
    },
    multi_source_comps: {
      id: "multi_source_comps",
      name: "📊 Multi-Source Peer Comps (Cap IQ + PitchBook)",
      shortBadge: "Live Comps Engine",
      description: "Synthesizes live public valuation multiples (S&P Cap IQ) with private M&A deal comps (PitchBook) and 10-K audited margins."
    }
  },

  connectors: [
    { id: "sp_capiq", name: "S&P Capital IQ", shortName: "S&P Cap IQ", color: "#10B981" },
    { id: "moodys", name: "Moody's CreditView", shortName: "Moody's", color: "#38BDF8" },
    { id: "pitchbook", name: "PitchBook Data", shortName: "PitchBook", color: "#F59E0B" },
    { id: "sec_edgar", name: "SEC 10-K Filings", shortName: "SEC 10-K", color: "#A855F7" },
    { id: "factset", name: "FactSet Markets", shortName: "FactSet", color: "#EC4899" }
  ],

  securities: [
    // Capital Markets
    { ticker: "NVDA", name: "NVIDIA Corp.", industry: "capital_markets", connector: "sp_capiq", price: 138.60, change: 4.25, mcap: "$3.39T", pe: 46.2, rating: "Aa3", industryMetric: "46.2x P/E", fcfB: 64.2, iv: 48.5, beta: 1.68, pdBps: 14, spark: "▁▂▃▅▆▇█" },
    { ticker: "AAPL", name: "Apple Inc.", industry: "capital_markets", connector: "sp_capiq", price: 233.85, change: 1.84, mcap: "$3.55T", pe: 34.1, rating: "Aaa", industryMetric: "34.1x P/E", fcfB: 108.8, iv: 22.4, beta: 1.24, pdBps: 4, spark: "▃▄▅▄▆▇█" },
    { ticker: "MSFT", name: "Microsoft Corp.", industry: "capital_markets", connector: "sec_edgar", price: 428.50, change: 1.42, mcap: "$3.18T", pe: 35.4, rating: "Aaa", industryMetric: "25.1x EV", fcfB: 74.1, iv: 21.8, beta: 1.12, pdBps: 4, spark: "▃▄▅▆▆▇▇" },
    { ticker: "GOOGL", name: "Alphabet Inc.", industry: "capital_markets", connector: "factset", price: 181.20, change: 2.95, mcap: "$2.24T", pe: 24.8, rating: "Aa2", industryMetric: "24.8x P/E", fcfB: 69.5, iv: 26.2, beta: 1.18, pdBps: 9, spark: "▂▃▄▅▆▇█" },
    { ticker: "AMZN", name: "Amazon.com", industry: "capital_markets", connector: "sec_edgar", price: 204.10, change: 2.30, mcap: "$2.14T", pe: 41.2, rating: "A1", industryMetric: "19.4x EV", fcfB: 54.3, iv: 28.4, beta: 1.31, pdBps: 18, spark: "▂▃▄▅▆▆█" },
    { ticker: "META", name: "Meta Platforms", industry: "capital_markets", connector: "factset", price: 592.40, change: 3.15, mcap: "$1.49T", pe: 28.6, rating: "Aa3", industryMetric: "28.6x P/E", fcfB: 52.1, iv: 34.0, beta: 1.42, pdBps: 12, spark: "▁▃▄▅▆▇█" },
    { ticker: "AVGO", name: "Broadcom Inc.", industry: "capital_markets", connector: "pitchbook", price: 179.50, change: 3.60, mcap: "$838B", pe: 37.5, rating: "Baa1", industryMetric: "28.2x EV", fcfB: 22.8, iv: 39.2, beta: 1.48, pdBps: 42, spark: "▂▃▄▅▇▇█" },
    { ticker: "BX", name: "Blackstone Inc.", industry: "capital_markets", connector: "pitchbook", price: 172.30, change: 3.50, mcap: "$210B", pe: 34.2, rating: "A1", industryMetric: "$1.1T AUM", fcfB: 6.8, iv: 27.5, beta: 1.36, pdBps: 21, spark: "▁▂▄▅▆▇█" },
    { ticker: "KKR", name: "KKR & Co.", industry: "capital_markets", connector: "pitchbook", price: 144.80, change: 3.90, mcap: "$128B", pe: 28.9, rating: "A2", industryMetric: "12.4x LBO", fcfB: 5.4, iv: 29.8, beta: 1.44, pdBps: 28, spark: "▁▂▃▅▆▇█" },
    { ticker: "BLK", name: "BlackRock Inc.", industry: "capital_markets", connector: "sp_capiq", price: 1014.50, change: 2.85, mcap: "$150B", pe: 23.8, rating: "Aa3", industryMetric: "$11.5T AUM", fcfB: 6.2, iv: 19.6, beta: 1.15, pdBps: 11, spark: "▂▃▄▅▆▇█" },
    { ticker: "LLY", name: "Eli Lilly & Co.", industry: "capital_markets", connector: "pitchbook", price: 898.20, change: 2.10, mcap: "$853B", pe: 58.0, rating: "A1", industryMetric: "58.0x P/E", fcfB: 8.9, iv: 31.2, beta: 0.72, pdBps: 16, spark: "▂▃▅▆▇▇█" },
    { ticker: "CRM", name: "Salesforce Inc.", industry: "capital_markets", connector: "factset", price: 312.40, change: 1.95, mcap: "$302B", pe: 31.2, rating: "A2", industryMetric: "21.5x EV", fcfB: 11.4, iv: 27.9, beta: 1.26, pdBps: 24, spark: "▃▃▄▅▆▇█" },
    { ticker: "ORCL", name: "Oracle Corp.", industry: "capital_markets", connector: "moodys", price: 176.80, change: 2.75, mcap: "$489B", pe: 29.4, rating: "Baa2", industryMetric: "29.4x P/E", fcfB: 11.8, iv: 28.1, beta: 1.08, pdBps: 58, spark: "▁▂▄▅▆▇█" },
    { ticker: "TSLA", name: "Tesla Inc.", industry: "capital_markets", connector: "sp_capiq", price: 254.70, change: -1.65, mcap: "$812B", pe: 68.4, rating: "Baa3", industryMetric: "44.0x EV", fcfB: 4.4, iv: 56.4, beta: 2.12, pdBps: 85, spark: "▆▅▃▂▄▆▅" },
    { ticker: "AMD", name: "AMD Inc.", industry: "capital_markets", connector: "sp_capiq", price: 156.20, change: -0.85, mcap: "$252B", pe: 42.0, rating: "A2", industryMetric: "31.4x EV", fcfB: 4.8, iv: 44.2, beta: 1.64, pdBps: 26, spark: "▄▅▆▅▄▅▄" },
    { ticker: "INTC", name: "Intel Corp.", industry: "capital_markets", connector: "moodys", price: 22.80, change: -3.20, mcap: "$97B", pe: 21.5, rating: "Baa1", industryMetric: "0.9x P/B", fcfB: 1.2, iv: 49.0, beta: 1.35, pdBps: 68, spark: "▇▆▅▃▂▁▂" },

    // Banking & Lending
    { ticker: "JPM", name: "JPMorgan Chase", industry: "banking", connector: "moodys", price: 231.40, change: 1.75, mcap: "$654B", pe: 12.8, rating: "Aa2", industryMetric: "15.3% CET1", fcfB: 48.2, iv: 18.4, beta: 1.06, pdBps: 11, spark: "▃▄▅▆▆▇█" },
    { ticker: "BAC", name: "Bank of America", industry: "banking", connector: "moodys", price: 42.65, change: 1.15, mcap: "$329B", pe: 13.4, rating: "A1", industryMetric: "1.98% NIM", fcfB: 26.4, iv: 21.2, beta: 1.22, pdBps: 19, spark: "▃▃▄▅▆▆▇" },
    { ticker: "WFC", name: "Wells Fargo", industry: "banking", connector: "moodys", price: 65.10, change: 1.90, mcap: "$221B", pe: 12.5, rating: "A1", industryMetric: "11.4% CET1", fcfB: 19.8, iv: 22.0, beta: 1.14, pdBps: 21, spark: "▂▃▄▅▆▇▇" },
    { ticker: "GS", name: "Goldman Sachs", industry: "banking", connector: "pitchbook", price: 528.90, change: 2.65, mcap: "$167B", pe: 14.6, rating: "A2", industryMetric: "1.5x P/TBV", fcfB: 14.2, iv: 23.6, beta: 1.32, pdBps: 27, spark: "▂▃▄▅▆▇█" },
    { ticker: "MS", name: "Morgan Stanley", industry: "banking", connector: "sp_capiq", price: 121.30, change: 2.40, mcap: "$196B", pe: 16.2, rating: "A1", industryMetric: "15.1% CET1", fcfB: 13.5, iv: 22.8, beta: 1.25, pdBps: 20, spark: "▂▃▄▅▆▇█" },
    { ticker: "C", name: "Citigroup Inc.", industry: "banking", connector: "sec_edgar", price: 66.80, change: -0.45, mcap: "$126B", pe: 11.2, rating: "A3", industryMetric: "0.7x P/TBV", fcfB: 11.2, iv: 25.4, beta: 1.38, pdBps: 36, spark: "▃▄▅▆▅▄▅" },
    { ticker: "USB", name: "U.S. Bancorp", industry: "banking", connector: "moodys", price: 49.10, change: -0.60, mcap: "$76B", pe: 11.9, rating: "A2", industryMetric: "2.68% NIM", fcfB: 6.8, iv: 24.1, beta: 1.18, pdBps: 29, spark: "▄▅▅▄▃▄▅" },
    { ticker: "PNC", name: "PNC Financial", industry: "banking", connector: "sec_edgar", price: 192.40, change: 1.10, mcap: "$76B", pe: 13.8, rating: "A3", industryMetric: "2.64% NIM", fcfB: 6.1, iv: 22.5, beta: 1.16, pdBps: 33, spark: "▃▄▅▅▆▆▇" },
    { ticker: "TFC", name: "Truist Financial", industry: "banking", connector: "moodys", price: 44.20, change: 0.80, mcap: "$59B", pe: 11.6, rating: "Baa1", industryMetric: "11.6% CET1", fcfB: 5.2, iv: 25.0, beta: 1.24, pdBps: 44, spark: "▃▄▅▅▆▆▆" },
    { ticker: "SCHW", name: "Charles Schwab", industry: "banking", connector: "sp_capiq", price: 74.20, change: 0.95, mcap: "$136B", pe: 22.4, rating: "A2", industryMetric: "2.12% NIM", fcfB: 7.4, iv: 26.8, beta: 1.28, pdBps: 25, spark: "▄▃▃▄▅▆▆" },
    { ticker: "COF", name: "Capital One", industry: "banking", connector: "sec_edgar", price: 162.80, change: 2.15, mcap: "$62B", pe: 11.4, rating: "Baa1", industryMetric: "6.84% NIM", fcfB: 8.4, iv: 27.2, beta: 1.34, pdBps: 48, spark: "▂▃▄▅▆▇█" },
    { ticker: "BK", name: "BNY Mellon", industry: "banking", connector: "moodys", price: 76.90, change: 1.65, mcap: "$56B", pe: 13.1, rating: "Aa3", industryMetric: "11.9% CET1", fcfB: 4.9, iv: 19.2, beta: 1.04, pdBps: 13, spark: "▂▃▄▅▆▇█" },

    // Insurance & Actuarial
    { ticker: "BRK.A", name: "Berkshire Hathaway", industry: "insurance", connector: "sec_edgar", price: 682500, change: 1.35, mcap: "$982B", pe: 21.4, rating: "Aa2", industryMetric: "$169B Float", fcfB: 38.5, iv: 14.8, beta: 0.86, pdBps: 8, spark: "▃▄▅▅▆▇█" },
    { ticker: "CB", name: "Chubb Limited", industry: "insurance", connector: "moodys", price: 291.60, change: 1.60, mcap: "$118B", pe: 12.9, rating: "Aa3", industryMetric: "86.4% CR", fcfB: 11.2, iv: 16.4, beta: 0.68, pdBps: 12, spark: "▃▄▅▆▆▇█" },
    { ticker: "PGR", name: "Progressive Corp.", industry: "insurance", connector: "sp_capiq", price: 256.40, change: 2.80, mcap: "$150B", pe: 19.2, rating: "Aa2", industryMetric: "89.1% CR", fcfB: 10.4, iv: 19.8, beta: 0.58, pdBps: 10, spark: "▁▂▄▅▆▇█" },
    { ticker: "TRV", name: "Travelers Cos.", industry: "insurance", connector: "moodys", price: 264.10, change: 2.15, mcap: "$60B", pe: 13.4, rating: "Aa2", industryMetric: "93.2% CR", fcfB: 6.8, iv: 17.6, beta: 0.64, pdBps: 11, spark: "▂▃▄▅▆▇█" },
    { ticker: "ALL", name: "Allstate Corp.", industry: "insurance", connector: "factset", price: 191.80, change: 1.95, mcap: "$50B", pe: 11.8, rating: "A2", industryMetric: "94.8% CR", fcfB: 5.1, iv: 21.4, beta: 0.72, pdBps: 24, spark: "▂▃▄▅▆▆▇" },
    { ticker: "MMC", name: "Marsh McLennan", industry: "insurance", connector: "pitchbook", price: 228.70, change: 1.50, mcap: "$112B", pe: 25.4, rating: "A3", industryMetric: "26.8% Mgn", fcfB: 4.3, iv: 15.9, beta: 0.78, pdBps: 31, spark: "▃▄▅▆▆▇▇" },
    { ticker: "AON", name: "Aon plc", industry: "insurance", connector: "pitchbook", price: 368.20, change: 1.85, mcap: "$80B", pe: 23.1, rating: "Baa2", industryMetric: "31.2% Mgn", fcfB: 3.4, iv: 17.2, beta: 0.82, pdBps: 52, spark: "▂▃▄▅▆▇█" },
    { ticker: "MET", name: "MetLife Inc.", industry: "insurance", connector: "moodys", price: 82.90, change: 0.70, mcap: "$58B", pe: 9.8, rating: "Aa3", industryMetric: "5.2% Yield", fcfB: 5.9, iv: 20.6, beta: 1.02, pdBps: 14, spark: "▃▄▅▅▆▆▆" },
    { ticker: "AIG", name: "American Intl Grp", industry: "insurance", connector: "sec_edgar", price: 76.40, change: -0.90, mcap: "$48B", pe: 11.4, rating: "A2", industryMetric: "91.8% CR", fcfB: 4.2, iv: 22.1, beta: 1.08, pdBps: 28, spark: "▅▆▅▄▃▄▃" },
    { ticker: "PRU", name: "Prudential Fin.", industry: "insurance", connector: "moodys", price: 124.50, change: 0.45, mcap: "$44B", pe: 9.4, rating: "Aa3", industryMetric: "$1.5T PGIM", fcfB: 4.6, iv: 21.0, beta: 1.12, pdBps: 15, spark: "▃▄▄▅▅▆▆" }
  ],

  palettes: {
    truecolor_pro: {
      id: "truecolor_pro",
      name: "TrueColor Studio (24-Bit High Recognition)",
      stops: null
    },
    executive_emerald: {
      id: "executive_emerald",
      name: "Excel Model Emerald & Cyan",
      stops: [
        [6, 12, 10],
        [14, 34, 24],
        [24, 68, 44],
        [40, 112, 66],
        [72, 162, 88],
        [130, 214, 126],
        [204, 246, 212],
        [244, 254, 248]
      ]
    },
    gemini_gold: {
      id: "gemini_gold",
      name: "Gemini FinServ Gold & Indigo",
      stops: [
        [10, 6, 30],
        [28, 12, 72],
        [72, 18, 106],
        [138, 28, 92],
        [204, 64, 48],
        [242, 138, 24],
        [252, 206, 54],
        [255, 248, 196]
      ]
    },
    halftone_editorial: {
      id: "halftone_editorial",
      name: "Editorial B&W Print",
      stops: [
        [10, 12, 16],
        [38, 42, 50],
        [76, 82, 94],
        [122, 130, 142],
        [170, 178, 188],
        [214, 220, 228],
        [248, 250, 252]
      ]
    },
    alpha_heatmap: {
      id: "alpha_heatmap",
      name: "FinViz Alpha Heatmap (Crimson → Bull Green)",
      stops: [
        [18, 8, 14],
        [92, 18, 28],
        [32, 42, 56],
        [18, 78, 54],
        [22, 138, 84],
        [48, 204, 122],
        [172, 246, 204],
        [240, 255, 246]
      ]
    },
    moodys_cobalt: {
      id: "moodys_cobalt",
      name: "Moody's Institutional Cobalt",
      stops: [
        [8, 12, 24],
        [16, 30, 62],
        [26, 58, 112],
        [42, 98, 168],
        [74, 148, 218],
        [138, 198, 244],
        [212, 238, 254],
        [248, 252, 255]
      ]
    },
    bloomberg_amber: {
      id: "bloomberg_amber",
      name: "Bloomberg Terminal Phosphor",
      stops: [
        [8, 6, 4],
        [36, 18, 4],
        [84, 42, 8],
        [146, 74, 12],
        [212, 118, 18],
        [250, 176, 42],
        [255, 224, 122],
        [255, 249, 224]
      ]
    }
  }
};
