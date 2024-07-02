import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { Content } from 'modules/application/pure/Page'

export const PageWithToC = styled.div<{ longList?: boolean }>`
  display: grid;
  grid-template-columns: ${({ longList }) => (longList ? '280px auto' : '160px auto')};
  grid-template-rows: max-content;
  flex-direction: column;

  ${({ longList }) => (longList ? Media.upToMedium : Media.upToSmall)()} {
    width: 100%;
    display: flex;
    flex-flow: column wrap;
  }

  #table-container {
    margin: auto;
    max-width: 100%;
    overflow-x: scroll;

    > table {
      width: 100%;
      border-spacing: 1px;
      color: inherit;

      > thead {
        background: ${({ theme }) => theme.background};
      }

      > tbody > tr {
        background: var(${UI.COLOR_PAPER_DARKER});
      }

      > tbody > tr > td > span[role='img'] {
        font-size: 18px;
      }

      th,
      td {
        text-align: left;
        padding: 6px 12px;

        &:not(:first-child) {
          text-align: center;
        }
      }

      th {
        padding: 16px 12px;
      }
    }
  }

  > div:not(:first-child) {
    margin: 2rem 0;
  }

  ${Content} {
    > div > ul > li {
      margin: 0 0 12px;
    }

    > h3 {
      margin: 0;

      ::before {
        border-top: none;
      }
    }
  }

  ol > li {
    margin-bottom: 0.5rem;
  }
`
