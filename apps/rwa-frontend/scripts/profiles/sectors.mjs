/** GICS sectors plus `ETF` for funds. Must match `RWA_SECTORS` in `src/entities/asset/model/sectors.ts` */
export const SECTORS = [
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
]

export const SECTOR_SEPARATOR = ' · '

/** Same rule as `validateRegistry`: a `SECTORS` sector, `SECTOR_SEPARATOR` and a non-empty industry */
export function isValidSector(sector) {
  const separatorIndex = sector.indexOf(SECTOR_SEPARATOR)
  if (separatorIndex === -1) return false

  const industry = sector.slice(separatorIndex + SECTOR_SEPARATOR.length).trim()

  return SECTORS.includes(sector.slice(0, separatorIndex)) && industry.length > 0
}
