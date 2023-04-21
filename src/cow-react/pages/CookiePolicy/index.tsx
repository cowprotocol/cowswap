import contentFile from './CookiePolicy.md'
import { MarkdownPage } from 'components/Markdown'
import { GdocsListStyle } from '@cow/modules/application/pure/Page'
import styled from 'styled-components/macro'
import { PageTitle } from '@cow/modules/application/containers/PageTitle'

const Wrapper = styled(MarkdownPage)`
  ${GdocsListStyle}
  ${({ theme }) => theme.colorScrollbar};

  #table-container {
    margin: auto;
    max-width: 100%;
    overflow-x: scroll;

    > table {
      width: 100%;
      min-width: 800px;
      border-spacing: 1px;
      color: ${({ theme }) => theme.text1};

      > thead {
        background: ${({ theme }) => theme.bg3};
      }

      > tbody > tr {
        background: ${({ theme }) => theme.grey1};
      }

      > tbody > tr > td > span[role='img'] {
        font-size: 18px;
      }

      th,
      td {
        min-width: 200px;
        text-align: left;
        padding: 6px 12px;

        &:not(:first-child) {
          text-align: center;
        }
      }

      th {
        padding: 16px 12px;
      }

      ${({ theme }) => theme.mediaWidth.upToSmall`
      td:first-child {
        max-width: 70px;
        word-break: break-all;
      }
    `};
    }
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
