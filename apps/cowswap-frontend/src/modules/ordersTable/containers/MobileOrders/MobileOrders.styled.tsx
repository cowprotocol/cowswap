import { ButtonPrimary, Media, UI } from '@cowprotocol/ui'

import { Link } from 'react-router'
import styled from 'styled-components/macro'

export const TabRail = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  min-height: 48px;
  padding: 0 16px;
  background: var(${UI.COLOR_PAPER});
`

export const Tabs = styled.div`
  display: flex;
  align-items: stretch;
  min-width: 0;
  height: 48px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`

export const Tab = styled(Link)<{ $isActive: boolean }>`
  position: relative;
  display: flex;
  flex: 1 0 auto;
  align-items: center;
  justify-content: center;
  min-width: 88px;
  height: 48px;
  padding: 0 12px;
  color: ${({ $isActive }) => ($isActive ? `var(${UI.COLOR_PRIMARY})` : `var(${UI.COLOR_TEXT_OPACITY_70})`)};
  font-size: 14px;
  font-weight: ${({ $isActive }) => ($isActive ? 600 : 400)};
  line-height: 20px;
  text-decoration: none;
  white-space: nowrap;

  &::after {
    position: absolute;
    right: 12px;
    bottom: -1px;
    left: 12px;
    height: 2px;
    border-radius: 1px;
    background: ${({ $isActive }) => ($isActive ? `var(${UI.COLOR_PRIMARY})` : 'transparent')};
    content: '';
  }

  &:focus-visible {
    outline: 2px solid var(${UI.COLOR_PRIMARY});
    outline-offset: -2px;
  }

  ${Media.upToTiny()} {
    min-width: 76px;
    padding: 0 8px;

    &::after {
      right: 8px;
      left: 8px;
    }
  }
`

export const FilterHitArea = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 96px;
  height: 48px;

  ${Media.upToTiny()} {
    width: 88px;
  }
`

export const FilterButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 88px;
  height: 36px;
  padding: 0 16px;
  border: 1px solid var(${UI.COLOR_BORDER});
  border-radius: 16px;
  background: var(${UI.COLOR_PAPER});
  color: var(${UI.COLOR_TEXT});
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    background: var(${UI.COLOR_PAPER_DARKER});
  }

  &:focus-visible {
    outline: 2px solid var(${UI.COLOR_PRIMARY});
    outline-offset: 1px;
  }
`

export const Banner = styled.div`
  width: 100%;
`

export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`

export const PaginationSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  width: 100%;

  > nav {
    margin: 0 auto 10px;
  }
`

export const PaginationRange = styled.p`
  margin: 4px 0 0;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
  text-align: center;
`

export const DateGroup = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`

export const DateHeading = styled.h3`
  margin: 0;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
`

export const Card = styled.button`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  padding: 10px;
  overflow: hidden;
  border: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  border-radius: 20px;
  background: var(${UI.COLOR_PAPER});
  color: var(${UI.COLOR_TEXT});
  font-family: inherit;
  text-align: left;
  cursor: pointer;

  &:hover {
    border-color: var(${UI.COLOR_TEXT_OPACITY_25});
    background: var(${UI.COLOR_PAPER_DARKER});
  }

  &:focus-visible {
    outline: 2px solid var(${UI.COLOR_PRIMARY});
    outline-offset: 2px;
  }
`

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 48px;
`

export const Pair = styled.div`
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

export const Logos = styled.div`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  overflow: visible;
`

export const Amounts = styled.div`
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  grid-template-rows: repeat(2, minmax(20px, auto));
  column-gap: 8px;
  flex: 1 1 auto;
  align-content: center;
  min-width: 0;
  min-height: 44px;
`

export const AmountRow = styled.div`
  display: contents;
`

export const AmountLabel = styled.span`
  color: var(${UI.COLOR_TEXT_OPACITY_50});
  font-size: 10px;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  white-space: nowrap;
`

export const Amount = styled.div`
  min-width: 0;
  color: var(${UI.COLOR_TEXT});
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;

  > span {
    white-space: normal;
    overflow-wrap: normal;
    word-break: normal;
  }
`

export const Arrow = styled.span`
  display: flex;
  flex: 0 0 24px;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-left: 8px;
  color: var(${UI.COLOR_TEXT_OPACITY_50});
  transition: color var(${UI.ANIMATION_DURATION}) ease-in-out;

  @media (hover: hover) {
    ${Card}:hover & {
      color: var(${UI.COLOR_TEXT});
    }
  }

  ${Card}:focus-visible &,
  ${Card}:active & {
    color: var(${UI.COLOR_TEXT});
  }
`

export const Summary = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  border-top: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
`

export const SummaryRow = styled.div`
  display: grid;
  grid-template-columns: minmax(82px, auto) minmax(0, 1fr);
  align-items: center;
  gap: 16px;
  min-height: 34px;
  padding: 6px 0;

  & + & {
    border-top: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  }
`

export const SummaryLabel = styled.span`
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  white-space: nowrap;
`

export const Price = styled.span`
  min-width: 0;
  color: var(${UI.COLOR_TEXT});
  font-size: 13px;
  font-weight: 600;
  line-height: 22px;
  text-align: right;
  overflow-wrap: normal;
  word-break: normal;
`

export const WarningValue = styled(Price)`
  color: var(${UI.COLOR_DANGER_TEXT});
`

export const OutcomeValue = styled(Price)`
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const FillValue = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  color: var(${UI.COLOR_SUCCESS_TEXT});
  font-size: 13px;
  font-weight: 600;
`

export const ProgressTrack = styled.span`
  position: relative;
  display: block;
  flex: 1 1 auto;
  min-width: 28px;
  height: 4px;
  overflow: hidden;
  border-radius: 999px;
  background: var(${UI.COLOR_SUCCESS_BG});
`

export const Progress = styled.span<{ $value: number }>`
  position: absolute;
  inset: 0 auto 0 0;
  width: ${({ $value }) => $value}%;
  border-radius: inherit;
  background: var(${UI.COLOR_SUCCESS_TEXT});
`

export const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 24px;
`

export const CreatedAt = styled.span`
  display: flex;
  flex-direction: column;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
`

export const StatusBadge = styled.span<{ $color: string; $background: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 24px;
  padding: 4px 8px;
  border-radius: 999px;
  background: ${({ $background }) => $background};
  color: ${({ $color }) => $color};
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  text-align: center;
`

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 420px;
  padding: 80px 16px 24px;
  color: var(${UI.COLOR_TEXT});
  text-align: center;

  > h3 {
    margin: 12px 0 8px;
    font-size: 22px;
    font-weight: 600;
    line-height: 28px;
  }

  > p {
    max-width: 300px;
    margin: 0;
    color: var(${UI.COLOR_TEXT_OPACITY_70});
    font-size: 14px;
    line-height: 20px;
  }
`

export const EmptyIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(${UI.COLOR_PAPER_DARKER});
  color: var(${UI.COLOR_TEXT_OPACITY_50});
`

export const EmptyAction = styled(ButtonPrimary)`
  width: 250px;
  min-height: 56px;
  margin-top: 12px;
  font-size: 16px;
`

export const EmptyLoadMore = styled.div`
  width: 100%;
  max-width: 360px;
  margin-top: 12px;
`

export const FilterSheetBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding-bottom 22px;
`

export const FilterGroup = styled.fieldset`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;

  > legend,
  > label {
    padding: 0;
    color: var(${UI.COLOR_TEXT_OPACITY_70});
    font-size: 13px;
    font-weight: 500;
    line-height: 18px;
  }

  > legend {
    margin: 0 0 12px;
  }
`

export const FilterChoices = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`

export const FilterChoice = styled.button<{ $isSelected: boolean }>`
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid
    ${({ $isSelected }) => ($isSelected ? `var(${UI.COLOR_PRIMARY})` : `var(${UI.COLOR_TEXT_OPACITY_10})`)};
  border-radius: 16px;
  background: ${({ $isSelected }) => ($isSelected ? `var(${UI.COLOR_PRIMARY_OPACITY_10})` : `var(${UI.COLOR_PAPER})`)};
  color: ${({ $isSelected }) => ($isSelected ? `var(${UI.COLOR_PRIMARY})` : `var(${UI.COLOR_TEXT})`)};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(${UI.COLOR_PRIMARY});
    outline-offset: 1px;
  }
`

export const SearchField = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  > svg {
    position: absolute;
    left: 14px;
    width: 18px;
    height: 18px;
    color: var(${UI.COLOR_TEXT_OPACITY_50});
    pointer-events: none;
  }

  > input {
    width: 100%;
    min-height: 46px;
    padding: 10px 44px;
    border: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
    border-radius: 16px;
    outline: none;
    background: var(${UI.COLOR_PAPER});
    color: var(${UI.COLOR_TEXT});
    font-family: inherit;
    font-size: 16px;

    &::placeholder {
      color: var(${UI.COLOR_TEXT_OPACITY_50});
    }

    &:focus {
      border-color: var(${UI.COLOR_PRIMARY});
    }
  }
`

export const ClearSearchButton = styled.button`
  position: absolute;
  right: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(${UI.COLOR_TEXT_OPACITY_50});
  cursor: pointer;
`

export const FilterActions = styled.div`
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr);
  gap: 8px;
  padding: 8px 16px 12px;
  border-top: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  background: var(${UI.COLOR_PAPER});
`

export const ResetButton = styled.button`
  min-height: 56px;
  padding: 0 12px;
  border: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  border-radius: 16px;
  background: var(${UI.COLOR_PAPER});
  color: var(${UI.COLOR_TEXT});
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    color: var(${UI.COLOR_TEXT_OPACITY_50});
    cursor: not-allowed;
    opacity: 0.5;
  }
`

export const ApplyButton = styled(ButtonPrimary)`
  width: 100%;
  min-height: 56px;
  font-size: 16px;
`
