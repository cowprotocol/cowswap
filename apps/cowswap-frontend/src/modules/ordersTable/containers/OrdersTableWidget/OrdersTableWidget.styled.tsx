import { Media, UI } from '@cowprotocol/ui'

import { Search, X } from 'react-feather'
import styled from 'styled-components/macro'

import {
  SelectContainer as OrdersTableSelectContainer,
  Select as OrdersTableSelect,
} from '../../pure/OrdersTabs/OrdersTabs.styled'

export const SearchInputContainer = styled.label`
  position: relative;
  margin: 0 0 0 8px;

  ${Media.upToMedium()} {
    margin 0;
  }
`

export const SearchIcon = styled(Search)`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translate(-50%, -50%);
  color: var(${UI.COLOR_TEXT_OPACITY_50});
  width: 16px;
  height: 16px;
`

export const StyledCloseIcon = styled(X)`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translate(50%, -50%);
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
  border-radius: 14px;
  font-size: 13px;
  font-weight: 500;
  min-height: 36px;
  min-width: 240px;

  ${Media.upToMedium()} {
    padding: 8px 32px;
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

export const SelectContainer = styled(OrdersTableSelectContainer)`
  display: block !important;
`

export const Select = styled(OrdersTableSelect)`
  min-width: 120px;
`
