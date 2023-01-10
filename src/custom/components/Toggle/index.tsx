import { useState } from 'react'
import styled from 'styled-components/macro'
import { WithClassName } from 'types'
import { ToggleElement } from '@src/components/Toggle' // Mod
import { transparentize } from 'polished'

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
