import { ExtensibleFallbackContext } from '../hooks/useExtensibleFallbackContext'
import { COMPOSABLE_COW_ADDRESS } from 'modules/advancedOrders/const'
import { getSignatureVerifierContract } from './getSignatureVerifierContract'

export async function verifySafeExtensibleFallback(context: ExtensibleFallbackContext): Promise<boolean> {
  const { chainId, safeAppsSdk, settlementContract } = context
  const composableCowContractAddress = COMPOSABLE_COW_ADDRESS[chainId]
  const { safeAddress } = await safeAppsSdk.safe.getInfo()
  const domainSeparator = await settlementContract.callStatic.domainSeparator()

  const signatureVerifierContract = await getSignatureVerifierContract(context)

  try {
    const domainVerifier = await signatureVerifierContract.callStatic.domainVerifiers(safeAddress, domainSeparator)

    return domainVerifier.toLowerCase() === composableCowContractAddress.toLowerCase()
  } catch (e) {
    return false
  }
}
