// ─── Socket Detection ──────────────────────────────────────────────────────

export function extractCPUSocket(name) {
  if (!name) return null
  const n = name.toUpperCase()

  if (n.includes('AM5')) return 'AM5'
  if (n.includes('AM4')) return 'AM4'
  if (n.includes('AM3')) return 'AM3'
  if (n.includes('LGA1851') || n.includes('LGA 1851')) return 'LGA1851'
  if (n.includes('LGA1700') || n.includes('LGA 1700')) return 'LGA1700'
  if (n.includes('LGA1200') || n.includes('LGA 1200')) return 'LGA1200'
  if (n.includes('LGA1151') || n.includes('LGA 1151')) return 'LGA1151'
  if (n.includes('LGA1150') || n.includes('LGA 1150')) return 'LGA1150'
  if (n.includes('TR5') || n.includes('TRX50')) return 'TR5'
  if (n.includes('TR4') || n.includes('TRX40') || n.includes('THREADRIPPER')) return 'TR4'

  // Infer from AMD Ryzen model number
  const ryzenMatch = n.match(/RYZEN\s+\d+\s+(\d{4}[A-Z]*)/i)
  if (ryzenMatch) {
    const model = parseInt(ryzenMatch[1])
    if (model >= 9000) return 'AM5'
    if (model >= 7000) return 'AM5'
    if (model >= 1000 && model < 7000) return 'AM4'
  }

  // Infer from Intel Core model number
  const intelMatch = n.match(/(?:CORE\s+)?I[3579]-(\d{4,5}[A-Z]*)/i)
  if (intelMatch) {
    const model = parseInt(intelMatch[1])
    if (model >= 14000) return 'LGA1700'
    if (model >= 12000) return 'LGA1700'
    if (model >= 10000) return 'LGA1200'
    if (model >= 8000) return 'LGA1151'
    if (model >= 6000) return 'LGA1151'
  }

  // Intel Ultra / Arrow Lake
  if (n.includes('ULTRA') || n.includes('ARROW LAKE')) return 'LGA1851'
  if (n.includes('RAPTOR LAKE') || n.includes('ALDER LAKE') || n.includes('13TH') || n.includes('12TH')) return 'LGA1700'
  if (n.includes('COMET LAKE') || n.includes('10TH') || n.includes('11TH')) return 'LGA1200'

  return null
}

export function extractMoboSocket(name) {
  if (!name) return null
  const n = name.toUpperCase()

  if (n.includes('AM5')) return 'AM5'
  if (n.includes('AM4')) return 'AM4'
  if (n.includes('AM3')) return 'AM3'
  if (n.includes('LGA1851') || n.includes('LGA 1851')) return 'LGA1851'
  if (n.includes('LGA1700') || n.includes('LGA 1700')) return 'LGA1700'
  if (n.includes('LGA1200') || n.includes('LGA 1200')) return 'LGA1200'
  if (n.includes('LGA1151') || n.includes('LGA 1151')) return 'LGA1151'
  if (n.includes('LGA1150') || n.includes('LGA 1150')) return 'LGA1150'
  if (n.includes('TRX50') || n.includes('TR5')) return 'TR5'
  if (n.includes('TRX40') || n.includes('TR4')) return 'TR4'

  // Infer from chipset
  const amdChipsets = ['X670E', 'X670', 'B650E', 'B650', 'A620']
  const amdAM4Chipsets = ['X570', 'B550', 'A520', 'X470', 'B450', 'A320', 'X370', 'B350']
  const intelLGA1700 = ['Z790', 'B760', 'H770', 'Z690', 'B660', 'H670', 'H610']
  const intelLGA1851 = ['Z890', 'B860', 'H810']
  const intelLGA1200 = ['Z590', 'B560', 'H570', 'Z490', 'B460', 'H410']

  for (const c of amdChipsets) if (n.includes(c)) return 'AM5'
  for (const c of amdAM4Chipsets) if (n.includes(c)) return 'AM4'
  for (const c of intelLGA1851) if (n.includes(c)) return 'LGA1851'
  for (const c of intelLGA1700) if (n.includes(c)) return 'LGA1700'
  for (const c of intelLGA1200) if (n.includes(c)) return 'LGA1200'

  return null
}

// ─── RAM Type Detection ────────────────────────────────────────────────────

export function extractRAMType(name) {
  if (!name) return null
  const n = name.toUpperCase()
  if (n.includes('DDR5')) return 'DDR5'
  if (n.includes('DDR4')) return 'DDR4'
  if (n.includes('DDR3')) return 'DDR3'
  return null
}

export function extractMoboRAMType(name) {
  if (!name) return null
  const n = name.toUpperCase()
  if (n.includes('DDR5')) return 'DDR5'
  if (n.includes('DDR4')) return 'DDR4'
  if (n.includes('DDR3')) return 'DDR3'

  // Infer from chipset — AM5 and 12th+ Intel native DDR5 (though some boards support both)
  const am5chipsets = ['X670E', 'X670', 'B650E', 'B650', 'A620']
  for (const c of am5chipsets) if (n.includes(c)) return 'DDR5'

  // Z790 can be DDR4 or DDR5; can't reliably infer
  return null
}

// ─── TDP / Wattage Detection ───────────────────────────────────────────────

export function extractCPUTDP(name) {
  if (!name) return null
  const n = name.toUpperCase()

  // Look for explicit TDP in name (rare, but support "65W", "125W" etc.)
  const tdpMatch = n.match(/(\d{2,3})\s*W\b/)
  if (tdpMatch) return parseInt(tdpMatch[1])

  // Common CPU TDP lookup table by model patterns
  const tdpMap = [
    [/I9-1[34]\d{3}K/, 125], [/I9-1[34]\d{3}(?!K)/, 65],
    [/I7-1[34]\d{3}K/, 125], [/I7-1[34]\d{3}(?!K)/, 65],
    [/I5-1[34]\d{3}K/, 125], [/I5-1[34]\d{3}(?!K)/, 65],
    [/RYZEN\s+9\s+7\d{3}X3D/, 120], [/RYZEN\s+9\s+7\d{3}X/, 105],
    [/RYZEN\s+9\s+7\d{3}(?![XF])/, 65], [/RYZEN\s+7\s+7\d{3}X3D/, 120],
    [/RYZEN\s+7\s+7\d{3}X/, 105], [/RYZEN\s+7\s+7\d{3}/, 65],
    [/RYZEN\s+5\s+7\d{3}X/, 65], [/RYZEN\s+5\s+7\d{3}/, 65],
    [/RYZEN\s+9\s+5\d{3}X/, 105], [/RYZEN\s+9\s+5\d{3}/, 65],
    [/RYZEN\s+7\s+5\d{3}X3D/, 105], [/RYZEN\s+7\s+5\d{3}X/, 105],
    [/RYZEN\s+7\s+5\d{3}/, 65], [/RYZEN\s+5\s+5\d{3}X/, 65],
    [/RYZEN\s+5\s+5600/, 65], [/RYZEN\s+5\s+5\d{3}/, 65],
  ]

  for (const [pattern, tdp] of tdpMap) {
    if (pattern.test(n)) return tdp
  }

  return null
}

export function extractGPUTDP(name) {
  if (!name) return null
  const n = name.toUpperCase()

  const gpuMap = [
    // NVIDIA 40 series
    [/RTX\s*4090/, 450], [/RTX\s*4080\s*SUPER/, 320], [/RTX\s*4080/, 320],
    [/RTX\s*4070\s*TI\s*SUPER/, 285], [/RTX\s*4070\s*TI/, 285],
    [/RTX\s*4070\s*SUPER/, 220], [/RTX\s*4070/, 200],
    [/RTX\s*4060\s*TI/, 165], [/RTX\s*4060/, 115],
    // NVIDIA 30 series
    [/RTX\s*3090\s*TI/, 450], [/RTX\s*3090/, 350],
    [/RTX\s*3080\s*TI/, 350], [/RTX\s*3080/, 320],
    [/RTX\s*3070\s*TI/, 290], [/RTX\s*3070/, 220],
    [/RTX\s*3060\s*TI/, 200], [/RTX\s*3060/, 170],
    [/RTX\s*3050/, 130],
    // NVIDIA 20 series
    [/RTX\s*2080\s*TI/, 250], [/RTX\s*2080\s*SUPER/, 250], [/RTX\s*2080/, 215],
    [/RTX\s*2070\s*SUPER/, 215], [/RTX\s*2070/, 175],
    [/RTX\s*2060\s*SUPER/, 175], [/RTX\s*2060/, 160],
    // AMD RX 7000
    [/RX\s*7900\s*XTX/, 355], [/RX\s*7900\s*XT/, 315],
    [/RX\s*7800\s*XT/, 263], [/RX\s*7700\s*XT/, 245],
    [/RX\s*7600\s*XT/, 190], [/RX\s*7600/, 165],
    // AMD RX 6000
    [/RX\s*6950\s*XT/, 335], [/RX\s*6900\s*XT/, 300],
    [/RX\s*6800\s*XT/, 300], [/RX\s*6800/, 250],
    [/RX\s*6700\s*XT/, 230], [/RX\s*6700/, 175],
    [/RX\s*6650\s*XT/, 180], [/RX\s*6600\s*XT/, 160], [/RX\s*6600/, 132],
  ]

  for (const [pattern, tdp] of gpuMap) {
    if (pattern.test(n)) return tdp
  }

  return null
}

export function extractPSUWattage(name) {
  if (!name) return null
  const n = name.toUpperCase()
  const match = n.match(/(\d{3,4})\s*W\b/)
  if (match) return parseInt(match[1])
  return null
}

export function extractCoolerTDP(name) {
  if (!name) return null
  const n = name.toUpperCase()

  // Look for explicit "200W TDP" type patterns
  const tdpMatch = n.match(/(\d{2,3})\s*W/)
  if (tdpMatch) return parseInt(tdpMatch[1])

  // Known coolers
  const coolerMap = [
    [/NOCTUA\s+NH-D15/, 250], [/NOCTUA\s+NH-D15S/, 220],
    [/NOCTUA\s+NH-U14S/, 200], [/NOCTUA\s+NH-U12S/, 180],
    [/NOCTUA\s+NH-U12A/, 220], [/NOCTUA\s+NH-L12S/, 95],
    [/NOCTUA\s+NH-L9[AI]/, 65], [/DARK\s+ROCK\s+PRO\s*4/, 250],
    [/DARK\s+ROCK\s+4/, 200], [/DARK\s+ROCK\s+SLIM/, 130],
    [/SCYTHE\s+FUMA\s*2/, 220], [/SCYTHE\s+MUGEN\s*5/, 200],
    [/DEEPCOOL\s+AK620/, 260], [/DEEPCOOL\s+AG620/, 220],
    [/THERMALRIGHT\s+PEERLESS\s+ASSASSIN/, 260],
    [/ID-COOLING\s+SE-224-XT/, 200],
    // AIO patterns by size
    [/360\s*MM|360MM|360\s*AIO/, 350], [/280\s*MM|280MM|280\s*AIO/, 300],
    [/240\s*MM|240MM|240\s*AIO/, 250], [/120\s*MM|120MM|120\s*AIO/, 150],
    // Generic stock cooler
    [/STOCK|WRAITH\s+STEALTH/, 65], [/WRAITH\s+SPIRE/, 95],
    [/WRAITH\s+PRISM/, 105],
  ]

  for (const [pattern, tdp] of coolerMap) {
    if (pattern.test(n)) return tdp
  }

  return null
}

// ─── Form Factor Detection ─────────────────────────────────────────────────

export function extractMoboFormFactor(name) {
  if (!name) return null
  const n = name.toUpperCase()
  if (n.includes('MINI-ITX') || n.includes('MINI ITX') || n.includes('MITX') || n.includes('M-ITX')) return 'Mini-ITX'
  if (n.includes('MICRO-ATX') || n.includes('MICRO ATX') || n.includes('MATX') || n.includes('M-ATX') || n.includes('MICROATX') || n.includes('UATX')) return 'mATX'
  if (n.includes('E-ATX') || n.includes('EATX') || n.includes('EXTENDED ATX')) return 'E-ATX'
  if (n.includes('ATX')) return 'ATX'
  return null
}

export function extractCaseFormFactor(name) {
  if (!name) return null
  const n = name.toUpperCase()
  if (n.includes('MINI-ITX') || n.includes('MINI ITX') || n.includes('MITX') || n.includes('ITX')) return 'Mini-ITX'
  if (n.includes('MICRO-ATX') || n.includes('MICRO ATX') || n.includes('MATX') || n.includes('M-ATX')) return 'mATX'
  if (n.includes('FULL TOWER') || n.includes('FULL-TOWER')) return 'E-ATX'
  if (n.includes('ATX')) return 'ATX'
  return null
}

// ─── Compatibility Check Order ─────────────────────────────────────────────

const FORM_FACTOR_HIERARCHY = {
  'Mini-ITX': 1,
  'mATX': 2,
  'ATX': 3,
  'E-ATX': 4,
}

export function caseSupportsMotherboard(caseFF, moboFF) {
  if (!caseFF || !moboFF) return null
  const caseLevel = FORM_FACTOR_HIERARCHY[caseFF] ?? 0
  const moboLevel = FORM_FACTOR_HIERARCHY[moboFF] ?? 0
  return caseLevel >= moboLevel
}

// ─── Main Compatibility Checker ────────────────────────────────────────────

export function runCompatibilityChecks(build) {
  const checks = []

  const cpuSocket = extractCPUSocket(build.cpu?.name)
  const moboSocket = extractMoboSocket(build.motherboard?.name)
  const ramType = extractRAMType(build.ram?.name)
  const moboRAMType = extractMoboRAMType(build.motherboard?.name)
  const cpuTDP = extractCPUTDP(build.cpu?.name)
  const gpuTDP = extractGPUTDP(build.gpu?.name)
  const psuWatts = extractPSUWattage(build.psu?.name)
  const coolerTDP = extractCoolerTDP(build.cooler?.name)
  const moboFF = extractMoboFormFactor(build.motherboard?.name)
  const caseFF = extractCaseFormFactor(build.case?.name)

  // 1. CPU ↔ Motherboard Socket
  if (build.cpu?.name && build.motherboard?.name) {
    if (cpuSocket && moboSocket) {
      const ok = cpuSocket === moboSocket
      checks.push({
        id: 'socket',
        label: 'CPU ↔ Motherboard Socket',
        detail: ok
          ? `Both use ${cpuSocket} — compatible`
          : `CPU is ${cpuSocket}, motherboard is ${moboSocket} — MISMATCH`,
        status: ok ? 'ok' : 'error',
        sourceLabel: 'PCPartPicker Compatibility Guide',
        sourceUrl: 'https://pcpartpicker.com/guide/compatibility',
      })
    } else {
      checks.push({
        id: 'socket',
        label: 'CPU ↔ Motherboard Socket',
        detail: `Could not detect socket from names — verify manually (CPU: "${build.cpu.name}", Mobo: "${build.motherboard.name}")`,
        status: 'warn',
        sourceLabel: "Tom's Hardware: CPU Socket Guide",
        sourceUrl: 'https://www.tomshardware.com/features/cpu-socket-types-explained',
      })
    }
  }

  // 2. RAM Type ↔ Motherboard
  if (build.ram?.name && build.motherboard?.name) {
    if (ramType && moboRAMType) {
      const ok = ramType === moboRAMType
      checks.push({
        id: 'ramtype',
        label: 'RAM Type ↔ Motherboard',
        detail: ok
          ? `Both use ${ramType} — compatible`
          : `RAM is ${ramType}, motherboard supports ${moboRAMType} — MISMATCH`,
        status: ok ? 'ok' : 'error',
        sourceLabel: 'DDR4 vs DDR5 Guide — Tom\'s Hardware',
        sourceUrl: 'https://www.tomshardware.com/features/ddr4-vs-ddr5-memory',
      })
    } else if (ramType || moboRAMType) {
      checks.push({
        id: 'ramtype',
        label: 'RAM Type ↔ Motherboard',
        detail: `Partial detection — RAM: ${ramType ?? 'unknown'}, Mobo: ${moboRAMType ?? 'unknown'}. Verify manually.`,
        status: 'warn',
        sourceLabel: 'DDR4 vs DDR5 — Tom\'s Hardware',
        sourceUrl: 'https://www.tomshardware.com/features/ddr4-vs-ddr5-memory',
      })
    }
  }

  // 3. PSU Wattage vs GPU + CPU TDP
  if (build.psu?.name || build.gpu?.name || build.cpu?.name) {
    if (psuWatts && (gpuTDP || cpuTDP)) {
      const estimatedLoad = (gpuTDP ?? 0) + (cpuTDP ?? 65) + 80 // ~80W for rest of system
      const headroom = psuWatts - estimatedLoad
      let status, detail
      if (headroom >= 100) {
        status = 'ok'
        detail = `PSU: ${psuWatts}W, Est. load: ~${estimatedLoad}W — ${headroom}W headroom`
      } else if (headroom >= 0) {
        status = 'warn'
        detail = `PSU: ${psuWatts}W, Est. load: ~${estimatedLoad}W — only ${headroom}W headroom (recommend 20%+ buffer)`
      } else {
        status = 'error'
        detail = `PSU: ${psuWatts}W is INSUFFICIENT for ~${estimatedLoad}W estimated load — upgrade PSU`
      }
      checks.push({
        id: 'psu',
        label: 'PSU Wattage',
        detail,
        status,
        sourceLabel: 'PCPartPicker Power Calculator',
        sourceUrl: 'https://pcpartpicker.com/list/',
      })
    } else if (build.psu?.name) {
      checks.push({
        id: 'psu',
        label: 'PSU Wattage',
        detail: `PSU detected: ${psuWatts ? psuWatts + 'W' : 'wattage unknown'} — could not estimate load from part names`,
        status: 'warn',
        sourceLabel: 'PSU Tier List — Tom\'s Hardware',
        sourceUrl: 'https://www.tomshardware.com/features/psu-tier-list',
      })
    }
  }

  // 4. CPU Cooler TDP vs CPU TDP
  if (build.cpu?.name && build.cooler?.name) {
    if (cpuTDP && coolerTDP) {
      const ok = coolerTDP >= cpuTDP
      checks.push({
        id: 'cooler',
        label: 'CPU Cooler Capacity',
        detail: ok
          ? `Cooler rated for ${coolerTDP}W, CPU TDP ~${cpuTDP}W — sufficient`
          : `Cooler rated for ${coolerTDP}W but CPU TDP is ~${cpuTDP}W — UNDERSIZED`,
        status: ok ? 'ok' : 'error',
        sourceLabel: "Tom's Hardware: Best CPU Coolers",
        sourceUrl: 'https://www.tomshardware.com/best-picks/best-cpu-coolers',
      })
    } else {
      checks.push({
        id: 'cooler',
        label: 'CPU Cooler Capacity',
        detail: `Could not determine TDP — CPU: ${cpuTDP ? cpuTDP + 'W' : 'unknown'}, Cooler: ${coolerTDP ? coolerTDP + 'W' : 'unknown'}. Verify manually.`,
        status: 'warn',
        sourceLabel: "Tom's Hardware: CPU Cooler Guide",
        sourceUrl: 'https://www.tomshardware.com/best-picks/best-cpu-coolers',
      })
    }
  }

  // 5. Case ↔ Motherboard Form Factor
  if (build.case?.name && build.motherboard?.name) {
    if (caseFF && moboFF) {
      const fits = caseSupportsMotherboard(caseFF, moboFF)
      checks.push({
        id: 'formfactor',
        label: 'Case ↔ Motherboard Form Factor',
        detail: fits
          ? `${caseFF} case fits ${moboFF} motherboard — compatible`
          : `${caseFF} case does NOT fit ${moboFF} motherboard — INCOMPATIBLE`,
        status: fits ? 'ok' : 'error',
        sourceLabel: 'Motherboard Form Factor Guide',
        sourceUrl: 'https://www.tomshardware.com/features/motherboard-form-factors',
      })
    } else {
      checks.push({
        id: 'formfactor',
        label: 'Case ↔ Motherboard Form Factor',
        detail: `Case: ${caseFF ?? 'unknown'}, Mobo: ${moboFF ?? 'unknown'} — add form factor to names (ATX/mATX/ITX)`,
        status: 'warn',
        sourceLabel: 'Motherboard Form Factor Guide',
        sourceUrl: 'https://www.tomshardware.com/features/motherboard-form-factors',
      })
    }
  }

  return checks
}

// ─── Performance Tier ──────────────────────────────────────────────────────

export function getPerformanceTier(build) {
  const gpu = build.gpu?.name?.toUpperCase() ?? ''

  const ultra = /RTX\s*4090|RTX\s*4080|RX\s*7900\s*XTX|RX\s*7900\s*XT/
  const high = /RTX\s*4070|RTX\s*3080|RTX\s*3090|RX\s*6900|RX\s*6800|RX\s*7800/
  const mid = /RTX\s*4060|RTX\s*3070|RTX\s*3060|RX\s*6700|RX\s*7700|RX\s*6600/
  const entry = /RTX\s*3050|RTX\s*2060|GTX\s*1660|GTX\s*1070|RX\s*6500|RX\s*580/

  if (ultra.test(gpu)) return {
    tier: 'Ultra',
    badge: '🔥 Ultra 4K Gaming',
    tasks: ['4K gaming at ultra settings', '1440p at 165+ FPS', 'AAA titles maxed out', '4K video editing', '3D rendering & VFX'],
    color: '#ff6b35',
  }
  if (high.test(gpu)) return {
    tier: 'High',
    badge: '⚡ High-End 1440p',
    tasks: ['1440p gaming at high/ultra settings', '1080p at 165+ FPS', 'Content creation & streaming', '4K video editing', 'VR-ready'],
    color: '#7c3aed',
  }
  if (mid.test(gpu)) return {
    tier: 'Mid',
    badge: '🎮 1080p / 1440p Gaming',
    tasks: ['1080p gaming at high settings', '1440p at medium settings', 'Streaming + gaming simultaneously', '1080p video editing', 'Light VR'],
    color: '#2563eb',
  }
  if (entry.test(gpu)) return {
    tier: 'Entry',
    badge: '✅ 1080p Gaming',
    tasks: ['1080p gaming at medium settings', 'eSports titles at high FPS', 'General productivity', 'Light streaming'],
    color: '#059669',
  }

  return {
    tier: 'Unknown',
    badge: '? Performance Unknown',
    tasks: ['Enter GPU details to estimate performance tier'],
    color: '#6b7280',
  }
}

// ─── PCPartPicker Search URL ───────────────────────────────────────────────

// Category slugs for PCPartPicker product pages
const PCPP_CATEGORY = {
  cpu:         'cpu',
  gpu:         'video-card',
  motherboard: 'motherboard',
  ram:         'memory',
  storage:     'solid-state-drive',
  psu:         'power-supply',
  cooler:      'cpu-cooler',
  case:        'case',
  os:          'os',
}

// PCPartPicker search — uses the reliable main search endpoint.
// The hash-based category filter (#search=) requires JS to fire on their page
// and doesn't trigger reliably from external links. The main search always works.
export function pcppCategoryUrl(partKey, partName) {
  if (!partName?.trim()) return 'https://pcpartpicker.com'
  return `https://pcpartpicker.com/search/?q=${encodeURIComponent(partName.trim())}`
}

// Generic search (same implementation, kept for backward compat)
export function pcppUrl(partName) {
  if (!partName?.trim()) return 'https://pcpartpicker.com'
  return `https://pcpartpicker.com/search/?q=${encodeURIComponent(partName.trim())}`
}

export function amazonUrl(partName) {
  if (!partName?.trim()) return 'https://amazon.com'
  return `https://www.amazon.com/s?k=${encodeURIComponent(partName.trim())}`
}

// ─── YouTube Benchmark Search URL ─────────────────────────────────────────

// Strips brand prefixes to produce a tighter search query
// "NVIDIA GeForce RTX 3060" → "RTX 3060"
// "AMD Ryzen 5 3600"        → "Ryzen 5 3600"
export function shortPartName(name) {
  if (!name?.trim()) return ''
  return name
    .replace(/^NVIDIA\s+GeForce\s+/i, '')
    .replace(/^AMD\s+Radeon\s+/i, '')
    .replace(/^Intel\s+Core\s+/i, '')
    .replace(/^AMD\s+/i, '')
    .trim()
}

// Returns a YouTube search URL for a combined CPU + GPU benchmark query
export function youtubeBenchmarkSearchUrl(gpuName, cpuName) {
  const gpu = shortPartName(gpuName)
  const cpu = shortPartName(cpuName)
  const parts = [gpu, cpu].filter(Boolean)
  if (!parts.length) return null
  const query = parts.join(' ') + ' gaming benchmark'
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
}

// Build a YouTube Data API v3 search query for a benchmark video
export function youtubeBenchmarkApiQuery(gpuName, cpuName) {
  const gpu = shortPartName(gpuName)
  const cpu = shortPartName(cpuName)
  const parts = [gpu, cpu].filter(Boolean)
  return parts.join(' ') + ' gaming benchmark'
}

// ─── Row-level Compatibility Mapping ───────────────────────────────────────

// Which check IDs are relevant per component row
const ROW_CHECK_MAP = {
  cpu:         ['socket', 'cooler'],
  gpu:         ['psu'],
  motherboard: ['socket', 'ramtype', 'formfactor'],
  ram:         ['ramtype'],
  psu:         ['psu'],
  cooler:      ['cooler'],
  case:        ['formfactor'],
  storage:     [],
  os:          [],
}

// Returns the compatibility checks relevant to a specific row
export function getRowChecks(partKey, allChecks) {
  const ids = ROW_CHECK_MAP[partKey] ?? []
  return allChecks.filter(c => ids.includes(c.id))
}

// Aggregate status for a row: 'error' > 'warn' > 'ok' > null
export function getRowStatus(partKey, allChecks) {
  const checks = getRowChecks(partKey, allChecks)
  if (!checks.length) return null
  if (checks.some(c => c.status === 'error')) return 'error'
  if (checks.some(c => c.status === 'warn'))  return 'warn'
  return 'ok'
}
