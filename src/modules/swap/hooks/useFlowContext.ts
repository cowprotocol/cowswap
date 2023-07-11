import { Weth } from '@cowprotocol/abis'
import { OrderClass, OrderKind } from '@cowprotocol/cow-sdk'
import { Web3Provider } from '@ethersproject/providers'
import { SafeInfoResponse } from '@safe-global/api-kit'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'

import { useDispatch } from 'react-redux'

import { NATIVE_CURRENCY_BUY_TOKEN } from 'legacy/constants'
import { GpEther as ETHER } from 'legacy/constants/tokens'
import { useWETHContract } from 'legacy/hooks/useContract'
import useENSAddress from 'legacy/hooks/useENSAddress'
import { AppDispatch } from 'legacy/state'
import { useCloseModals } from 'legacy/state/application/hooks'
import { AddOrderCallback, useAddPendingOrder } from 'legacy/state/orders/hooks'
import { useDerivedSwapInfo, useSwapState } from 'legacy/state/swap/hooks'
import TradeGp from 'legacy/state/swap/TradeGp'
import { useUserTransactionTTL } from 'legacy/state/user/hooks'
import { computeSlippageAdjustedAmounts } from 'legacy/utils/prices'
import { PostOrderParams } from 'legacy/utils/trade'

import type { AppDataInfo } from 'modules/appData'
import { useAppData } from 'modules/appData'
import { useIsSafeApprovalBundle } from 'modules/limitOrders/hooks/useIsSafeApprovalBundle'
import { useIsEoaEthFlow } from 'modules/swap/hooks/useIsEoaEthFlow'
import { SwapConfirmManager, useSwapConfirmManager } from 'modules/swap/hooks/useSwapConfirmManager'
import { BaseFlowContext } from 'modules/swap/services/types'
import { SwapFlowAnalyticsContext } from 'modules/trade/utils/analytics'
import { useGnosisSafeInfo, useWalletDetails, useWalletInfo } from 'modules/wallet'

import { calculateValidTo } from 'utils/time'

import { useIsSafeEthFlow } from './useIsSafeEthFlow'

const _computeInputAmountForSignature = (params: {
  input: CurrencyAmount<Currency>
  inputWithSlippage: CurrencyAmount<Currency>
  fee?: CurrencyAmount<Currency>
  kind: OrderKind
}) => {
  const { input, inputWithSlippage, fee, kind } = params
  // When POSTing the order, we need to check inputAmount value depending on trade type
  // If we don't have an applicable fee amt, return the input as is
  if (!fee) return input

  if (kind === OrderKind.SELL) {
    // User SELLING? POST inputAmount as amount with fee applied
    return input
  } else {
    // User BUYING? POST inputAmount as amount with no fee
    return inputWithSlippage.subtract(fee)
  }
}

export enum FlowType {
  REGULAR = 'REGULAR',
  EOA_ETH_FLOW = 'EOA_ETH_FLOW',
  SAFE_BUNDLE_APPROVAL = 'SAFE_BUNDLE_APPROVAL',
  SAFE_BUNDLE_ETH = 'SAFE_BUNDLE_ETH',
}

interface BaseFlowContextSetup {
  chainId: number | undefined
  account: string | undefined
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
  swapConfirmManager: SwapConfirmManager
  flowType: FlowType
  closeModals: () => void
  addOrderCallback: AddOrderCallback
  dispatch: AppDispatch
}

export function useBaseFlowContextSetup(): BaseFlowContextSetup {
  const { provider } = useWeb3React()
  const { account, chainId } = useWalletInfo()
  const { allowsOffchainSigning } = useWalletDetails()
  const gnosisSafeInfo = useGnosisSafeInfo()
  const { recipient } = useSwapState()
  const { v2Trade: trade, allowedSlippage } = useDerivedSwapInfo()

  const appData = useAppData()
  const closeModals = useCloseModals()
  const addOrderCallback = useAddPendingOrder()
  const dispatch = useDispatch<AppDispatch>()

  const { address: ensRecipientAddress } = useENSAddress(recipient)
  const recipientAddressOrName = recipient || ensRecipientAddress
  const [deadline] = useUserTransactionTTL()
  const wethContract = useWETHContract()
  const swapConfirmManager = useSwapConfirmManager()
  const isEoaEthFlow = useIsEoaEthFlow()
  const isSafeEthFlow = useIsSafeEthFlow()

  const { INPUT: inputAmountWithSlippage, OUTPUT: outputAmountWithSlippage } = computeSlippageAdjustedAmounts(
    trade,
    allowedSlippage
  )

  const isSafeBundle = useIsSafeApprovalBundle(inputAmountWithSlippage)
  const flowType = _getFlowType(isSafeBundle, isEoaEthFlow, isSafeEthFlow)

  return {
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
    swapConfirmManager,
    flowType,
    closeModals,
    addOrderCallback,
    dispatch,
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
    swapConfirmManager,
    closeModals,
    addOrderCallback,
    dispatch,
    flowType,
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

  const isBuyEth = ETHER.onChain(chainId).equals(trade.outputAmount.currency)
  const isGnosisSafeWallet = !!gnosisSafeInfo

  const buyToken = isBuyEth ? NATIVE_CURRENCY_BUY_TOKEN[chainId] : trade.outputAmount.currency.wrapped
  const marketLabel = [sellToken?.symbol, buyToken.symbol].join(',')

  if (!sellToken || !buyToken) {
    return null
  }

  const swapFlowAnalyticsContext: SwapFlowAnalyticsContext = {
    account,
    recipient,
    recipientAddress: recipientAddressOrName,
    marketLabel,
    orderClass: OrderClass.MARKET,
  }

  const validTo = calculateValidTo(deadline)

  const orderParams: PostOrderParams = {
    class: OrderClass.MARKET,
    kind,
    account,
    chainId,
    // unadjusted inputAmount
    inputAmount: _computeInputAmountForSignature({
      input: trade.inputAmountWithFee,
      inputWithSlippage: inputAmountWithSlippage,
      fee: trade.fee.feeAsCurrency,
      kind,
    }),
    outputAmount: outputAmountWithSlippage,
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
      isGnosisSafeWallet,
    },
    callbacks: {
      closeModals,
      addOrderCallback,
    },
    dispatch,
    swapFlowAnalyticsContext,
    swapConfirmManager,
    orderParams,
    appDataInfo: appData,
  }
}
