import { Color, Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const TradeCard = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  overflow: hidden;

  ${Media.upToExtraSmall()} {
    grid-template-columns: 1fr;
  }
`

export const TokenBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 12px;

  &:first-child {
    padding-right: 32px;
    align-items: flex-start;
  }

  &:last-child {
    padding-left: 32px;
    align-items: flex-end;
  }

  ${Media.upToExtraSmall()} {
    &:first-child {
      padding-right: 12px;
      padding-bottom: 20px;
    }

    &:last-child {
      padding-left: 12px;
      padding-top: 20px;
      align-items: flex-start;
    }
  }
`

export const DirectionLabel = styled.span<{ $green?: boolean }>`
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: ${({ $green }) => ($green ? Color.explorer_green1 : Color.explorer_red1)};
`

export const TokenSymbol = styled.span`
  font-size: 2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;

  a {
    color: ${Color.explorer_textActive};
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`

export const TokenAmount = styled.span`
  font-size: 1.3rem;
`

export const ArrowSep = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 1px solid ${Color.explorer_tableRowBorder};
  border-radius: 16px;
  background: ${Color.explorer_tableRowBorder};
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: ${Color.explorer_grey};

  &::before,
  &::after {
    content: '';
    position: absolute;
    border-right: 1px solid ${Color.explorer_tableRowBorder};
    left: 50%;
    height: 512px;
  }

  &::before {
    bottom: 100%;
  }

  &::after {
    top: 100%;
  }

  ${Media.upToExtraSmall()} {
    transform: translate(-50%, -50%) rotate(90deg);
  }
`

export const SubInfo = styled.p`
  padding: 8px 12px;
  margin: 0;
  font-size: 1.2rem;
  color: ${Color.explorer_grey};
  word-break: normal;
  border-top: 1px solid ${Color.explorer_tableRowBorder};

  a {
    color: ${Color.explorer_textActive};
    &:hover {
      opacity: 0.8;
    }
  }
`
