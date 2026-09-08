import { ReactNode } from 'react'

import { render, screen } from '@testing-library/react'

import { BottomDrawerOrDialog } from './BottomDrawerOrDialog'

jest.mock('./BottomDrawer.pure', () => ({
  BottomDrawer: ({
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
    <div data-testid="bottom-drawer" data-open={String(isOpen)} data-a11y-title={a11yTitle} className={className}>
      {children}
    </div>
  ),
}))

jest.mock('../Dialog/Dialog.pure', () => ({
  Dialog: ({
    children,
    isOpen,
    a11yTitle,
    className,
    variant,
  }: {
    children: ReactNode
    isOpen: boolean
    a11yTitle?: string
    className?: string
    variant?: string
  }) => (
    <div
      data-testid="dialog"
      data-open={String(isOpen)}
      data-a11y-title={a11yTitle}
      data-variant={variant}
      className={className}
    >
      {children}
    </div>
  ),
}))

function renderBottomDrawerOrDialog(
  isOpen: boolean,
  isDrawer: boolean,
  onOpenChange = jest.fn(),
  extra?: {
    a11yTitle?: string
    className?: string
    children?: ReactNode
    variant?: 'default' | 'narrow'
  },
): ReturnType<typeof render> & {
  onOpenChange: jest.Mock
} {
  const view = render(
    <BottomDrawerOrDialog
      isOpen={isOpen}
      isDrawer={isDrawer}
      onOpenChange={onOpenChange}
      a11yTitle={extra?.a11yTitle}
      className={extra?.className}
      variant={extra?.variant}
    >
      {extra?.children ?? <div>receipt</div>}
    </BottomDrawerOrDialog>,
  )

  return { ...view, onOpenChange }
}

describe('BottomDrawerOrDialog', () => {
  it('renders a bottom drawer when isDrawer is true', () => {
    const onOpenChange = jest.fn()

    renderBottomDrawerOrDialog(true, true, onOpenChange, {
      a11yTitle: 'Order Receipt',
      className: 'receipt-overlay',
      children: <span>Content</span>,
    })

    const drawer = screen.getByTestId('bottom-drawer')

    expect(onOpenChange).not.toHaveBeenCalled()
    expect(screen.queryByTestId('dialog')).toBeNull()
    expect(drawer.getAttribute('data-open')).toBe('true')
    expect(drawer.getAttribute('data-a11y-title')).toBe('Order Receipt')
    expect(drawer.className).toContain('receipt-overlay')
    expect(drawer.textContent).toContain('Content')
  })

  it('renders a dialog when isDrawer is false', () => {
    const { onOpenChange } = renderBottomDrawerOrDialog(true, false, jest.fn(), {
      a11yTitle: 'Order Receipt',
      children: <span>Content</span>,
      variant: 'narrow',
    })

    const dialog = screen.getByTestId('dialog')

    expect(onOpenChange).not.toHaveBeenCalled()
    expect(screen.queryByTestId('bottom-drawer')).toBeNull()
    expect(dialog.getAttribute('data-open')).toBe('true')
    expect(dialog.getAttribute('data-a11y-title')).toBe('Order Receipt')
    expect(dialog.getAttribute('data-variant')).toBe('narrow')
    expect(dialog.textContent).toContain('Content')
  })

  it('closes after switching from the drawer branch to the dialog branch', () => {
    const { onOpenChange, rerender } = renderBottomDrawerOrDialog(true, true)

    expect(onOpenChange).not.toHaveBeenCalled()

    rerender(
      <BottomDrawerOrDialog isOpen={true} isDrawer={false} onOpenChange={onOpenChange}>
        <div>receipt</div>
      </BottomDrawerOrDialog>,
    )

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('closes on unmount so a later remount does not reopen the overlay', () => {
    const { onOpenChange, unmount } = renderBottomDrawerOrDialog(true, true)

    expect(onOpenChange).not.toHaveBeenCalled()

    unmount()

    expect(onOpenChange).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
