import { useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { bundleSimulation } from '../utils/bundleSimulation'
import { checkBundleSimulationError } from '../utils/checkBundleSimulationError'
import { useTopTokenHolders } from './useTopTokenHolders'
import { getTokenTransferInfo } from '../utils/getTokenTransferInfo'
import { useOrderParams } from 'modules/hooksStore/hooks/useOrderParams'
import { useTokenContract } from 'common/hooks/useContract'
import useSWR from 'swr'
import { useHooks } from 'modules/hooksStore'
import { generateNewSimulationData, generateSimulationDataToError } from '../utils/generateSimulationData'

export function useTenderlyBundleSimulateSWR() {
  const { account, chainId } = useWalletInfo()
  const { preHooks, postHooks } = useHooks()
  const orderParams = useOrderParams()
  const tokenSell = useTokenContract(orderParams?.sellTokenAddress)
  const tokenBuy = useTokenContract(orderParams?.buyTokenAddress)

  const { data: buyTokenTopHolders } = useTopTokenHolders({ tokenAddress: tokenBuy?.address, chainId })

  const getNewSimulationData = useCallback(async () => {
    if (postHooks.length === 0 && preHooks.length === 0) return {}

    if (!account || !buyTokenTopHolders || !tokenBuy || !orderParams || !tokenSell) {
      throw new Error('Missing required data for simulation')
    }

    const tokenBuyTransferInfo = getTokenTransferInfo({
      tokenHolders: buyTokenTopHolders,
      amountToTransfer: orderParams.buyAmount,
    })

    const paramsComplete = {
      postHooks,
      preHooks,
      tokenBuy,
      tokenBuyTransferInfo,
      orderParams,
      tokenSell,
      account,
      chainId,
    }

    const response = await bundleSimulation(paramsComplete)

    return checkBundleSimulationError(response)
      ? generateSimulationDataToError(paramsComplete)
      : generateNewSimulationData(response, paramsComplete)
  }, [account, chainId, buyTokenTopHolders, tokenBuy, postHooks, preHooks])

  return useSWR(['tenderly-bundle-simulation', postHooks, preHooks], getNewSimulationData)
}
