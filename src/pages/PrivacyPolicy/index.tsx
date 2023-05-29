import styled from 'styled-components/macro'

import { MarkdownPage } from 'legacy/components/Markdown'

import { PageTitle } from 'modules/application/containers/PageTitle'
import { GdocsListStyle } from 'modules/application/pure/Page'

import contentFile from './PrivacyPolicy.md'

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
