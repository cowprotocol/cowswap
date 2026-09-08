import { atom } from 'jotai'

export interface TelegramSubscriptionState {
  isSubscribed: boolean
  username?: string
  // Static link to the bot chat (no connect-token) - unsubscribing only happens there.
  botDeepLink?: string
}

/**
 * Shared across every useTelegramConnect() instance so header/sidebar/settings
 * agree on subscription state instead of each holding its own stale copy, and
 * so a hook instance that remounts (e.g. the sidebar, which unmounts when closed)
 * doesn't flash "not subscribed" before its own fetch resolves.
 */
export const telegramSubscriptionAtom = atom<Record<string, TelegramSubscriptionState>>({})
