import { FormEvent, ReactNode, RefObject } from 'react'

import AlertIcon from '@cowprotocol/assets/cow-swap/alert-circle.svg'
import CheckIcon from '@cowprotocol/assets/cow-swap/order-check.svg'
import PendingIcon from '@cowprotocol/assets/cow-swap/spinner.svg'
import LinkedIcon from '@cowprotocol/assets/images/icon-locked-2.svg'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import { InputWrapper, StyledInput, TrailingIcon } from './styles'

interface ReferralCodeInputRowProps {
  displayCode: string
  hasError: boolean
  isInputDisabled: boolean
  isEditing: boolean
  isLinked: boolean
  trailingIconKind?: 'error' | 'lock' | 'pending' | 'success'
  canSubmitSave: boolean
  onChange(event: FormEvent<HTMLInputElement>): void
  onPrimaryClick(): void
  onSave(): void
  inputRef: RefObject<HTMLInputElement | null>
  isLoading?: boolean
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
    isLoading = false,
  } = props

  return (
    <InputWrapper
      hasError={hasError}
      disabled={isInputDisabled}
      isEditing={isEditing}
      isLinked={isLinked}
      isLoading={isLoading}
    >
      <StyledInput
        id="referral-code-input"
        ref={inputRef}
        value={displayCode || ''}
        placeholder={t`ENTER CODE`}
        onChange={onChange}
        disabled={isInputDisabled}
        maxLength={20}
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

      {isLoading ? (
        <TrailingIcon kind="pending" isSpinning>
          {renderIconWithLabel(PendingIcon, t`Checking`, <Trans>Checking</Trans>)}
        </TrailingIcon>
      ) : (
        trailingIconKind && <TrailingIcon kind={trailingIconKind}>{renderTrailingIcon(trailingIconKind)}</TrailingIcon>
      )}
    </InputWrapper>
  )
}

function renderTrailingIcon(kind: NonNullable<ReferralCodeInputRowProps['trailingIconKind']>): ReactNode {
  if (kind === 'lock') {
    return renderIconWithLabel(LinkedIcon, t`Linked`, <Trans>Linked</Trans>)
  }

  if (kind === 'success') {
    return renderIconWithLabel(CheckIcon, t`Valid`, <Trans>Valid</Trans>)
  }

  if (kind === 'pending') {
    return renderIconWithLabel(PendingIcon, t`Pending`, <Trans>Pending</Trans>)
  }

  return <SVG src={AlertIcon} title={t`Invalid code`} />
}

function renderIconWithLabel(src: string, title: string, label: ReactNode): ReactNode {
  return (
    <>
      <SVG src={src} title={title} />
      <span>{label}</span>
    </>
  )
}
