import { FormEvent, ReactNode, RefObject } from 'react'

import { Badge } from '@cowprotocol/ui'

import { t, Trans } from '@lingui/macro'
import { Edit2, Lock } from 'react-feather'

import { ReferralCodeInputRow } from './ReferralCodeInputRow'
import { FormGroup, Label, LabelRow, TagGroup, EditButton, LinkedLock } from './styles'

import { ReferralModalUiState } from '../../hooks/useReferralModalState'
import { ReferralVerificationStatus } from '../../types'

export interface ReferralCodeFormProps {
  uiState: ReferralModalUiState
  savedCode?: string
  displayCode: string
  verification: ReferralVerificationStatus
  onEdit(): void
  onRemove(): void
  onSave(): void
  onChange(event: FormEvent<HTMLInputElement>): void
  onPrimaryClick(): void
  inputRef: RefObject<HTMLInputElement | null>
}

export function ReferralCodeForm(props: ReferralCodeFormProps): ReactNode {
  const { uiState, savedCode, displayCode, verification, onEdit, onRemove, onSave, onChange, onPrimaryClick, inputRef } =
    props

  const showPendingTag = verification.kind === 'pending'
  const showValidTag = verification.kind === 'valid'
  const hasError = verification.kind === 'invalid' || verification.kind === 'expired'
  const isInputDisabled = uiState !== 'editing' && uiState !== 'empty'
  const trailingIconKind = hasError ? 'error' : undefined

  return (
    <FormGroup onSubmit={(event) => event.preventDefault()}>
      <LabelRow>
        <Label htmlFor="referral-code-input">
          <Trans>Referral code</Trans>
        </Label>
        <ReferralCodeTags
          uiState={uiState}
          savedCode={savedCode}
          showPendingTag={showPendingTag}
          showValidTag={showValidTag}
          onEdit={onEdit}
        />
      </LabelRow>

      <ReferralCodeInputRow
        displayCode={displayCode}
        hasError={hasError}
        isInputDisabled={isInputDisabled}
        trailingIconKind={trailingIconKind}
        uiState={uiState}
        savedCode={savedCode}
        onRemove={onRemove}
        onSave={onSave}
        onChange={onChange}
        onPrimaryClick={onPrimaryClick}
        inputRef={inputRef}
      />
    </FormGroup>
  )
}

interface ReferralCodeTagsProps {
  uiState: ReferralModalUiState
  savedCode?: string
  showPendingTag: boolean
  showValidTag: boolean
  onEdit(): void
}

function ReferralCodeTags({ uiState, savedCode, showPendingTag, showValidTag, onEdit }: ReferralCodeTagsProps): ReactNode {
  const showLinkedTag = uiState === 'linked'

  return (
    <TagGroup>
      {showPendingTag && <Badge type="information">{t`Pending`}</Badge>}
      {showValidTag && <Badge type="success">{t`Valid`}</Badge>}

      {showLinkedTag ? (
        <LinkedLock>
          <Lock size={14} />
          <Trans>Linked</Trans>
        </LinkedLock>
      ) : (
        savedCode &&
        uiState !== 'editing' &&
        uiState !== 'empty' && (
          <EditButton type="button" onClick={onEdit} aria-label={t`Edit code`}>
            <Edit2 size={14} />
            <Trans>Edit</Trans>
          </EditButton>
        )
      )}
    </TagGroup>
  )
}
