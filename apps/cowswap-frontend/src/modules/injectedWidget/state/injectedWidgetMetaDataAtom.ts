import { atom } from 'jotai'

export interface CowSwapWidgetMetaData {
  appCode: string
}

export const injectedWidgetMetaDataAtom = atom<CowSwapWidgetMetaData | undefined>(undefined)
