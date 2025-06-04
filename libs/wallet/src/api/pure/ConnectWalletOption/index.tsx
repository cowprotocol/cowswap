import React from 'react'

import { Command } from '@cowprotocol/types'
import { ExternalLink, HoverTooltip, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

const InfoCard = styled.button<{ isActive?: boolean }>`
  background-color: ${({ theme, isActive }) => (isActive ? theme.background : theme.bg2)};
  padding: 1rem;
  outline: none;
  border: 1px solid;
  border-radius: 12px;
  width: 100% !important;
  border-color: ${({ theme, isActive }) => (isActive ? 'transparent' : theme.background)};
`

// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const OptionCard = styled(InfoCard as any)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 2rem;
  padding: 1rem;
`

const OptionCardLeft = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  justify-content: center;
  height: 100%;
`

// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const OptionCardClickable = styled(OptionCard as any)<{ clickable?: boolean; isDeprecated?: boolean }>`
  margin-top: 0;
  opacity: ${({ isDeprecated }) => (isDeprecated ? '0.5' : '1')};
  background-color: ${({ active }) => (active ? `var(${UI.COLOR_PRIMARY})` : `var(${UI.COLOR_PAPER_DARKER})`)};
  color: ${({ active }) => (active ? `var(${UI.COLOR_BUTTON_TEXT})` : 'inherit')};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease-in;
  height: 120px;
  border: 0;

  &:hover {
    cursor: ${({ clickable }) => (clickable ? 'pointer' : '')};
    background-color: ${({ clickable }) => clickable && `var(${UI.COLOR_PAPER_DARKEST})`};
  }
`

const GreenCircle = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  justify-content: center;
  align-items: center;

  &:first-child {
    height: 8px;
    width: 8px;
    margin-right: 8px;
    background-color: ${({ theme }) => theme.green1};
    border-radius: 50%;
  }
`

const CircleWrapper = styled.div`
  color: ${({ theme }) => theme.green1};
  display: flex;
  justify-content: center;
  align-items: center;
`

export const HeaderText = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  font-size: 13px;
  font-weight: 400;
  white-space: nowrap;
`

const SubHeader = styled.div`
  color: inherit;
  margin-top: 10px;
  font-size: 12px;
`

const IconWrapper = styled.div<{ size?: number | null }>`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;

  & > img,
  span {
    height: ${({ size }) => (size ? size + 'px' : '32px')};
    width: ${({ size }) => (size ? size + 'px' : '32px')};
  }
`

export interface ConnectWalletOptionProps {
  link?: string | null
  clickable?: boolean
  size?: number | null
  onClick?: Command | null
  color: string
  header: React.ReactNode
  subheader?: React.ReactNode
  icon: string
  isActive?: boolean
  id: string
  tooltipText?: string | null
  isDeprecated?: boolean
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type, complexity
export function ConnectWalletOption({
  onClick = null,
  link = null,
  clickable = true,
  size,
  color,
  header,
  subheader = null,
  icon,
  isActive = false,
  isDeprecated = false,
  id,
  tooltipText,
}: ConnectWalletOptionProps) {
  const content = (
    <OptionCardClickable
      id={id}
      onClick={clickable ? onClick : null}
      clickable={clickable && !isActive}
      active={isActive}
      data-testid="wallet-modal-option"
      isDeprecated={isDeprecated}
    >
      <OptionCardLeft>
        <IconWrapper size={size}>
          <img src={icon} alt={'Icon'} />
        </IconWrapper>
        <HeaderText color={color}>
          {isActive ? (
            <CircleWrapper>
              <GreenCircle>
                <div />
              </GreenCircle>
            </CircleWrapper>
          ) : (
            ''
          )}
          {header}
        </HeaderText>
        {subheader && <SubHeader>{subheader}</SubHeader>}
      </OptionCardLeft>
    </OptionCardClickable>
  )

  if (link) {
    const externalLink = <ExternalLink href={link}>{content}</ExternalLink>
    return tooltipText ? (
      <HoverTooltip wrapInContainer content={tooltipText}>
        {externalLink}
      </HoverTooltip>
    ) : (
      externalLink
    )
  }

  if (tooltipText) {
    return (
      <HoverTooltip wrapInContainer content={tooltipText}>
        {content}
      </HoverTooltip>
    )
  }

  return content
}
