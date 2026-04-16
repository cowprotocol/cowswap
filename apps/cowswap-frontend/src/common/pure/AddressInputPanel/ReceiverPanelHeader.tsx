import { ReactElement, ReactNode } from 'react'

import { BaseChainInfo } from '@cowprotocol/common-const'
import { TargetChainId } from '@cowprotocol/cow-sdk'

import { Trans, useLingui } from '@lingui/react/macro'

import { useReceiverActions } from './hooks/useReceiverActions'
import { useReceiverChainInfo } from './hooks/useReceiverChainInfo'
import { useReceiverValidation } from './hooks/useReceiverValidation'
import { QrScanModal } from './QrScanModal'
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

const QR_ICON_PATH =
  'M3 3h7v7H3V3zm2 2v3h3V5H5zm9-2h7v7h-7V3zm2 2v3h3V5h-3zM3 14h7v7H3v-7zm2 2v3h3v-3H5zm11 0h2v2h-2v-2zm2-2h2v2h-2v-2zm-4 4h2v2h-2v-2zm2 0h2v2h-2v-2zm0 2h2v2h-2v-2zm2-4h2v2h-2v-2z'

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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d={QR_ICON_PATH} />
                </svg>
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
