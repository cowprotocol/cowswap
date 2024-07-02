import { useAtomValue } from 'jotai'

import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS, OrderClass } from '@cowprotocol/cow-sdk'
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
import { TradeType } from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'

import { useGP2SettlementContract } from 'common/hooks/useContract'
import { useSafeMemo } from 'common/hooks/useSafeMemo'

import { useLimitOrdersDerivedState } from './useLimitOrdersDerivedState'

export function useTradeFlowContext(): TradeFlowContext | null {
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

  const checkAllowanceAddress = COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId]
  const { enoughAllowance } = useEnoughBalanceAndAllowance({
    account,
    amount: state.slippageAdjustedSellAmount || undefined,
    checkAllowanceAddress,
  })
  const generatePermitHook = useGeneratePermitHook()
  const getCachedPermit = useGetCachedPermit()

  const isQuoteReady = !!quoteState.response && !quoteState.isLoading && !!quoteState.localQuoteTimestamp

  const recipientAddressOrName = state.recipient || state.recipientAddress
  const recipient = state.recipientAddress || state.recipient || account
  const sellToken = state.inputCurrency as Token
  const buyToken = state.outputCurrency as Token
  const quoteId = quoteState.response?.id || undefined

  const partiallyFillable = settingsState.partialFillsEnabled

  return useSafeMemo(() => {
    if (
      !account ||
      !state.inputCurrencyAmount ||
      !state.outputCurrencyAmount ||
      !state.inputCurrency ||
      !state.outputCurrency ||
      !provider ||
      !settlementContract ||
      !isQuoteReady ||
      !appData
    ) {
      return null
    }
    const feeAmount = CurrencyAmount.fromRawAmount(state.inputCurrency, 0)

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
        inputAmount: state.inputCurrencyAmount,
        outputAmount: state.outputCurrencyAmount,
        sellAmountBeforeFee: state.inputCurrencyAmount,
        partiallyFillable,
        appData,
        quoteId,
        isSafeWallet,
      },
    } as TradeFlowContext
  }, [
    account,
    state.inputCurrencyAmount,
    state.outputCurrencyAmount,
    state.inputCurrency,
    state.outputCurrency,
    state.orderKind,
    provider,
    settlementContract,
    isQuoteReady,
    appData,
    chainId,
    settlementContract,
    allowsOffchainSigning,
    dispatch,
    provider,
    rateImpact,
    enoughAllowance,
    permitInfo,
    generatePermitHook,
    getCachedPermit,
    quoteState,
    sellToken,
    buyToken,
    recipient,
    recipientAddressOrName,
    allowsOffchainSigning,
    partiallyFillable,
    appData,
    quoteId,
    isSafeWallet,
  ])
}
