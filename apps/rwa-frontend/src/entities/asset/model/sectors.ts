/** GICS sectors plus `ETF` for funds. Must match `SECTORS` in `scripts/profiles/sectors.mjs` */
export const RWA_SECTORS = [
  'Communication Services',
  'Consumer Discretionary',
  'Consumer Staples',
  'Energy',
  'Financials',
  'Health Care',
  'Industrials',
  'Information Technology',
  'Materials',
  'Real Estate',
  'Utilities',
  'ETF',
] as const

export type RwaSector = (typeof RWA_SECTORS)[number]

/** Between the sector and the industry of `RwaAssetProfile.sector`, e.g. `Information Technology · Semiconductors` */
export const RWA_SECTOR_SEPARATOR = ' · '
