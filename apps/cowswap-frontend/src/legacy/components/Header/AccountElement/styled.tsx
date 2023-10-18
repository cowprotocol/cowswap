import { transparentize } from 'polished'
import { Text } from 'rebass'
import styled from 'styled-components/macro'

export const BalanceText = styled(Text)`
  font-weight: 500;
  font-size: 13px;
  padding: 0 6px 0 12px;
  min-width: initial;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    overflow: hidden;
    max-width: 100px;
    text-overflow: ellipsis;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`

export const Wrapper = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme, active }) => (!active ? theme.bg1 : theme.bg3)};
  white-space: nowrap;
  cursor: pointer;
  background-color: ${({ theme, active }) => (!active ? theme.bg1 : theme.bg1)};
  border-radius: 21px;
  border: 2px solid transparent;
  transition: border 0.2s ease-in-out;
  pointer-events: auto;
  width: auto;

  :focus {
    border: 1px solid blue;
  }

  &:hover {
    border: 2px solid ${({ theme }) => transparentize(0.7, theme.text1)};
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    height: 100%;
  `}

  ${({ theme }) =>
    theme.isInjectedWidgetMode &&
    `
    margin: 0 20px 0 auto!important;
    border: 0!important;
  `}
`
