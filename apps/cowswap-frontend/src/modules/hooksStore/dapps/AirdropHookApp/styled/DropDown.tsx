import { useState } from 'react'

import ICON_CHECKMARK from '@cowprotocol/assets/cow-swap/checkmark.svg'
import ICON_ARROW_DOWN from '@cowprotocol/assets/images/carret-down.svg'
import { UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import { AirdropOption } from '../types'

interface DropdownParams {
  airdropOptions: AirdropOption[]
  setSelectedAirdrop: (airdrop: AirdropOption) => void
}

export const Dropdown = styled.div`
  position: relative;
  display: inline-block;
`

export const DropdownContent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 9rem;
  background-color: var(${UI.COLOR_PAPER});
  cursor: pointer;
  padding: 12px;

  display: flex;
  flex-flow: column wrap;
  z-index: 999;
`

export const DropdownButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  border-radius: 12px;
  border: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  padding: 12px;
  transition:
    background-color var(${UI.ANIMATION_DURATION}) ease-in-out,
    color var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    background-color: var(${UI.COLOR_PRIMARY_LIGHTER});
    color: var(${UI.COLOR_PAPER_DARKEST});
  }

  > svg {
    --size: 12px;
    color: inherit;
    width: var(--size);
    height: var(--size);
    transition: transform 0.2s ease-in-out;
  }
`

export const SelectButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  background-color: inherit;
  padding: 0.5rem;
  div {
    display: flex;
    gap: 0.5rem;

    svg {
      --size: 12px;
      width: var(--size);
      height: var(--size);
      transition: transform 0.2s ease-in-out;
      opacity: 0;
      stroke-width: 2.9;
      stroke: var(${UI.COLOR_TEXT});
    }
  }

  &:hover {
    font-weight: bold;

    div {
      svg {
        opacity: 1;
      }
    }
  }
`
const dropdownInitialText = '-'

export function DropDownMenu({ airdropOptions, setSelectedAirdrop }: DropdownParams) {
  const [dropDownText, setDropDownText] = useState(dropdownInitialText)
  const [showDropdown, setShowDropdown] = useState(false)

  function handleSelectAirdrop(airdrop: AirdropOption) {
    setSelectedAirdrop(airdrop)
    setDropDownText(airdrop.name)
    setShowDropdown(false)
  }

  return (
    <Dropdown>
      <DropdownButton onClick={() => setShowDropdown(!showDropdown)}>
        {dropDownText}
        <SVG src={ICON_ARROW_DOWN} />
      </DropdownButton>
      {showDropdown && (
        <DropdownContent>
          {airdropOptions.map((airdrop) => {
            return (
              <SelectButton onClick={() => handleSelectAirdrop(airdrop)}>
                <div>
                  <SVG src={ICON_CHECKMARK} />
                  {airdrop.name}
                </div>
              </SelectButton>
            )
          })}
        </DropdownContent>
      )}
    </Dropdown>
  )
}
