import { ReactNode } from 'react'

import Box from '@mui/material/Box'

import { modalTabId, modalTabPanelId } from './ModalTabs.component'

import type { SxProps, Theme } from '@mui/material/styles'

export interface ModalTabPanelProps<TValue extends string = string> {
  children?: ReactNode
  tabValue: TValue
  value: TValue
  idPrefix: string
  sx?: SxProps<Theme>
}

export function ModalTabPanel<TValue extends string>({
  children,
  tabValue,
  value,
  idPrefix,
  sx,
}: ModalTabPanelProps<TValue>): ReactNode {
  return (
    <Box
      role="tabpanel"
      hidden={tabValue !== value}
      id={modalTabPanelId(idPrefix, value)}
      aria-labelledby={modalTabId(idPrefix, value)}
      sx={sx}
    >
      {tabValue === value && children}
    </Box>
  )
}
