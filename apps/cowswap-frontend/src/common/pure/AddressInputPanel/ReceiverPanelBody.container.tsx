import { ReactElement, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import OrderCheckIcon from '@cowprotocol/assets/cow-swap/order-check.svg'
import { TargetChainId } from '@cowprotocol/cow-sdk'

import { Trans } from '@lingui/react/macro'

import { useAddressDisplayValue } from './hooks/useAddressDisplayValue'
import { useOnAddressInput } from './hooks/useOnAddressInput'
import { useReceiverChainInfo } from './hooks/useReceiverChainInfo'
import { useReceiverPlaceholder } from './hooks/useReceiverPlaceholder'
import { useReceiverValidation } from './hooks/useReceiverValidation'
import { ReceiverConfirmationRow } from './ReceiverConfirmationRow.pure'
import { ReceiverErrorText, ReceiverInput, ReceiverInputRow, ReceiverInputWrapper, ValidCheckmark } from './styled'

import ChainPrefixWarning from '../ChainPrefixWarning'

export interface ReceiverPanelBodyProps {
  className: string
  value: string
  onChange(value: string): void
  targetChainId?: TargetChainId
  placeholder?: string
  isBridging?: boolean
  isSmartContractWalletBridging?: boolean
  onNonEvmReceiverConfirmedChange?: (confirmed: boolean) => void
}

export function ReceiverPanelBody({
  className,
  value,
  onChange,
  targetChainId,
  placeholder,
  isBridging = false,
  isSmartContractWalletBridging,
  onNonEvmReceiverConfirmedChange,
}: ReceiverPanelBodyProps): ReactElement {
  const { strategy, isNonEvm, chainInfo } = useReceiverChainInfo(targetChainId)
  const { isValid, isError, loading } = useReceiverValidation(value, targetChainId)
  const { handleInput, chainPrefixWarning } = useOnAddressInput(onChange, chainInfo?.addressPrefix, strategy)
  const { displayValue, handleFocus, handleBlur } = useAddressDisplayValue(value, isValid, loading, isNonEvm)

  const [isConfirmed, setIsConfirmed] = useState(false)

  // Keep stable refs so effects don't need unstable values as deps.
  // Both are updated synchronously via useLayoutEffect before any effects read them.
  const onConfirmedChangeRef = useRef(onNonEvmReceiverConfirmedChange)
  const isConfirmedRef = useRef(false)
  useLayoutEffect(() => {
    onConfirmedChangeRef.current = onNonEvmReceiverConfirmedChange
    isConfirmedRef.current = isConfirmed
  })

  const networkLabel = chainInfo?.label
  const defaultPlaceholder = useReceiverPlaceholder(strategy, networkLabel, targetChainId, isBridging)
  const resolvedPlaceholder = placeholder ?? defaultPlaceholder
  const chainLabel = isNonEvm ? chainInfo?.label : ''

  // Reset confirmation when address or target chain changes.
  // Guard with isConfirmedRef to avoid spurious callbacks on first render
  // and when confirmation was never set.
  useEffect(() => {
    if (!isConfirmedRef.current) return
    setIsConfirmed(false)
    onConfirmedChangeRef.current?.(false)
  }, [value, targetChainId])

  // Reset on unmount — only notify parent if confirmation was active.
  useEffect(() => {
    return () => {
      if (isConfirmedRef.current) {
        onConfirmedChangeRef.current?.(false)
      }
    }
  }, [])

  const handleConfirmChange = useCallback(
    (confirmed: boolean) => {
      setIsConfirmed(confirmed)
      onNonEvmReceiverConfirmedChange?.(confirmed)
    },
    [onNonEvmReceiverConfirmedChange],
  )

  const showConfirmationRow = (isNonEvm || !!isSmartContractWalletBridging) && isValid && !loading

  return (
    <>
      {chainPrefixWarning && <ChainPrefixWarning chainPrefixWarning={chainPrefixWarning} chainInfo={chainInfo} />}
      <ReceiverInputWrapper>
        <ReceiverInputRow>
          {isValid && !loading && <ValidCheckmark src={OrderCheckIcon} aria-hidden="true" />}
          <ReceiverInput
            className={className}
            type="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder={resolvedPlaceholder}
            $error={isError}
            pattern={strategy.pattern}
            onChange={handleInput}
            value={displayValue}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </ReceiverInputRow>
        {isError && (
          <ReceiverErrorText>
            <Trans>Enter a valid {chainLabel} address</Trans>
          </ReceiverErrorText>
        )}
      </ReceiverInputWrapper>
      {showConfirmationRow && (
        <ReceiverConfirmationRow
          chainName={chainInfo?.label ?? ''}
          confirmed={isConfirmed}
          onConfirmChange={handleConfirmChange}
        />
      )}
    </>
  )
}
