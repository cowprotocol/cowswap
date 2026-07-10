import { PromiseWithTimeout } from './promiseWithTimeout'

describe('PromiseWithTimeout', () => {
  it('resolves when the handler calls resolve before the timeout', async () => {
    await expect(PromiseWithTimeout(1000, (resolve) => resolve('ok'))).resolves.toBe('ok')
  })

  it('rejects when the promise times out before resolve', async () => {
    const p = PromiseWithTimeout(50, () => {
      /* never resolves */
    })
    await expect(p).rejects.toThrow('Promise timed out after 50ms')
  }, 10_000)

  it('clears the timeout when resolve is called', async () => {
    await expect(
      PromiseWithTimeout(10_000, (resolve) => {
        resolve(42)
      }),
    ).resolves.toBe(42)
  })

  it('rejects when the handler throws synchronously', async () => {
    const err = new Error('boom')
    const p = PromiseWithTimeout(1000, () => {
      throw err
    })
    await expect(p).rejects.toBe(err)
  })

  it('works as a constructor: new PromiseWithTimeout(...)', async () => {
    const p = new PromiseWithTimeout<string>(1000, (resolve) => resolve('ctor'))
    await expect(p).resolves.toBe('ctor')
  })
})
