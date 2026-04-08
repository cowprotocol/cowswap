import { ReactNode } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { HelpTooltipButton } from './HelpTooltipButton'

interface SettingHeadingProps {
  title: string
  tooltip: string
}

export function SettingHeading({ title, tooltip }: SettingHeadingProps): ReactNode {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.8 }}>
      <Typography variant="subtitle2">{title}</Typography>
      <HelpTooltipButton ariaLabel={`Explain ${title}`} tooltip={tooltip} />
    </Box>
  )
}
