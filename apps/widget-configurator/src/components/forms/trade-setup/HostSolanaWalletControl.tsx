import { useCallback, useState, type ReactNode } from 'react'

import { Alert, Box, Button, Typography } from '@mui/material'

import { useHostSolanaWallet, useHostSolanaWalletControls } from '../../../hooks/useHostSolanaWallet'

/**
 * Stands in for the partner's own Solana connect button.
 *
 * Dapp mode means the host app owns the wallet, so the configurator has to connect one itself and
 * hand it to the widget as `solanaProvider` — exactly what an integrator would do.
 */
export function HostSolanaWalletControl(): ReactNode {
  const { address } = useHostSolanaWallet()
  const { openConnectModal, disconnect } = useHostSolanaWalletControls()
  const [error, setError] = useState<string | null>(null)

  const handleDisconnect = useCallback(() => {
    setError(null)
    disconnect().catch(() => setError('Could not disconnect the Solana wallet.'))
  }, [disconnect])

  return (
    <Box>
      {error ? (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      ) : null}

      {address ? (
        <>
          <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
            Host Solana wallet: {shortenAddress(address)}
          </Typography>
          <Button size="small" variant="outlined" onClick={handleDisconnect}>
            Disconnect Solana wallet
          </Button>
        </>
      ) : (
        <Button size="small" variant="outlined" onClick={openConnectModal}>
          Connect Solana wallet
        </Button>
      )}
    </Box>
  )
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`
}
