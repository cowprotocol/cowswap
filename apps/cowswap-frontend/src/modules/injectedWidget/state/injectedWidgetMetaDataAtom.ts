import { atom } from 'jotai'

export interface CowSwapWidgetMetaData {
  appKey: string
}

const DEFAULT_INJECTED_WIDGET_META_DATA: CowSwapWidgetMetaData = {
  appKey: 'DEFAULT_INJECTED_WIDGET',
}

export const injectedWidgetMetaDataAtom = atom<CowSwapWidgetMetaData>(DEFAULT_INJECTED_WIDGET_META_DATA)
