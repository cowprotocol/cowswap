import { renderHook, waitFor } from '@testing-library/react'
import ms from 'ms.macro'

jest.mock('@lingui/react', () => ({
  useLingui: () => ({
    i18n: {
      locale: 'en-US',
    },
  }),
}))

import { useTimeAgo } from './useTimeAgo'

describe('useTimeAgo', () => {
  const now = new Date('2026-03-17T12:00:00.000Z')

  async function renderTimeAgo(offset: number): Promise<string> {
    const futureDate = new Date(now.getTime() + offset)
    const { result } = renderHook(() => useTimeAgo(futureDate))

    await waitFor(() => {
      expect(result.current).not.toBe('')
    })

    return result.current
  }

  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(now)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('matches snapshot for 23 hours in the future', async () => {
    await expect(renderTimeAgo(ms`23h`)).resolves.toMatchInlineSnapshot(`"in 23 hours"`)
  })

  it('matches snapshot for 2 hours in the future', async () => {
    await expect(renderTimeAgo(ms`2h`)).resolves.toMatchInlineSnapshot(`"in 2 hours"`)
  })

  it('matches snapshot for 1.5 hours in the future', async () => {
    await expect(renderTimeAgo(ms`1.5h`)).resolves.toMatchInlineSnapshot(`"in 1 hour"`)
  })

  it('matches snapshot for 1 hour 50 minutes in the future', async () => {
    await expect(renderTimeAgo(ms`110m`)).resolves.toMatchInlineSnapshot(`"in 1 hour"`)
  })

  it('matches snapshot for 30 minutes in the future', async () => {
    await expect(renderTimeAgo(ms`30m`)).resolves.toMatchInlineSnapshot(`"in 30 minutes"`)
  })

  it('matches snapshot for 2 minutes in the future', async () => {
    await expect(renderTimeAgo(ms`2m`)).resolves.toMatchInlineSnapshot(`"in 2 minutes"`)
  })
})
