import { useWeb3React } from '@web3-react/core'
// eslint-disable-next-line no-restricted-imports
import { t } from '@lingui/macro'
import { useEffect } from 'react'
import { getDefaultLimitOrdersState, limitOrdersAtom } from 'cow-react/modules/limitOrders/state/limitOrdersAtom'
import { useAreThereTokensWithSameSymbol } from 'cow-react/modules/limitOrders/hooks/useAreThereTokensWithSameSymbol'
import { useAtomValue } from 'jotai/utils'
import { useLimitOrdersNavigate } from 'cow-react/modules/limitOrders/hooks/useLimitOrdersNavigate'

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
export function useResetStateWithSymbolDuplication() {
  const { chainId } = useWeb3React()
  const { inputCurrencyId, outputCurrencyId } = useAtomValue(limitOrdersAtom)
  const checkTokensWithSameSymbol = useAreThereTokensWithSameSymbol()
  const limitOrdersNavigate = useLimitOrdersNavigate()

  useEffect(() => {
    const inputCurrencyIsDoubled = checkTokensWithSameSymbol(inputCurrencyId)
    const outputCurrencyIsDoubled = checkTokensWithSameSymbol(outputCurrencyId)

    if (chainId && (inputCurrencyIsDoubled || outputCurrencyIsDoubled)) {
      const doubledSymbol = inputCurrencyIsDoubled ? inputCurrencyId : outputCurrencyId

      alert(alertMessage(doubledSymbol || ''))

      const defaultState = getDefaultLimitOrdersState(chainId)
      limitOrdersNavigate(chainId, defaultState.inputCurrencyId, defaultState.outputCurrencyId)
    }
  }, [limitOrdersNavigate, checkTokensWithSameSymbol, chainId, inputCurrencyId, outputCurrencyId])
}
