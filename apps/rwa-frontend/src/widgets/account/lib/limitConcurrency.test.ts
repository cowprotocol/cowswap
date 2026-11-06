import { limitConcurrency } from './limitConcurrency'

function deferred(): { promise: Promise<string>; resolve(value: string): void; reject(error: Error): void } {
  let resolve: (value: string) => void = () => undefined
  let reject: (error: Error) => void = () => undefined
  const promise = new Promise<string>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}

async function flush(): Promise<void> {
  for (let i = 0; i < 5; i++) await Promise.resolve()
}

describe('limitConcurrency', () => {
  it('runs at most `limit` tasks at once and starts the next one when a slot frees up', async () => {
    const limit = limitConcurrency(2)
    const tasks = [deferred(), deferred(), deferred()]
    const started = tasks.map(() => jest.fn())
    const results = tasks.map((task, index) =>
      limit(() => {
        started[index]?.()
        return task.promise
      }),
    )

    await flush()
    expect(started.map((fn) => fn.mock.calls.length)).toEqual([1, 1, 0])

    tasks[0]?.resolve('a')
    await flush()
    expect(started[2]).toHaveBeenCalledTimes(1)

    tasks[1]?.resolve('b')
    tasks[2]?.resolve('c')
    await expect(Promise.all(results)).resolves.toEqual(['a', 'b', 'c'])
  })

  it('frees the slot of a failed task', async () => {
    const limit = limitConcurrency(1)
    const failing = deferred()
    const first = limit(() => failing.promise)
    const second = limit(() => Promise.resolve('ok'))

    failing.reject(new Error('down'))

    await expect(first).rejects.toThrow('down')
    await expect(second).resolves.toBe('ok')
  })
})
