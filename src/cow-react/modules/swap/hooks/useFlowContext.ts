import { useWeb3React } from '@web3-react/core'
import { useSwapState } from 'state/swap/hooks'
import { useDerivedSwapInfo } from 'state/swap/hooks'
import { GpEther as ETHER } from 'constants/tokens'
import { useGnosisSafeInfo, useWalletDetails, useWalletInfo } from '@cow/modules/wallet'
import { useCloseModals } from 'state/application/hooks'
import { AddOrderCallback, useAddPendingOrder } from 'state/orders/hooks'
import { useDispatch } from 'react-redux'
import { AppDispatch } from 'state'
import { SwapFlowAnalyticsContext } from '@cow/modules/trade/utils/analytics'
import useENSAddress from 'hooks/useENSAddress'
import { SwapConfirmManager, useSwapConfirmManager } from '@cow/modules/swap/hooks/useSwapConfirmManager'
import { useWETHContract } from 'hooks/useContract'
import { computeSlippageAdjustedAmounts } from 'utils/prices'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { NATIVE_CURRENCY_BUY_TOKEN } from 'constants/index'
import { useUserTransactionTTL } from 'state/user/hooks'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { addAppDataToUploadQueueAtom, appDataInfoAtom } from 'state/appData/atoms'
import { useIsEthFlow } from '@cow/modules/swap/hooks/useIsEthFlow'
import { Weth } from '@cow/abis/types'
import TradeGp from 'state/swap/TradeGp'
import { AddAppDataToUploadQueueParams, AppDataInfo } from 'state/appData/types'
import { SafeInfoResponse } from '@safe-global/api-kit'
import { Web3Provider } from '@ethersproject/providers'
import { BaseFlowContext } from '@cow/modules/swap/services/types'
import { calculateValidTo } from '@cow/utils/time'
import { PostOrderParams } from 'utils/trade'
import { OrderClass } from '@cowprotocol/cow-sdk'

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
  isEthFlow: any
  closeModals: () => void
  addAppDataToUploadQueue: (update: AddAppDataToUploadQueueParams) => void
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

  const appData = useAtomValue(appDataInfoAtom)
  const closeModals = useCloseModals()
  const addAppDataToUploadQueue = useUpdateAtom(addAppDataToUploadQueueAtom)
  const addOrderCallback = useAddPendingOrder()
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
    addOrderCallback,
    dispatch,
  }
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
    addAppDataToUploadQueue,
    addOrderCallback,
    dispatch,
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
    appDataInfo: appData,
  }
}
