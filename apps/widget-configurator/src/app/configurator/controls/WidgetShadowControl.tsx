import { ReactNode, useEffect, useMemo, useState } from 'react'

import { PaletteMode } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { DEFAULT_WIDGET_SHADOW } from '../consts'

type ShadowMode = 'default' | 'none' | 'custom'

interface WidgetShadowControlProps {
  value: string
  mode: PaletteMode
  onChange(value: string): void
}

function getThemeDefaultShadow(mode: PaletteMode): string {
  return mode === 'dark' ? DEFAULT_WIDGET_SHADOW.dark : DEFAULT_WIDGET_SHADOW.light
}

function getShadowMode(value: string): ShadowMode {
  if (!value) return 'default'
  if (value === 'none') return 'none'

  return 'custom'
}

export function WidgetShadowControl({ value, mode, onChange }: WidgetShadowControlProps): ReactNode {
  const themeDefaultShadow = useMemo(() => getThemeDefaultShadow(mode), [mode])
  const [shadowMode, setShadowMode] = useState<ShadowMode>(() => getShadowMode(value))

  useEffect(() => {
    setShadowMode(getShadowMode(value))
  }, [value])

  const handleModeSelect = (nextMode: ShadowMode): void => {
    setShadowMode(nextMode)

    if (nextMode === 'default') {
      onChange('')

      return
    }

    if (nextMode === 'none') {
      onChange('none')

      return
    }

    if (!value || value === 'none') {
      onChange(themeDefaultShadow)
    }
  }

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 0.8 }}>
        Widget shadow
      </Typography>
      <Typography color="text.secondary" variant="body2" sx={{ mb: 1.2 }}>
        Theme default: {themeDefaultShadow}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: shadowMode === 'custom' ? 1.2 : 0 }}>
        <Button
          onClick={() => handleModeSelect('default')}
          size="small"
          variant={shadowMode === 'default' ? 'contained' : 'outlined'}
        >
          Default
        </Button>
        <Button
          onClick={() => handleModeSelect('none')}
          size="small"
          variant={shadowMode === 'none' ? 'contained' : 'outlined'}
        >
          None
        </Button>
        <Button
          onClick={() => handleModeSelect('custom')}
          size="small"
          variant={shadowMode === 'custom' ? 'contained' : 'outlined'}
        >
          Custom
        </Button>
      </Stack>
      <Collapse in={shadowMode === 'custom'} unmountOnExit>
        <TextField
          fullWidth
          id="boxShadow"
          label="Custom widget shadow"
          helperText="Accepts any valid CSS box-shadow value."
          placeholder={themeDefaultShadow}
          size="small"
          value={value === 'none' ? '' : value}
          onChange={(event) => onChange(event.target.value)}
        />
      </Collapse>
    </Box>
  )
}
