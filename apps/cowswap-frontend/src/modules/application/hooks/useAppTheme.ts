import type { CowSwapTheme } from '@cowprotocol/ui'

import { useGraffitiTheme } from 'modules/graffitiWall'

import { useCustomTheme } from 'common/hooks/useCustomTheme'

/**
 * The theme the app shell paints in: the graffiti wall theme where it applies, otherwise the
 * seasonal one. The wall theme is chain- and route-scoped rather than seasonal, so it is resolved
 * on its own terms and wins over whatever season is running.
 */
export function useAppTheme(): CowSwapTheme | undefined {
  const graffitiTheme = useGraffitiTheme()
  const customTheme = useCustomTheme()

  return graffitiTheme ?? customTheme
}
