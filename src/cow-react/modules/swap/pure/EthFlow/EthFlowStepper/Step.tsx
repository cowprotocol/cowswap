import React, { PropsWithChildren } from 'react'
import { Icon } from 'react-feather'
import styled from 'styled-components/macro'
import { StatusIcon, StatusIconState } from './StatusIcon'
import { ExplorerLink } from 'components/ExplorerLink'

export const ExplorerLinkStyled = styled(ExplorerLink)`
  display: block;
`

const StepWrapper = styled.div`
  height: 100%;
  width: auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  font-size: 13px;
  font-weight: 600;

  // Needs && to override
  && ${ExplorerLinkStyled} {
    font-size: inherit;
    font-weight: inherit;
  }

  // Step 1
  &:first-child {
    text-align: left;
    align-items: flex-start;
  }

  // Step 2
  &:last-child {
    text-align: right;
    align-items: flex-end;
  }
`

export type StepProps = PropsWithChildren<{
  state: StatusIconState
  icon: Icon
  label: string
  crossOut?: boolean
}>

export function Step(props: StepProps) {
  const { label, crossOut, children, state, icon } = props
  return (
    <StepWrapper>
      <StatusIcon icon={icon} state={state} label={label} crossOut={crossOut} />
      {children}
    </StepWrapper>
  )
}
