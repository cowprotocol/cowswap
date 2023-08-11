import { atom } from 'jotai'

export interface InjectedWidgetParams {
  logoUrl?: string
  hideLogo?: boolean
  hideNetworkSelector?: boolean
}

export const injectedWidgetParamsAtom = atom<InjectedWidgetParams>({})
