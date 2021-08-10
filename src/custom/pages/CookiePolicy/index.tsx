import React from 'react'
import contentFile from './CookiePolicy.md'
import { MarkdownPage } from 'components/Markdown'
import { GdocsListStyle } from 'components/Page'
import styled from 'styled-components'

const Wrapper = styled(MarkdownPage)`
  ${GdocsListStyle}

  #table-container {
    overflow-x: scroll;

    > table {
      min-width: 800px;

      thead, tr:nth-child(even) {
        background: ${({ theme }) => theme.bg2};
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
