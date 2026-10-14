import {
  HIGHLIGHT_ORDER_ROW_CLASS,
  HIGHLIGHT_ORDER_ROW_DURATION_MS,
  HIGHLIGHT_ORDER_ROW_TIMEOUT_MS,
} from './highlightOrderRow.constants'
import { waitForSelector, WaitForSelectorOptions } from './waitForSelector.utils'

export type HighlightOrderRowOptions = Pick<WaitForSelectorOptions, 'timeout' | 'polling'>

/**
 * Finds an orders-table row by `data-id` and briefly blinks its background.
 * Returns `true` if the row was found in the DOM within the timeout.
 */
export async function highlightOrderRow(orderId: string, options: HighlightOrderRowOptions = {}): Promise<boolean> {
  const { timeout = HIGHLIGHT_ORDER_ROW_TIMEOUT_MS, polling } = options
  const selector = `[data-id="${escapeAttributeValue(orderId)}"]`

  const element = await waitForSelector(selector, { timeout, polling, state: 'attached' })

  if (!element) {
    return false
  }

  element.classList.add(HIGHLIGHT_ORDER_ROW_CLASS)

  setTimeout(() => {
    element.classList.remove(HIGHLIGHT_ORDER_ROW_CLASS)
  }, HIGHLIGHT_ORDER_ROW_DURATION_MS)

  return true
}

function escapeAttributeValue(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value)
  }

  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}
