import React from 'react'

import { UI } from '@cowprotocol/ui'

import { transparentize } from 'color2k'
import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

export type StatusIconState = 'success' | 'pending' | 'not-started' | 'error' | 'cancelled'

const Content = styled.span`
  display: flex;
  flex-flow: column wrap;
  gap: 6px;

  > a {
    white-space: pre;
  }
`

const StepIcon = styled.div<{ status: StatusIconState }>`
  --size: 52px;
  border-radius: var(--size);
  width: var(--size);
  height: var(--size);
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 0 6px;
  border: ${({ status }) =>
    status === 'pending'
      ? 'none'
      : status === 'error' || status === 'cancelled'
        ? 'none'
        : status === 'success'
          ? 'none'
          : `2px solid var(${UI.COLOR_PAPER})`};
  box-shadow: ${({ status, theme }) =>
    status === 'pending' ? `0 4px 12px 0 ${transparentize(theme.info, 0.9)}` : 'none'};
  background: ${({ status, theme }) =>
    status === 'pending'
      ? 'transparent'
      : status === 'error' || status === 'cancelled'
        ? transparentize(theme.danger, 0.9)
        : status === 'success'
          ? transparentize(theme.success, 0.9)
          : 'transparent'};
  transition:
    box-shadow var(${UI.ANIMATION_DURATION}) ease-in-out,
    background var(${UI.ANIMATION_DURATION}) ease-in-out,
    border var(${UI.ANIMATION_DURATION}) ease-in-out;
  position: relative;

  // 'PENDING' STATE only animation
  &::before {
    content: ${({ status }) => (status === 'pending' ? '""' : 'none')};
    background: ${({ theme }) => `conic-gradient(transparent 40grad, 80grad, ${theme.info} 360grad)`};
    display: block;
    width: var(--circle-size);
    padding: 0;
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    margin: auto;
    border-radius: 100%;
    z-index: 0;
    animation: spin 3s linear infinite;
  }

  // 'PENDING' STATE only animation
  &::after {
    content: ${({ status }) => (status === 'pending' ? '""' : 'none')};
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    z-index: 1;
    width: calc(var(--size) - 4px);
    height: calc(var(--size) - 4px);
    border-radius: calc(var(--size) - 4px);
    background: ${({ theme }) => theme.gradient1};
  }

  > svg {
    --color: ${({ status }) =>
      status === 'success'
        ? `var(${UI.COLOR_SUCCESS})`
        : status === 'error' || status === 'cancelled'
          ? `var(${UI.COLOR_DANGER})`
          : status === 'pending'
            ? `var(${UI.COLOR_TEXT})`
            : `var(${UI.COLOR_TEXT_OPACITY_70})`};
    object-fit: contain;
    width: 24px;
    height: 19px;
    margin: auto;
    display: inline-block;
    max-width: 100%;
    max-height: 100%;
    color: var(--color);
    z-index: 3;

    > path {
      fill: var(--color);
    }

    @keyframes spin {
      from {
        transform: rotate(0);
      }
      to {
        transform: rotate(360deg);
      }
    }
  }
`

const Label = styled.span<{ status: StatusIconState; crossOut: boolean }>`
  --color: ${({ status, crossOut }) =>
    status === 'pending' || status === 'not-started'
      ? `var(${UI.COLOR_TEXT})`
      : crossOut
        ? `var(${UI.COLOR_PAPER_DARKER})`
        : status === 'error' || status === 'cancelled'
          ? `var(${UI.COLOR_DANGER})`
          : status === 'success'
            ? `var(${UI.COLOR_SUCCESS})`
            : `var(${UI.COLOR_TEXT_OPACITY_70})`};
  color: var(--color);
  font-weight: ${({ status }) => (status === 'pending' ? '600' : '500')};
  font-size: 14px;
  margin: 0;
  text-decoration: ${({ crossOut }) => (crossOut ? 'line-through' : 'none')};
  display: flex;
  flex-flow: column wrap;
  line-height: 1.3;

  // Sublabel text
  > span {
    background: ${({ status, theme }) => (status === 'error' ? transparentize(theme.danger, 0.9) : 'transparent')};
    font-size: 13px;
    font-weight: 500;
    display: inline-block;
    padding: 6px 8px;
    border-radius: 6px;
    margin: 6px auto 0;
  }
`

export interface StatusIconProps {
  state: StatusIconState
  label: string
  crossOut?: boolean
  icon: string
  errorMessage?: string
  children: React.ReactNode
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function StatusIcon({ children, state, icon, label, crossOut = false, errorMessage }: StatusIconProps) {
  return (
    <>
      <StepIcon status={state}>
        <SVG src={icon} description={`Status: ${label}`} />
      </StepIcon>
      <Content>
        <Label status={state} crossOut={crossOut}>
          {label}
          {errorMessage && <span>{errorMessage}</span>}
        </Label>
        {children}
      </Content>
    </>
  )
}

export interface StepProps {
  status: StatusIconState
  details: React.ReactNode
}
