// eslint-disable-next-line no-restricted-imports
import { t } from '@lingui/macro'
import { useEffect } from 'react'
import { useAreThereTokensWithSameSymbol } from '@cow/common/hooks/useAreThereTokensWithSameSymbol'
import { getDefaultTradeState, TradeState } from '../../types/TradeState'
import { useTradeNavigate } from '../useTradeNavigate'
import { useWalletInfo } from '@cow/modules/wallet'

const alertMessage = (
  doubledSymbol: string
) => t`There is more than one token in the list of tokens with the symbol: ${doubledSymbol}.
Please select the token you need from the UI or use the address of the token instead of the symbol`

/**
 * Case: when user opened a link with a token symbol and there are more than one token with the same symbol
 * Example: /limit-orders/UST/WETH
 * https://etherscan.io/token/0xa47c8bf37f92abed4a126bda807a7b7498661acd - Symbol: UST
 * https://etherscan.io/token/0xa693b19d2931d498c5b318df961919bb4aee87a5 - Symbol: UST
 * In this case we just reset state to default, because:
 * if user selected a token with symbol duplication from cowswap Dapp, then Dapp puts a token address in the URL
 * Example: /limit-orders/0xa47c8bf37f92abed4a126bda807a7b7498661acd/WETH
 * @see useOnCurrencySelection.ts
 */
export function useResetStateWithSymbolDuplication(state: TradeState | null): void {
  const { chainId } = useWalletInfo()
  const checkTokensWithSameSymbol = useAreThereTokensWithSameSymbol()
  const navigate = useTradeNavigate()
  const { inputCurrencyId, outputCurrencyId } = state || {}

  useEffect(() => {
    const inputCurrencyIsDoubled = checkTokensWithSameSymbol(inputCurrencyId)
    const outputCurrencyIsDoubled = checkTokensWithSameSymbol(outputCurrencyId)

    if (chainId && (inputCurrencyIsDoubled || outputCurrencyIsDoubled)) {
      const doubledSymbol = inputCurrencyIsDoubled ? inputCurrencyId : outputCurrencyId

      // TODO: add UI modal instead of alert
      // Show alert in 500ms to avoid glitch with transparent Import token modal
      setTimeout(() => {
        alert(alertMessage(doubledSymbol || ''))
      }, 500)

      const defaultState = getDefaultTradeState(chainId)
      navigate(chainId, {
        inputCurrencyId: defaultState.inputCurrencyId,
        outputCurrencyId: defaultState.outputCurrencyId,
      })
    }
  }, [navigate, checkTokensWithSameSymbol, chainId, inputCurrencyId, outputCurrencyId])
}
