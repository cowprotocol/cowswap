import styled, { css } from 'styled-components'
import { StyledSVG } from 'components/Loader'
import { LinkStyledButton } from 'theme'
import { TransactionState as OldTransactionState } from '../TransactionMod'
import { RowFixed } from 'components/Row'
import { transparentize } from 'polished'

export const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  border-bottom: 1px solid #d9e8ef;

  ${({ theme }) => theme.mediaWidth.upToSmall`
  border-bottom: 2px solid #d9e8ef;
`}
`

export const IconType = styled.div`
  flex: 0 0 36px;
  height: 36px;
  width: 36px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: none;
`};

  &::before {
    content: '';
    display: block;
    background: ${({ color }) => color};
    position: absolute;
    top: 0;
    left: 0;
    height: inherit;
    width: inherit;
    border-radius: 36px;
    opacity: 0.1;
  }
  svg {
    display: flex;
    margin: auto;
  }
  svg > path {
    width: 100%;
    height: 100%;
    object-fit: contain;
    margin: auto;
    display: block;
    fill: ${({ color }) => color};
  }
  // Loader
  ${StyledSVG} {
    > path {
      fill: transparent;
      stroke: ${({ color }) => color};
    }
  }
`

export const Summary = styled.div`
  display: flex;
  flex-flow: column wrap;
  color: ${({ theme }) => theme.text2};

  > b {
    color: inherit;
    font-weight: normal;
    line-height: 1;
    font-size: 15px;
    margin: 0 0 5px;
    text-transform: capitalize;

    ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0 0 12px;
    font-weight: bold;
  `}
  }
`

export const SummaryInner = styled.div`
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  opacity: 0.75;
  font-size: 13px;
`

export const SummaryInnerRow = styled.div<{ isExpired?: boolean; isCancelled?: boolean }>`
  display: grid;
  color: inherit;
  grid-template-rows: 1fr;
  grid-template-columns: 100px 1fr;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 1fr; 
    grid-template-rows: max-content max-content; 
    margin: 0 16px 8px 0;
`};

  > b,
  > i {
    position: relative;
    font-size: inherit;
    font-weight: 500;
    margin: 0;
    color: inherit;
    display: flex;
    align-items: center;
    font-style: normal;
  }

  > b {
    padding: 0;
    font-weight: 500;
    opacity: 0.8;
    letter-spacing: -0.1px;

    &:before {
      content: '▶';
      margin: 0 5px 0 0;
      color: ${({ theme }) => theme.text2};
      font-size: 8px;
    }
  }

  > i {
    word-break: break-all;
    white-space: break-spaces;
    text-decoration: ${({ isExpired, isCancelled }) => (isExpired || isCancelled) && 'line-through'};

    ${({ theme }) => theme.mediaWidth.upToSmall`
      font-weight: 600;
      margin: 4px 0 0 12px;
    `};

    &.cancelled {
      text-decoration: line-through;
    }
  }
`

export const TransactionStatusText = styled.div`
  margin: 0 auto 0 16px;
  display: flex;
  align-items: center;

  ${({ theme }) => theme.mediaWidth.upToMedium`
  margin: 0 auto 0 0;
`};
  &.copied,
  &:hover {
    text-decoration: none;
  }
`

export const StatusLabelWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  flex: 0 1 auto;
  justify-content: center;
`

export const StatusLabel = styled.div<{ isPending: boolean; isCancelling: boolean; isPresignaturePending: boolean }>`
  height: 28px;
  width: 100px;
  ${({ isPending, isCancelling, theme }) => !isCancelling && isPending && `border:  1px solid ${theme.border2};`}
  color: ${({ color }) => color};
  position: relative;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;

  &::before {
    content: '';
    background: ${({ color, isPending, isCancelling }) => (!isCancelling && isPending ? 'transparent' : color)};
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    border-radius: 4px;
    opacity: 0.1;
  }

  ${({ theme, color, isCancelling, isPending, isPresignaturePending }) =>
    (isCancelling || isPending || isPresignaturePending) &&
    color &&
    css`
      &::after {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        transform: translateX(-100%);
        background-image: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0) 0,
          ${transparentize(0.9, color)} 20%,
          ${theme.bg2} 60%,
          rgba(255, 255, 255, 0)
        );
        animation: shimmer 2s infinite;
        content: '';
      }
    `}

  @keyframes shimmer {
    100% {
      transform: translateX(100%);
    }
  }

  > svg {
    margin: 0 5px 0 0;
  }
`

export const TransactionWrapper = styled.div`
  width: 100%;
  border-radius: 0;
  font-size: initial;
  display: flex;
  margin: 0;
  padding: 16px;
  transition: background 0.2s ease-in-out;

  &:hover {
    background: rgba(217, 232, 239, 0.35);
  }
`

export const StatusLabelBelow = styled.div<{ isCancelling?: boolean }>`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  line-height: 1.1;
  margin: 7px auto 0;
  color: ${({ isCancelling, theme }) => (isCancelling ? theme.primary1 : 'inherit')};

  ${LinkStyledButton} {
    margin: 2px 0;
  }
`

// override the href, pending and success props
// override mouse actions via CSS when we dont want a clickable row
export const TransactionState = styled(OldTransactionState).attrs(
  (props): { href?: string; disableMouseActions?: boolean; pending?: boolean; success?: boolean } => props
)`
  ${(props): string | false => !!props.disableMouseActions && `pointer-events: none; cursor: none;`}
  width: 100%;
  border-radius: 0;
  font-size: initial;
  display: flex;
  margin: 0;
  padding: 0;

  ${RowFixed} {
    width: 100%;
  }
`

export const CancellationSummary = styled.span`
  padding: 12px;
  margin: 0;
  border-radius: 6px;
  background: ${({ theme }) => theme.bg4};
`

export const TransactionAlertMessage = styled.div`
  width: 100%;
  padding: 0;
  color: ${({ theme }) => theme.text2};
  display: flex;
  justify-content: center;
  margin: 0;
  font-size: 12px;

  > p {
    margin: 6px 20px 6px 0;
    padding: 10px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    line-height: 1.4;
    background: ${({ theme }) => theme.yellow};
    width: 100%;
    height: 100%;
  }

  > p > a {
    color: ${({ theme }) => theme.primary1};
  }

  > p > span {
    margin: 0 6px 0 0;
  }
`
