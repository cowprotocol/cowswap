import { EthFlowContext, SwapFlowContext } from '@cow/modules/swap/services/swapFlow/types'
import { useWeb3React } from '@web3-react/core'
import { useSwapState } from 'state/swap/hooks'
import { useDerivedSwapInfo } from 'state/swap/hooks'
import { GpEther as ETHER } from 'constants/tokens'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { useCloseModals } from 'state/application/hooks'
import {
  AddOrderCallback,
  AddUnserialisedPendingEthFlowOrderParams,
  AddUnserialisedPendingOrderParams,
  useAddPendingOrder,
} from 'state/orders/hooks'
import { useAppData } from 'hooks/useAppData'
import { useDispatch } from 'react-redux'
import { AppDispatch } from 'state'
import { SwapFlowAnalyticsContext } from '@cow/modules/swap/services/swapFlow/steps/analytics'
import useENSAddress from 'hooks/useENSAddress'
import { SwapConfirmManager, useSwapConfirmManager } from '@cow/modules/swap/hooks/useSwapConfirmManager'
import { useEthFlowContract, useWETHContract } from 'hooks/useContract'
import { computeSlippageAdjustedAmounts } from 'utils/prices'
import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import { OrderKind } from '@cowprotocol/contracts'
import { NATIVE_CURRENCY_BUY_TOKEN } from 'constants/index'
import { MAX_VALID_TO_EPOCH } from 'hooks/useSwapCallback'
import { useUserTransactionTTL } from 'state/user/hooks'
import { useGP2SettlementContract } from 'hooks/useContract'
import { useUpdateAtom } from 'jotai/utils'
import { addAppDataToUploadQueueAtom } from 'state/appData/atoms'
import { useIsEthFlow } from '@cow/modules/swap/hooks/useIsEthFlow'
import { CoWSwapEthFlow } from '@cow/abis/types/ethflow'
import { GPv2Settlement, Weth } from '@cow/abis/types'
import TradeGp from 'state/swap/TradeGp'
import { AddAppDataToUploadQueueParams, AppDataInfo } from 'state/appData/types'
import { SafeInfoResponse } from '@gnosis.pm/safe-service-client'
import { Web3Provider } from '@ethersproject/providers'

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

function calculateValidTo(deadline: number): number {
  // Need the timestamp in seconds
  const now = Date.now() / 1000
  // Must be an integer
  const validTo = Math.floor(deadline + now)
  // Should not be greater than what the contract supports
  return Math.min(validTo, MAX_VALID_TO_EPOCH)
}

interface BaseFlowContext {
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
  isEthFlow: any
  closeModals: () => void
  addAppDataToUploadQueue: (update: AddAppDataToUploadQueueParams) => void
  dispatch: AppDispatch
}

function useBaseFlowContext(): BaseFlowContext {
  const { account, chainId, provider } = useWeb3React()
  const { recipient } = useSwapState()
  const { v2Trade: trade, allowedSlippage } = useDerivedSwapInfo()
  const { allowsOffchainSigning, gnosisSafeInfo } = useWalletInfo()

  const appData = useAppData({ chainId, allowedSlippage })
  const closeModals = useCloseModals()
  const addAppDataToUploadQueue = useUpdateAtom(addAppDataToUploadQueueAtom)
  const dispatch = useDispatch<AppDispatch>()

  const { address: ensRecipientAddress } = useENSAddress(recipient)
  const recipientAddressOrName = recipient || ensRecipientAddress
  const [deadline] = useUserTransactionTTL()
  const wethContract = useWETHContract()
  const swapConfirmManager = useSwapConfirmManager()
  const isEthFlow = useIsEthFlow()

  const { INPUT: inputAmountWithSlippage, OUTPUT: outputAmountWithSlippage } = computeSlippageAdjustedAmounts(
    trade,
    allowedSlippage
  )

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
    isEthFlow,
    closeModals,
    addAppDataToUploadQueue,
    dispatch,
  }
}

type BaseGetFlowContextProps = {
  baseProps: BaseFlowContext
  conditionalCheck: boolean
  sellToken: Currency
  kind: OrderKind
}

interface GetCommonFlowContextProps extends BaseGetFlowContextProps {
  contract: any
  addOrderCallback: any
}

interface GetSwapFlowContextProps extends BaseGetFlowContextProps {
  contract: GPv2Settlement | null
  addOrderCallback: AddOrderCallback<AddUnserialisedPendingOrderParams>
}

interface GetEthFlowContextProps extends BaseGetFlowContextProps {
  contract: CoWSwapEthFlow | null
  addOrderCallback: AddOrderCallback<AddUnserialisedPendingEthFlowOrderParams>
}

function getFlowContext({
  baseProps,
  conditionalCheck,
  sellToken,
  kind,
  contract,
  addOrderCallback,
}: GetSwapFlowContextProps): SwapFlowContext
function getFlowContext({
  baseProps,
  conditionalCheck,
  sellToken,
  kind,
  contract,
  addOrderCallback,
}: GetEthFlowContextProps): EthFlowContext
function getFlowContext({
  baseProps,
  conditionalCheck,
  sellToken,
  kind,
  contract,
  addOrderCallback,
}: GetCommonFlowContextProps): any {
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
    addAppDataToUploadQueue,
    dispatch,
  } = baseProps

  if (
    conditionalCheck ||
    !contract ||
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

  if (!sellToken || !buyToken) {
    return null
  }

  const swapFlowAnalyticsContext: SwapFlowAnalyticsContext = {
    account,
    recipient,
    recipientAddress: recipientAddressOrName,
    trade,
  }

  const validTo = calculateValidTo(deadline)

  const orderParams = {
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
    appDataHash: appData.hash,
    quoteId: trade.quoteId,
  }

  return {
    context: {
      chainId,
      trade,
      inputAmountWithSlippage,
      outputAmountWithSlippage,
    },
    flags: {
      allowsOffchainSigning,
      isGnosisSafeWallet,
    },
    callbacks: {
      closeModals,
      addOrderCallback,
      addAppDataToUploadQueue,
    },
    dispatch,
    swapFlowAnalyticsContext,
    swapConfirmManager,
    orderParams,
    contract,
    appDataInfo: appData,
  }
}

export function useSwapFlowContext(): SwapFlowContext | null {
  const contract = useGP2SettlementContract()
  const addOrderCallback = useAddPendingOrder()

  const baseProps = useBaseFlowContext()

  if (!baseProps.trade) return null

  return getFlowContext({
    baseProps,
    conditionalCheck: baseProps.isEthFlow,
    addOrderCallback,
    contract,
    sellToken: baseProps.trade.inputAmount.currency.wrapped,
    kind: baseProps.trade.tradeType === TradeType.EXACT_INPUT ? OrderKind.SELL : OrderKind.BUY,
  })
}

export function useEthFlowContext(): EthFlowContext | null {
  const contract = useEthFlowContract()
  const addOrderCallback = useAddPendingOrder<AddUnserialisedPendingEthFlowOrderParams>()

  const baseProps = useBaseFlowContext()

  if (!baseProps.trade) return null

  return getFlowContext({
    baseProps,
    conditionalCheck: !baseProps.isEthFlow,
    addOrderCallback,
    contract,
    sellToken: baseProps.trade.inputAmount.currency,
    kind: OrderKind.SELL,
  })
}
