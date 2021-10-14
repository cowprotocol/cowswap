import contentFile from './TermsAndConditions.md'
import { MarkdownPage } from 'components/Markdown'

export default function TermsAndConditions() {
  return <MarkdownPage contentFile={contentFile} />
}
