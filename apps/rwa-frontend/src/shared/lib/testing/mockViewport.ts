import { act } from 'react'

type ChangeListener = () => void

/** Answers `max-width` queries as a viewport `initialWidth` wide, and returns a function that resizes it. For tests */
export function mockViewport(initialWidth: number): (width: number) => void {
  const listeners = new Map<ChangeListener, string>()
  let width = initialWidth

  const matchesAt = (query: string, atWidth: number): boolean => atWidth <= Number(query.match(/\d+/)?.[0])

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      get matches() {
        return matchesAt(query, width)
      },
      media: query,
      addEventListener: (_: string, listener: ChangeListener) => listeners.set(listener, query),
      removeEventListener: (_: string, listener: ChangeListener) => listeners.delete(listener),
    }),
  })

  return (next) => {
    const flipped = [...listeners].filter(([, query]) => matchesAt(query, width) !== matchesAt(query, next))

    width = next

    // Browsers fire each MediaQueryList separately and React commits between them, which can remove a later listener
    flipped.forEach(([listener]) => {
      if (listeners.has(listener)) act(() => listener())
    })
  }
}
