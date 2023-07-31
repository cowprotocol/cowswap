import { useAtomValue } from 'jotai'

import { injectedWidgetParamsAtom } from '../state/injectedWidgetParamsAtom'

export function useInjectedWidgetParams() {
  return useAtomValue(injectedWidgetParamsAtom)
}
