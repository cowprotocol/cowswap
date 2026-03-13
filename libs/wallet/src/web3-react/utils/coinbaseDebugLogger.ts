let debugEnabled: boolean = false

if (typeof window !== 'undefined') {
  debugEnabled = new URLSearchParams(window.location.search).get('debug_coinbase') === '1'
}

export function coinbaseDebug(message: string, ...args: unknown[]): void {
  if (debugEnabled) {
    console.log(`[CB-DEBUG] ${message}`, ...args)
  }
}
