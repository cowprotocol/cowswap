import { BigNumber } from '@ethersproject/bignumber'
import { hexStripZeros } from '@ethersproject/bytes'
import { ExternalProvider } from '@ethersproject/providers'
import { CHAIN_INFO } from 'constants/chainInfo'
import { SupportedChainId } from 'constants/chains'
import { RPC_NETWORKS } from '../connectors'

interface SwitchNetworkArguments {
  provider: ExternalProvider
  chainId: SupportedChainId
}

export function getRpcUrls(chainId: SupportedChainId): [string] {
  const rpcUrl = RPC_NETWORKS[chainId]
  if (!rpcUrl) {
    throw new Error('RPC URLs must use public endpoints')
  }

  return [rpcUrl]
}

// provider.request returns Promise<any>, but wallet_switchEthereumChain must return null or throw
// see https://github.com/rekmarks/EIPs/blob/3326-create/EIPS/eip-3326.md for more info on wallet_switchEthereumChain
export async function switchToNetwork({ provider, chainId }: SwitchNetworkArguments): Promise<null | void> {
  if (!provider?.request) {
    return
  }

  const formattedChainId = hexStripZeros(BigNumber.from(chainId).toHexString())
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: formattedChainId }],
    })
  } catch (error) {
    // 4902 is the error code for attempting to switch to an unrecognized chainId
    if (error.code === 4902 && chainId !== undefined) {
      const info = CHAIN_INFO[chainId]

      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: formattedChainId,
            chainName: info.label,
            rpcUrls: getRpcUrls(chainId),
            nativeCurrency: info.nativeCurrency,
            blockExplorerUrls: [info.explorer],
          },
        ],
      })
      // metamask (only known implementer) automatically switches after a network is added
      // the second call is done here because that behavior is not a part of the spec and cannot be relied upon in the future
      // metamask's behavior when switching to the current network is just to return null (a no-op)
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: formattedChainId }],
        })
      } catch (error) {
        console.error(`Error in ADDING/SWITCHING ${chainId}:`, error)
      }
    } else {
      throw error
    }
  }
}
