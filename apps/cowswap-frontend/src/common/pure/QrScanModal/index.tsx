/* eslint-disable max-lines-per-function */
import type { ReactElement, ReactNode } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { UI } from '@cowprotocol/ui'

import { Trans, useLingui } from '@lingui/react/macro'
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser'
import CLOSE_ICON from 'assets/icon/x.svg'
import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import { CloseIcon, ContentWrapper, CowModal, HeaderRow } from '../Modal'

const VideoFrame = styled.div`
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
  border-radius: 12px;
  overflow: hidden;
  background: #000;
  aspect-ratio: 1;
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
  margin: 21px 0 9px;
  font-size: 15px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  text-align: center;
`

const PrivacyText = styled.p`
  margin: 0 auto 12px;
  font-size: 12px;
  color: var(${UI.COLOR_TEXT_OPACITY_50});
  text-align: center;
  max-width: 250px;
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

const PreviewHint = styled.p`
  position: absolute;
  inset: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #fff;
  opacity: 0.8;
  text-align: center;
  padding: 12px;
`
const ErrorText = styled.p`
  margin: 12px 0 0;
  font-size: 13px;
  text-align: center;
  color: var(${UI.COLOR_DANGER});
`

const QrModal = styled(CowModal)`
  > [data-reach-dialog-content] {
    flex-flow: column wrap;
  }
`

export interface QrScanModalProps {
  isOpen: boolean
  onDismiss: () => void
  onScan: (value: string) => boolean
  stream?: MediaStream | null
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
  const [localError, setLocalError] = useState<string | null>(null)
  const displayError = errorMessage ?? localError
  const [isPreviewReady, setIsPreviewReady] = useState(false)

  const stopScan = useCallback(() => {
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
  }, [])

  useEffect(() => {
    if (!isOpen) {
      stopScan()
      return
    }

    if (!stream && !navigator?.mediaDevices?.getUserMedia) {
      setLocalError(t`Camera access is not available in this browser.`)
      return
    }
    if (!stream && !window.isSecureContext) {
      setLocalError(t`Camera access requires a secure context.`)
      return
    }

    let isCancelled = false
    scanHandledRef.current = false
    setLocalError(null)
    setIsPreviewReady(false)

    let previewTimeoutId: number | undefined

    const startScan = async (): Promise<void> => {
      if (!videoRef.current) return

      try {
        const videoElement = videoRef.current
        videoElement.muted = true
        videoElement.autoplay = true
        videoElement.playsInline = true
        videoElement.setAttribute('muted', 'true')
        videoElement.setAttribute('autoplay', 'true')
        videoElement.setAttribute('playsinline', 'true')
        videoElement.setAttribute('webkit-playsinline', 'true')

        const handleCanPlay = (): void => {
          if (previewTimeoutId) window.clearTimeout(previewTimeoutId)
          setLocalError(null)
          setIsPreviewReady(true)
        }
        videoElement.addEventListener('canplay', handleCanPlay, { once: true })

        previewTimeoutId = window.setTimeout(() => {
          if (videoElement.readyState < 2 || videoElement.videoWidth === 0) {
            setLocalError(t`Camera preview unavailable.`)
          }
        }, 1500)
        const reader = new BrowserQRCodeReader()
        readerRef.current = reader

        let controls: IScannerControls

        if (stream) {
          streamRef.current = stream
          videoElement.srcObject = stream
          try {
            await videoElement.play()
          } catch {
            setLocalError(t`Unable to start camera preview.`)
          }

          controls = await reader.decodeFromStream(stream, videoElement, (result, decodeError, controls) => {
            if (isCancelled || scanHandledRef.current) return
            if (result) {
              const accepted = onScan(result.getText())
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
        } else {
          controls = await reader.decodeFromVideoDevice(undefined, videoElement, (result, decodeError, controls) => {
            if (isCancelled || scanHandledRef.current) return
            if (result) {
              const accepted = onScan(result.getText())
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
          streamRef.current = videoElement.srcObject as MediaStream | null
        }

        if (isCancelled) {
          if (previewTimeoutId) window.clearTimeout(previewTimeoutId)
          controls.stop()
          return
        }

        controlsRef.current = controls
      } catch {
        if (!isCancelled) {
          setLocalError(t`Camera access was denied or is unavailable.`)
        }
      }
    }

    startScan()

    return () => {
      isCancelled = true
      if (previewTimeoutId) window.clearTimeout(previewTimeoutId)
      stopScan()
      setIsPreviewReady(false)
    }
  }, [isOpen, onScan, stopScan, stream, t])

  return (
    <QrModal isOpen={isOpen} onDismiss={onDismiss} maxWidth={400}>
      <HeaderRow>
        <HeaderTitle>
          {iconUrl && <HeaderIcon src={iconUrl} alt={iconAlt ?? ''} aria-hidden={!iconAlt} />}
          {title ?? <Trans>Scan QR code</Trans>}
        </HeaderTitle>
        <CloseIcon onClick={onDismiss}>
          <SVG src={CLOSE_ICON} />
        </CloseIcon>
      </HeaderRow>
      <ContentWrapper>
        <VideoFrame>
          <VideoPreview ref={videoRef} muted playsInline autoPlay />
          {!displayError && !isPreviewReady && (
            <PreviewHint>
              <Trans>Starting camera...</Trans>
            </PreviewHint>
          )}
        </VideoFrame>
        {displayError ? (
          <ErrorText>{displayError}</ErrorText>
        ) : (
          <>
            <HintText>
              <Trans>Point your camera at the QR code.</Trans>
            </HintText>
            <PrivacyText>
              <Trans>Scanning happens locally in your browser. No images are stored or sent.</Trans>
            </PrivacyText>
          </>
        )}
      </ContentWrapper>
    </QrModal>
  )
}
