import { ReactElement, RefObject, useMemo, useState } from 'react'

import COW_LOGO_ACCENT from '@cowprotocol/assets/images/logo-icon-cow-circle-accent.svg'
import COW_LOGO_BLACK from '@cowprotocol/assets/images/logo-icon-cow-circle-black.svg'
import COW_LOGO_WHITE from '@cowprotocol/assets/images/logo-icon-cow-circle-white.svg'
import { ButtonOutlined, ModalHeader, UI } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import QRCode from 'react-qrcode-logo'
import styled from 'styled-components/macro'

import { InlineError } from 'modules/affiliate/pure/shared'

import { CowModal } from 'common/pure/Modal'

const QR_SIZE_PX = 220
const QR_LOGO_SIZE_PX = 64

type QrColor = 'black' | 'white' | 'accent'

const QR_COLORS: Record<QrColor, { label: string; fg: string; bg: string }> = {
  black: { label: t`Black`, fg: '#111111', bg: '#FFFFFF' },
  white: { label: t`White`, fg: '#FFFFFF', bg: '#111111' },
  accent: { label: t`Accent`, fg: '#1f5bd6', bg: '#FFFFFF' },
}

const QR_LOGOS: Record<QrColor, string> = {
  black: COW_LOGO_BLACK,
  white: COW_LOGO_WHITE,
  accent: COW_LOGO_ACCENT,
}

interface AffiliatePartnerQrModalProps {
  isOpen: boolean
  referralLink: string
  qrCodeRef: RefObject<QRCode | null>
  onDismiss: () => void
  onDownload: (fileType: 'png' | 'jpg' | 'webp') => void
}

export function AffiliatePartnerQrModal({
  isOpen,
  referralLink,
  qrCodeRef,
  onDismiss,
  onDownload,
}: AffiliatePartnerQrModalProps): ReactElement {
  const [qrColor, setQrColor] = useState<QrColor>('accent')
  const qrPalette = useMemo(() => QR_COLORS[qrColor], [qrColor])
  const qrError = !referralLink ? t`Referral link unavailable.` : null
  const canDownloadQr = Boolean(referralLink)

  return (
    <CowModal isOpen={isOpen} onDismiss={onDismiss}>
      <ModalContent>
        <ModalHeader onClose={onDismiss}>
          <Trans>Download referral QR code</Trans>
        </ModalHeader>
        <ModalBody>
          <QrUrl>{referralLink}</QrUrl>
          <QrFrame $bg={qrPalette.bg}>
            {referralLink ? (
              <QRCode
                ref={qrCodeRef}
                value={referralLink}
                size={QR_SIZE_PX}
                quietZone={2}
                bgColor={qrPalette.bg}
                fgColor={qrPalette.fg}
                logoImage={QR_LOGOS[qrColor]}
                logoWidth={QR_LOGO_SIZE_PX}
                logoHeight={QR_LOGO_SIZE_PX}
                logoPadding={0}
                logoPaddingStyle="circle"
                removeQrCodeBehindLogo
                eyeRadius={0}
              />
            ) : (
              <QrPlaceholder />
            )}
          </QrFrame>
          {qrError && <InlineError>{qrError}</InlineError>}
          <QrPalette>
            {Object.entries(QR_COLORS).map(([key, color]) => (
              <ColorDot
                key={key}
                type="button"
                $active={qrColor === key}
                $color={color.fg}
                onClick={() => setQrColor(key as QrColor)}
                aria-label={color.label}
              />
            ))}
          </QrPalette>
          <QrActions>
            <DownloadButton disabled={!canDownloadQr} onClick={() => onDownload('png')}>
              <Trans>Download .PNG</Trans>
            </DownloadButton>
            <DownloadButton disabled={!canDownloadQr} onClick={() => onDownload('webp')}>
              <Trans>Download .WEBP</Trans>
            </DownloadButton>
          </QrActions>
        </ModalBody>
      </ModalContent>
    </CowModal>
  )
}

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 10px;
`

const QrUrl = styled.p`
  margin: 0 auto;
  font-size: 13px;
  color: var(${UI.COLOR_TEXT_OPACITY_60});
  word-break: break-all;
`

const QrFrame = styled.div<{ $bg: string }>`
  border-radius: 16px;
  border: 1px solid var(${UI.COLOR_PAPER_DARKER});
  background: ${({ $bg }) => $bg};
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
`

const QrPlaceholder = styled.div`
  width: ${QR_SIZE_PX}px;
  height: ${QR_SIZE_PX}px;
  border-radius: 12px;
  background: repeating-linear-gradient(
    45deg,
    var(${UI.COLOR_PAPER}) 0,
    var(${UI.COLOR_PAPER}) 12px,
    var(${UI.COLOR_PAPER_DARKER}) 12px,
    var(${UI.COLOR_PAPER_DARKER}) 24px
  );
`

const QrPalette = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`

const ColorDot = styled.button<{ $active: boolean; $color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 999px;
  border: 4px solid ${({ $active }) => ($active ? `var(${UI.COLOR_PRIMARY})` : `var(${UI.COLOR_BORDER})`)};
  background: ${({ $color }) => $color};
  cursor: pointer;
`

const QrActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`

const DownloadButton = styled(ButtonOutlined)`
  padding: 10px 16px;
  border-radius: 12px;
  min-width: 136px;
`
