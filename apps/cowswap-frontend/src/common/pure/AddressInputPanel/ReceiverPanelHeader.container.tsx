import { ReactElement, ReactNode } from 'react'

import { BaseChainInfo } from '@cowprotocol/common-const'
import { TargetChainId } from '@cowprotocol/cow-sdk'

import { Trans, useLingui } from '@lingui/react/macro'
import QR_CODE_ICON from 'assets/icon/qr-code.svg'
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

function getComputedLabel(
  label: ReactNode,
  isNonEvm: boolean,
  chainInfo: BaseChainInfo,
  chainLabel: string,
): ReactNode {
  if (label) return label
  if (isNonEvm) return chainLabel
  return <Trans>Recipient</Trans>
}

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
  const { handlePaste, handleClear, handleScan, showQrModal, setShowQrModal } = useReceiverActions(onChange)

  const networkName = chainInfo?.label
  const chainLabel = t`Send to ${networkName} wallet`
  const computedLabel = getComputedLabel(label, isNonEvm, chainInfo, chainLabel)
  const showScanPaste = isEmpty || isError

  return (
    <>
      <ReceiverHeader>
        <ChainLabelGroup>
          {chainIcon && <ChainIconImg src={chainIcon} alt={chainInfo?.label} />}
          <ChainNameLabel>{computedLabel}</ChainNameLabel>
        </ChainLabelGroup>
        <ReceiverActions>
          {showScanPaste && (
            <ActionBtn onClick={() => setShowQrModal(true)}>
              <QrIconWrapper>
                <SVG src={QR_CODE_ICON} width="14" height="14" />
              </QrIconWrapper>
              <Trans>Scan</Trans>
            </ActionBtn>
          )}
          {showScanPaste && (
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
      <QrScanModal isOpen={showQrModal} onDismiss={() => setShowQrModal(false)} onScan={handleScan} />
    </>
  )
}
