import styled from 'styled-components/macro'
import { Media } from '@cowprotocol/ui'

const AppDataWrapper = styled.div`
  display: flex;
  flex-direction: column;
  .json-formatter {
    word-break: break-all;
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
  .data-container {
    margin-right: 0.75rem;
    word-break: break-all;
    display: flex;
    flex-direction: column;
    .app-data {
      color: ${({ theme }): string => theme.orange1};
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
