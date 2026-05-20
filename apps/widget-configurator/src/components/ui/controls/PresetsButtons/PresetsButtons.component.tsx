import { ReactNode } from 'react'

import { Button, Box } from '@mui/material'

export interface PresetOption {
  label: string
  value: string
}

export interface PresetsButtonsProps {
  presets: PresetOption[]
  onPresetClick: (value: string) => void
}

export function PresetsButtons({ presets, onPresetClick }: PresetsButtonsProps): ReactNode {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}>
      {presets.map((preset) => (
        <Button
          key={preset.value}
          type="button"
          variant="text"
          size="medium"
          onClick={() => onPresetClick(preset.value)}
          sx={{
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
            p: 1,
            fontSize: '12px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            color: 'text.primary',
            height: 32,
            minWidth: 32,
          }}
        >
          {preset.label}{' '}
        </Button>
      ))}
    </Box>
  )
}
