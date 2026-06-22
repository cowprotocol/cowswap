import { ReactNode } from 'react'

import { ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import { ButtonPrimary } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import * as styledEl from './HookDappIframeReview.styled'
import { HookRequestDetails } from './HookRequestDetails.pure'

import { PendingIframeHookMutation } from '../../containers/HookDappContainer/hookDappIframeRequests.utils'

interface HookDappIframeReviewProps {
  chainId: number
  dappName: string
  dappUrl: string
  isPreHook: boolean
  mutation: PendingIframeHookMutation
  onCancel(): void
  onConfirm(): void
}

export function HookDappIframeReview({
  chainId,
  dappName,
  dappUrl,
  isPreHook,
  mutation,
  onCancel,
  onConfirm,
}: HookDappIframeReviewProps): ReactNode {
  const { hook, recipientOverride } = mutation.payload
  const actionLabel =
    mutation.type === 'edit'
      ? isPreHook
        ? t`Update pre-hook`
        : t`Update post-hook`
      : isPreHook
        ? t`Add pre-hook`
        : t`Add post-hook`
  const targetLink = getExplorerLink(chainId, hook.target, ExplorerDataType.ADDRESS)

  return (
    <styledEl.Wrapper>
      <styledEl.CopyBlock>
        <styledEl.Title>
          <Trans>Review hook request</Trans>
        </styledEl.Title>
        <styledEl.Description>
          <Trans>
            The embedded hook dapp requested a hook-state change. Review the request before it can be applied.
          </Trans>
        </styledEl.Description>
      </styledEl.CopyBlock>

      <HookRequestDetails
        actionLabel={actionLabel}
        calldata={hook.callData}
        dappName={dappName}
        dappUrl={dappUrl}
        gasLimit={hook.gasLimit}
        recipientOverride={recipientOverride}
        target={hook.target}
        targetLink={targetLink}
      />

      <styledEl.WarningBox>
        <strong>
          <Trans>Caution</Trans>
        </strong>
        <span>
          <Trans>Only confirm if you trust this dapp and recognize the target contract and calldata above.</Trans>
        </span>
      </styledEl.WarningBox>

      <styledEl.Actions>
        <ButtonPrimary onClick={onConfirm}>
          <Trans>Confirm hook</Trans>
        </ButtonPrimary>
        <styledEl.CancelButton onClick={onCancel}>
          <Trans>Cancel</Trans>
        </styledEl.CancelButton>
      </styledEl.Actions>
    </styledEl.Wrapper>
  )
}
