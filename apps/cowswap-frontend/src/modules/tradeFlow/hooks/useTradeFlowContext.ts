import { TokenWithLogo } from '@cowprotocol/common-const'
import { OrderClass, OrderKind, PriceQuality, QuoteAndPost } from '@cowprotocol/cow-sdk'
import type { Currency, CurrencyAmount } from '@cowprotocol/currency'
import type { UiOrderType } from '@cowprotocol/types'
import { useIsSafeWallet, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { useAddBridgeOrder } from 'entities/bridgeOrders'
import { useDispatch } from 'react-redux'
import useSWR from 'swr'
import { useConfig, useWalletClient } from 'wagmi'

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

import type { WalletClient } from 'viem'

export interface TradeFlowParams {
  deadline: number
}

// TODO: Break down this large function into smaller functions
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, complexity
export function useTradeFlowContext({ deadline }: TradeFlowParams): TradeFlowContext | null {
  const config = useConfig()
  const { data: walletClient } = useWalletClient()
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
  const { sellAmount: inputAmount, buyAmount: outputAmount } = receiveAmountInfo?.amountsToSign ?? {}
  const bridgeOutputAmount = bridgeContext?.bridgeMinReceiveAmount

  const sellAmountBeforeFee = receiveAmountInfo?.afterNetworkCosts.sellAmount
  const networkFee = receiveAmountInfo?.costs.networkFee.amountInSellCurrency

  const permitInfo = usePermitInfo(sellCurrency, tradeType)
  const generatePermitHook = useGeneratePermitHook()
  const getCachedPermit = useGetCachedPermit()
  const closeModals = useCloseModals()
  const dispatch = useDispatch<AppDispatch>()
  const tradeConfirmActions = useTradeConfirmActions()
  const settlementContract = useGP2SettlementContractData()
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

  const settlementChainId = settlementContract.chainId

  type MemoDeps = [
    typeof account,
    typeof allowsOffchainSigning,
    typeof appData,
    typeof tradeQuote,
    typeof tradeQuote.quote,
    typeof buyToken,
    typeof settlementChainId,
    typeof closeModals,
    typeof dispatch,
    typeof enoughAllowance,
    typeof generatePermitHook,
    typeof permitAmountToSign,
    typeof inputAmount,
    typeof networkFee,
    typeof outputAmount,
    typeof permitInfo,
    typeof recipient,
    typeof recipientAddress,
    typeof sellAmountBeforeFee,
    typeof sellToken,
    typeof settlementContract,
    typeof tradeConfirmActions,
    typeof typedHooks,
    typeof validTo,
    typeof orderKind,
    typeof uiOrderType,
    typeof bridgeQuoteAmounts,
    typeof addBridgeOrder,
    typeof setSigningStep,
    typeof walletClient,
    typeof config,
  ]
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
        validTo > 0 &&
        walletClient
        ? ([
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
            walletClient,
            config,
          ] as MemoDeps)
        : null,
      // TODO: Break down this large function into smaller functions
      // eslint-disable-next-line max-lines-per-function, complexity
      (deps: MemoDeps) => {
        const [
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
          walletClient,
          config,
        ] = deps
        void settlementContract // in deps for memo stability
        return {
          tradeQuoteState,
          tradeQuote: tradeQuote as QuoteAndPost,
          bridgeQuoteAmounts,
          context: {
            chainId,
            inputAmount: inputAmount as CurrencyAmount<Currency>,
            outputAmount: outputAmount as CurrencyAmount<Currency>,
            inputAmountWithSlippage: inputAmount as CurrencyAmount<Currency>,
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
            account: account ?? null,
            recipient: recipient ?? null,
            recipientAddress: recipientAddress ?? null,
            marketLabel: [inputAmount?.currency.symbol, outputAmount?.currency.symbol].join(','),
            orderType: uiOrderType as UiOrderType,
            isBridgeOrder: inputAmount?.currency.chainId !== outputAmount?.currency.chainId,
          },
          permitInfo: !enoughAllowance ? permitInfo : undefined,
          generatePermitHook,
          permitAmountToSign,
          typedHooks,
          orderParams: {
            account: account as `0x${string}`,
            chainId,
            signer: walletClient as WalletClient,
            kind: orderKind as OrderKind,
            inputAmount: inputAmount as CurrencyAmount<Currency>,
            outputAmount: outputAmount as CurrencyAmount<Currency>,
            bridgeOutputAmount,
            sellAmountBeforeFee: sellAmountBeforeFee as CurrencyAmount<Currency>,
            feeAmount: networkFee,
            sellToken: sellToken as unknown as TokenWithLogo,
            buyToken: buyToken as unknown as TokenWithLogo,
            validTo,
            recipient: (recipientAddress || recipient || account) ?? '',
            recipientAddressOrName: recipient ?? null,
            allowsOffchainSigning,
            appData: appData as NonNullable<typeof appData>,
            class: OrderClass.MARKET,
            partiallyFillable: isHooksTradeType,
            quoteId: tradeQuote?.quoteResults?.quoteResponse?.id ?? undefined,
            isSafeWallet,
          },
          config,
        }
      },
    ).data || null
  )
}
