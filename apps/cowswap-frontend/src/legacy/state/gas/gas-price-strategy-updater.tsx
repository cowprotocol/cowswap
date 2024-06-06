import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { DEFAULT_PRICE_STRATEGY } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'

import ms from 'ms.macro'

import { gasPriceStrategyAtom } from './atoms'

import { getPriceStrategy } from '../../../api/cowProtocol/priceApi'

const PRICE_STRATEGY_INTERVAL_TIME = ms`30 minutes`

export function GasPriceStrategyUpdater(): null {
  const { chainId } = useWalletInfo()
  const setGasPriceStrategy = useSetAtom(gasPriceStrategyAtom)

  useEffect(() => {
    if (!chainId) return

    const updateCallback = () => {
      getPriceStrategy(chainId)
        .then((response) => {
          setGasPriceStrategy(response.primary)
        })
        .catch((err: Error) => {
          console.error('[GasPiceStrategyUpdater] Error getting GP price strategy::', err)

          setGasPriceStrategy(DEFAULT_PRICE_STRATEGY)
        })
    }

    const intervalId = setInterval(updateCallback, PRICE_STRATEGY_INTERVAL_TIME)

    updateCallback()

    return () => {
      clearInterval(intervalId)
    }
  }, [chainId, setGasPriceStrategy])

  return null
}
