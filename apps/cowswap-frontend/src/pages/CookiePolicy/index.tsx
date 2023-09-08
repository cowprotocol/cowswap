import styled from 'styled-components/macro'

import { MarkdownPage } from 'legacy/components/Markdown'

import { PageTitle } from 'modules/application/containers/PageTitle'
import { GdocsListStyle } from 'modules/application/pure/Page'

import { UI } from 'common/constants/theme'

import contentFile from './CookiePolicy.md'

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
      color: var(${UI.COLOR_TEXT1});

      > thead {
        background: ${({ theme }) => theme.bg3};
      }

      > tbody > tr {
        background: var(${UI.COLOR_GREY});
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
