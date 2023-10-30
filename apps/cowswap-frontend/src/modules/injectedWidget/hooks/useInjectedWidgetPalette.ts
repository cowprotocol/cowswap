import type { CowSwapWidgetPalette } from '@cowprotocol/widget-lib'

import { useInjectedWidgetParams } from './useInjectedWidgetParams'

// The theme palette provided by a consumer
export function useInjectedWidgetPalette(): CowSwapWidgetPalette | undefined {
  const state = useInjectedWidgetParams()

  return state.palette
}
