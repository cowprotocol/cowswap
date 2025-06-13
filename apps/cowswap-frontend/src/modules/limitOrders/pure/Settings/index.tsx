import { useCallback, useState } from 'react'

import { UI } from '@cowprotocol/ui'
import { HelpTooltip } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { ORDERS_TABLE_SETTINGS } from 'modules/trade/const/common'
import { SettingsBox, SettingsContainer, SettingsTitle } from 'modules/trade/pure/Settings'

import { useLimitOrderSettingsAnalytics } from '../../hooks/useLimitOrderSettingsAnalytics'
import { LimitOrdersSettingsState } from '../../state/limitOrdersSettingsAtom'

const DropdownButton = styled.button`
  background: var(${UI.COLOR_PAPER_DARKER});
  color: inherit;
  border: 1px solid var(${UI.COLOR_BORDER});
  border-radius: 12px;
  padding: 10px 34px 10px 12px;
  width: 180px;
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
  width: 180px;
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
  onStateChanged: (state: LimitOrdersSettingsState) => void
}

const POSITION_LABELS = {
  top: 'Top',
  between: 'Between currencies',
  bottom: 'Bottom',
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function Settings({ state, onStateChanged }: SettingsProps) {
  const analytics = useLimitOrderSettingsAnalytics()
  const [isOpen, setIsOpen] = useState(false)
  const {
    showRecipient,
    partialFillsEnabled,
    limitPricePosition,
    limitPriceLocked,
    ordersTableOnLeft,
    // TODO: Temporarily disabled - Global USD Mode feature
    // isUsdValuesMode,
  } = state

  const handleRecipientToggle = useCallback(() => {
    const newValue = !showRecipient
    analytics.toggleCustomRecipient(newValue)
    onStateChanged({ ...state, showRecipient: newValue })
  }, [analytics, onStateChanged, state, showRecipient])

  const handlePartialFillsToggle = useCallback(() => {
    const newValue = !partialFillsEnabled
    analytics.togglePartialExecutions(newValue)
    onStateChanged({ ...state, partialFillsEnabled: newValue })
  }, [analytics, onStateChanged, state, partialFillsEnabled])

  const handleSelect = useCallback(
    (value: LimitOrdersSettingsState['limitPricePosition']) => (e: React.MouseEvent) => {
      e.stopPropagation()
      analytics.changeLimitPricePosition(limitPricePosition, value)
      onStateChanged({ ...state, limitPricePosition: value })
      setIsOpen(false)
    },
    [analytics, onStateChanged, state, limitPricePosition],
  )

  const handleLimitPriceLockedToggle = useCallback(() => {
    const newValue = !limitPriceLocked
    analytics.toggleLockLimitPrice(newValue)
    onStateChanged({ ...state, limitPriceLocked: newValue })
  }, [analytics, onStateChanged, state, limitPriceLocked])

  const handleOrdersTablePositionToggle = useCallback(() => {
    const newValue = !ordersTableOnLeft
    analytics.toggleOrdersTablePosition(newValue)
    onStateChanged({ ...state, ordersTableOnLeft: newValue })
  }, [analytics, onStateChanged, state, ordersTableOnLeft])

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div onClick={handleContainerClick}>
      <SettingsContainer>
        <SettingsTitle>Limit Order Settings</SettingsTitle>

        <SettingsBox
          title="Custom Recipient"
          tooltip="Allows you to choose a destination address for the swap other than the connected one."
          value={showRecipient}
          toggle={handleRecipientToggle}
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
          toggle={handlePartialFillsToggle}
        />

        <SettingsBox
          title="Lock Limit Price"
          tooltip="When enabled, the limit price stays fixed when changing the BUY amount. When disabled, the limit price will update based on the BUY amount changes."
          value={limitPriceLocked}
          toggle={handleLimitPriceLockedToggle}
        />

        {/* TODO: Temporarily disabled - Global USD Mode feature and isUsdValuesMode
        <SettingsBox
          title="Global USD Mode"
          tooltip="When enabled, all prices will be displayed in USD by default."
          value={isUsdValuesMode}
          toggle={handleUsdValuesModeToggle}
        /> */}

        <SettingsBox
          title={ORDERS_TABLE_SETTINGS.LEFT_ALIGNED.title}
          tooltip={ORDERS_TABLE_SETTINGS.LEFT_ALIGNED.tooltip}
          value={ordersTableOnLeft}
          toggle={handleOrdersTablePositionToggle}
        />

        <SettingsRow>
          <SettingsLabel>
            Limit Price Position <HelpTooltip text="Choose where to display the limit price input." />
          </SettingsLabel>
          <DropdownContainer>
            <DropdownButton onClick={toggleDropdown}>{POSITION_LABELS[limitPricePosition]}</DropdownButton>
            <DropdownList isOpen={isOpen}>
              {Object.entries(POSITION_LABELS).map(([value, label]) => (
                <DropdownItem
                  key={value}
                  onClick={handleSelect(value as LimitOrdersSettingsState['limitPricePosition'])}
                >
                  {label}
                </DropdownItem>
              ))}
            </DropdownList>
          </DropdownContainer>
        </SettingsRow>
      </SettingsContainer>
    </div>
  )
}
