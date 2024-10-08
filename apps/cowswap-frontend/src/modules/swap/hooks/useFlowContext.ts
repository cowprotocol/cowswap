import { useAtomValue } from 'jotai/index'

import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { OrderClass, OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import { computeSlippageAdjustedAmounts } from 'legacy/utils/prices'
import { PostOrderParams } from 'legacy/utils/trade'

import { BaseFlowContext } from 'modules/swap/services/types'
import { TradeFlowAnalyticsContext } from 'modules/trade/utils/tradeFlowAnalytics'
import { getOrderValidTo } from 'modules/tradeQuote'
import { useTradeSlippage } from 'modules/tradeSlippage'

import { useSafeMemo } from 'common/hooks/useSafeMemo'

import { useDerivedSwapInfo } from './useSwapState'

import { getAmountsForSignature } from '../helpers/getAmountsForSignature'
import { baseFlowContextSourceAtom } from '../state/baseFlowContextSourceAtom'
import { BaseFlowContextSource } from '../types/flowContext'

export function useSwapAmountsWithSlippage(): [
  CurrencyAmount<Currency> | undefined,
  CurrencyAmount<Currency> | undefined,
] {
  const slippage = useTradeSlippage()
  const { trade } = useDerivedSwapInfo()

  const { INPUT, OUTPUT } = computeSlippageAdjustedAmounts(trade, slippage)

  return useSafeMemo(() => [INPUT, OUTPUT], [INPUT, OUTPUT])
}

export function useBaseFlowContextSource(): BaseFlowContextSource | null {
  return useAtomValue(baseFlowContextSourceAtom)
}

type BaseGetFlowContextProps = {
  baseProps: BaseFlowContextSource
  sellToken?: Token
  kind: OrderKind
}

export function getFlowContext({ baseProps, sellToken, kind }: BaseGetFlowContextProps): BaseFlowContext | null {
  const {
    chainId,
    account,
    provider,
    trade,
    appData,
    wethContract,
    inputAmountWithSlippage,
    gnosisSafeInfo,
    recipient,
    recipientAddressOrName,
    deadline,
    ensRecipientAddress,
    allowsOffchainSigning,
    closeModals,
    uploadAppData,
    dispatch,
    flowType,
    sellTokenContract,
    allowedSlippage,
    tradeConfirmActions,
    getCachedPermit,
    quote,
    typedHooks,
  } = baseProps

  if (!chainId || !account || !provider || !trade || !appData || !wethContract || !inputAmountWithSlippage) {
    return null
  }

  const isSafeWallet = !!gnosisSafeInfo

  const buyToken = getIsNativeToken(trade.outputAmount.currency)
    ? NATIVE_CURRENCIES[chainId as SupportedChainId]
    : trade.outputAmount.currency
  const marketLabel = [sellToken?.symbol, buyToken.symbol].join(',')

  if (!sellToken || !buyToken) {
    return null
  }

  const swapFlowAnalyticsContext: TradeFlowAnalyticsContext = {
    account,
    recipient,
    recipientAddress: recipientAddressOrName,
    marketLabel,
    orderType: UiOrderType.SWAP,
  }

  const validTo = getOrderValidTo(deadline, {
    validFor: quote?.validFor,
    quoteValidTo: quote?.quoteValidTo,
    localQuoteTimestamp: quote?.localQuoteTimestamp,
  })

  const amountsForSignature = getAmountsForSignature({
    trade,
    kind,
    allowedSlippage,
  })

  const orderParams: PostOrderParams = {
    class: OrderClass.MARKET,
    kind,
    account,
    chainId,
    ...amountsForSignature,
    sellAmountBeforeFee: trade.inputAmountWithoutFee,
    feeAmount: trade.fee.feeAsCurrency,
    buyToken,
    sellToken,
    validTo,
    recipient: ensRecipientAddress || recipient || account,
    recipientAddressOrName,
    signer: provider.getSigner(),
    allowsOffchainSigning,
    partiallyFillable: false, // SWAP orders are always fill or kill - for now
    appData,
    quoteId: trade.quoteId,
    isSafeWallet,
  }

  return {
    context: {
      chainId,
      trade,
      inputAmountWithSlippage,
      flowType,
    },
    flags: {
      allowsOffchainSigning,
    },
    callbacks: {
      closeModals,
      uploadAppData,
      getCachedPermit,
    },
    dispatch,
    swapFlowAnalyticsContext,
    orderParams,
    appDataInfo: appData,
    sellTokenContract,
    tradeConfirmActions,
    quote,
    typedHooks,
  }
}
