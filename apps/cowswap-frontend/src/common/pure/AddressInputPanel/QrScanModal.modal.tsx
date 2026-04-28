import { ReactElement, useCallback, useRef, useState } from 'react'

import { Trans, useLingui } from '@lingui/react/macro'

import { CowModal } from 'common/pure/Modal'
import { NewModal } from 'common/pure/NewModal'

import { useQrBarcodeScanner } from './hooks/useQrBarcodeScanner'
import { useQrCameraStream } from './hooks/useQrCameraStream'
import { QrCameraView } from './QrCameraView.pure'
import { QrModalWrapper } from './styled'

export interface QrScanModalProps {
  isOpen: boolean
  onDismiss(): void
  onScan(value: string): void
}

export function QrScanModal({ isOpen, onDismiss, onScan }: QrScanModalProps): ReactElement {
  const { t } = useLingui()
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const videoRef = useRef<HTMLVideoElement>(null)

  const { stream, isSupported: cameraSupported, permissionDenied } = useQrCameraStream(isOpen, facingMode, videoRef)
  const scannerSupported = useQrBarcodeScanner(isOpen, stream, videoRef, onScan)

  const isSupported = cameraSupported && scannerSupported

  const handleDismiss = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop())
    onDismiss()
  }, [stream, onDismiss])

  const switchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
  }, [])

  return (
    <CowModal isOpen={isOpen} onDismiss={handleDismiss} maxWidth={480}>
      <NewModal title={t`Scan QR code`} modalMode onDismiss={handleDismiss}>
        <QrModalWrapper>
          {permissionDenied ? (
            <p>
              <Trans>
                Camera access was denied. Please allow camera permissions in your browser settings to scan QR codes.
              </Trans>
            </p>
          ) : !isSupported ? (
            <p>
              <Trans>QR scanning is not supported in this browser.</Trans>
            </p>
          ) : (
            <QrCameraView videoRef={videoRef} onSwitchCamera={switchCamera} />
          )}
        </QrModalWrapper>
      </NewModal>
    </CowModal>
  )
}
