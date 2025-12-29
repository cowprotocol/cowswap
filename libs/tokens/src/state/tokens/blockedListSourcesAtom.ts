import { atom } from 'jotai'

/**
 * Atom to track which list sources should be blocked/hidden.
 * This is set by the frontend app based on geo status and consent.
 *
 * When a list source is in this set, its tokens will be filtered out
 * from the active tokens list.
 */
export const blockedListSourcesAtom = atom<Set<string>>(new Set())
