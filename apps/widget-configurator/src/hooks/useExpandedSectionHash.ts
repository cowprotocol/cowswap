import { useCallback, useEffect, useState } from 'react'

const ACCORDION_SECTION_TITLES = [
  'Basics',
  'Trade Setup',
  'Tokens',
  'Theme Colors',
  'Layout',
  'Behavior',
  'Deadlines',
  'Integrations',
  'Customization',
  'Advanced',
] as const

function accordionTitleToHash(title: string): string {
  return title.toLowerCase().replace(/\s+/g, '-')
}

function accordionHashToTitle(hash: string): string | null {
  const normalizedHash = hash.replace(/^#/, '').trim()
  if (!normalizedHash) return null

  return ACCORDION_SECTION_TITLES.find((title) => accordionTitleToHash(title) === normalizedHash) ?? null
}

function readExpandedSectionFromHash(): string | null {
  if (typeof window === 'undefined') return null

  return accordionHashToTitle(window.location.hash)
}

function writeExpandedSectionToHash(expandedSection: string | null): void {
  if (typeof window === 'undefined') return

  const nextHash = expandedSection ? `#${accordionTitleToHash(expandedSection)}` : ''
  const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`

  window.history.replaceState(null, '', nextUrl)
}

interface UseExpandedSectionHashResult {
  expandedSection: string | null
  handleToggleExpanded: (title: string) => (isExpanded: boolean) => void
}

export function useExpandedSectionHash(defaultSection: string | null = 'Basics'): UseExpandedSectionHashResult {
  const [expandedSection, setExpandedSection] = useState<string | null>(
    () => readExpandedSectionFromHash() ?? defaultSection,
  )

  useEffect(() => {
    const handleHashChange = (): void => {
      setExpandedSection(readExpandedSectionFromHash())
    }

    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  const handleToggleExpanded = useCallback(
    (title: string) =>
      (isExpanded: boolean): void => {
        const nextSection = isExpanded ? title : null

        setExpandedSection(nextSection)
        writeExpandedSectionToHash(nextSection)
      },
    [],
  )

  return { expandedSection, handleToggleExpanded }
}
