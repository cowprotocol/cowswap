import { Media } from '@cowprotocol/ui'

import styled, { css } from 'styled-components/macro'
import { WIDGET_MAX_WIDTH } from 'theme'

export const Wrapper = styled.div`
  width: 100%;
  height: 100%;
`

export const InnerWrapper = styled.div<{ $hasSidebar: boolean; $isMobileOverlay?: boolean }>`
  height: 100%;
  min-height: ${({ $isMobileOverlay }) => ($isMobileOverlay ? '0' : 'min(600px, 100%)')};
  width: 100%;
  margin: 0 auto;
  display: flex;
  align-items: stretch;

  ${({ $hasSidebar }) =>
    $hasSidebar &&
    css`
      /* Stack modal + sidebar vertically on narrow screens so neither pane collapses */
      ${Media.upToMedium()} {
        flex-direction: column;
        height: auto;
        min-height: 0;
      }

      ${Media.upToSmall()} {
        min-height: 0;
      }
    `}

  ${({ $isMobileOverlay }) =>
    $isMobileOverlay &&
    css`
      flex-direction: column;
      height: 100%;
      min-height: 0;
    `}
`

export const ModalContainer = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  height: 100%;
`

export const MobileChainPanelOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: stretch;
  justify-content: center;
`

export const MobileChainPanelCard = styled.div`
  flex: 1;
  max-width: 100%;
  height: 100%;
`

export const WidgetOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;

  ${Media.upToMedium()} {
    padding: 0;
  }
`

export const WidgetCard = styled.div<{ $isCompactLayout: boolean; $hasChainPanel: boolean }>`
  width: 100%;
  max-width: ${({ $isCompactLayout, $hasChainPanel }) =>
    $isCompactLayout ? '100%' : $hasChainPanel ? WIDGET_MAX_WIDTH.tokenSelectSidebar : WIDGET_MAX_WIDTH.tokenSelect};
  height: ${({ $isCompactLayout }) => ($isCompactLayout ? '100%' : '90vh')};
  max-height: 100%;
  display: flex;
  align-items: stretch;
  justify-content: center;
  box-sizing: border-box;
`
