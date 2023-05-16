import styled from 'styled-components/macro'
import { transparentize } from 'polished'
import { MenuButton, MenuItem, MenuList } from '@reach/menu-button'

export const Label = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => transparentize(0.3, theme.text1)};
`

export const Current = styled(MenuButton)<{ $custom?: boolean }>`
  color: ${({ theme }) => theme.text1};
  font-size: ${({ $custom }) => ($custom ? '14px' : '100%')};
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
    margin-right: 5px;
  }

  > svg {
    width: 20px;
    height: 20px;
  }
`

export const ListWrapper = styled(MenuList)`
  display: block;
  background: ${({ theme }) => theme.bg1};
  box-shadow: ${({ theme }) => theme.boxShadow2};
  margin: 15px 0 0 0;
  border-radius: 20px;
  outline: none;
  list-style: none;
  position: relative;
  z-index: 2;
  min-width: 120px;
  padding: 0.4rem;
`

export const ListItem = styled(MenuItem)`
  color: ${({ theme }) => theme.text1};
  background: none;
  border: 0;
  outline: none;
  padding: 0.4rem 1.2rem;
  cursor: pointer;
  font-size: 14px;
  font-weight: 400;
  position: relative;
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.2s ease-in;

  :hover {
    background: ${({ theme }) => theme.bg3};
  }
`

export const LabelWrapper = styled.div`
  display: flex;
  align-items: center;
`

export const Selector = styled.div`
  padding: 0.5rem 1rem;
  display: flex;
  justify-content: space-between;
  flex-basis: 50%;
`
