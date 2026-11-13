import { renderHook } from '@testing-library/react'

import { getCowSoundSuccess } from 'modules/sounds'

import { useClaimMoo } from './useClaimMoo'

jest.mock('modules/sounds', () => ({
  getCowSoundSuccess: jest.fn(),
}))

const getCowSoundSuccessMock = jest.mocked(getCowSoundSuccess)

function mockMoo(play: () => Promise<void> = () => Promise.resolve()): HTMLAudioElement {
  const moo = { currentTime: 12, play: jest.fn(play), pause: jest.fn() }

  getCowSoundSuccessMock.mockReturnValue(moo as unknown as HTMLAudioElement)

  return moo as unknown as HTMLAudioElement
}

describe('useClaimMoo', () => {
  it('moos once the claim has landed', () => {
    const moo = mockMoo()

    renderHook(() => useClaimMoo())

    expect(moo.play).toHaveBeenCalledTimes(1)
  })

  it('rewinds a clip the session has already played, so a second claim moos again', () => {
    const moo = mockMoo()

    renderHook(() => useClaimMoo())

    expect(moo.currentTime).toBe(0)
  })

  it('does not moo again when the caller re-renders, as the balance poll does', () => {
    const moo = mockMoo()
    const { rerender } = renderHook(() => useClaimMoo())

    rerender()

    expect(moo.play).toHaveBeenCalledTimes(1)
  })

  it('stops the clip on unmount rather than leaving it playing over the page', () => {
    const moo = mockMoo()
    const { unmount } = renderHook(() => useClaimMoo())

    unmount()

    expect(moo.pause).toHaveBeenCalledTimes(1)
  })

  it('survives a browser that refuses to autoplay', () => {
    mockMoo(() => Promise.reject(new Error('NotAllowedError')))

    expect(() => renderHook(() => useClaimMoo())).not.toThrow()
  })
})
