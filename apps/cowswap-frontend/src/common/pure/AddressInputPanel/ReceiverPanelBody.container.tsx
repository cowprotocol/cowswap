import { ReactElement, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import svgOrderCheckSrc from '@cowprotocol/assets/cow-swap/order-check.svg'
import { TargetChainId } from '@cowprotocol/cow-sdk'
import { TEST_IDS } from '@cowprotocol/test-ids'

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
  value: string
  onChange(value: string): void
  targetChainId?: TargetChainId
  placeholder?: string
  isBridging?: boolean
  isSmartContractWalletBridging?: boolean
  onNonEvmReceiverConfirmedChange?: (confirmed: boolean) => void
}

export function ReceiverPanelBody({
  value,
  onChange,
  targetChainId,
  placeholder,
  isBridging = false,
  isSmartContractWalletBridging,
  onNonEvmReceiverConfirmedChange,
}: ReceiverPanelBodyProps): ReactElement {
  const { strategy, isNonEvm, chainInfo, chainId } = useReceiverChainInfo(targetChainId)
  const { isValid, isError, loading } = useReceiverValidation(value, targetChainId)
  const { handleInput, chainPrefixWarning } = useOnAddressInput(onChange, chainInfo?.addressPrefix, strategy, value)
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

  const defaultPlaceholder = useReceiverPlaceholder(strategy, chainId, isBridging)
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

  const showCheckmark = isValid && !loading

  return (
    <>
      {chainPrefixWarning && <ChainPrefixWarning chainPrefixWarning={chainPrefixWarning} chainInfo={chainInfo} />}
      <ReceiverInputWrapper>
        <ReceiverInputRow>
          {showCheckmark && <ValidCheckmark src={svgOrderCheckSrc} aria-hidden="true" />}
          <ReceiverInput
            data-testid={TEST_IDS.recipientAddressInput}
            type="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder={resolvedPlaceholder}
            $error={isError}
            // Only shrink the input to fit its content when a confirmed, short, JS-truncated
            // address is shown next to the checkmark. Keep the default full-width, truncating
            // (overflow: hidden + text-overflow: ellipsis) input otherwise, so a long invalid
            // pasted value doesn't blow out the layout - see ReceiverInput's styles.
            $compact={showCheckmark}
            pattern={strategy.pattern}
            onChange={handleInput}
            value={displayValue}
            onFocus={handleFocus}
            onBlur={handleBlur}
            // On narrow viewports, when $compact, the input's CSS width is `auto`, so its size
            // falls back to the browser default (~20 characters) unless overridden here. Without
            // this, the box is wider than the (usually short, truncated) address, and
            // text-align: center leaves the checkmark next to the box edge but far from the text.
            size={showCheckmark ? displayValue.length || undefined : undefined}
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
