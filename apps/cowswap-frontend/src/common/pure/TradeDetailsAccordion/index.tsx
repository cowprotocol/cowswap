import { useState } from 'react'

import CarretIcon from '@cowprotocol/assets/cow-swap/carret-down.svg'
import { UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

const Wrapper = styled.div<{ isOpen: boolean }>`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  width: 100%;
  border: 1px solid var(${UI.COLOR_PAPER_DARKER});
  border-radius: 16px;
  padding: 10px;
  height: auto;
  font-size: 13px;
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
`

const Details = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  width: 100%;
  margin: 6px 0 0;
`

const Summary = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 8px;
  font-size: inherit;
  font-weight: inherit;

  span {
    font-size: inherit;
    font-weight: inherit;
    white-space: nowrap;
  }
`

const SummaryClickable = styled.div<{ isOpen: boolean }>`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 7px;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0.7)};
  transition: opacity ${UI.ANIMATION_DURATION_SLOW} ease-in-out;
  outline: none;
  font-size: inherit;
  font-weight: inherit;

  &:hover {
    opacity: 1;
  }

  // If it's the only child, make it take all the space
  &:only-child {
    grid-column: 1 / -1;
  }
`

const ToggleIcon = styled.div<{ isOpen: boolean }>`
  --size: var(${UI.ICON_SIZE_SMALL});
  transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform var(${UI.ANIMATION_DURATION_SLOW}) ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--size);
  height: var(--size);

  > svg {
    --size: var(${UI.ICON_SIZE_TINY});
    width: var(--size);
    height: var(--size);
    object-fit: contain;

    path {
      fill: var(${UI.COLOR_TEXT});
    }
  }
`

interface TradeDetailsAccordionProps {
  rateInfo: React.ReactNode
  feeSummary?: React.ReactNode // TODO: pass actual CurrencyAmount<Currency> here
  children?: React.ReactNode
  open?: boolean
}

export const TradeDetailsAccordion = ({ rateInfo, feeSummary, children, open = false }: TradeDetailsAccordionProps) => {
  const [isOpen, setIsOpen] = useState(open)

  const toggleAccordion = () => {
    setIsOpen(!isOpen)
  }

  // Accessibility enhancement: manage focus and aria-expanded attribute
  const handleKeyDown = (e: { key: string; preventDefault: () => void }) => {
    if (['Enter', ' ', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault()
      toggleAccordion()
    }
  }

  return (
    <Wrapper isOpen={isOpen}>
      <Summary>
        {rateInfo}
        <SummaryClickable
          onClick={toggleAccordion}
          onKeyDown={handleKeyDown}
          aria-expanded={isOpen}
          tabIndex={0}
          isOpen={isOpen}
        >
          {!isOpen && feeSummary}
          <ToggleIcon isOpen={isOpen}>
            <SVG src={CarretIcon} title={isOpen ? 'Close' : 'Open'} />
          </ToggleIcon>
        </SummaryClickable>
      </Summary>
      {isOpen && <Details>{children}</Details>}
    </Wrapper>
  )
}
