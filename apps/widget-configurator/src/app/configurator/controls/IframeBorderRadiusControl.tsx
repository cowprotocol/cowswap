import { ReactNode, useEffect, useState } from 'react'

import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { SettingHeading } from './SettingHeading'

import { DEFAULT_IFRAME_BORDER_RADIUS } from '../consts'

const TOOLTIP_TITLE =
  'Controls the border radius of the outer iFrame element. It does not change the inner widget card radius.'

type IframeBorderRadiusMode = 'default' | 'custom'

interface IframeBorderRadiusControlProps {
  value: string
  onChange(value: string): void
}

function getRadiusMode(value: string): IframeBorderRadiusMode {
  return value === DEFAULT_IFRAME_BORDER_RADIUS ? 'default' : 'custom'
}

export function IframeBorderRadiusControl({ value, onChange }: IframeBorderRadiusControlProps): ReactNode {
  const [radiusMode, setRadiusMode] = useState<IframeBorderRadiusMode>(() => getRadiusMode(value))

  useEffect(() => {
    setRadiusMode(getRadiusMode(value))
  }, [value])

  const handleModeSelect = (nextMode: IframeBorderRadiusMode): void => {
    setRadiusMode(nextMode)

    if (nextMode === 'default') {
      onChange(DEFAULT_IFRAME_BORDER_RADIUS)

      return
    }

    if (!value || value === DEFAULT_IFRAME_BORDER_RADIUS) {
      onChange('0')
    }
  }

  const handleBlur = (): void => {
    if (radiusMode === 'custom' && !value.trim()) {
      onChange('0')
    }
  }

  return (
    <div>
      <SettingHeading title="iFrame border radius" tooltip={TOOLTIP_TITLE} />
      <Typography color="text.secondary" variant="body2" sx={{ mb: 1.2 }}>
        Default: {DEFAULT_IFRAME_BORDER_RADIUS}
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
          id="iframeBorderRadius"
          label="Custom iFrame border radius"
          helperText="Accepts any valid CSS border-radius value. Use 0 for a flush embed."
          placeholder={DEFAULT_IFRAME_BORDER_RADIUS}
          size="small"
          value={radiusMode === 'default' ? '' : value}
          onBlur={handleBlur}
          onChange={(event) => onChange(event.target.value)}
        />
      </Collapse>
    </div>
  )
}
