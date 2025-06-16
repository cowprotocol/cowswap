import type { MetaTransactionData } from '@safe-global/safe-core-sdk-types'

import { COMPOSABLE_COW_ADDRESS, SAFE_EXTENSIBLE_HANDLER_ADDRESS } from 'modules/advancedOrders/const'

import { getSignatureVerifierContract } from './getSignatureVerifierContract'

import { ExtensibleFallbackContext } from '../hooks/useExtensibleFallbackContext'

export async function extensibleFallbackSetupTxs(context: ExtensibleFallbackContext): Promise<MetaTransactionData[]> {
  const { chainId, safeAddress, settlementContract } = context

  const domainSeparator = await settlementContract.callStatic.domainSeparator()

  const signatureVerifierContract = await getSignatureVerifierContract(context)
  const composableCowContractAddress = COMPOSABLE_COW_ADDRESS[chainId]
  const extensibleHandlerAddress = SAFE_EXTENSIBLE_HANDLER_ADDRESS[chainId]

  const setFallbackHandlerTx = {
    to: safeAddress,
    data: signatureVerifierContract.interface.encodeFunctionData('setFallbackHandler', [extensibleHandlerAddress]),
    value: '0',
    operation: 0,
  }

  const setDomainVerifierTx = {
    to: safeAddress,
    data: signatureVerifierContract.interface.encodeFunctionData('setDomainVerifier', [
      domainSeparator,
      composableCowContractAddress,
    ]),
    value: '0',
    operation: 0,
  }

  return [setFallbackHandlerTx, setDomainVerifierTx]
}
