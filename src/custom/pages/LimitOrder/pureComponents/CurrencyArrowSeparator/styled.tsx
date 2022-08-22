import styled from 'styled-components/macro'
import { ArrowDown } from 'react-feather'
import { loadingAnimationMixin } from './style-mixins'

export const Box = styled.div`
  cursor: pointer;
  margin: -12px auto;
  position: relative;
  z-index: 2;

  background: ${({ theme }) => theme.swap.arrowDown.background};
  width: ${({ theme }) => theme.swap.arrowDown.width};
  height: ${({ theme }) => theme.swap.arrowDown.height};
  border: ${({ theme }) => `${theme.swap.arrowDown.borderSize} solid ${theme.swap.arrowDown.borderColor}`};
  border-radius: ${({ theme }) => theme.swap.arrowDown.borderRadius};
`

export const LoadingWrapper = styled.div<{ isLoading: boolean }>`
  position: absolute;
  height: 100%;
  transform-style: preserve-3d;
  transform-origin: center right;
  transition: transform 0.25s;

  ${({ isLoading }) => isLoading && loadingAnimationMixin}
`

export const ArrowDownIcon = styled(ArrowDown)`
  stroke: ${({ theme }) => theme.swap.arrowDown.color};

  height: 75%;
  margin-top: 3px;
  margin-left: 1px;
`

export const CowImg = styled.img`
  width: 100%;
  border-radius: 10px;
  background-color: #ffffff;
`
