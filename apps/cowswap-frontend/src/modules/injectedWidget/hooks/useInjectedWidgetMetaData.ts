import { useAtomValue } from 'jotai'

import type { CowSwapWidgetMetaData } from '@cowprotocol/widget-lib'

import { injectedWidgetMetaDataAtom } from '../state/injectedWidgetMetaDataAtom'

export function useInjectedWidgetMetaData(): CowSwapWidgetMetaData {
  return useAtomValue(injectedWidgetMetaDataAtom)
}
