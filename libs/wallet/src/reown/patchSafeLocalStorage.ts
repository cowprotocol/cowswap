import { isSafe, SafeLocalStorage, SafeLocalStorageKey } from '@reown/appkit-common'

import { WAGMI_STORAGE_KEY } from '../wagmiStorage'

/**
 * Isolates localStorage of Reown depending on environment
 */
export function patchSafeLocalStorage(): void {
  Object.assign(SafeLocalStorage, {
    setItem(key: SafeLocalStorageKey, value?: string): void {
      if (isSafe() && value !== undefined) {
        localStorage.setItem(WAGMI_STORAGE_KEY + key, value)
      }
    },
    getItem(key: SafeLocalStorageKey): string | undefined {
      if (isSafe()) {
        return localStorage.getItem(WAGMI_STORAGE_KEY + key) || undefined
      }

      return undefined
    },
    removeItem(key: SafeLocalStorageKey): void {
      if (isSafe()) {
        localStorage.removeItem(WAGMI_STORAGE_KEY + key)
      }
    },
    clear(): void {
      if (isSafe()) {
        localStorage.clear()
      }
    },
  })
}
