import { useCallback, useState } from 'react'

import { UI } from '@cowprotocol/ui'
import { HelpTooltip } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { ORDERS_TABLE_SETTINGS } from 'modules/trade/const/common'
import { SettingsBox, SettingsContainer, SettingsTitle } from 'modules/trade/pure/Settings'

import { LimitOrdersSettingsState } from '../../state/limitOrdersSettingsAtom'

const DropdownButton = styled.button`
  background: var(${UI.COLOR_PAPER_DARKER});
  color: inherit;
  border: 1px solid var(${UI.COLOR_BORDER});
  border-radius: 12px;
  padding: 10px 34px 10px 12px;
  min-width: 140px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  transition: all 0.2s ease-in-out;

  &::after {
    content: '▼';
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 10px;
    transition: transform 0.2s ease-in-out;
    color: var(${UI.COLOR_PRIMARY_OPACITY_50});
  }

  &:hover {
    border-color: var(${UI.COLOR_PRIMARY_OPACITY_25});
    background: var(${UI.COLOR_PRIMARY_OPACITY_10});
  }

  &:focus {
    outline: none;
  }
`

const DropdownList = styled.div<{ isOpen: boolean }>`
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(${UI.COLOR_PAPER});
  border: 1px solid var(${UI.COLOR_BORDER});
  border-radius: 12px;
  padding: 6px;
  min-width: 140px;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`

const DropdownItem = styled.div`
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.15s ease-in-out;
  color: inherit;

  &:hover {
    background: var(${UI.COLOR_PRIMARY_OPACITY_10});
    transform: translateX(2px);
  }

  &:active {
    transform: translateX(2px) scale(0.98);
  }
`

const DropdownContainer = styled.div`
  position: relative;
  user-select: none;
`

const SettingsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  font-weight: 400;
  color: inherit;
  font-size: 14px;
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
  const {
    showRecipient,
    partialFillsEnabled,
    limitPricePosition,
    limitPriceLocked,
    ordersTableOnLeft,
    isUsdValuesMode,
  } = state
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
      <SettingsTitle>Limit Order Settings</SettingsTitle>

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

      <SettingsBox
        title="Lock Limit Price"
        tooltip="When enabled, the limit price stays fixed when changing the BUY amount. When disabled, the limit price will update based on the BUY amount changes."
        value={limitPriceLocked}
        toggle={() => onStateChanged({ limitPriceLocked: !limitPriceLocked })}
      />

      <SettingsBox
        title="Global USD Mode"
        tooltip="When enabled, all prices will be displayed in USD by default."
        value={isUsdValuesMode}
        toggle={() => onStateChanged({ isUsdValuesMode: !isUsdValuesMode })}
      />

      <SettingsBox
        title={ORDERS_TABLE_SETTINGS.LEFT_ALIGNED.title}
        tooltip={ORDERS_TABLE_SETTINGS.LEFT_ALIGNED.tooltip}
        value={ordersTableOnLeft}
        toggle={() => onStateChanged({ ordersTableOnLeft: !ordersTableOnLeft })}
      />

      <SettingsRow>
        <SettingsLabel>
          Limit price position <HelpTooltip text="Choose where to display the limit price input." />
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
