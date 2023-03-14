import Safe from '@safe-global/safe-core-sdk'
import SafeServiceClient from '@safe-global/safe-service-client'
import { SafeTransaction } from '@safe-global/safe-core-sdk-types'
// eslint-disable-next-line no-restricted-imports
import { ethers } from 'ethers'

export async function proposeTransaction(
  safe: Safe,
  safeService: SafeServiceClient,
  tx: SafeTransaction,
  signer: ethers.Signer
) {
  const safeTxHash = await safe.getTransactionHash(tx)
  const senderSignature = await safe.signTransactionHash(safeTxHash)
  await safeService.proposeTransaction({
    safeAddress: safe.getAddress(),
    safeTransactionData: tx.data,
    safeTxHash,
    senderAddress: await signer.getAddress(),
    senderSignature: senderSignature.data,
  })

  console.log(`Submitted Transaction hash: ${safeTxHash}`)
}
