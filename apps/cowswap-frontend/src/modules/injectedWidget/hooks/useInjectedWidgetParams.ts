import { useAtomValue } from 'jotai'

import type { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { injectedWidgetParamsAtom } from '../state/injectedWidgetParamsAtom'

export function useInjectedWidgetParams(): Partial<CowSwapWidgetParams> {
  return useAtomValue(injectedWidgetParamsAtom)
}
