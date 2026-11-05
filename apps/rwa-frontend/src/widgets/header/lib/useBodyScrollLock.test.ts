import { renderHook } from '@testing-library/react'

import { useBodyScrollLock } from './useBodyScrollLock'

describe('useBodyScrollLock', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      value: () => ({ matches: true, addEventListener: () => undefined, removeEventListener: () => undefined }),
    })
  })

  it('keeps the page locked until every holder releases it', () => {
    const menu = renderHook(({ isLocked }) => useBodyScrollLock(isLocked), { initialProps: { isLocked: true } })
    const search = renderHook(({ isLocked }) => useBodyScrollLock(isLocked), { initialProps: { isLocked: true } })

    expect(document.body.style.overflow).toBe('hidden')

    search.rerender({ isLocked: false })

    expect(document.body.style.overflow).toBe('hidden')

    menu.rerender({ isLocked: false })

    expect(document.body.style.overflow).toBe('')
  })
})
