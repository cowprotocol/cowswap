import ms from 'ms.macro'
import { useState, useEffect, useCallback } from 'react'
import { DEFAULT_GP_PRICE_STRATEGY } from 'constants/index'
import { getPriceStrategy, PriceStrategy } from 'api/gnosisProtocol/api'
import { useActiveWeb3React } from 'hooks'
import { supportedChainId } from 'utils/supportedChainId'
import { SupportedChainId } from 'constants/chains'

export type GpPriceStrategy = 'COWSWAP' | 'LEGACY'

// arbitrary, could be more/less
const GP_PRICE_STRATEGY_INTERVAL_TIME = ms`30 minutes`

export default function useGetGpPriceStrategy(): GpPriceStrategy {
  const [gpPriceStrategy, setGpPriceStrategy] = useState<GpPriceStrategy>(DEFAULT_GP_PRICE_STRATEGY)
  const { chainId: preChainId } = useActiveWeb3React()

  const _handleSetStrategy = useCallback((response: PriceStrategy) => setGpPriceStrategy(response.primary), [])

  useEffect(() => {
    const chainId = supportedChainId(preChainId)
    console.debug('[useGetGpPriceStrategy::GP Price Strategy]::', gpPriceStrategy)

    const getStrategy = () => {
      // default to MAINNET if not connected, or incorrect network
      getPriceStrategy(chainId || SupportedChainId.MAINNET)
        .then(_handleSetStrategy)
        .catch((err: Error) => {
          console.error('[useGetGpPriceStrategy::useEffect] Error getting GP price strategy::', err)
          // Fallback to DEFAULT
          setGpPriceStrategy(DEFAULT_GP_PRICE_STRATEGY)
        })
    }

    // Create initial call on mount
    getStrategy()

    const intervalId = setInterval(() => {
      getStrategy()
    }, GP_PRICE_STRATEGY_INTERVAL_TIME)

    return () => clearInterval(intervalId)
  }, [_handleSetStrategy, gpPriceStrategy, preChainId])

  return gpPriceStrategy
}
