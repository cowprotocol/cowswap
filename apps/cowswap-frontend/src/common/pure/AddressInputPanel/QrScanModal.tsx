import { ReactElement, useCallback, useEffect, useRef, useState } from 'react'

import { CowModal } from 'common/pure/Modal'
import { NewModal } from 'common/pure/NewModal'

import {
  CameraSwitchBtn,
  CameraVideo,
  CornerBracketOverlay,
  QrInstructions,
  QrModalWrapper,
  QrSubText,
  ScanLineAnimation,
  VideoContainer,
} from './styled'

interface QrScanModalProps {
  isOpen: boolean
  onDismiss(): void
  onScan(value: string): void
}

export function QrScanModal({ isOpen, onDismiss, onScan }: QrScanModalProps): ReactElement {
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [isSupported, setIsSupported] = useState(true)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)

  // Start/stop camera stream
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
  }, [isOpen, facingMode])

  // BarcodeDetector scanning loop
  useEffect(() => {
    if (!isOpen || !stream) return

    if (!('BarcodeDetector' in window)) {
      setIsSupported(false)
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] })
    let frameId: number

    const scan = async (): Promise<void> => {
      const video = videoRef.current
      if (!video || video.readyState < 2) {
        frameId = requestAnimationFrame(scan)
        return
      }
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const barcodes: any[] = await detector.detect(video)
        if (barcodes.length > 0) {
          onScan(barcodes[0].rawValue)
          stream.getTracks().forEach((t) => t.stop())
          return
        }
      } catch {
        // ignore detection errors
      }
      frameId = requestAnimationFrame(scan)
    }

    frameId = requestAnimationFrame(scan)

    return () => cancelAnimationFrame(frameId)
  }, [isOpen, stream, onScan])

  const handleDismiss = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop())
    setStream(null)
    onDismiss()
  }, [stream, onDismiss])

  const switchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
  }, [])

  return (
    <CowModal isOpen={isOpen} onDismiss={handleDismiss} maxWidth={480}>
      <NewModal title="Scan QR code" modalMode onDismiss={handleDismiss}>
        <QrModalWrapper>
          {!isSupported ? (
            <p>QR scanning is not supported in this browser.</p>
          ) : (
            <>
              <VideoContainer>
                <CameraVideo ref={videoRef} muted playsInline />
                <CornerBracketOverlay>
                  <span className="tl" />
                  <span className="tr" />
                  <span className="bl" />
                  <span className="br" />
                </CornerBracketOverlay>
                <ScanLineAnimation />
                <CameraSwitchBtn onClick={switchCamera} aria-label="Switch camera">
                  ⇄
                </CameraSwitchBtn>
              </VideoContainer>
              <QrInstructions>Align the QR code in the frame.</QrInstructions>
              <QrSubText>Scans locally in your browser. Nothing is uploaded.</QrSubText>
            </>
          )}
        </QrModalWrapper>
      </NewModal>
    </CowModal>
  )
}
