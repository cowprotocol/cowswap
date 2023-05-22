import styled from 'styled-components/macro'
import { AutoRow } from 'legacy/components/Row'

export const Wrapper = styled.div`
  background: ${({ theme }) => theme.bg1};
  width: 100%;
  margin: 0 0 14px;
  overflow-y: auto;
  ${({ theme }) => theme.colorScrollbar};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    overflow-y: auto;
    overflow-x: auto;
    padding: 0;
    max-height: 100vh;
    margin: 0;
  `}
`

export const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px 16px;
  background: ${({ theme }) => theme.bg1};
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  padding: 16px;
  z-index: 20;
`

export const Title = styled.h3`
  font-size: 16px;
  margin: 0;
`

export const Body = styled(AutoRow)`
  box-sizing: border-box;
  max-height: 80vh;
  padding: 0 10px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    max-height: 100%;
  `}
`

export const FieldsWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  gap: 2px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0 0 54px;
  `}
`

export const Field = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: ${({ theme }) => theme.grey1};
  width: 100%;
  font-size: 13px;

  &:first-child {
    border-radius: 16px 16px 0 0;
  }

  &:last-child {
    border-radius: 0 0 16px 16px;
  }
`

export const CurrencyField = styled.div`
  display: flex;
  flex-flow: row wrap;
  flex-direction: column;
  align-items: flex-start;
  padding: 16px;
  background: ${({ theme }) => theme.grey1};
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
      ${({ theme }) => theme.mediaWidth.upToSmall`
        width: auto;
    `}
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

export const Progress = styled.div<{ active: number | string }>`
  --height: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
  height: var(--height);
  width: 150px;

  &::before {
    display: inline-block;
    content: '';
    height: 100%;
    width: 100%;
    border-radius: var(--height);
    background: ${({ theme, active }) =>
      `linear-gradient(90deg, ${theme.success} ${active}%, ${theme.bg3} ${active}%)`};
  }

  &::after {
    display: inline-block;
    content: '${({ active }) => `${active}%`}';
    color: ${({ theme }) => theme.success};
  }
`

export const InlineWrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
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
