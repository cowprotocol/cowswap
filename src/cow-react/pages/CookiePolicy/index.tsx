import contentFile from './CookiePolicy.md'
import { MarkdownPage } from 'components/Markdown'
import { GdocsListStyle } from '@cow/modules/application/pure/Page'
import styled from 'styled-components/macro'
import { PageTitle } from '@cow/modules/application/containers/PageTitle'

const Wrapper = styled(MarkdownPage)`
  ${GdocsListStyle}
  ${({ theme }) => theme.colorScrollbar};

  #table-container {
    overflow-x: scroll;

    > table {
      min-width: 800px;

      thead,
      tr:nth-child(even) {
        background: ${({ theme }) => theme.grey1};
        color: ${({ theme }) => theme.text2};
      }
    }

    th,
    td {
      min-width: 8.5rem;
      text-align: left;
      padding: 0.5rem 0.4rem;
    }

    ${({ theme }) => theme.mediaWidth.upToSmall`
      td:first-child {
        max-width: 100px;
        word-break: break-all;
      }
    `};
  }
`

export default function CookiePolicy() {
  return (
    <>
      <PageTitle title="Cookie Policy" />
      <Wrapper contentFile={contentFile} />
    </>
  )
}
