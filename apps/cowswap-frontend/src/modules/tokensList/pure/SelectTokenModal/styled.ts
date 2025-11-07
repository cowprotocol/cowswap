import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { blankButtonMixin } from '../commonElements'

export const Wrapper = styled.div<{ $hasChainPanel?: boolean }>`
  display: flex;
  flex-direction: column;
  background: var(${UI.COLOR_PAPER});
  border-radius: 20px;
  width: 100%;
  overflow: hidden;
  border-top-right-radius: ${({ $hasChainPanel }) => ($hasChainPanel ? '0' : '20px')};
  border-bottom-right-radius: ${({ $hasChainPanel }) => ($hasChainPanel ? '0' : '20px')};

  ${Media.upToMedium()} {
    border-radius: 20px;
  }
`

export const TitleBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 12px;
  gap: 12px;

  ${Media.upToSmall()} {
    padding: 16px 16px 8px;
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
  padding: 0 24px 16px;
  border-bottom: 1px solid var(${UI.COLOR_BORDER});
  display: flex;

  > * {
    width: 100%;
  }

  ${Media.upToSmall()} {
    padding: 0 16px 16px;
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
  padding: 16px 24px 24px;

  ${Media.upToSmall()} {
    padding: 16px;
  }
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
