import React from 'react'

import { FormControl, Button, Collapse } from '@mui/material'
import { MuiColorInput } from 'mui-color-input'

import { ColorPaletteManager } from '../hooks/useColorPaletteManager'
import { ColorPalette } from '../types'

const visibleColorKeys: Array<keyof ColorPalette> = ['primary', 'paper', 'text']

export function PaletteControl({ paletteManager }: { paletteManager: ColorPaletteManager }) {
  const { colorPalette, resetColorPalette } = paletteManager

  const otherColorKeys = Object.keys(colorPalette).filter(
    (key): key is keyof ColorPalette => !visibleColorKeys.includes(key as keyof ColorPalette)
  )

  const [expanded, setExpanded] = React.useState(false)

  return (
    <>
      {visibleColorKeys.map((key) => (
        <FormControl sx={{ width: '100%', gap: '1.6rem' }} key={key}>
          <ColorInput colorKey={key} paletteManager={paletteManager} />
        </FormControl>
      ))}

      <Collapse in={expanded}>
        {otherColorKeys.map((colorKey) => (
          <FormControl sx={{ width: '100%', margin: '0 0 1.6rem' }} key={colorKey}>
            <ColorInput colorKey={colorKey} paletteManager={paletteManager} />
          </FormControl>
        ))}
      </Collapse>

      <Button onClick={() => setExpanded(!expanded)}>{expanded ? 'Less' : 'More'} Options</Button>
      <Button onClick={resetColorPalette}>Reset to Default</Button>
    </>
  )
}

interface ColorInputProps {
  paletteManager: ColorPaletteManager
  colorKey: keyof ColorPalette
}

function ColorInput({ colorKey, paletteManager }: ColorInputProps) {
  const { colorPalette, setColorPalette, defaultPalette } = paletteManager
  // Use the custom color or fallback to the default color
  const colorValue = colorPalette[colorKey] || defaultPalette[colorKey]

  const handleColorChange = (colorKey: keyof ColorPalette) => (newValue: string) => {
    setColorPalette((prevPalette) => ({ ...prevPalette, [colorKey]: newValue }))
  }

  return (
    <MuiColorInput
      value={colorValue}
      onChange={handleColorChange(colorKey)}
      size="small"
      variant="outlined"
      label={`${colorKey.charAt(0).toUpperCase() + colorKey.slice(1)}`}
      format="hex"
      isAlphaHidden
    />
  )
}
