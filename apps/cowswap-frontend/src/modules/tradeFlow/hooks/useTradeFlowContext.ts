import { TokenWithLogo } from '@cowprotocol/common-const'
import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS, OrderClass, PriceQuality, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useIsSafeWallet, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { useDispatch } from 'react-redux'
import useSWR from 'swr'

import { AppDispatch } from 'legacy/state'
import { useCloseModals } from 'legacy/state/application/hooks'

import { useAppData, useAppDataHooks } from 'modules/appData'
import { useGeneratePermitHook, useGetCachedPermit, usePermitInfo } from 'modules/permit'
import { useEnoughBalanceAndAllowance } from 'modules/tokens'
import {
  useDerivedTradeState,
  useIsHooksTradeType,
  useReceiveAmountInfo,
  useTradeConfirmActions,
  useTradeTypeInfo,
} from 'modules/trade'
import { getOrderValidTo, useTradeQuote } from 'modules/tradeQuote'

import { useGP2SettlementContract } from 'common/hooks/useContract'

import { TradeTypeToUiOrderType } from '../../trade/const/common'
import { TradeFlowContext } from '../types/TradeFlowContext'

export interface TradeFlowParams {
  deadline: number
}

// TODO: Break down this large function into smaller functions
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, complexity
export function useTradeFlowContext({ deadline }: TradeFlowParams): TradeFlowContext | null {
  const { account } = useWalletInfo()
  const provider = useWalletProvider()
  const { allowsOffchainSigning } = useWalletDetails()
  const isSafeWallet = useIsSafeWallet()
  const derivedTradeState = useDerivedTradeState()
  const receiveAmountInfo = useReceiveAmountInfo()
  const tradeTypeInfo = useTradeTypeInfo()
  const tradeType = tradeTypeInfo?.tradeType
  const uiOrderType = tradeType ? TradeTypeToUiOrderType[tradeType] : null
  const isHooksTradeType = useIsHooksTradeType()

  const sellCurrency = derivedTradeState?.inputCurrency
  const inputAmount = receiveAmountInfo?.afterSlippage.sellAmount
  const outputAmount = receiveAmountInfo?.afterSlippage.buyAmount
  const sellAmountBeforeFee = receiveAmountInfo?.afterNetworkCosts.sellAmount
  const networkFee = receiveAmountInfo?.costs.networkFee.amountInSellCurrency

  const permitInfo = usePermitInfo(sellCurrency, tradeType)
  const generatePermitHook = useGeneratePermitHook()
  const getCachedPermit = useGetCachedPermit()
  const closeModals = useCloseModals()
  const dispatch = useDispatch<AppDispatch>()
  const tradeConfirmActions = useTradeConfirmActions()
  const { contract: settlementContract, chainId: settlementChainId } = useGP2SettlementContract()
  const appData = useAppData()
  const typedHooks = useAppDataHooks()
  const tradeQuote = useTradeQuote()

  const checkAllowanceAddress = COW_PROTOCOL_VAULT_RELAYER_ADDRESS[settlementChainId || SupportedChainId.MAINNET]
  const { enoughAllowance } = useEnoughBalanceAndAllowance({
    account,
    amount: inputAmount,
    checkAllowanceAddress,
  })

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
        provider &&
        appData &&
        tradeQuote.quote &&
        tradeQuote.fetchParams?.priceQuality === PriceQuality.OPTIMAL &&
        orderKind &&
        settlementContract &&
        uiOrderType
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
            inputAmount,
            networkFee,
            outputAmount,
            permitInfo,
            provider,
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
        inputAmount,
        networkFee,
        outputAmount,
        permitInfo,
        provider,
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
      ]) => {
        return {
          tradeQuoteState,
          tradeQuote,
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
          },
          tradeConfirmActions,
          swapFlowAnalyticsContext: {
            account,
            recipient,
            recipientAddress,
            marketLabel: [inputAmount?.currency.symbol, outputAmount?.currency.symbol].join(','),
            orderType: uiOrderType,
          },
          contract: settlementContract,
          permitInfo: !enoughAllowance ? permitInfo : undefined,
          generatePermitHook,
          typedHooks,
          orderParams: {
            account,
            chainId,
            signer: provider.getUncheckedSigner(),
            kind: orderKind,
            inputAmount,
            outputAmount,
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
