import styled from 'styled-components/macro'

import { MarkdownPage } from 'legacy/components/Markdown'

import { PageTitle } from 'modules/application/containers/PageTitle'
import { GdocsListStyle } from 'modules/application/pure/Page'

import contentFile from './CookiePolicy.md'

const Wrapper = styled(MarkdownPage)`
  ${GdocsListStyle}
  ${({ theme }) => theme.colorScrollbar};
`

export default function CookiePolicy() {
  return (
    <>
      <PageTitle title="Cookie Policy" />
      <Wrapper contentFile={contentFile} />
    </>
  )
}
