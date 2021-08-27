import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { useMemo } from 'react'
import { TransactionResponse } from '@ethersproject/providers'
import { getChainCurrencySymbols } from 'utils/xdai/hack'
import { Contract, Overrides } from 'ethers'
import { useTransactionAdder } from 'state/transactions/hooks'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { useActiveWeb3React } from 'hooks/web3'
import { useWETHContract } from 'hooks/useContract'
import { RADIX_HEX } from 'constants/index'
import { WETH9_EXTENDED } from 'constants/tokens'
import { t } from '@lingui/macro'
import { SupportedChainId as ChainId } from 'constants/chains'
import { supportedChainId } from 'utils/supportedChainId'
import { formatSmart } from 'utils/format'
import { applyCustomGasPrice } from 'custom/utils/gas'

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
}

const NOT_APPLICABLE = { wrapType: WrapType.NOT_APPLICABLE }

function _getWrapUnwrapCallback(params: GetWrapUnwrapCallback): WrapUnwrapCallback {
  const { chainId, isWrap, balance, inputAmount, addTransaction, wethContract } = params
  const { native, wrapped } = getChainCurrencySymbols(chainId)
  const symbol = isWrap ? native : wrapped

  // Check if user has enough balance for wrap/unwrap
  const sufficientBalance = !!(inputAmount && balance && !balance.lessThan(inputAmount))
  const isZero = balance && !inputAmount

  const inputError = isZero ? t`Enter an amount` : !sufficientBalance ? t`Insufficient ${symbol} balance` : undefined

  // Create wrap/unwrap callback if sufficient balance
  let wrapUnwrapCallback: (() => Promise<TransactionResponse>) | undefined
  if (sufficientBalance && inputAmount) {
    let wrapUnwrap: (opts: Overrides) => TransactionResponse
    let summary: string

    if (isWrap) {
      wrapUnwrap = (opts) => wethContract.deposit({ ...opts, value: `0x${inputAmount.quotient.toString(RADIX_HEX)}` })
      summary = t`Wrap ${formatSmart(inputAmount)} ${native} to ${wrapped}`
    } else {
      wrapUnwrap = (opts) => wethContract.withdraw(`0x${inputAmount.quotient.toString(RADIX_HEX)}`, opts)
      summary = t`Unwrap ${formatSmart(inputAmount)} ${wrapped} to ${native}`
    }

    wrapUnwrapCallback = async () => {
      try {
        const txReceipt = await applyCustomGasPrice(wrapUnwrap)
        addTransaction(txReceipt, { summary })

        return txReceipt
      } catch (error) {
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
  inputCurrency: Currency | undefined,
  outputCurrency: Currency | undefined,
  inputAmount: CurrencyAmount<Currency> | undefined,
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
      })
    }
  }, [wethContract, chainId, inputCurrency, outputCurrency, isEthTradeOverride, balance, inputAmount, addTransaction])
}
