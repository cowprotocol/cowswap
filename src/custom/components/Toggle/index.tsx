import { useState } from 'react'
import styled from 'styled-components/macro'
import { WithClassName } from 'types'
import { ToggleElement } from '@src/components/Toggle' // Mod

const Wrapper = styled.button<{ isActive?: boolean; activeElement?: boolean }>`
  align-items: center;
  background: ${({ theme }) => theme.bg1};
  border: none;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  outline: none;
  padding: 0.4rem 0.4rem;
  width: fit-content;
`

// Mod
const WrappedToggle = styled(Wrapper)`
  background: ${({ theme }) => (theme.darkMode ? theme.bg3 : theme.bg2)};

  ${ToggleElement} {
    color: ${({ theme }) => theme.text1};
    border: 2px solid transparent;
    transition: border 0.2s ease-in-out;
    background: ${({ theme }) => theme.primary1};

    &:hover {
      color: ${({ theme }) => theme.text1};
      border: 2px solid ${({ theme }) => theme.text1};
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
    <WrappedToggle id={id} isActive={isActive} onClick={switchToggle} className={className}>
      <ToggleElement isActive={isActive} bgColor={bgColor} isInitialToggleLoad={isInitialToggleLoad} />
    </WrappedToggle>
  )
}
