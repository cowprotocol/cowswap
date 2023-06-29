import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'

import { useWeb3React } from '@web3-react/core'

import ms from 'ms.macro'

import { DEFAULT_GP_PRICE_STRATEGY } from 'legacy/constants'
import { gasPriceStrategyAtom } from 'legacy/state/gas/atoms'
import { supportedChainId } from 'legacy/utils/supportedChainId'

import { getPriceStrategy } from 'api/gnosisProtocol/priceApi'

const GP_PRICE_STRATEGY_INTERVAL_TIME = ms`30 minutes`

export function GasPriceStrategyUpdater(): null {
  const { chainId: preChainId } = useWeb3React()
  const setGasPriceStrategy = useUpdateAtom(gasPriceStrategyAtom)
  const chainId = supportedChainId(preChainId)

  useEffect(() => {
    if (!chainId) return

    const updateCallback = () => {
      getPriceStrategy(chainId)
        .then((response) => {
          setGasPriceStrategy(response.primary)
        })
        .catch((err: Error) => {
          console.error('[GasPiceStrategyUpdater] Error getting GP price strategy::', err)

          setGasPriceStrategy(DEFAULT_GP_PRICE_STRATEGY)
        })
    }

    const intervalId = setInterval(updateCallback, GP_PRICE_STRATEGY_INTERVAL_TIME)

    updateCallback()

    return () => {
      clearInterval(intervalId)
    }
  }, [chainId, setGasPriceStrategy])

  return null
}
