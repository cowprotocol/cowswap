import { ReactNode } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { X } from 'react-feather'

import { IconButton } from '../../../buttons/icon/IconButton.component'

import type { SxProps, Theme } from '@mui/material/styles'

export interface ModalHeaderProps {
  titleId: string
  title: string
  onClose: () => void
  tabs?: ReactNode
  tabsSx?: SxProps<Theme>
  sx?: SxProps<Theme>
}

export function ModalHeader({ titleId, title, onClose, tabs, tabsSx, sx }: ModalHeaderProps): ReactNode {
  return (
    <Box
      sx={[
        {
          flexShrink: 0,
          borderBottom: 1,
          borderColor: 'divider',
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          px: 2,
          pt: 2,
          pb: 1.5,
        }}
      >
        <Typography id={titleId} component="h2" variant="h6" sx={{ fontWeight: 600, m: 0 }}>
          {title}
        </Typography>
        <IconButton icon={X} aria-label="Close" onClick={onClose} />
      </Box>

      {tabs ? (
        <Box
          sx={[{ borderTop: 1, borderColor: 'divider' }, ...(Array.isArray(tabsSx) ? tabsSx : tabsSx ? [tabsSx] : [])]}
        >
          {tabs}
        </Box>
      ) : null}
    </Box>
  )
}
