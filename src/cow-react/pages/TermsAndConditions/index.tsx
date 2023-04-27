import contentFile from './TermsAndConditions.md'
import { MarkdownPage } from 'components/Markdown'
import { PageTitle } from '@cow/modules/application/containers/PageTitle'
import styled from 'styled-components/macro'
import { BackToTopStyle } from '@cow/modules/application/pure/Page'

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
