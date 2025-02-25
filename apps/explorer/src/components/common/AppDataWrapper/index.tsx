import { Color } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

const AppDataWrapper = styled.div`
  .json-formatter {
    word-break: break-all;
    line-height: 1.5;
    overflow: auto;
    border: 1px solid ${Color.explorer_tableRowBorder};
    padding: 0.75rem;
    background: ${Color.explorer_tableRowBorder};
    border-radius: 0.5rem;
    white-space: pre-wrap;

    ::-webkit-scrollbar {
      width: 8px !important;
      height: 8px !important;
    }
    ::-webkit-scrollbar-thumb {
      background: ${Color.explorer_bgOpaque};
      border-radius: 4px;
    }
    ::-webkit-scrollbar-track {
      background-color: ${Color.explorer_bgOpaque};
    }
  }
`

export default AppDataWrapper
