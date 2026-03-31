import { Media } from '@cowprotocol/ui'

import styled, { css } from 'styled-components/macro'

export const Wrapper = styled.div`
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`

export const InnerWrapper = styled.div<{ $hasSidebar: boolean; $isMobileOverlay?: boolean }>`
  flex: 1;
  min-height: 0;
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
  min-height: 0;
  display: flex;
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
