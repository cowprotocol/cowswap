import { Erc20, Weth } from '@cowprotocol/abis'
import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { getAddress, getIsNativeToken } from '@cowprotocol/common-utils'
import { OrderClass, OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useENSAddress } from '@cowprotocol/ens'
import { Command, UiOrderType } from '@cowprotocol/types'
import { useGnosisSafeInfo, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'
import { Web3Provider } from '@ethersproject/providers'
import { SafeInfoResponse } from '@safe-global/api-kit'
import { Currency, CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'

import { useDispatch } from 'react-redux'

import { AppDispatch } from 'legacy/state'
import { useCloseModals } from 'legacy/state/application/hooks'
import { AddOrderCallback, useAddPendingOrder } from 'legacy/state/orders/hooks'
import { useGetQuoteAndStatus } from 'legacy/state/price/hooks'
import type { QuoteInformationObject } from 'legacy/state/price/reducer'
import TradeGp from 'legacy/state/swap/TradeGp'
import { useUserTransactionTTL } from 'legacy/state/user/hooks'
import { computeSlippageAdjustedAmounts } from 'legacy/utils/prices'
import { PostOrderParams } from 'legacy/utils/trade'

import type { AppDataInfo, UploadAppDataParams } from 'modules/appData'
import { useAppData, useUploadAppData } from 'modules/appData'
import { useGetCachedPermit } from 'modules/permit'
import { useIsEoaEthFlow } from 'modules/swap/hooks/useIsEoaEthFlow'
import { BaseFlowContext } from 'modules/swap/services/types'
import { TradeConfirmActions, useTradeConfirmActions } from 'modules/trade'
import { TradeFlowAnalyticsContext } from 'modules/trade/utils/analytics'

import { useTokenContract, useWETHContract } from 'common/hooks/useContract'
import { useIsSafeApprovalBundle } from 'common/hooks/useIsSafeApprovalBundle'

import { useIsSafeEthFlow } from './useIsSafeEthFlow'
import { useDerivedSwapInfo, useSwapState } from './useSwapState'

import { getOrderValidTo } from '../../tradeQuote/utils/quoteDeadline'
import { getAmountsForSignature } from '../helpers/getAmountsForSignature'

export enum FlowType {
  REGULAR = 'REGULAR',
  EOA_ETH_FLOW = 'EOA_ETH_FLOW',
  SAFE_BUNDLE_APPROVAL = 'SAFE_BUNDLE_APPROVAL',
  SAFE_BUNDLE_ETH = 'SAFE_BUNDLE_ETH',
}
interface BaseFlowContextSetup {
  chainId: SupportedChainId
  account: string | undefined
  sellTokenContract: Erc20 | null
  provider: Web3Provider | undefined
  trade: TradeGp | undefined
  appData: AppDataInfo | null
  wethContract: Weth | null
  inputAmountWithSlippage: CurrencyAmount<Currency> | undefined
  outputAmountWithSlippage: CurrencyAmount<Currency> | undefined
  gnosisSafeInfo: SafeInfoResponse | undefined
  recipient: string | null
  recipientAddressOrName: string | null
  deadline: number
  ensRecipientAddress: string | null
  allowsOffchainSigning: boolean
  flowType: FlowType
  closeModals: Command
  uploadAppData: (update: UploadAppDataParams) => void
  addOrderCallback: AddOrderCallback
  dispatch: AppDispatch
  allowedSlippage: Percent
  tradeConfirmActions: TradeConfirmActions
  getCachedPermit: ReturnType<typeof useGetCachedPermit>
  quote: QuoteInformationObject | undefined
}

export function useSwapAmountsWithSlippage(): [
  CurrencyAmount<Currency> | undefined,
  CurrencyAmount<Currency> | undefined
] {
  const { trade, allowedSlippage } = useDerivedSwapInfo()

  const { INPUT, OUTPUT } = computeSlippageAdjustedAmounts(trade, allowedSlippage)

  return [INPUT, OUTPUT]
}

export function useBaseFlowContextSetup(): BaseFlowContextSetup {
  const { provider } = useWeb3React()
  const { account, chainId } = useWalletInfo()
  const { allowsOffchainSigning } = useWalletDetails()
  const gnosisSafeInfo = useGnosisSafeInfo()
  const { recipient } = useSwapState()
  const { trade, allowedSlippage, currenciesIds } = useDerivedSwapInfo()
  const { quote } = useGetQuoteAndStatus({
    token: currenciesIds.INPUT,
    chainId,
  })

  const appData = useAppData()
  const closeModals = useCloseModals()
  const uploadAppData = useUploadAppData()
  const addOrderCallback = useAddPendingOrder()
  const dispatch = useDispatch<AppDispatch>()
  const tradeConfirmActions = useTradeConfirmActions()

  const { address: ensRecipientAddress } = useENSAddress(recipient)
  const recipientAddressOrName = recipient || ensRecipientAddress
  const [deadline] = useUserTransactionTTL()
  const wethContract = useWETHContract()
  const isEoaEthFlow = useIsEoaEthFlow()
  const isSafeEthFlow = useIsSafeEthFlow()
  const getCachedPermit = useGetCachedPermit()

  const [inputAmountWithSlippage, outputAmountWithSlippage] = useSwapAmountsWithSlippage()
  const sellTokenContract = useTokenContract(getAddress(inputAmountWithSlippage?.currency) || undefined, true)

  const isSafeBundle = useIsSafeApprovalBundle(inputAmountWithSlippage)
  const flowType = _getFlowType(isSafeBundle, isEoaEthFlow, isSafeEthFlow)

  return {
    chainId,
    account,
    sellTokenContract,
    provider,
    trade,
    appData,
    wethContract,
    inputAmountWithSlippage,
    outputAmountWithSlippage,
    gnosisSafeInfo,
    recipient,
    recipientAddressOrName,
    deadline,
    ensRecipientAddress,
    allowsOffchainSigning,
    uploadAppData,
    flowType,
    closeModals,
    addOrderCallback,
    dispatch,
    allowedSlippage,
    tradeConfirmActions,
    getCachedPermit,
    quote,
  }
}

function _getFlowType(isSafeBundle: boolean, isEoaEthFlow: boolean, isSafeEthFlow: boolean): FlowType {
  if (isSafeEthFlow) {
    // Takes precedence over bundle approval
    return FlowType.SAFE_BUNDLE_ETH
  } else if (isSafeBundle) {
    // Takes precedence over eth flow
    return FlowType.SAFE_BUNDLE_APPROVAL
  } else if (isEoaEthFlow) {
    // Takes precedence over regular flow
    return FlowType.EOA_ETH_FLOW
  }
  return FlowType.REGULAR
}

type BaseGetFlowContextProps = {
  baseProps: BaseFlowContextSetup
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
    outputAmountWithSlippage,
    gnosisSafeInfo,
    recipient,
    recipientAddressOrName,
    deadline,
    ensRecipientAddress,
    allowsOffchainSigning,
    closeModals,
    addOrderCallback,
    uploadAppData,
    dispatch,
    flowType,
    sellTokenContract,
    allowedSlippage,
    tradeConfirmActions,
    getCachedPermit,
    quote,
  } = baseProps

  if (
    !chainId ||
    !account ||
    !provider ||
    !trade ||
    !appData ||
    !wethContract ||
    !inputAmountWithSlippage ||
    !outputAmountWithSlippage
  ) {
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
      outputAmountWithSlippage,
      flowType,
    },
    flags: {
      allowsOffchainSigning,
    },
    callbacks: {
      closeModals,
      addOrderCallback,
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
  }
}
