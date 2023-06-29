import { useAtomValue } from 'jotai/utils'

import { injectedWidgetParamsAtom } from '../state/injectedWidgetParamsAtom'

export function useInjectedWidgetParams() {
  return useAtomValue(injectedWidgetParamsAtom)
}
