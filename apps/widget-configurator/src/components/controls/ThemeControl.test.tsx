import { fireEvent, render, screen } from '@testing-library/react'

import { ThemeControl } from './ThemeControl'

import { ColorModeContext, type ColorModeParams } from '../../theme/ColorModeContext'

function renderThemeControl(contextValue: Partial<ColorModeParams> = {}): void {
  render(
    <ColorModeContext.Provider
      value={{
        mode: 'light',
        toggleColorMode: jest.fn(),
        setAutoMode: jest.fn(),
        setMode: jest.fn(),
        ...contextValue,
      }}
    >
      <ThemeControl />
    </ColorModeContext.Provider>,
  )
}

describe('ThemeControl', () => {
  it('renders the selected theme with its icon label', () => {
    renderThemeControl()

    expect(screen.getByText('Light')).not.toBeNull()
  })

  it('sets the selected explicit mode instead of toggling blindly', () => {
    const setMode = jest.fn()

    renderThemeControl({ mode: 'dark', setMode })

    fireEvent.mouseDown(screen.getByRole('combobox'))
    fireEvent.click(screen.getByRole('option', { name: 'Light' }))

    expect(setMode).toHaveBeenCalledWith('light')
  })

  it('switches back to auto mode through the dedicated handler', () => {
    const setAutoMode = jest.fn()

    renderThemeControl({ setAutoMode })

    fireEvent.mouseDown(screen.getByRole('combobox'))
    fireEvent.click(screen.getByRole('option', { name: 'Auto' }))

    expect(setAutoMode).toHaveBeenCalled()
  })
})
