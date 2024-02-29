import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import type { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { injectedWidgetParamsAtom } from '../state/injectedWidgetParamsAtom'

export function useInjectedWidgetParams(): Partial<CowSwapWidgetParams> {
  const value = useAtomValue(injectedWidgetParamsAtom)

  return useMemo(() => {
    return {
      ...value,
      // TODO: Remove the default partner fee after testing
      partnerFee: {
        bps: 2500,
        recipient: '0x79063d9173C09887d536924E2F6eADbaBAc099f5',
      },
    }
  }, [value])
}
