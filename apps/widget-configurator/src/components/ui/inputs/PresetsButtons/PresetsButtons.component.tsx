import { ReactNode } from 'react'

import { Box } from '@mui/material'

import { SmallButton } from '../../buttons/small/SmallButton.component'

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
        <SmallButton key={preset.value} label={preset.label} onClick={() => onPresetClick(preset.value)} />
      ))}
    </Box>
  )
}
