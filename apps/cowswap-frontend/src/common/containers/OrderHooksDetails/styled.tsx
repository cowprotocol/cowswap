import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div<{ isOpen: boolean; margin?: string }>`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  width: 100%;
  border: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  border-radius: 16px;
  padding: 10px;
  height: auto;
  font-size: 13px;
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
  margin: ${({ margin }) => margin || '0'};
`

export const Summary = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 8px;
  font-size: inherit;
  font-weight: inherit;
`

export const Label = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`

export const ErrorLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(${UI.COLOR_DANGER_TEXT});
  background-color: var(${UI.COLOR_DANGER_BG});
  border-radius: 8px;
  margin-left: 4px;
  padding: 2px 6px;
`

export const Content = styled.div`
  display: flex;
  width: max-content;
  align-items: center;
  background-color: var(${UI.COLOR_PAPER_DARKER});
  border-radius: 12px;
  overflow: hidden;
  margin: 0 0 0 auto;
  cursor: pointer;
  transition: background-color var(${UI.ANIMATION_DURATION_SLOW}) ease-in-out;

  &:hover {
    background-color: var(${UI.COLOR_PRIMARY_OPACITY_10});
  }
`

export const ToggleButton = styled.div<{ isOpen: boolean }>`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 7px;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0.7)};
  transition: opacity ${UI.ANIMATION_DURATION_SLOW} ease-in-out;
  outline: none;
  font-size: inherit;
  font-weight: inherit;

  &:hover {
    opacity: 1;
  }
`

export const ToggleIcon = styled.div<{ isOpen: boolean }>`
  --size: 16px;
  transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform var(${UI.ANIMATION_DURATION_SLOW}) ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--size);
  height: var(--size);

  > svg {
    width: var(--size);
    height: var(--size);
    object-fit: contain;

    path {
      fill: var(${UI.COLOR_TEXT});
    }
  }
`

export const Details = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  margin: 10px 0 0;
`

export const InfoWrapper = styled.div`
  margin-bottom: 10px;

  h3 {
    font-size: 14px;
    margin: 1rem 0 0.5rem;
  }
`

export const HooksList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`

export const HookTag = styled.div<{ isPost?: boolean; addSeparator?: boolean }>`
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  padding: 2px 6px;
  font-size: 11px;
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
  display: flex;
  align-items: center;
  position: relative;
  gap: 4px;
  letter-spacing: 0.2px;

  > b {
    font-weight: var(${UI.FONT_WEIGHT_BOLD});
    color: var(${UI.COLOR_TEXT});
  }

  ${({ isPost }) =>
    isPost &&
    `
    padding-left: 6px;


  `}

  ${({ addSeparator }) =>
    addSeparator &&
    `
    padding-right: 10px;

    &::after {
      content: '';
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background-color: var(${UI.COLOR_PAPER});
      transform: skew(-10deg);
    }
  `}
`

export const CircleCount = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  background-color: var(${UI.COLOR_PAPER_DARKER});
  color: var(${UI.COLOR_TEXT});
  font-size: 12px;
  font-weight: var(${UI.FONT_WEIGHT_BOLD});
  margin: 0;
`

export const Spinner = styled.div`
  border: 5px solid transparent;
  border-top-color: ${`var(${UI.COLOR_PRIMARY_LIGHTER})`};
  border-radius: 50%;
  width: 12px;
  height: 12px;
  animation: spin 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`
