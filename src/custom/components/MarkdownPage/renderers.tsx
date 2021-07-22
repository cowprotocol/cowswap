import React, { ReactNode } from 'react'
import visit from 'unist-util-visit'
import { Node as MarkdownNode } from 'unist'

const constructId = (text: string): string => text.toLowerCase().replace(/\W/g, '-')

const getTextFromMarkdownNode = (node: MarkdownNode): string => {
  let text = ''
  // get all text nodes
  // for heading, most of the time there will be only one child text node
  // but can be `## heading text <span>span text</span> **bold text**`
  // =4 nodes (space is a text node)
  visit(node, 'text', (textNode) => {
    text += textNode.value || ''
  })

  return text
}
interface HeadingProps {
  level: number
  children: ReactNode
  node: MarkdownNode & { type: 'heading' }
}
export function HeadingRenderer({ level, children, node }: HeadingProps): JSX.Element {
  // traverse markdown syntax tree node
  // and get text
  const nodeText = getTextFromMarkdownNode(node)
  const id = constructId(nodeText)

  const HComp = ('h' + level) as keyof JSX.IntrinsicElements
  return <HComp id={id}>{children}</HComp>
}
