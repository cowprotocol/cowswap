import { atom } from 'jotai'

import type { CowSwapWidgetMetaData } from '@cowprotocol/widget-lib'

const DEFAULT_INJECTED_WIDGET_META_DATA: CowSwapWidgetMetaData = {
  appKey: 'DEFAULT_INJECTED_WIDGET',
}

export const injectedWidgetMetaDataAtom = atom<CowSwapWidgetMetaData>(DEFAULT_INJECTED_WIDGET_META_DATA)
