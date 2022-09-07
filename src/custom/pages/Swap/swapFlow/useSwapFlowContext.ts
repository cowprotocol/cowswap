import { SwapFlowContext } from 'pages/Swap/swapFlow/types'
import { useWeb3React } from '@web3-react/core'
import { useSwapState } from 'state/swap/hooks'
import { useDerivedSwapInfo } from 'state/swap/hooks'
import usePriceImpact from 'hooks/usePriceImpact'
import { useWrapType, WrapType } from 'hooks/useWrapCallback'
import { GpEther as ETHER } from 'constants/tokens'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { useCloseModals } from 'state/application/hooks'
import { useAddPendingOrder } from 'state/orders/hooks'
import { useAppData } from 'hooks/useAppData'
import { useDispatch } from 'react-redux'
import { AppDispatch } from 'state'
import { SwapFlowAnalyticsContext } from 'pages/Swap/swapFlow/steps/analytics'
import useENSAddress from 'hooks/useENSAddress'
import { useSwapConfirmManager } from 'pages/Swap/hooks/useSwapConfirmManager'
import { useWETHContract } from 'hooks/useContract'
import { computeSlippageAdjustedAmounts } from 'utils/prices'
import { PostOrderParams } from 'utils/trade'
import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import { OrderKind } from '@cowprotocol/contracts'
import { NATIVE_CURRENCY_BUY_TOKEN } from 'constants/index'
import { MAX_VALID_TO_EPOCH } from 'hooks/useSwapCallback'
import { useUserTransactionTTL } from 'state/user/hooks'
import { useGP2SettlementContract } from 'hooks/useContract'
import { useUpdateAtom } from 'jotai/utils'
import { addAppDataToUploadQueueAtom } from 'state/appData/atoms'
import { useSwapCurrenciesAmounts } from 'pages/NewSwap/hooks/useSwapCurrenciesAmounts'

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

export function useSwapFlowContext(): SwapFlowContext | null {
  const { account, chainId, provider } = useWeb3React()
  const { recipient } = useSwapState()
  const { v2Trade, allowedSlippage } = useDerivedSwapInfo()
  const { allowsOffchainSigning, gnosisSafeInfo } = useWalletInfo()
  const settlementContract = useGP2SettlementContract()

  const closeModals = useCloseModals()
  const addOrderCallback = useAddPendingOrder()
  const appData = useAppData({ chainId, allowedSlippage })
  const addAppDataToUploadQueue = useUpdateAtom(addAppDataToUploadQueueAtom)
  const dispatch = useDispatch<AppDispatch>()

  const { address: recipientAddress } = useENSAddress(recipient)
  const [deadline] = useUserTransactionTTL()
  const wethContract = useWETHContract()
  const swapConfirmManager = useSwapConfirmManager()
  const wrapType = useWrapType()
  const isWrapUnwrap = wrapType !== WrapType.NOT_APPLICABLE

  const { INPUT: inputAmountWithSlippage, OUTPUT: outputAmountWithSlippage } = computeSlippageAdjustedAmounts(
    v2Trade,
    allowedSlippage
  )

  const parsedAmounts = useSwapCurrenciesAmounts(wrapType)
  const priceImpactParams = usePriceImpact({
    abTrade: v2Trade,
    parsedAmounts,
    isWrapping: isWrapUnwrap,
  })

  if (
    !chainId ||
    !account ||
    !provider ||
    !v2Trade ||
    !appData ||
    !wethContract ||
    !settlementContract ||
    !inputAmountWithSlippage ||
    !outputAmountWithSlippage
  ) {
    return null
  }

  const isBuyEth = ETHER.onChain(chainId).equals(v2Trade.outputAmount.currency)
  const isGnosisSafeWallet = !!gnosisSafeInfo

  const sellToken = v2Trade.inputAmount.currency.wrapped
  const buyToken = isBuyEth ? NATIVE_CURRENCY_BUY_TOKEN[chainId] : v2Trade.outputAmount.currency.wrapped

  // TODO: mismatch with the original code related to wrap native token
  if (!sellToken || !buyToken) {
    return null
  }

  const swapFlowAnalyticsContext: SwapFlowAnalyticsContext = {
    account,
    recipient,
    recipientAddress,
    trade: v2Trade,
  }

  const validTo = calculateValidTo(deadline)
  const kind = v2Trade.tradeType === TradeType.EXACT_INPUT ? OrderKind.SELL : OrderKind.BUY

  const postOrderParams: PostOrderParams = {
    kind,
    account,
    chainId,
    // unadjusted inputAmount
    inputAmount: _computeInputAmountForSignature({
      input: v2Trade.inputAmountWithFee,
      inputWithSlippage: inputAmountWithSlippage,
      fee: v2Trade.fee.feeAsCurrency,
      kind,
    }),
    outputAmount: outputAmountWithSlippage,
    sellAmountBeforeFee: v2Trade.inputAmountWithoutFee,
    feeAmount: v2Trade.fee.feeAsCurrency,
    sellToken,
    buyToken,
    validTo,
    // TODO: add validation from original code
    recipient: recipient === null ? account : recipientAddress || '',
    recipientAddressOrName: recipientAddress || null,
    signer: provider.getSigner(),
    allowsOffchainSigning,
    appDataHash: appData.hash,
    quoteId: v2Trade.quoteId,
  }

  return {
    context: {
      chainId,
      trade: v2Trade,
      priceImpact: priceImpactParams.priceImpact,
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
    postOrderParams,
    settlementContract,
    appDataInfo: appData,
  }
}
