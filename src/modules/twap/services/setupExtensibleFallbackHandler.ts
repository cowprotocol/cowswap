import { ExtensibleFallbackContext } from '../hooks/useExtensibleFallbackContext'
import { extensibleFallbackSetupTxs } from './extensibleFallbackSetupTxs'
import { SendTransactionsResponse } from '@safe-global/safe-apps-sdk'

export async function setupExtensibleFallbackHandler(
  context: ExtensibleFallbackContext
): Promise<SendTransactionsResponse> {
  const { safeAppsSdk } = context

  const txs = await extensibleFallbackSetupTxs(context)
  const response = await safeAppsSdk.txs.send({ txs })

  // TODO: process the sent transaction
  console.log('SET HANDLER: ', response)

  return response
}
