import { ReactNode } from 'react'

import { act, render, screen } from '@testing-library/react'

import { BottomDrawerOrDialog } from './BottomDrawerOrDialog'

jest.mock('./BottomDrawer.pure', () => ({
  BottomDrawer: ({
    children,
    isOpen,
    a11yTitle,
    className,
    onOpenChange,
    onOpenChangeComplete,
  }: {
    children: ReactNode
    isOpen: boolean
    a11yTitle?: string
    className?: string
    onOpenChange?: (open: boolean) => void
    onOpenChangeComplete?: (open: boolean) => void
  }) => (
    <div
      data-testid="bottom-drawer"
      data-open={String(isOpen)}
      data-a11y-title={a11yTitle}
      className={className}
      onTransitionEnd={() => {
        if (!isOpen) {
          onOpenChange?.(false)
          onOpenChangeComplete?.(false)
        }
      }}
    >
      <button type="button" data-testid="request-close" onClick={() => onOpenChange?.(false)}>
        request close
      </button>
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
    onOpenChange,
    onOpenChangeComplete,
  }: {
    children: ReactNode
    isOpen: boolean
    a11yTitle?: string
    className?: string
    variant?: string
    onOpenChange?: (open: boolean) => void
    onOpenChangeComplete?: (open: boolean) => void
  }) => (
    <div
      data-testid="dialog"
      data-open={String(isOpen)}
      data-a11y-title={a11yTitle}
      data-variant={variant}
      className={className}
      onTransitionEnd={() => {
        if (!isOpen) {
          onOpenChange?.(false)
          onOpenChangeComplete?.(false)
        }
      }}
    >
      {children}
    </div>
  ),
}))

async function finishSurfaceCloseTransition(): Promise<void> {
  await act(async () => {
    screen.getByTestId('bottom-drawer').dispatchEvent(new Event('transitionend', { bubbles: true }))
  })
}

function renderBottomDrawerOrDialog(
  isOpen: boolean,
  isDrawer: boolean,
  onOpenChange = jest.fn(),
  extra?: {
    a11yTitle?: string
    className?: string
    children?: ReactNode
    onOpenChangeComplete?: jest.Mock
    variant?: 'default' | 'narrow'
  },
): ReturnType<typeof render> & {
  onOpenChange: jest.Mock
  onOpenChangeComplete: jest.Mock
} {
  const onOpenChangeComplete = extra?.onOpenChangeComplete ?? jest.fn()

  const view = render(
    <BottomDrawerOrDialog
      isOpen={isOpen}
      isDrawer={isDrawer}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={onOpenChangeComplete}
      a11yTitle={extra?.a11yTitle}
      className={extra?.className}
      variant={extra?.variant}
    >
      {extra?.children ?? <div>receipt</div>}
    </BottomDrawerOrDialog>,
  )

  return { ...view, onOpenChange, onOpenChangeComplete }
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

  it('switches from the drawer branch to the dialog branch without notifying parent close', async () => {
    const onOpenChange = jest.fn()
    const onOpenChangeComplete = jest.fn()
    const { rerender } = renderBottomDrawerOrDialog(true, true, onOpenChange, { onOpenChangeComplete })

    expect(onOpenChange).not.toHaveBeenCalled()
    expect(onOpenChangeComplete).not.toHaveBeenCalled()

    rerender(
      <BottomDrawerOrDialog
        isOpen={true}
        isDrawer={false}
        onOpenChange={onOpenChange}
        onOpenChangeComplete={onOpenChangeComplete}
      >
        <div>receipt</div>
      </BottomDrawerOrDialog>,
    )

    expect(onOpenChange).not.toHaveBeenCalled()
    expect(screen.getByTestId('bottom-drawer').getAttribute('data-open')).toBe('false')

    await finishSurfaceCloseTransition()

    expect(onOpenChange).not.toHaveBeenCalled()
    expect(onOpenChangeComplete).not.toHaveBeenCalled()
    expect(screen.queryByTestId('bottom-drawer')).toBeNull()
    expect(screen.getByTestId('dialog').getAttribute('data-open')).toBe('true')
  })

  it('forwards close completion after branch switch when parent already closed', async () => {
    const onOpenChange = jest.fn()
    const onOpenChangeComplete = jest.fn()
    const { rerender } = renderBottomDrawerOrDialog(true, true, onOpenChange, { onOpenChangeComplete })

    rerender(
      <BottomDrawerOrDialog
        isOpen={false}
        isDrawer={false}
        onOpenChange={onOpenChange}
        onOpenChangeComplete={onOpenChangeComplete}
      >
        <div>receipt</div>
      </BottomDrawerOrDialog>,
    )

    await finishSurfaceCloseTransition()

    expect(onOpenChangeComplete).toHaveBeenCalledTimes(1)
    expect(onOpenChangeComplete).toHaveBeenCalledWith(false)
    expect(screen.queryByTestId('bottom-drawer')).toBeNull()
    expect(screen.getByTestId('dialog').getAttribute('data-open')).toBe('false')
  })

  it('keeps the surface open until the parent accepts a child close request', async () => {
    const onOpenChange = jest.fn()
    const { rerender } = renderBottomDrawerOrDialog(true, true, onOpenChange)

    expect(screen.getByTestId('bottom-drawer').getAttribute('data-open')).toBe('true')

    await act(async () => {
      screen.getByTestId('request-close').click()
    })

    expect(onOpenChange).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(screen.getByTestId('bottom-drawer').getAttribute('data-open')).toBe('true')

    rerender(
      <BottomDrawerOrDialog isOpen={false} isDrawer={true} onOpenChange={onOpenChange}>
        <div>receipt</div>
      </BottomDrawerOrDialog>,
    )

    expect(screen.getByTestId('bottom-drawer').getAttribute('data-open')).toBe('false')
  })

  it('closes on unmount so a later remount does not reopen the overlay', () => {
    const { onOpenChange, unmount } = renderBottomDrawerOrDialog(true, true)

    expect(onOpenChange).not.toHaveBeenCalled()

    unmount()

    expect(onOpenChange).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
