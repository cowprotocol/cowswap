import { Nullish } from '@cowprotocol/types'
import { SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types'

import { GenerecTradeApproveResult } from '../containers'

export function getIsTradeApproveResult(
  result: Nullish<GenerecTradeApproveResult | SafeMultisigTransactionResponse>,
): result is GenerecTradeApproveResult {
  if (!result) return false
  const tradeApprove = result as GenerecTradeApproveResult

  return !!tradeApprove.txResponse
}
