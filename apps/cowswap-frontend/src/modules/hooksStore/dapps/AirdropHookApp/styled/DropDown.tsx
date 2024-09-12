import { useState } from 'react'

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
  width: 100%;
`

export const DropdownContent = styled.div`
  display: block;
  background-color: var(${UI.COLOR_PAPER});
  min-width: 80%;
  box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
  padding: 12px 16px;
  bottom: 100%;
  right: 0;
  height: min-content;
  z-index: 999;
  width: 100%;
  border-radius: 16px;
  margin: auto auto 12px;

  ${Media.upToLarge()} {
    left: 0;
    right: initial;
  }

  ${Media.upToMedium()} {
    width: 100%;
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
  background-color: var(${UI.COLOR_PAPER_DARKER});
  padding: 12px;
  width: 100%;

  &:hover {
    background-color: var(${UI.COLOR_PRIMARY_LIGHTER});
    color: #000000;
    /* > svg {
      transform: rotate(-90deg);
    } */
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
  border-radius: 16px;
  background-color: #18193b;
  padding: 1rem;
  width: 100%;

  &:hover {
    background-color: #65d9ff;
    color: #000000;
  }
`
const dropdownInitialText = 'Select your airdrop'

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
            return <SelectButton onClick={() => handleSelectAirdrop(airdrop)}>{airdrop.name}</SelectButton>
          })}
        </DropdownContent>
      )}
    </Dropdown>
  )
}
