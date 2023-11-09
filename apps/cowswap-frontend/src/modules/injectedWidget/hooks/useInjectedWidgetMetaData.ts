import { useAtomValue } from 'jotai'

import { isInjectedWidget } from '@cowprotocol/common-utils'

import { CowSwapWidgetMetaData, injectedWidgetMetaDataAtom } from '../state/injectedWidgetMetaDataAtom'

export function useInjectedWidgetMetaData(): CowSwapWidgetMetaData | undefined {
  const injectedWidgetMetaData = useAtomValue(injectedWidgetMetaDataAtom)

  if (!isInjectedWidget()) {
    return undefined
  }

  return injectedWidgetMetaData
}
