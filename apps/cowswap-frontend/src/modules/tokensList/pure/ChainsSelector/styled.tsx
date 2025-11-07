import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { blankButtonMixin } from '../commonElements'

export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
`

export const ChainButton = styled.button<{ active$?: boolean }>`
  --min-height: 46px;
  ${blankButtonMixin};

  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 12px;
  min-height: var(--min-height);
  border-radius: var(--min-height);
  border: 1px solid ${({ active$ }) => (active$ ? `var(${UI.COLOR_PRIMARY_OPACITY_80})` : 'transparent')};
  background: ${({ active$ }) => (active$ ? `var(${UI.COLOR_PRIMARY_OPACITY_10})` : 'transparent')};
  box-shadow: ${({ active$ }) => (active$ ? `0 0 0 1px var(${UI.COLOR_PRIMARY_OPACITY_10}) inset` : 'none')};
  cursor: pointer;
  transition:
    border 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    border-color: var(${UI.COLOR_PRIMARY_OPACITY_70});
  }
`

export const ChainInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

export const ChainLogo = styled.div`
  --size: 28px;
  width: var(--size);
  height: var(--size);
  border-radius: var(--size);
  overflow: hidden;
  background: var(${UI.COLOR_PAPER});
  display: flex;
  align-items: center;
  justify-content: center;

  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const ChainText = styled.span`
  font-weight: 500;
  font-size: 15px;
  color: var(${UI.COLOR_TEXT});
`

export const ActiveIcon = styled.span`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(${UI.COLOR_PRIMARY});

  > svg {
    width: 16px;
    height: 16px;
    display: block;
  }

  > svg > path {
    fill: currentColor;
  }
`

export const LoadingRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 14px;
  border-radius: 18px;
  border: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
`

export const LoadingCircle = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  ${({ theme }) => theme.shimmer};
`

export const LoadingBar = styled.div`
  flex: 1;
  height: 14px;
  border-radius: 8px;
  ${({ theme }) => theme.shimmer};
`
