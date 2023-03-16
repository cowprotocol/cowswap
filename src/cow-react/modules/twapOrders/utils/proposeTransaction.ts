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
  // const senderSignature = await safe.signTransactionHash(safeTxHash)

  const owner = (await safe.getOwners())[0]
  const senderSignature = await (window.ethereum as any).request({
    method: 'personal_sign',
    params: [owner, safeTxHash],
  })
  const v = senderSignature.slice(senderSignature.length - 2, senderSignature.length)
  const fixedSign = senderSignature.slice(0, -2) + (+('0x' + v) + 4).toString(16)

  await safeService.proposeTransaction({
    safeAddress: safe.getAddress(),
    safeTransactionData: tx.data,
    safeTxHash,
    senderAddress: owner,
    senderSignature: fixedSign,
  })

  console.log(`Submitted Transaction hash: ${safeTxHash}`)
}
