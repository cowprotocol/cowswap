import React, { PropsWithChildren } from 'react'

import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { ExplorerLink } from 'legacy/components/ExplorerLink'

import { StatusIcon, StatusIconState } from './StatusIcon'

export const ExplorerLinkStyled = styled(ExplorerLink)``

const StepWrapper = styled.div`
  height: auto;
  width: auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  font-size: 14px;
  font-weight: 600;
  gap: 9px;
  position: relative;

  // Sublabel text
  > i {
    font-weight: 500;
    font-style: normal;
  }

  // Needs && to override
  && ${ExplorerLinkStyled} {
    display: block;
    font-weight: 500;
    text-decoration: underline;
    color: var(${UI.COLOR_TEXT});
    opacity: 1;
    font-size: 13px;
    width: 100%;
    max-width: 90px;
    word-break: break-word;
    white-space: pre-line;
    line-height: 1.3;
    margin: 4px auto 0;
  }
`

export type StepProps = PropsWithChildren<{
  state: StatusIconState
  icon: string
  label: string
  crossOut?: boolean
  errorMessage?: string
}>

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function Step(props: StepProps) {
  const { label, crossOut, children, state, icon, errorMessage } = props
  return (
    <StepWrapper>
      <StatusIcon icon={icon} state={state} label={label} crossOut={crossOut} errorMessage={errorMessage}>
        {children}
      </StatusIcon>
    </StepWrapper>
  )
}
