import { Media, UI } from '@cowprotocol/ui'

import { Search } from 'react-feather'
import styled from 'styled-components/macro'

import { CloseIcon } from 'common/pure/CloseIcon'

export const SearchInputContainer = styled.div`
  margin: 0;
  padding: 0 0 0 8px;
  position: relative;

  ${Media.upToMedium()} {
    padding: 0;
  }
`

export const SearchIcon = styled(Search)`
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: var(${UI.COLOR_TEXT_OPACITY_50});
  width: 16px;
  height: 16px;

  ${Media.upToMedium()} {
    left: 10px;
  }
`

export const StyledCloseIcon = styled(CloseIcon)`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;

  > svg {
    width: 100%;
    height: 100%;
  }
`

export const SearchInput = styled.input`
  width: 100%;
  padding: 8px 30px;
  border: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  background: var(${UI.COLOR_PAPER});
  color: var(${UI.COLOR_TEXT});
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  min-height: 36px;

  ${Media.upToMedium()} {
    padding: 8px 32px;
    border-radius: 12px;
  }

  &::placeholder {
    color: var(${UI.COLOR_TEXT_OPACITY_50});
  }

  &:focus {
    outline: none;
    border-color: var(${UI.COLOR_TEXT_OPACITY_50});
  }

  // iOS-specific zoom prevention
  @supports (-webkit-touch-callout: none) {
    &:hover,
    &:active {
      font-size: 16px;
    }
  }
`
