// PaletteControl.tsx
import React, { useContext } from 'react'

import { FormControl, Button, Collapse } from '@mui/material'
import { MuiColorInput } from 'mui-color-input'

import { ColorModeContext } from '../../../theme/ColorModeContext'
import { DEFAULT_DARK_PALETTE, DEFAULT_LIGHT_PALETTE } from '../consts'
import {
  // useColorPalette,
  ColorPalette,
} from '../hooks/useColorPalette'

export function PaletteControl({
  colorPalette,
  setColorPalette,
  resetColorPalette,
}: {
  colorPalette: ColorPalette
  setColorPalette: (newPalette: ColorPalette) => void
  resetColorPalette: () => void
}) {
  const { mode } = useContext(ColorModeContext)
  // const [colorPalette, setColorPalette, resetColorPalette] = useColorPalette(mode)

  const handleColorChange = (colorKey: keyof ColorPalette) => (newValue: string) => {
    console.log('handleColorChange', colorKey, newValue)
    setColorPalette({ ...colorPalette, [colorKey]: newValue })
  }

  const handleReset = () => {
    resetColorPalette()
  }

  const defaultPalette = mode === 'dark' ? DEFAULT_DARK_PALETTE : DEFAULT_LIGHT_PALETTE

  const renderColorInput = (colorKey: keyof ColorPalette) => {
    // Use the custom color or fallback to the default color
    const colorValue = colorPalette[colorKey] || defaultPalette[colorKey]

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

  const visibleColorKeys: Array<keyof ColorPalette> = ['primary', 'paper', 'text']
  const otherColorKeys = Object.keys(colorPalette).filter(
    (key): key is keyof ColorPalette => !visibleColorKeys.includes(key as keyof ColorPalette)
  )

  const [expanded, setExpanded] = React.useState(false)

  console.log('PaletteControl', { colorPalette, defaultPalette })

  return (
    <>
      {visibleColorKeys.map((key) => (
        <FormControl sx={{ width: '100%', gap: '1.6rem' }} key={key}>
          {renderColorInput(key)}
        </FormControl>
      ))}

      <Collapse in={expanded}>
        {otherColorKeys.map((colorKey) => (
          <FormControl sx={{ width: '100%', margin: '0 0 1.6rem' }} key={colorKey}>
            {renderColorInput(colorKey)}
          </FormControl>
        ))}
      </Collapse>

      <Button onClick={() => setExpanded(!expanded)}>{expanded ? 'Less' : 'More'} Options</Button>
      <Button onClick={handleReset}>Reset to Default</Button>
    </>
  )
}
