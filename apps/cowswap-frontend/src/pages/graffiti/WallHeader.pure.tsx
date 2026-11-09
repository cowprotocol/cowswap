import type { ReactNode } from 'react'

import { styles } from './wall.styled'

import type { CanvasInfo } from './graffiti.service'

export interface WallHeaderProps {
  info: CanvasInfo | null
  wsStatus: 'connected' | 'reconnecting'
  paintersOnline: number | null
  seq: number
}

export function WallHeader({ info, wsStatus, paintersOnline, seq }: WallHeaderProps): ReactNode {
  const live = wsStatus === 'connected'
  const dotColor = live ? '#00ffa3' : '#ffb800'

  return (
    <header style={styles.header}>
      <span style={styles.logo}>🖍 Graffiti Wall</span>
      <span style={styles.tag}>
        {info ? `${info.width}×${info.height}` : '…'} · 1 MOOOXELS per pixel · {info ? info.network : '…'}
      </span>
      <span style={{ flex: 1 }} />
      <span style={{ ...styles.tag, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ ...styles.dot, background: dotColor, boxShadow: `0 0 8px ${dotColor}` }} />
        {live ? `live · ${paintersOnline ?? '…'} painting` : 'reconnecting…'} · seq {seq}
      </span>
    </header>
  )
}
