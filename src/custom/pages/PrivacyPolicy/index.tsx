import contentFile from './PrivacyPolicy.md'
import { MarkdownPage } from 'components/Markdown'
import { GdocsListStyle } from 'components/Page'
import styled from 'styled-components/macro'
import { Helmet } from 'react-helmet'
import { APP_TITLE } from 'constants/index'

const Wrapper = styled(MarkdownPage)`
  ${GdocsListStyle}
`

export default function PrivacyPolicy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - {APP_TITLE}</title>
      </Helmet>
      <Wrapper contentFile={contentFile} />
    </>
  )
}
