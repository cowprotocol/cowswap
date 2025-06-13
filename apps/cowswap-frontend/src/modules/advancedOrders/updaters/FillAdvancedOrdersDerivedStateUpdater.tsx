import { Percent } from '@uniswap/sdk-core'

import { useFillAdvancedOrdersDerivedState } from '../hooks/useAdvancedOrdersDerivedState'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function FillAdvancedOrdersDerivedStateUpdater({ slippage }: { slippage: Percent }) {
  useFillAdvancedOrdersDerivedState(slippage)
  return null
}
