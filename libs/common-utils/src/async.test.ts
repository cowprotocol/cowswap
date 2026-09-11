import { slowPromiseHandler } from './async'

describe('slowPromiseHandler()', () => {
  it('resolves with the promise value', async () => {
    await expect(slowPromiseHandler(Promise.resolve('ok'), jest.fn(), { maxDuration: 100 })).resolves.toBe('ok')
  })

  it('does not call onSlow when the promise settles before maxDuration', async () => {
    const onSlow = jest.fn()

    await slowPromiseHandler(Promise.resolve('ok'), onSlow, { maxDuration: 100 })

    await delay(150)
    expect(onSlow).not.toHaveBeenCalled()
  })

  it('calls onSlow when the promise is still pending after maxDuration', async () => {
    const onSlow = jest.fn()
    let resolvePromise: ((value: string) => void) | undefined

    const pendingPromise = new Promise<string>((resolve) => {
      resolvePromise = resolve
    })

    const resultPromise = slowPromiseHandler(pendingPromise, onSlow, { maxDuration: 50 })

    await delay(75)
    expect(onSlow).toHaveBeenCalledTimes(1)

    resolvePromise?.('done')
    await expect(resultPromise).resolves.toBe('done')
  })

  it('applies fakeDelay after the promise resolves', async () => {
    const startedAt = Date.now()

    await slowPromiseHandler(Promise.resolve('ok'), jest.fn(), { maxDuration: 1_000, fakeDelay: 50 })

    expect(Date.now() - startedAt).toBeGreaterThanOrEqual(45)
  })

  it('propagates promise rejection', async () => {
    await expect(
      slowPromiseHandler(Promise.reject(new Error('failed')), jest.fn(), { maxDuration: 100 }),
    ).rejects.toThrow('failed')
  })
})

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
