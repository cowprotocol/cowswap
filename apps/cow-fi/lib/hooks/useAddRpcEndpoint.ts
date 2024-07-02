import { useCallback } from 'react'

import { useConnect } from './useConnect'
import { WalletClient } from 'viem'

const CONFIG = {
  rpc: {
    url: 'https://rpc.mevblocker.io',
    chainId: 1,
    chainName: 'MEV Blocker (Ethereum Mainnet)',
    nativeSymbol: 'ETH',
    nativeDecimals: 18,
    blockExplorerUrl: 'https://etherscan.io',
  },
}

export interface UseAddRpcEndpointResult {
  isConnected: boolean
  addRpcEndpoint: () => Promise<boolean>
}

export function useAddRpcEndpoint(walletClient: WalletClient | undefined): UseAddRpcEndpointResult {
  const { isConnected } = useConnect()

  const addRpcEndpoint = useCallback(async () => {
    if (!walletClient || !isConnected) {
      return false
    }

    const {
      chainName,
      nativeSymbol,
      nativeDecimals,
      url: rpcUrl,
      chainId,
      blockExplorerUrl: blockExplorerUrls,
    } = CONFIG.rpc

    console.debug('[addRpcEndpoint] Do RPC call "wallet_addEthereumChain" with URL:', rpcUrl)
    return walletClient
      .request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: `0x${chainId.toString(16)}`,
            rpcUrls: [rpcUrl],
            chainName,
            nativeCurrency: {
              name: '',
              symbol: nativeSymbol,
              decimals: nativeDecimals,
            },
            blockExplorerUrls: [blockExplorerUrls],
          },
        ],
      })
      .then(() => true)
  }, [isConnected, walletClient])

  return {
    addRpcEndpoint,
    isConnected,
  }
}
