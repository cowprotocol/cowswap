import { waitForSelector } from './waitForSelector.utils'

describe('waitForSelector', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('resolves immediately when the element is already attached', async () => {
    document.body.innerHTML = '<div data-id="order-1"></div>'

    const promise = waitForSelector('[data-id="order-1"]')
    await expect(promise).resolves.toBeInstanceOf(Element)
  })

  it('resolves once the element appears before the timeout', async () => {
    const promise = waitForSelector('[data-id="order-1"]', { timeout: 500, polling: 50 })

    jest.advanceTimersByTime(100)
    document.body.innerHTML = '<div data-id="order-1"></div>'
    jest.advanceTimersByTime(50)

    await expect(promise).resolves.toBeInstanceOf(Element)
  })

  it('resolves with null when the timeout elapses', async () => {
    const promise = waitForSelector('[data-id="missing"]', { timeout: 200, polling: 50 })

    jest.advanceTimersByTime(250)

    await expect(promise).resolves.toBeNull()
  })

  it('waits for detached state', async () => {
    document.body.innerHTML = '<div data-id="order-1"></div>'

    const promise = waitForSelector('[data-id="order-1"]', { state: 'detached', timeout: 500, polling: 50 })

    jest.advanceTimersByTime(50)
    document.body.innerHTML = ''
    jest.advanceTimersByTime(50)

    await expect(promise).resolves.toBeNull()
  })
})
