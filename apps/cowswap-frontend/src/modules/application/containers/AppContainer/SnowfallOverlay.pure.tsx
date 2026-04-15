import type { CSSProperties, ReactNode } from 'react'

import Snowfall from 'react-snowfall'

interface SnowfallOverlayProps {
  show: boolean
  isMobile: boolean
  darkMode: boolean
}

const SNOWFALL_STYLE: CSSProperties = {
  position: 'fixed',
  width: '100vw',
  height: '100vh',
  zIndex: 3,
  pointerEvents: 'none',
  top: 0,
  left: 0,
}

export function SnowfallOverlay({ show, isMobile, darkMode }: SnowfallOverlayProps): ReactNode {
  if (!show) {
    return null
  }

  const snowflakeCount = isMobile ? 25 : darkMode ? 75 : 200

  return (
    <Snowfall
      style={SNOWFALL_STYLE}
      snowflakeCount={snowflakeCount}
      radius={[0.5, 2.0]}
      speed={[0.5, 2.0]}
      wind={[-0.5, 1.0]}
    />
  )
}
