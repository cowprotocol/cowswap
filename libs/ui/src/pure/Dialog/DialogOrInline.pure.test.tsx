import { ReactNode } from 'react'

import { render, screen } from '@testing-library/react'

import { DialogOrInline } from './DialogOrInline.pure'

jest.mock('./Dialog.pure', () => ({
  Dialog: ({
    children,
    isOpen,
    a11yTitle,
    className,
  }: {
    children: ReactNode
    isOpen: boolean
    a11yTitle?: string
    className?: string
  }) => (
    <div data-testid="dialog" data-open={String(isOpen)} data-a11y-title={a11yTitle} className={className}>
      {children}
    </div>
  ),
}))

function renderDialogOrInline(
  isOpen: boolean,
  isDialog: boolean,
  onOpenChange = jest.fn(),
  extra?: {
    a11yTitle?: string
    className?: string
    children?: ReactNode
  },
): ReturnType<typeof render> & {
  onOpenChange: jest.Mock
} {
  const view = render(
    <DialogOrInline
      isOpen={isOpen}
      isDialog={isDialog}
      onOpenChange={onOpenChange}
      a11yTitle={extra?.a11yTitle}
      className={extra?.className}
    >
      {extra?.children ?? <div>orders</div>}
    </DialogOrInline>,
  )

  return { ...view, onOpenChange }
}

describe('DialogOrInline', () => {
  it('renders a dialog when isDialog is true', () => {
    const onOpenChange = jest.fn()

    renderDialogOrInline(true, true, onOpenChange, {
      a11yTitle: 'Orders',
      className: 'orders-dialog',
      children: <span>Content</span>,
    })

    const dialog = screen.getByTestId('dialog')

    expect(onOpenChange).not.toHaveBeenCalled()
    expect(dialog.getAttribute('data-open')).toBe('true')
    expect(dialog.getAttribute('data-a11y-title')).toBe('Orders')
    expect(dialog.className).toContain('orders-dialog')
    expect(dialog.textContent).toContain('Content')
  })

  it('renders children inline when isDialog is false', () => {
    renderDialogOrInline(true, false, jest.fn(), {
      children: <span>Content</span>,
    })

    expect(screen.queryByTestId('dialog')).toBeNull()
    expect(screen.getByText('Content')).toBeTruthy()
  })

  it('closes when mounting the inline branch while open', () => {
    const { onOpenChange } = renderDialogOrInline(true, false)

    expect(onOpenChange).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('closes the inline branch on mount even if already closed, but not on later inline renders', () => {
    const { onOpenChange, rerender } = renderDialogOrInline(false, false)

    expect(onOpenChange).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)

    onOpenChange.mockClear()

    rerender(
      <DialogOrInline isOpen={false} isDialog={false} onOpenChange={onOpenChange}>
        <div>orders</div>
      </DialogOrInline>,
    )

    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('closes after switching from the dialog branch to the inline branch', () => {
    const { onOpenChange, rerender } = renderDialogOrInline(true, true)

    expect(onOpenChange).not.toHaveBeenCalled()

    rerender(
      <DialogOrInline isOpen={true} isDialog={false} onOpenChange={onOpenChange}>
        <div>orders</div>
      </DialogOrInline>,
    )

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('closes on unmount so a later remount does not reopen the dialog', () => {
    const { onOpenChange, unmount } = renderDialogOrInline(true, true)

    expect(onOpenChange).not.toHaveBeenCalled()

    unmount()

    expect(onOpenChange).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
