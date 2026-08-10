import { UI } from '@cowprotocol/ui'

import { ArrowRight } from 'react-feather'
import styled from 'styled-components/macro'

export const WidgetWrapper = styled.div`
  width: 100%;
  padding: 0;
  border-radius: 16px;
  overflow-y: auto; // fallback for 'overlay'
  overflow-y: overlay;
  height: inherit;
  ${({ theme }) => theme.colorScrollbar};
`

export const AmountsPreviewContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: max-content;
  gap: 6px;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  position: relative;
`

export const SeparatorWrapper = styled.div`
  --size: 36px;
  --padding: 4px;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: calc(var(--size) + var(--padding) * 2);
`

export const AmountsSeparator = styled(ArrowRight)`
  width: var(--size);
  height: var(--size);
  border-radius: var(--size);
  background: var(${UI.COLOR_PAPER_DARKER});
  border: var(--padding) solid var(${UI.COLOR_PAPER});
  padding: var(--padding);
  position: relative;
  z-index: 1;
`

export const ContentWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 10px 10px;
`

export const HeaderRightContent = styled.div`
  line-height: var(--arrow-size);
`

export const QuoteCountdownWrapper = styled.div<{ blink?: boolean }>`
  animation: ${({ blink }) => (blink ? `blinkOut 1s ease-out forwards` : 'none')};
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  column-gap: 3px;
  display: grid;
  font-size: 13px;
  grid-template-columns: 1fr auto;

  @keyframes blinkOut {
    0%,
    25% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
`

export const QuoteCountdownWrapperText = styled.span`
  min-width: 0;
  text-align: right;
  word-wrap: break-word;
`

export const QuoteCountdownWrapperValue = styled.span`
  color: var(${UI.COLOR_TEXT});
  font-weight: normal;
`
