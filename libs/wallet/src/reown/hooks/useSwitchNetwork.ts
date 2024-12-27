import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useAppKitNetwork } from '@reown/appkit/react'

import { SUPPORTED_REOWN_NETWORKS } from '../consts'

export function useSwitchNetwork() {
  const { switchNetwork } = useAppKitNetwork()

  return (chainId: SupportedChainId) => {
    const network = SUPPORTED_REOWN_NETWORKS.find((network) => +network.id === +chainId)

    if (!network) {
      throw new Error(`Network nod found while switching: ${chainId}`)
    }

    switchNetwork(network)
  }
}
