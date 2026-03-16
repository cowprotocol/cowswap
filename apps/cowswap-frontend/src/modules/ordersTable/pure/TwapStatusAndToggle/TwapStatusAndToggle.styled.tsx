import { transparentize } from 'color2k'
import styled from 'styled-components/macro'

export const ToggleExpandButton = styled.div<{ isCollapsed?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 9px;
  width: 100%;
  height: 28px;

  background: linear-gradient(90deg, transparent 0%, ${({ theme }) => transparentize(theme.paper, 0.7)} 100%);
  background-size: 200% 100%;
  background-position: 100% 0;

  border: 1px solid ${({ theme }) => transparentize(theme.text, 0.8)};
  padding: 0 6px 0 10px;
  cursor: pointer;
  transition: background 0.5s ease-in-out;

  &:hover {
    animation: gradientMove 3s linear infinite;
  }

  @keyframes gradientMove {
    0% {
      background-position: 100% 0;
    }
    50% {
      background-position: 0 0;
    }
    100% {
      background-position: 100% 0;
    }
  }

  @keyframes changeOpacity {
    0% {
      background: linear-gradient(90deg, transparent 0%, ${({ theme }) => theme.paper} 100%);
    }
    50% {
      background: linear-gradient(90deg, transparent 0%, ${({ theme }) => transparentize(theme.paper, 0.1)} 100%);
    }
    100% {
      background: linear-gradient(90deg, transparent 0%, ${({ theme }) => transparentize(theme.paper, 0.5)} 100%);
    }
  }

  > i {
    font-style: normal;
    font-size: 12px;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  > button {
    --size: 17px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 0;
    padding: 0;
    margin: 0 0 0 6px;
    cursor: pointer;
    outline: none;
    color: inherit;
    transition: color 0.2s ease-out;
    position: relative;
    height: var(--height);
    transition: all 0.3s;
    width: var(--size);
    height: var(--size);
    min-width: var(--size);
    min-height: var(--size);
    line-height: 1;
    background: transparent;
    border: 1px solid ${({ theme }) => transparentize(theme.text, 0.8)};
    border-radius: 6px;
    user-select: none;
  }

  > button::before,
  > button::after {
    content: '';
    transform: rotate(0);
    top: 7px;
    inset-inline-end: 3px;
    inset-inline-start: 3px;
    height: 1px;
    position: absolute;
    background: currentcolor;
    transition: transform 0.5s ease-in-out;
  }

  > button::after {
    transform: ${({ isCollapsed }) => (isCollapsed ? 'rotate(90deg)' : 'rotate(0deg)')};
  }
`
