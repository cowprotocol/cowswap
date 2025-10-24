import { FormEvent, ReactNode, RefObject } from 'react'

import { Badge, ButtonPrimary, LinkStyledButton, Loader, ModalHeader, StatusColorVariant } from '@cowprotocol/ui'

import { t, Trans } from '@lingui/macro'
import { AlertCircle, Edit2, Lock, Trash2 } from 'react-feather'

import {
  Body,
  ModalContainer,
  Illustration,
  Subtitle,
  FormGroup,
  LabelRow,
  Label,
  TagGroup,
  EditButton,
  InputWrapper,
  StyledInput,
  TrailingActions,
  InlineAction,
  StatusMessage,
  SpinnerRow,
  Footer,
  HelperText,
  InlineAlert,
  ErrorInline,
  LinkedLock,
  TrailingIcon,
} from './styles'
import { ReferralModalContentProps } from './types'

import { REFERRAL_HOW_IT_WORKS_URL } from '../../constants'
import { ReferralModalUiState } from '../../hooks/useReferralModalState'
import { ReferralVerificationStatus } from '../../types'
import { isReferralCodeLengthValid } from '../../utils/code'

export function ReferralModalContent(props: ReferralModalContentProps): ReactNode {
  const { uiState, onPrimaryClick, helperText, primaryCta, onDismiss, inputRef, ctaRef } = props

  const formProps: ReferralCodeFormProps = {
    uiState,
    savedCode: props.savedCode,
    displayCode: props.displayCode,
    verification: props.verification,
    onEdit: props.onEdit,
    onRemove: props.onRemove,
    onSave: props.onSave,
    onChange: props.onChange,
    onPrimaryClick,
    inputRef,
  }

  const statusProps: ReferralStatusMessagesProps = {
    uiState,
    verification: props.verification,
    invalidMessage: props.invalidMessage,
    expiredMessage: props.expiredMessage,
    errorMessage: props.errorMessage,
    linkedMessage: props.linkedMessage,
    ineligibleMessage: props.ineligibleMessage,
    infoMessage: props.infoMessage,
    shouldShowInfo: props.shouldShowInfo,
    howItWorksLink: (
      <LinkStyledButton as="a" href={REFERRAL_HOW_IT_WORKS_URL} target="_blank" rel="noopener noreferrer">
        <Trans>How it works.</Trans>
      </LinkStyledButton>
    ),
  }

  return (
    <ModalContainer>
      <ModalHeader onBack={onDismiss} onClose={onDismiss}>
        {getModalTitle(uiState)}
      </ModalHeader>

      <Body>
        <Illustration>&lt; illustration &gt;</Illustration>
        <ReferralSubtitle uiState={uiState} howItWorksLink={statusProps.howItWorksLink} />
        <ReferralCodeForm {...formProps} />
        <ReferralStatusMessages {...statusProps} />
      </Body>

      <Footer>
        <ButtonPrimary ref={ctaRef} disabled={primaryCta.disabled} onClick={onPrimaryClick} type="button">
          {primaryCta.label}
        </ButtonPrimary>

        {helperText && <HelperText>{helperText}</HelperText>}
      </Footer>
    </ModalContainer>
  )
}

interface ReferralSubtitleProps {
  uiState: ReferralModalUiState
  howItWorksLink: ReactNode
}

function ReferralSubtitle({ uiState, howItWorksLink }: ReferralSubtitleProps): ReactNode {
  const isPostValidation = uiState === 'valid' || uiState === 'linked'

  return (
    <Subtitle>
      {isPostValidation ? (
        <>
          <Trans>Code binds on your first eligible trade. Earn 10 USDC per 50k eligible volume in 90 days.</Trans>{' '}
          {howItWorksLink}
        </>
      ) : (
        <>
          <Trans>
            Connect to verify eligibility. Code binds on your first eligible trade. Earn 10 USDC per 50k eligible volume
            in 90 days.
          </Trans>{' '}
          {howItWorksLink}
        </>
      )}
    </Subtitle>
  )
}

interface ReferralCodeFormProps {
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

function ReferralCodeForm(props: ReferralCodeFormProps): ReactNode {
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

function ReferralCodeInputRow(props: ReferralCodeInputRowProps): ReactNode {
  const { displayCode, hasError, isInputDisabled, trailingIconKind, uiState, savedCode, onRemove, onSave, onChange, onPrimaryClick, inputRef } =
    props

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

interface ReferralStatusMessagesProps {
  uiState: ReferralModalUiState
  verification: ReferralVerificationStatus
  invalidMessage: string
  expiredMessage: string
  errorMessage?: string
  linkedMessage: string
  ineligibleMessage: string
  infoMessage: string
  shouldShowInfo: boolean
  howItWorksLink: ReactNode
}

function ReferralStatusMessages(props: ReferralStatusMessagesProps): ReactNode {
  const {
    uiState,
    verification,
    invalidMessage,
    expiredMessage,
    errorMessage,
    linkedMessage,
    ineligibleMessage,
    infoMessage,
    shouldShowInfo,
    howItWorksLink,
  } = props

  const hasError = verification.kind === 'invalid' || verification.kind === 'expired'

  return (
    <StatusMessage role="status" aria-live="polite">
      {verification.kind === 'checking' && (
        <SpinnerRow>
          <Loader size="16px" />
          <Trans>Checking code…</Trans>
        </SpinnerRow>
      )}

      {hasError && (
        <ErrorInline bannerType={StatusColorVariant.Alert}>
          {verification.kind === 'expired' ? expiredMessage : invalidMessage}
        </ErrorInline>
      )}

      {verification.kind === 'error' && errorMessage && (
        <ErrorInline bannerType={StatusColorVariant.Alert}>{errorMessage}</ErrorInline>
      )}

      {uiState === 'linked' && (
        <InlineAlert bannerType={StatusColorVariant.Info}>
          {linkedMessage} {howItWorksLink}
        </InlineAlert>
      )}

      {uiState === 'ineligible' && (
        <InlineAlert bannerType={StatusColorVariant.Alert}>
          {ineligibleMessage} {howItWorksLink}
        </InlineAlert>
      )}

      {shouldShowInfo && <InlineAlert bannerType={StatusColorVariant.Success}>{infoMessage}</InlineAlert>}
    </StatusMessage>
  )
}

function getModalTitle(uiState: ReferralModalUiState): string {
  switch (uiState) {
    case 'linked':
      return t`Already linked to a referral code.`
    case 'ineligible':
      return t`Your wallet is ineligible.`
    default:
      return t`Enter referral code.`
  }
}
