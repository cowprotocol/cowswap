import { TokenWithLogo } from '@cowprotocol/common-const'
import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS, OrderClass, OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'
import { useIsSafeWallet, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { useDispatch } from 'react-redux'
import useSWR from 'swr'

import { AppDispatch } from 'legacy/state'
import { useCloseModals } from 'legacy/state/application/hooks'

import { useAppData, useAppDataHooks } from 'modules/appData'
import { useGeneratePermitHook, useGetCachedPermit, usePermitInfo } from 'modules/permit'
import { useEnoughBalanceAndAllowance } from 'modules/tokens'
import { TradeType, useDerivedTradeState, useReceiveAmountInfo, useTradeConfirmActions } from 'modules/trade'
import { getOrderValidTo, useTradeQuote } from 'modules/tradeQuote'

import { useGP2SettlementContract } from 'common/hooks/useContract'

import { TradeFlowContext } from '../types/TradeFlowContext'

export interface TradeFlowParams {
  deadline: number
}

export function useTradeFlowContext({ deadline }: TradeFlowParams): TradeFlowContext | null {
  const { chainId, account } = useWalletInfo()
  const provider = useWalletProvider()
  const { allowsOffchainSigning } = useWalletDetails()
  const isSafeWallet = useIsSafeWallet()
  const derivedTradeState = useDerivedTradeState()
  const receiveAmountInfo = useReceiveAmountInfo()

  const sellCurrency = derivedTradeState?.inputCurrency
  const inputAmount = receiveAmountInfo?.afterNetworkCosts.sellAmount
  const outputAmount = receiveAmountInfo?.afterSlippage.buyAmount
  const sellAmountBeforeFee = receiveAmountInfo?.afterNetworkCosts.sellAmount
  const inputAmountWithSlippage = receiveAmountInfo?.afterSlippage.sellAmount
  const networkFee = receiveAmountInfo?.costs.networkFee.amountInSellCurrency

  const permitInfo = usePermitInfo(sellCurrency, TradeType.YIELD)
  const generatePermitHook = useGeneratePermitHook()
  const getCachedPermit = useGetCachedPermit()
  const closeModals = useCloseModals()
  const dispatch = useDispatch<AppDispatch>()
  const tradeConfirmActions = useTradeConfirmActions()
  const settlementContract = useGP2SettlementContract()
  const appData = useAppData()
  const typedHooks = useAppDataHooks()
  const tradeQuote = useTradeQuote()

  const checkAllowanceAddress = COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId || SupportedChainId.MAINNET]
  const { enoughAllowance } = useEnoughBalanceAndAllowance({
    account,
    amount: inputAmountWithSlippage,
    checkAllowanceAddress,
  })

  const { inputCurrency: sellToken, outputCurrency: buyToken, recipient, recipientAddress } = derivedTradeState || {}
  const quoteParams = tradeQuote?.quoteParams
  const quoteResponse = tradeQuote?.response
  const localQuoteTimestamp = tradeQuote?.localQuoteTimestamp

  return (
    useSWR(
      inputAmount &&
        outputAmount &&
        inputAmountWithSlippage &&
        sellAmountBeforeFee &&
        networkFee &&
        sellToken &&
        buyToken &&
        account &&
        provider &&
        appData &&
        quoteParams &&
        quoteResponse &&
        localQuoteTimestamp &&
        settlementContract
        ? [
            account,
            allowsOffchainSigning,
            appData,
            quoteParams,
            quoteResponse,
            localQuoteTimestamp,
            buyToken,
            chainId,
            closeModals,
            dispatch,
            enoughAllowance,
            generatePermitHook,
            inputAmount,
            inputAmountWithSlippage,
            networkFee,
            outputAmount,
            permitInfo,
            provider,
            recipient,
            sellAmountBeforeFee,
            sellToken,
            settlementContract,
            tradeConfirmActions,
            typedHooks,
            deadline,
          ]
        : null,
      ([
        account,
        allowsOffchainSigning,
        appData,
        quoteParams,
        quoteResponse,
        localQuoteTimestamp,
        buyToken,
        chainId,
        closeModals,
        dispatch,
        enoughAllowance,
        generatePermitHook,
        inputAmount,
        inputAmountWithSlippage,
        networkFee,
        outputAmount,
        permitInfo,
        provider,
        recipient,
        sellAmountBeforeFee,
        sellToken,
        settlementContract,
        tradeConfirmActions,
        typedHooks,
        deadline,
      ]) => {
        return {
          context: {
            chainId,
            inputAmount,
            outputAmount,
            inputAmountWithSlippage,
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
            orderType: UiOrderType.YIELD,
          },
          contract: settlementContract,
          permitInfo: !enoughAllowance ? permitInfo : undefined,
          generatePermitHook,
          typedHooks,
          orderParams: {
            account,
            chainId,
            signer: provider.getSigner(),
            kind: OrderKind.SELL,
            inputAmount,
            outputAmount,
            sellAmountBeforeFee,
            feeAmount: networkFee,
            sellToken: sellToken as TokenWithLogo,
            buyToken: buyToken as TokenWithLogo,
            validTo: getOrderValidTo(deadline, {
              validFor: quoteParams.validFor,
              quoteValidTo: quoteResponse.quote.validTo,
              localQuoteTimestamp,
            }),
            recipient: recipient || account,
            recipientAddressOrName: recipient || null,
            allowsOffchainSigning,
            appData,
            class: OrderClass.MARKET,
            partiallyFillable: true,
            quoteId: quoteResponse.id,
            isSafeWallet,
          },
        }
      },
    ).data || null
  )
}
