import { ReactNode } from 'react'

import { render, screen } from '@testing-library/react'

import { BottomDrawerOrDialog } from './BottomDrawerOrDialog'

import { Media } from '../../consts'

const mockUseMediaQuery = jest.fn()

jest.mock('@cowprotocol/common-hooks', () => {
  const actual = jest.requireActual('@cowprotocol/common-hooks') as typeof import('@cowprotocol/common-hooks')

  return {
    ...actual,
    useMediaQuery: (...args: unknown[]) => mockUseMediaQuery(...args),
  }
})

jest.mock('./BottomDrawer.pure', () => ({
  BottomDrawer: ({
    children,
    open,
    title,
    className,
    header,
    footer,
  }: {
    children: ReactNode
    open: boolean
    title?: string
    className?: string
    header?: ReactNode
    footer?: ReactNode
  }) => (
    <div data-testid="bottom-drawer" data-open={String(open)} data-title={title} className={className}>
      {header}
      {children}
      {footer}
    </div>
  ),
}))

jest.mock('../Dialog/Dialog.pure', () => ({
  Dialog: ({
    children,
    open,
    title,
    className,
    header,
    footer,
    variant,
  }: {
    children: ReactNode
    open: boolean
    title?: string
    className?: string
    header?: ReactNode
    footer?: ReactNode
    variant?: string
  }) => (
    <div data-testid="dialog" data-open={String(open)} data-title={title} data-variant={variant} className={className}>
      {header}
      {children}
      {footer}
    </div>
  ),
}))

function renderBottomDrawerOrDialog(
  isOpen: boolean,
  onOpenChange = jest.fn(),
  extra?: {
    title?: string
    className?: string
    header?: ReactNode
    footer?: ReactNode
    children?: ReactNode
    variant?: 'default' | 'narrow'
  },
): ReturnType<typeof render> & {
  onOpenChange: jest.Mock
} {
  const view = render(
    <BottomDrawerOrDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={extra?.title}
      className={extra?.className}
      header={extra?.header}
      footer={extra?.footer}
      variant={extra?.variant}
    >
      {extra?.children ?? <div>receipt</div>}
    </BottomDrawerOrDialog>,
  )

  return { ...view, onOpenChange }
}

describe('BottomDrawerOrDialog', () => {
  beforeEach(() => {
    mockUseMediaQuery.mockReset()
  })

  it('renders a bottom drawer at the up-to-small breakpoint', () => {
    mockUseMediaQuery.mockReturnValue(true)
    const onOpenChange = jest.fn()

    renderBottomDrawerOrDialog(true, onOpenChange, {
      title: 'Order Receipt',
      className: 'receipt-overlay',
      header: <span>Header</span>,
      footer: <span>Footer</span>,
      children: <span>Content</span>,
    })

    const drawer = screen.getByTestId('bottom-drawer')

    expect(mockUseMediaQuery).toHaveBeenCalledWith(Media.upToSmall(false))
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(screen.queryByTestId('dialog')).toBeNull()
    expect(drawer.getAttribute('data-open')).toBe('true')
    expect(drawer.getAttribute('data-title')).toBe('Order Receipt')
    expect(drawer.className).toContain('receipt-overlay')
    expect(drawer.textContent).toContain('Header')
    expect(drawer.textContent).toContain('Content')
    expect(drawer.textContent).toContain('Footer')
  })

  it('renders a dialog above the small breakpoint', () => {
    mockUseMediaQuery.mockReturnValue(false)

    const { onOpenChange } = renderBottomDrawerOrDialog(true, jest.fn(), {
      title: 'Order Receipt',
      header: <span>Header</span>,
      footer: <span>Footer</span>,
      children: <span>Content</span>,
      variant: 'narrow',
    })

    const dialog = screen.getByTestId('dialog')

    expect(mockUseMediaQuery).toHaveBeenCalledWith(Media.upToSmall(false))
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(screen.queryByTestId('bottom-drawer')).toBeNull()
    expect(dialog.getAttribute('data-open')).toBe('true')
    expect(dialog.getAttribute('data-title')).toBe('Order Receipt')
    expect(dialog.getAttribute('data-variant')).toBe('narrow')
    expect(dialog.textContent).toContain('Header')
    expect(dialog.textContent).toContain('Content')
    expect(dialog.textContent).toContain('Footer')
  })

  it('closes after resizing from the drawer branch to the dialog branch', () => {
    mockUseMediaQuery.mockReturnValue(true)

    const { onOpenChange, rerender } = renderBottomDrawerOrDialog(true)

    expect(onOpenChange).not.toHaveBeenCalled()

    mockUseMediaQuery.mockReturnValue(false)
    rerender(
      <BottomDrawerOrDialog isOpen={true} onOpenChange={onOpenChange}>
        <div>receipt</div>
      </BottomDrawerOrDialog>,
    )

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('closes on unmount so a later remount does not reopen the overlay', () => {
    mockUseMediaQuery.mockReturnValue(true)

    const { onOpenChange, unmount } = renderBottomDrawerOrDialog(true)

    expect(onOpenChange).not.toHaveBeenCalled()

    unmount()

    expect(onOpenChange).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
