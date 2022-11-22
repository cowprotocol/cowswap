import React, { PropsWithChildren } from 'react'
import { Icon } from 'react-feather'
import styled from 'styled-components/macro'
import { StatusIcon, StatusIconState } from './StatusIcon'

const StepWrapper = styled.div`
  height: 100%;
  padding: 10px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 6rem;
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
