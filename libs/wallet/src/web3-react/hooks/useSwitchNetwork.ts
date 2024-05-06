import { useWeb3React } from '@web3-react/core'
import { useCallback } from 'react'
import { switchChain } from '@cowprotocol/wallet'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export function useSwitchNetwork() {
  const { connector } = useWeb3React()

  return useCallback(
    (targetChain: SupportedChainId) => {
      return switchChain(connector, targetChain)
    },
    [connector]
  )
}
