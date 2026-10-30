import { fireEvent, render, screen } from '@testing-library/react'

import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('renders nothing for a single page', () => {
    const { container } = render(<Pagination page={1} totalPages={1} onChange={jest.fn()} />)

    expect(container.innerHTML).toBe('')
  })

  it('marks the current page and disables the arrow past the first page', () => {
    render(<Pagination page={1} totalPages={93} onChange={jest.fn()} />)

    expect(screen.getAllByRole('button', { name: 'Page 1' })[0]?.getAttribute('aria-current')).toBe('page')
    expect(screen.getAllByRole('button', { name: 'Page 93' })).toHaveLength(2)
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Previous page' }).disabled).toBe(true)
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Next page' }).disabled).toBe(false)
  })

  it('moves with the arrows and jumps to a picked page', () => {
    const onChange = jest.fn()
    render(<Pagination page={46} totalPages={93} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
    fireEvent.click(screen.getAllByRole('button', { name: 'Page 93' })[0] as HTMLElement)

    expect(onChange.mock.calls).toEqual([[45], [47], [93]])
  })
})
