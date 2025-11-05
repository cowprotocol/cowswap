import { FormEvent, ReactNode, RefObject } from 'react'

import AlertIcon from '@cowprotocol/assets/cow-swap/alert-circle.svg'
import LinkedIcon from '@cowprotocol/assets/images/icon-locked-2.svg'

import { t, Trans } from '@lingui/macro'
import SVG from 'react-inlinesvg'

import { InputWrapper, StyledInput, TrailingIcon } from './styles'

interface ReferralCodeInputRowProps {
  displayCode: string
  hasError: boolean
  isInputDisabled: boolean
  isEditing: boolean
  isLinked: boolean
  trailingIconKind?: 'error' | 'lock'
  canSubmitSave: boolean
  onChange(event: FormEvent<HTMLInputElement>): void
  onPrimaryClick(): void
  onSave(): void
  inputRef: RefObject<HTMLInputElement | null>
}

export function ReferralCodeInputRow(props: ReferralCodeInputRowProps): ReactNode {
  const {
    displayCode,
    hasError,
    isInputDisabled,
    isEditing,
    trailingIconKind,
    isLinked,
    canSubmitSave,
    onChange,
    onPrimaryClick,
    onSave,
    inputRef,
  } = props

  return (
    <InputWrapper hasError={hasError} disabled={isInputDisabled} isEditing={isEditing} isLinked={isLinked}>
      <StyledInput
        id="referral-code-input"
        ref={inputRef}
        value={displayCode || ''}
        placeholder={t`ENTER CODE`}
        onChange={onChange}
        disabled={isInputDisabled}
        maxLength={16}
        autoComplete="off"
        spellCheck={false}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()

            if (canSubmitSave) {
              onSave()
              return
            }

            onPrimaryClick()
          }
        }}
      />

      {trailingIconKind && (
        <TrailingIcon kind={trailingIconKind}>
          {trailingIconKind === 'lock' ? (
            <>
              <SVG src={LinkedIcon} title={t`Linked`} />
              <span>
                <Trans>Linked</Trans>
              </span>
            </>
          ) : (
            <SVG src={AlertIcon} title={t`Invalid code`} />
          )}
        </TrailingIcon>
      )}
    </InputWrapper>
  )
}
