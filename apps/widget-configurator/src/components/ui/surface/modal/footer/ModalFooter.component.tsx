import { ReactNode } from 'react'

import Box from '@mui/material/Box'

export interface ModalFooterProps {
  children: ReactNode
}

export function ModalFooter({ children }: ModalFooterProps): ReactNode {
  return (
    <Box
      sx={{
        borderTop: 1,
        borderColor: 'divider',
        px: 2,
        py: 2,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 1,
        flexShrink: 0,
      }}
    >
      {children}
    </Box>
  )
}
