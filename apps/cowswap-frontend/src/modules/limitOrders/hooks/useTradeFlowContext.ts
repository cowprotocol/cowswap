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
import { TradeType, useAmountsToSign } from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'

import { useGP2SettlementContract } from 'common/hooks/useContract'
import { useSafeMemo } from 'common/hooks/useSafeMemo'

import { useLimitOrdersDerivedState } from './useLimitOrdersDerivedState'

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function useTradeFlowContext(): TradeFlowContext | null {
  const provider = useWalletProvider()
  const { account } = useWalletInfo()
  const { allowsOffchainSigning } = useWalletDetails()
  const state = useLimitOrdersDerivedState()
  const isSafeWallet = useIsSafeWallet()
  const { contract: settlementContract, chainId: settlementChainId } = useGP2SettlementContract()
  const dispatch = useDispatch<AppDispatch>()
  const appData = useAppData()
  const quoteState = useTradeQuote()
  const rateImpact = useRateImpact()
  const settingsState = useAtomValue(limitOrdersSettingsAtom)
  const permitInfo = usePermitInfo(state.inputCurrency, TradeType.LIMIT_ORDER)
  const { maximumSendSellAmount } = useAmountsToSign() || {}

  const checkAllowanceAddress = COW_PROTOCOL_VAULT_RELAYER_ADDRESS[settlementChainId]
  const { enoughAllowance } = useEnoughBalanceAndAllowance({
    account,
    amount: maximumSendSellAmount || undefined,
    checkAllowanceAddress,
  })
  const generatePermitHook = useGeneratePermitHook()
  const getCachedPermit = useGetCachedPermit()

  const isQuoteReady = !!quoteState.quote && !quoteState.isLoading && !!quoteState.localQuoteTimestamp

  const recipientAddressOrName = state.recipient || state.recipientAddress
  const recipient = state.recipientAddress || state.recipient || account
  const sellToken = state.inputCurrency as Token
  const buyToken = state.outputCurrency as Token
  const quoteId = quoteState.quote?.quoteResults.quoteResponse.id || undefined

  const partiallyFillable = settingsState.partialFillsEnabled

  // TODO: Reduce function complexity by extracting logic
  // eslint-disable-next-line complexity
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
      chainId: settlementChainId,
      settlementContract,
      allowsOffchainSigning,
      dispatch,
      signer: provider.getUncheckedSigner(),
      rateImpact,
      permitInfo: !enoughAllowance ? permitInfo : undefined,
      generatePermitHook,
      getCachedPermit,
      quoteState,
      postOrderParams: {
        class: OrderClass.LIMIT,
        kind: state.orderKind,
        account,
        chainId: settlementChainId,
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
    settlementChainId,
    settlementContract,
    allowsOffchainSigning,
    dispatch,
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
