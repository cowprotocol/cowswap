import contentFile from './PrivacyPolicy.md'
import { MarkdownPage } from 'components/Markdown'
import { GdocsListStyle } from 'cow-react/modules/application/dumb/Page'
import styled from 'styled-components/macro'
import { PageTitle } from 'cow-react/modules/application/containers/PageTitle'

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
