/** Runs at most `limit` of the tasks passed to the returned function at once, the others wait in call order */
export function limitConcurrency(limit: number): <T>(task: () => Promise<T>) => Promise<T> {
  let running = 0
  const queue: (() => void)[] = []

  const release = (): void => {
    running--
    queue.shift()?.()
  }

  return async <T>(task: () => Promise<T>): Promise<T> => {
    if (running >= limit) await new Promise<void>((resolve) => queue.push(resolve))

    running++

    try {
      return await task()
    } finally {
      release()
    }
  }
}
