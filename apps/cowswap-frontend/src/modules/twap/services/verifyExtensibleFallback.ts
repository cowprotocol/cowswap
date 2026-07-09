import { areAddressesEqual } from '@cowprotocol/cow-sdk'
import { SignatureVerifierMuxerAbi } from '@cowprotocol/cowswap-abis'

import { readContract } from 'wagmi/actions'

import { COMPOSABLE_COW_ADDRESS } from 'modules/advancedOrders/const'

import { ExtensibleFallbackContext } from '../hooks/useExtensibleFallbackContext'

export enum ExtensibleFallbackVerification {
  HAS_EXTENSIBLE_FALLBACK = 'HAS_EXTENSIBLE_FALLBACK',
  HAS_DOMAIN_VERIFIER = 'HAS_DOMAIN_VERIFIER',
  HAS_NOTHING = 'HAS_NOTHING',
}

/**
 * The function verifies if a safe has ExtensibleFallback and contains ComposableCow contract as domain verifier
 */
export async function verifyExtensibleFallback(
  context: ExtensibleFallbackContext,
): Promise<ExtensibleFallbackVerification> {
  const { chainId, config, safeAddress, settlementContract } = context
  const composableCowContractAddress = COMPOSABLE_COW_ADDRESS[chainId]

  try {
    const domainSeparator = await readContract(config, {
      abi: settlementContract.abi,
      address: settlementContract.address as `0x${string}`,
      functionName: 'domainSeparator',
    })

    const domainVerifier = await readContract(config, {
      abi: SignatureVerifierMuxerAbi,
      address: safeAddress as `0x${string}`,
      functionName: 'domainVerifiers',
      args: [safeAddress as `0x${string}`, domainSeparator],
    })

    if (areAddressesEqual(domainVerifier, composableCowContractAddress)) {
      return ExtensibleFallbackVerification.HAS_DOMAIN_VERIFIER
    }

    return ExtensibleFallbackVerification.HAS_EXTENSIBLE_FALLBACK
  } catch (e) {
    console.log('FALLBACK HANDLER CHECKED, error: ', e)
    return ExtensibleFallbackVerification.HAS_NOTHING
  }
}
