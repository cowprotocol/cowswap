export interface BalancesEventHandlers {
  onAllBalances: (balances: Record<string, string>) => void
  onBalanceUpdate: (address: string, balance: string) => void
  onError?: (error: Error) => void
  onOpen: () => void
  onClose: () => void
}

/**
 * Creates and configures an EventSource for real-time balance updates.
 * Handles all SSE event types: all_balances, balance_update, error
 */
export function createBalancesEventSource(url: string, handlers: BalancesEventHandlers): EventSource {
  const { onAllBalances, onBalanceUpdate, onError, onOpen, onClose } = handlers

  console.debug('[BalancesWatcher] Connecting to SSE:', url)
  const eventSource = new EventSource(url)

  eventSource.onopen = (): void => {
    console.debug('[BalancesWatcher] SSE connection opened')
    onOpen()
  }

  // Full balance snapshot (sent on connect and periodically)
  eventSource.addEventListener('all_balances', (event: MessageEvent): void => {
    try {
      const { balances } = JSON.parse(event.data)
      if (balances && Object.keys(balances).length > 0) {
        onAllBalances(balances)
      }
    } catch {
      // Ignore parse errors
    }
  })

  // Single token balance update (on Transfer events)
  eventSource.addEventListener('balance_update', (event: MessageEvent): void => {
    try {
      const { address, balance } = JSON.parse(event.data)
      if (address && balance != null) {
        onBalanceUpdate(address.toLowerCase(), balance)
      }
    } catch {
      // Ignore parse errors
    }
  })

  // Server-sent error events
  eventSource.addEventListener('error', (event: MessageEvent): void => {
    try {
      const { message, code } = JSON.parse(event.data)
      onError?.(new Error(`BalancesWatcher Error ${code}: ${message}`))
    } catch {
      // Ignore parse errors
    }
  })

  // Connection error/close handling
  eventSource.onerror = (event): void => {
    console.debug('[BalancesWatcher] SSE error, readyState:', eventSource.readyState, event)
    if (eventSource.readyState === EventSource.CLOSED) {
      console.debug('[BalancesWatcher] SSE connection closed')
      onClose()
    }
  }

  return eventSource
}
