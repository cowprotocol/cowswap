import { useCallback } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWeb3React } from '@web3-react/core'

import { switchChain } from '../utils/switchChain'

export function useSwitchNetwork() {
  const { connector } = useWeb3React()

  return useCallback(
    (targetChain: SupportedChainId) => {
      return switchChain(connector, targetChain)
    },
    [connector]
  )
}
