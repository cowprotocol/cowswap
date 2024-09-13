import { useState } from 'react'

// import iconSuccess from '@cowprotocol/assets/cow-swap/checkmark.svg'
import ICON_ARROW_DOWN from '@cowprotocol/assets/images/carret-down.svg'
import { Media, UI } from '@cowprotocol/ui'

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
  background-color: var(${UI.COLOR_PAPER});
  cursor: pointer;
  padding: 12px;

  display: flex;
  flex-flow: column wrap;
  z-index: 999;

  ${Media.upToLarge()} {
    left: 0;
    right: initial;
  }

  ${Media.upToMedium()} {
    position: fixed;
    bottom: 56px;
    margin: 0;
    padding: 18px 24px;
    box-shadow: 0 -100vh 0 100vh rgb(0 0 0 / 40%);
    border-bottom: 1px solid var(${UI.COLOR_BORDER});
    border-radius: 16px 16px 0 0;
  }
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

    img {
      opacity: 0;
    }
  }

  &:hover {
    font-weight: bold;

    div {
      img {
        opacity: 1;
        fill: white;
        stroke: white;
        color: white;
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
                  {/* <img src={iconSuccess} width={12} /> */}
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
