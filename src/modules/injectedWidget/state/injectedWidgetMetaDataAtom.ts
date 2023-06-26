import { atom } from 'jotai'

export interface InjectedWidgetMetaData {
  appKey: string
  url: string
}

export const injectedWidgetMetaDataAtom = atom<InjectedWidgetMetaData | null>(null)
