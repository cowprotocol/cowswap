import { useCallback } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import useSWR from 'swr'

import { useHooks } from 'modules/hooksStore'
import { useOrderParams } from 'modules/hooksStore/hooks/useOrderParams'

import { useTokenContract } from 'common/hooks/useContract'

import { useGetTopTokenHolders } from './useGetTopTokenHolders'

import { completeBundleSimulation, preHooksBundleSimulation } from '../utils/bundleSimulation'
import { generateNewSimulationData, generateSimulationDataToError } from '../utils/generateSimulationData'
import { getTokenTransferInfo } from '../utils/getTokenTransferInfo'

export function useTenderlyBundleSimulation() {
  const { account, chainId } = useWalletInfo()
  const { preHooks, postHooks } = useHooks()
  const orderParams = useOrderParams()
  const tokenSell = useTokenContract(orderParams?.sellTokenAddress)
  const tokenBuy = useTokenContract(orderParams?.buyTokenAddress)
  const buyAmount = orderParams?.buyAmount
  const sellAmount = orderParams?.sellAmount
  const orderReceiver = orderParams?.receiver || account

  const getTopTokenHolder = useGetTopTokenHolders()

  const simulateBundle = useCallback(async () => {
    if (postHooks.length === 0 && preHooks.length === 0) return

    if (!postHooks.length)
      return preHooksBundleSimulation({
        chainId,
        preHooks,
      })

    if (!account || !tokenBuy || !tokenSell || !buyAmount || !sellAmount || !orderReceiver) {
      return
    }

    const buyTokenTopHolders = await getTopTokenHolder({
      tokenAddress: tokenBuy.address,
      chainId,
    })

    if (!buyTokenTopHolders) return

    const tokenBuyTransferInfo = getTokenTransferInfo({
      tokenHolders: buyTokenTopHolders,
      amountToTransfer: buyAmount,
    })

    const paramsComplete = {
      postHooks,
      preHooks,
      tokenBuy,
      tokenBuyTransferInfo,
      sellAmount,
      orderReceiver,
      tokenSell,
      account,
      chainId,
    }

    return completeBundleSimulation(paramsComplete)
  }, [
    account,
    chainId,
    getTopTokenHolder,
    tokenBuy,
    postHooks,
    preHooks,
    buyAmount,
    sellAmount,
    orderReceiver,
    tokenSell,
  ])

  const getNewSimulationData = useCallback(async () => {
    try {
      const simulationData = await simulateBundle()

      if (!simulationData) {
        return {}
      }

      return generateNewSimulationData(simulationData, { preHooks, postHooks })
    } catch {
      return generateSimulationDataToError({ preHooks, postHooks })
    }
  }, [preHooks, postHooks, simulateBundle])

  const { data, isValidating: isBundleSimulationLoading } = useSWR(
    ['tenderly-bundle-simulation', postHooks, preHooks],
    getNewSimulationData,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
    },
  )

  return { data, isValidating: isBundleSimulationLoading }
}
