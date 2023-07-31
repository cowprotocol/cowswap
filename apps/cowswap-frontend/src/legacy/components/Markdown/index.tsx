import { ReactNode } from 'react'

import ReactMarkdown, { ReactMarkdownPropsBase } from 'react-markdown'
import ReactMarkdownHtml from 'react-markdown/with-html'
import styled from 'styled-components/macro'
import { WithClassName } from 'types'

// AmplitudeAnalytics
import { PageName } from 'legacy/components/AmplitudeAnalytics/constants'
import { Trace } from 'legacy/components/AmplitudeAnalytics/Trace'
import { LinkScrollable, Link } from 'legacy/components/Link'
import useFetchFile from 'legacy/hooks/useFetchFile'

import { Page, Title, Content } from 'modules/application/pure/Page'

import { HeadingRenderer } from './renderers'

interface MarkdownParams extends WithClassName {
  contentFile: string
  title?: ReactNode
}

export const Wrapper = styled(Page)``

export function Markdown(props: { children?: string }) {
  const { children = '' } = props
  return <ReactMarkdown renderers={{ link: Link }}>{children}</ReactMarkdown>
}

const MarkdownContent = (props: ReactMarkdownPropsBase & { children: string }) => (
  <ReactMarkdownHtml {...props} renderers={{ heading: HeadingRenderer, link: LinkScrollable }} allowDangerousHtml />
)

export function MarkdownPage({ contentFile, title, className }: MarkdownParams) {
  const { error, file } = useFetchFile(contentFile)
  return (
    <Trace page={PageName.TOC_PAGE} shouldLogImpression>
      <Wrapper className={className}>
        {title && <Title>{title}</Title>}
        <Content>
          {file && <MarkdownContent>{file}</MarkdownContent>}
          {error && <MarkdownContent>{error}</MarkdownContent>}
        </Content>
      </Wrapper>
    </Trace>
  )
}
