import { font, UI } from '@cowprotocol/ui'

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
  ${font('FONT_SMALL_PLUS', 'regular')}

  animation: ${({ blink }) => (blink ? `blinkOut 1s ease-out forwards` : 'none')};
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  column-gap: 3px;
  display: grid;
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
`
