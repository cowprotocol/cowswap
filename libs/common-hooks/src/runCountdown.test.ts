import { runCountdown } from './runCountdown'

describe('runCountdown', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.useRealTimers()
  })

  function msUntil(targetEpochMs: number): () => number {
    return () => targetEpochMs - Date.now()
  }

  it('ticks immediately and then once per displayed second', () => {
    const onTick = jest.fn()

    runCountdown(msUntil(Date.now() + 3000), onTick)
    expect(onTick.mock.calls).toEqual([[3]])

    jest.advanceTimersByTime(999)
    expect(onTick).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(1)
    expect(onTick.mock.calls).toEqual([[3], [2]])
  })

  it('aligns the first wake-up to a fractional target', () => {
    const onTick = jest.fn()

    runCountdown(msUntil(Date.now() + 2300), onTick)
    expect(onTick).toHaveBeenLastCalledWith(3)

    jest.advanceTimersByTime(299)
    expect(onTick).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(1)
    expect(onTick).toHaveBeenLastCalledWith(2)
  })

  it('sleeps between displayed seconds', () => {
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout')

    runCountdown(msUntil(Date.now() + 3000), jest.fn())
    jest.advanceTimersByTime(3000)

    expect(setTimeoutSpy).toHaveBeenCalledTimes(3)
  })

  it('stops after reaching zero', () => {
    const onTick = jest.fn()

    runCountdown(msUntil(Date.now() + 2000), onTick)
    jest.advanceTimersByTime(5000)

    expect(onTick.mock.calls).toEqual([[2], [1], [0]])
    expect(jest.getTimerCount()).toBe(0)
  })

  it('ticks once with zero for a target in the past', () => {
    const onTick = jest.fn()

    runCountdown(msUntil(Date.now() - 5000), onTick)

    expect(onTick.mock.calls).toEqual([[0]])
    expect(jest.getTimerCount()).toBe(0)
  })

  it('retries after 100ms when onTick returns false', () => {
    const onTick = jest.fn().mockReturnValueOnce(false)

    runCountdown(msUntil(Date.now() + 90_000), onTick)
    expect(onTick).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(100)
    expect(onTick).toHaveBeenCalledTimes(2)
    expect(onTick).toHaveBeenLastCalledWith(90)

    jest.advanceTimersByTime(800)
    expect(onTick).toHaveBeenCalledTimes(2)
  })

  it('stops when the returned function is called', () => {
    const onTick = jest.fn()

    const stop = runCountdown(msUntil(Date.now() + 90_000), onTick)
    stop()
    jest.advanceTimersByTime(5000)

    expect(onTick).toHaveBeenCalledTimes(1)
    expect(jest.getTimerCount()).toBe(0)
  })
})
