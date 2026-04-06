import { render, screen } from '@testing-library/react'

import { LocaleControl } from './LocaleControl'

describe('LocaleControl', () => {
  it('shows browser default when no locale is forced', () => {
    render(<LocaleControl state={['', jest.fn()]} />)

    expect(screen.getByRole('combobox').textContent).toContain('Browser default')
  })
})
