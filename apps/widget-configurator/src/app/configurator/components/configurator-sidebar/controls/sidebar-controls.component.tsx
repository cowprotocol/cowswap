import { ReactNode } from 'react'

import { Box, IconButton } from '@mui/material'

import {
  sidebarControlsZeroWidthColumnSx,
  sidebarToggleOpenButton,
  sidebarResizeHandle,
} from './sidebar-controls.styles'

export interface SidebarControlsProps {
  isSidebarOpen: boolean
  toggleSidebarOpen: () => void
  onResizeStart: (event: React.PointerEvent<HTMLDivElement>) => void
}

export function SidebarControls({ isSidebarOpen, toggleSidebarOpen, onResizeStart }: SidebarControlsProps): ReactNode {
  return (
    <Box sx={sidebarControlsZeroWidthColumnSx}>
      <IconButton
        title={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        aria-label={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        onClick={toggleSidebarOpen}
        sx={sidebarToggleOpenButton}
      >
        {isSidebarOpen ? '<' : '>'}
      </IconButton>

      {isSidebarOpen ? (
        <Box role="separator" aria-label="Resize sidebar" onPointerDown={onResizeStart} sx={sidebarResizeHandle} />
      ) : null}
    </Box>
  )
}
