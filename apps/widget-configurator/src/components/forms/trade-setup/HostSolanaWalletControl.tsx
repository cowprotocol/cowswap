import { useCallback, useState, type ReactNode } from 'react'

import { Alert, Box, Button, Stack, Typography } from '@mui/material'

import {
  useHostSolanaWallet,
  useHostSolanaWalletControls,
  type NamedStandardWallet,
} from '../../../hooks/useHostSolanaWallet'

/**
 * Stands in for the partner's own Solana connect button.
 *
 * Dapp mode means the host app owns the wallet, so the configurator has to connect one itself and
 * hand it to the widget as `solanaProvider` — exactly what an integrator would do.
 */
export function HostSolanaWalletControl(): ReactNode {
  const { address, name } = useHostSolanaWallet()
  const { connect, disconnect, wallets } = useHostSolanaWalletControls()
  const [error, setError] = useState<string | null>(null)

  const handleConnect = useCallback(
    (wallet: NamedStandardWallet) => {
      setError(null)
      connect(wallet).catch((err: unknown) => {
        setError(err instanceof Error ? err.message : `Could not connect ${wallet.name}.`)
      })
    },
    [connect],
  )

  const handleDisconnect = useCallback(() => {
    setError(null)
    disconnect().catch(() => setError('Could not disconnect the Solana wallet.'))
  }, [disconnect])

  if (address) {
    return (
      <Box>
        <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
          Host Solana wallet: {name} ({shortenAddress(address)})
        </Typography>
        <Button size="small" variant="outlined" onClick={handleDisconnect}>
          Disconnect Solana wallet
        </Button>
      </Box>
    )
  }

  if (wallets.length === 0) {
    return (
      <Alert severity="info">
        No Solana wallet detected in this browser. Install one (Phantom, Solflare, …) and reload to test dapp mode.
      </Alert>
    )
  }

  return (
    <Box>
      {error ? (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      ) : null}
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {wallets.map((wallet) => (
          <Button key={wallet.name} size="small" variant="outlined" onClick={() => handleConnect(wallet)}>
            Connect {wallet.name}
          </Button>
        ))}
      </Stack>
    </Box>
  )
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`
}
