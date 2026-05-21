import { fireEvent, render, screen } from '@testing-library/react'

import { ThemeControl, type ThemeOptionValue } from './ThemeControl'

function renderThemeControl(props: {
  selectedValue: ThemeOptionValue
  onChange: (name: string, value: ThemeOptionValue) => void
}): void {
  render(<ThemeControl name="theme" selectedValue={props.selectedValue} onChange={props.onChange} />)
}

describe('ThemeControl', () => {
  it('renders the selected theme with its icon label', () => {
    const onChange = jest.fn()

    renderThemeControl({ selectedValue: 'light', onChange })

    expect(screen.getByText('Light')).not.toBeNull()
  })

  it('invokes onChange with the selected explicit mode', () => {
    const onChange = jest.fn()

    renderThemeControl({ selectedValue: 'dark', onChange })

    fireEvent.mouseDown(screen.getByRole('combobox'))
    fireEvent.click(screen.getByRole('option', { name: 'Light' }))

    expect(onChange).toHaveBeenCalledWith('theme', 'light')
  })
})
