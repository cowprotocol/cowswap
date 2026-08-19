import { ReactNode } from 'react'

import { render } from '@testing-library/react'

import { DrawerOrInline } from './DrawerOrInline.pure'

const mockUseMediaQuery = jest.fn()

jest.mock('@cowprotocol/common-hooks', () => {
  const actual = jest.requireActual('@cowprotocol/common-hooks') as typeof import('@cowprotocol/common-hooks')

  return {
    ...actual,
    useMediaQuery: (...args: unknown[]) => mockUseMediaQuery(...args),
  }
})

jest.mock('./BottomDrawer.pure', () => ({
  BottomDrawer: ({ children, open }: { children: ReactNode; open: boolean }) => (
    <div data-testid="bottom-drawer" data-open={String(open)}>
      {children}
    </div>
  ),
}))

function renderDrawer(
  isOpen: boolean,
  onOpenChange = jest.fn(),
): ReturnType<typeof render> & {
  onOpenChange: jest.Mock
} {
  const view = render(
    <DrawerOrInline isOpen={isOpen} onOpenChange={onOpenChange}>
      <div>orders</div>
    </DrawerOrInline>,
  )

  return { ...view, onOpenChange }
}

describe('DrawerOrInline', () => {
  beforeEach(() => {
    mockUseMediaQuery.mockReset()
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
