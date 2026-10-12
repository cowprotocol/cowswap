export const COW_CDN = process.env['REACT_APP_COW_CDN'] || 'https://files.cow.fi'

/**
 * Solana token lists, shipped from the `token-lists` repo.
 *
 * Kept here rather than next to each consumer because they are read from three places that must agree:
 * the swap app's list config, the explorer, and the restricted-lists fallback. Geoblocking matches a list
 * by URL, so a copy that drifts stops matching and the list silently stops being restricted.
 */
export const SOLANA_TOKEN_LIST_URL = `${COW_CDN}/token-lists/CowSwap.1000000001.json`
export const SOLANA_RWA_TOKEN_LIST_URL = `${COW_CDN}/token-lists/Rwa.1000000001.json`
