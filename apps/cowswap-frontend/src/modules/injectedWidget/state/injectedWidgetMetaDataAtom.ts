import { atom } from 'jotai'

export interface CowSwapWidgetMetaData {
  appCode: string
}

const DEFAULT_INJECTED_WIDGET_META_DATA: CowSwapWidgetMetaData = {
  appCode: 'DEFAULT_INJECTED_WIDGET', // FIXME: there shouldn't be a default. If it's not set, we should have a banner or something
}

export const injectedWidgetMetaDataAtom = atom<CowSwapWidgetMetaData>(DEFAULT_INJECTED_WIDGET_META_DATA)
