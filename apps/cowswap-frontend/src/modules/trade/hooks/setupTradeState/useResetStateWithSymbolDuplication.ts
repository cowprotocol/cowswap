import { useEffect } from 'react'

import { useAreThereTokensWithSameSymbol } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/macro'
import { Nullish } from 'types'

import { getDefaultTradeRawState, TradeRawState } from '../../types/TradeRawState'
import { useTradeNavigate } from '../useTradeNavigate'

const alertMessage = (
  doubledSymbol: string,
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
) => t`There is more than one token in the list of tokens with the symbol: ${doubledSymbol}.
Please select the token you need from the UI or use the address of the token instead of the symbol`

let timeoutId: NodeJS.Timeout | null = null
/**
 * Case: when user opened a link with a token symbol and there are more than one token with the same symbol
 * Example: /limit/UST/WETH
 * https://etherscan.io/token/0xa47c8bf37f92abed4a126bda807a7b7498661acd - Symbol: UST
 * https://etherscan.io/token/0xa693b19d2931d498c5b318df961919bb4aee87a5 - Symbol: UST
 * In this case we just reset state to default, because:
 * if user selected a token with symbol duplication from cowswap Dapp, then Dapp puts a token address in the URL
 * Example: /limit/0xa47c8bf37f92abed4a126bda807a7b7498661acd/WETH
 * @see useOnCurrencySelection.ts
 */
export function useResetStateWithSymbolDuplication(state: TradeRawState | null): void {
  const { chainId } = useWalletInfo()
  const checkTokensWithSameSymbol = useAreThereTokensWithSameSymbol()
  const navigate = useTradeNavigate()
  const { inputCurrencyId, outputCurrencyId } = state || {}

  useEffect(() => {
    const defaultState = getDefaultTradeRawState(chainId)

    const inputCurrencyIsDuplicated = checkTokensWithSameSymbol(inputCurrencyId, chainId)
    const outputCurrencyIsDuplicated = checkTokensWithSameSymbol(outputCurrencyId, chainId)

    const defaultInputIsDuplicated = checkTokensWithSameSymbol(defaultState.inputCurrencyId, chainId)
    const defaultOutputIsDuplicated = checkTokensWithSameSymbol(defaultState.outputCurrencyId, chainId)

    const defaultInput = defaultInputIsDuplicated ? '' : defaultState.inputCurrencyId
    const defaultOutput = defaultOutputIsDuplicated ? '' : defaultState.outputCurrencyId

    if (chainId && (inputCurrencyIsDuplicated || outputCurrencyIsDuplicated)) {
      const doubledSymbol = inputCurrencyIsDuplicated ? inputCurrencyId : outputCurrencyId

      const shouldSkipInputCurrency = shouldSkipCurrency(inputCurrencyIsDuplicated, inputCurrencyId, defaultInput)
      const shouldSkipOutputCurrency = shouldSkipCurrency(outputCurrencyIsDuplicated, outputCurrencyId, defaultOutput)

      /**
       * There are duplicates, but the value to reset already matches the value
       */
      if (shouldSkipInputCurrency || shouldSkipOutputCurrency) return

      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      // TODO: add UI modal instead of alert
      // Show alert in 500ms to avoid glitch with transparent Import token modal
      timeoutId = setTimeout(() => {
        alert(alertMessage(doubledSymbol || ''))
      }, 500)

      navigate(chainId, {
        inputCurrencyId: defaultInput,
        outputCurrencyId: defaultOutput,
      })
    }
  }, [navigate, checkTokensWithSameSymbol, chainId, inputCurrencyId, outputCurrencyId])
}

function shouldSkipCurrency(
  isDuplicated: boolean,
  currencyId: Nullish<string>,
  defaultValue: Nullish<string>,
): boolean {
  return !isDuplicated || currencyId?.toLowerCase() === defaultValue?.toLowerCase()
}
