import { ReactElement, ReactNode } from 'react'

import { BaseChainInfo } from '@cowprotocol/common-const'
import { TargetChainId } from '@cowprotocol/cow-sdk'

import { Trans } from '@lingui/react/macro'

import { useReceiverPanel } from './hooks/useReceiverPanel'
import { QrScanModal } from './QrScanModal'
import { ReceiverPanelBody } from './ReceiverPanelBody'
import { ReceiverPanelHeader } from './ReceiverPanelHeader'
import { ReceiverPanel } from './styled'

import ChainPrefixWarning from '../ChainPrefixWarning'

export interface AddressInputPanelProps {
  id?: string
  className?: string
  label?: ReactNode
  placeholder?: string
  value: string
  onChange: (value: string) => void
  targetChainId?: TargetChainId
}

function getComputedLabel(label: ReactNode, isNonEvm: boolean, chainInfo: BaseChainInfo): ReactNode {
  if (label) return label
  if (isNonEvm) return `Send to ${chainInfo?.label} wallet`
  return <Trans>Recipient</Trans>
}

export function AddressInputPanel({
  id,
  className = 'recipient-address-input',
  label,
  value,
  onChange,
  targetChainId,
  placeholder,
}: AddressInputPanelProps): ReactElement {
  const {
    chainInfo,
    strategy,
    chainPrefixWarning,
    isDarkMode,
    showQrModal,
    setShowQrModal,
    isEmpty,
    isValid,
    isError,
    isNonEvm,
    chainIcon,
    explorerUrl,
    handleInput,
    handlePaste,
    handleClear,
    handleScan,
    loading,
  } = useReceiverPanel({ value, onChange, targetChainId })

  const computedLabel = getComputedLabel(label, isNonEvm, chainInfo)

  return (
    <>
      {chainPrefixWarning && (
        <ChainPrefixWarning chainPrefixWarning={chainPrefixWarning} chainInfo={chainInfo} isDarkMode={isDarkMode} />
      )}
      <ReceiverPanel id={id}>
        <ReceiverPanelHeader
          chainIcon={chainIcon}
          chainLabel={chainInfo?.label}
          computedLabel={computedLabel}
          isEmpty={isEmpty}
          isError={isError}
          explorerUrl={explorerUrl}
          onScanClick={() => setShowQrModal(true)}
          onPaste={handlePaste}
          onClear={handleClear}
        />
        <ReceiverPanelBody
          className={className}
          value={value}
          isValid={isValid}
          isError={isError}
          loading={loading}
          isNonEvm={isNonEvm}
          chainLabel={chainInfo?.label}
          strategy={strategy}
          placeholder={placeholder}
          handleInput={handleInput}
        />
      </ReceiverPanel>
      <QrScanModal isOpen={showQrModal} onDismiss={() => setShowQrModal(false)} onScan={handleScan} />
    </>
  )
}
