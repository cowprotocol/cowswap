import React from 'react'

import { darken, lighten } from 'polished'
import styled from 'styled-components/macro'

import { MouseoverTooltip } from 'legacy/components/Tooltip'
import { ExternalLink } from 'legacy/theme'

import { UI } from 'common/constants/theme'

const InfoCard = styled.button<{ isActive?: boolean }>`
  background-color: ${({ theme, isActive }) => (isActive ? theme.bg3 : theme.bg2)};
  padding: 1rem;
  outline: none;
  border: 1px solid;
  border-radius: 12px;
  width: 100% !important;
  border-color: ${({ theme, isActive }) => (isActive ? 'transparent' : theme.bg3)};
`

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

export const OptionCardClickable = styled(OptionCard as any)<{ clickable?: boolean; isDeprecated?: boolean }>`
  margin-top: 0;
  opacity: ${({ isDeprecated }) => (isDeprecated ? '0.5' : '1')};
  background-color: ${({ theme, active }) => (active ? theme.bg2 : theme.grey1)};
  color: ${({ theme, active }) => (active ? theme.white : theme.text1)};

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease-in;
  height: 120px;
  border: 1px solid transparent;

  &:hover {
    cursor: ${({ clickable }) => (clickable ? 'pointer' : '')};
    background-color: ${({ theme, clickable }) => {
      if (!clickable) return
      else if (!theme.darkMode) return darken(0.05, theme.bg3)
      else return lighten(0.2, theme.bg3)
    }};
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
  font-size: 0.7rem;
  font-weight: 400;
  white-space: nowrap;
`

const SubHeader = styled.div`
  color: var(${UI.COLOR_TEXT1});
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
    height: ${({ size }) => (size ? size + 'px' : '24px')};
    width: ${({ size }) => (size ? size + 'px' : '24px')};
  }
`

export interface ConnectWalletOptionProps {
  link?: string | null
  clickable?: boolean
  size?: number | null
  onClick?: null | (() => void)
  color: string
  header: React.ReactNode
  subheader?: React.ReactNode
  icon: string
  isActive?: boolean
  id: string
  tooltipText?: string | null
  isDeprecated?: boolean
}

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
    return tooltipText ? <MouseoverTooltip text={tooltipText}>{externalLink}</MouseoverTooltip> : externalLink
  }

  if (tooltipText) {
    return <MouseoverTooltip text={tooltipText}>{content}</MouseoverTooltip>
  }

  return content
}
