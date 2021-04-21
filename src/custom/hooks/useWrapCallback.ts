import { TransactionResponse } from '@ethersproject/providers'
import { getChainCurrencySymbols } from '@src/custom/utils/xdai/hack'
import { Currency, CurrencyAmount, currencyEquals, ETHER, WETH } from '@uniswap/sdk'
import { Contract } from 'ethers'
import { useMemo } from 'react'
import { tryParseAmount } from 'state/swap/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { useActiveWeb3React } from 'hooks/index'
import { useWETHContract } from 'hooks/useContract'
import { RADIX_HEX } from 'constants/index'

export enum WrapType {
  NOT_APPLICABLE,
  WRAP,
  UNWRAP
}

interface WrapUnwrapCallback {
  wrapType: WrapType
  execute?: () => Promise<TransactionResponse>
  inputError?: string
}

type TransactionAdder = ReturnType<typeof useTransactionAdder>

interface GetWrapUnwrapCallback {
  isWrap: boolean
  balance?: CurrencyAmount
  inputAmount?: CurrencyAmount
  addTransaction: TransactionAdder
  wethContract: Contract
}

const NOT_APPLICABLE = { wrapType: WrapType.NOT_APPLICABLE }

function _getWrapUnwrapCallback(params: GetWrapUnwrapCallback): WrapUnwrapCallback {
  const { native, wrapped } = getChainCurrencySymbols()
  const { isWrap, balance, inputAmount, addTransaction, wethContract } = params
  const symbol = isWrap ? native : wrapped

  // Check if user has enough balance for wrap/unwrap
  const sufficientBalance = !!(inputAmount && balance && !balance.lessThan(inputAmount))
  const isZero = balance && !inputAmount

  const inputError = isZero ? `Enter an amount` : !sufficientBalance ? `Insufficient ${symbol} balance` : undefined

  // Create wrap/unwrap callback if sufficient balance
  let wrapUnwrapCallback: (() => Promise<TransactionResponse>) | undefined
  if (sufficientBalance && inputAmount) {
    let wrapUnwrap: () => TransactionResponse
    let summary: string

    if (isWrap) {
      wrapUnwrap = () => wethContract.deposit({ value: `0x${inputAmount.raw.toString(RADIX_HEX)}` })
      summary = `Wrap ${inputAmount.toSignificant(6)} ${native} to ${wrapped}`
    } else {
      wrapUnwrap = () => wethContract.withdraw(`0x${inputAmount.raw.toString(RADIX_HEX)}`)
      summary = `Unwrap ${inputAmount.toSignificant(6)} ${wrapped} to ${native}`
    }

    wrapUnwrapCallback = async () => {
      try {
        const txReceipt = await wrapUnwrap()
        addTransaction(txReceipt, { summary })

        return txReceipt
      } catch (error) {
        const actionName = WrapType.WRAP ? 'wrapping' : 'unwrapping'
        console.error(`Error ${actionName} ${symbol}`, error)

        throw error.message ? error : new Error(error)
      }
    }
  }

  return {
    wrapType: isWrap ? WrapType.WRAP : WrapType.UNWRAP,
    execute: wrapUnwrapCallback,
    inputError
  }
}

/**
 * Given the selected input and output currency, return a wrap callback
 * @param inputCurrency the selected input currency
 * @param outputCurrency the selected output currency
 * @param typedValue the user input value
 */
export default function useWrapCallback(
  inputCurrency: Currency | undefined,
  outputCurrency: Currency | undefined,
  typedValue: string | undefined,
  isEthTradeOverride?: boolean
): WrapUnwrapCallback {
  const { chainId, account } = useActiveWeb3React()
  const wethContract = useWETHContract()
  const balance = useCurrencyBalance(account ?? undefined, inputCurrency)
  // we can always parse the amount typed as the input currency, since wrapping is 1:1
  const inputAmount = useMemo(() => tryParseAmount(typedValue, inputCurrency), [inputCurrency, typedValue])
  const addTransaction = useTransactionAdder()

  return useMemo(() => {
    if (!wethContract || !chainId || !inputCurrency || !outputCurrency) return NOT_APPLICABLE

    const isWrappingEther =
      inputCurrency === ETHER && (isEthTradeOverride || currencyEquals(WETH[chainId], outputCurrency))
    const isUnwrappingWeth = currencyEquals(WETH[chainId], inputCurrency) && outputCurrency === ETHER

    if (!isWrappingEther && !isUnwrappingWeth) {
      return NOT_APPLICABLE
    } else {
      return _getWrapUnwrapCallback({
        isWrap: isWrappingEther,
        balance,
        inputAmount,
        addTransaction,
        wethContract
      })
    }
  }, [wethContract, chainId, inputCurrency, outputCurrency, isEthTradeOverride, balance, inputAmount, addTransaction])
}
