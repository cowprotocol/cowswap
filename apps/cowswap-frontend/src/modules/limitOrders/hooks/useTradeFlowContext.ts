import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { GP_VAULT_RELAYER } from '@cowprotocol/common-const'
import { OrderClass } from '@cowprotocol/cow-sdk'
import { useIsSafeWallet, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { useDispatch } from 'react-redux'

import { AppDispatch } from 'legacy/state'

import { useAppData } from 'modules/appData'
import { useRateImpact } from 'modules/limitOrders/hooks/useRateImpact'
import { TradeFlowContext } from 'modules/limitOrders/services/types'
import { limitOrdersSettingsAtom } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { useGeneratePermitHook, useGetCachedPermit, usePermitInfo } from 'modules/permit'
import { useEnoughBalanceAndAllowance } from 'modules/tokens'
import { getDirectedReceiveAmounts, ReceiveAmountInfo, TradeType } from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'

import { useGP2SettlementContract } from 'common/hooks/useContract'

import { useLimitOrdersDerivedState } from './useLimitOrdersDerivedState'

export function useTradeFlowContext(
  inputReceiveAmountInfo: ReceiveAmountInfo | null,
  outputReceiveAmountInfo: ReceiveAmountInfo | null
): TradeFlowContext | null {
  const provider = useWalletProvider()
  const { chainId, account } = useWalletInfo()
  const { allowsOffchainSigning } = useWalletDetails()
  const state = useLimitOrdersDerivedState()
  const isSafeWallet = useIsSafeWallet()
  const settlementContract = useGP2SettlementContract()
  const dispatch = useDispatch<AppDispatch>()
  const appData = useAppData()
  const quoteState = useTradeQuote()
  const rateImpact = useRateImpact()
  const settingsState = useAtomValue(limitOrdersSettingsAtom)
  const permitInfo = usePermitInfo(state.inputCurrency, TradeType.LIMIT_ORDER)

  const checkAllowanceAddress = GP_VAULT_RELAYER[chainId]
  const { enoughAllowance } = useEnoughBalanceAndAllowance({
    account,
    amount: state.slippageAdjustedSellAmount || undefined,
    checkAllowanceAddress,
  })
  const generatePermitHook = useGeneratePermitHook()
  const getCachedPermit = useGetCachedPermit()

  const inputReceiveAmounts = inputReceiveAmountInfo && getDirectedReceiveAmounts(inputReceiveAmountInfo)
  const outputReceiveAmounts = outputReceiveAmountInfo && getDirectedReceiveAmounts(outputReceiveAmountInfo)

  const inputAmount = inputReceiveAmounts?.amountAfterFees || state.inputCurrencyAmount
  const sellAmountBeforeFee = inputReceiveAmounts?.amountBeforeFees || state.inputCurrencyAmount
  const outputAmount = outputReceiveAmounts?.amountAfterFees || state.outputCurrencyAmount
  const partiallyFillable = settingsState.partialFillsEnabled

  return useMemo(() => {
    const isQuoteReady = !!quoteState.response && !quoteState.isLoading && !!quoteState.localQuoteTimestamp

    if (
      !account ||
      !inputAmount ||
      !outputAmount ||
      !sellAmountBeforeFee ||
      !state.inputCurrency ||
      !state.outputCurrency ||
      !provider ||
      !settlementContract ||
      !isQuoteReady ||
      !appData
    ) {
      return null
    }

    const recipientAddressOrName = state.recipient || state.recipientAddress
    const recipient = state.recipientAddress || state.recipient || account
    const sellToken = state.inputCurrency as Token
    const buyToken = state.outputCurrency as Token
    const feeAmount = CurrencyAmount.fromRawAmount(state.inputCurrency, 0)
    const quoteId = quoteState.response?.id || undefined

    return {
      chainId,
      settlementContract,
      allowsOffchainSigning,
      dispatch,
      provider,
      rateImpact,
      permitInfo: !enoughAllowance ? permitInfo : undefined,
      generatePermitHook,
      getCachedPermit,
      quoteState,
      postOrderParams: {
        class: OrderClass.LIMIT,
        kind: state.orderKind,
        account,
        chainId,
        sellToken,
        buyToken,
        recipient,
        recipientAddressOrName,
        allowsOffchainSigning,
        feeAmount,
        inputAmount,
        outputAmount,
        sellAmountBeforeFee,
        partiallyFillable,
        appData,
        quoteId,
        isSafeWallet,
      },
    }
  }, [
    account,
    inputAmount,
    outputAmount,
    sellAmountBeforeFee,
    state,
    quoteState,
    chainId,
    settlementContract,
    dispatch,
    provider,
    rateImpact,
    enoughAllowance,
    permitInfo,
    generatePermitHook,
    getCachedPermit,
    allowsOffchainSigning,
    partiallyFillable,
    appData,
    isSafeWallet,
  ])
}
