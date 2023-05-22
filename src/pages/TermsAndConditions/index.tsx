import contentFile from './TermsAndConditions.md'
import { MarkdownPage } from 'legacy/components/Markdown'
import { PageTitle } from 'modules/application/containers/PageTitle'
import styled from 'styled-components/macro'
import { BackToTopStyle } from 'modules/application/pure/Page'

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
