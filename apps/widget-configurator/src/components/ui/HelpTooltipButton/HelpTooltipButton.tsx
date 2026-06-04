import { ReactNode } from 'react'

import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

interface HelpTooltipButtonProps {
  ariaLabel: string
  tooltip: ReactNode
}

export function HelpTooltipButton({ ariaLabel, tooltip }: HelpTooltipButtonProps): ReactNode {
  return (
    <Tooltip
      arrow
      placement="top"
      title={tooltip}
      slotProps={{
        tooltip: {
          sx: {
            maxWidth: 'min(24rem, calc(100vw - 3.2rem))',
          },
        },
      }}
    >
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
        <IconButton aria-label={ariaLabel} size="small" sx={{ p: 0.25 }}>
          <HelpOutlineIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </Tooltip>
  )
}
