import { fireEvent, render } from '@testing-library/react'

import { BottomDrawer } from './BottomDrawer.pure'

describe('BottomDrawer', () => {
  it('forces the backdrop to render for a nested drawer', () => {
    const { container } = render(
      <BottomDrawer open onOpenChange={jest.fn()}>
        <BottomDrawer open nested onOpenChange={jest.fn()}>
          Nested content
        </BottomDrawer>
      </BottomDrawer>,
    )

    const backdrops = container.ownerDocument.querySelectorAll<HTMLElement>('[data-bottom-drawer-backdrop]')
    const viewports = container.ownerDocument.querySelectorAll<HTMLElement>('[data-bottom-drawer-viewport]')

    expect(backdrops).toHaveLength(2)
    expect(viewports).toHaveLength(2)
    expect(getComputedStyle(backdrops[0]).zIndex).toBe('1000')
    expect(getComputedStyle(backdrops[1]).zIndex).toBe('1002')
    expect(getComputedStyle(viewports[0]).zIndex).toBe('1001')
    expect(getComputedStyle(viewports[1]).zIndex).toBe('1003')
  })

  it('exposes whether its content has been scrolled', () => {
    const { container } = render(
      <BottomDrawer open onOpenChange={jest.fn()}>
        Content
      </BottomDrawer>,
    )
    const content = container.ownerDocument.querySelector<HTMLElement>('[data-drawer-content]')

    expect(content).not.toBeNull()
    expect(content?.hasAttribute('data-scrolled')).toBe(false)

    if (!content) {
      return
    }

    Object.defineProperty(content, 'scrollTop', { configurable: true, value: 12 })
    fireEvent.scroll(content)

    expect(content.getAttribute('data-scrolled')).toBe('true')

    Object.defineProperty(content, 'scrollTop', { configurable: true, value: 0 })
    fireEvent.scroll(content)

    expect(content.hasAttribute('data-scrolled')).toBe(false)
  })
})
