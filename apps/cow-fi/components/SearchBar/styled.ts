import { Font, Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const SearchBarContainer = styled.div`
  width: 100%;
  max-width: 970px;
  margin: 0 auto;
  position: relative;

  ${Media.upToMedium()} {
    padding: 0 16px;
  }
`

export const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`

export const SearchIcon = styled.div`
  position: absolute;
  left: 24px;
  width: 24px;
  height: 24px;
  color: var(${UI.COLOR_NEUTRAL_70});

  ${Media.upToMedium()} {
    left: 16px;
  }
`

export const Input = styled.input`
  padding: 16px 64px 16px 64px;
  min-height: 56px;
  border: 2px solid transparent;
  font-size: 21px;
  color: var(${UI.COLOR_NEUTRAL_40});
  width: 100%;
  background: var(${UI.COLOR_NEUTRAL_90});
  border-radius: 56px;
  appearance: none;
  font-weight: ${Font.weight.medium};
  transition: border 0.2s ease-in-out;

  ${Media.upToMedium()} {
    font-size: 18px;
    padding: 16px 50px 16px 50px;
  }

  &:focus {
    outline: none;
    border: 2px solid var(${UI.COLOR_NEUTRAL_50});
  }

  &::placeholder {
    color: inherit;
    transition: color 0.2s ease-in-out;
  }

  &:focus::placeholder {
    color: transparent;
  }
`

export const SearchResults = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  width: 100%;
  max-width: 970px;
  max-height: 300px;
  overflow: hidden;
  background: var(${UI.COLOR_NEUTRAL_98});
  border-radius: 24px;
  padding: 10px 0 10px 10px;
  border: 1px solid var(${UI.COLOR_NEUTRAL_80});
  font-size: 15px;
  z-index: 10;

  ${Media.upToMedium()} {
    left: 16px;
    max-width: calc(100% - 32px);
  }
`

export const SearchResultsInner = styled.div`
  max-height: 280px;
  overflow-y: auto;
  padding: 0 10px 54px 0;

  /* Firefox scrollbar styling */
  @supports (scrollbar-width: thin) {
    scrollbar-width: thin;
    scrollbar-color: var(${UI.COLOR_NEUTRAL_70}) var(${UI.COLOR_NEUTRAL_90});
  }

  @supports (-webkit-appearance: none) {
    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background-color: var(${UI.COLOR_NEUTRAL_90});
      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: var(${UI.COLOR_NEUTRAL_70});
      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background-color: var(${UI.COLOR_NEUTRAL_50});
    }

    &::-webkit-scrollbar-button {
      display: none;
    }

    &::-webkit-scrollbar-corner {
      background-color: transparent;
    }
  }

  @supports (-webkit-overflow-scrolling: touch) {
    -webkit-overflow-scrolling: touch; /* Enables momentum scrolling on iOS */

    &::-webkit-scrollbar {
      -webkit-appearance: none;
      width: 7px;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 4px;
      background-color: var(${UI.COLOR_NEUTRAL_70});
      -webkit-box-shadow: 0 0 1px rgba(255, 255, 255, 0.5);
    }
  }
`

export const ResultItem = styled.a<{ isSelected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  text-decoration: none;
  color: var(${UI.COLOR_NEUTRAL_0});
  line-height: 1.2;
  padding: 10px;
  background: ${({ isSelected }) => (isSelected ? `var(${UI.COLOR_NEUTRAL_80})` : 'transparent')};
  border-radius: ${({ isSelected }) => (isSelected ? '24px' : '0')};

  &:hover {
    background: var(${UI.COLOR_NEUTRAL_80});
    border-radius: 24px;
  }

  &:active {
    color: var(${UI.COLOR_NEUTRAL_0});
  }
`

export const ResultTitle = styled.div`
  font-weight: ${Font.weight.medium};
  margin-bottom: 4px;
  white-space: pre-wrap;
`

export const ResultDescription = styled.div`
  font-size: 12px;
  color: var(${UI.COLOR_NEUTRAL_40});
  white-space: pre-wrap;
  overflow: hidden;
  line-height: 1.5;

  /* Add prefixed properties for broader browser support */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  /* Standard properties for future browser support */
  line-clamp: 2;
  box-orient: vertical;
`

export const SearchResultsInfo = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 12px;
  color: var(${UI.COLOR_NEUTRAL_50});
  padding: 10px;
`

// Added loading indicator styles
export const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(${UI.COLOR_NEUTRAL_50});
  padding: 10px;

  &::after {
    content: '';
    width: 16px;
    height: 16px;
    margin-left: 8px;
    border: 2px solid var(${UI.COLOR_NEUTRAL_80});
    border-top-color: var(${UI.COLOR_NEUTRAL_50});
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`

// Added error message styles
export const ErrorMessage = styled(SearchResultsInfo)`
  color: #e74c3c;
`

export const CloseIcon = styled.div`
  --size: 32px;
  position: absolute;
  top: 50%;
  right: 24px;
  transform: translateY(-50%);
  cursor: pointer;
  background: var(${UI.COLOR_NEUTRAL_90});
  color: var(${UI.COLOR_NEUTRAL_60});
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--size);
  height: var(--size);
  border-radius: var(--size);

  ${Media.upToMedium()} {
    --size: 28px;
    right: 28px;
  }

  &:hover {
    background: var(${UI.COLOR_NEUTRAL_80});
  }

  > svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }
`
