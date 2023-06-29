import styled from 'styled-components/macro'

import { MarkdownPage } from 'legacy/components/Markdown'

import { PageTitle } from 'modules/application/containers/PageTitle'
import { BackToTopStyle } from 'modules/application/pure/Page'

import contentFile from './TermsAndConditions.md'

const Wrapper = styled(MarkdownPage)`
  ${BackToTopStyle}
`

export default function TermsAndConditions() {
  return (
    <>
      <PageTitle title="Terms and conditions" />
      <Wrapper contentFile={contentFile} />
    </>
  )
}
