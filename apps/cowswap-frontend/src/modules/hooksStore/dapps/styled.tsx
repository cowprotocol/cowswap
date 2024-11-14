import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  padding: 10px;
  justify-content: flex-end;
  flex: 1 1 auto;
  gap: 10px;
  font-size: 14px;
`

export const ContentWrapper = styled.div<{ minHeight?: number }>`
  flex-flow: column wrap;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  text-align: center;
  gap: 10px;
  flex: 1 1 auto;
  color: var(${UI.COLOR_TEXT});
  font-size: inherit;
  min-height: ${({ minHeight }) => (minHeight ? `${minHeight}px` : 'initial')};
`

export const Row = styled.div`
  position: relative;
  margin: 0;
  gap: 10px;
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  max-width: 100%;
  align-items: flex-start;
  font-size: inherit;

  input,
  textarea {
    width: 100%;
    padding: 14px 16px;
    border: 1px solid transparent;
    border-radius: 16px;
    font-size: 16px;
    background: var(${UI.COLOR_PAPER_DARKER});
    color: inherit;
    position: relative;
    resize: none;

    &::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: var(${UI.COLOR_TEXT_OPACITY_50});
      border-radius: 10px;
    }

    &::-webkit-scrollbar-track {
      background-color: var(${UI.COLOR_TEXT_OPACITY_10});
      border-radius: 10px;
    }

    &::placeholder {
      color: transparent;
    }

    &:focus,
    &:not(:placeholder-shown) {
      border-color: var(${UI.COLOR_TEXT_OPACITY_25});
      outline: none;
    }

    &:focus + label,
    &:not(:placeholder-shown) + label {
      top: 0;
      font-size: 12px;
      background-color: var(${UI.COLOR_PAPER_DARKER});
      padding: 2px 6px;
      opacity: 1;
      border-radius: 8px;
      color: var(${UI.COLOR_TEXT});
    }

    &.error {
      border-color: var(${UI.COLOR_DANGER});
    }

    ::-webkit-outer-spin-button,
    ::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }
  }

  label {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 16px;
    color: inherit;
    opacity: 0.7;
    pointer-events: none;
    transition: all 0.15s ease;
    padding: 0 5px;
    background-color: transparent;

    &.error {
      color: var(${UI.COLOR_DANGER});
    }
  }
`

export const Text = styled.span<{ margin?: string; fontSize?: string; fontWeight?: string; color?: string }>`
  color: ${({ color }) => color || `var(${UI.COLOR_TEXT})`};
  margin: ${({ margin }) => margin || '0'};
  display: inline-block;
  font-size: ${({ fontSize }) => fontSize || 'inherit'};
  font-weight: ${({ fontWeight }) => fontWeight || 'normal'};
`

export const LoadingLabel = styled.div`
  color: var(${UI.COLOR_TEXT_OPACITY_50});
`

export const ErrorText = styled.span`
  color: var(${UI.COLOR_DANGER});
  font-size: inherit;
  margin: -12px 0 16px 0;
  text-align: left;
  width: 100%;
  font-size: inherit;
`
