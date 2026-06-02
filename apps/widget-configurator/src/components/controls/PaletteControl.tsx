import { ReactNode, useState } from 'react'

import { Box, Collapse, FormControl } from '@mui/material'
import { MuiColorInput } from 'mui-color-input'
import { ChevronDown, ChevronUp } from 'react-feather'

import { ColorPalette } from '../../configurator.types'
import { ColorPaletteManager } from '../../hooks/useColorPaletteManager'
import { LinkButton } from '../ui/buttons/link/LinkButton.component'
import { SmallButton } from '../ui/buttons/small/SmallButton.component'

const visibleColorKeys: Array<keyof ColorPalette> = ['primary', 'paper', 'text']

export function PaletteControl({ paletteManager }: { paletteManager: ColorPaletteManager }): ReactNode {
  const { colorPalette, resetColorPalette } = paletteManager

  const otherColorKeys = (Object.keys(colorPalette) as Array<keyof ColorPalette>).filter(
    (key) => !visibleColorKeys.includes(key),
  )

  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      {visibleColorKeys.map((key) => (
        <FormControl sx={{ width: '100%', margin: '10px 0' }} key={String(key)}>
          <ColorInput colorKey={key} paletteManager={paletteManager} />
        </FormControl>
      ))}

      <Collapse in={expanded}>
        {otherColorKeys.map((colorKey) => (
          <FormControl sx={{ width: '100%', margin: '10px 0' }} key={String(colorKey)}>
            <ColorInput colorKey={colorKey} paletteManager={paletteManager} />
          </FormControl>
        ))}
      </Collapse>

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

interface ColorInputProps {
  paletteManager: ColorPaletteManager
  colorKey: keyof ColorPalette
}

function ColorInput({ colorKey, paletteManager }: ColorInputProps): ReactNode {
  const { colorPalette, setColorPalette, defaultPalette } = paletteManager
  // Use the custom color or fallback to the default color
  const colorValue = colorPalette[colorKey] || defaultPalette[colorKey]

  const handleColorChange = (colorKey: keyof ColorPalette) => (newValue: string) => {
    setColorPalette((prevPalette: ColorPalette) => ({ ...prevPalette, [colorKey]: newValue }))
  }

  return (
    <MuiColorInput
      value={colorValue}
      onChange={handleColorChange(colorKey)}
      size="small"
      variant="outlined"
      label={`${String(colorKey).charAt(0).toUpperCase() + String(colorKey).slice(1)}`}
      format="hex"
      isAlphaHidden
    />
  )
}
