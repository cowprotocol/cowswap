import { atom } from 'jotai'

export interface CowSwapWidgetMetaData {
  appCode: string
}

const DEFAULT_INJECTED_WIDGET_META_DATA: CowSwapWidgetMetaData = {
  appCode: 'DEFAULT_INJECTED_WIDGET',
}

export const injectedWidgetMetaDataAtom = atom<CowSwapWidgetMetaData>(DEFAULT_INJECTED_WIDGET_META_DATA)
