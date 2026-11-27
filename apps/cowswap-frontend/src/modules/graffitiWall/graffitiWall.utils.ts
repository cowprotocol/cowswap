import type { CowSwapTheme } from '@cowprotocol/ui'

import { Routes } from 'common/constants/routes'

export interface GraffitiThemeContext {
  /** Whether the graffiti wall feature is on. Its kill switch is this theme's too. */
  wallEnabled: boolean
  /** The `isSolanaThemeEnabled` LaunchDarkly flag. */
  themeFlagEnabled: boolean
  /** Whether the active network is Solana. */
  onSolanaChain: boolean
  /** Whether the graffiti wall page is the one on screen. */
  onWallPage: boolean
  /** Whether the user turned the theme off in the settings menu. */
  optedOut: boolean
}

/**
 * The theme the graffiti wall paints the app in. It exists to put the live wall behind the page,
 * so it lives and dies with the wall; there is no light variant (see `WALL_BASE_COLOR` in graffitiWallTheme.styled).
 */
export const GRAFFITI_THEME: CowSwapTheme = 'darkGraffiti'

export function isGraffitiTheme(theme?: CowSwapTheme): boolean {
  return theme === GRAFFITI_THEME
}

/** The wall page and the claim screen it sends people to are one experience, and share its theme. */
export function isGraffitiWallPath(pathname: string): boolean {
  return pathname.startsWith(Routes.GRAFFITI)
}

/**
 * Chain-scoped rather than seasonal, so it is decided on its own terms and then wins over whatever
 * seasonal theme the context would otherwise give (see `useAppTheme`). The wall page carries it on
 * any network: that page is the wall, and its own chrome is drawn to sit in this theme, so
 * following the wallet's chain there would leave it in the plain one until you switched networks.
 * For the same reason the opt-out does not reach that page.
 */
export function resolveGraffitiTheme(context: GraffitiThemeContext): CowSwapTheme | undefined {
  if (!context.wallEnabled || !context.themeFlagEnabled) return undefined
  if (!context.onSolanaChain && !context.onWallPage) return undefined
  if (context.optedOut && !context.onWallPage) return undefined

  return GRAFFITI_THEME
}
