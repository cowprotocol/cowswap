import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { MAX_VALID_TO_EPOCH } from '@cowprotocol/common-utils'
import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS, OrderClass, OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'
import { useIsSafeWallet, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { useDispatch } from 'react-redux'

import { AppDispatch } from 'legacy/state'
import { useCloseModals } from 'legacy/state/application/hooks'

import { useAppData, useAppDataHooks } from 'modules/appData'
import { useGeneratePermitHook, useGetCachedPermit, usePermitInfo } from 'modules/permit'
import type { SwapFlowContext } from 'modules/swap/services/types'
import { useEnoughBalanceAndAllowance } from 'modules/tokens'
import { TradeType, useDerivedTradeState, useReceiveAmountInfo, useTradeConfirmActions } from 'modules/trade'

import { useTradeQuote } from 'modules/tradeQuote'
import { useGP2SettlementContract } from 'common/hooks/useContract'

export function useTradeFlowContext(): SwapFlowContext | null {
  const { chainId, account } = useWalletInfo()
  const provider = useWalletProvider()
  const { allowsOffchainSigning } = useWalletDetails()
  const isSafeWallet = useIsSafeWallet()
  const derivedTradeState = useDerivedTradeState()
  const receiveAmountInfo = useReceiveAmountInfo()
  const sellCurrency = derivedTradeState?.inputCurrency
  const sellAmountBeforeFee = receiveAmountInfo?.beforeNetworkCosts.sellAmount
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

  const quoteId = tradeQuote.response?.id

  const {
    inputCurrency: sellToken,
    outputCurrency: buyToken,
    inputCurrencyAmount: inputAmount,
    outputCurrencyAmount: outputAmount,
    recipient,
    recipientAddress,
  } = derivedTradeState || {}

  return useMemo(() => {
    if (
      !inputAmount ||
      !outputAmount ||
      !inputAmountWithSlippage ||
      !sellAmountBeforeFee ||
      !networkFee ||
      !sellToken ||
      !buyToken ||
      !account ||
      !provider ||
      !appData ||
      !settlementContract
    )
      return null

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
        validTo: MAX_VALID_TO_EPOCH, // TODO: bind to settings
        recipient: recipient || account,
        recipientAddressOrName: recipient || null,
        allowsOffchainSigning,
        appData,
        class: OrderClass.MARKET,
        partiallyFillable: false, // TODO: bind to settings
        quoteId,
        isSafeWallet,
      },
    }
  }, [
    account,
    allowsOffchainSigning,
    appData,
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
    quoteId,
    recipient,
    sellAmountBeforeFee,
    sellToken,
    settlementContract,
    tradeConfirmActions,
    typedHooks,
  ])
}
