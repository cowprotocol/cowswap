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

    let cancelled = false
    let localStream: MediaStream | null = null

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode } })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop())
          return
        }
        localStream = s
        setStream(s)
        if (videoRef.current) {
          videoRef.current.srcObject = s
          videoRef.current.play()
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
