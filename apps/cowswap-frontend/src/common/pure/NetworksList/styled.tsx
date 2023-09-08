import { transparentize } from 'polished'
import { ArrowDownCircle } from 'react-feather'
import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'

export const ActiveRowWrapper = styled.div`
  background-color: ${({ theme }) => transparentize(0.4, theme.bg4)};
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  padding: 8px;
`

export const ActiveRowLinkList = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 8px;

  & > a {
    align-items: center;
    color: var(${UI.COLOR_TEXT1});
    display: flex;
    flex-direction: row;
    font-size: 14px;
    font-weight: 500;
    justify-content: space-between;
    padding: 8px 0 4px 6px;
    text-decoration: none;
  }

  & > a:first-child {
    margin: 0;
    margin-top: 0px;
    padding-top: 10px;
  }
`
export const LinkOutCircle = styled(ArrowDownCircle)`
  transform: rotate(230deg);
  width: 16px;
  height: 16px;
`
export const FlyoutRow = styled.div<{ active: boolean }>`
  align-items: center;
  background-color: ${({ active, theme }) => (active ? theme.bg2 : 'transparent')};
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  font-weight: 500;
  justify-content: space-between;
  padding: 6px 8px;
  text-align: left;
  width: 100%;
  color: ${({ active, theme }) => (active ? theme.white : theme.text1)};

  &:hover {
    color: ${({ theme, active }) => !active && theme.text1};
    background: ${({ theme, active }) => !active && transparentize(0.9, theme.text1)};
  }

  transition: background 0.13s ease-in-out;
`
export const FlyoutRowActiveIndicator = styled.div<{ active: boolean }>`
  background-color: ${({ active, theme }) => (active ? theme.green1 : '#a7a7a7')};
  border-radius: 50%;
  height: 9px;
  width: 9px;
`
export const Logo = styled.img`
  width: 24px;
  height: 24px;
  margin-right: 8px;
`
export const NetworkLabel = styled.div`
  flex: 1 1 auto;
  margin: 0 auto 0 8px;
`
