import { AutoRow, Media } from '@cowprotocol/ui'
import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  background: var(${UI.COLOR_PAPER});
  width: 100%;
  margin: 0 0 14px;
  overflow-y: auto;
  ${({ theme }) => theme.colorScrollbar};

  ${Media.upToSmall()} {
    overflow-y: auto;
    overflow-x: auto;
    padding: 0;
    max-height: 100vh;
    margin: 0;
  }
`

export const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px 16px;
  background: var(${UI.COLOR_PAPER});
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  padding: 16px;
  z-index: 20;

  > div {
    display: flex;
    align-items: center;
    gap: 10px;
  }
`

export const Title = styled.h3`
  font-size: 16px;
  margin: 0;
`

export const Body = styled(AutoRow)`
  box-sizing: border-box;
  max-height: 80vh;
  padding: 0 10px;

  ${Media.upToSmall()} {
    max-height: 100%;
  }
`

export const FieldsWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  gap: 2px;

  ${Media.upToSmall()} {
    padding: 0 0 54px;
  }
`

export const InfoBannerWrapper = styled.div`
  margin: 12px;
`

export const Field = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(${UI.COLOR_PAPER_DARKER});
  width: 100%;
  font-size: 13px;

  &:first-child {
    border-radius: 16px 16px 0 0;
  }

  &:last-child {
    border-radius: 0 0 16px 16px;
  }

  > div {
    display: flex;
    justify-content: center;
    gap: 4px;
  }

  > div > a {
    display: flex;
    margin: auto 0;
  }
`

export const CurrencyField = styled.div`
  display: flex;
  flex-flow: row wrap;
  flex-direction: column;
  align-items: flex-start;
  padding: 16px;
  background: var(${UI.COLOR_PAPER_DARKER});
  width: 100%;
  border-radius: 16px;
  margin: 0 0 10px;
  gap: 10px;

  > b {
    font-size: 13px;
    font-weight: 600;
  }

  > div {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    & .open-currency-select-button {
      ${Media.upToSmall()} {
        width: auto;
      }
    }
  }
`

export const CurrencyValue = styled.span`
  font-size: 26px;
  font-weight: 600;
`

export const LabelText = styled.span`
  opacity: 0.8;
`

export const Label = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;

  // TODO: Override required to remove inline styles from StyledInfoIcon parent.
  // Need to refactor and remove the inline styles.
  > div > div {
    padding: 0 !important;
  }
`

export const Value = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px 6px;
  padding: 0 0 0 12px;
  text-align: right;
  line-height: 1.4;
  font-weight: 500;
`

export const InlineWrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  width: 100%;
`

export const Surplus = styled.span`
  color: ${({ theme }) => theme.success};
`

export const RateValue = styled.div``

export const OrderTypeValue = styled.span`
  &:first-letter {
    text-transform: uppercase;
  }
`

export const LightButton = styled.button`
  font-size: 12px;
  font-weight: 600;
  border: 1px solid transparent;
  padding: 6px 14px;
  border-radius: var(${UI.BORDER_RADIUS_NORMAL});
  background-color: var(${UI.COLOR_PAPER_DARKER});
  transition:
    border var(${UI.ANIMATION_DURATION}) ease-in-out,
    background-color var(${UI.ANIMATION_DURATION}) ease-in-out;
  cursor: pointer;
  color: inherit;

  &:hover {
    border: 1px solid var(${UI.COLOR_PAPER_DARKER});
    background-color: transparent;
  }
`
