import { atom } from 'jotai'

/**
 * Shared atom for Telegram subscription state across all hook instances
 * This ensures that when one component updates the subscription status,
 * all other components immediately see the change
 */
export const tgSubscriptionAtom = atom<boolean>(false)
