import { Contract } from '@ethersproject/contracts'

import SignatureVerifierMuxerABI from 'abis/SignatureVerifierMuxer.json'
import { SignatureVerifierMuxer } from 'abis/types'

import { ExtensibleFallbackContext } from '../hooks/useExtensibleFallbackContext'

export async function getSignatureVerifierContract(
  context: ExtensibleFallbackContext
): Promise<SignatureVerifierMuxer> {
  const { safeAppsSdk, provider } = context
  const { safeAddress } = await safeAppsSdk.safe.getInfo()

  return new Contract(safeAddress, SignatureVerifierMuxerABI, provider) as SignatureVerifierMuxer
}
