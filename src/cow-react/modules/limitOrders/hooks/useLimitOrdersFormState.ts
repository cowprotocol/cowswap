import { useWeb3React } from '@web3-react/core'
import { useTokenAllowance } from 'hooks/useTokenAllowance'
import { LimitOrdersTradeState, useLimitOrdersTradeState } from './useLimitOrdersTradeState'
import { useSafeMemo } from '@cow/common/hooks/useSafeMemo'
import { GP_VAULT_RELAYER } from 'constants/index'
import { ApprovalState } from 'hooks/useApproveCallback'
import { useTradeApproveState } from '@cow/common/containers/TradeApprove/useTradeApproveState'
import { useGnosisSafeInfo } from 'hooks/useGnosisSafeInfo'
import { useIsSwapUnsupported } from 'hooks/useIsSwapUnsupported'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import useENSAddress from '@src/hooks/useENSAddress'
import { isAddress } from '@src/utils'
import { useAtomValue } from 'jotai/utils'
import { limitOrdersQuoteAtom, LimitOrdersQuoteState } from '@cow/modules/limitOrders/state/limitOrdersQuoteAtom'

export enum LimitOrdersFormState {
  NotApproved = 'NotApproved',
  CanTrade = 'CanTrade',
  Loading = 'Loading',
  // SwapIsUnsupported = 'SwapIsUnsupported',
  InvalidRecipient = 'InvalidRecipient',
  WalletIsUnsupported = 'WalletIsUnsupported',
  WalletIsNotConnected = 'WalletIsNotConnected',
  ReadonlyGnosisSafeUser = 'ReadonlyGnosisSafeUser',
  NeedToSelectToken = 'NeedToSelectToken',
  AmountIsNotSet = 'AmountIsNotSet',
  InsufficientBalance = 'InsufficientBalance',
  CantLoadBalances = 'CantLoadBalances',
  QuoteError = 'QuoteError',
}

interface LimitOrdersFormParams {
  account: string | undefined
  isSwapSupported: boolean
  isSupportedWallet: boolean
  isReadonlyGnosisSafeUser: boolean
  currentAllowance: CurrencyAmount<Token> | undefined
  approvalState: ApprovalState
  tradeState: LimitOrdersTradeState
  recipientEnsAddress: string | null
  quote: LimitOrdersQuoteState | null
}

function getLimitOrdersFormState(params: LimitOrdersFormParams): LimitOrdersFormState {
  const {
    account,
    isReadonlyGnosisSafeUser,
    isSupportedWallet,
    currentAllowance,
    approvalState,
    tradeState,
    recipientEnsAddress,
    quote,
  } = params

  const { inputCurrency, outputCurrency, inputCurrencyAmount, outputCurrencyAmount, inputCurrencyBalance, recipient } =
    tradeState

  if (!account) {
    return LimitOrdersFormState.WalletIsNotConnected
  }

  if (!inputCurrency || !outputCurrency) {
    return LimitOrdersFormState.NeedToSelectToken
  }

  // TODO: Do we need the check in Limit orders?
  // if (!isSwapSupported) {
  //   return LimitOrdersFormState.SwapIsUnsupported
  // }

  if (recipient !== null && !recipientEnsAddress && !isAddress(recipient)) {
    return LimitOrdersFormState.InvalidRecipient
  }

  if (!isSupportedWallet) {
    return LimitOrdersFormState.WalletIsUnsupported
  }

  if (isReadonlyGnosisSafeUser) {
    return LimitOrdersFormState.ReadonlyGnosisSafeUser
  }

  if (
    !inputCurrencyAmount ||
    inputCurrencyAmount.toExact() === '0' ||
    !outputCurrencyAmount ||
    outputCurrencyAmount.toExact() === '0'
  ) {
    return LimitOrdersFormState.AmountIsNotSet
  }

  if (!inputCurrencyBalance) {
    return LimitOrdersFormState.CantLoadBalances
  }

  if (inputCurrencyBalance.lessThan(inputCurrencyAmount)) {
    return LimitOrdersFormState.InsufficientBalance
  }

  if (!currentAllowance || !quote) {
    return LimitOrdersFormState.Loading
  }

  if (approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING) {
    return LimitOrdersFormState.NotApproved
  }

  if (quote.error) {
    return LimitOrdersFormState.QuoteError
  }

  return LimitOrdersFormState.CanTrade
}

export function useLimitOrdersFormState(): LimitOrdersFormState {
  const { chainId, account } = useWeb3React()
  const tradeState = useLimitOrdersTradeState()
  const { isSupportedWallet } = useWalletInfo()
  const isReadonlyGnosisSafeUser = useGnosisSafeInfo()?.isReadOnly || false
  const quote = useAtomValue(limitOrdersQuoteAtom)

  const { inputCurrency, outputCurrency, recipient } = tradeState
  const sellAmount = tradeState.inputCurrencyAmount
  const sellToken = inputCurrency?.isToken ? inputCurrency : undefined
  const spender = chainId ? GP_VAULT_RELAYER[chainId] : undefined

  const currentAllowance = useTokenAllowance(sellToken, account ?? undefined, spender)
  const approvalState = useTradeApproveState(sellAmount)
  const isSwapSupported = useIsSwapUnsupported(inputCurrency, outputCurrency)
  const { address: recipientEnsAddress } = useENSAddress(recipient)

  const params: LimitOrdersFormParams = {
    account,
    isReadonlyGnosisSafeUser,
    isSwapSupported,
    isSupportedWallet,
    approvalState,
    currentAllowance,
    tradeState,
    recipientEnsAddress,
    quote,
  }

  return useSafeMemo(() => {
    return getLimitOrdersFormState(params)
  }, Object.values(params))
}
