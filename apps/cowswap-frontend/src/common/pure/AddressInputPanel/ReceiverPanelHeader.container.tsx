import { useAtomValue } from 'jotai'
import { ReactElement, ReactNode } from 'react'

import QR_CODE_ICON from '@cowprotocol/assets/cow-swap/qr-code.svg'
import { TargetChainId } from '@cowprotocol/cow-sdk'

import { Trans, useLingui } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import { useReceiverActions } from './hooks/useReceiverActions'
import { useReceiverChainInfo } from './hooks/useReceiverChainInfo'
import { useReceiverValidation } from './hooks/useReceiverValidation'
import { QrScanModal } from './QrScanModal.modal'
import {
  ActionBtn,
  ActionExternalLink,
  ChainIconImg,
  ChainLabelGroup,
  ChainNameLabel,
  QrIconWrapper,
  ReceiverActions,
  ReceiverHeader,
} from './styled'

import { featureFlagsAtom } from '../../state/featureFlagsState'

export interface ReceiverPanelHeaderProps {
  onChange(value: string): void
  value: string
  targetChainId?: TargetChainId
  label?: ReactNode
}

export function ReceiverPanelHeader({ onChange, value, targetChainId, label }: ReceiverPanelHeaderProps): ReactElement {
  const { t } = useLingui()
  const { chainIcon, chainInfo, isNonEvm } = useReceiverChainInfo(targetChainId)
  const { isEmpty, isError, explorerUrl } = useReceiverValidation(value, targetChainId)
  const { handlePaste, handleClear, handleScan, showQrModal, setShowQrModal, canPaste } = useReceiverActions(onChange)

  const { isQrScanEnabled } = useAtomValue(featureFlagsAtom)
  const networkName = chainInfo?.label
  const chainLabel = t`Send to ${networkName} wallet`
  const computedLabel = label || (isNonEvm ? chainLabel : <Trans>Recipient</Trans>)
  const showScanPaste = isEmpty || isError

  return (
    <>
      <ReceiverHeader>
        <ChainLabelGroup>
          {chainIcon && <ChainIconImg src={chainIcon} alt={chainInfo?.label} />}
          <ChainNameLabel>{computedLabel}</ChainNameLabel>
        </ChainLabelGroup>
        <ReceiverActions>
          {isQrScanEnabled && showScanPaste && (
            <ActionBtn onClick={() => setShowQrModal(true)}>
              <QrIconWrapper>
                <SVG src={QR_CODE_ICON} width="14" height="14" />
              </QrIconWrapper>
              <Trans>Scan</Trans>
            </ActionBtn>
          )}
          {showScanPaste && canPaste && (
            <ActionBtn onClick={handlePaste}>
              <Trans>Paste</Trans>
            </ActionBtn>
          )}
          {!isEmpty && (
            <ActionBtn onClick={handleClear}>
              <Trans>Clear</Trans>
            </ActionBtn>
          )}
          {explorerUrl && (
            <ActionExternalLink href={explorerUrl} target="_blank" rel="noopener noreferrer">
              <Trans>View ↗</Trans>
            </ActionExternalLink>
          )}
        </ReceiverActions>
      </ReceiverHeader>
      {isQrScanEnabled && (
        <QrScanModal isOpen={showQrModal} onDismiss={() => setShowQrModal(false)} onScan={handleScan} />
      )}
    </>
  )
}
