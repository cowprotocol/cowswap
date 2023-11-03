import { useAtomValue } from 'jotai'

import { CowSwapWidgetMetaData, injectedWidgetMetaDataAtom } from '../state/injectedWidgetMetaDataAtom'

export function useInjectedWidgetMetaData(): CowSwapWidgetMetaData {
  return useAtomValue(injectedWidgetMetaDataAtom)
}
