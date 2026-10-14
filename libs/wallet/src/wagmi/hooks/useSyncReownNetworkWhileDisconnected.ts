import { useEffect } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { IS_SOLANA_WALLET_ENABLED, SUPPORTED_CHAIN_ID_TO_CAIP } from '../../constants'
import { getReownNetwork } from '../../reown/networks'
import { reownAppKit } from '../config'

export function useSyncReownNetworkWhileDisconnected(chainId: SupportedChainId, isConnected: boolean): void {
  useEffect(() => {
    if (!IS_SOLANA_WALLET_ENABLED || isConnected) return
    if (reownAppKit.getCaipNetwork()?.caipNetworkId === SUPPORTED_CHAIN_ID_TO_CAIP[chainId]) return

    const network = getReownNetwork(chainId)

    // AppKit opens the next connection in its active namespace, which only follows the URL when we tell it to
    if (network) {
      void reownAppKit.switchNetwork(network)
    }
  }, [chainId, isConnected])
}
