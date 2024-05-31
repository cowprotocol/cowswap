import { Percent } from '@uniswap/sdk-core'

import { useFillAdvancedOrdersDerivedState } from '../hooks/useAdvancedOrdersDerivedState'

export function FillAdvancedOrdersDerivedStateUpdater({ slippage }: { slippage: Percent }) {
  useFillAdvancedOrdersDerivedState(slippage)
  return null
}
