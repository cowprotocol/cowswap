import { render } from '@testing-library/react'

import { OVERLAY_Z_INDEX } from '../../consts'
import { BottomDrawer } from '../BottomDrawer/BottomDrawer.pure'
import { Dialog } from '../Dialog/Dialog.pure'

describe('overlay stacking', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })),
    })
  })

  it('lets a later drawer portal paint over an earlier dialog', () => {
    const { container } = render(
      <>
        <Dialog isOpen onOpenChange={jest.fn()}>
          Orders
        </Dialog>
        <BottomDrawer isOpen onOpenChange={jest.fn()}>
          Filters
        </BottomDrawer>
      </>,
    )

    const layers = container.ownerDocument.querySelectorAll<HTMLElement>('[data-overlay-layer]')

    expect(layers).toHaveLength(2)
    expect(getComputedStyle(layers[0]).zIndex).toBe(String(OVERLAY_Z_INDEX.overlay))
    expect(getComputedStyle(layers[1]).zIndex).toBe(String(OVERLAY_Z_INDEX.overlay))
    expect(layers[0].hasAttribute('data-dialog-layer')).toBe(true)
    expect(layers[1].hasAttribute('data-bottom-drawer-layer')).toBe(true)
    expect(layers[0].compareDocumentPosition(layers[1]) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
  })
})
