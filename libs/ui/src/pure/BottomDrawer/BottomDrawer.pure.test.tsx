import { render } from '@testing-library/react'

import { BottomDrawer } from './BottomDrawer.pure'

import { OVERLAY_Z_INDEX } from '../../consts'

describe('BottomDrawer', () => {
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

  it('stacks the drawer overlay in the shared overlay layer', () => {
    const { container } = render(
      <BottomDrawer isOpen onOpenChange={jest.fn()}>
        Content
      </BottomDrawer>,
    )

    const layer = container.ownerDocument.querySelector<HTMLElement>('[data-bottom-drawer-layer]')
    const backdrop = container.ownerDocument.querySelector<HTMLElement>('[data-bottom-drawer-backdrop]')
    const viewport = container.ownerDocument.querySelector<HTMLElement>('[data-bottom-drawer-viewport]')

    expect(layer).not.toBeNull()
    expect(backdrop).not.toBeNull()
    expect(viewport).not.toBeNull()

    if (!layer || !backdrop || !viewport) {
      return
    }

    expect(getComputedStyle(layer).zIndex).toBe(String(OVERLAY_Z_INDEX.overlay))
    expect(layer.contains(backdrop)).toBe(true)
    expect(layer.contains(viewport)).toBe(true)
  })

  it('always renders a backdrop that covers a parent drawer', () => {
    const { container } = render(
      <BottomDrawer isOpen onOpenChange={jest.fn()}>
        Parent
        <BottomDrawer isOpen onOpenChange={jest.fn()}>
          Nested
        </BottomDrawer>
      </BottomDrawer>,
    )

    const layers = container.ownerDocument.querySelectorAll<HTMLElement>('[data-bottom-drawer-layer]')
    const backdrops = container.ownerDocument.querySelectorAll<HTMLElement>('[data-bottom-drawer-backdrop]')

    expect(layers).toHaveLength(2)
    expect(backdrops).toHaveLength(2)
    expect(layers[0].contains(backdrops[0])).toBe(true)
    expect(layers[1].contains(backdrops[1])).toBe(true)
    expect(layers[0].compareDocumentPosition(layers[1]) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
  })
})
