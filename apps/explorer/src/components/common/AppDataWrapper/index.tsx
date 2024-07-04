import { Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

const AppDataWrapper = styled.div`
  .json-formatter {
    word-break: break-all;
    line-height: 1.5;
    overflow: auto;
    border: 1px solid ${({ theme }): string => theme.tableRowBorder};
    padding: 0.75rem;
    background: ${({ theme }): string => theme.tableRowBorder};
    border-radius: 0.5rem;

    ::-webkit-scrollbar {
      width: 8px !important;
      height: 8px !important;
    }
    ::-webkit-scrollbar-thumb {
      background: hsla(0, 0%, 100%, 0.1);
      border-radius: 4px;
    }
    ::-webkit-scrollbar-track {
      background-color: rgba(0, 0, 0, 0.2);
    }
  }

  .hidden-content {
    margin-top: 10px;

    span div {
      ${Media.MediumAndUp()} {
        width: 95%;
      }
      ${Media.upToSmall()} {
        width: 78vw;
      }
      ${Media.upToExtraSmall()} {
        width: 70vw;
      }
    }
  }
`

export default AppDataWrapper
