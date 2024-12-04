import { useCallback, useState } from 'react'

import { InfoTooltip } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { SettingsBox, SettingsContainer, SettingsTitle } from 'modules/trade/pure/Settings'

import { LimitOrdersSettingsState } from '../../state/limitOrdersSettingsAtom'

const DropdownButton = styled.button`
  background: var(--color-background-2);
  color: inherit;
  border: 1px solid var(--color-text);
  border-radius: 6px;
  padding: 8px 12px;
  min-width: 140px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;

  &:focus {
    outline: none;
    border-color: var(--color-text-hover);
  }
`

const DropdownList = styled.div<{ isOpen: boolean }>`
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: var(--color-background-2);
  border: 1px solid var(--color-text);
  border-radius: 6px;
  padding: 4px;
  min-width: 140px;
  z-index: 100;
`

const DropdownItem = styled.div`
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: var(--color-background-3);
  }
`

const DropdownContainer = styled.div`
  position: relative;
`

const SettingsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  gap: 15px;
`

const SettingsLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`

export interface SettingsProps {
  state: LimitOrdersSettingsState
  onStateChanged: (state: Partial<LimitOrdersSettingsState>) => void
}

const POSITION_LABELS = {
  top: 'Top',
  between: 'Between currencies',
  bottom: 'Bottom',
}

export function Settings({ state, onStateChanged }: SettingsProps) {
  const { showRecipient, partialFillsEnabled, limitPricePosition } = state
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = useCallback(
    (value: LimitOrdersSettingsState['limitPricePosition']) => (e: React.MouseEvent) => {
      e.stopPropagation()
      onStateChanged({ limitPricePosition: value })
      setIsOpen(false)
    },
    [onStateChanged],
  )

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  return (
    <SettingsContainer>
      <SettingsTitle>Interface Settings</SettingsTitle>

      <SettingsBox
        title="Custom Recipient"
        tooltip="Allows you to choose a destination address for the swap other than the connected one."
        value={showRecipient}
        toggle={() => onStateChanged({ showRecipient: !showRecipient })}
      />

      <SettingsBox
        title="Enable Partial Executions"
        tooltip={
          <>
            Allow you to chose whether your limit orders will be <i>Partially fillable</i> or <i>Fill or kill</i>.
            <br />
            <br />
            <i>Fill or kill</i> orders will either be filled fully or not at all.
            <br />
            <i>Partially fillable</i> orders may be filled partially if there isn't enough liquidity to fill the full
            amount.
          </>
        }
        value={partialFillsEnabled}
        toggle={() => onStateChanged({ partialFillsEnabled: !partialFillsEnabled })}
      />

      <SettingsTitle>Layout Settings</SettingsTitle>

      <SettingsRow>
        <SettingsLabel>
          Limit Price Position
          <InfoTooltip content="Choose where to display the limit price input field in the interface." />
        </SettingsLabel>
        <DropdownContainer>
          <DropdownButton onClick={toggleDropdown}>{POSITION_LABELS[limitPricePosition]}</DropdownButton>
          <DropdownList isOpen={isOpen}>
            {Object.entries(POSITION_LABELS).map(([value, label]) => (
              <DropdownItem key={value} onClick={handleSelect(value as LimitOrdersSettingsState['limitPricePosition'])}>
                {label}
              </DropdownItem>
            ))}
          </DropdownList>
        </DropdownContainer>
      </SettingsRow>
    </SettingsContainer>
  )
}
