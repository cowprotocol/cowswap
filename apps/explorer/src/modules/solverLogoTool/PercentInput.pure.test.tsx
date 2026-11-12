import { ReactElement, useState } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { PercentInput } from './PercentInput.pure'

jest.mock('./solverLogoTool.styled', () => ({ PercentField: 'label' }))

function ControlledInput(): ReactElement {
  const [value, setValue] = useState(100)
  return (
    <>
      <PercentInput label="Size" value={value} min={10} max={800} onChange={setValue} />
      <output data-testid="value">{value}</output>
      <button onClick={(): void => setValue(100)}>Reset</button>
    </>
  )
}

describe('editable zoom percentage', () => {
  it('allows replacing a value with 550 and reflects external reset', () => {
    render(<ControlledInput />)
    const input = screen.getByRole('spinbutton', { name: 'Size percentage' })
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '' } })
    fireEvent.change(input, { target: { value: '550' } })
    fireEvent.blur(input)
    expect(screen.getByTestId('value').textContent).toBe('550')
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect((input as HTMLInputElement).value).toBe('100')
  })
  it('normalises an out-of-range value when editing finishes', () => {
    render(<ControlledInput />)
    const input = screen.getByRole('spinbutton', { name: 'Size percentage' })
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '900' } })
    fireEvent.blur(input)
    expect((input as HTMLInputElement).value).toBe('800')
    expect(screen.getByTestId('value').textContent).toBe('800')
  })
})
