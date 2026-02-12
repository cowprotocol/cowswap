import { SignatureVerifierMuxerAbi } from '@cowprotocol/cowswap-abis'
import type { MetaTransactionData } from '@safe-global/types-kit'

import { writeContract } from '@wagmi/core'
import { encodeFunctionData } from 'viem'

import { COMPOSABLE_COW_ADDRESS, SAFE_EXTENSIBLE_HANDLER_ADDRESS } from 'modules/advancedOrders/const'

import { ExtensibleFallbackContext } from '../hooks/useExtensibleFallbackContext'

export async function extensibleFallbackSetupTxs(context: ExtensibleFallbackContext): Promise<MetaTransactionData[]> {
  const { chainId, config, safeAddress, settlementContract } = context

  const domainSeparator = await writeContract(config, {
    abi: settlementContract.abi,
    address: settlementContract.address,
    functionName: 'domainSeparator',
  })

  const composableCowContractAddress = COMPOSABLE_COW_ADDRESS[chainId]
  const extensibleHandlerAddress = SAFE_EXTENSIBLE_HANDLER_ADDRESS[chainId]

  const setFallbackHandlerTx = {
    to: safeAddress,
    data: encodeFunctionData({
      abi: SignatureVerifierMuxerAbi,
      functionName: 'setFallbackHandler',
      args: [extensibleHandlerAddress],
    }),
    value: '0',
    operation: 0,
  }

  const setDomainVerifierTx = {
    to: safeAddress,
    data: encodeFunctionData({
      abi: SignatureVerifierMuxerAbi,
      functionName: 'setDomainVerifier',
      args: [domainSeparator, composableCowContractAddress],
    }),
    value: '0',
    operation: 0,
  }

  return [setFallbackHandlerTx, setDomainVerifierTx]
}
