import { SignatureVerifierMuxerAbi, SignatureVerifierMuxer } from '@cowprotocol/abis'
import { Contract } from '@ethersproject/contracts'

import { ExtensibleFallbackContext } from '../hooks/useExtensibleFallbackContext'

export async function getSignatureVerifierContract(
  context: ExtensibleFallbackContext
): Promise<SignatureVerifierMuxer> {
  const { safeAddress, provider } = context

  return new Contract(safeAddress, SignatureVerifierMuxerAbi, provider) as SignatureVerifierMuxer
}
