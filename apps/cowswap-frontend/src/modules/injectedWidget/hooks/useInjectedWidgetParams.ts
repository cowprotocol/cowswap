import { useAtomValue } from 'jotai'

import { CowSwapWidgetAppParams, PartnerFee } from '@cowprotocol/widget-lib'

import { injectedWidgetParamsAtom, injectedWidgetPartnerFeeAtom } from '../state/injectedWidgetParamsAtom'

export function useInjectedWidgetParams(): Partial<CowSwapWidgetAppParams> {
  return useAtomValue(injectedWidgetParamsAtom).params
}

export function useWidgetPartnerFee(): PartnerFee | undefined {
  return useAtomValue(injectedWidgetPartnerFeeAtom)
}
