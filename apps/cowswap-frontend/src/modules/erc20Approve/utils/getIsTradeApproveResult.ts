import { Nullish } from '@cowprotocol/types'
import { SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types'

import { TradeApproveResult } from '../containers'

export function getIsTradeApproveResult(
  result: Nullish<TradeApproveResult | SafeMultisigTransactionResponse>,
): result is TradeApproveResult {
  if (!result) return false
  const tradeApprove = result as TradeApproveResult

  return !!tradeApprove.txResponse
}
