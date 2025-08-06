import { V_COW_CONTRACT_ADDRESS } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useTokenBySymbolOrAddress } from '@cowprotocol/tokens'
import { UiOrderType } from '@cowprotocol/types'
import { Currency } from '@uniswap/sdk-core'

import { ActivityDerivedState } from 'common/types/activity'
import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

// Helper function to compute basic activity state
export function useBasicActivityState(
  activityDerivedState: ActivityDerivedState,
  chainId: number,
): {
  id: string
  isOrder: boolean
  order: ActivityDerivedState['order']
  enhancedTransaction: ActivityDerivedState['enhancedTransaction']
  singleToken: Currency | null
  isSwap: boolean
  isExpired: boolean
  isCancelled: boolean
  isFailed: boolean
  isCancelling: boolean
} {
  const { id, isOrder, order, enhancedTransaction, isExpired, isCancelled, isFailed, isCancelling } =
    activityDerivedState

  const tokenAddress =
    enhancedTransaction?.approval?.tokenAddress ||
    (enhancedTransaction?.claim && V_COW_CONTRACT_ADDRESS[chainId as SupportedChainId])
  const singleToken = useTokenBySymbolOrAddress(tokenAddress) || null
  const isSwap = Boolean(order && getUiOrderType(order) === UiOrderType.SWAP)

  return {
    id,
    isOrder,
    order,
    enhancedTransaction,
    singleToken,
    isSwap,
    isExpired,
    isCancelled,
    isFailed,
    isCancelling,
  }
}