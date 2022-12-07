import React, { PropsWithChildren } from 'react'
import styled from 'styled-components/macro'
import { StatusIcon, StatusIconState } from './StatusIcon'
import { ExplorerLink } from 'components/ExplorerLink'

export const ExplorerLinkStyled = styled(ExplorerLink)``

const StepWrapper = styled.div`
  height: 100%;
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
    color: ${({ theme }) => theme.text3};
    opacity: 1;
    font-size: 13px;
  }
`

export type StepProps = PropsWithChildren<{
  state: StatusIconState
  icon: string
  label: string
  crossOut?: boolean
  errorMessage?: string
}>

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
