import type { CowSwapTheme } from '@cowprotocol/ui'

import { CowSwapWidgetPalette } from './types'

export function isCowSwapWidgetPalette(
  palette: CowSwapTheme | CowSwapWidgetPalette | undefined
): palette is CowSwapWidgetPalette {
  return Boolean(palette && typeof palette === 'object')
}
