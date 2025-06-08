import { useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'

import { GAS_PRICE_UPDATE_THRESHOLD } from '@cowprotocol/common-const'
import { gasPriceAtom } from '@cowprotocol/core'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useDispatch } from 'react-redux'

import { AppDispatch } from 'legacy/state'
import { updateGasPrices, UpdateGasPrices } from 'legacy/state/gas/actions'
import { useGasPrices } from 'legacy/state/gas/hooks'

import { gasFeeApi } from 'api/gasPrices'

import { useBlockNumber } from '../hooks/useBlockNumber'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function needsGasUpdate(now: number, lastUpdated: number, threshold: number) {
  return now - lastUpdated > threshold
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function useUpdateGasPrices() {
  const dispatch = useDispatch<AppDispatch>()
  const setGasPrice = useSetAtom(gasPriceAtom)

  return useCallback(
    (gasParams: UpdateGasPrices) => {
      dispatch(updateGasPrices(gasParams))
      setGasPrice(gasParams)
    },
    [dispatch, setGasPrice],
  )
}

export function GasUpdater(): null {
  const { chainId } = useWalletInfo()
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
