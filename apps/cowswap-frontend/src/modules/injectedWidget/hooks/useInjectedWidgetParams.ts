import { useAtomValue } from 'jotai'

import type { CowSwapWidgetAppParams } from '@cowprotocol/widget-lib'

import { injectedWidgetParamsAtom } from '../state/injectedWidgetParamsAtom'

export function useInjectedWidgetParams(): CowSwapWidgetAppParams {
  return useAtomValue(injectedWidgetParamsAtom)
}
