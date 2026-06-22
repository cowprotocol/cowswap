import { ReactNode } from 'react'

import { CowLoadingIcon } from '@cowprotocol/ui'

import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'

import { LOGO_LOADER_PALETTE } from '../../../theme/palettes.constants'

export function LogoLoader(): ReactNode {
  const {
    palette: { mode: themeMode },
  } = useTheme()

  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        top: 'calc(50% - 14px)',
        left: 'calc(50% - 14px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        transition: 'opacity 300ms ease, visibility 300ms ease',
        background: (theme) => theme.palette.background.paper,
        borderRadius: '8px',
        padding: 0.5,
      }}
    >
      <CowLoadingIcon size={40} palette={LOGO_LOADER_PALETTE[themeMode]} />
    </Box>
  )
}
