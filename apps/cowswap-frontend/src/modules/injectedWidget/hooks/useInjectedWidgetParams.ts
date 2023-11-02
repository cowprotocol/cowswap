import { useAtomValue } from 'jotai'

import type { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { injectedWidgetParamsAtom } from '../state/injectedWidgetParamsAtom'

export function useInjectedWidgetParams(): CowSwapWidgetParams {
  return useAtomValue(injectedWidgetParamsAtom)
}
