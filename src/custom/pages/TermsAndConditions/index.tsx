import contentFile from './TermsAndConditions.md'
import { MarkdownPage } from 'components/Markdown'

import { Helmet } from 'react-helmet'
import { APP_TITLE } from 'constants/index'

export default function TermsAndConditions() {
  return (
    <>
      <Helmet>
        <title>ToC - {APP_TITLE}</title>
      </Helmet>
      <MarkdownPage contentFile={contentFile} />
    </>
  )
}
