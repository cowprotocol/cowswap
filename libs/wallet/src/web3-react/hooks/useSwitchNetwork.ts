import { useCallback } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWeb3React } from '@web3-react/core'

import { networkConnection } from '../connection/network'
import { switchChain } from '../utils/switchChain'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useSwitchNetwork() {
  const { connector, account } = useWeb3React()

  return useCallback(
    async (targetChain: SupportedChainId) => {
      if (connector !== networkConnection.connector && !account) return

      return switchChain(connector, targetChain)
    },
    [connector, account],
  )
}
