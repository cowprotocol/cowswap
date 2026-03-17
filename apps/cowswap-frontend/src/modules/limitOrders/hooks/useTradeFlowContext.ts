import { useAtomValue } from 'jotai'

import { OrderClass } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'
import { useIsSafeWallet, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { useDispatch } from 'react-redux'
import { useConfig, useWalletClient } from 'wagmi'

import { AppDispatch } from 'legacy/state'

import { useAppData } from 'modules/appData'
import { useGetAmountToSignApprove } from 'modules/erc20Approve'
import { useRateImpact } from 'modules/limitOrders/hooks/useRateImpact'
import { TradeFlowContext } from 'modules/limitOrders/services/types'
import { limitOrdersSettingsAtom } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { useGeneratePermitHook, useGetCachedPermit, usePermitInfo } from 'modules/permit'
import { TradeType } from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'

import { useGP2SettlementContractData } from 'common/hooks/useContract'
import { useEnoughAllowance } from 'common/hooks/useEnoughAllowance'
import { useSafeMemo } from 'common/hooks/useSafeMemo'

import { useLimitOrdersDerivedState } from './useLimitOrdersDerivedState'

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function useTradeFlowContext(): TradeFlowContext | null {
  const config = useConfig()
  const { data: walletClient } = useWalletClient()
  const { account } = useWalletInfo()
  const { allowsOffchainSigning } = useWalletDetails()
  const state = useLimitOrdersDerivedState()
  const isSafeWallet = useIsSafeWallet()
  const settlementContract = useGP2SettlementContractData()
  const settlementChainId = settlementContract.chainId
  const dispatch = useDispatch<AppDispatch>()
  const appData = useAppData()
  const quoteState = useTradeQuote()
  const rateImpact = useRateImpact()
  const settingsState = useAtomValue(limitOrdersSettingsAtom)
  const permitInfo = usePermitInfo(state.inputCurrency, TradeType.LIMIT_ORDER)
  const amountToApprove = useGetAmountToSignApprove()

  const enoughAllowance = useEnoughAllowance(amountToApprove || undefined)
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
      !walletClient ||
      !settlementContract?.address ||
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
      config,
      rateImpact,
      permitInfo: !enoughAllowance ? permitInfo : undefined,
      generatePermitHook,
      getCachedPermit,
      quoteState,
      postOrderParams: {
        class: OrderClass.LIMIT,
        kind: state.orderKind,
        account: account as `0x${string}`,
        chainId: settlementChainId,
        signer: walletClient,
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
    walletClient,
    config,
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
