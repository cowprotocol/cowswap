import contentFile from './PrivacyPolicy.md'
import { MarkdownPage } from 'legacy/components/Markdown'
import { GdocsListStyle } from 'modules/application/pure/Page'
import styled from 'styled-components/macro'
import { PageTitle } from 'modules/application/containers/PageTitle'

const Wrapper = styled(MarkdownPage)`
  ${GdocsListStyle}
`

export default function PrivacyPolicy() {
  return (
    <>
      <PageTitle title="Privacy Policy" />
      <Wrapper contentFile={contentFile} />
    </>
  )
}
