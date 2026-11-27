import { i18n } from '@lingui/core'

import { act, render, screen } from '@testing-library/react'

import { ModalHeader } from './ModalHeader.pure'

i18n.load('en-US', {})
i18n.activate('en-US')

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null
  readonly rootMargin = ''
  readonly scrollMargin = ''
  readonly thresholds: number[] = []
  readonly callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    observerInstances.push(this)
  }

  disconnect(): void {}
  observe(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
  unobserve(): void {}
}

let observerInstances: MockIntersectionObserver[] = []

describe('ModalHeader', () => {
  beforeEach(() => {
    observerInstances = []
    global.IntersectionObserver = MockIntersectionObserver
  })

  it('reports when the scrollable bottom slot leaves the overlay scrollport', () => {
    const onScrollableBottomVisibilityChange = jest.fn()

    render(
      <div data-modal-root="">
        <ModalHeader
          title="Orders"
          scrollableBottomSlot={<div>Tabs</div>}
          onScrollableBottomVisibilityChange={onScrollableBottomVisibilityChange}
        />
      </div>,
    )

    expect(screen.getByText('Tabs')).not.toBeNull()

    const observer = observerInstances[0]

    if (!observer) {
      throw new Error('Expected an IntersectionObserver for the scrollable bottom slot')
    }

    act(() => {
      observer.callback([{ isIntersecting: true } as IntersectionObserverEntry], observer)
    })
    act(() => {
      observer.callback([{ isIntersecting: false } as IntersectionObserverEntry], observer)
    })

    expect(onScrollableBottomVisibilityChange).toHaveBeenNthCalledWith(1, true)
    expect(onScrollableBottomVisibilityChange).toHaveBeenNthCalledWith(2, false)
  })

  it('does not observe visibility when no listener is provided', () => {
    render(
      <div data-modal-root="">
        <ModalHeader title="Orders" scrollableBottomSlot={<div>Tabs</div>} />
      </div>,
    )

    expect(observerInstances).toHaveLength(0)
  })

  it('keeps subtitle and right slot mounted while they are hidden', () => {
    const { rerender } = render(
      <ModalHeader
        title="Orders"
        subtitle="Open (3)"
        hideSubtitle
        hideRightSlot
        rightSlot={<button type="button">Filters</button>}
      />,
    )

    const subtitle = screen.getByText('Open (3)').closest('[aria-hidden]')
    const filtersButton = screen.getByRole('button', { name: 'Filters', hidden: true })
    const rightSlot = filtersButton.parentElement

    expect(subtitle?.getAttribute('aria-hidden')).toBe('true')
    expect(rightSlot?.getAttribute('aria-hidden')).toBe('true')

    rerender(<ModalHeader title="Orders" subtitle="Open (3)" rightSlot={<button type="button">Filters</button>} />)

    expect(subtitle?.getAttribute('aria-hidden')).toBe('false')
    expect(rightSlot?.getAttribute('aria-hidden')).toBe('false')
  })

  it('still accepts children as the title for existing call sites', () => {
    render(<ModalHeader onClose={() => undefined}>Pool description</ModalHeader>)

    expect(screen.getByText('Pool description')).not.toBeNull()
  })

  it('renders the title with a polymorphic titleAs element', () => {
    const { container } = render(<ModalHeader title="Orders" titleAs="h2" onClose={() => undefined} />)

    expect(container.querySelector('h2')?.textContent).toBe('Orders')
  })

  it('renders headerContent in flow and keeps the close button clickable over chrome', () => {
    const onClose = jest.fn()

    const { container } = render(<ModalHeader headerContent={<div>Success heading</div>} onClose={onClose} />)

    expect(screen.getByText('Success heading')).not.toBeNull()

    const chrome = container.querySelector('.overlay')
    expect(chrome).not.toBeNull()

    const closeButton = screen.getByRole('button', { name: 'Close' })
    expect(closeButton.hasAttribute('disabled')).toBe(false)
    closeButton.click()
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('keeps back and right-slot controls clickable when headerContent overlays chrome', () => {
    const onBack = jest.fn()
    const onRightSlotClick = jest.fn()

    const { container } = render(
      <ModalHeader
        headerContent={<div>Success heading</div>}
        onBack={onBack}
        rightSlot={
          <button type="button" onClick={onRightSlotClick}>
            Filters
          </button>
        }
      />,
    )

    expect(container.querySelector('.overlay')).not.toBeNull()

    const backButton = screen.getByRole('button', { name: 'Back' })
    expect(backButton.hasAttribute('disabled')).toBe(false)
    backButton.click()
    expect(onBack).toHaveBeenCalledTimes(1)

    screen.getByRole('button', { name: 'Filters' }).click()
    expect(onRightSlotClick).toHaveBeenCalledTimes(1)
  })
})
