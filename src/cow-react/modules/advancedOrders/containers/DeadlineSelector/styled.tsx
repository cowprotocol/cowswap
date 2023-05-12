import styled from 'styled-components/macro'
import { transparentize } from 'polished'
import { MenuButton, MenuItem, MenuList } from '@reach/menu-button'

export const Wrapper = styled.div`
  background: ${({ theme }) => theme.grey1};
  border-radius: 16px;
  padding: 10px 16px;
  min-height: 50px;
  justify-content: space-between;
  display: flex;
  flex-flow: row wrap;

  > span {
    flex: 1;
  }

  > button {
    width: auto;
  }
`

export const Label = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 500;
  width: 100%;
  color: ${({ theme }) => transparentize(0.3, theme.text1)};
`

export const Current = styled(MenuButton)<{ $custom?: boolean }>`
  color: ${({ theme }) => theme.text1};
  font-size: ${({ $custom }) => ($custom ? '12px' : '100%')};
  letter-spacing: ${({ $custom }) => ($custom ? '-0.3px' : '0')};
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: none;
  border: 0;
  outline: none;
  margin: 0;
  padding: 0;
  white-space: nowrap;
  cursor: pointer;
  width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 21px;
  `}

  &:hover {
    text-decoration: underline;
  }

  > span {
    display: inline-block;
  }

  > svg {
    margin: 0 0 0 auto;
  }
`

export const ListWrapper = styled(MenuList)`
  display: block;
  background: ${({ theme }) => theme.bg1};
  box-shadow: ${({ theme }) => theme.boxShadow2};
  margin: 15px 0 0 0;
  padding: 10px 15px;
  border-radius: 20px;
  outline: none;
  list-style: none;
  position: relative;
  z-index: 2;
  min-width: 120px;
`

export const ListItem = styled(MenuItem)`
  color: ${({ theme }) => theme.text1};
  background: none;
  border: 0;
  outline: none;
  margin: 0 0 10px 0;
  padding: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 400;
  position: relative;

  :hover {
    text-decoration: underline;
  }
`

export const LabelWrapper = styled.div`
  display: flex;
  align-items: center;
`
