import { useState } from 'react'

import { darken, transparentize } from 'polished'
import styled, { keyframes } from 'styled-components/macro'
import { WithClassName } from 'types'

const turnOnToggle = keyframes`
  from {
    margin-left: 0em;
    margin-right: 2.2em;
  }
  to {
    margin-left: 2.2em;
    margin-right: 0em;
  }
`

const turnOffToggle = keyframes`
  from {
    margin-left: 2.2em;
    margin-right: 0em;
  }
  to {
    margin-left: 0em;
    margin-right: 2.2em;
  }
`

const ToggleElementHoverStyle = (hasBgColor: boolean, theme: any, isActive?: boolean) =>
  hasBgColor
    ? {
        opacity: '0.8',
      }
    : {
        background: isActive ? darken(0.05, theme.primary1) : darken(0.05, theme.bg4),
        color: isActive ? theme.white : theme.text3,
      }

export const ToggleElement = styled.span<{ isActive?: boolean; bgColor?: string; isInitialToggleLoad?: boolean }>`
  animation: 0.1s
    ${({ isActive, isInitialToggleLoad }) => (isInitialToggleLoad ? 'none' : isActive ? turnOnToggle : turnOffToggle)}
    ease-in;
  background: ${({ theme, bgColor, isActive }) =>
    isActive ? bgColor ?? theme.primary1 : bgColor ? theme.bg4 : theme.text3};
  border-radius: 50%;
  height: 24px;
  :hover {
    ${({ bgColor, theme, isActive }) => ToggleElementHoverStyle(!!bgColor, theme, isActive)}
  }
  margin-left: ${({ isActive }) => (isActive ? '2.2em' : '0em')};
  margin-right: ${({ isActive }) => (!isActive ? '2.2em' : '0em')};
  width: 24px;
`

const Wrapper = styled.button<{ isActive?: boolean; activeElement?: boolean }>`
  align-items: center;
  background: ${({ theme }) => theme.bg1};
  background: ${({ theme, isActive }) => (isActive ? theme.bg2 : theme.grey1)};
  border: none;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  outline: none;
  padding: 0.4rem 0.4rem;
  width: fit-content;

  ${ToggleElement} {
    color: ${({ theme, isActive }) => (isActive ? theme.white : transparentize(0.4, theme.text1))};
    border: none;
    transition: background 0.2s ease-in-out;
    background: ${({ theme, isActive }) => (isActive ? theme.white : transparentize(0.4, theme.text1))};

    &:hover {
      color: ${({ theme, isActive }) => (isActive ? theme.white : theme.text1)};
      background: ${({ theme, isActive }) => (isActive ? theme.white : theme.text1)};
    }
  }

  &.disabled {
    cursor: default;

    ${ToggleElement} {
      opacity: 0.5;

      &:hover {
        border: 2px solid transparent;
      }
    }
  }
`

export interface ToggleProps extends WithClassName {
  id?: string
  bgColor?: string
  isActive: boolean
  toggle: () => void
  isDisabled?: boolean // Mod
}

export default function Toggle({ id, bgColor, isActive, toggle, className, isDisabled }: ToggleProps) {
  const [isInitialToggleLoad, setIsInitialToggleLoad] = useState(true)

  const switchToggle = () => {
    toggle()
    if (!isDisabled && isInitialToggleLoad) setIsInitialToggleLoad(false)
  }

  return (
    <Wrapper id={id} isActive={isActive} onClick={switchToggle} className={className}>
      <ToggleElement isActive={isActive} bgColor={bgColor} isInitialToggleLoad={isInitialToggleLoad} />
    </Wrapper>
  )
}
