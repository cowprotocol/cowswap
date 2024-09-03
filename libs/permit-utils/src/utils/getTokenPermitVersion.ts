import { defaultAbiCoder } from '@ethersproject/abi'
import type { JsonRpcProvider } from '@ethersproject/providers'

import { getContract } from './getContract'

import { VERSION_ABIS } from '../abi/versionAbis'

export async function getTokenPermitVersion(
  tokenAddress: string,
  provider: JsonRpcProvider,
  index = 0,
): Promise<string> {
  const abi = VERSION_ABIS[index]

  if (!abi) {
    return '1'
  }

  try {
    const contract = getContract(tokenAddress, abi, provider)
    const data = contract.interface.encodeFunctionData(abi[0].name)
    const response = await provider.call({ to: tokenAddress, data })

    if (response === '0x' || Number.isNaN(Number(response))) {
      return '1'
    }
    if (!response.startsWith('0x')) {
      return response
    }

    return defaultAbiCoder.decode(['string'], response).toString()
  } catch {
    return getTokenPermitVersion(tokenAddress, provider, index + 1)
  }
}
