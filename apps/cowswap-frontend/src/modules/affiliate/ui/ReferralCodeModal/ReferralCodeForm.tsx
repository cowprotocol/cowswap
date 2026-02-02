import { FormEvent, ReactNode, RefObject } from 'react'

import SaveIcon from '@cowprotocol/assets/images/icon-save.svg'
import { Badge, HelpTooltip } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Edit2 } from 'react-feather'
import SVG from 'react-inlinesvg'

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

import { isReferralCodeLengthValid } from '../../lib/affiliate-program-utils'
import { ReferralModalUiState } from '../../model/hooks/useReferralModalState'
import { ReferralVerificationStatus } from '../../model/types'
import { ReferralCodeInputRow, type TrailingIconKind } from '../ReferralCodeInput'
import { LabelContent } from '../shared'

const VERIFICATION_ERROR_KINDS: ReadonlySet<ReferralVerificationStatus['kind']> = new Set([
  'invalid',
  'error',
  'ineligible',
])

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

// eslint-disable-next-line max-lines-per-function
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
  const isChecking = verification.kind === 'checking'
  const {
    hasError,
    isEditing,
    isInputDisabled,
    trailingIconKind,
    isSaveDisabled,
    showEdit,
    showRemove,
    showSave,
    canSubmitSave,
    isLinked,
  } = deriveFormFlags({
    uiState,
    verification,
    savedCode,
    displayCode,
    showPendingLabelInInput,
    showValidLabelInInput,
  })
  const submitAction = canSubmitSave ? onSave : onPrimaryClick

  const tooltipCopy = t`Referral codes contain 5-20 uppercase letters, numbers, dashes, or underscores`

  return (
    <FormGroup
      onSubmit={(event) => {
        event.preventDefault()
        submitAction()
      }}
    >
      <LabelRow>
        <Label htmlFor="referral-code-input">
          <LabelContent>
            <Trans>Referral code</Trans>
            <HelpTooltip text={tooltipCopy} />
          </LabelContent>
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
        isInputDisabled={isInputDisabled || isChecking}
        isEditing={isEditing}
        isLinked={isLinked}
        trailingIconKind={isChecking ? 'pending' : trailingIconKind}
        canSubmitSave={canSubmitSave}
        onChange={onChange}
        onPrimaryClick={onPrimaryClick}
        onSave={onSave}
        inputRef={inputRef}
        isLoading={isChecking}
      />
    </FormGroup>
  )
}

interface DeriveFormFlagsParams {
  uiState: ReferralModalUiState
  verification: ReferralVerificationStatus
  savedCode?: string
  displayCode: string
  showPendingLabelInInput: boolean
  showValidLabelInInput: boolean
}

interface FormFlags {
  hasError: boolean
  isEditing: boolean
  isInputDisabled: boolean
  trailingIconKind: TrailingIconKind | undefined
  isSaveDisabled: boolean
  showEdit: boolean
  showRemove: boolean
  showSave: boolean
  canSubmitSave: boolean
  isLinked: boolean
}

function deriveFormFlags(params: DeriveFormFlagsParams): FormFlags {
  // Split the boolean soup into small helpers so the main render stays readable
  // and lint-compliant. This also makes the unsupported-network rules explicit.
  const base = computeBaseFlags(params)
  const trailingIconKind = resolveTrailingIconKind({
    isLinked: base.isLinked,
    hasError: base.hasError,
    showPendingLabelInInput: params.showPendingLabelInInput,
    showValidLabelInInput: params.showValidLabelInInput,
  })

  return {
    ...base,
    trailingIconKind,
  }
}

interface BaseFlags {
  hasError: boolean
  isEditing: boolean
  isInputDisabled: boolean
  isSaveDisabled: boolean
  showEdit: boolean
  showRemove: boolean
  showSave: boolean
  canSubmitSave: boolean
  isLinked: boolean
  isUnsupported: boolean
}

// eslint-disable-next-line complexity
function computeBaseFlags(params: DeriveFormFlagsParams): BaseFlags {
  const { uiState, verification, savedCode, displayCode } = params

  // Unsupported network deliberately hides every edit affordance to avoid no-op buttons.
  const isUnsupported = uiState === 'unsupported'
  const isEditing = uiState === 'editing' || uiState === 'invalid' || uiState === 'ineligible' || uiState === 'error'
  const isLinked = uiState === 'linked'
  const hasError = VERIFICATION_ERROR_KINDS.has(verification.kind)
  const isInputDisabled = isUnsupported || (!isEditing && uiState !== 'empty')
  const isSaveDisabled = !isReferralCodeLengthValid(displayCode || '')
  const canEdit = !isUnsupported && !isEditing && !isLinked && uiState !== 'empty'
  const showEdit = canEdit && Boolean(savedCode)
  const showRemove = !isUnsupported && isEditing && Boolean(savedCode)
  const showSave = !isUnsupported && (isEditing || uiState === 'empty')
  const canSubmitSave = showSave && !isSaveDisabled

  return {
    hasError,
    isEditing,
    isInputDisabled,
    isSaveDisabled,
    showEdit,
    showRemove,
    showSave,
    canSubmitSave,
    isLinked,
    isUnsupported,
  }
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
