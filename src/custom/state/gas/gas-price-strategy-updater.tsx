import { supportedChainId } from 'utils/supportedChainId'
import { useUpdateAtom } from 'jotai/utils'
import { gasPriceStrategyAtom } from 'state/gas/atoms'
import ms from 'ms.macro'
import { useEffect } from 'react'
import { getPriceStrategy } from '@cow/api/gnosisProtocol/api'
import { DEFAULT_GP_PRICE_STRATEGY } from 'constants/index'
import { useWalletInfo } from '@cow/modules/wallet'

const GP_PRICE_STRATEGY_INTERVAL_TIME = ms`30 minutes`

export function GasPriceStrategyUpdater(): null {
  const { chainId: preChainId } = useWalletInfo()
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
