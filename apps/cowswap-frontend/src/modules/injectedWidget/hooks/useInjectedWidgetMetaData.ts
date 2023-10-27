import { useAtomValue } from 'jotai'

import { InjectedWidgetMetaData, injectedWidgetMetaDataAtom } from '../state/injectedWidgetMetaDataAtom'

export function useInjectedWidgetMetaData(): InjectedWidgetMetaData | null {
  return useAtomValue(injectedWidgetMetaDataAtom)
}
