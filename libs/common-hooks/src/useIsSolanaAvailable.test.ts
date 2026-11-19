import { renderHook } from '@testing-library/react'

async function renderIsSolanaAvailable(hash: string): Promise<boolean> {
  window.location.hash = hash
  // The flag is read at module load, so each case needs a fresh module instance.
  jest.resetModules()

  const { useIsSolanaAvailable } = await import('./useIsSolanaAvailable')

  return renderHook(() => useIsSolanaAvailable()).result.current
}

describe('useIsSolanaAvailable', () => {
  afterEach(() => {
    window.location.hash = ''
  })

  it('is true outside the widget', async () => {
    expect(await renderIsSolanaAvailable('')).toBe(true)
  })

  it('is false inside the widget until a partner opts in', async () => {
    expect(await renderIsSolanaAvailable('#/1/widget/swap/_/_')).toBe(false)
  })

  it('follows the opt-in carried in the widget URL', async () => {
    expect(await renderIsSolanaAvailable('#/1/widget/swap/_/_?solanaEnabled=true')).toBe(true)
  })

  it('ignores the flag outside the widget', async () => {
    expect(await renderIsSolanaAvailable('#/1/swap/_/_?solanaEnabled=true')).toBe(true)
  })
})
