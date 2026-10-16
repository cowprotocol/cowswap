import '@testing-library/jest-dom'

import { Fraction } from '@cowprotocol/currency'

import { fireEvent, render, screen } from '@testing-library/react'

import { PricePercentageShortcuts, PricePercentageShortcutsProps } from './PricePercentageShortcuts.pure'

const defaultProps: PricePercentageShortcutsProps = {
  referenceRate: new Fraction(2010),
  activeRate: new Fraction(2010),
  isInverted: false,
  disabled: false,
  onSelect: jest.fn(),
}

describe('PricePercentageShortcuts', () => {
  it('sets a price and derives selection from the current rate', () => {
    const onSelect = jest.fn()
    const { rerender } = render(<PricePercentageShortcuts {...defaultProps} onSelect={onSelect} />)
    const preset = screen.getByRole('button', { name: '+20%' })
    expect(preset).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(preset)
    expect(onSelect.mock.calls[0][0].equalTo(2412)).toBe(true)

    rerender(<PricePercentageShortcuts {...defaultProps} activeRate={new Fraction(2412)} />)
    expect(preset).toHaveAttribute('aria-pressed', 'true')

    rerender(<PricePercentageShortcuts {...defaultProps} activeRate={new Fraction(2400)} />)
    expect(preset).toHaveAttribute('aria-pressed', 'false')
  })

  it('uses the latest market price without moving an existing target', () => {
    const onSelect = jest.fn()
    const { rerender } = render(
      <PricePercentageShortcuts {...defaultProps} activeRate={new Fraction(2412)} onSelect={onSelect} />,
    )
    rerender(
      <PricePercentageShortcuts
        {...defaultProps}
        referenceRate={new Fraction(2000)}
        activeRate={new Fraction(2412)}
        onSelect={onSelect}
      />,
    )
    const preset = screen.getByRole('button', { name: '+20%' })
    expect(preset).toHaveAttribute('aria-pressed', 'false')
    expect(onSelect).not.toHaveBeenCalled()
    fireEvent.click(preset)
    expect(onSelect.mock.calls[0][0].equalTo(2400)).toBe(true)
  })

  it('applies discounts to the displayed inverted price', () => {
    const onSelect = jest.fn()
    render(
      <PricePercentageShortcuts
        {...defaultProps}
        referenceRate={new Fraction(1, 2010)}
        isInverted
        onSelect={onSelect}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: '−5%' }))
    expect(onSelect.mock.calls[0][0].invert().toFixed(1)).toBe('1909.5')
  })

  it('clears the price for invalid custom values and accepts decimal percentages', () => {
    const onSelect = jest.fn()
    render(<PricePercentageShortcuts {...defaultProps} onSelect={onSelect} />)
    const input = screen.getByRole('textbox', { name: 'Custom percentage above market' })
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '0' } })
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(onSelect).toHaveBeenLastCalledWith(null)
    fireEvent.change(input, { target: { value: '2.5' } })
    expect(input).toHaveAttribute('aria-invalid', 'false')
    expect(onSelect.mock.lastCall[0].toFixed(2)).toBe('2060.25')
  })

  it('preserves invalid input after blur and clears it when the price changes', () => {
    const { rerender } = render(<PricePercentageShortcuts {...defaultProps} />)
    const input = screen.getByRole('textbox', { name: 'Custom percentage above market' })
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '0' } })
    rerender(<PricePercentageShortcuts {...defaultProps} activeRate={new Fraction(0)} />)
    fireEvent.blur(input)
    expect(input).toHaveValue('0')
    expect(input).toHaveAttribute('aria-invalid', 'true')

    rerender(<PricePercentageShortcuts {...defaultProps} activeRate={new Fraction(2412)} />)
    expect(input).toHaveValue('')
    expect(input).toHaveAttribute('aria-invalid', 'false')
    expect(screen.getByRole('button', { name: '+20%' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('selects only the preset when a custom value matches it', () => {
    const { rerender } = render(<PricePercentageShortcuts {...defaultProps} />)
    const input = screen.getByRole('textbox', { name: 'Custom percentage above market' })
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '5' } })
    rerender(<PricePercentageShortcuts {...defaultProps} activeRate={new Fraction(4221, 2)} />)
    fireEvent.blur(input)
    expect(screen.getByRole('button', { name: '+5%' })).toHaveAttribute('aria-pressed', 'true')
    expect(input).toHaveValue('')
  })

  it('rejects discounts of 100 percent', () => {
    const onSelect = jest.fn()
    render(<PricePercentageShortcuts {...defaultProps} isInverted onSelect={onSelect} />)
    const input = screen.getByRole('textbox', { name: 'Custom percentage below market' })
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '100' } })
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(onSelect).toHaveBeenLastCalledWith(null)
  })

  it.each([{ referenceRate: null }, { referenceRate: new Fraction(0) }, { disabled: true }])(
    'disables shortcuts when a market price cannot be used',
    (override) => {
      render(<PricePercentageShortcuts {...defaultProps} {...override} />)
      screen.getAllByRole('button').forEach((button) => expect(button).toBeDisabled())
      expect(screen.getByRole('textbox')).toBeDisabled()
    },
  )
})

it('uses the same presets with an execution reference and a Custom navigation action', () => {
  const onCustomClick = jest.fn()
  const onSelect = jest.fn()
  render(
    <PricePercentageShortcuts
      {...defaultProps}
      reference="execution"
      onCustomClick={onCustomClick}
      onSelect={onSelect}
    />,
  )
  expect(screen.getByRole('group', { name: 'Price relative to execution' })).toBeInTheDocument()
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: '+5%' }))
  expect(onSelect.mock.calls[0][0].equalTo(new Fraction(21105, 10))).toBe(true)
  fireEvent.click(screen.getByRole('button', { name: 'Custom %' }))
  expect(onCustomClick).toHaveBeenCalledTimes(1)
})

it('focuses Custom when opened from the take-profit banner', () => {
  render(<PricePercentageShortcuts {...defaultProps} reference="execution" focusCustom />)
  expect(screen.getByRole('textbox', { name: 'Custom percentage above execution price' })).toHaveFocus()
})
