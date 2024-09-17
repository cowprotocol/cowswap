import { useState } from 'react'

import ICON_CHECKMARK from '@cowprotocol/assets/cow-swap/checkmark.svg'
import ICON_ARROW_DOWN from '@cowprotocol/assets/images/carret-down.svg'
import { UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import { AirdropOption } from './types'

interface DropdownParams {
  airdropOptions: AirdropOption[]
  setSelectedAirdrop: (airdrop: AirdropOption) => void
}

export const ClaimableAmountContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  background-color: var(${UI.COLOR_BACKGROUND});

  padding: 0.75rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.75rem;

  span {
    font-weight: 600;
  }
`

export const ContentWrapper = styled.div`
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  flex-flow: column wrap;

  display: flex;
  justify-content: center;
  align-items: center;

  text-align: center;
`

export const Dropdown = styled.div`
  position: relative;
  display: inline-block;
`

export const DropdownContent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 12rem;
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

export const Input = styled.input`
  border: 1px solid var(${UI.COLOR_BORDER});
  background: var(${UI.COLOR_PAPER_DARKER});
  color: inherit;
  width: 100%;
  margin: 10px 0;
  margin-top: 0;
  padding: 10px;
  border-radius: 12px;
  outline: none;
  font-size: 15px;
  font-weight: bold;

  &:focus {
    border: 1px solid var(${UI.COLOR_PRIMARY});
  }
`

export const LabelContainer = styled.div`
  width: fit-content;
  margin: 10px 0;
  label {
    font-weight: 600;
    font-size: 10pt;
  }
`

export const Link = styled.button`
  border: none;
  padding: 0;
  text-decoration: underline;
  display: text;
  cursor: pointer;
  background: none;
  color: white;
  margin: 10px 0;
`

export const Row = styled.div`
  display: flex;
  flex-flow: column;
  width: 100%;

  label {
    margin: 10px;
    flex-grow: 0;
    width: 5em;
  }

  input,
  textarea {
    flex-grow: 1;
  }

  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`

export const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;

  padding-bottom: 1rem;

  flex-grow: 1;
`
