// Static parts database for autocomplete suggestions
// Focused on the most commonly flipped consumer PC hardware

export const PARTS_DB = {
  cpu: [
    // AMD Ryzen 9000 (AM5)
    'AMD Ryzen 9 9950X', 'AMD Ryzen 9 9900X', 'AMD Ryzen 7 9700X', 'AMD Ryzen 5 9600X',
    // AMD Ryzen 7000 (AM5)
    'AMD Ryzen 9 7950X3D', 'AMD Ryzen 9 7950X', 'AMD Ryzen 9 7900X3D', 'AMD Ryzen 9 7900X',
    'AMD Ryzen 9 7900', 'AMD Ryzen 7 7800X3D', 'AMD Ryzen 7 7700X', 'AMD Ryzen 7 7700',
    'AMD Ryzen 5 7600X', 'AMD Ryzen 5 7600',
    // AMD Ryzen 5000 (AM4)
    'AMD Ryzen 9 5950X', 'AMD Ryzen 9 5900X', 'AMD Ryzen 9 5900',
    'AMD Ryzen 7 5800X3D', 'AMD Ryzen 7 5800X', 'AMD Ryzen 7 5800', 'AMD Ryzen 7 5700X',
    'AMD Ryzen 5 5600X', 'AMD Ryzen 5 5600', 'AMD Ryzen 5 5500',
    'AMD Ryzen 3 5300G', 'AMD Ryzen 5 5600G', 'AMD Ryzen 7 5700G',
    // AMD Ryzen 3000 (AM4)
    'AMD Ryzen 9 3950X', 'AMD Ryzen 9 3900X', 'AMD Ryzen 7 3700X', 'AMD Ryzen 7 3800X',
    'AMD Ryzen 5 3600X', 'AMD Ryzen 5 3600', 'AMD Ryzen 5 3400G',
    // Intel Core 14th Gen (LGA1700)
    'Intel Core i9-14900K', 'Intel Core i9-14900KF', 'Intel Core i9-14900KS',
    'Intel Core i7-14700K', 'Intel Core i7-14700KF',
    'Intel Core i5-14600K', 'Intel Core i5-14600KF',
    'Intel Core i5-14500', 'Intel Core i5-14400', 'Intel Core i5-14400F',
    // Intel Core 13th Gen (LGA1700)
    'Intel Core i9-13900K', 'Intel Core i9-13900KF', 'Intel Core i9-13900KS',
    'Intel Core i7-13700K', 'Intel Core i7-13700KF', 'Intel Core i7-13700',
    'Intel Core i5-13600K', 'Intel Core i5-13600KF', 'Intel Core i5-13500', 'Intel Core i5-13400',
    // Intel Core 12th Gen (LGA1700)
    'Intel Core i9-12900K', 'Intel Core i9-12900KF',
    'Intel Core i7-12700K', 'Intel Core i7-12700KF', 'Intel Core i7-12700',
    'Intel Core i5-12600K', 'Intel Core i5-12600KF', 'Intel Core i5-12400', 'Intel Core i5-12400F',
    // Intel Core 10th/11th Gen (LGA1200)
    'Intel Core i9-11900K', 'Intel Core i7-11700K', 'Intel Core i5-11600K',
    'Intel Core i9-10900K', 'Intel Core i7-10700K', 'Intel Core i5-10600K', 'Intel Core i5-10400',
  ],

  gpu: [
    // NVIDIA RTX 50 series
    'NVIDIA GeForce RTX 5090', 'NVIDIA GeForce RTX 5080', 'NVIDIA GeForce RTX 5070 Ti',
    'NVIDIA GeForce RTX 5070', 'NVIDIA GeForce RTX 5060 Ti',
    // NVIDIA RTX 40 series
    'NVIDIA GeForce RTX 4090', 'NVIDIA GeForce RTX 4080 Super', 'NVIDIA GeForce RTX 4080',
    'NVIDIA GeForce RTX 4070 Ti Super', 'NVIDIA GeForce RTX 4070 Ti',
    'NVIDIA GeForce RTX 4070 Super', 'NVIDIA GeForce RTX 4070',
    'NVIDIA GeForce RTX 4060 Ti 16GB', 'NVIDIA GeForce RTX 4060 Ti', 'NVIDIA GeForce RTX 4060',
    // NVIDIA RTX 30 series
    'NVIDIA GeForce RTX 3090 Ti', 'NVIDIA GeForce RTX 3090',
    'NVIDIA GeForce RTX 3080 Ti', 'NVIDIA GeForce RTX 3080 12GB', 'NVIDIA GeForce RTX 3080',
    'NVIDIA GeForce RTX 3070 Ti', 'NVIDIA GeForce RTX 3070',
    'NVIDIA GeForce RTX 3060 Ti', 'NVIDIA GeForce RTX 3060 12GB', 'NVIDIA GeForce RTX 3060',
    'NVIDIA GeForce RTX 3050',
    // NVIDIA RTX 20 series
    'NVIDIA GeForce RTX 2080 Ti', 'NVIDIA GeForce RTX 2080 Super', 'NVIDIA GeForce RTX 2080',
    'NVIDIA GeForce RTX 2070 Super', 'NVIDIA GeForce RTX 2070',
    'NVIDIA GeForce RTX 2060 Super', 'NVIDIA GeForce RTX 2060',
    // NVIDIA GTX 16 series
    'NVIDIA GeForce GTX 1660 Super', 'NVIDIA GeForce GTX 1660 Ti', 'NVIDIA GeForce GTX 1660',
    'NVIDIA GeForce GTX 1650 Super', 'NVIDIA GeForce GTX 1650',
    // AMD RX 9000 series
    'AMD Radeon RX 9070 XT', 'AMD Radeon RX 9070',
    // AMD RX 7000 series
    'AMD Radeon RX 7900 XTX', 'AMD Radeon RX 7900 XT', 'AMD Radeon RX 7900 GRE',
    'AMD Radeon RX 7800 XT', 'AMD Radeon RX 7700 XT',
    'AMD Radeon RX 7600 XT', 'AMD Radeon RX 7600',
    // AMD RX 6000 series
    'AMD Radeon RX 6950 XT', 'AMD Radeon RX 6900 XT', 'AMD Radeon RX 6800 XT', 'AMD Radeon RX 6800',
    'AMD Radeon RX 6750 XT', 'AMD Radeon RX 6700 XT', 'AMD Radeon RX 6700',
    'AMD Radeon RX 6650 XT', 'AMD Radeon RX 6600 XT', 'AMD Radeon RX 6600',
    'AMD Radeon RX 6500 XT',
  ],

  motherboard: [
    // AM5
    'ASUS ROG Crosshair X670E Hero', 'ASUS ROG Strix X670E-E Gaming', 'ASUS TUF Gaming X670E-Plus',
    'ASUS ProArt X670E-Creator', 'ASUS Prime X670-P',
    'MSI MEG X670E Ace', 'MSI MAG X670E Tomahawk WiFi', 'MSI Pro X670-P WiFi',
    'Gigabyte X670E Aorus Master', 'Gigabyte X670 Aorus Elite AX',
    'ASUS ROG Strix B650E-F Gaming', 'ASUS TUF Gaming B650-Plus WiFi', 'ASUS Prime B650M-A WiFi',
    'MSI MAG B650 Tomahawk WiFi', 'MSI Pro B650-P WiFi',
    'Gigabyte B650 Aorus Elite AX', 'Gigabyte B650M DS3H',
    'ASRock B650E PG Riptide WiFi', 'ASRock B650M Pro RS WiFi',
    // AM4
    'ASUS ROG Crosshair VIII Hero (AM4)', 'ASUS ROG Strix X570-E Gaming (AM4)',
    'ASUS TUF Gaming X570-Plus (AM4)', 'ASUS Prime X570-P (AM4)',
    'ASUS ROG Strix B550-F Gaming (AM4)', 'ASUS TUF Gaming B550-Plus (AM4)',
    'ASUS Prime B550M-A (AM4)', 'ASUS Prime B450M-A II (AM4)',
    'MSI MEG X570 Unify (AM4)', 'MSI MAG X570 Tomahawk WiFi (AM4)',
    'MSI MAG B550 Tomahawk (AM4)', 'MSI MAG B450 Tomahawk Max (AM4)',
    'Gigabyte X570 Aorus Master (AM4)', 'Gigabyte B550 Aorus Pro AX (AM4)',
    'Gigabyte B450M DS3H (AM4)', 'ASRock X570 Taichi (AM4)',
    'ASRock B550M Pro4 (AM4)', 'ASRock B450M Steel Legend (AM4)',
    // LGA1700
    'ASUS ROG Maximus Z790 Hero', 'ASUS ROG Strix Z790-E Gaming', 'ASUS TUF Gaming Z790-Plus WiFi',
    'ASUS Prime Z790-P WiFi', 'ASUS ROG Strix B760-G Gaming WiFi',
    'ASUS TUF Gaming B760M-Plus WiFi', 'ASUS Prime B760M-A WiFi',
    'MSI MEG Z790 Ace', 'MSI MAG Z790 Tomahawk WiFi', 'MSI Pro Z790-A WiFi',
    'MSI MAG B760 Tomahawk WiFi', 'MSI Pro B760M-A WiFi',
    'Gigabyte Z790 Aorus Master', 'Gigabyte B760 Aorus Elite AX',
    // LGA1200
    'ASUS ROG Strix Z590-E Gaming', 'ASUS TUF Gaming Z590-Plus WiFi',
    'MSI MAG Z590 Tomahawk WiFi', 'Gigabyte Z590 Aorus Master',
    'ASUS Prime B560M-A', 'MSI MAG B560 Tomahawk WiFi',
  ],

  ram: [
    // DDR5
    'Corsair Dominator Platinum RGB 32GB DDR5-6000 (2x16GB)',
    'Corsair Vengeance DDR5-5600 32GB (2x16GB)',
    'Corsair Vengeance DDR5-6000 32GB (2x16GB)',
    'G.Skill Trident Z5 RGB 32GB DDR5-6000 (2x16GB)',
    'G.Skill Trident Z5 Neo 32GB DDR5-6000 (2x16GB)',
    'G.Skill Ripjaws S5 32GB DDR5-5600 (2x16GB)',
    'Kingston Fury Beast DDR5-5600 32GB (2x16GB)',
    'Teamgroup T-Force Delta 32GB DDR5-5600 (2x16GB)',
    // DDR4 32GB Kits
    'Corsair Vengeance LPX 32GB DDR4-3200 (2x16GB)',
    'Corsair Vengeance RGB Pro 32GB DDR4-3600 (2x16GB)',
    'Corsair Dominator Platinum RGB 32GB DDR4-3600 (2x16GB)',
    'G.Skill Trident Z RGB 32GB DDR4-3600 (2x16GB)',
    'G.Skill Ripjaws V 32GB DDR4-3200 (2x16GB)',
    'G.Skill Ripjaws V 32GB DDR4-3600 (2x16GB)',
    'Kingston Fury Beast 32GB DDR4-3200 (2x16GB)',
    'Kingston Fury Beast 32GB DDR4-3600 (2x16GB)',
    // DDR4 16GB Kits
    'Corsair Vengeance LPX 16GB DDR4-3200 (2x8GB)',
    'Corsair Vengeance RGB Pro 16GB DDR4-3200 (2x8GB)',
    'G.Skill Ripjaws V 16GB DDR4-3200 (2x8GB)',
    'G.Skill Trident Z RGB 16GB DDR4-3600 (2x8GB)',
    'Kingston Fury Beast 16GB DDR4-3200 (2x8GB)',
    'Teamgroup T-Force Vulcan Z 16GB DDR4-3200 (2x8GB)',
    // DDR4 64GB Kits
    'Corsair Vengeance LPX 64GB DDR4-3200 (4x16GB)',
    'G.Skill Trident Z RGB 64GB DDR4-3600 (4x16GB)',
  ],

  storage: [
    // NVMe SSDs
    'Samsung 990 Pro 1TB NVMe M.2',
    'Samsung 990 Pro 2TB NVMe M.2',
    'Samsung 980 Pro 1TB NVMe M.2',
    'Samsung 980 Pro 2TB NVMe M.2',
    'Samsung 970 EVO Plus 1TB NVMe M.2',
    'Samsung 970 EVO Plus 2TB NVMe M.2',
    'WD Black SN850X 1TB NVMe M.2',
    'WD Black SN850X 2TB NVMe M.2',
    'WD Black SN770 1TB NVMe M.2',
    'WD Black SN770 2TB NVMe M.2',
    'Seagate FireCuda 530 1TB NVMe M.2',
    'Seagate FireCuda 530 2TB NVMe M.2',
    'Crucial P3 Plus 1TB NVMe M.2',
    'Crucial P3 Plus 2TB NVMe M.2',
    'Crucial P5 Plus 1TB NVMe M.2',
    'SK Hynix Platinum P41 1TB NVMe M.2',
    'Kingston KC3000 1TB NVMe M.2',
    'Sabrent Rocket 4 Plus 1TB NVMe M.2',
    // SATA SSDs
    'Samsung 870 EVO 1TB SATA SSD',
    'Samsung 870 EVO 2TB SATA SSD',
    'Samsung 870 QVO 1TB SATA SSD',
    'Crucial MX500 1TB SATA SSD',
    'Crucial MX500 2TB SATA SSD',
    'WD Blue 1TB SATA SSD',
    'Kingston A400 1TB SATA SSD',
    // HDDs
    'Seagate Barracuda 2TB HDD 7200RPM',
    'Seagate Barracuda 4TB HDD 7200RPM',
    'WD Blue 2TB HDD 7200RPM',
    'WD Red Plus 4TB NAS HDD',
  ],

  psu: [
    // Corsair
    'Corsair RM1000x 1000W 80+ Gold', 'Corsair RM850x 850W 80+ Gold',
    'Corsair RM750x 750W 80+ Gold', 'Corsair RM650x 650W 80+ Gold',
    'Corsair HX1000 1000W 80+ Platinum', 'Corsair HX850 850W 80+ Platinum',
    'Corsair SF750 750W SFX 80+ Platinum',
    // EVGA
    'EVGA SuperNOVA 1000 G6 1000W 80+ Gold', 'EVGA SuperNOVA 850 G6 850W 80+ Gold',
    'EVGA SuperNOVA 750 G6 750W 80+ Gold', 'EVGA SuperNOVA 650 G6 650W 80+ Gold',
    // Seasonic
    'Seasonic Focus GX-1000 1000W 80+ Gold', 'Seasonic Focus GX-850 850W 80+ Gold',
    'Seasonic Focus GX-750 750W 80+ Gold', 'Seasonic Focus GX-650 650W 80+ Gold',
    'Seasonic Prime TX-1000 1000W 80+ Titanium',
    // be quiet!
    'be quiet! Dark Power Pro 13 1000W 80+ Titanium',
    'be quiet! Straight Power 11 850W 80+ Platinum',
    'be quiet! Pure Power 11 FM 750W 80+ Gold',
    // Thermaltake
    'Thermaltake Toughpower GF3 850W 80+ Gold',
    'Thermaltake Toughpower GF3 750W 80+ Gold',
    // MSI
    'MSI MAG A850GL 850W 80+ Gold', 'MSI MPG A750GF 750W 80+ Gold',
    // NZXT
    'NZXT C850 850W 80+ Gold', 'NZXT C750 750W 80+ Gold',
  ],

  cooler: [
    // Noctua Air Coolers
    'Noctua NH-D15', 'Noctua NH-D15S', 'Noctua NH-D15 chromax.black',
    'Noctua NH-U14S', 'Noctua NH-U12S', 'Noctua NH-U12A',
    'Noctua NH-L12S', 'Noctua NH-L9i', 'Noctua NH-L9a-AM5',
    // be quiet! Air Coolers
    'be quiet! Dark Rock Pro 4', 'be quiet! Dark Rock 4', 'be quiet! Dark Rock Slim',
    'be quiet! Pure Rock 2', 'be quiet! Shadow Rock 3',
    // Thermalright
    'Thermalright Peerless Assassin 120 SE', 'Thermalright Peerless Assassin 120',
    'Thermalright Frost Commander 140',
    // DeepCool
    'DeepCool AK620', 'DeepCool AK500', 'DeepCool AG620',
    // Scythe
    'Scythe Fuma 2 Rev.B', 'Scythe Mugen 5 Rev.C', 'Scythe Big Shuriken 3',
    // ID-Cooling
    'ID-Cooling SE-224-XT ARGB',
    // AIOs — NZXT
    'NZXT Kraken X73 RGB 360mm AIO', 'NZXT Kraken X63 280mm AIO',
    'NZXT Kraken X53 240mm AIO', 'NZXT Kraken 240mm AIO',
    // AIOs — Corsair
    'Corsair iCUE H150i Elite Capellix 360mm AIO',
    'Corsair iCUE H115i Elite Capellix 280mm AIO',
    'Corsair iCUE H100i Elite Capellix 240mm AIO',
    'Corsair H100x Elite 240mm AIO',
    // AIOs — Arctic
    'Arctic Liquid Freezer III 360mm AIO', 'Arctic Liquid Freezer III 280mm AIO',
    'Arctic Liquid Freezer III 240mm AIO',
    // AIOs — be quiet!
    'be quiet! Silent Loop 2 360mm AIO', 'be quiet! Silent Loop 2 240mm AIO',
    // AIOs — Lian Li
    'Lian Li Galahad II Performance 360mm AIO', 'Lian Li Galahad II Performance 240mm AIO',
  ],

  case: [
    // Fractal Design
    'Fractal Design Meshify 2 (ATX)', 'Fractal Design Meshify 2 Compact (mATX)',
    'Fractal Design Meshify 2 XL (E-ATX)', 'Fractal Design Define 7 (ATX)',
    'Fractal Design Pop Air (ATX)', 'Fractal Design North (ATX)',
    'Fractal Design Torrent (ATX)', 'Fractal Design Ridge (Mini-ITX)',
    // Lian Li
    'Lian Li O11 Dynamic EVO (ATX)', 'Lian Li O11 Air Mini (mATX)',
    'Lian Li Lancool III (ATX)', 'Lian Li Lancool 216 (ATX)',
    'Lian Li A4-H2O (Mini-ITX)', 'Lian Li TU150 (Mini-ITX)',
    // NZXT
    'NZXT H7 Flow (ATX)', 'NZXT H7 Elite (ATX)', 'NZXT H5 Flow (ATX)',
    'NZXT H510 Flow (ATX)', 'NZXT H210i (Mini-ITX)',
    // Corsair
    'Corsair 5000D Airflow (ATX)', 'Corsair 5000X RGB (ATX)', 'Corsair 4000D Airflow (ATX)',
    'Corsair 7000D Airflow (E-ATX)', 'Corsair 2000D (Mini-ITX)',
    // be quiet!
    'be quiet! Silent Base 802 (ATX)', 'be quiet! Dark Base 900 (E-ATX)',
    'be quiet! Pure Base 500DX (ATX)',
    // Phanteks
    'Phanteks Enthoo Pro 2 (E-ATX)', 'Phanteks Eclipse P500A (ATX)',
    'Phanteks Eclipse P360A (mATX)', 'Phanteks NV7 (E-ATX)',
    // Cooler Master
    'Cooler Master MasterCase H500 (ATX)', 'Cooler Master NR200P (Mini-ITX)',
    'Cooler Master NR400 (mATX)',
    // Antec
    'Antec P120 Crystal (ATX)', 'Antec DF700 Flux (ATX)',
  ],

  os: [
    'Windows 11 Home OEM', 'Windows 11 Pro OEM', 'Windows 11 Home Retail',
    'Windows 11 Pro Retail', 'Windows 10 Home OEM', 'Windows 10 Pro OEM',
    'Ubuntu 24.04 LTS (Free)', 'No OS / Barebones',
  ],
}

// Return suggestions matching a query for a given part type
export function getSuggestions(partKey, query) {
  const list = PARTS_DB[partKey] ?? []
  if (!query.trim()) return []
  const q = query.toLowerCase()
  return list
    .filter(name => name.toLowerCase().includes(q))
    .slice(0, 8) // max 8 suggestions
}
