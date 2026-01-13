import { ReactNode } from 'react'

import { BackButton } from '@cowprotocol/ui'

import * as styledEl from './styled'

export interface ChainPanelHeaderProps {
  title: string
  variant: 'default' | 'fullscreen'
  onClose?: () => void
}

export function ChainPanelHeader({ title, variant, onClose }: ChainPanelHeaderProps): ReactNode {
  const isFullscreen = variant === 'fullscreen'

  return (
    <styledEl.PanelHeader $isFullscreen={isFullscreen}>
      {isFullscreen && onClose ? <BackButton onClick={onClose} /> : null}
      <styledEl.PanelTitle $isFullscreen={isFullscreen}>{title}</styledEl.PanelTitle>
      {isFullscreen && onClose ? <span /> : null}
    </styledEl.PanelHeader>
  )
}
