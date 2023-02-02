import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import ms from 'ms.macro'

import { DEFAULT_GP_PRICE_STRATEGY } from 'legacy/constants'
import { gasPriceStrategyAtom } from 'legacy/state/gas/atoms'

import { useWalletInfo } from 'modules/wallet'

import { getPriceStrategy } from 'api/gnosisProtocol/priceApi'
import { usePolling } from 'common/hooks/usePolling'

const GP_PRICE_STRATEGY_INTERVAL_TIME = ms`30 minutes`

export function GasPriceStrategyUpdater(): null {
  const { chainId } = useWalletInfo()
  const setGasPriceStrategy = useSetAtom(gasPriceStrategyAtom)

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
