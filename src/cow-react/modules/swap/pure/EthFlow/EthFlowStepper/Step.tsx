import React from 'react'
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

export interface StepProps {
  state: StatusIconState
  icon: Icon
  label: string
  crossOut?: boolean
  details?: React.ReactNode
}

export function Step(props: StepProps) {
  const { label, crossOut, details, state, icon } = props
  return (
    <StepWrapper>
      <StatusIcon icon={icon} state={state} label={label} crossOut={crossOut} />
      {details}
    </StepWrapper>
  )
}
