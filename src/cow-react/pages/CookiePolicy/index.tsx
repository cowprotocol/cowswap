import contentFile from './CookiePolicy.md'
import { MarkdownPage } from 'components/Markdown'
import { GdocsListStyle } from '@cow/modules/application/pure/Page'
import styled from 'styled-components/macro'

const Wrapper = styled(MarkdownPage)`
  ${GdocsListStyle}
  ${({ theme }) => theme.colorScrollbar};

  #table-container {
    overflow-x: scroll;

    > table {
      min-width: 800px;

      thead, tr:nth-child(even) {
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
    }
  }
`

export default function CookiePolicy() {
  return <Wrapper contentFile={contentFile} />
}
