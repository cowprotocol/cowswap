import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useConnection } from 'wagmi'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useNetworkSwitchUnsupported } from '../../api/hooks/useNetworkSwitchUnsupported'
import { walletInfoAtom } from '../../api/state'
import { getReownChainNamespace } from '../../reown/getReownChainNamespace'
import { getReownNetwork } from '../../reown/networks'
import { reownAppKit } from '../config'

import type { AppKitNetwork } from '@reown/appkit-common'

export function useSwitchNetwork(): (chainId: SupportedChainId) => Promise<void> {
  const { isConnected } = useConnection()
  const networkSwitchUnsupported = useNetworkSwitchUnsupported()
  const setWalletInfo = useSetAtom(walletInfoAtom)

  return useCallback(
    async (chainId: SupportedChainId) => {
      if (networkSwitchUnsupported) return

      if (isConnected) {
        const network = getReownNetwork(chainId)

        if (!network) {
          console.error('Unknown network to switch on', chainId)
          return
        }
        const isSwitchingNamespace = reownAppKit.getActiveChainNamespace() !== getReownChainNamespace(chainId)
        const previousNetwork = reownAppKit.getCaipNetwork()

        await reownAppKit.switchNetwork(network, { throwOnFailure: true })

        // AppKit only activates the target namespace on a cross-namespace switch and does not ask the wallet
        // to change its chain, so a multi-namespace WalletConnect session would stay on its previous EVM chain
        if (isSwitchingNamespace) {
          await switchWalletChainOrRevert(network, previousNetwork)
        }
      } else {
        setWalletInfo((prev) => ({ ...prev, chainId }))
      }
    },
    [isConnected, networkSwitchUnsupported, setWalletInfo],
  )
}

async function switchWalletChainOrRevert(
  network: AppKitNetwork,
  previousNetwork: AppKitNetwork | undefined,
): Promise<void> {
  try {
    await reownAppKit.switchNetwork(network, { throwOnFailure: true })
  } catch (err: unknown) {
    // Switching back across namespaces does not involve the wallet, so AppKit returns to the chain the wallet is still on
    if (previousNetwork) {
      await reownAppKit.switchNetwork(previousNetwork)
    }

    throw err
  }
}
