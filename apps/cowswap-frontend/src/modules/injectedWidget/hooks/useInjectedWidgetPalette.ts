import type { InjectedWidgetPalette } from '@cowprotocol/widget-lib'

import { useInjectedWidgetParams } from './useInjectedWidgetParams'

// The theme palette provided by a consumer
export function useInjectedWidgetPalette(): InjectedWidgetPalette | undefined {
  const state = useInjectedWidgetParams()

  return state.palette
}
