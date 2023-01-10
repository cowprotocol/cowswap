import { useEffect } from 'react'
import { useGasPrices, useUpdateGasPrices } from './hooks'
import { useWeb3React } from '@web3-react/core'
import { GAS_PRICE_UPDATE_THRESHOLD } from 'constants/index'
import { gasFeeApi } from '@cow/api/gasPrices'
import useBlockNumber from '@src/lib/hooks/useBlockNumber'

function needsGasUpdate(now: number, lastUpdated: number, threshold: number) {
  return now - lastUpdated > threshold
}

export default function GasUpdater(): null {
  const { chainId } = useWeb3React()
  const gas = useGasPrices(chainId)
  const updateGasPrices = useUpdateGasPrices()
  const blockNumber = useBlockNumber()

  useEffect(() => {
    const now = Date.now()
    const updated = gas ? Date.parse(gas.lastUpdate) : null
    const shouldUpdate = !updated || needsGasUpdate(now, updated, GAS_PRICE_UPDATE_THRESHOLD)

    // if no gas in local/redux state OR time threshold has passed
    // since last update, and there is a chainId, then update the gas prices
    if (shouldUpdate && chainId && gasFeeApi.supportedChain(chainId)) {
      gasFeeApi
        .getGasPrices(chainId)
        .then((gas) => {
          updateGasPrices({
            ...gas,
            chainId,
          })
        })
        // on error we log and keep state as it was
        .catch(console.error)
    }
  }, [chainId, gas, blockNumber, updateGasPrices])

  return null
}
