import { Fraction } from '@cowprotocol/currency'

import { fireEvent, render, screen } from '@testing-library/react'

import { PricePercentageShortcuts } from './PricePercentageShortcuts.pure'

it('focuses empty Custom when pricing arrives and preserves typing across market updates', () => {
  const onSelect = jest.fn()
  const props = { mode: 'input' as const, focusCustom: true, isInverted: false, activeRate: null, onSelect }
  const { rerender } = render(<PricePercentageShortcuts {...props} disabled referenceRate={null} />)
  const input = screen.getByRole<HTMLInputElement>('textbox')
  rerender(<PricePercentageShortcuts {...props} disabled={false} referenceRate={new Fraction(2010)} />)
  expect(document.activeElement).toBe(input)
  expect(input.value).toBe('')
  fireEvent.change(input, { target: { value: '35.12' } })
  rerender(
    <PricePercentageShortcuts
      {...props}
      disabled={false}
      referenceRate={new Fraction(3000)}
      activeRate={new Fraction(40536, 10)}
      selectedPercentage="35.12"
    />,
  )
  expect(input.value).toBe('35.12')
})

it('navigation shortcuts send the choice without a market quote', () => {
  const onSelect = jest.fn()
  render(<PricePercentageShortcuts mode="navigation" isInverted={false} disabled={false} onSelect={onSelect} />)
  fireEvent.click(screen.getByRole('button', { name: '+20%' }))
  expect(onSelect).toHaveBeenLastCalledWith('20')
  fireEvent.click(screen.getByRole('button', { name: 'Custom %' }))
  expect(onSelect).toHaveBeenLastCalledWith(null)
})
