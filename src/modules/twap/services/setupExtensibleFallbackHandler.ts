import { ExtensibleFallbackContext } from '../hooks/useExtensibleFallbackContext'
import { createExtensibleFallbackSetupTxs } from './createExtensibleFallbackSetupTxs'
import { SendTransactionsResponse } from '@safe-global/safe-apps-sdk/src/types'

export async function setupExtensibleFallbackHandler(
  context: ExtensibleFallbackContext
): Promise<SendTransactionsResponse> {
  const { safeAppsSdk } = context

  const txs = await createExtensibleFallbackSetupTxs(context)
  const response = await safeAppsSdk.txs.send({ txs })

  // TODO: process the sent transaction
  console.log('SET HANDLER: ', response)

  return response
}
