import { createStore } from 'jotai'

import { asyncAtomFamily } from './asyncAtomFamily'

function flushMicrotasks(): Promise<void> {
  return Promise.resolve().then(() => undefined)
}

describe('asyncAtomFamily', () => {
  it('sets atom value when fetcher resolves with data', async () => {
    const family = asyncAtomFamily(async (id: number) => ({ id }), {
      familyLabel: 'testFamily',
      valueOnError: { id: -1 },
    })

    const store = createStore()
    const a = family(1)
    const unsub = store.sub(a, () => {})

    await flushMicrotasks()

    expect(store.get(a)).toEqual({ id: 1 })
    unsub()
  })

  it('leaves atom null when fetcher resolves to null', async () => {
    const family = asyncAtomFamily(async () => null, {
      familyLabel: 'skipFamily',
      valueOnError: {},
    })

    const store = createStore()
    const a = family(0)
    const unsub = store.sub(a, () => {})

    await flushMicrotasks()

    expect(store.get(a)).toBeNull()
    unsub()
  })

  it('sets valueOnError when fetcher rejects', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    const family = asyncAtomFamily(
      async () => {
        throw new Error('fail')
      },
      {
        familyLabel: 'errFamily',
        valueOnError: { ok: false },
      },
    )

    const store = createStore()
    const a = family(1)
    const unsub = store.sub(a, () => {})

    await flushMicrotasks()

    expect(consoleSpy).toHaveBeenCalled()
    expect(store.get(a)).toEqual({ ok: false })

    consoleSpy.mockRestore()
    unsub()
  })

  it('removes param from family on unmount', async () => {
    const family = asyncAtomFamily(async (id: number) => ({ id }), {
      familyLabel: 'removeFamily',
      valueOnError: { id: -1 },
    })

    const store = createStore()
    const a = family(42)
    const unsub = store.sub(a, () => {})

    await flushMicrotasks()
    expect(store.get(a)).toEqual({ id: 42 })

    unsub()
    await flushMicrotasks()

    expect([...family.getParams()].length).toBe(0)
  })

  it('logs a leak warning when cached members exceed maxFamilyMembersWarning', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

    const family = asyncAtomFamily(async (id: number) => ({ id }), {
      familyLabel: 'leakFamily',
      maxFamilyMembersWarning: 2,
      valueOnError: { id: -1 },
    })

    const store = createStore()
    const unsubs: Array<() => void> = []

    for (let i = 0; i < 3; i++) {
      const a = family(i)
      unsubs.push(store.sub(a, () => {}))
    }

    await flushMicrotasks()

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[leakFamily] Possible memory leak: 3 cached'))

    warnSpy.mockRestore()
    unsubs.forEach((u) => u())
  })
})
