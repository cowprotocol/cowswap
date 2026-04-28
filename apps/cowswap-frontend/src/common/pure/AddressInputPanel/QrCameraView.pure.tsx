import { ReactElement, RefObject } from 'react'

import { Trans, useLingui } from '@lingui/react/macro'

import {
  CameraSwitchBtn,
  CameraVideo,
  CornerBracketOverlay,
  QrInstructions,
  QrSubText,
  ScanLineAnimation,
  VideoContainer,
} from './styled'

export interface QrCameraViewProps {
  videoRef: RefObject<HTMLVideoElement | null>
  onSwitchCamera(): void
}

export function QrCameraView({ videoRef, onSwitchCamera }: QrCameraViewProps): ReactElement {
  const { t } = useLingui()
  return (
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
        <CameraSwitchBtn type="button" onClick={onSwitchCamera} aria-label={t`Switch camera`}>
          ⇄
        </CameraSwitchBtn>
      </VideoContainer>
      <QrInstructions>
        <Trans>Align the QR code in the frame.</Trans>
      </QrInstructions>
      <QrSubText>
        <Trans>Scans locally in your browser. Nothing is uploaded.</Trans>
      </QrSubText>
    </>
  )
}
