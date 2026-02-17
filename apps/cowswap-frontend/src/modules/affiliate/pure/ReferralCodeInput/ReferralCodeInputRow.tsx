import { FormEvent, ReactNode, RefObject } from 'react'

import AlertIcon from '@cowprotocol/assets/cow-swap/alert-circle.svg'
import CheckIcon from '@cowprotocol/assets/cow-swap/order-check.svg'
import PendingIcon from '@cowprotocol/assets/cow-swap/spinner.svg'
import LinkedIcon from '@cowprotocol/assets/images/icon-locked-2.svg'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import { InputWrapper, StyledInput, TrailingIcon, TrailingIconPlaceholder } from './ReferralCodeInputRow.styles'

export type TrailingIconKind = 'error' | 'lock' | 'pending' | 'success'

type IconKind = Exclude<TrailingIconKind, 'error'>
type IconLabelMap = Partial<Record<IconKind, ReactNode>>
type IconTitleMap = Partial<Record<IconKind, string>>

const DEFAULT_ICON_LABELS: Record<IconKind, () => ReactNode> = {
  lock: () => <Trans>Linked</Trans>,
  pending: () => <Trans>Pending</Trans>,
  success: () => <Trans>Valid</Trans>,
}

function getDefaultLoadingLabel(): ReactNode {
  return <Trans>Checking</Trans>
}

interface ReferralCodeInputRowProps {
  displayCode: string
  hasError: boolean
  isInputDisabled: boolean
  isEditing: boolean
  isLinked: boolean
  trailingIconKind?: TrailingIconKind
  canSubmitSave: boolean
  onChange(event: FormEvent<HTMLInputElement>): void
  onPrimaryClick(): void
  onSave(): void
  inputRef?: RefObject<HTMLInputElement | null>
  isLoading?: boolean
  inputId?: string
  placeholder?: string
  maxLength?: number
  size?: 'default' | 'compact'
  trailingIconLabels?: IconLabelMap
  trailingIconTitles?: IconTitleMap
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
    inputId = 'referral-code-input',
    placeholder = t`ENTER CODE`,
    maxLength = 20,
    size = 'default',
    trailingIconLabels,
    trailingIconTitles,
  } = props

  return (
    <InputWrapper
      hasError={hasError}
      disabled={isInputDisabled}
      isEditing={isEditing}
      isLinked={isLinked}
      isLoading={isLoading}
      $size={size}
    >
      <StyledInput
        id={inputId}
        ref={inputRef}
        value={displayCode || ''}
        placeholder={placeholder}
        onChange={onChange}
        disabled={isInputDisabled}
        maxLength={maxLength}
        $size={size}
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
          {renderIconWithLabel(
            PendingIcon,
            trailingIconTitles?.pending ?? getDefaultLoadingTitle(),
            trailingIconLabels?.pending ?? getDefaultLoadingLabel(),
          )}
        </TrailingIcon>
      ) : trailingIconKind ? (
        <TrailingIcon kind={trailingIconKind}>
          {renderTrailingIcon(trailingIconKind, trailingIconLabels, trailingIconTitles)}
        </TrailingIcon>
      ) : (
        <TrailingIconPlaceholder aria-hidden="true" />
      )}
    </InputWrapper>
  )
}

function renderTrailingIcon(kind: TrailingIconKind, labels?: IconLabelMap, titles?: IconTitleMap): ReactNode {
  if (kind === 'lock') {
    return renderIconWithLabel(LinkedIcon, getIconTitle('lock', titles), getIconLabel('lock', labels))
  }

  if (kind === 'success') {
    return renderIconWithLabel(CheckIcon, getIconTitle('success', titles), getIconLabel('success', labels))
  }

  if (kind === 'pending') {
    return renderIconWithLabel(PendingIcon, getIconTitle('pending', titles), getIconLabel('pending', labels))
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

function getIconLabel(kind: IconKind, labels?: IconLabelMap): ReactNode {
  return labels?.[kind] ?? DEFAULT_ICON_LABELS[kind]()
}

function getIconTitle(kind: IconKind, titles?: IconTitleMap): string {
  return titles?.[kind] ?? getDefaultIconTitle(kind)
}

function getDefaultIconTitle(kind: IconKind): string {
  if (kind === 'lock') {
    return t`Linked`
  }

  if (kind === 'pending') {
    return t`Pending`
  }

  return t`Valid`
}

function getDefaultLoadingTitle(): string {
  return t`Checking`
}
