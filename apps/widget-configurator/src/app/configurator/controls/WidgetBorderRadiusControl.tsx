import { ReactNode, useEffect, useState } from 'react'

import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { SettingHeading } from './SettingHeading'

import { DEFAULT_WIDGET_BORDER_RADIUS } from '../consts'

const TOOLTIP_TITLE =
  'Overrides the border radius of the main inner widget card. It does not change the outer iFrame border radius.'

type WidgetBorderRadiusMode = 'default' | 'custom'

interface WidgetBorderRadiusControlProps {
  value: string
  onChange(value: string): void
}

export function WidgetBorderRadiusControl({ value, onChange }: WidgetBorderRadiusControlProps): ReactNode {
  const [radiusMode, setRadiusMode] = useState<WidgetBorderRadiusMode>(value ? 'custom' : 'default')

  useEffect(() => {
    setRadiusMode(value ? 'custom' : 'default')
  }, [value])

  const handleModeSelect = (nextMode: WidgetBorderRadiusMode): void => {
    setRadiusMode(nextMode)

    if (nextMode === 'default') {
      onChange('')

      return
    }

    if (!value) {
      onChange(DEFAULT_WIDGET_BORDER_RADIUS)
    }
  }

  return (
    <div>
      <SettingHeading title="Widget corner radius" tooltip={TOOLTIP_TITLE} />
      <Typography color="text.secondary" variant="body2" sx={{ mb: 1.2 }}>
        Default: {DEFAULT_WIDGET_BORDER_RADIUS}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: radiusMode === 'custom' ? 1.2 : 0 }}>
        <Button
          onClick={() => handleModeSelect('default')}
          size="small"
          variant={radiusMode === 'default' ? 'contained' : 'outlined'}
        >
          Default
        </Button>
        <Button
          onClick={() => handleModeSelect('custom')}
          size="small"
          variant={radiusMode === 'custom' ? 'contained' : 'outlined'}
        >
          Custom
        </Button>
      </Stack>
      <Collapse in={radiusMode === 'custom'} unmountOnExit>
        <TextField
          fullWidth
          id="widgetBorderRadius"
          label="Custom widget corner radius"
          helperText="Accepts any valid CSS border-radius value, for example 24px or 1.5rem."
          placeholder={DEFAULT_WIDGET_BORDER_RADIUS}
          size="small"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </Collapse>
    </div>
  )
}
