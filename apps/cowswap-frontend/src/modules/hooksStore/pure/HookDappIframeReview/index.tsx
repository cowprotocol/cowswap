import { ReactNode } from 'react'

import { ButtonPrimary, ButtonSecondary, UI } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { PendingIframeHookMutation } from '../../containers/HookDappContainer/hookDappIframeRequests.utils'

interface HookDappIframeReviewProps {
  dappName: string
  dappUrl: string
  isPreHook: boolean
  mutation: PendingIframeHookMutation
  onCancel(): void
  onConfirm(): void
}

export function HookDappIframeReview({
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

  return (
    <Wrapper>
      <CopyBlock>
        <Title>
          <Trans>Review hook request</Trans>
        </Title>
        <Description>
          <Trans>
            The embedded hook dapp requested a hook-state change. Review the request before it can be applied.
          </Trans>
        </Description>
      </CopyBlock>

      <WarningBox>
        <strong>
          <Trans>Caution</Trans>
        </strong>
        <span>
          <Trans>Only confirm if you trust this dapp and recognize the target contract and calldata below.</Trans>
        </span>
      </WarningBox>

      <DetailsGrid>
        <Label>
          <Trans>Action</Trans>
        </Label>
        <Value>{actionLabel}</Value>

        <Label>
          <Trans>Dapp</Trans>
        </Label>
        <Value>{dappName}</Value>

        <Label>
          <Trans>Source</Trans>
        </Label>
        <MonoValue>{dappUrl}</MonoValue>

        <Label>
          <Trans>Target</Trans>
        </Label>
        <MonoValue>{hook.target}</MonoValue>

        <Label>
          <Trans>Gas limit</Trans>
        </Label>
        <MonoValue>{hook.gasLimit}</MonoValue>

        {recipientOverride && (
          <>
            <Label>
              <Trans>Recipient override</Trans>
            </Label>
            <MonoValue>{recipientOverride}</MonoValue>
          </>
        )}
      </DetailsGrid>

      <CallDataBlock>
        <Label>
          <Trans>Calldata</Trans>
        </Label>
        <CallDataValue>{hook.callData}</CallDataValue>
      </CallDataBlock>

      <Actions>
        <ButtonSecondary onClick={onCancel}>
          <Trans>Cancel</Trans>
        </ButtonSecondary>
        <ButtonPrimary onClick={onConfirm}>
          <Trans>Confirm hook</Trans>
        </ButtonPrimary>
      </Actions>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 10px 16px;
`

const CopyBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Title = styled.h3`
  margin: 0;
`

const Description = styled.p`
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

const WarningBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border-radius: 12px;
  background: var(${UI.COLOR_ALERT_BG});
  color: var(${UI.COLOR_ALERT_TEXT});
`

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(120px, 150px) 1fr;
  gap: 8px 12px;
`

const Label = styled.span`
  font-size: var(${UI.FONT_SIZE_SMALL});
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

const Value = styled.span`
  color: var(${UI.COLOR_TEXT});
`

const MonoValue = styled.code`
  font-family: var(${UI.FONT_FAMILY_MONO});
  font-size: var(${UI.FONT_SIZE_SMALL});
  white-space: normal;
  overflow-wrap: anywhere;
`

const CallDataBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const CallDataValue = styled.pre`
  margin: 0;
  padding: 12px;
  border-radius: 12px;
  background: var(${UI.COLOR_PAPER_DARKER});
  font-family: var(${UI.FONT_FAMILY_MONO});
  font-size: var(${UI.FONT_SIZE_SMALL});
  white-space: pre-wrap;
  overflow-wrap: anywhere;
`

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`
