import { FormEvent, ReactNode, RefObject } from 'react'

import { Badge, HelpTooltip } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Edit2 } from 'react-feather'

import { TraderReferralCodeCodeCreationUiState } from './AffiliateTraderModal.types'
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

import { TraderReferralCodeVerificationStatus } from '../../lib/affiliateProgramTypes'
import { formatRefCode } from '../../lib/affiliateProgramUtils'
import { ReferralCodeInputRow, type TrailingIconKind } from '../ReferralCodeInput/ReferralCodeInputRow'
import { LabelContent } from '../shared'

const VERIFICATION_ERROR_KINDS: ReadonlySet<TraderReferralCodeVerificationStatus> = new Set(['invalid', 'error'])

export interface TraderReferralCodeFormProps {
  uiState: TraderReferralCodeCodeCreationUiState
  isConnected: boolean
  savedCode?: string
  displayCode: string
  verificationStatus: TraderReferralCodeVerificationStatus
  onEdit(): void
  onRemove(): void
  onSave(): void
  onChange(event: FormEvent<HTMLInputElement>): void
  onPrimaryClick(): void
  inputRef: RefObject<HTMLInputElement | null>
}

export function TraderReferralCodeForm(props: TraderReferralCodeFormProps): ReactNode {
  const {
    uiState,
    isConnected,
    savedCode,
    displayCode,
    verificationStatus,
    onEdit,
    onRemove,
    onSave,
    onChange,
    onPrimaryClick,
    inputRef,
  } = props

  const isEditingUi = uiState === 'editing' || uiState === 'invalid' || uiState === 'error'
  const showPendingLabelInInput = isConnected && shouldShowPendingLabel(verificationStatus) && isEditingUi
  const showValidLabelInInput = verificationStatus === 'valid' && isEditingUi
  const { hasError, isEditing, isInputDisabled, trailingIconKind, showEdit, showRemove, canSubmitSave } =
    deriveFormFlags({
      uiState,
      isConnected,
      verificationStatus,
      savedCode,
      displayCode,
      showPendingLabelInInput,
      showValidLabelInInput,
    })
  const showPendingTag = isConnected && verificationStatus === 'pending' && !showPendingLabelInInput
  const showValidTag = verificationStatus === 'valid' && !showValidLabelInInput
  const isChecking = verificationStatus === 'checking'
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
          <TraderReferralCodeTags showPendingTag={showPendingTag} showValidTag={showValidTag} />
          <TraderReferralCodeActions showEdit={showEdit} showRemove={showRemove} onEdit={onEdit} onRemove={onRemove} />
        </LabelAffordances>
      </LabelRow>

      <ReferralCodeInputRow
        displayCode={displayCode}
        hasError={hasError}
        isInputDisabled={isInputDisabled || isChecking}
        isEditing={isEditing}
        isLinked={false}
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
  uiState: TraderReferralCodeCodeCreationUiState
  isConnected: boolean
  verificationStatus: TraderReferralCodeVerificationStatus
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
  showEdit: boolean
  showRemove: boolean
  canSubmitSave: boolean
}

function deriveFormFlags(params: DeriveFormFlagsParams): FormFlags {
  // Split the boolean soup into small helpers so the main render stays readable and lint-compliant.
  const base = computeBaseFlags(params)
  const trailingIconKind = resolveTrailingIconKind({
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
  showEdit: boolean
  showRemove: boolean
  canSubmitSave: boolean
}

function computeBaseFlags(params: DeriveFormFlagsParams): BaseFlags {
  const { uiState, isConnected, verificationStatus, savedCode, displayCode } = params

  const isEditing = uiState === 'editing' || uiState === 'invalid' || uiState === 'error'
  const hasError = VERIFICATION_ERROR_KINDS.has(verificationStatus)
  const isInputDisabled = !isEditing && uiState !== 'empty'
  const canEdit = !isEditing && uiState !== 'empty'
  const allowDisconnectedEdit = uiState === 'pending' && !isConnected && Boolean(displayCode)
  const showEdit = canEdit && (Boolean(savedCode) || allowDisconnectedEdit)
  const showRemove = (isEditing || allowDisconnectedEdit) && (Boolean(savedCode) || allowDisconnectedEdit)
  const canSubmitSave = (isEditing || uiState === 'empty') && Boolean(formatRefCode(displayCode))

  return {
    hasError,
    isEditing,
    isInputDisabled,
    showEdit,
    showRemove,
    canSubmitSave,
  }
}

interface TraderReferralCodeTagsProps {
  showPendingTag: boolean
  showValidTag: boolean
}

function TraderReferralCodeTags({ showPendingTag, showValidTag }: TraderReferralCodeTagsProps): ReactNode {
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

interface TraderReferralCodeActionsProps {
  showEdit: boolean
  showRemove: boolean
  onEdit(): void
  onRemove(): void
}

function TraderReferralCodeActions({
  showEdit,
  showRemove,
  onEdit,
  onRemove,
}: TraderReferralCodeActionsProps): ReactNode {
  if (!showEdit && !showRemove) {
    return null
  }

  return (
    <FormActions>
      {showRemove && (
        <FormActionDanger type="button" onClick={onRemove}>
          <Trans>Remove</Trans>
        </FormActionDanger>
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

function shouldShowPendingLabel(verificationStatus: TraderReferralCodeVerificationStatus): boolean {
  return verificationStatus === 'pending'
}

function resolveTrailingIconKind(params: {
  hasError: boolean
  showPendingLabelInInput: boolean
  showValidLabelInInput: boolean
}): TrailingIconKind | undefined {
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
