export const COW_CDN = process.env['REACT_APP_COW_CDN'] || 'https://files.cow.fi'

/**
 * Solana token lists, shipped from the `token-lists` repo.
 *
 * Kept here rather than next to each consumer because they are read from three places that must agree:
 * the swap app's list config, the explorer, and the restricted-lists fallback. Geoblocking matches a list
 * by URL, so a copy that drifts stops matching and the list silently stops being restricted.
 *
 * `COW_CDN` deliberately does not apply: `tokensList.json` spells these URLs out and cannot interpolate,
 * so an override would move only these copies and leave the configured list unrestricted.
 */
const TOKEN_LISTS_ORIGIN = 'https://files.cow.fi'

export const SOLANA_TOKEN_LIST_URL = `${TOKEN_LISTS_ORIGIN}/token-lists/CowSwap.1000000001.json`
export const SOLANA_RWA_TOKEN_LIST_URL = `${TOKEN_LISTS_ORIGIN}/token-lists/Rwa.1000000001.json`
