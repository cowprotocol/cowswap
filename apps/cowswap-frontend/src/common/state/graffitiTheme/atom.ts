import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'

/**
 * Whether the graffiti theme may paint the app on Solana. On by default: the setting
 * exists to turn it off, so someone who has never opened it keeps what they had.
 * The wall page itself ignores this — see `resolveCustomThemeForContext`.
 */
export const graffitiThemeEnabledAtom = atomWithStorage<boolean>(
  'graffitiThemeEnabled:v0',
  true,
  getJotaiIsolatedStorage(),
  { getOnInit: true },
)
