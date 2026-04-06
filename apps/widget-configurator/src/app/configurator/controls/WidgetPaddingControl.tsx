import { ReactNode, useEffect, useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

const DEFAULT_WIDGET_PADDING = '16px 16px 24px'

type PaddingMode = 'default' | 'custom'

interface WidgetPaddingControlProps {
  value: string
  onChange(value: string): void
}

export function WidgetPaddingControl({ value, onChange }: WidgetPaddingControlProps): ReactNode {
  const [paddingMode, setPaddingMode] = useState<PaddingMode>(value ? 'custom' : 'default')

  useEffect(() => {
    setPaddingMode(value ? 'custom' : 'default')
  }, [value])

  const handleModeSelect = (nextMode: PaddingMode): void => {
    setPaddingMode(nextMode)

    if (nextMode === 'default') {
      onChange('')

      return
    }

    if (!value) {
      onChange(DEFAULT_WIDGET_PADDING)
    }
  }

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 0.8 }}>
        Widget padding
      </Typography>
      <Typography color="text.secondary" variant="body2" sx={{ mb: 1.2 }}>
        Default: {DEFAULT_WIDGET_PADDING}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: paddingMode === 'custom' ? 1.2 : 0 }}>
        <Button
          onClick={() => handleModeSelect('default')}
          size="small"
          variant={paddingMode === 'default' ? 'contained' : 'outlined'}
        >
          Default
        </Button>
        <Button
          onClick={() => handleModeSelect('custom')}
          size="small"
          variant={paddingMode === 'custom' ? 'contained' : 'outlined'}
        >
          Custom
        </Button>
      </Stack>
      <Collapse in={paddingMode === 'custom'} unmountOnExit>
        <TextField
          fullWidth
          id="widgetPadding"
          label="Custom widget padding"
          helperText="Accepts any valid CSS padding value. Use 0 for a flush embed."
          placeholder={DEFAULT_WIDGET_PADDING}
          size="small"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </Collapse>
    </Box>
  )
}
