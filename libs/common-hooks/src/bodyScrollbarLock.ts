import { addBodyClass, removeBodyClass } from '@cowprotocol/common-utils'

export const BODY_NO_SCROLL_CLASS = 'noScroll'

let lockCount = 0

export function acquireBodyScrollbarLock(): void {
  lockCount += 1

  if (lockCount === 1) {
    addBodyClass(BODY_NO_SCROLL_CLASS)
  }
}

export function releaseBodyScrollbarLock(): void {
  if (lockCount === 0) {
    return
  }

  lockCount -= 1

  if (lockCount === 0) {
    removeBodyClass(BODY_NO_SCROLL_CLASS)
  }
}

/** Test-only: drop every outstanding lock so cases cannot leak into each other. */
export function resetBodyScrollbarLockForTests(): void {
  lockCount = 0
  removeBodyClass(BODY_NO_SCROLL_CLASS)
}
