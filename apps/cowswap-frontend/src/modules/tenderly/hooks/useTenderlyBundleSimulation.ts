import { useCallback } from 'react'

import { CowHookDetails } from '@cowprotocol/hook-dapp-lib'
import { useWalletInfo } from '@cowprotocol/wallet'

import useSWR from 'swr'

import { useHooks } from 'modules/hooksStore'
import { useOrderParams } from 'modules/hooksStore/hooks/useOrderParams'

import { useGetTopTokenHolders } from './useGetTopTokenHolders'

import { completeBundleSimulation, hooksBundleSimulation } from '../utils/bundleSimulation'
import { generateNewSimulationData, generateSimulationDataToError } from '../utils/generateSimulationData'
import { getTokenTransferInfo } from '../utils/getTokenTransferInfo'

type BundleSimulationSwrParams = {
  preHooks: CowHookDetails[]
  postHooks: CowHookDetails[]
}

export function useTenderlyBundleSimulation() {
  const { account, chainId } = useWalletInfo()
  const { preHooks, postHooks } = useHooks()
  const orderParams = useOrderParams()

  const getTopTokenHolder = useGetTopTokenHolders()

  const simulateBundle = useCallback(
    async ({ preHooks, postHooks }: BundleSimulationSwrParams) => {
      if (postHooks.length === 0 && preHooks.length === 0) return

      if (!postHooks.length)
        return hooksBundleSimulation({
          chainId,
          preHooks,
          postHooks: [],
        })

      if (
        !account ||
        !orderParams?.buyTokenAddress ||
        !orderParams?.sellTokenAddress ||
        !orderParams?.buyAmount ||
        !orderParams?.sellAmount ||
        !orderParams?.receiver
      ) {
        return hooksBundleSimulation({
          chainId,
          preHooks,
          postHooks,
        })
      }

      const buyTokenTopHolders = await getTopTokenHolder({
        tokenAddress: orderParams.buyTokenAddress,
        chainId,
      })

      if (!buyTokenTopHolders) return

      const tokenBuyTransferInfo = getTokenTransferInfo({
        tokenHolders: buyTokenTopHolders,
        amountToTransfer: orderParams.buyAmount,
      })

      const paramsComplete = {
        postHooks,
        preHooks,
        tokenBuy: orderParams.buyTokenAddress,
        tokenBuyTransferInfo,
        sellAmount: orderParams.sellAmount,
        buyAmount: orderParams.buyAmount,
        orderReceiver: orderParams.receiver,
        tokenSell: orderParams.sellTokenAddress,
        account,
        chainId,
      }

      return completeBundleSimulation(paramsComplete)
    },
    [account, chainId, getTopTokenHolder, orderParams],
  )

  const getNewSimulationData = useCallback(
    async ([_, params]: [string, BundleSimulationSwrParams]) => {
      const simulationData = await simulateBundle(params)

      if (!simulationData) {
        return {}
      }

      try {
        return generateNewSimulationData(simulationData, { preHooks: params.preHooks, postHooks: params.postHooks })
      } catch (e) {
        console.log(`error`, { e, simulationData })
        return generateSimulationDataToError({ preHooks: params.preHooks, postHooks: params.postHooks })
      }
    },
    [simulateBundle],
  )

  return useSWR(
    [
      'tenderly-bundle-simulation',
      {
        preHooks,
        postHooks,
      },
    ],
    getNewSimulationData,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      revalidateOnMount: false,
    },
  )
}
