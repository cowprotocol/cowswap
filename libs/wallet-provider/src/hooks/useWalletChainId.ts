import { LAUNCH_DARKLY_VIEM_MIGRATION } from '@cowprotocol/common-const'
import { useWeb3React } from '@web3-react/core'

import { useConnection } from 'wagmi'

export function useWalletChainId(): number | undefined {
  const { chainId: wagmiChainId } = useConnection()
  const { chainId: web3ChainId } = useWeb3React()

  if (LAUNCH_DARKLY_VIEM_MIGRATION) {
    return wagmiChainId
  }

  return web3ChainId
}
