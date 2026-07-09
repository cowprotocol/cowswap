import { useCallback } from 'react'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { getWrappedToken, isRejectRequestProviderError } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { DEFAULT_PERMIT_VALUE } from '@cowprotocol/permit-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { callOnBeforeApprovalWidgetHook } from 'modules/injectedWidget'
import { useGeneratePermitHook, usePermitInfo } from 'modules/permit'
import { TradeType } from 'modules/trade'

import { useResetApproveProgressModalState, useUpdateApproveProgressModalState } from '../'

export function useGeneratePermitInAdvanceToTrade(amountToApprove: CurrencyAmount<Currency>): () => Promise<boolean> {
  const generatePermit = useGeneratePermitHook()
  const updateApproveProgressModalState = useUpdateApproveProgressModalState()
  const resetApproveProgressModalState = useResetApproveProgressModalState()
  const { account } = useWalletInfo()
  const tradeSpenderAddress = useTradeSpenderAddress()

  const token = getWrappedToken(amountToApprove.currency)
  const permitInfo = usePermitInfo(token, TradeType.SWAP, tradeSpenderAddress)

  return useCallback(async () => {
    if (!account || !permitInfo || !tradeSpenderAddress) return false

    const permitAmount = BigInt(amountToApprove.quotient.toString())
    const hookApprovalAmount = permitInfo.type === 'dai-like' ? DEFAULT_PERMIT_VALUE : permitAmount

    const isWidgetHookPassed = await callOnBeforeApprovalWidgetHook({
      account,
      amountToApprove,
      spenderAddress: tradeSpenderAddress,
      approvalAmount: hookApprovalAmount,
    })

    if (!isWidgetHookPassed) {
      return false
    }

    const preSignCallback = (): void =>
      updateApproveProgressModalState({
        currency: amountToApprove.currency,
        approveInProgress: true,
        amountToApprove,
      })

    try {
      const permitData = await generatePermit({
        inputToken: { name: token.name || '', address: token.address as `0x${string}` },
        account,
        permitInfo,
        amount: permitAmount,
        customSpender: tradeSpenderAddress,
        preSignCallback,
        postSignCallback: resetApproveProgressModalState,
      })

      return !!permitData
    } catch (error) {
      if (isRejectRequestProviderError(error)) {
        resetApproveProgressModalState()
        throw error
      }
      return false
    }
  }, [
    account,
    amountToApprove,
    generatePermit,
    permitInfo,
    resetApproveProgressModalState,
    tradeSpenderAddress,
    token.address,
    token.name,
    updateApproveProgressModalState,
  ])
}
