import { useCallback } from 'react'

import { logWallet, normalizeError } from '@cowprotocol/common-utils'

import { clearStaleConnectorIds } from '../../reown/clearStaleConnectorIds'
import { reownAppKit } from '../../wagmi/config'

export function useOpenWalletConnectionModal(): () => void {
  return useCallback(() => {
    clearStaleConnectorIds()
    reownAppKit.open().catch((err: unknown) => {
      logWallet.error(new Error('Failed to open the wallet connection modal', { cause: normalizeError(err) }))
    })
  }, [])
}
