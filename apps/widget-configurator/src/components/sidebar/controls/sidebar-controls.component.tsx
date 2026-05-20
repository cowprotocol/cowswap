import { ReactNode } from 'react'

import { Box, IconButton } from '@mui/material'
import { ChevronLeft, ChevronRight } from 'react-feather'

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
        aria-hidden={isSidebarOpen}
        tabIndex={isSidebarOpen ? -1 : 0}
        onClick={toggleSidebarOpen}
        sx={sidebarToggleOpenButton}
      >
        {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
      </IconButton>

      {isSidebarOpen ? (
        <Box role="separator" aria-label="Resize sidebar" onPointerDown={onResizeStart} sx={sidebarResizeHandle} />
      ) : null}
    </Box>
  )
}
