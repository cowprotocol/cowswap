import type { CowSwapWidgetPalette } from '@cowprotocol/widget-lib'

import { useInjectedWidgetParams } from './useInjectedWidgetParams'

// The theme palette provided by a consumer
export function useInjectedWidgetPalette(): CowSwapWidgetPalette | undefined {
  const state = useInjectedWidgetParams()

  return isCowSwapWidgetPallet(state.theme) ? state.theme : undefined
}

function isCowSwapWidgetPallet(palette: any): palette is CowSwapWidgetPalette {
  return palette && typeof palette === 'object'
}
