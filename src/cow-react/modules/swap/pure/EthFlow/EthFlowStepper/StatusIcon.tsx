import React from 'react'
import { Icon } from 'react-feather'
import styled, { css } from 'styled-components/macro'

export type StatusIconState = 'success' | 'pending' | 'not-started' | 'error'

interface StepIconStyle {
  bgColor: string
  color: string
  borderColor: string
}

const STATUS_ICON_STYLES: Record<StatusIconState, StepIconStyle> = {
  success: {
    bgColor: '#D5E5E3',
    borderColor: '#D5E5E3',
    color: '#017B28',
  },
  pending: {
    bgColor: '#F8F9FD',
    borderColor: '#F8F9FD',
    color: '#0D5ED9',
  },
  'not-started': {
    bgColor: 'none',
    borderColor: '#D6DDE9',
    color: '#D6DDE9',
  },
  error: {
    bgColor: '#f25757',
    borderColor: '#f25757',
    color: 'white',
  },
}

const LABEL_COLOR: Record<StatusIconState, string> = {
  success: STATUS_ICON_STYLES['success'].color,
  pending: STATUS_ICON_STYLES['pending'].color,
  'not-started': 'gray',
  error: STATUS_ICON_STYLES['error'].bgColor,
}

const StepIcon = styled.div<StepIconStyle>`
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 5px;
  border: 2px solid;

  ${({ bgColor, borderColor, color }) => css`
    background-color: ${bgColor};
    border-color: ${borderColor};
    color: ${color};
  `}
`

const Label = styled.span<{ state: StatusIconState }>`
  color: ${({ state }) => LABEL_COLOR[state]};
`

const LabelCrossOut = styled.span`
  text-decoration: line-through;
  color: ${LABEL_COLOR['not-started']};
`

export interface StatusIconProps {
  state: StatusIconState
  icon: Icon
  label: string
  crossOut?: boolean
}

export function StatusIcon({ state, icon: CustomIcon, label, crossOut = false }: StatusIconProps) {
  const styles = STATUS_ICON_STYLES[state]

  return (
    <>
      <StepIcon {...styles}>
        <CustomIcon size="20" />
      </StepIcon>
      {crossOut ? <LabelCrossOut>{label}</LabelCrossOut> : <Label state={state}>{label}</Label>}
    </>
  )
}

export interface StepProps {
  status: StatusIconState
  details: React.ReactNode
  icon: Icon
}
