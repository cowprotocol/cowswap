import type { ReactNode } from 'react'

import { act, render } from '@testing-library/react'

import { useMediaQuery } from './useMediaQuery'

function ResponsiveContent(): ReactNode {
  return <p>{useMediaQuery('(max-width: 600px)') ? 'Mobile' : 'Desktop'}</p>
}

it('hydrates server markup before applying and subscribing to the browser media query', () => {
  const container = document.createElement('div')
  container.innerHTML = '<p>Desktop</p>'
  const serverContent = container.firstElementChild

  const originalMatchMedia = Object.getOwnPropertyDescriptor(window, 'matchMedia')
  const media = Object.assign(new EventTarget(), { matches: true })
  Object.defineProperty(window, 'matchMedia', { configurable: true, value: () => media })

  try {
    render(<ResponsiveContent />, { container, hydrate: true })

    expect(container.firstElementChild).toBe(serverContent)
    expect(container.textContent).toBe('Mobile')

    act(() => {
      media.matches = false
      media.dispatchEvent(new Event('change'))
    })

    expect(container.textContent).toBe('Desktop')
  } finally {
    if (originalMatchMedia) {
      Object.defineProperty(window, 'matchMedia', originalMatchMedia)
    } else {
      Reflect.deleteProperty(window, 'matchMedia')
    }
  }
})
