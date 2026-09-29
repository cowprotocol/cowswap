import { UI } from '@cowprotocol/ui'

import { Link } from 'react-router'
import styled from 'styled-components/macro'

export const Wrapper = styled(Link).attrs({
  'data-hover-trigger': true,
})`
  width: 100%;
  display: grid;
  align-items: center;
  justify-content: center;
  grid-template-columns: min-content 1fr min-content;
  cursor: pointer;
  border-radius: 16px;
  gap: 16px;
  text-decoration: none;
  padding: 8px;
  transition: background 0.2s ease-out;

  &:hover {
    background: var(${UI.COLOR_PRIMARY_OPACITY_10});

    /* Only target ArrowIcon's path */
    > svg path {
      stroke: var(${UI.COLOR_TEXT});
    }
  }
`

export const AccountWrapper = styled.div`
  width: 100%;

  > h3,
  p {
    margin: 0;
    padding: 0;
  }

  > p {
    color: var(${UI.COLOR_TEXT_OPACITY_70});
  }
`

export const MiniContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: row;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  gap: 10px;
  position: relative;
`
