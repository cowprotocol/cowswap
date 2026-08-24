import { isValidElement } from 'react'

import { render, screen } from '@testing-library/react'

import { resolveOverlayHeader } from './resolveOverlayHeader'

jest.mock('../ModalHeader', () => ({
  ModalHeader: ({ sticky, title }: { sticky?: boolean; title?: string }) => (
    <div data-testid="modal-header" data-sticky={String(!!sticky)}>
      {title}
    </div>
  ),
}))

describe('resolveOverlayHeader', () => {
  it('synthesizes a sticky ModalHeader from title so overlay chrome is visible', () => {
    const header = resolveOverlayHeader({
      title: 'Limit orders',
      onClose: jest.fn(),
    })

    expect(isValidElement(header)).toBe(true)

    render(<>{header}</>)

    expect(screen.getByTestId('modal-header').textContent).toBe('Limit orders')
    expect(screen.getByTestId('modal-header').getAttribute('data-sticky')).toBe('true')
  })

  it('uses an explicit header instead of synthesizing one', () => {
    render(
      <>{resolveOverlayHeader({ header: <span>Custom header</span>, title: 'Limit orders', onClose: jest.fn() })}</>,
    )

    expect(screen.getByText('Custom header')).toBeTruthy()
    expect(screen.queryByTestId('modal-header')).toBeNull()
  })

  it('synthesizes a ModalHeader when onBack is provided', () => {
    const header = resolveOverlayHeader({ title: 'Account', onBack: jest.fn(), onClose: jest.fn() })

    expect(isValidElement(header)).toBe(true)

    render(<>{header}</>)

    expect(screen.getByTestId('modal-header').textContent).toBe('Account')
    expect(screen.getByTestId('modal-header').getAttribute('data-sticky')).toBe('true')
  })
})
