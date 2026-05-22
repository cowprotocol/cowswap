import { renderHook, waitFor } from '@testing-library/react'

import { useQrCameraStream } from './useQrCameraStream'

const mockStop = jest.fn()
const mockPlay = jest.fn()
const mockGetUserMedia = jest.fn()

function makeMockStream(trackCount = 1): MediaStream {
  const tracks = Array.from({ length: trackCount }, () => ({ stop: mockStop }) as unknown as MediaStreamTrack)
  return { getTracks: () => tracks } as unknown as MediaStream
}

function makeVideoRef(readyState = 4): React.RefObject<HTMLVideoElement | null> {
  return {
    current: {
      srcObject: null,
      readyState,
      play: mockPlay,
    } as unknown as HTMLVideoElement,
  }
}

describe('useQrCameraStream', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getUserMedia: mockGetUserMedia },
      writable: true,
      configurable: true,
    })
  })

  it('does not call getUserMedia when isOpen=false', () => {
    mockGetUserMedia.mockResolvedValue(makeMockStream())
    renderHook(() => useQrCameraStream(false, 'environment', makeVideoRef()))
    expect(mockGetUserMedia).not.toHaveBeenCalled()
  })

  it('calls getUserMedia with the given facingMode when open', async () => {
    mockGetUserMedia.mockResolvedValue(makeMockStream())
    renderHook(() => useQrCameraStream(true, 'environment', makeVideoRef()))
    await waitFor(() => expect(mockGetUserMedia).toHaveBeenCalledWith({ video: { facingMode: 'environment' } }))
  })

  it('attaches srcObject and calls play when getUserMedia succeeds', async () => {
    const stream = makeMockStream()
    mockGetUserMedia.mockResolvedValue(stream)
    const videoRef = makeVideoRef()

    renderHook(() => useQrCameraStream(true, 'environment', videoRef))

    await waitFor(() => expect(videoRef.current?.srcObject).toBe(stream))
    expect(mockPlay).toHaveBeenCalled()
  })

  it('sets isSupported=false when mediaDevices API is unavailable', () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: undefined,
      writable: true,
      configurable: true,
    })
    const { result } = renderHook(() => useQrCameraStream(true, 'environment', makeVideoRef()))
    expect(result.current.isSupported).toBe(false)
    expect(mockGetUserMedia).not.toHaveBeenCalled()
  })

  it('sets isSupported=false when getUserMedia is denied', async () => {
    mockGetUserMedia.mockRejectedValue(new Error('NotAllowedError'))
    const { result } = renderHook(() => useQrCameraStream(true, 'environment', makeVideoRef()))

    await waitFor(() => expect(result.current.isSupported).toBe(false))
  })

  it('stops all tracks when the hook unmounts', async () => {
    const stream = makeMockStream(2)
    mockGetUserMedia.mockResolvedValue(stream)

    const { unmount } = renderHook(() => useQrCameraStream(true, 'environment', makeVideoRef()))
    await waitFor(() => expect(mockGetUserMedia).toHaveBeenCalled())
    unmount()

    expect(mockStop).toHaveBeenCalledTimes(2)
  })

  it('re-requests camera when facingMode changes', async () => {
    mockGetUserMedia.mockResolvedValue(makeMockStream())
    const videoRef = makeVideoRef()

    const { rerender } = renderHook(
      ({ facingMode }: { facingMode: 'environment' | 'user' }) => useQrCameraStream(true, facingMode, videoRef),
      { initialProps: { facingMode: 'environment' as const } },
    )

    await waitFor(() => expect(mockGetUserMedia).toHaveBeenCalledTimes(1))
    rerender({ facingMode: 'user' })
    await waitFor(() => expect(mockGetUserMedia).toHaveBeenCalledTimes(2))
    expect(mockGetUserMedia).toHaveBeenLastCalledWith({ video: { facingMode: 'user' } })
  })
})
