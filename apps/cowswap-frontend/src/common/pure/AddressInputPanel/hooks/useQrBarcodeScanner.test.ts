import { act, renderHook } from '@testing-library/react'

import { useQrBarcodeScanner } from './useQrBarcodeScanner'

const mockDetect = jest.fn()
const mockStop = jest.fn()

function installBarcodeDetector(): void {
  window.BarcodeDetector = jest.fn().mockImplementation(() => ({
    detect: mockDetect,
  })) as unknown as typeof window.BarcodeDetector
}

function makeMockStream(): MediaStream {
  return {
    getTracks: () => [{ stop: mockStop } as unknown as MediaStreamTrack],
  } as unknown as MediaStream
}

function makeVideoRef(readyState = 4): React.RefObject<HTMLVideoElement | null> {
  return {
    current: { readyState } as HTMLVideoElement,
  }
}

function removeBarcodeDetector(): void {
  delete window.BarcodeDetector
}

describe('useQrBarcodeScanner', () => {
  let rafCallback: FrameRequestCallback | null = null

  beforeEach(() => {
    jest.clearAllMocks()
    rafCallback = null

    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallback = cb
      return 1
    })
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(jest.fn())
  })

  afterEach(() => {
    removeBarcodeDetector()
    jest.restoreAllMocks()
  })

  it('sets isSupported=false when BarcodeDetector is not in window', () => {
    removeBarcodeDetector()
    const stream = makeMockStream()

    const { result } = renderHook(() => useQrBarcodeScanner(true, stream, makeVideoRef(), jest.fn()))

    expect(result.current).toBe(false)
  })

  it('starts scanning loop when open with stream and BarcodeDetector available', () => {
    installBarcodeDetector()
    mockDetect.mockResolvedValue([])

    renderHook(() => useQrBarcodeScanner(true, makeMockStream(), makeVideoRef(), jest.fn()))

    expect(window.requestAnimationFrame).toHaveBeenCalled()
  })

  it('does not start loop when isOpen=false', () => {
    installBarcodeDetector()

    renderHook(() => useQrBarcodeScanner(false, makeMockStream(), makeVideoRef(), jest.fn()))

    expect(window.requestAnimationFrame).not.toHaveBeenCalled()
  })

  it('does not start loop when stream is null', () => {
    installBarcodeDetector()

    renderHook(() => useQrBarcodeScanner(true, null, makeVideoRef(), jest.fn()))

    expect(window.requestAnimationFrame).not.toHaveBeenCalled()
  })

  it('calls onScan with rawValue when barcode detected', async () => {
    installBarcodeDetector()
    const onScan = jest.fn()
    mockDetect.mockResolvedValue([{ rawValue: 'scanned-address' }])

    renderHook(() => useQrBarcodeScanner(true, makeMockStream(), makeVideoRef(), onScan))

    await act(async () => {
      rafCallback?.(0)
      await Promise.resolve()
    })

    expect(onScan).toHaveBeenCalledWith('scanned-address')
  })

  it('stops stream tracks after successful scan', async () => {
    installBarcodeDetector()
    mockDetect.mockResolvedValue([{ rawValue: 'abc' }])
    const stream = makeMockStream()

    renderHook(() => useQrBarcodeScanner(true, stream, makeVideoRef(), jest.fn()))

    await act(async () => {
      rafCallback?.(0)
      await Promise.resolve()
    })

    expect(mockStop).toHaveBeenCalled()
  })

  it('continues loop when no barcode found in frame', async () => {
    installBarcodeDetector()
    mockDetect.mockResolvedValue([])

    renderHook(() => useQrBarcodeScanner(true, makeMockStream(), makeVideoRef(), jest.fn()))

    await act(async () => {
      rafCallback?.(0)
      await Promise.resolve()
    })

    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2)
  })

  it('cancels animation frame on unmount', () => {
    installBarcodeDetector()
    mockDetect.mockResolvedValue([])

    const { unmount } = renderHook(() => useQrBarcodeScanner(true, makeMockStream(), makeVideoRef(), jest.fn()))

    unmount()

    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(1)
  })
})
