import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { CloseIcon as CloseIconOriginal } from 'common/pure/CloseIcon'

export const HookItemWrapper = styled.li`
  position: relative;
  display: flex;
  flex-direction: column;

  dl {
    background-color: var(${UI.COLOR_BACKGROUND});
    padding: 20px;
  }

  dd {
    color: var(${UI.COLOR_TEXT2});
    word-break: break-all;
  }

  img {
    width: 35px;
    height: 35px;
  }
`

export const HookItemInfo = styled.div`
  display: flex;
  flex-direction: row;
  padding: 0.5em;

  dl {
    margin: 0;
    padding: 0 1em;
    background-color: inherit;
  }

  dt {
    width: 6em;
  }

  dd {
    display: flex;
    align-items: center;
    padding: 0;

    img {
      width: 20px;
      vertical-align: middle;
      margin-right: 10px;
    }
  }

  dt,
  dd {
    float: left;
    margin: 5px;
  }

  dt {
    font-weight: bold;
    clear: left;
    margin-right: 5px;
  }
`

export const CustomLink = styled.a`
  margin: 0.5em 0;
  padding: 0 10em;
  text-decoration: none;

  :hover {
    text-decoration: underline;
  }
`

export const CloseIcon = styled(CloseIconOriginal)`
  position: absolute;
  top: 0;
  right: 0;
`
