import { useAtomValue } from 'jotai'

import { CowSwapWidgetAppParams } from '@cowprotocol/widget-lib'

import { injectedWidgetParamsAtom } from '../state/injectedWidgetParamsAtom'

export function useInjectedWidgetParams(): Partial<CowSwapWidgetAppParams> {
  const { params } = useAtomValue(injectedWidgetParamsAtom)

  return params
}
