import { useEffect } from 'react'

import { IS_SOLANA_WALLET_ENABLED } from '../constants'
import { connectWidgetSolanaWallet } from '../solana/connectWidgetSolanaWallet'
import { registerWidgetSolanaWallet } from '../solana/registerWidgetSolanaWallet'

interface WidgetSolanaDappModeUpdaterProps {
  standaloneMode: boolean | undefined
}

/**
 * Lends the host dapp's Solana wallet to the widget while it runs in dapp mode.
 *
 * `IS_SOLANA_WALLET_ENABLED` is read from the iframe URL at module load, and in dapp mode
 * widget-lib only writes that flag when the host actually passed a `solanaProvider` — so the two
 * conditions together mean there is a host wallet waiting on the other side of the transport.
 *
 * Standalone mode never registers the wallet, which keeps it out of the connect modal: there the
 * user picks their own Solana wallet and the host has no business signing for them.
 *
 * Renders nothing.
 */
export function WidgetSolanaDappModeUpdater({ standaloneMode }: WidgetSolanaDappModeUpdaterProps): null {
  useEffect(() => {
    if (!IS_SOLANA_WALLET_ENABLED || standaloneMode !== false) return undefined

    registerWidgetSolanaWallet()

    return connectWidgetSolanaWallet()
  }, [standaloneMode])

  return null
}
