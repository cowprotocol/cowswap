import { useWeb3React } from '@web3-react/core'
import { supportedChainId } from 'utils/supportedChainId'
import { useUpdateAtom } from 'jotai/utils'
import { gasPriceStrategyAtom } from 'state/gas/atoms'
import ms from 'ms.macro'
import { useCallback } from 'react'
import { getPriceStrategy } from '@cow/api/gnosisProtocol/api'
import { DEFAULT_GP_PRICE_STRATEGY } from 'constants/index'
import { usePolling } from '@cow/common/hooks/usePolling'

const GP_PRICE_STRATEGY_INTERVAL_TIME = ms`30 minutes`

export function GasPriceStrategyUpdater(): null {
  const { chainId: preChainId } = useWeb3React()
  const setGasPriceStrategy = useUpdateAtom(gasPriceStrategyAtom)
  const chainId = supportedChainId(preChainId)

  const updateCallback = useCallback(() => {
    if (!chainId) return

    getPriceStrategy(chainId)
      .then((response) => {
        setGasPriceStrategy(response.primary)
      })
      .catch((err: Error) => {
        console.error('[GasPiceStrategyUpdater] Error getting GP price strategy::', err)

        setGasPriceStrategy(DEFAULT_GP_PRICE_STRATEGY)
      })
  }, [chainId, setGasPriceStrategy])

  usePolling({
    doPolling: updateCallback,
    name: 'GasPriceStrategyUpdater',
    pollingTimeMs: GP_PRICE_STRATEGY_INTERVAL_TIME,
  })

  return null
}
