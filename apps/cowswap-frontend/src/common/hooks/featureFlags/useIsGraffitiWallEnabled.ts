import { useFeatureFlags } from '@cowprotocol/common-hooks'

// No LaunchDarkly client id is configured outside deployed environments, so every flag stays
// undefined locally and the wall would be unreachable. Set REACT_APP_GRAFFITI_WALL_ENABLED=true
// in .env.local to work on it.
const isForcedInDevelopment =
  process.env.NODE_ENV === 'development' && process.env.REACT_APP_GRAFFITI_WALL_ENABLED === 'true'

export function useIsGraffitiWallEnabled(): boolean {
  const { isGraffitiWallEnabled } = useFeatureFlags()

  return isForcedInDevelopment || !!isGraffitiWallEnabled
}
