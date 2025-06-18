import alertCircle from '@cowprotocol/assets/cow-swap/alert-circle.svg'
import orderPresignaturePending from '@cowprotocol/assets/cow-swap/order-presignature-pending.svg'
import { Media, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import SVG from 'react-inlinesvg'
import { Link } from 'react-router'
import styled from 'styled-components/macro'

import { useNavigate } from 'common/hooks/useNavigate'

import { OrderTab } from '../../const/tabs'
import { useGetBuildOrdersTableUrl } from '../../hooks/useGetBuildOrdersTableUrl'

const Tabs = styled.div`
  display: flex;
  flex-flow: row wrap;
  gap: 4px;
  margin: 0;

  ${Media.upToMedium()} {
    display: none;
  }
`

const SelectContainer = styled.div`
  display: none;
  width: 100%;
  margin: 0;
  position: relative;

  ${Media.upToMedium()} {
    display: block;
  }

  &::after {
    content: '';
    position: absolute;
    right: 16px;
    top: 50%;
    width: 8px;
    height: 8px;
    border-right: 2px solid var(${UI.COLOR_TEXT_OPACITY_50});
    border-bottom: 2px solid var(${UI.COLOR_TEXT_OPACITY_50});
    transform: translateY(-70%) rotate(45deg);
    pointer-events: none;
    transition: border-color var(${UI.ANIMATION_DURATION}) ease-in-out;
  }

  &:hover::after {
    border-color: var(${UI.COLOR_TEXT});
  }
`

const Select = styled.select`
  width: 100%;
  padding: 10px 40px 10px 10px;
  border-radius: 14px;
  border: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  background: var(${UI.COLOR_PAPER});
  color: inherit;
  font-size: 13px;
  font-weight: 400;
  cursor: pointer;
  outline: none;
  appearance: none;
  text-align: left;
  transition: border-color var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover,
  &:focus {
    border-color: var(${UI.COLOR_TEXT_OPACITY_50});
  }

  option {
    padding: 10px;
    background: var(${UI.COLOR_PAPER});
    color: inherit;
  }
`

const TabButton = styled(Link)<{
  active: string
  $isUnfillable?: boolean
  $isSigning?: boolean
  $isDisabled?: boolean
}>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: ${({ active, $isUnfillable, $isSigning, $isDisabled }) =>
    $isDisabled
      ? 'transparent'
      : active === 'true'
        ? $isUnfillable
          ? `var(${UI.COLOR_DANGER_BG})`
          : $isSigning
            ? `var(${UI.COLOR_ALERT_BG})`
            : `var(${UI.COLOR_TEXT_OPACITY_10})`
        : 'transparent'};
  color: ${({ active, $isUnfillable, $isSigning, $isDisabled }) =>
    $isDisabled
      ? `var(${UI.COLOR_TEXT_OPACITY_50})`
      : $isUnfillable
        ? `var(${UI.COLOR_DANGER})`
        : $isSigning
          ? `var(${UI.COLOR_ALERT_TEXT})`
          : active === 'true'
            ? `var(${UI.COLOR_TEXT_PAPER})`
            : 'inherit'};
  font-weight: ${({ active }) => (active === 'true' ? '600' : '400')};
  border-radius: 14px;
  text-decoration: none;
  font-size: 13px;
  padding: 10px;
  border: 0;
  outline: none;
  cursor: ${({ $isDisabled }) => ($isDisabled ? 'default' : 'pointer')};
  transition:
    background var(${UI.ANIMATION_DURATION}) ease-in-out,
    color var(${UI.ANIMATION_DURATION}) ease-in-out;
  pointer-events: ${({ $isDisabled }) => ($isDisabled ? 'none' : 'auto')};

  ${Media.upToMedium()} {
    text-align: center;
  }

  &:hover {
    background: ${({ $isDisabled, $isUnfillable }) =>
      $isDisabled ? 'transparent' : $isUnfillable ? `var(${UI.COLOR_DANGER_BG})` : `var(${UI.COLOR_TEXT_OPACITY_10})`};
    color: ${({ $isDisabled, $isUnfillable }) =>
      $isDisabled ? `var(${UI.COLOR_TEXT_OPACITY_50})` : $isUnfillable ? `var(${UI.COLOR_DANGER})` : 'inherit'};
  }

  > svg {
    width: 14px;
    height: 14px;
    fill: currentColor;
  }

  > svg > path {
    fill: currentColor;
  }
`

export interface OrdersTabsProps {
  tabs: OrderTab[]
  isWalletConnected: boolean
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function OrdersTabs({ tabs, isWalletConnected = true }: OrdersTabsProps) {
  const buildOrdersTableUrl = useGetBuildOrdersTableUrl()
  const navigate = useNavigate()
  const activeTabIndex = Math.max(
    tabs.findIndex((i) => i.isActive),
    0,
  )

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const tabId = event.target.value
    navigate(buildOrdersTableUrl({ tabId, pageNumber: 1 }))
  }

  return (
    <>
      <SelectContainer>
        <Select value={tabs[activeTabIndex].id} onChange={handleSelectChange}>
          {tabs.map((tab, index) => {
            const isUnfillable = tab.id === 'unfillable'
            const isSigning = tab.id === 'signing'
            return (
              <option key={index} value={tab.id}>
                {isUnfillable && '⚠️ '}
                {isSigning && '⏳ '}
                {tab.title} {isWalletConnected && `(${tab.count})`}
              </option>
            )
          })}
        </Select>
      </SelectContainer>

      <Tabs>
        {tabs.map((tab, index) => {
          const isUnfillable = tab.id === 'unfillable'
          const isSigning = tab.id === 'signing'
          return (
            <TabButton
              key={index}
              active={(index === activeTabIndex).toString()}
              $isUnfillable={isUnfillable}
              $isSigning={isSigning}
              $isDisabled={!isWalletConnected}
              to={buildOrdersTableUrl({ tabId: tab.id, pageNumber: 1 })}
            >
              {isUnfillable && <SVG src={alertCircle} description="warning" />}
              {isSigning && <SVG src={orderPresignaturePending} description="signing" />}
              <Trans>{tab.title}</Trans> {isWalletConnected && <span>({tab.count})</span>}
            </TabButton>
          )
        })}
      </Tabs>
    </>
  )
}
