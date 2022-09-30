import contentFile from './TermsAndConditions.md'
import { MarkdownPage } from 'components/Markdown'
import { PageTitle } from 'cow-react/modules/application/containers/PageTitle'

export default function TermsAndConditions() {
  return (
    <>
      <PageTitle title="ToC" />
      <MarkdownPage contentFile={contentFile} />
    </>
  )
}
