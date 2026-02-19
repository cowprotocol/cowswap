import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenInfo } from '@cowprotocol/types'

import { erc20Abi, getAddress } from 'viem'
import { readContracts } from 'wagmi/actions'

import type { Config } from 'wagmi'

export async function fetchTokenFromBlockchain(
  tokenAddress: string,
  chainId: SupportedChainId,
  config: Config,
): Promise<TokenInfo> {
  const formattedAddress = getAddress(tokenAddress)

  const [nameQuery, symbolQuery, decimalsQuery] = await readContracts(config, {
    contracts: [
      {
        abi: erc20Abi,
        address: formattedAddress,
        functionName: 'name',
      },
      {
        abi: erc20Abi,
        address: formattedAddress,
        functionName: 'symbol',
      },
      { abi: erc20Abi, address: formattedAddress, functionName: 'decimals' },
    ],
  })

  if (nameQuery.status !== 'success' || symbolQuery.status !== 'success' || decimalsQuery.status !== 'success') {
    throw nameQuery.error || symbolQuery.error || decimalsQuery.error
  }

  return {
    chainId,
    address: formattedAddress,
    name: nameQuery.result!,
    symbol: symbolQuery.result!,
    decimals: decimalsQuery.result!,
  }
}
