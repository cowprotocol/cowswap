import { SignatureVerifierMuxerAbi } from '@cowprotocol/cowswap-abis'
import type { MetaTransactionData } from '@safe-global/types-kit'

import { encodeFunctionData } from 'viem'
import { readContract } from 'wagmi/actions'

import { COMPOSABLE_COW_ADDRESS, SAFE_EXTENSIBLE_HANDLER_ADDRESS } from 'modules/advancedOrders/const'

import { ExtensibleFallbackContext } from '../hooks/useExtensibleFallbackContext'

export async function extensibleFallbackSetupTxs(context: ExtensibleFallbackContext): Promise<MetaTransactionData[]> {
  const { chainId, config, safeAddress, settlementContract } = context

  const domainSeparator = await readContract(config, {
    abi: settlementContract.abi,
    address: settlementContract.address as `0x${string}`,
    functionName: 'domainSeparator',
  })

  const composableCowContractAddress = COMPOSABLE_COW_ADDRESS[chainId]
  const extensibleHandlerAddress = SAFE_EXTENSIBLE_HANDLER_ADDRESS[chainId]

  const setFallbackHandlerTx = {
    to: safeAddress,
    data: encodeFunctionData({
      abi: SignatureVerifierMuxerAbi,
      functionName: 'setFallbackHandler',
      args: [extensibleHandlerAddress as `0x${string}`],
    }),
    value: '0',
    operation: 0,
  }

  const setDomainVerifierTx = {
    to: safeAddress,
    data: encodeFunctionData({
      abi: SignatureVerifierMuxerAbi,
      functionName: 'setDomainVerifier',
      args: [domainSeparator, composableCowContractAddress as `0x${string}`],
    }),
    value: '0',
    operation: 0,
  }

  return [setFallbackHandlerTx, setDomainVerifierTx]
}
