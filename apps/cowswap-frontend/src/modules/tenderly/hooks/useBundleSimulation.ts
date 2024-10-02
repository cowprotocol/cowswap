import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { bundleSimulation, PostBundleSimulationParams } from '../utils/bundleSimulation'
import { checkBundleSimulationError } from '../utils/checkBundleSimulationError'
import { generateNewSimulationData, generateSimulationDataToError, simulationAtom } from '../states/simulation'
import { useTopTokenHolders } from './useTopTokenHolders'
import { getTokenTransferInfo } from '../utils/getTokenTransferInfo'
import { useOrderParams } from 'modules/hooksStore/hooks/useOrderParams'
import { useTokenContract } from 'common/hooks/useContract'

export function useTenderlyBundleSimulate(): (
  params: Pick<PostBundleSimulationParams, 'preHooks' | 'postHooks'>,
) => Promise<void> {
  const { account, chainId } = useWalletInfo()
  const orderParams = useOrderParams()
  const tokenSell = useTokenContract(orderParams?.sellTokenAddress)
  const tokenBuy = useTokenContract(orderParams?.buyTokenAddress)
  const setSimulationData = useSetAtom(simulationAtom)

  const { data: buyTokenTopHolders } = useTopTokenHolders({ tokenAddress: tokenBuy?.address, chainId })

  return useCallback(
    async (params) => {
      if (params.postHooks.length === 0 && params.preHooks.length === 0) return
      if (!account || !buyTokenTopHolders || !tokenBuy || !orderParams || !tokenSell) {
        return
      }

      const tokenBuyTransferInfo = getTokenTransferInfo({
        tokenHolders: buyTokenTopHolders,
        amountToTransfer: orderParams.buyAmount,
      })

      const paramsComplete = {
        ...params,
        tokenBuy,
        tokenBuyTransferInfo,
        orderParams,
        tokenSell,
        account,
        chainId,
      }

      const response = await bundleSimulation(paramsComplete)

      const newSimulationData = checkBundleSimulationError(response)
        ? generateSimulationDataToError(paramsComplete)
        : generateNewSimulationData(response, paramsComplete)

      setSimulationData(newSimulationData)
      return
    },
    [account, chainId, buyTokenTopHolders, setSimulationData, tokenBuy],
  )
}
