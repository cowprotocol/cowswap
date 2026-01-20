import { Media, SearchInput as UISearchInput, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { IconButton } from '../commonElements'

export const Panel = styled.div<{ $variant: 'default' | 'fullscreen' }>`
  width: ${({ $variant }) => ($variant === 'fullscreen' ? '100%' : '200px')};
  height: ${({ $variant }) => ($variant === 'fullscreen' ? '100%' : 'auto')};
  flex-shrink: 0;
  background: var(${UI.COLOR_PAPER_DARKER});
  border-left: ${({ $variant }) => ($variant === 'fullscreen' ? 'none' : `1px solid var(${UI.COLOR_BORDER})`)};
  padding: ${({ $variant }) => ($variant === 'fullscreen' ? '20px 16px' : '16px 10px')};
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  border-top-right-radius: ${({ $variant }) => ($variant === 'fullscreen' ? '0' : '20px')};
  border-bottom-right-radius: ${({ $variant }) => ($variant === 'fullscreen' ? '0' : '20px')};

  ${Media.upToMedium()} {
    width: 100%;
    border-left: none;
    border-top: 1px solid var(${UI.COLOR_BORDER});
    border-radius: ${({ $variant }) => ($variant === 'fullscreen' ? '0' : '0 0 20px 20px')};
  }

  ${Media.upToSmall()} {
    padding: ${({ $variant }) => ($variant === 'fullscreen' ? '14px' : '16px')};
    background: var(${UI.COLOR_PAPER});
  }
`

export const PanelHeader = styled.div<{ $isFullscreen?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ $isFullscreen }) => ($isFullscreen ? 'space-between' : 'space-between')};
  gap: 12px;
  padding: ${({ $isFullscreen }) => ($isFullscreen ? '4px 0' : '0')};
`

export const PanelTitle = styled.h4<{ $isFullscreen?: boolean }>`
  font-size: ${({ $isFullscreen }) => ($isFullscreen ? '18px' : '14px')};
  font-weight: ${({ $isFullscreen }) => ($isFullscreen ? 600 : 500)};
  margin: 0;
  flex: 1;
  text-align: ${({ $isFullscreen }) => ($isFullscreen ? 'left' : 'center')};
  color: ${({ $isFullscreen }) => ($isFullscreen ? `var(${UI.COLOR_TEXT})` : `var(${UI.COLOR_TEXT_OPACITY_70})`)};
`

export const PanelCloseButton = styled(IconButton)`
  flex-shrink: 0;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  background: var(${UI.COLOR_PAPER});
`

export const PanelSearchInputWrapper = styled.div`
  --min-height: 36px;
  min-height: var(--min-height);
  border: 1px solid var(${UI.COLOR_PAPER_DARKEST});
  background: transparent;
  border-radius: var(--min-height);
  padding: 0 10px;
  color: var(${UI.COLOR_TEXT});

  ${Media.upToSmall()} {
    --min-height: 46px;
    border: none;
    padding: 0;
    background: transparent;
    color: inherit;

    > div {
      width: 100%;
      background: var(${UI.COLOR_PAPER_DARKER});
      border-radius: var(--min-height);
      height: var(--min-height);
      display: flex;
      align-items: center;
      padding: 0 14px;
      font-size: 15px;
      color: inherit;
    }

    input {
      background: transparent;
      height: 100%;
    }
  }
`

export const PanelSearchInput = styled(UISearchInput)`
  width: 100%;
  color: inherit;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 400;

  ${Media.upToSmall()} {
    font-size: 16px;
  }
`

export const PanelList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  margin-right: -8px;
  box-sizing: content-box;
  ${({ theme }) => theme.colorScrollbar};
  scrollbar-gutter: stable;
`

export const EmptyState = styled.div`
  text-align: center;
  font-size: 14px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  padding: 32px 8px;
`
