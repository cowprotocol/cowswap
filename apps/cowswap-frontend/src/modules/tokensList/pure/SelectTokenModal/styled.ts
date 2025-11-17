import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { blankButtonMixin } from '../commonElements'

export const Wrapper = styled.div<{ $hasChainPanel?: boolean; $isFullScreen?: boolean }>`
  display: flex;
  flex-direction: column;
  background: var(${UI.COLOR_PAPER});
  border-radius: ${({ $isFullScreen }) => ($isFullScreen ? '0' : '20px')};
  width: 100%;
  overflow: hidden;
  border-top-right-radius: ${({ $hasChainPanel, $isFullScreen }) =>
    $isFullScreen ? '0' : $hasChainPanel ? '0' : '20px'};
  border-bottom-right-radius: ${({ $hasChainPanel, $isFullScreen }) =>
    $isFullScreen ? '0' : $hasChainPanel ? '0' : '20px'};

  ${Media.upToMedium()} {
    border-radius: ${({ $isFullScreen }) => ($isFullScreen ? '0' : '20px')};
  }
`

export const TitleBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  gap: 12px;

  ${Media.upToSmall()} {
    padding: 14px 14px 8px;
  }
`

export const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin: 0;

  ${Media.upToSmall()} {
    font-size: 18px;
  }
`

export const TitleActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const TitleActionButton = styled.button`
  ${blankButtonMixin};

  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: 8px;
  cursor: pointer;
  color: inherit;
  transition: background var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    background: var(${UI.COLOR_PAPER_DARKER});
  }
`

export const SearchRow = styled.div`
  padding: 0 14px 14px;
  display: flex;
  align-items: center;
`

export const SearchInputWrapper = styled.div`
  --input-height: 46px;
  width: 100%;

  > div {
    width: 100%;
    background: var(${UI.COLOR_PAPER_DARKER});
    border-radius: var(--input-height);
    height: var(--input-height);
    display: flex;
    align-items: center;
    padding: 0 14px;
    font-size: 15px;
  }

  input {
    background: transparent;
    height: 100%;
  }
`

export const Body = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;

  ${Media.upToMedium()} {
    flex-direction: column;
  }
`

export const TokenColumn = styled.div`
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0;
`

export const Row = styled.div`
  padding: 0 24px;
  margin-bottom: 16px;

  ${Media.upToSmall()} {
    padding: 0 16px;
  }
`

export const Separator = styled.div`
  width: 100%;
  border-bottom: 1px solid var(${UI.COLOR_BORDER});
  margin: 0 0 16px;
`

export const ListTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  padding: 8px 16px 4px;
`

export const ListTitleActionButton = styled.button`
  ${blankButtonMixin};
  font-size: 13px;
  font-weight: 600;
  color: var(${UI.COLOR_TEXT});
  padding: 2px 6px;
  border-radius: 6px;
  transition: color var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    color: var(${UI.COLOR_TEXT_OPACITY_70});
  }
`

export const TokensLoader = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
  padding: 40px 0;
  text-align: center;
`

export const RouteNotAvailable = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
  padding: 40px 0;
  text-align: center;
`
