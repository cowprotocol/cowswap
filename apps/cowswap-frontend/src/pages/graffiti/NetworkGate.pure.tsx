import type { ReactNode } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'

import { styles } from './wall.styled'

export interface NetworkGateProps {
  chainId: SupportedChainId
  switching: boolean
  onSwitch: () => void
}

const panelStyle = {
  ...styles.panel,
  maxWidth: 460,
  margin: '10vh auto',
  textAlign: 'center' as const,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 14,
  alignItems: 'center',
}

/** Painting needs the Solana network: shown while the wallet is on an EVM chain. */
export function NetworkGate({ chainId, switching, onSwitch }: NetworkGateProps): ReactNode {
  return (
    <div style={{ ...styles.page, height: 'auto' }}>
      <div style={panelStyle}>
        <span style={{ fontSize: 40 }}>🖍</span>
        <h2 style={{ margin: 0, color: '#fff', letterSpacing: 1 }}>GRAFFITI WALL</h2>
        <p style={{ color: '#b8b8cc', margin: 0, lineHeight: 1.5 }}>
          Welcome! This wall is painted with <strong style={{ color: '#00ffa3' }}>MOOOXELS</strong>, a Solana token —
          every painted cell burns 1 MOOOXELS.
          <br />
          You&apos;re currently on <strong style={{ color: '#fff' }}>{getChainInfo(chainId).name.toUpperCase()}</strong>
          . Select the <strong style={{ color: '#00ffa3' }}>Solana</strong> network to start painting.
        </p>
        <button style={{ ...styles.primaryButton, minWidth: 240 }} disabled={switching} onClick={onSwitch}>
          {switching ? 'Switching…' : '→ Switch to Solana (devnet)'}
        </button>
        <span style={{ color: '#66667f', fontSize: 12 }}>or pick Solana from the network selector in the header</span>
      </div>
    </div>
  )
}
