import { atom } from 'jotai'

/**
 * Shared atom for Telegram subscription state across all hook instances
 */
export const tgSubscriptionAtom = atom<boolean>(false)
