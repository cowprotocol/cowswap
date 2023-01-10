import styled from 'styled-components/macro'
import { transparentize } from 'polished'

export const Wrapper = styled.div`
  background: ${({ theme }) => theme.grey1};
  border-radius: 16px;
  padding: 10px 16px;
  min-height: 80px;
  justify-content: space-between;
  display: flex;
  flex-flow: row wrap;
`

export const Header = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 500;
  width: 100%;
  color: ${({ theme }) => transparentize(0.3, theme.text1)};
`

export const Current = styled.button<{ isCustom: boolean }>`
  color: ${({ theme }) => theme.text1};
  font-size: ${({ isCustom }) => (isCustom ? '12px' : '100%')};
  letter-spacing: ${({ isCustom }) => (isCustom ? '-0.3px' : '0')};
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

export const ListWrapper = styled.ul`
  display: block;
  background: ${({ theme }) => theme.bg1};
  box-shadow: ${({ theme }) => theme.boxShadow2};
  margin: 15px 0 0 0;
  padding: 10px 15px;
  border-radius: 20px;
  list-style: none;
`

export const ListItem = styled.button`
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

export const CustomInput = styled.input`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;

  ::-webkit-calendar-picker-indicator {
    position: absolute;
    width: 100%;
    height: 100%;
  }
`
