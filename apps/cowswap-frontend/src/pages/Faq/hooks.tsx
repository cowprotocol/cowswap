import { useCallback, useState } from 'react'

import { TocSection, TocItem } from '.'

function getToc(node: HTMLDivElement) {
  const headingNodes = node.querySelectorAll('h2,h3')

  const tocSections: TocSection[] = []
  let items: TocItem[] = []
  let lastH2: TocItem | undefined = undefined

  const addNewSection = () => {
    if (lastH2 !== undefined) {
      tocSections.push({
        section: lastH2,
        items,
      })
      items = []
    }
  }

  headingNodes.forEach((entry) => {
    if (entry.tagName === 'H2') {
      // If H2
      addNewSection()
      lastH2 = {
        id: entry.id,
        label: entry.innerHTML,
      }
    } else {
      // If H3
      items.push({
        id: entry.id,
        label: entry.innerHTML,
      })
    }
  })

  addNewSection()

  return tocSections
}

interface UseTocParams {
  faqRef: (node: HTMLDivElement) => void
  toc: TocSection[]
}

export function useToC(): UseTocParams {
  const [toc, setToc] = useState<TocSection[]>([])

  const faqRef = useCallback((node: HTMLDivElement) => {
    if (node !== null) {
      const tocSections = getToc(node)
      setToc(tocSections)
    }
  }, [])

  return { toc, faqRef }
}
