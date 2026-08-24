import { ReactNode } from 'react'

import { render, screen } from '@testing-library/react'

import { DialogOrInline } from './DialogOrInline.pure'

import { Media } from '../../consts'

const mockUseMediaQuery = jest.fn()

jest.mock('@cowprotocol/common-hooks', () => {
  const actual = jest.requireActual('@cowprotocol/common-hooks') as typeof import('@cowprotocol/common-hooks')

  return {
    ...actual,
    useMediaQuery: (...args: unknown[]) => mockUseMediaQuery(...args),
  }
})

jest.mock('./Dialog.pure', () => ({
  Dialog: ({
    children,
    isOpen,
    title,
    className,
  }: {
    children: ReactNode
    isOpen: boolean
    title?: string
    className?: string
  }) => (
    <div data-testid="dialog" data-open={String(isOpen)} data-title={title} className={className}>
      {children}
    </div>
  ),
}))

function renderDialogOrInline(
  isOpen: boolean,
  onOpenChange = jest.fn(),
  extra?: {
    title?: string
    className?: string
    children?: ReactNode
  },
): ReturnType<typeof render> & {
  onOpenChange: jest.Mock
} {
  const view = render(
    <DialogOrInline isOpen={isOpen} onOpenChange={onOpenChange} title={extra?.title} className={extra?.className}>
      {extra?.children ?? <div>orders</div>}
    </DialogOrInline>,
  )

  return { ...view, onOpenChange }
}

describe('DialogOrInline', () => {
  beforeEach(() => {
    mockUseMediaQuery.mockReset()
  })

  it('renders a dialog at the up-to-large breakpoint', () => {
    mockUseMediaQuery.mockReturnValue(true)
    const onOpenChange = jest.fn()

    renderDialogOrInline(true, onOpenChange, {
      title: 'Orders',
      className: 'orders-dialog',
      children: <span>Content</span>,
    })

    const dialog = screen.getByTestId('dialog')

    expect(mockUseMediaQuery).toHaveBeenCalledWith(Media.upToLarge(false))
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(dialog.getAttribute('data-open')).toBe('true')
    expect(dialog.getAttribute('data-title')).toBe('Orders')
    expect(dialog.className).toContain('orders-dialog')
    expect(dialog.textContent).toContain('Content')
  })

  it('renders children inline above the large breakpoint', () => {
    mockUseMediaQuery.mockReturnValue(false)

    renderDialogOrInline(true, jest.fn(), {
      children: <span>Content</span>,
    })

    expect(mockUseMediaQuery).toHaveBeenCalledWith(Media.upToLarge(false))
    expect(screen.queryByTestId('dialog')).toBeNull()
    expect(screen.getByText('Content')).toBeTruthy()
  })

  it('closes when mounting the inline branch while open', () => {
    mockUseMediaQuery.mockReturnValue(false)

    const { onOpenChange } = renderDialogOrInline(true)

    expect(onOpenChange).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('closes the inline branch on mount even if already closed, but not on later desktop renders', () => {
    mockUseMediaQuery.mockReturnValue(false)

    const { onOpenChange, rerender } = renderDialogOrInline(false)

    expect(onOpenChange).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)

    onOpenChange.mockClear()

    rerender(
      <DialogOrInline isOpen={false} onOpenChange={onOpenChange}>
        <div>orders</div>
      </DialogOrInline>,
    )

    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('closes after resizing from the dialog branch to the inline branch', () => {
    mockUseMediaQuery.mockReturnValue(true)

    const { onOpenChange, rerender } = renderDialogOrInline(true)

    expect(onOpenChange).not.toHaveBeenCalled()

    mockUseMediaQuery.mockReturnValue(false)
    rerender(
      <DialogOrInline isOpen={true} onOpenChange={onOpenChange}>
        <div>orders</div>
      </DialogOrInline>,
    )

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('closes on unmount so a later remount does not reopen the dialog', () => {
    mockUseMediaQuery.mockReturnValue(true)

    const { onOpenChange, unmount } = renderDialogOrInline(true)

    expect(onOpenChange).not.toHaveBeenCalled()

    unmount()

    expect(onOpenChange).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
