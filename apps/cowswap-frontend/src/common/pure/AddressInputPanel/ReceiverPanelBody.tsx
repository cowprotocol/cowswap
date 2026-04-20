import { ReactElement, useCallback, useEffect, useState } from 'react'

import { TargetChainId } from '@cowprotocol/cow-sdk'

import { Trans, useLingui } from '@lingui/react/macro'
import { CheckCircle } from 'react-feather'

import { useIsDarkMode } from 'legacy/state/user/hooks'

import { useOnAddressInput } from './hooks/useOnAddressInput'
import { useReceiverChainInfo } from './hooks/useReceiverChainInfo'
import { useReceiverValidation } from './hooks/useReceiverValidation'
import { ReceiverConfirmationRow } from './ReceiverConfirmationRow'
import { ReceiverErrorText, ReceiverInput, ReceiverInputRow, ReceiverInputWrapper, ValidCheckmark } from './styled'

import { autofocus } from '../../utils/autofocus'
import ChainPrefixWarning from '../ChainPrefixWarning'

export interface ReceiverPanelBodyProps {
  className: string
  value: string
  onChange(value: string): void
  targetChainId?: TargetChainId
  placeholder?: string
  isSmartContractWallet?: boolean
  onNonEvmReceiverConfirmedChange?: (confirmed: boolean) => void
}

export function ReceiverPanelBody({
  className,
  value,
  onChange,
  targetChainId,
  placeholder,
  isSmartContractWallet,
  onNonEvmReceiverConfirmedChange,
}: ReceiverPanelBodyProps): ReactElement {
  const { t } = useLingui()
  const { strategy, isNonEvm, chainInfo } = useReceiverChainInfo(targetChainId)
  const { isValid, isError, loading } = useReceiverValidation(value, targetChainId)
  const { handleInput, chainPrefixWarning } = useOnAddressInput(onChange, chainInfo?.addressPrefix, strategy)
  const isDarkMode = useIsDarkMode()

  const [isConfirmed, setIsConfirmed] = useState(false)

  const resolvedPlaceholder =
    placeholder ?? (strategy.placeholderKey === 'nonEvm' ? t`Recipient address` : t`Wallet Address or ENS name`)
  const chainLabel = isNonEvm ? chainInfo?.label : ''

  // Reset confirmation when address or target chain changes
  useEffect(() => {
    setIsConfirmed(false)
    onNonEvmReceiverConfirmedChange?.(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, targetChainId])

  // Reset atom on unmount
  useEffect(() => {
    return () => {
      onNonEvmReceiverConfirmedChange?.(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleConfirmChange = useCallback(
    (confirmed: boolean) => {
      setIsConfirmed(confirmed)
      onNonEvmReceiverConfirmedChange?.(confirmed)
    },
    [onNonEvmReceiverConfirmedChange],
  )

  const showConfirmationRow = (isNonEvm || !!isSmartContractWallet) && isValid && !loading

  return (
    <>
      {chainPrefixWarning && (
        <ChainPrefixWarning chainPrefixWarning={chainPrefixWarning} chainInfo={chainInfo} isDarkMode={isDarkMode} />
      )}
      <ReceiverInputWrapper>
        <ReceiverInputRow>
          {isValid && !loading && (
            <ValidCheckmark>
              <CheckCircle size={20} />
            </ValidCheckmark>
          )}
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
            value={value}
            onFocus={autofocus}
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
