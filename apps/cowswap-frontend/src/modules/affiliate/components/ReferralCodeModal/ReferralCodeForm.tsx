import { FormEvent, ReactNode, RefObject } from 'react'

import SaveIcon from '@cowprotocol/assets/images/icon-save.svg'
import { Badge } from '@cowprotocol/ui'

import { t, Trans } from '@lingui/macro'
import { Edit2 } from 'react-feather'
import SVG from 'react-inlinesvg'

import { ReferralCodeInputRow } from './ReferralCodeInputRow'
import {
  FormActions,
  FormActionButton,
  FormActionDanger,
  FormGroup,
  Label,
  LabelAffordances,
  LabelRow,
  TagGroup,
} from './styles'

import { ReferralModalUiState } from '../../hooks/useReferralModalState'
import { ReferralVerificationStatus } from '../../types'
import { isReferralCodeLengthValid } from '../../utils/code'

type TrailingIconKind = 'error' | 'lock' | 'pending' | 'success'

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
  const {
    uiState,
    savedCode,
    displayCode,
    verification,
    onEdit,
    onRemove,
    onSave,
    onChange,
    onPrimaryClick,
    inputRef,
  } = props

  const showPendingLabelInInput = shouldShowPendingLabel(verification)
  const showValidLabelInInput = verification.kind === 'valid'
  const showPendingTag = verification.kind === 'pending' && !showPendingLabelInInput
  const showValidTag = verification.kind === 'valid' && !showValidLabelInInput
  const hasError = verification.kind === 'invalid' || verification.kind === 'expired' || verification.kind === 'error'
  const isEditing = uiState === 'editing'
  const isInputDisabled = uiState !== 'editing' && uiState !== 'empty'
  const isLinked = uiState === 'linked'
  const trailingIconKind = resolveTrailingIconKind({
    isLinked,
    hasError,
    showPendingLabelInInput,
    showValidLabelInInput,
  })
  const isSaveDisabled = !isReferralCodeLengthValid(displayCode || '')
  const canEdit = !isEditing && uiState !== 'linked' && uiState !== 'ineligible' && uiState !== 'empty'
  const showEdit = canEdit && Boolean(savedCode)
  const showRemove = isEditing && Boolean(savedCode)
  const showSave = isEditing || uiState === 'empty'
  const canSubmitSave = showSave && !isSaveDisabled
  const submitAction = canSubmitSave ? onSave : onPrimaryClick

  return (
    <FormGroup
      onSubmit={(event) => {
        event.preventDefault()
        submitAction()
      }}
    >
      <LabelRow>
        <Label htmlFor="referral-code-input">
          <Trans>Referral code</Trans>
        </Label>
        <LabelAffordances>
          <ReferralCodeTags showPendingTag={showPendingTag} showValidTag={showValidTag} />
          <ReferralCodeActions
            showEdit={showEdit}
            showRemove={showRemove}
            showSave={showSave}
            onEdit={onEdit}
            onRemove={onRemove}
            onSave={onSave}
            isSaveDisabled={isSaveDisabled}
          />
        </LabelAffordances>
      </LabelRow>

      <ReferralCodeInputRow
        displayCode={displayCode}
        hasError={hasError}
        isInputDisabled={isInputDisabled}
        isEditing={isEditing}
        isLinked={isLinked}
        trailingIconKind={trailingIconKind}
        canSubmitSave={canSubmitSave}
        onChange={onChange}
        onPrimaryClick={onPrimaryClick}
        onSave={onSave}
        inputRef={inputRef}
      />
    </FormGroup>
  )
}

interface ReferralCodeTagsProps {
  showPendingTag: boolean
  showValidTag: boolean
}

function ReferralCodeTags({ showPendingTag, showValidTag }: ReferralCodeTagsProps): ReactNode {
  const showTags = showPendingTag || showValidTag

  if (!showTags) {
    return null
  }

  return (
    <TagGroup>
      {showPendingTag && <Badge type="information">{t`Pending`}</Badge>}
      {showValidTag && <Badge type="success">{t`Valid`}</Badge>}
    </TagGroup>
  )
}

interface ReferralCodeActionsProps {
  showEdit: boolean
  showRemove: boolean
  showSave: boolean
  onEdit(): void
  onRemove(): void
  onSave(): void
  isSaveDisabled: boolean
}

function ReferralCodeActions({
  showEdit,
  showRemove,
  showSave,
  onEdit,
  onRemove,
  onSave,
  isSaveDisabled,
}: ReferralCodeActionsProps): ReactNode {
  if (!showEdit && !showRemove && !showSave) {
    return null
  }

  return (
    <FormActions>
      {showRemove && (
        <FormActionDanger type="button" onClick={onRemove}>
          <Trans>Remove</Trans>
        </FormActionDanger>
      )}
      {showSave && (
        <FormActionButton
          type="button"
          variant="filled"
          onClick={onSave}
          disabled={isSaveDisabled}
          aria-label={t`Save code`}
        >
          <SVG width={12} height={12} src={SaveIcon} title={t`Save`} />
          <Trans>Save</Trans>
        </FormActionButton>
      )}
      {showEdit && (
        <FormActionButton type="button" variant="outline" onClick={onEdit} aria-label={t`Edit code`}>
          <Edit2 size={14} />
          <Trans>Edit</Trans>
        </FormActionButton>
      )}
    </FormActions>
  )
}

function shouldShowPendingLabel(verification: ReferralVerificationStatus): boolean {
  return verification.kind === 'pending'
}

function resolveTrailingIconKind(params: {
  isLinked: boolean
  hasError: boolean
  showPendingLabelInInput: boolean
  showValidLabelInInput: boolean
}): TrailingIconKind | undefined {
  if (params.isLinked) {
    return 'lock'
  }

  if (params.hasError) {
    return 'error'
  }

  if (params.showPendingLabelInInput) {
    return 'pending'
  }

  if (params.showValidLabelInInput) {
    return 'success'
  }

  return undefined
}
