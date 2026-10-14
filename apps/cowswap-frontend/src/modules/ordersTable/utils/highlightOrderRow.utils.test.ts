import { HIGHLIGHT_ORDER_ROW_CLASS, HIGHLIGHT_ORDER_ROW_DURATION_MS } from './highlightOrderRow.constants'
import { highlightOrderRow } from './highlightOrderRow.utils'

describe('highlightOrderRow', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns true and blinks when the row is found', async () => {
    document.body.innerHTML = '<div data-id="event-1"></div>'
    const row = document.querySelector('[data-id="event-1"]')

    const promise = highlightOrderRow('event-1', { timeout: 200, polling: 50 })
    await expect(promise).resolves.toBe(true)

    expect(row?.classList.contains(HIGHLIGHT_ORDER_ROW_CLASS)).toBe(true)

    jest.advanceTimersByTime(HIGHLIGHT_ORDER_ROW_DURATION_MS)
    expect(row?.classList.contains(HIGHLIGHT_ORDER_ROW_CLASS)).toBe(false)
  })

  it('returns false when the row is not found before the timeout', async () => {
    const promise = highlightOrderRow('missing', { timeout: 150, polling: 50 })

    jest.advanceTimersByTime(200)

    await expect(promise).resolves.toBe(false)
  })
})
