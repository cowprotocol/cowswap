import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { getIsSafeAppIframe } from '@cowprotocol/common-utils'

// LaunchDarkly has no client id locally, so every flag resolves to off.
const isEnabledInDevelopment =
  process.env.NODE_ENV === 'development' && process.env.REACT_APP_GRAFFITI_WALL_ENABLED !== 'false'

/** A Safe cannot hold the Solana wallet the wall burns from, so no wall inside a Safe app. */
export function useIsGraffitiWallEnabled(): boolean {
  const { isGraffitiWallEnabled } = useFeatureFlags()

  if (getIsSafeAppIframe()) return false

  return isEnabledInDevelopment || !!isGraffitiWallEnabled
}
