import { ButtonPrimary, Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { Card } from 'pages/Account/styled'

export const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

export const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`

export const LabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 0 0 5px;
`

export const Label = styled.label`
  font-size: 14px;
  color: var(${UI.COLOR_TEXT});
`

export const LabelActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`

export const MiniAction = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px 7px;
  border-radius: 99px;
  border: 1px solid var(${UI.COLOR_BORDER});
  background: var(${UI.COLOR_PAPER});
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  text-transform: lowercase;
  transition: all 0.2s ease-in-out;

  &:hover:not(:disabled) {
    background: var(${UI.COLOR_PAPER_DARKER});
    color: var(${UI.COLOR_TEXT});
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`

export const HelperText = styled.span`
  font-size: 13px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  line-height: 1.5;
  text-align: center;
  width: 100%;
  padding: 0 5px 10px;
`

export const PrimaryAction = styled(ButtonPrimary)`
  width: 100%;
`

export const InlineNote = styled.p`
  margin: 0;
  font-size: 12px;
  color: var(${UI.COLOR_TEXT_OPACITY_60});
  width: 100%;
  text-align: center;
`

export const CardStack = styled(Card)`
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  padding: 24px 20px 20px;
  min-width: 0;
`

export const ThreeColumnGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 2.5fr) minmax(0, 1.5fr);
  gap: 16px;

  ${Media.upToLarge()} {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  ${Media.upToMedium()} {
    grid-template-columns: minmax(0, 1fr);
  }
`

export const ColumnOneCard = styled(CardStack)`
  grid-column: 1 / 2;
  grid-row: 1;
  align-items: center;
  padding: 24px 10px 10px;

  ${Media.upToLarge()} {
    grid-column: 1 / 2;
    grid-row: auto;
  }

  ${Media.upToMedium()} {
    grid-column: 1 / -1;
  }
`

export const ColumnTwoCard = styled(CardStack)`
  grid-column: 2 / 3;
  grid-row: 1;

  ${Media.upToLarge()} {
    grid-column: 2 / 3;
    grid-row: auto;
    min-height: unset;
  }

  ${Media.upToMedium()} {
    grid-column: 1 / -1;
  }
`

export const ColumnThreeCard = styled(CardStack)`
  grid-column: 3 / 4;
  grid-row: 1;
  align-items: center;

  ${Media.upToLarge()} {
    grid-column: 1 / -1;
    grid-row: auto;
    min-height: unset;
  }
`

export const CardTitle = styled.h4`
  margin: 0;
  font-size: 18px;
  color: var(${UI.COLOR_TEXT});
  font-weight: 600;
`
