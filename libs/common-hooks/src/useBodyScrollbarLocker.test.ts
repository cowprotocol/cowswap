import { addBodyClass, removeBodyClass } from '@cowprotocol/common-utils'

import { renderHook } from '@testing-library/react'

import { BODY_NO_SCROLL_CLASS, resetBodyScrollbarLockForTests } from './bodyScrollbarLock'
import { useBodyScrollbarLocker } from './useBodyScrollbarLocker'

jest.mock('@cowprotocol/common-utils', () => ({
  addBodyClass: jest.fn(),
  removeBodyClass: jest.fn(),
}))

const addBodyClassMock = addBodyClass as jest.MockedFunction<typeof addBodyClass>
const removeBodyClassMock = removeBodyClass as jest.MockedFunction<typeof removeBodyClass>

function useTwoLockers(firstActive: boolean, secondActive: boolean): void {
  useBodyScrollbarLocker(firstActive)
  useBodyScrollbarLocker(secondActive)
}

describe('useBodyScrollbarLocker', () => {
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
    resetBodyScrollbarLockForTests()
    addBodyClassMock.mockClear()
    removeBodyClassMock.mockClear()
  })

  it('locks the body while active and unlocks on unmount', () => {
    const { unmount } = renderHook(() => useBodyScrollbarLocker(true))

    expect(addBodyClassMock).toHaveBeenCalledWith(BODY_NO_SCROLL_CLASS)

    unmount()
    expect(removeBodyClassMock).toHaveBeenCalledWith(BODY_NO_SCROLL_CLASS)
  })

  it('keeps noScroll while another locker is still active', () => {
    const { rerender } = renderHook(({ firstActive, secondActive }) => useTwoLockers(firstActive, secondActive), {
      initialProps: { firstActive: true, secondActive: true },
    })

    expect(addBodyClassMock).toHaveBeenCalledTimes(1)

    rerender({ firstActive: false, secondActive: true })
    expect(removeBodyClassMock).not.toHaveBeenCalled()

    rerender({ firstActive: false, secondActive: false })
    expect(removeBodyClassMock).toHaveBeenCalledTimes(1)
    expect(removeBodyClassMock).toHaveBeenCalledWith(BODY_NO_SCROLL_CLASS)
  })
})
