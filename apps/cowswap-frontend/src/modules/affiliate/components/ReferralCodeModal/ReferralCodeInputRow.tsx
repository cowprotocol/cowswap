import { FormEvent, ReactNode, RefObject } from 'react'

import { t, Trans } from '@lingui/macro'
import { AlertCircle, Trash2, Lock } from 'react-feather'

import { InlineAction, InputWrapper, StyledInput, TrailingActions, TrailingIcon } from './styles'

import { ReferralModalUiState } from '../../hooks/useReferralModalState'
import { isReferralCodeLengthValid } from '../../utils/code'


interface ReferralCodeInputRowProps {
  displayCode: string
  hasError: boolean
  isInputDisabled: boolean
  trailingIconKind?: 'error' | 'lock'
  uiState: ReferralModalUiState
  savedCode?: string
  onRemove(): void
  onSave(): void
  onChange(event: FormEvent<HTMLInputElement>): void
  onPrimaryClick(): void
  inputRef: RefObject<HTMLInputElement | null>
}

export function ReferralCodeInputRow(props: ReferralCodeInputRowProps): ReactNode {
  const {
    displayCode,
    hasError,
    isInputDisabled,
    trailingIconKind,
    uiState,
    savedCode,
    onRemove,
    onSave,
    onChange,
    onPrimaryClick,
    inputRef,
  } = props

  return (
    <InputWrapper hasError={hasError} disabled={isInputDisabled}>
      <StyledInput
        id="referral-code-input"
        ref={inputRef}
        value={displayCode || ''}
        placeholder={t`ENTER-CODE`}
        onChange={onChange}
        disabled={isInputDisabled}
        maxLength={16}
        autoComplete="off"
        spellCheck={false}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            onPrimaryClick()
          }
        }}
      />

      <ReferralCodeTrailingActions
        trailingIconKind={trailingIconKind}
        uiState={uiState}
        savedCode={savedCode}
        displayCode={displayCode}
        onRemove={onRemove}
        onSave={onSave}
      />
    </InputWrapper>
  )
}

interface ReferralCodeTrailingActionsProps {
  trailingIconKind?: 'error' | 'lock'
  uiState: ReferralModalUiState
  savedCode?: string
  displayCode: string
  onRemove(): void
  onSave(): void
}

function ReferralCodeTrailingActions({
  trailingIconKind,
  uiState,
  savedCode,
  displayCode,
  onRemove,
  onSave,
}: ReferralCodeTrailingActionsProps): ReactNode {
  const isEditing = uiState === 'editing'
  const isSaveDisabled = !isReferralCodeLengthValid(displayCode || '')

  return (
    <TrailingActions>
      {trailingIconKind && (
        <TrailingIcon kind={trailingIconKind}>
          <AlertCircle size={18} />
        </TrailingIcon>
      )}

      {isEditing && (
        <>
          {savedCode && (
            <InlineAction type="button" emphasis="danger" onClick={onRemove}>
              <Trash2 size={14} />
              <Trans>Remove</Trans>
            </InlineAction>
          )}
          <InlineAction type="button" onClick={onSave} disabled={isSaveDisabled} aria-label={t`Save code`}>
            <Lock size={14} />
            <Trans>Save</Trans>
          </InlineAction>
        </>
      )}
    </TrailingActions>
  )
}
