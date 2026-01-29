/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
import type { ReactElement, ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { UI } from '@cowprotocol/ui'

import { Trans, useLingui } from '@lingui/react/macro'
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser'
import CLOSE_ICON from 'assets/icon/x.svg'
import SVG from 'react-inlinesvg'
import styled, { css, keyframes } from 'styled-components/macro'

import { ContentWrapper, CowModal, HeaderRow } from '../Modal'

type CameraStatus = 'idle' | 'requesting' | 'ready' | 'denied' | 'no-camera' | 'unavailable' | 'failed'

type TorchCapabilities = MediaTrackCapabilities & { torch?: boolean }

type TorchConstraint = MediaTrackConstraintSet & { torch?: boolean }

const VideoFrame = styled.div`
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
  border-radius: 12px;
  overflow: hidden;
  background: #000;
  aspect-ratio: 7 / 8;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`

const VideoPreview = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`

const HintText = styled.p`
  margin: 16px 0 6px;
  font-size: 15px;
  color: var(${UI.COLOR_TEXT});
  text-align: center;
  font-weight: 500;
`

const PrivacyText = styled.p`
  margin: 0 auto 8px;
  font-size: 12px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  text-align: center;
`

const HeaderTitle = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`

const HeaderIcon = styled.img`
  width: 18px;
  height: 18px;
  border-radius: 50%;
`

const ErrorText = styled.p`
  margin: 12px 0 0;
  font-size: 13px;
  text-align: center;
  color: var(${UI.COLOR_DANGER});
`

const ViewfinderOverlay = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 12px;
  pointer-events: none;
  z-index: 1;
`

const cornerStyles = {
  'top-left': css`
    top: 12px;
    left: 12px;
    border-width: 3px 0 0 3px;
  `,
  'top-right': css`
    top: 12px;
    right: 12px;
    border-width: 3px 3px 0 0;
  `,
  'bottom-left': css`
    bottom: 12px;
    left: 12px;
    border-width: 0 0 3px 3px;
  `,
  'bottom-right': css`
    bottom: 12px;
    right: 12px;
    border-width: 0 3px 3px 0;
  `,
}

const Corner = styled.div<{ $position: keyof typeof cornerStyles }>`
  position: absolute;
  width: 26px;
  height: 26px;
  border-style: solid;
  border-color: rgba(255, 255, 255, 0.7);
  ${({ $position }) => cornerStyles[$position]};
`

const scanLine = keyframes`
  0% {
    top: 14%;
  }
  50% {
    top: 86%;
  }
  100% {
    top: 14%;
  }
`

const ScanLine = styled.div`
  position: absolute;
  left: 14%;
  right: 14%;
  height: 3px;
  background: linear-gradient(90deg, rgba(255, 77, 77, 0) 0%, rgba(255, 77, 77, 0.85) 50%, rgba(255, 77, 77, 0) 100%);
  opacity: 0.7;
  box-shadow: 0 0 6px rgba(255, 77, 77, 0.45);
  animation: ${scanLine} 2.8s ease-in-out infinite;
`

const StateOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  text-align: center;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 13px;
  z-index: 2;
`

const Controls = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 3;
`

const IconButtonBase = styled.button`
  appearance: none;
  border: 0;
  padding: 0;
  margin: 0;
  background: none;
  cursor: pointer;
  color: inherit;
`

const ControlButton = styled(IconButtonBase)<{ $active?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0.9;
  border: 1px solid rgba(255, 255, 255, 0.2);

  ${({ $active }) =>
    $active &&
    css`
      background: rgba(255, 255, 255, 0.2);
      opacity: 1;
    `};

  &:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.6);
  }

  &:focus-visible {
    outline: 2px solid var(${UI.COLOR_PRIMARY});
    outline-offset: 2px;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`

const CloseButton = styled(IconButtonBase)`
  margin: 0 0 0 auto;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  opacity: 0.85;

  &:hover {
    opacity: 1;
  }
`

const QrModal = styled(CowModal)`
  > [data-reach-dialog-content] {
    flex-flow: column wrap;
  }

  ${ContentWrapper} {
    padding-bottom: 12px;
  }
`

const TorchIcon = (): ReactElement => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 3h6l1 6H8l1-6z" />
    <path d="M8 9h8v5a4 4 0 0 1-8 0V9z" />
    <path d="M10 21h4" />
  </svg>
)

const SwitchCameraIcon = (): ReactElement => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 7h4l1.5-2h5L16 7h4v10H4z" />
    <circle cx="12" cy="12" r="3" />
    <path d="m6 12 2-2" />
    <path d="m18 12-2 2" />
  </svg>
)

export interface QrScanModalProps {
  isOpen: boolean
  onDismiss: () => void
  onScan: (value: string) => boolean
  stream?: MediaStream | null
  onRequestStream?: (deviceId?: string | null) => Promise<MediaStream | null>
  errorMessage?: string | null
  title?: ReactNode
  iconUrl?: string
  iconAlt?: string
}

export function QrScanModal({
  isOpen,
  onDismiss,
  onScan,
  stream,
  onRequestStream,
  errorMessage,
  title,
  iconUrl,
  iconAlt,
}: QrScanModalProps): ReactElement {
  const { t } = useLingui()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const readerRef = useRef<BrowserQRCodeReader | null>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanHandledRef = useRef(false)
  const lastScanRef = useRef<{ value: string; at: number } | null>(null)
  const isCancelledRef = useRef(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle')
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null)
  const [torchSupported, setTorchSupported] = useState(false)
  const [torchEnabled, setTorchEnabled] = useState(false)

  const hasExternalStream = typeof stream !== 'undefined' || typeof onRequestStream !== 'undefined'

  const displayError = localError ?? errorMessage
  const showStateOverlay = cameraStatus !== 'ready'
  const showControls = cameraStatus === 'ready'

  const cameraStatusMessage = useMemo((): string => {
    switch (cameraStatus) {
      case 'requesting':
        return t`Requesting camera permission...`
      case 'denied':
        return t`Camera permission denied`
      case 'no-camera':
        return t`No camera found`
      case 'failed':
        return t`Failed to start camera`
      case 'unavailable':
        return t`Camera unavailable`
      default:
        return ''
    }
  }, [cameraStatus, t])

  const loadVideoDevices = useCallback(async (): Promise<MediaDeviceInfo[]> => {
    if (!navigator?.mediaDevices?.enumerateDevices) return []
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      return devices.filter((device) => device.kind === 'videoinput')
    } catch {
      return []
    }
  }, [])

  const stopScan = useCallback((): void => {
    controlsRef.current?.stop()
    controlsRef.current = null
    if (readerRef.current && 'reset' in readerRef.current && typeof readerRef.current.reset === 'function') {
      readerRef.current.reset()
    }
    readerRef.current = null
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setTorchSupported(false)
    setTorchEnabled(false)
  }, [])

  const startScan = useCallback(
    async (deviceId?: string | null, providedStream?: MediaStream | null): Promise<void> => {
      if (!navigator?.mediaDevices?.getUserMedia) {
        setCameraStatus('unavailable')
        return
      }
      if (!window.isSecureContext) {
        setCameraStatus('unavailable')
        return
      }
      if (!videoRef.current) return

      isCancelledRef.current = false
      setLocalError(null)
      setCameraStatus('requesting')
      scanHandledRef.current = false
      lastScanRef.current = null

      const videoElement = videoRef.current
      const previewTimeoutId = window.setTimeout(() => {
        if (videoElement.readyState < 2 || videoElement.videoWidth === 0) {
          setCameraStatus('failed')
        }
      }, 1800)
      videoElement.muted = true
      videoElement.autoplay = true
      videoElement.playsInline = true
      videoElement.setAttribute('muted', 'true')
      videoElement.setAttribute('autoplay', 'true')
      videoElement.setAttribute('playsinline', 'true')
      videoElement.setAttribute('webkit-playsinline', 'true')

      const handleCanPlay = (): void => {
        window.clearTimeout(previewTimeoutId)
        if (!isCancelledRef.current) {
          setCameraStatus('ready')
        }
      }
      videoElement.addEventListener('canplay', handleCanPlay, { once: true })

      try {
        stopScan()

        const constraints: MediaStreamConstraints = {
          video: deviceId
            ? {
                deviceId: { exact: deviceId },
              }
            : {
                facingMode: { ideal: 'environment' },
              },
          audio: false,
        }

        const stream = providedStream ?? (await navigator.mediaDevices.getUserMedia(constraints))
        if (isCancelledRef.current) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream
        videoElement.srcObject = stream

        try {
          await videoElement.play()
        } catch {
          setCameraStatus('failed')
        }

        const devices = await loadVideoDevices()
        setVideoDevices(devices)

        const track = stream.getVideoTracks()[0]
        const capabilities = (track?.getCapabilities?.() as TorchCapabilities | undefined) ?? undefined
        const supportsTorch = Boolean(capabilities?.torch)
        setTorchSupported(supportsTorch)
        setTorchEnabled(false)

        const reader = new BrowserQRCodeReader()
        readerRef.current = reader

        const controls = await reader.decodeFromStream(stream, videoElement, (result, decodeError, controls) => {
          if (isCancelledRef.current || scanHandledRef.current) return
          if (result) {
            const text = result.getText()
            const now = Date.now()
            const lastScan = lastScanRef.current
            if (lastScan && lastScan.value === text && now - lastScan.at < 1200) return
            lastScanRef.current = { value: text, at: now }

            const accepted = onScan(text)
            if (accepted) {
              scanHandledRef.current = true
              controls.stop()
            }
            return
          }
          if (decodeError && decodeError.name !== 'NotFoundException') {
            // Ignore transient decode errors to avoid noisy UX.
          }
        })

        if (isCancelledRef.current) {
          window.clearTimeout(previewTimeoutId)
          controls.stop()
          return
        }

        controlsRef.current = controls
      } catch (error) {
        if (!isCancelledRef.current) {
          const name = error instanceof Error ? error.name : ''
          if (name === 'NotAllowedError' || name === 'SecurityError') {
            setCameraStatus('denied')
          } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
            const devices = await loadVideoDevices()
            setVideoDevices(devices)
            setCameraStatus(devices.length ? 'failed' : 'no-camera')
          } else {
            setCameraStatus('failed')
          }
        }
      } finally {
        window.clearTimeout(previewTimeoutId)
      }
    },
    [loadVideoDevices, onScan, stopScan],
  )

  useEffect(() => {
    if (!isOpen) {
      isCancelledRef.current = true
      stopScan()
      setCameraStatus('idle')
      return
    }

    let isCancelled = false

    const boot = async (): Promise<void> => {
      if (isCancelled) return
      if (stream) {
        await startScan(undefined, stream)
        return
      }
      if (!hasExternalStream) {
        await startScan(activeDeviceId)
      }
    }

    boot()

    return () => {
      isCancelled = true
      isCancelledRef.current = true
      stopScan()
      setCameraStatus('idle')
    }
  }, [activeDeviceId, hasExternalStream, isOpen, startScan, stopScan, stream])

  const handleTorchToggle = useCallback(async (): Promise<void> => {
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track?.applyConstraints) return
    const nextState = !torchEnabled
    try {
      await track.applyConstraints({ advanced: [{ torch: nextState } as TorchConstraint] })
      setTorchEnabled(nextState)
    } catch {
      setLocalError(t`Unable to toggle flashlight.`)
    }
  }, [t, torchEnabled])

  const handleSwitchCamera = useCallback((): void => {
    if (videoDevices.length < 2) return
    const currentDeviceId = streamRef.current?.getVideoTracks()[0]?.getSettings().deviceId ?? activeDeviceId
    const currentIndex = videoDevices.findIndex((device) => device.deviceId === currentDeviceId)
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % videoDevices.length
    const nextDevice = videoDevices[nextIndex]
    setActiveDeviceId(nextDevice.deviceId)
    if (onRequestStream) {
      void onRequestStream(nextDevice.deviceId)
    }
  }, [activeDeviceId, onRequestStream, videoDevices])

  return (
    <QrModal isOpen={isOpen} onDismiss={onDismiss} maxWidth={400}>
      <HeaderRow>
        <HeaderTitle>
          {iconUrl && <HeaderIcon src={iconUrl} alt={iconAlt ?? ''} aria-hidden={!iconAlt} />}
          {title ?? <Trans>Scan QR code</Trans>}
        </HeaderTitle>
        <CloseButton type="button" aria-label={t`Close`} onClick={onDismiss}>
          <SVG src={CLOSE_ICON} />
        </CloseButton>
      </HeaderRow>
      <ContentWrapper>
        <VideoFrame>
          <VideoPreview ref={videoRef} muted playsInline autoPlay />
          {cameraStatus === 'ready' && (
            <ViewfinderOverlay>
              <Corner $position="top-left" />
              <Corner $position="top-right" />
              <Corner $position="bottom-left" />
              <Corner $position="bottom-right" />
              <ScanLine />
            </ViewfinderOverlay>
          )}
          {showStateOverlay && <StateOverlay>{cameraStatusMessage || t`Requesting camera permission...`}</StateOverlay>}
          {showControls && (
            <Controls>
              {torchSupported && (
                <ControlButton
                  type="button"
                  aria-label={torchEnabled ? t`Turn off flashlight` : t`Turn on flashlight`}
                  aria-pressed={torchEnabled}
                  $active={torchEnabled}
                  onClick={handleTorchToggle}
                >
                  <TorchIcon />
                </ControlButton>
              )}
              {videoDevices.length > 1 && (
                <ControlButton type="button" aria-label={t`Switch camera`} onClick={handleSwitchCamera}>
                  <SwitchCameraIcon />
                </ControlButton>
              )}
            </Controls>
          )}
        </VideoFrame>
        {displayError ? (
          <ErrorText>{displayError}</ErrorText>
        ) : cameraStatus === 'ready' ? (
          <>
            <HintText>
              <Trans>Align the QR code in the frame.</Trans>
            </HintText>
            <PrivacyText>
              <Trans>Scans locally in your browser. Nothing is uploaded.</Trans>
            </PrivacyText>
          </>
        ) : null}
      </ContentWrapper>
    </QrModal>
  )
}
