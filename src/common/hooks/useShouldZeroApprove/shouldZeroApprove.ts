import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { Erc20 } from 'legacy/abis/types'
import { ApprovalState } from 'legacy/hooks/useApproveCallback'

interface ShouldZeroApproveParams {
  approvalState: ApprovalState
  tokenContract: Erc20 | null
  spender: string | undefined
  amountToApprove: CurrencyAmount<Currency> | undefined
}

export async function shouldZeroApprove({
  approvalState,
  tokenContract,
  spender,
  amountToApprove,
}: ShouldZeroApproveParams) {
  const shouldApprove = approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING
  if (tokenContract && spender && amountToApprove) {
    if (!shouldApprove) {
      return false
    }

    try {
      await tokenContract.estimateGas.approve(
        spender,
        amountToApprove.multiply(10 ** amountToApprove.currency.decimals).toExact()
      )

      return false
    } catch (err) {
      try {
        await tokenContract.estimateGas.approve(spender, '0')
        // Zero approval case
        return true
      } catch (err) {
        // Actual error case
        return false
      }
    }
  } else {
    return false
  }
}
