import { ReactElement, useCallback, useMemo, useRef, useState } from 'react'

import COW_LOGO_ACCENT from '@cowprotocol/assets/images/logo-icon-cow-circle-accent.svg'
import COW_LOGO_BLACK from '@cowprotocol/assets/images/logo-icon-cow-circle-black.svg'
import COW_LOGO_WHITE from '@cowprotocol/assets/images/logo-icon-cow-circle-white.svg'
import { ButtonOutlined, ModalHeader, UI } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import QRCode from 'react-qrcode-logo'
import styled from 'styled-components/macro'

import { getReferralLink } from 'modules/affiliate/lib/affiliateProgramUtils'

import { CowModal } from 'common/pure/Modal'

const QR_SIZE_PX = 220
const QR_LOGO_SIZE_PX = 64

type QrColor = 'black' | 'white' | 'accent'
type DownloadQrFileType = 'png' | 'webp'

const QR_COLORS: Record<QrColor, { fg: string; bg: string }> = {
  black: { fg: '#111111', bg: '#FFFFFF' },
  white: { fg: '#FFFFFF', bg: '#111111' },
  accent: { fg: '#1f5bd6', bg: '#FFFFFF' },
}

const QR_LOGOS: Record<QrColor, string> = {
  black: COW_LOGO_BLACK,
  white: COW_LOGO_WHITE,
  accent: COW_LOGO_ACCENT,
}

interface AffiliatePartnerQrModalProps {
  isOpen: boolean
  refCode: string
  onDismiss: () => void
}

export function AffiliatePartnerQrModal({
  isOpen,
  refCode: refCode,
  onDismiss,
}: AffiliatePartnerQrModalProps): ReactElement {
  const qrCodeRef = useRef<QRCode | null>(null)
  const referralLink = getReferralLink(refCode)

  const onDownload = useCallback((fileType: DownloadQrFileType) => {
    if (!qrCodeRef.current) return
    qrCodeRef.current.download(fileType, 'cow-referral')
  }, [])

  const [qrColor, setQrColor] = useState<QrColor>('accent')
  const qrColorLabels = useMemo<Record<QrColor, string>>(
    () => ({
      black: t`Black`,
      white: t`White`,
      accent: t`Accent`,
    }),
    [],
  )
  const qrPalette = useMemo(() => QR_COLORS[qrColor], [qrColor])

  return (
    <CowModal isOpen={isOpen} onDismiss={onDismiss}>
      <ModalContent>
        <ModalHeader onClose={onDismiss}>
          <Trans>Download referral QR code</Trans>
        </ModalHeader>
        <ModalBody>
          <QrUrl>{referralLink}</QrUrl>
          <QrFrame $bg={qrPalette.bg}>
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
          </QrFrame>
          <QrPalette>
            {Object.entries(QR_COLORS).map(([key, color]) => (
              <ColorDot
                key={key}
                type="button"
                $active={qrColor === key}
                $color={color.fg}
                onClick={() => setQrColor(key as QrColor)}
                aria-label={qrColorLabels[key as QrColor]}
              />
            ))}
          </QrPalette>
          <QrActions>
            <DownloadButton onClick={() => onDownload('png')}>
              <Trans>Download .PNG</Trans>
            </DownloadButton>
            <DownloadButton onClick={() => onDownload('webp')}>
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
