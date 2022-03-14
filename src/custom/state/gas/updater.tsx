import { useEffect } from 'react'
import { useGasPrices, useUpdateGasPrices } from './hooks'
import { useActiveWeb3React } from 'hooks/web3'
import { GAS_PRICE_UPDATE_THRESHOLD } from 'constants/index'
import { getGasPrices } from 'api/cow/api'

function needsGasUpdate(now: number, lastUpdated: number, threshold: number) {
  return now - lastUpdated > threshold
}

export default function GasUpdater(): null {
  const { chainId } = useActiveWeb3React()
  const gas = useGasPrices(chainId)
  const updateGasPrices = useUpdateGasPrices()

  useEffect(() => {
    const now = Date.now()
    const updated = gas ? Date.parse(gas.lastUpdate) : null

    // if no gas in local/redux state OR time threshold has passed
    // since last update, then:
    if (!updated || needsGasUpdate(now, updated, GAS_PRICE_UPDATE_THRESHOLD)) {
      getGasPrices(chainId)
        .then((gas) => {
          updateGasPrices({
            ...gas,
            chainId,
          })
        })
        // on error we log and keep state as it was
        .catch(console.error)
    }
  }, [chainId, gas, updateGasPrices])

  return null
}
