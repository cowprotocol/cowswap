import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { getIsSafeAppIframe } from '@cowprotocol/common-utils'

// LaunchDarkly has no client id locally, so every flag resolves to off.
const isEnabledInDevelopment =
  process.env.NODE_ENV === 'development' && process.env.REACT_APP_GRAFFITI_WALL_ENABLED !== 'false'

/**
 * Off inside a Safe app whatever the flag says: painting burns a Solana token, and a Safe cannot
 * hold a Solana wallet, so every way into the wall there ends at a connect prompt that cannot be
 * answered.
 */
export function useIsGraffitiWallEnabled(): boolean {
  const { isGraffitiWallEnabled } = useFeatureFlags()

  if (getIsSafeAppIframe()) return false

  return isEnabledInDevelopment || !!isGraffitiWallEnabled
}
