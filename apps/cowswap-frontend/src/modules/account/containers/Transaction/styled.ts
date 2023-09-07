import { transparentize } from 'polished'
import styled, { css, keyframes } from 'styled-components/macro'

import { StyledSVG } from 'legacy/components/Loader'
import { RowFixed } from 'legacy/components/Row'
import { ExternalLink, LinkStyledButton, StyledLink } from 'legacy/theme'

import { UI } from 'common/constants/theme'
import { StyledLogo } from 'common/pure/CurrencyLogo'
import { FiatAmount } from 'common/pure/FiatAmount'
import { RateWrapper } from 'common/pure/RateInfo'

export const TransactionWrapper = styled.div`
  width: 100%;
  margin: 0 auto 12px;
  border-radius: 12px;
  box-sizing: border-box;
  font-size: initial;
  display: flex;
  padding: 0;
  border: 1px solid ${({ theme }) => transparentize(0.9, theme.text1)};
  position: relative;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-flow: column wrap;
  `};

  ${RowFixed} {
    width: 100%;
  }
`

export const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
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
  display: grid;
  flex-flow: row wrap;
  width: 100%;
  padding: 22px;
  grid-template-rows: 1fr;
  grid-template-columns: 80px auto min-content;
  color: var(${UI.COLOR_TEXT1});

  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: flex;
    grid-template-rows: initial;
    grid-template-columns: initial;
  `};

  > span {
    display: flex;
    flex-flow: column wrap;
    align-items: flex-start;
    margin: 0;
    justify-content: flex-start;
  }

  > span > a {
    font-size: 13px;
    margin: 0;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      order: 2;
      display: flex;
      justify-content: flex-end;
      flex: 1 1 max-content;
    `}
  }
`

export const SummaryInner = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: auto;
  margin: 0;
  opacity: 1;
  font-size: 14px;
  word-break: break-word;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 16px 0 0;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 0 18px;
    justify-items: flex-start;
    align-items: flex-start;
  `};

  > b {
    font-weight: bold;
    line-height: 1;
    font-size: 16px;
    color: inherit;
    text-transform: capitalize;
    margin: 0 0 16px;
    flex: 0 0 auto;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      font-size: 18px;
      grid-column: 1 / -1;
    `}
  }

  > a {
    color: var(${UI.COLOR_TEXT1});
    text-decoration: underline;
    font-size: 14px;

    &:hover {
      color: ${({ theme }) => theme.text3};
    }
  }
`

export const SummaryInnerRow = styled.div<{ isExpired?: boolean; isCancelled?: boolean }>`
  display: grid;
  color: inherit;
  grid-template-rows: 1fr;
  grid-template-columns: 100px 1fr;
  width: 100%;
  margin: 0 0 4px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 1fr;
    grid-template-rows: max-content max-content;
    margin: 0 0 16px 0;
  `};

  > b,
  > i {
    position: relative;
    font-size: inherit;
    margin: 0;
    color: inherit;
    display: flex;
    align-items: center;
    font-style: normal;
    font-weight: normal;
  }

  > b {
    padding: 0;
    opacity: 0.85;
  }

  > i {
    word-break: break-word;
    white-space: break-spaces;
    text-decoration: ${({ isExpired, isCancelled }) => (isExpired || isCancelled) && 'line-through'};

    ${({ theme }) => theme.mediaWidth.upToSmall`
      font-weight: 600;
      margin: 6px 0 0;
    `};

    &.cancelled {
      text-decoration: line-through;
    }
  }

  + ${StyledLink} {
    align-self: center;
    margin: 16px 0 0;
  }

  ${RateWrapper} {
    text-align: left;
  }
`

export const TransactionStatusText = styled.div`
  margin: 0;
  width: 100%;
  display: flex;
  align-items: center;
  flex-flow: column wrap;
  align-items: flex-start;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin: 0 auto 0 0;
  `};

  &.copied,
  &:hover {
    text-decoration: none;
  }
`

export const StatusLabelWrapper = styled.div<{ withCancellationHash$: boolean }>`
  display: flex;
  flex-flow: ${({ withCancellationHash$ }) => (withCancellationHash$ ? 'row' : 'column wrap')};
  flex: 0 1 auto;
  justify-content: center;
  align-items: center;
  margin: 0 0 auto auto;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 16px auto 0;
    width: 100%;
  `};
`

// TODO: Consolidate status label logic with StatusItem
// in src/modules/limitOrders/pure/Orders/OrderRow.tsx
export const StatusLabel = styled.div<{
  isTransaction: boolean
  isPending: boolean
  isCancelling: boolean
  isPresignaturePending: boolean
  isCreating: boolean
  color: string
}>`
  height: 28px;
  width: 100px;
  ${({ isPending, isPresignaturePending, isCancelling, isCreating, theme }) =>
    !isCancelling && (isPending || isPresignaturePending || isCreating) && `border:  1px solid ${theme.card.border};`}
  color: ${({ isPending, isPresignaturePending, isCreating, theme, color }) =>
    isPending || isPresignaturePending || isCreating
      ? theme.text1
      : color === 'success'
      ? theme.success
      : theme.attention};
  position: relative;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    font-size: 13px;
    height: 32px;
    padding: 0 12px;
  `};

  &::before {
    content: '';
    background: ${({ color, isTransaction, isPending, isPresignaturePending, isCancelling, isCreating, theme }) =>
      !isCancelling && (isPending || isCreating)
        ? 'transparent'
        : isPresignaturePending || (isPending && isTransaction)
        ? theme.pending
        : color === 'success'
        ? theme.success
        : theme.attention};
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    border-radius: 4px;
    opacity: 0.15;
  }

  ${({ theme, isCancelling, isPresignaturePending, isTransaction, isPending }) =>
    (isCancelling || isPresignaturePending || (isPending && isTransaction)) &&
    css`
      &::after {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        transform: translateX(-100%);
        ${theme.shimmer}; // shimmer effect
        content: '';
      }
    `}

  > svg {
    margin: 0 5px 0 0;
    max-height: 13px;
    max-width: 18px;
    object-fit: contain;
  }

  > svg > path {
    fill: ${({ theme, color, isPending, isPresignaturePending, isCreating }) =>
      isPending || isPresignaturePending || isCreating
        ? theme.text1
        : color === 'success'
        ? theme.success
        : theme.attention};
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
  color: ${({ isCancelling }) => (isCancelling ? `var(${UI.COLOR_TEXT1})` : 'inherit')};

  > ${LinkStyledButton} {
    margin: 2px 0;
    opacity: 1;
    color: var(${UI.COLOR_TEXT1});
  }
`

export const OldTransactionState = styled(ExternalLink)<{ pending: boolean; success?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* text-decoration: none !important; */
  border-radius: 0.5rem;
  padding: 0.25rem 0rem;
  font-weight: 500;
  font-size: 0.825rem;
  color: ${({ theme }) => theme.primary1};
`

// override the href, pending and success props
// override mouse actions via CSS when we dont want a clickable row
export const TransactionState = styled(OldTransactionState).attrs(
  (props): { href?: string; disableMouseActions?: boolean; pending?: boolean; success?: boolean } => props
)`
  ${(props): string | false => !!props.disableMouseActions && `pointer-events: none; cursor: none;`}
  width: 100%;
  border-radius: 0;
  display: flex;
  padding: 0;
  font-size: 14px;
  margin: 6px 0 0;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 18px auto 0;
    position: absolute;
    top: 0;
    right: 16px;
    width: auto;
  `};

  ${RowFixed} {
    width: 100%;
  }
`

export const CancellationSummary = styled.span`
  padding: 12px;
  margin: 0;
  border-radius: 6px;
  background: var(${UI.COLOR_CONTAINER_BG_01});
`

export const TransactionInnerDetail = styled.div`
  display: flex;
  flex-flow: column wrap;
  border-radius: 12px;
  padding: 20px;
  color: var(${UI.COLOR_TEXT1});
  margin: 24px auto 0 0;
  border: 1px solid ${({ theme }) => theme.card.border};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 24px auto 12px;
    width: 100%;
    max-width: 100%;
    grid-column: 1 / -1;
  `};

  > span {
    flex: 1 1 auto;
    margin: 0;
  }

  > span:last-of-type {
    margin: 3px 0 12px;
  }

  > a {
    text-align: left;
    display: block;
    margin: 0;
    font-size: 14px;
    font-weight: 500;
  }

  > a:focus {
    text-decoration: none;
  }
`

export const TextAlert = styled.div<{ isPending: boolean; isExpired: boolean; isCancelled: boolean }>`
  background: ${({ theme, isPending }) =>
    isPending ? transparentize(0.85, theme.attention) : transparentize(0.85, theme.success)};
  margin: 6px 0 16px;
  padding: 8px 12px;
  color: ${({ theme, isPending }) => (isPending ? theme.attention : theme.success)};
  text-decoration: ${({ isExpired, isCancelled }) => (isExpired || isCancelled) && 'line-through'};
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
`

export const CreationDateText = styled.div`
  padding: 12px 0;
  font-size: 14px;
  font-weight: 500;
`

export const CreationTimeText = styled.div`
  font-size: 13px;
  font-weight: 400;
  opacity: 0.8;
  padding: 0 0 12px;
`

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

export const ActivityVisual = styled.div`
  display: flex;
  margin: 0 0 6px;

  ${StyledLogo} {
    padding: 2px;
    box-sizing: content-box;
    box-shadow: none;
    background: ${({ theme }) => theme.white};
    color: ${({ theme }) =>
      theme.transaction.tokenColor}!important; // TODO: Fix MOD file to not require this !important property value.
    border: 2px solid ${({ theme }) => theme.bg1};
  }

  ${StyledLogo}:not(:first-child):last-child {
    margin: 0 0 0 -9px;
  }

  &:hover ${StyledLogo} {
    animation: ${rotate360} 1s cubic-bezier(0.83, 0, 0.17, 1) infinite;
    transform: translateZ(0);
  }
`

export const CancelTxLink = styled(ExternalLink)`
  margin-left: 10px;
`

export const StyledFiatAmount = styled(FiatAmount)`
  margin: 0;
`

export const FiatWrapper = styled.span`
  margin-left: 5px;
  align-items: center;
  display: flex;
`
