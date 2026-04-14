import { ChangeEvent, ReactElement } from 'react'

import { useLingui } from '@lingui/react/macro'
import { CheckCircle } from 'react-feather'

import { ReceiverErrorText, ReceiverInput, ReceiverInputRow, ReceiverInputWrapper, ValidCheckmark } from './styled'

import { AddressValidationStrategy } from '../../utils/addressValidation'
import { autofocus } from '../../utils/autofocus'

export interface ReceiverPanelBodyProps {
  className: string
  value: string
  isValid: boolean
  isError: boolean
  loading: boolean
  isNonEvm: boolean
  chainLabel?: string
  strategy: AddressValidationStrategy
  placeholder?: string
  handleInput(e: ChangeEvent<HTMLInputElement>): void
}

export function ReceiverPanelBody({
  className,
  value,
  isValid,
  isError,
  loading,
  isNonEvm,
  chainLabel,
  strategy,
  placeholder,
  handleInput,
}: ReceiverPanelBodyProps): ReactElement {
  const { t } = useLingui()
  const resolvedPlaceholder =
    placeholder ?? (strategy.placeholderKey === 'nonEvm' ? t`Recipient address` : t`Wallet Address or ENS name`)

  return (
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
      {isError && <ReceiverErrorText>Enter a valid {isNonEvm ? chainLabel : ''} address</ReceiverErrorText>}
    </ReceiverInputWrapper>
  )
}
