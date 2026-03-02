import { namehash, normalize } from 'viem/ens'
import { readContract } from 'wagmi/actions'

import type { Config } from 'wagmi'

const REGISTRAR_ABI = [
  {
    constant: true,
    inputs: [
      {
        name: 'node',
        type: 'bytes32',
      },
    ],
    name: 'resolver',
    outputs: [
      {
        name: 'resolverAddress',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
] as const
const REGISTRAR_ADDRESS = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'

const RESOLVER_ABI = [
  {
    constant: true,
    inputs: [
      {
        internalType: 'bytes32',
        name: 'node',
        type: 'bytes32',
      },
    ],
    name: 'contenthash',
    outputs: [
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
] as const

/**
 * Fetches and decodes the result of an ENS contenthash lookup on mainnet to a URI
 * @param ensName to resolve
 * @param provider provider to use to fetch the data
 */
export async function resolveENSContentHash(ensName: string, config: Config): Promise<string> {
  const hash = namehash(normalize(ensName))
  const resolverAddress = await readContract(config, {
    abi: REGISTRAR_ABI,
    address: REGISTRAR_ADDRESS,
    functionName: 'resolver',
    args: [hash],
  })
  return readContract(config, {
    abi: RESOLVER_ABI,
    address: resolverAddress,
    functionName: 'contenthash',
    args: [hash],
  })
}
