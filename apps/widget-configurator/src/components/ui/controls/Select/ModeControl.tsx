import { ChangeEvent, ReactNode } from 'react'

import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { HelpTooltipButton } from '../../HelpTooltipButton/HelpTooltipButton'

type WidgetMode = 'dapp' | 'standalone'

interface ModeControlProps {
  value: WidgetMode
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export function ModeControl({ value, onChange }: ModeControlProps): ReactNode {
  const tooltipContent = (
    <Stack divider={<Divider flexItem />} spacing={1.2}>
      <Typography sx={{ fontSize: '1.2rem', lineHeight: 1.45 }}>
        <Box component="span" sx={{ fontWeight: 600 }}>
          Dapp mode:
        </Box>{' '}
        the host app provides the wallet connection and network switching.
      </Typography>
      <Typography sx={{ fontSize: '1.2rem', lineHeight: 1.45 }}>
        <Box component="span" sx={{ fontWeight: 600 }}>
          Standalone mode:
        </Box>{' '}
        the widget uses its own wallet provider and shows its own connect wallet controls.
      </Typography>
    </Stack>
  )

  return (
    <FormControl component="fieldset">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
        <FormLabel component="legend" sx={{ mb: 0 }}>
          Mode
        </FormLabel>
        <HelpTooltipButton ariaLabel="Explain widget modes" tooltip={tooltipContent} />
      </Box>
      <RadioGroup row aria-label="mode" name="mode" value={value} onChange={onChange}>
        <FormControlLabel value="dapp" control={<Radio />} label="Dapp mode" />
        <FormControlLabel value="standalone" control={<Radio />} label="Standalone mode" />
      </RadioGroup>
    </FormControl>
  )
}
