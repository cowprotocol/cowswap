import { ReactNode } from 'react'

import { render, screen } from '@testing-library/react'

import { DrawerOrInline } from './DrawerOrInline.pure'

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
    fullScreen,
  }: {
    children: ReactNode
    open: boolean
    title?: string
    className?: string
    header?: ReactNode
    footer?: ReactNode
    fullScreen?: boolean
  }) => (
    <div
      data-testid="bottom-drawer"
      data-open={String(open)}
      data-title={title}
      data-fullscreen={fullScreen ? 'true' : undefined}
      className={className}
    >
      {header}
      {children}
      {footer}
    </div>
  ),
}))

function renderDrawer(
  isOpen: boolean,
  onOpenChange = jest.fn(),
  extra?: {
    title?: string
    className?: string
    header?: ReactNode
    footer?: ReactNode
    fullScreen?: boolean
    children?: ReactNode
  },
): ReturnType<typeof render> & {
  onOpenChange: jest.Mock
} {
  const view = render(
    <DrawerOrInline
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={extra?.title}
      className={extra?.className}
      header={extra?.header}
      footer={extra?.footer}
      fullScreen={extra?.fullScreen}
    >
      {extra?.children ?? <div>orders</div>}
    </DrawerOrInline>,
  )

  return { ...view, onOpenChange }
}

describe('DrawerOrInline', () => {
  beforeEach(() => {
    mockUseMediaQuery.mockReset()
  })

  it('renders the full-screen drawer at the up-to-large breakpoint', () => {
    mockUseMediaQuery.mockReturnValue(true)
    const onOpenChange = jest.fn()

    renderDrawer(true, onOpenChange, {
      title: 'Orders',
      className: 'orders-drawer',
      header: <span>Header</span>,
      footer: <span>Footer</span>,
      fullScreen: true,
      children: <span>Content</span>,
    })

    const drawer = screen.getByTestId('bottom-drawer')

    expect(mockUseMediaQuery).toHaveBeenCalledWith(Media.upToLarge(false))
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(drawer.getAttribute('data-open')).toBe('true')
    expect(drawer.getAttribute('data-title')).toBe('Orders')
    expect(drawer.getAttribute('data-fullscreen')).toBe('true')
    expect(drawer.className).toContain('orders-drawer')
    expect(drawer.textContent).toContain('Header')
    expect(drawer.textContent).toContain('Content')
    expect(drawer.textContent).toContain('Footer')
  })

  it('renders header, content, and footer inline above the large breakpoint', () => {
    mockUseMediaQuery.mockReturnValue(false)

    renderDrawer(true, jest.fn(), {
      header: <span>Header</span>,
      footer: <span>Footer</span>,
      fullScreen: true,
      children: <span>Content</span>,
    })

    expect(mockUseMediaQuery).toHaveBeenCalledWith(Media.upToLarge(false))
    expect(screen.queryByTestId('bottom-drawer')).toBeNull()
    expect(screen.getByText('Header')).toBeTruthy()
    expect(screen.getByText('Content')).toBeTruthy()
    expect(screen.getByText('Footer')).toBeTruthy()
  })

  it('closes when mounting the inline branch while open', () => {
    mockUseMediaQuery.mockReturnValue(false)

    const { onOpenChange } = renderDrawer(true)

    expect(onOpenChange).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('closes the inline branch on mount even if already closed, but not on later desktop renders', () => {
    mockUseMediaQuery.mockReturnValue(false)

    const { onOpenChange, rerender } = renderDrawer(false)

    expect(onOpenChange).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)

    onOpenChange.mockClear()

    rerender(
      <DrawerOrInline isOpen={false} onOpenChange={onOpenChange}>
        <div>orders</div>
      </DrawerOrInline>,
    )

    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('closes after resizing from the drawer branch to the inline branch', () => {
    mockUseMediaQuery.mockReturnValue(true)

    const { onOpenChange, rerender } = renderDrawer(true)

    expect(onOpenChange).not.toHaveBeenCalled()

    mockUseMediaQuery.mockReturnValue(false)
    rerender(
      <DrawerOrInline isOpen={true} onOpenChange={onOpenChange}>
        <div>orders</div>
      </DrawerOrInline>,
    )

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('closes on unmount so a later remount does not reopen the drawer', () => {
    mockUseMediaQuery.mockReturnValue(true)

    const { onOpenChange, unmount } = renderDrawer(true)

    expect(onOpenChange).not.toHaveBeenCalled()

    unmount()

    expect(onOpenChange).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
