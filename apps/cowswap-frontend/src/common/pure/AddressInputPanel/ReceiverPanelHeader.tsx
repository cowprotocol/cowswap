import { ReactElement, ReactNode } from 'react'

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

export interface ReceiverPanelHeaderProps {
  chainIcon?: string
  chainLabel?: string
  computedLabel: ReactNode
  isEmpty: boolean
  isError: boolean
  explorerUrl: string | null
  onScanClick(): void
  onPaste(): void
  onClear(): void
}

export function ReceiverPanelHeader({
  chainIcon,
  chainLabel,
  computedLabel,
  isEmpty,
  isError,
  explorerUrl,
  onScanClick,
  onPaste,
  onClear,
}: ReceiverPanelHeaderProps): ReactElement {
  const showScanPaste = isEmpty || isError
  return (
    <ReceiverHeader>
      <ChainLabelGroup>
        {chainIcon && <ChainIconImg src={chainIcon} alt={chainLabel} />}
        <ChainNameLabel>{computedLabel}</ChainNameLabel>
      </ChainLabelGroup>
      <ReceiverActions>
        {showScanPaste && (
          <ActionBtn onClick={onScanClick}>
            <QrIconWrapper>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d={QR_ICON_PATH} />
              </svg>
            </QrIconWrapper>
            Scan
          </ActionBtn>
        )}
        {showScanPaste && <ActionBtn onClick={onPaste}>Paste</ActionBtn>}
        {!isEmpty && <ActionBtn onClick={onClear}>Clear</ActionBtn>}
        {explorerUrl && (
          <ActionExternalLink href={explorerUrl} target="_blank" rel="noopener noreferrer">
            View ↗
          </ActionExternalLink>
        )}
      </ReceiverActions>
    </ReceiverHeader>
  )
}
