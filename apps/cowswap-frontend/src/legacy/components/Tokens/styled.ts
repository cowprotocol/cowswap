import { TokenLogo } from '@cowprotocol/tokens'
import { BaseButton, Media, UI } from '@cowprotocol/ui'

import { transparentize } from 'color2k'
import { HelpCircle } from 'react-feather'
import { Link } from 'react-router'
import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  width: 100%;
  border: none;
  padding: 0;
  background: var(${UI.COLOR_PAPER});
  border-radius: 16px;
  display: grid;
  overflow-x: auto;
`

export const LinkWrapper = styled(Link)`
  text-decoration: none;
  padding: 0.8rem 0;
  display: flex;
  align-items: center;

  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

export const ResponsiveLogo = styled(TokenLogo)`
  background: var(${UI.COLOR_PAPER});
  color: var(${UI.COLOR_TEXT}) !important; // TODO: prevent styles override

  ${Media.upToMedium()} {
    width: 21px;
    height: 21px;
    border-radius: 21px;
  }
`

export const Label = styled.div<{ end?: number }>`
  display: flex;
  font-size: inherit;
  font-weight: 400;
  justify-content: ${({ end }) => (end ? 'flex-end' : 'flex-start')};
  color: ${({ theme }) => transparentize(theme.text, 0.1)};
  align-items: center;
  font-variant-numeric: tabular-nums;
  word-break: break-all;
  overflow: hidden;
  font-size: 13px;

  > span {
    display: flex;
    align-items: center;
    max-width: inherit;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  > span > b {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
    font-weight: 500;
    display: inline-block;
  }

  > span > i {
    opacity: 0.6;
    margin: 0 0 0 4px;
    font-style: normal;
    display: inline-block;
    text-transform: uppercase;
  }
`

export const ClickableText = styled(Label)<{ disabled?: boolean }>`
  text-align: end;
  user-select: none;

  ${({ disabled }) =>
    !disabled &&
    `
    &:hover {
      cursor: pointer;
      opacity: 0.6;
    }
  `}
`

export const PageButtons = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 24px auto;
`

export const PaginationText = styled.span`
  font-size: 13px;
  white-space: nowrap;

  ${Media.upToMedium()} {
    font-size: 15px;
  }
`

export const ArrowButton = styled.button`
  background: none;
  border: none;
`

export const Arrow = styled.div<{ faded: boolean }>`
  color: var(${UI.COLOR_TEXT});
  opacity: ${(props) => (props.faded ? 0.3 : 1)};
  padding: 0 10px;
  user-select: none;

  ${Media.upToExtraSmall()} {
    padding: 5px;
  }

  ${({ faded }) =>
    !faded &&
    `
    :hover {
      cursor: pointer;
    }
  `}
`

export const Break = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.bg5};
  width: 100%;
`

export const Row = styled.div`
  width: 100%;
  display: grid;
  grid-gap: 16px;
  grid-template-columns: 50px minmax(200px, 4fr) repeat(3, minmax(120px, 1fr));
  grid-template-rows: max-content;
  padding: 16px;
  justify-content: flex-start;
  align-items: center;
  background: transparent;
  transition: background var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    background: var(${UI.COLOR_PAPER_DARKER});
  }
`

export const DelegateRow = styled(Row)`
  display: block;
  padding: 20px 20px 10px;
  width: 100%;
  margin: 0;

  > div {
    width: 100%;
    background: var(${UI.COLOR_PAPER_DARKER});
    border-radius: 16px;
  }

  &:hover {
    background: transparent;
  }
`

export const TableHeader = styled(Row)`
  border-bottom: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  z-index: 2;
  background: var(${UI.COLOR_PAPER});

  &:hover {
    background: transparent;
  }

  ${Label} {
    opacity: 0.75;
  }
`

export const TokenText = styled.div`
  display: flex;
  align-items: center;
  text-align: left;
  margin: 0 0 0 12px;
  font-size: 16px;
  display: flex;
  align-items: center;
  font-variant-numeric: tabular-nums;

  > span {
    display: flex;
    flex-flow: column wrap;
    align-items: center;
    justify-content: flex-start;
    max-width: inherit;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    gap: 2px;
  }

  > span > b {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
    font-weight: 600;
    display: inline-block;
  }

  > span > i {
    opacity: 0.6;
    font-style: normal;
    font-size: 14px;
    font-weight: 500;
    width: 100%;
    display: inline-block;
  }

  ${Media.upToSmall()} {
    font-size: 13px;
  }
`

export const Cell = styled.div`
  display: flex;
  gap: 8px;

  // 1st STAR column
  &:nth-child(1n) {
    gap: 0;
  }

  // ACTIONS column
  &:nth-child(5n) {
    gap: 10px;
    display: flex;
    flex-flow: row wrap;

    > span {
      white-space: nowrap;
    }
  }

  > a {
    text-decoration-color: transparent;
    transition: color var(${UI.ANIMATION_DURATION}) ease-in-out;
    overflow: hidden;
    display: flex;
    color: var(${UI.COLOR_TEXT});

    &:hover {
      color: var(${UI.COLOR_TEXT});
      text-decoration: none;
    }

    &:hover > ${TokenText} {
      text-decoration: underline;
    }
  }
`

export const IndexNumber = styled.span`
  font-size: 14px;
  font-weight: 400;
`

export const BalanceValue = styled.span<{ hasBalance: boolean }>`
  color: inherit;
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: ${({ hasBalance }) => (hasBalance ? 1 : 0.5)};
`

export const TableButton = styled(BaseButton)<{ color?: string; outlined?: boolean; text?: boolean }>`
  font-size: 14px;
  padding: 0;
  width: auto;
  font-weight: 400;
  transition:
    color var(${UI.ANIMATION_DURATION}) ease-in-out,
    opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
  background: transparent;
  color: ${({ color }) => color || 'inherit'};
  white-space: nowrap;
  position: relative;
  opacity: 0.7;

  &:hover {
    background: transparent;
    text-decoration: underline;
    opacity: 1;
  }

  > svg {
    width: 16px;
    height: 16px;
    max-width: 100%;
    max-height: 100%;
    color: inherit;

    > path {
      fill: currentColor;
    }
  }

  ${({ outlined, color }) =>
    outlined &&
    `
      background: transparent;
      color: ${color || 'inherit'};
      border: 1px solid ${color || 'inherit'};
      :hover {
        color: white;
      }
  `};

  ${({ text, color }) =>
    text &&
    `
      background: none;
      border: none;
      color: ${color || 'inherit'};
      padding: 0;

      :hover {
        background: none;
      }
  `};
`

export const Table = styled.div`
  display: flex;
  flex-flow: column wrap;
  overflow-y: auto; // fallback for 'overlay'
  overflow-y: overlay;
  width: 100%;
  min-width: 100%;
  min-height: 400px;
  font-size: 14px;
  align-items: center;
  text-align: left;
  border: 0;
  padding: 0;
  background: transparent;
  transition: background var(${UI.ANIMATION_DURATION}) ease-in-out;
  ${({ theme }) => theme.colorScrollbar};

  ${Media.upToSmall()} {
    min-height: 250px;
    display: grid;
  }
`

export const ApproveLabel = styled.span`
  color: ${({ theme }) => theme.green1};
  font-weight: 500;
`

export const CustomLimit = styled.div`
  > span:last-child {
    cursor: default;
    font-size: 10px;
    margin-top: 5px;
    display: block;
  }
`

export const IndexLabel = styled(Label)`
  padding: 0;
`

export const FiatValue = styled.div`
  display: flex;
  align-items: center;
`

export const InfoCircle = styled(HelpCircle)`
  stroke: currentColor;
  width: 15px;
  height: 15px;
  margin-left: 5px;
  vertical-align: middle;
  margin-bottom: 2px;
`

export const NoResults = styled.div`
  color: inherit;
  min-height: 400px;
  display: flex;
  align-items: center;
  color: inherit;

  ${Media.upToSmall()} {
    min-height: 200px;
    margin: 0 auto 0 0;
    overflow-x: auto;
  }

  > h3 {
    font-size: 24px;
    font-weight: 500;
    margin: 0 auto;
    color: inherit;

    ${Media.upToSmall()} {
      font-size: 16px;
      text-align: left;
      margin: 16px;
    }
  }
`
