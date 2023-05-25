import { wait } from './wait'

export async function pollUntil<T>(
  fn: () => Promise<T | null>,
  fnCondition: (result: T | null) => boolean,
  ms: number
): Promise<T | null> {
  let result = await fn()

  while (fnCondition(result)) {
    await wait(ms)
    result = await fn()
  }

  return result
}
