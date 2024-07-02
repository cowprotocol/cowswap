import { getAddress } from '@ethersproject/address'
import type { JsonRpcProvider } from '@ethersproject/providers'


import { getContract } from './getContract'

import Erc20Abi from '../abi/erc20.json'

// See https://eips.ethereum.org/EIPS/eip-5267

export async function getEip712Domain(
  tokenAddress: string,
  chainId: number,
  provider: JsonRpcProvider
): Promise<Eip712Domain> {
  const formattedAddress = getAddress(tokenAddress)
  const erc20Contract = getContract(formattedAddress, Erc20Abi, provider)

  const eip5267Domain: Required<Eip5267Return> = await erc20Contract.callStatic['eip712Domain']()

  return processDomain(eip5267Domain, chainId, tokenAddress)
}

type Eip5267Return = {
  fields: string
  name?: string
  version?: string
  chainId?: string
  verifyingContract?: string
  salt?: string
  extensions?: string[]
}

export type Eip712Domain = Omit<Eip5267Return, 'fields' | 'extensions'>

/** Retrieves the EIP-712 domain of a contract using EIP-5267 without extensions.
 *
 * Derived from https://eips.ethereum.org/EIPS/eip-5267 reference Javascript implementation
 **/
async function processDomain(domain: Required<Eip5267Return>, chainId: number, address: string): Promise<Eip712Domain> {
  const { extensions, ...rest } = domain

  if (extensions.length > 0) {
    throw Error('Extensions not implemented')
  }

  if (rest.chainId && chainId !== parseInt(rest.chainId, 16)) {
    throw Error(`ChainId mismatch. Received: '${rest.chainId}', expected: '${chainId}'`)
  }

  if (rest.verifyingContract && address.toLowerCase() !== rest.verifyingContract.toLowerCase()) {
    throw Error(`Address mismatch. Received: '${rest.verifyingContract}', expected: '${address}'`)
  }

  return buildBasicDomain(rest)
}

const FIELD_NAMES = ['name', 'version', 'chainId', 'verifyingContract', 'salt']

/** Builds a domain object without extensions based on the return values of `eip712Domain()`. */
function buildBasicDomain(domain: Required<Omit<Eip5267Return, 'extensions'>>): Eip712Domain {
  // Will be a 5bit number as a hex string
  const fields = parseInt(domain.fields, 16)

  return FIELD_NAMES.reduce<Eip712Domain>((acc, field, i) => {
    if (fields & (1 << i)) {
      acc[field as keyof Eip712Domain] = domain[field as keyof Omit<Eip5267Return, 'extensions'>]
    }
    return acc
  }, {})
}
