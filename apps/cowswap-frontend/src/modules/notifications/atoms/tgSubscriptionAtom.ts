import { atom } from 'jotai'

/**
 * Shared atom for Telegram subscription state across all hook instances, keyed by normalized wallet account.
 */
export const tgSubscriptionAtom = atom<Record<string, boolean>>({})
