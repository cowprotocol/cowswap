import { useCallback } from 'react'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { currencyAmountToTokenAmount, getWrappedToken, isRejectRequestProviderError } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { useWalletInfo } from '@cowprotocol/wallet'
import { WidgetHookEvents } from '@cowprotocol/widget-lib'

import { callWidgetHook } from 'modules/injectedWidget'
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
  const permitInfo = usePermitInfo(token, TradeType.SWAP)

  return useCallback(async () => {
    if (!account || !permitInfo || !tradeSpenderAddress) return false

    const amountRaw = BigInt(amountToApprove.quotient.toString())

    const tokenAmount = currencyAmountToTokenAmount(amountToApprove)
    const isWidgetHookPassed = await callWidgetHook(WidgetHookEvents.ON_BEFORE_APPROVAL, {
      chainId: tokenAmount.currency.chainId,
      sellToken: {
        ...tokenAmount.currency,
        name: tokenAmount.currency.name || '',
        symbol: tokenAmount.currency.symbol || '',
      },
      sellAmount: amountRaw.toString(),
      walletAddress: account,
      spenderAddress: tradeSpenderAddress,
    })

    if (!isWidgetHookPassed) return false

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
        amount: amountRaw,
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
    token.address,
    token.name,
    tradeSpenderAddress,
    updateApproveProgressModalState,
  ])
}
