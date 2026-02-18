import { decodeAbiParameters, type Address, type Hex } from 'viem'
import { Config } from 'wagmi'
import { readContract } from 'wagmi/actions'

import { VERSION_ABIS } from '../abi/versionAbis'

export async function getTokenPermitVersion(tokenAddress: Address, config: Config, index = 0): Promise<string> {
  const abi = VERSION_ABIS[index]

  if (!abi) {
    return '1'
  }

  try {
    const response = (await readContract(config, { abi, address: tokenAddress, functionName: abi[0].name })) as string

    if (response === '0x' || Number.isNaN(Number(response))) {
      return '1'
    }
    if (!response.startsWith('0x')) {
      return response
    }

    const [decoded] = decodeAbiParameters([{ type: 'string' }], response as Hex)
    return decoded
  } catch {
    return getTokenPermitVersion(tokenAddress, config, index + 1)
  }
}
