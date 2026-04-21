import { RefObject, useEffect, useState } from 'react'

export interface QrCameraStreamResult {
  stream: MediaStream | null
  isSupported: boolean
}

/**
 * Manages the camera MediaStream lifecycle for QR scanning.
 * Requests camera access when open and cleans up on close or facingMode change.
 */
export function useQrCameraStream(
  isOpen: boolean,
  facingMode: 'environment' | 'user',
  videoRef: RefObject<HTMLVideoElement | null>,
): QrCameraStreamResult {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isSupported, setIsSupported] = useState(true)

  useEffect(() => {
    if (!isOpen) return

    if (!navigator.mediaDevices?.getUserMedia) {
      setIsSupported(false)
      return
    }

    let cancelled = false
    let localStream: MediaStream | null = null

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode } })
      .then((mediaStream) => {
        if (cancelled) {
          mediaStream.getTracks().forEach((t) => t.stop())
          return
        }
        localStream = mediaStream
        setStream(mediaStream)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          videoRef.current.play().catch((e: unknown) => console.error(e))
        }
      })
      .catch(() => {
        if (!cancelled) setIsSupported(false)
      })

    return () => {
      cancelled = true
      localStream?.getTracks().forEach((t) => t.stop())
      setStream(null)
    }
  }, [isOpen, facingMode, videoRef])

  return { stream, isSupported }
}
