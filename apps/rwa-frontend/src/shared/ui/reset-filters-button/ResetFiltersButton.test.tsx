import { type ReactNode, useState } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { ResetFiltersButton } from './ResetFiltersButton'

function Toolbar(): ReactNode {
  const [isFiltered, setIsFiltered] = useState(true)

  return (
    <div>
      <div>
        <button type="button">Filters</button>
      </div>
      {isFiltered && <ResetFiltersButton onClick={() => setIsFiltered(false)}>Clear</ResetFiltersButton>}
    </div>
  )
}

describe('ResetFiltersButton', () => {
  it('moves focus to the control before it once it unmounts after a keyboard reset', () => {
    render(<Toolbar />)
    const clear = screen.getByRole('button', { name: 'Clear' })

    clear.focus()
    fireEvent.click(clear)

    expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Filters' }))
  })

  it('leaves focus alone when the button was not focused', () => {
    render(<Toolbar />)

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))

    expect(document.activeElement).toBe(document.body)
  })
})
