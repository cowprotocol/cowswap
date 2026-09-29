import { useCallback } from 'react'

import { ExecutionRevertedError } from 'viem'

import { getWrappedToken, isRejectRequestProviderError, normalizeError } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useGeneratePermitHook, usePermitInfo } from 'modules/permit'
import { useDerivedTradeState } from 'modules/trade'

import { useResetApproveProgressModalState, useUpdateApproveProgressModalState } from '../'

export function useGeneratePermitInAdvanceToTrade(amountToApprove: CurrencyAmount<Currency>): () => Promise<boolean> {
  const generatePermit = useGeneratePermitHook()
  const updateApproveProgressModalState = useUpdateApproveProgressModalState()
  const resetApproveProgressModalState = useResetApproveProgressModalState()
  const { account } = useWalletInfo()
  const { tradeType } = useDerivedTradeState() || {}

  const token = getWrappedToken(amountToApprove.currency)
  const permitInfo = usePermitInfo(token, tradeType)

  return useCallback(async () => {
    if (!account || !permitInfo) return false

    const amountRaw = BigInt(amountToApprove.quotient.toString())

    const preSignCallback = (): void =>
      updateApproveProgressModalState({
        currency: amountToApprove.currency,
        approveInProgress: true,
        amountToApprove,
      })

    try {
      // The ON_BEFORE_APPROVAL widget veto fires inside `generatePermit` on a genuine cache miss
      // (passing `sellCurrency` opts this trade approval into it) and throws WidgetHookDeclineError
      // on decline, which is caught below and reported as "not approved".
      const permitData = await generatePermit({
        inputToken: { name: token.name || '', address: token.address as `0x${string}` },
        account,
        permitInfo,
        amount: amountRaw,
        sellCurrency: amountToApprove.currency,
        preSignCallback,
        postSignCallback: resetApproveProgressModalState,
      })

      return !!permitData
    } catch (err: unknown) {
      const error = normalizeError(err)

      if (isRejectRequestProviderError(error) || error instanceof ExecutionRevertedError) {
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
    token.address,
    token.name,
    updateApproveProgressModalState,
  ])
}
