import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { useMemo } from 'react'
import { TransactionResponse } from '@ethersproject/providers'
import { getChainCurrencySymbols } from 'utils/xdai/hack'
import { Contract } from 'ethers'
import { useTransactionAdder } from 'state/enhancedTransactions/hooks'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { useActiveWeb3React } from 'hooks/web3'
import { useWETHContract } from 'hooks/useContract'
import { AMOUNT_PRECISION, RADIX_HEX } from 'constants/index'
import { WETH9_EXTENDED } from 'constants/tokens'
import { t } from '@lingui/macro'
import { SupportedChainId as ChainId } from 'constants/chains'
import { supportedChainId } from 'utils/supportedChainId'
import { formatSmart } from 'utils/format'
import { HashType } from 'state/enhancedTransactions/reducer'

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
  addTransaction: TransactionAdder
  wethContract: Contract
  openTransactionConfirmationModal: (message: string) => void
  closeModals: () => void
}

const NOT_APPLICABLE = { wrapType: WrapType.NOT_APPLICABLE }

function _getWrapUnwrapCallback(params: GetWrapUnwrapCallback): WrapUnwrapCallback {
  const {
    chainId,
    isWrap,
    balance,
    inputAmount,
    addTransaction,
    wethContract,
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
    let wrapUnwrap: () => TransactionResponse
    let summary: string
    let confirmationMessage: string

    if (isWrap) {
      wrapUnwrap = () => wethContract.deposit({ value: `0x${inputAmount.quotient.toString(RADIX_HEX)}` })
      const baseSummary = t`Wrap ${formatSmart(inputAmount, AMOUNT_PRECISION)} ${native} to ${wrapped}`
      summary = t`Wrap ${baseSummary}`
      confirmationMessage = t`Wrapping ${baseSummary}`
    } else {
      wrapUnwrap = () => wethContract.withdraw(`0x${inputAmount.quotient.toString(RADIX_HEX)}`)
      const baseSummary = t`${formatSmart(inputAmount, AMOUNT_PRECISION)} ${wrapped} to ${native}`
      summary = t`Unwrap ${baseSummary}`
      confirmationMessage = t`Unwrapping ${baseSummary}`
    }

    wrapUnwrapCallback = async () => {
      try {
        openTransactionConfirmationModal(confirmationMessage)
        const txReceipt = await wrapUnwrap()
        addTransaction({
          hash: txReceipt.hash,
          hashType: HashType.ETHEREUM_TX,
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

/**
 * Given the selected input and output currency, return a wrap callback
 * @param inputCurrency the selected input currency
 * @param outputCurrency the selected output currency
 * @param typedValue the user input value
 */
export default function useWrapCallback(
  openTransactionConfirmationModal: (message: string) => void,
  closeModals: () => void,
  inputCurrency?: Currency,
  outputCurrency?: Currency,
  inputAmount?: CurrencyAmount<Currency>,
  isEthTradeOverride?: boolean
): WrapUnwrapCallback {
  const { chainId: connectedChainId, account } = useActiveWeb3React()
  const chainId = supportedChainId(connectedChainId)
  const wethContract = useWETHContract()
  const balance = useCurrencyBalance(account ?? undefined, inputCurrency)
  // we can always parse the amount typed as the input currency, since wrapping is 1:1
  const addTransaction = useTransactionAdder()

  return useMemo(() => {
    if (!wethContract || !chainId || !inputCurrency || !outputCurrency) return NOT_APPLICABLE
    const weth = WETH9_EXTENDED[chainId]
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
    addTransaction,
    openTransactionConfirmationModal,
    closeModals,
  ])
}
