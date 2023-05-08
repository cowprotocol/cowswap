import JSBI from 'jsbi'
import { Percent } from '@uniswap/sdk-core'
import { useCallback } from 'react'
import { useSetAtom } from 'jotai'
import { updateAdvancedOrdersSettingsAtom } from '@cow/modules/advancedOrders/state/advancedOrdersSettingsAtom'

export function useSetSlippage(): (slippageTolerance: Percent | 'auto') => void {
  const updateSettingsState = useSetAtom(updateAdvancedOrdersSettingsAtom)

  return useCallback(
    (userSlippageTolerance: Percent | 'auto') => {
      let value: 'auto' | number
      try {
        value =
          userSlippageTolerance === 'auto' ? 'auto' : JSBI.toNumber(userSlippageTolerance.multiply(10_000).quotient)
      } catch (error: any) {
        value = 'auto'
      }
      updateSettingsState({
        slippage: value,
      })
    },
    [updateSettingsState]
  )
}
