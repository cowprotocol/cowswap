import { useCallback } from 'react'

import { Erc20 } from '@cowprotocol/abis'
import { useWalletInfo } from '@cowprotocol/wallet'

import { CowHook, HookDappOrderParams } from 'modules/hooksStore/types/hooks'

import { TENDERLY_TESTNET_PROVIDER } from '../const'
import { TenderlyBundleSimulationResponse } from '../types'
import { getBundleTenderlySimulationInput } from '../utils'

interface BundleTenderlySimulationParams {
  preHooks: CowHook[]
  postHooks: CowHook[]
  orderParams: HookDappOrderParams
  tokenSell: Erc20
  tokenBuy: Erc20
}

export function useTenderlyBundleSimulate(): (
  params: BundleTenderlySimulationParams,
) => Promise<TenderlyBundleSimulationResponse | undefined> {
  const { account, chainId } = useWalletInfo()

  return useCallback(
    async (params: BundleTenderlySimulationParams) => {
      if (!account) {
        return
      }
      const response = await TENDERLY_TESTNET_PROVIDER.send('tenderly_simulateBundle', [
        getBundleTenderlySimulationInput({
          account,
          chainId,
          tokenSell: params.tokenSell,
          tokenBuy: params.tokenBuy,
          preHooks: params.preHooks,
          postHooks: params.postHooks,
          orderParams: params.orderParams,
        }),
        'latest',
      ])

      return response as TenderlyBundleSimulationResponse
    },
    [account, chainId],
  )
}
