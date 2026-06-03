import { fireEvent, render, screen } from '@testing-library/react'

import { PaletteControl } from './PaletteControl'

import { ColorPaletteManager } from '../../../hooks/useColorPaletteManager'

jest.mock('mui-color-input', () => ({
  MuiColorInput: (props: { label: string }) => <div>{props.label}</div>,
}))

function buildPaletteManager(): ColorPaletteManager {
  const defaultPalette = {
    primary: '#052b65',
    background: '#FFFFFF',
    paper: '#FFFFFF',
    text: '#052B65',
    danger: '#D41300',
    warning: '#F8D06B',
    alert: '#DB971E',
    info: '#0d5ed9',
    success: '#007B28',
  }

  return {
    colorPalette: defaultPalette,
    defaultPalette,
    resetColorPalette: jest.fn(),
    setColorPalette: jest.fn(),
  }
}

describe('PaletteControl', () => {
  it('uses a disclosure button for additional colors', () => {
    render(<PaletteControl paletteManager={buildPaletteManager()} />)

    fireEvent.click(screen.getByRole('button', { name: /more colors/i }))

    expect(screen.getByRole('button', { name: /less colors/i })).not.toBeNull()
  })

  it('resets only the theme colors', () => {
    const paletteManager = buildPaletteManager()

    render(<PaletteControl paletteManager={paletteManager} />)

    fireEvent.click(screen.getByRole('button', { name: /reset colors to default/i }))

    expect(paletteManager.resetColorPalette).toHaveBeenCalledTimes(1)
  })
})
