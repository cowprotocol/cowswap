import { Media, RowBetween } from '@cowprotocol/ui'
import { ExternalLink } from '@cowprotocol/ui'
import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'
import { CloseIcon } from 'theme'

import { AutoColumn } from 'legacy/components/Column'

export const Wrapper = styled.div`
  width: 100%;
  padding: 0;
  display: flex;
  flex-flow: column nowrap;
  overflow-y: auto; // fallback for 'overlay'
  overflow-y: overlay;
  height: inherit;
  ${({ theme }) => theme.colorScrollbar};
`

export const ContentWrapper = styled(Wrapper)`
  padding: 0 16px;

  ${Media.upToSmall()} {
    padding: 0 10px;
  }
`

export const Section = styled(AutoColumn)<{ inline?: boolean }>`
  padding: ${({ inline }) => (inline ? '16px 0 0' : '0')};
`

export const BottomSection = styled(Section)`
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;

  /* -- mod -- */
  padding: 0 0 16px;
`

export const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background: var(${UI.COLOR_PAPER});
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  padding: 16px 0;
  z-index: 20;
`

export const CloseIconWrapper = styled(CloseIcon)<{ margin?: string }>`
  display: flex;
  margin: ${({ margin }) => margin ?? '0 0 0 auto'};
  opacity: 0.6;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
  height: 28px;
  width: 28px;

  &:hover {
    opacity: 1;
  }
`

export const GPModalHeader = styled(RowBetween)`
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  padding: 16px 0;
  background: var(${UI.COLOR_PAPER});
  z-index: 20;
`

export const ExternalLinkCustom = styled(ExternalLink)`
  font-size: inherit;
  font-weight: inherit;
  color: inherit;
`
