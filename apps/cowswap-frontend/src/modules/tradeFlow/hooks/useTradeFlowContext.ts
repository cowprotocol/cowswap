import { TokenWithLogo } from '@cowprotocol/common-const'
import { OrderClass, PriceQuality } from '@cowprotocol/cow-sdk'
import { useIsSafeWallet, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { useAddBridgeOrder } from 'entities/bridgeOrders'
import { useDispatch } from 'react-redux'
import useSWR from 'swr'
import { useConfig } from 'wagmi'

import { AppDispatch } from 'legacy/state'
import { useCloseModals } from 'legacy/state/application/hooks'

import { useAppData, useAppDataHooks } from 'modules/appData'
import { useBridgeQuoteAmounts } from 'modules/bridge'
import { useGetAmountToSignApprove } from 'modules/erc20Approve'
import { useGeneratePermitHook, useGetCachedPermit, usePermitInfo } from 'modules/permit'
import {
  TradeTypeToUiOrderType,
  useDerivedTradeState,
  useGetReceiveAmountInfo,
  useIsHooksTradeType,
  useTradeConfirmActions,
  useTradeTypeInfo,
} from 'modules/trade'
import { getOrderValidTo, useTradeQuote } from 'modules/tradeQuote'

import { useGP2SettlementContractData } from 'common/hooks/useContract'
import { useEnoughAllowance } from 'common/hooks/useEnoughAllowance'

import { useSetSigningStep } from './useSetSigningStep'

import { TradeFlowContext } from '../types/TradeFlowContext'

export interface TradeFlowParams {
  deadline: number
}

// TODO: Break down this large function into smaller functions
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, complexity
export function useTradeFlowContext({ deadline }: TradeFlowParams): TradeFlowContext | null {
  const config = useConfig()
  const { account } = useWalletInfo()
  const { allowsOffchainSigning } = useWalletDetails()
  const isSafeWallet = useIsSafeWallet()
  const derivedTradeState = useDerivedTradeState()
  const receiveAmountInfo = useGetReceiveAmountInfo()
  const tradeTypeInfo = useTradeTypeInfo()
  const tradeType = tradeTypeInfo?.tradeType
  const uiOrderType = tradeType ? TradeTypeToUiOrderType[tradeType] : null
  const isHooksTradeType = useIsHooksTradeType()
  const setSigningStep = useSetSigningStep()

  const tradeQuote = useTradeQuote()
  const bridgeContext = useBridgeQuoteAmounts()

  const sellCurrency = derivedTradeState?.inputCurrency
  const inputAmount = receiveAmountInfo?.afterSlippage.sellAmount
  const bridgeOutputAmount = bridgeContext?.bridgeMinReceiveAmount
  const outputAmount = receiveAmountInfo?.afterSlippage.buyAmount

  const sellAmountBeforeFee = receiveAmountInfo?.afterNetworkCosts.sellAmount
  const networkFee = receiveAmountInfo?.costs.networkFee.amountInSellCurrency

  const permitInfo = usePermitInfo(sellCurrency, tradeType)
  const generatePermitHook = useGeneratePermitHook()
  const getCachedPermit = useGetCachedPermit()
  const closeModals = useCloseModals()
  const dispatch = useDispatch<AppDispatch>()
  const tradeConfirmActions = useTradeConfirmActions()
  const { chainId: settlementChainId, ...settlementContract } = useGP2SettlementContractData()
  const appData = useAppData()
  const typedHooks = useAppDataHooks()
  const addBridgeOrder = useAddBridgeOrder()
  const bridgeQuoteAmounts = useBridgeQuoteAmounts()
  const amountToSignApprove = useGetAmountToSignApprove()
  const permitAmountToSign = amountToSignApprove ? BigInt(amountToSignApprove.quotient.toString()) : undefined

  const enoughAllowance = useEnoughAllowance(inputAmount)

  const {
    inputCurrency: sellToken,
    outputCurrency: buyToken,
    recipient,
    recipientAddress,
    orderKind,
  } = derivedTradeState || {}

  const validTo = getOrderValidTo(deadline, tradeQuote)

  return (
    useSWR(
      inputAmount &&
        outputAmount &&
        sellAmountBeforeFee &&
        networkFee &&
        sellToken &&
        buyToken &&
        account &&
        appData &&
        tradeQuote.quote &&
        tradeQuote.fetchParams?.priceQuality === PriceQuality.OPTIMAL &&
        orderKind &&
        settlementContract &&
        uiOrderType &&
        validTo > 0
        ? [
            account,
            allowsOffchainSigning,
            appData,
            tradeQuote,
            tradeQuote.quote,
            buyToken,
            settlementChainId,
            closeModals,
            dispatch,
            enoughAllowance,
            generatePermitHook,
            permitAmountToSign,
            inputAmount,
            networkFee,
            outputAmount,
            permitInfo,
            recipient,
            recipientAddress,
            sellAmountBeforeFee,
            sellToken,
            settlementContract,
            tradeConfirmActions,
            typedHooks,
            validTo,
            orderKind,
            uiOrderType,
            bridgeQuoteAmounts,
            addBridgeOrder,
            setSigningStep,
          ]
        : null,
      // TODO: Break down this large function into smaller functions
      // eslint-disable-next-line max-lines-per-function
      ([
        account,
        allowsOffchainSigning,
        appData,
        tradeQuoteState,
        tradeQuote,
        buyToken,
        chainId,
        closeModals,
        dispatch,
        enoughAllowance,
        generatePermitHook,
        permitAmountToSign,
        inputAmount,
        networkFee,
        outputAmount,
        permitInfo,
        recipient,
        recipientAddress,
        sellAmountBeforeFee,
        sellToken,
        settlementContract,
        tradeConfirmActions,
        typedHooks,
        validTo,
        orderKind,
        uiOrderType,
        bridgeQuoteAmounts,
        addBridgeOrder,
        setSigningStep,
      ]) => {
        return {
          tradeQuoteState,
          tradeQuote,
          bridgeQuoteAmounts,
          context: {
            chainId,
            inputAmount,
            outputAmount,
            inputAmountWithSlippage: inputAmount,
          },
          flags: {
            allowsOffchainSigning,
          },
          callbacks: {
            closeModals,
            getCachedPermit,
            dispatch,
            addBridgeOrder,
            setSigningStep,
          },
          tradeConfirmActions,
          swapFlowAnalyticsContext: {
            account,
            recipient,
            recipientAddress,
            marketLabel: [inputAmount?.currency.symbol, outputAmount?.currency.symbol].join(','),
            orderType: uiOrderType,
            isBridgeOrder: inputAmount.currency.chainId !== outputAmount.currency.chainId,
          },
          contract: settlementContract,
          permitInfo: !enoughAllowance ? permitInfo : undefined,
          generatePermitHook,
          permitAmountToSign,
          typedHooks,
          orderParams: {
            account,
            chainId,
            config,
            kind: orderKind,
            inputAmount,
            outputAmount,
            bridgeOutputAmount,
            sellAmountBeforeFee,
            feeAmount: networkFee,
            sellToken: sellToken as TokenWithLogo,
            buyToken: buyToken as TokenWithLogo,
            validTo,
            recipient: recipientAddress || recipient || account,
            recipientAddressOrName: recipient || null,
            allowsOffchainSigning,
            appData,
            class: OrderClass.MARKET,
            partiallyFillable: isHooksTradeType,
            quoteId: tradeQuote.quoteResults.quoteResponse.id,
            isSafeWallet,
          },
        }
      },
    ).data || null
  )
}
