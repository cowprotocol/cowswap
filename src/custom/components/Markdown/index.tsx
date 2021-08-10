import React, { ReactNode } from 'react'
import ReactMarkdownHtml from 'react-markdown/with-html'
import ReactMarkdown, { ReactMarkdownPropsBase } from 'react-markdown'
import useFetchFile from 'hooks/useFetchFile'
import { HeadingRenderer, LinkScrollable, Link } from './renderers'
import Page, { Title, Content } from 'components/Page'
import styled from 'styled-components'
import { WithClassName } from 'types'
import {} from 'comp'

interface MarkdownParams extends WithClassName {
  contentFile: string
  title?: ReactNode
}

export const Wrapper = styled(Page)``

export function Markdown(props: { children?: string }) {
  const { children = '' } = props
  return <ReactMarkdown renderers={{ link: Link }}>{children}</ReactMarkdown>
}

const CustomMarkdownContent = (props: ReactMarkdownPropsBase & { children: string }) => (
  <ReactMarkdownHtml {...props} renderers={{ heading: HeadingRenderer, link: LinkScrollable }} allowDangerousHtml />
)

export function MarkdownPage({ contentFile, title, className }: MarkdownParams) {
  const { error, file } = useFetchFile(contentFile)
  return (
    <Wrapper className={className}>
      {title && <Title>{title}</Title>}
      <Content>
        {file && <CustomMarkdownContent>{file}</CustomMarkdownContent>}
        {error && <CustomMarkdownContent>{error}</CustomMarkdownContent>}
      </Content>
    </Wrapper>
  )
}
