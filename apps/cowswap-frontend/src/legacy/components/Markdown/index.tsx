import { ReactNode, useCallback, useState } from 'react'

import { useFetchFile } from '@cowprotocol/common-hooks'
import { Loader } from '@cowprotocol/ui'

import ReactMarkdown, { Components } from 'react-markdown'
import { useLocation } from 'react-router'
import remarkGfm from 'remark-gfm'
import { WithClassName } from 'types'

import { Page, Title, Content } from 'modules/application/pure/Page'

import { scrollToElement } from 'common/utils/scrollToElement'

import { BackToTopButton } from './BackToTopButton'
import { markdownComponents } from './components'
import { ContentHeading, deriveHeading } from './utils'

import { LinkScrollable } from '../Link'
import { PageWithToC } from '../PageWithToC'
import { SideMenu } from '../SideMenu'

interface MarkdownParams extends WithClassName {
  contentFile: string
  title?: ReactNode
}

export function MarkdownPage({ contentFile, title, className }: MarkdownParams) {
  const { error, file } = useFetchFile(contentFile)
  const [contentHeadings, setContentHeadings] = useState<ContentHeading[] | null>(null)
  const { hash } = useLocation()

  const ref = useCallback(
    (node: HTMLDivElement) => {
      if (node !== null) {
        setContentHeadings(deriveHeading(node, 'h2'))

        // Scroll to anchor if hash is present
        // Timeout is needed to wait for the content to be rendered
        setTimeout(() => {
          const anchor = document.getElementById(hash.slice(1))

          if (anchor) {
            scrollToElement(anchor)
          }
        }, 100)
      } else {
        setContentHeadings([])
      }
    },
    [hash]
  )

  return (
    <PageWithToC longList={true}>
      {contentHeadings === null && <Loader />}
      <SideMenu longList={true}>
        <ul>
          {contentHeadings?.map(({ id, title }) => {
            return (
              <li>
                <LinkScrollable href={'#' + id}>{title}</LinkScrollable>
              </li>
            )
          })}
        </ul>
      </SideMenu>

      <Page className={className}>
        {title && <Title>{title}</Title>}
        <Content>
          {file && <MarkdownContent contentRef={ref}>{file}</MarkdownContent>}
          {error && <MarkdownContent contentRef={ref}>{error}</MarkdownContent>}
        </Content>
        <BackToTopButton />
      </Page>
    </PageWithToC>
  )
}

const MarkdownContent = (props: { contentRef: (node: HTMLDivElement) => void; children: string }) => {
  return (
    <div ref={props.contentRef}>
      <ReactMarkdown {...props} remarkPlugins={[remarkGfm]} components={markdownComponents as Components} />
    </div>
  )
}
