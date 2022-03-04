// eslint-disable-next-line no-restricted-imports
import { t } from '@lingui/macro'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
// import useActiveWeb3React from 'hooks/useActiveWeb3React'
// import useNativeCurrency from 'lib/hooks/useNativeCurrency'
// import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { useMemo } from 'react'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
// import { TransactionType } from '../state/transactions/actions'
import { useTransactionAdder } from 'state/enhancedTransactions/hooks'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { useWETHContract } from 'hooks/useContract'

// MOD imports
import { BigNumber } from '@ethersproject/bignumber'
import { TransactionResponse } from '@ethersproject/providers'
import { Contract } from '@ethersproject/contracts'
import { getChainCurrencySymbols } from 'utils/xdai/hack'
import { AMOUNT_PRECISION, RADIX_HEX } from 'constants/index'
import { SupportedChainId as ChainId } from 'constants/chains'
import { supportedChainId } from 'utils/supportedChainId'
import { formatSmart } from 'utils/format'
import { useWalletInfo } from './useWalletInfo'
import { SafeInfoResponse } from '@gnosis.pm/safe-service-client'
import { OperationType } from '../components/TransactionConfirmationModal'
import { calculateGasMargin } from '@src/utils/calculateGasMargin'

// Use a 180K gas as a fallback if there's issue calculating the gas estimation (fixes some issues with some nodes failing to calculate gas costs for SC wallets)
const WRAP_UNWRAP_GAS_LIMIT_DEFAULT = BigNumber.from('180000')

export enum WrapType {
  NOT_APPLICABLE,
  WRAP,
  UNWRAP,
}

interface WrapUnwrapCallback {
  wrapType: WrapType
  execute?: () => Promise<TransactionResponse>
  inputError?: string
}

type TransactionAdder = ReturnType<typeof useTransactionAdder>

interface GetWrapUnwrapCallback {
  chainId?: ChainId
  isWrap: boolean
  balance?: CurrencyAmount<Currency>
  inputAmount?: CurrencyAmount<Currency>
  wethContract: Contract
  gnosisSafeInfo: SafeInfoResponse | undefined
  addTransaction: TransactionAdder
  openTransactionConfirmationModal: (message: string, operationType: OperationType) => void
  closeModals: () => void
}

const NOT_APPLICABLE = { wrapType: WrapType.NOT_APPLICABLE }

/* enum WrapInputError {
  NO_ERROR, // must be equal to 0 so all other errors are truthy
  ENTER_NATIVE_AMOUNT,
  ENTER_WRAPPED_AMOUNT,
  INSUFFICIENT_NATIVE_BALANCE,
  INSUFFICIENT_WRAPPED_BALANCE,
} */

function _handleGasEstimateError(error: any) {
  console.log(
    '[useWrapCallback] Error estimating gas for wrap/unwrap. Using default gas limit ' +
      WRAP_UNWRAP_GAS_LIMIT_DEFAULT.toString(),
    error
  )
  return WRAP_UNWRAP_GAS_LIMIT_DEFAULT
}

function _getWrapUnwrapCallback(params: GetWrapUnwrapCallback): WrapUnwrapCallback {
  const {
    chainId,
    isWrap,
    balance,
    inputAmount,
    wethContract,
    addTransaction,
    openTransactionConfirmationModal,
    closeModals,
  } = params
  const { native, wrapped } = getChainCurrencySymbols(chainId)
  const symbol = isWrap ? native : wrapped

  // Check if user has enough balance for wrap/unwrap
  const sufficientBalance = !!(inputAmount && balance && !balance.lessThan(inputAmount))
  const isZero = balance && !inputAmount

  const inputError = isZero ? t`Enter an amount` : !sufficientBalance ? t`Insufficient ${symbol} balance` : undefined

  // Create wrap/unwrap callback if sufficient balance
  let wrapUnwrapCallback: (() => Promise<TransactionResponse>) | undefined
  if (sufficientBalance && inputAmount) {
    let wrapUnwrap: () => Promise<TransactionResponse>
    let summary: string
    let confirmationMessage: string
    let operationType: OperationType

    if (!chainId) {
      throw new Error('ChainId is unknown')
    }

    const amountHex = `0x${inputAmount.quotient.toString(RADIX_HEX)}`
    if (isWrap) {
      operationType = OperationType.WRAP_ETHER
      wrapUnwrap = async () => {
        const estimatedGas = await wethContract.estimateGas.deposit({ value: amountHex }).catch(_handleGasEstimateError)
        const gasLimit = calculateGasMargin(estimatedGas)

        return wethContract.deposit({ value: amountHex, gasLimit })
      }
      const baseSummary = t`${formatSmart(inputAmount, AMOUNT_PRECISION)} ${native} to ${wrapped}`
      summary = t`Wrap ${baseSummary}`
      confirmationMessage = t`Wrapping ${baseSummary}`
    } else {
      operationType = OperationType.UNWRAP_WETH
      wrapUnwrap = async () => {
        const estimatedGas = await wethContract.estimateGas.withdraw(amountHex).catch(_handleGasEstimateError)
        const gasLimit = calculateGasMargin(estimatedGas)
        return wethContract.withdraw(amountHex, { gasLimit })
      }
      const baseSummary = t`${formatSmart(inputAmount, AMOUNT_PRECISION)} ${wrapped} to ${native}`
      summary = t`Unwrap ${baseSummary}`
      confirmationMessage = t`Unwrapping ${baseSummary}`
    }

    wrapUnwrapCallback = async () => {
      try {
        openTransactionConfirmationModal(confirmationMessage, operationType)
        const txReceipt = await wrapUnwrap()
        addTransaction({
          hash: txReceipt.hash,
          summary,
        })
        closeModals()

        return txReceipt
      } catch (error) {
        closeModals()
        const actionName = WrapType.WRAP ? 'wrapping' : 'unwrapping'
        console.error(t`Error ${actionName} ${symbol}`, error)

        throw error.message ? error : new Error(error)
      }
    }
  }

  return {
    wrapType: isWrap ? WrapType.WRAP : WrapType.UNWRAP,
    execute: wrapUnwrapCallback,
    inputError,
  }
}

/* export function WrapErrorText({ wrapInputError }: { wrapInputError: WrapInputError }) {
  const native = useNativeCurrency()
  const wrapped = native?.wrapped

  switch (wrapInputError) {
    case WrapInputError.NO_ERROR:
      return null
    case WrapInputError.ENTER_NATIVE_AMOUNT:
      return <Trans>Enter {native?.symbol} amount</Trans>
    case WrapInputError.ENTER_WRAPPED_AMOUNT:
      return <Trans>Enter {wrapped?.symbol} amount</Trans>

    case WrapInputError.INSUFFICIENT_NATIVE_BALANCE:
      return <Trans>Insufficient {native?.symbol} balance</Trans>
    case WrapInputError.INSUFFICIENT_WRAPPED_BALANCE:
      return <Trans>Insufficient {wrapped?.symbol} balance</Trans>
  }
} */

/**
 * Given the selected input and output currency, return a wrap callback
 * @param inputCurrency the selected input currency
 * @param outputCurrency the selected output currency
 * @param typedValue the user input value
 */
export default function useWrapCallback(
  openTransactionConfirmationModal: (message: string, operationType: OperationType) => void,
  closeModals: () => void,
  inputCurrency?: Currency | null,
  outputCurrency?: Currency | null,
  inputAmount?: CurrencyAmount<Currency>,
  isEthTradeOverride?: boolean
): WrapUnwrapCallback {
  const { chainId: connectedChainId, account, gnosisSafeInfo } = useWalletInfo()
  const chainId = supportedChainId(connectedChainId)
  const wethContract = useWETHContract()
  const balance = useCurrencyBalance(account ?? undefined, inputCurrency)
  // we can always parse the amount typed as the input currency, since wrapping is 1:1
  /* const inputAmount = useMemo(
    () => tryParseCurrencyAmount(typedValue, inputCurrency ?? undefined),
    [inputCurrency, typedValue]
  ) */
  const addTransaction = useTransactionAdder()

  return useMemo(() => {
    if (!wethContract || !chainId || !inputCurrency || !outputCurrency) return NOT_APPLICABLE
    const weth = WRAPPED_NATIVE_CURRENCY[chainId]
    if (!weth) return NOT_APPLICABLE

    const isWrappingEther = inputCurrency.isNative && (isEthTradeOverride || weth.equals(outputCurrency))
    const isUnwrappingWeth = weth.equals(inputCurrency) && outputCurrency.isNative

    if (!isWrappingEther && !isUnwrappingWeth) {
      return NOT_APPLICABLE
    } else {
      return _getWrapUnwrapCallback({
        chainId,
        isWrap: isWrappingEther,
        balance,
        inputAmount,
        addTransaction,
        wethContract,
        gnosisSafeInfo,
        openTransactionConfirmationModal,
        closeModals,
      })
    }
  }, [
    wethContract,
    chainId,
    inputCurrency,
    outputCurrency,
    isEthTradeOverride,
    balance,
    inputAmount,
    gnosisSafeInfo,
    addTransaction,
    openTransactionConfirmationModal,
    closeModals,
  ])
}
