import { Media, SearchInput as UISearchInput, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Panel = styled.div`
  width: 200px;
  flex-shrink: 0;
  background: var(${UI.COLOR_PAPER_DARKER});
  border-left: 1px solid var(${UI.COLOR_BORDER});
  padding: 16px 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;

  ${Media.upToMedium()} {
    width: 100%;
    border-left: none;
    border-top: 1px solid var(${UI.COLOR_BORDER});
    border-radius: 0 0 20px 20px;
  }

  ${Media.upToSmall()} {
    padding: 16px;
  }
`

export const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const PanelTitle = styled.h4`
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  width: 100%;
  text-align: center;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const PanelSearchInputWrapper = styled.div`
  --min-height: 36px;
  min-height: var(--min-height);
  border: 1px solid var(${UI.COLOR_PAPER_DARKEST});
  background: transparent;
  border-radius: var(--min-height);
  padding: 0 10px;
`

export const PanelSearchInput = styled(UISearchInput)`
  width: 100%;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
`

export const PanelList = styled.div<{ $hasScrollbar: boolean }>`
  flex: 1;
  overflow-y: auto;
  padding-right: ${({ $hasScrollbar }) => ($hasScrollbar ? '8px' : '0')};
  margin-right: ${({ $hasScrollbar }) => ($hasScrollbar ? '-8px' : '0')};
  box-sizing: content-box;
  ${({ theme }) => theme.colorScrollbar};
  scrollbar-gutter: ${({ $hasScrollbar }) => ($hasScrollbar ? 'stable' : 'auto')};
`

export const EmptyState = styled.div`
  text-align: center;
  font-size: 14px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  padding: 32px 8px;
`
