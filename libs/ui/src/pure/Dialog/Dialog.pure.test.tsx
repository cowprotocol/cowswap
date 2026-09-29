import { render } from '@testing-library/react'

import { Dialog } from './Dialog.pure'

import { OVERLAY_Z_INDEX } from '../../consts'

describe('Dialog', () => {
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

  it('stacks backdrop and viewport inside one overlay layer', () => {
    const { container } = render(
      <Dialog isOpen onOpenChange={jest.fn()}>
        Content
      </Dialog>,
    )

    const layer = container.ownerDocument.querySelector<HTMLElement>('[data-dialog-layer]')
    const backdrop = container.ownerDocument.querySelector<HTMLElement>('[data-dialog-backdrop]')
    const viewport = container.ownerDocument.querySelector<HTMLElement>('[data-dialog-viewport]')

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

  it('always renders a backdrop that covers a parent dialog', () => {
    const { container } = render(
      <Dialog isOpen onOpenChange={jest.fn()}>
        Orders
        <Dialog isOpen onOpenChange={jest.fn()} variant="narrow">
          Receipt
        </Dialog>
      </Dialog>,
    )

    const layers = container.ownerDocument.querySelectorAll<HTMLElement>('[data-dialog-layer]')
    const backdrops = container.ownerDocument.querySelectorAll<HTMLElement>('[data-dialog-backdrop]')

    expect(layers).toHaveLength(2)
    expect(backdrops).toHaveLength(2)
    expect(layers[0].contains(backdrops[0])).toBe(true)
    expect(layers[1].contains(backdrops[1])).toBe(true)
    expect(layers[0].compareDocumentPosition(layers[1]) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
  })
})
