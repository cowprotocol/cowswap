import { atom } from 'jotai'

/**
 * Wait & Save (Wait for CoWs) toggle. When enabled, market orders carry
 * `metadata.validFrom` for the next canonical batch in signed appData.
 */
export const waitAndSaveEnabledAtom = atom(false)
