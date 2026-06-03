import { ReactNode, useState } from 'react'

import { Box, Collapse } from '@mui/material'
import { ChevronDown, ChevronUp } from 'react-feather'

import { ColorPalette } from '../../configurator.types'
import { ColorPaletteManager } from '../../hooks/useColorPaletteManager'
import { LinkButton } from '../ui/buttons/link/LinkButton.component'
import { SmallButton } from '../ui/buttons/small/SmallButton.component'
import { ColorInput } from '../ui/inputs/ColorInput/ColorInput.component'

const visibleColorKeys: Array<keyof ColorPalette> = ['primary', 'paper', 'text']

function formatPaletteColorLabel(colorKey: keyof ColorPalette): string {
  return String(colorKey).charAt(0).toUpperCase() + String(colorKey).slice(1)
}

export function PaletteControl({ paletteManager }: { paletteManager: ColorPaletteManager }): ReactNode {
  const { colorPalette, setColorPalette, defaultPalette, resetColorPalette } = paletteManager

  const otherColorKeys = (Object.keys(colorPalette) as Array<keyof ColorPalette>).filter(
    (key) => !visibleColorKeys.includes(key),
  )

  const [expanded, setExpanded] = useState(false)

  const renderColorInput = (colorKey: keyof ColorPalette): ReactNode => (
    <ColorInput
      key={String(colorKey)}
      name={String(colorKey)}
      label={formatPaletteColorLabel(colorKey)}
      value={colorPalette[colorKey] || defaultPalette[colorKey]}
      onChange={(_, newValue) => {
        setColorPalette((prevPalette: ColorPalette) => ({ ...prevPalette, [colorKey]: newValue }))
      }}
      sx={{ my: '10px' }}
    />
  )

  return (
    <div>
      {visibleColorKeys.map(renderColorInput)}

      <Collapse in={expanded}>{otherColorKeys.map(renderColorInput)}</Collapse>

      <Box
        sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', mt: 1.2 }}
      >
        <LinkButton
          label={expanded ? 'Less Colors' : 'More Colors'}
          endIcon={expanded ? ChevronUp : ChevronDown}
          onClick={() => setExpanded(!expanded)}
        />
        <SmallButton label="Reset" onClick={resetColorPalette} />
      </Box>
    </div>
  )
}
