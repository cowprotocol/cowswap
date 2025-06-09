import { useState } from 'react'

import { Command } from '@cowprotocol/types'
import { UI } from '@cowprotocol/ui'

import { darken } from 'color2k'
import styled, { keyframes } from 'styled-components/macro'
import { WithClassName } from 'types'

const turnOnToggle = keyframes`
  from {
    margin-left: 0;
    margin-right: 2.2em;
  }
  to {
    margin-left: 2.2em;
    margin-right: 0;
  }
`

const turnOffToggle = keyframes`
  from {
    margin-left: 2.2em;
    margin-right: 0;
  }
  to {
    margin-left: 0;
    margin-right: 2.2em;
  }
`

// TODO: Replace any with proper type definitions
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type
const ToggleElementHoverStyle = (hasBgColor: boolean, theme: any, isActive?: boolean) =>
  hasBgColor
    ? {
        opacity: '0.8',
      }
    : {
        background: isActive ? darken(theme.bg2, 0.05) : darken(theme.paperCustom, 0.05),
        color: isActive ? theme.white : theme.info,
      }

export const ToggleElement = styled.span<{ isActive?: boolean; bgColor?: string; isInitialToggleLoad?: boolean }>`
  animation: 0.1s
    ${({ isActive, isInitialToggleLoad }) => (isInitialToggleLoad ? 'none' : isActive ? turnOnToggle : turnOffToggle)}
    ease-in;
  background: ${({ bgColor, isActive }) =>
    isActive ? (bgColor ?? `var(${UI.COLOR_PRIMARY})`) : `var(${UI.COLOR_PAPER_DARKER})`};
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
  background: ${({ isActive }) => (isActive ? `var(${UI.COLOR_PRIMARY_OPACITY_25})` : `var(${UI.COLOR_PAPER_DARKER})`)};
  border: none;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  outline: none;
  padding: 0.4rem 0.4rem;
  width: fit-content;

  ${ToggleElement} {
    color: ${({ isActive }) => (isActive ? `var(${UI.COLOR_BUTTON_TEXT})` : `var(${UI.COLOR_BUTTON_TEXT_DISABLED})`)};
    border: none;
    transition: background var(${UI.ANIMATION_DURATION}) ease-in-out;
    background: ${({ isActive }) => (isActive ? `var(${UI.COLOR_PRIMARY})` : `var(${UI.COLOR_PRIMARY_OPACITY_50})`)};

    &:hover {
      color: ${({ theme, isActive }) => (isActive ? theme.white : `var(${UI.COLOR_TEXT})`)};
      background: ${({ isActive }) => (isActive ? `var(${UI.COLOR_PRIMARY_LIGHTER})` : `var(${UI.COLOR_PRIMARY})`)};
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
  toggle: Command
  isDisabled?: boolean // Mod
  'data-click-event'?: string
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function Toggle({
  id,
  bgColor,
  isActive,
  toggle,
  className,
  isDisabled,
  'data-click-event': dataClickEvent,
}: ToggleProps) {
  const [isInitialToggleLoad, setIsInitialToggleLoad] = useState(true)

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const switchToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    toggle()
    if (!isDisabled && isInitialToggleLoad) setIsInitialToggleLoad(false)
  }

  return (
    <Wrapper id={id} isActive={isActive} onClick={switchToggle} className={className} data-click-event={dataClickEvent}>
      <ToggleElement isActive={isActive} bgColor={bgColor} isInitialToggleLoad={isInitialToggleLoad} />
    </Wrapper>
  )
}
