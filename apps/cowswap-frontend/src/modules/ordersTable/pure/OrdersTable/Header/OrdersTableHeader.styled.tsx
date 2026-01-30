import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const TableHeaderWrapper = styled.div<{
  isHistoryTab: boolean
  isRowSelectable: boolean
  isTwapTable?: boolean
}>`
  --header-height: 26px;
  --row-height: 41px;
  --checkboxSize: 16px;
  --checkBoxBorderRadius: 3px;
  display: grid;
  gap: 14px;
  grid-template-columns: ${({ isHistoryTab, isRowSelectable, isTwapTable }) => {
    const checkboxColumn = isRowSelectable ? 'var(--checkboxSize)' : ''

    // TWAP table layout - applies to both history and non-history tabs
    if (isTwapTable) {
      if (isHistoryTab) {
        return `minmax(200px, 2.5fr)
                repeat(4, minmax(110px, 1fr))
                minmax(106px, 112px)
                minmax(120px, 1fr)
                minmax(106px, 0.8fr)
                24px`
      }
      return `${checkboxColumn} minmax(160px, 2fr) minmax(120px, 1fr) minmax(140px, 1fr) minmax(120px, 1fr) minmax(120px, 1fr) minmax(106px,112px) minmax(120px, 1fr) minmax(106px, 0.8fr) 24px`
    }

    // Default layout for history tab
    if (isHistoryTab) {
      return `minmax(200px, 2.5fr)
              repeat(4, minmax(110px, 1fr))
              minmax(106px, 112px)
              minmax(106px, 0.8fr)
              24px`
    }

    // Default/Limit orders layout
    return `${checkboxColumn} minmax(160px, 2fr) minmax(120px, 1fr) minmax(140px, 1fr) minmax(120px, 1fr) minmax(120px, 1fr) minmax(106px, 112px) minmax(106px, 0.8fr) 24px`
  }};
  grid-template-rows: minmax(var(--header-height), 1fr);
  align-items: center;
  border: none;
  padding: 5px 12px;
  background: var(${UI.COLOR_PAPER_DARKER});
  border-top: none;
  border-right: none;
  border-left: none;
  border-image: initial;
  border-bottom: 1px solid var(--cow-color-text-opacity-10);
  width: fit-content;
  min-width: 100%;

  ${Media.upToSmall()} {
    --checkboxSize: 24px;
  }
`

export const HeaderElement = styled.div<{ doubleRow?: boolean }>`
  height: 100%;
  padding: 0;
  font-size: 12px;
  line-height: 1.1;
  font-weight: 500;
  display: flex;
  align-items: ${({ doubleRow }) => (doubleRow ? 'flex-start' : 'center')};

  > span {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
  }

  ${({ doubleRow }) =>
    doubleRow &&
    `
    flex-flow: column wrap;
    justify-content: center;
    gap: 2px;

    > i {
      opacity: 0.7;
    }
  `}
`
