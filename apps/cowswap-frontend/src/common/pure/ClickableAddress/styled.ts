import { Link } from 'react-router-dom'
import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  &:hover {
    .clickable-address-copy-to-clipboard {
      opacity: 0.9;
    }
  }
`

export const AddressWrapper = styled(Link)`
  margin-left: 4px;
  font-size: 12px;
  font-weight: 400;
  color: inherit;
  opacity: 0.6;
  text-decoration: none;
  transition: opacity 0.2s ease-in-out;

  &:hover {
    opacity: 0.9;
    text-decoration: underline;
  }
`
