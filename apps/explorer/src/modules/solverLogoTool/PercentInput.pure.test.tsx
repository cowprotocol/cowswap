import { ReactElement, useState } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { PercentInput } from './PercentInput.pure'

jest.mock('./solverLogoTool.styled', () => ({ PercentField: 'div' }))

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

  it('steps by one and disables the arrow at the upper limit', () => {
    render(<ControlledInput />)
    const input = screen.getByRole('spinbutton', { name: 'Size percentage' })
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '799' } })
    fireEvent.blur(input)

    const increase = screen.getByRole('button', { name: 'Increase Size percentage' })
    fireEvent.click(increase)
    expect((input as HTMLInputElement).value).toBe('800')
    expect((increase as HTMLButtonElement).disabled).toBe(true)

    fireEvent.click(screen.getByRole('button', { name: 'Decrease Size percentage' }))
    expect((input as HTMLInputElement).value).toBe('799')
    expect((increase as HTMLButtonElement).disabled).toBe(false)
  })

  it('steps negative offsets without passing the lower limit', () => {
    const onChange = jest.fn()
    const view = render(<PercentInput label="X" value={-99} min={-100} max={100} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Decrease X percentage' }))
    expect(onChange).toHaveBeenCalledWith(-100)

    view.rerender(<PercentInput label="X" value={-100} min={-100} max={100} onChange={onChange} />)
    expect((screen.getByRole('button', { name: 'Decrease X percentage' }) as HTMLButtonElement).disabled).toBe(true)
  })
})
