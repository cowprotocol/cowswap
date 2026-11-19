export const COW_CDN = process.env['REACT_APP_COW_CDN'] || 'https://files.cow.fi'

/**
 * Solana token lists, shipped from the `token-lists` repo.
 *
 * Kept here rather than next to each consumer because the swap app's list config and the explorer must
 * agree on them.
 *
 * `COW_CDN` deliberately does not apply: `tokensList.json` spells these URLs out and cannot interpolate,
 * so an override would move only these copies and leave the configured list behind.
 */
const TOKEN_LISTS_ORIGIN = 'https://files.cow.fi'

export const SOLANA_TOKEN_LIST_URL = `${TOKEN_LISTS_ORIGIN}/token-lists/CowSwap.1000000001.json`
export const SOLANA_RWA_TOKEN_LIST_URL = `${TOKEN_LISTS_ORIGIN}/token-lists/CoinGeckoRwa.1000000001.json`
