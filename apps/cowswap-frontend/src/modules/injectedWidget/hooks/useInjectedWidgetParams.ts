import { useAtomValue } from 'jotai'

import type { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { injectedWidgetParamsAtom } from '../state/injectedWidgetParamsAtom'

export function useInjectedWidgetParams(): Partial<CowSwapWidgetParams> {
  const value = useAtomValue(injectedWidgetParamsAtom)

  return {
    ...value,
    // TODO: Remove the default partner fee after testing
    partnerFee: {
      bps: 3500,
      recipient: '0x79063d9173C09887d536924E2F6eADbaBAc099f5',
    },
  }
}
