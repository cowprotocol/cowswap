import { useFeatureFlags } from '@cowprotocol/common-hooks'

// LaunchDarkly has no client id locally, so every flag resolves to off.
const isEnabledInDevelopment =
  process.env.NODE_ENV === 'development' && process.env.REACT_APP_GRAFFITI_WALL_ENABLED !== 'false'

export function useIsGraffitiWallEnabled(): boolean {
  const { isGraffitiWallEnabled } = useFeatureFlags()

  return isEnabledInDevelopment || !!isGraffitiWallEnabled
}
