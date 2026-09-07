import svgDropDownSrc from '@cowprotocol/assets/images/dropdown.svg'
import { Accordion, ExternalLink, UI } from '@cowprotocol/ui'

import styled, { css } from 'styled-components/macro'

export const TitleWrapper = styled.div`
  display: flex;
  width: 100%;
  min-width: 0;
  flex: 1;
  align-items: center;
  gap: 8px;

  > div:last-child {
    --height: 24px;
    padding: 0 8px;
    border-radius: 999px;
  }

  > div:last-child::before {
    border-radius: 999px;
  }
`

export const Title = styled.div`
  min-width: 0;
  margin: 0;
  color: var(${UI.COLOR_TEXT});
  font-size: 20px;
  font-weight: 600;
  line-height: 24px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const ReceiptContent = styled.div`
  box-sizing: border-box;
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  padding: 12px 16px calc(24px + env(safe-area-inset-bottom, 0px));
`

export const FillOutcome = styled.section`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 9px;
  padding: 10px 12px;
  border-radius: 16px;
  background: var(${UI.COLOR_PAPER_DARKER});
`

export const FillHeading = styled.div`
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  font-size: 13px;
  line-height: 18px;
`

export const FillPercentage = styled.strong<{ $hasFill: boolean }>`
  color: ${({ $hasFill }) => `var(${$hasFill ? UI.COLOR_SUCCESS_TEXT : UI.COLOR_TEXT})`};
  font-weight: 600;
`

export const ProgressTrack = styled.span<{ $hasFill: boolean }>`
  position: relative;
  display: block;
  width: 100%;
  height: 6px;
  overflow: hidden;
  border-radius: 999px;
  background: ${({ $hasFill }) => `var(${$hasFill ? UI.COLOR_SUCCESS_BG : UI.COLOR_TEXT_OPACITY_10})`};
`

export const Progress = styled.span<{ $value: number }>`
  position: absolute;
  inset: 0 auto 0 0;
  width: ${({ $value }) => $value}%;
  border-radius: inherit;
  background: var(${UI.COLOR_SUCCESS_TEXT});
`

export const FillDescription = styled.div`
  min-width: 0;
  color: var(${UI.COLOR_TEXT});
  font-size: 13px;
  font-weight: 600;
  line-height: 18px;
  overflow-wrap: anywhere;
`

export const FillStatus = styled.strong`
  min-width: 0;
  color: var(${UI.COLOR_TEXT});
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  text-align: right;
`

export const SurplusCard = styled.section`
  display: grid;
  grid-template-columns: minmax(0, auto) minmax(0, 1fr);
  gap: 2px 12px;
  width: 100%;
  min-height: 60px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 16px;
  background: var(${UI.COLOR_PAPER_DARKER});
`

export const SurplusLabel = styled.div`
  display: flex;
  grid-row: 1 / span 2;
  align-self: start;
  align-items: center;
  gap: 4px;
  color: var(${UI.COLOR_TEXT});
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
`

export const SurplusValue = styled.strong`
  min-width: 0;
  color: var(${UI.COLOR_SUCCESS_TEXT});
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  text-align: right;
  overflow-wrap: anywhere;
`

export const SurplusPercent = styled.span`
  min-width: 0;
  color: var(${UI.COLOR_SUCCESS_TEXT});
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  text-align: right;
  overflow-wrap: anywhere;
`

export const FieldsCard = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  padding: 0 12px;
  overflow: hidden;
  border-radius: 16px;
  background: var(${UI.COLOR_PAPER_DARKER});
`

export const Field = styled.div`
  display: grid;
  grid-template-columns: minmax(0, auto) minmax(0, 1fr);
  min-height: 52px;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  color: var(${UI.COLOR_TEXT});
  font-size: 13px;
  line-height: 18px;

  & + & {
    min-height: 61px;
    border-top: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  }

  > span:last-child,
  > div:last-child {
    min-width: 0;
    text-align: right;
  }

  > div:last-child {
    display: flex;
    justify-content: flex-end;
    gap: 4px;
  }

  > div:last-child > a {
    display: inline-flex;
    min-width: 0;
    align-items: center;
  }
`

export const RecipientValue = styled.div`
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  color: var(${UI.COLOR_TEXT});
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;

  > a {
    font-weight: 600;
  }
`

export const LabelText = styled.span`
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const Label = styled.div`
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 4px;

  // TODO: Override required to remove inline styles from StyledInfoIcon parent.
  // Need to refactor and remove the inline styles.
  > div > div {
    padding: 0 !important;
  }
`

export const Value = styled.div`
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  padding-left: 12px;
  color: var(${UI.COLOR_TEXT});
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  text-align: right;
  overflow-wrap: anywhere;
`

export const InlineWrapper = styled.div`
  display: flex;
  width: 100%;
  flex-flow: row wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 4px 6px;
`

export const RateValue = styled.div`
  min-width: 0;
  overflow-wrap: anywhere;
`

export const OrderTypeValue = styled.span`
  &:first-letter {
    text-transform: uppercase;
  }
`

export const DisclosureGroup = styled(Accordion.Root)`
  width: 100%;
  overflow: hidden;
  border-radius: 16px;
  background: var(${UI.COLOR_PAPER_DARKER});
`

export const DisclosureItem = styled(Accordion.Item)`
  border-radius: 0;
  background: transparent;

  & + & {
    border-top: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  }

  &[data-open] {
    padding: 0;
    background: transparent;
  }
`

export const DisclosureHeader = Accordion.Header

export const DisclosureTrigger = styled(Accordion.Trigger)`
  min-height: 52px;
  justify-content: space-between;
  gap: 16px;
  padding: 0 12px;
  border-radius: 0;
  color: var(${UI.COLOR_TEXT});
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  text-align: left;
`

export const DisclosureSummary = styled.span`
  display: inline-flex;
  min-width: 0;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  font-size: 13px;
  font-weight: 400;
  line-height: 18px;
  text-align: right;
`

export const DisclosureChevron = styled.img.attrs({ alt: '', src: svgDropDownSrc })`
  width: 12px;
  height: 7px;
  flex: 0 0 auto;
  transition: transform var(${UI.ANIMATION_DURATION}) ease-in-out;

  ${DisclosureTrigger}[data-panel-open] & {
    transform: rotate(180deg);
  }
`

export const DisclosurePanel = styled(Accordion.Panel)`
  box-sizing: border-box;
`

export const DisclosureFields = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 12px 10px;
  border-top: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
`

const actionStyles = css`
  display: flex;
  width: 100%;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  cursor: pointer;
  transition: background var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover,
  &:focus-visible {
    background: var(${UI.COLOR_PAPER_DARKER});
  }

  &:focus-visible {
    outline: 2px solid var(${UI.COLOR_TEXT});
    outline-offset: 2px;
  }
`

export const ActionList = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
`

export const ActionButton = styled.button<{ $danger?: boolean }>`
  ${actionStyles}

  color: ${({ $danger }) => `var(${$danger ? UI.COLOR_DANGER : UI.COLOR_PRIMARY})`};
`

export const ActionLink = styled(ExternalLink)`
  ${actionStyles}

  color: var(${UI.COLOR_PRIMARY});
  text-decoration: none;
`
