import { AppendImportSectionParams, TokenSearchRow } from './types'

export function appendImportSection(rows: TokenSearchRow[], params: AppendImportSectionParams): void {
  const { tokens, section, limit, sectionTitle, tooltip, shadowed, wrapperId } = params

  if (!tokens?.length) {
    return
  }

  if (sectionTitle) {
    rows.push({ type: 'section-title', text: sectionTitle, tooltip })
  }

  const limitedTokens = tokens.slice(0, limit)

  limitedTokens.forEach((token, index) => {
    rows.push({
      type: 'import-token',
      token,
      section,
      shadowed,
      isFirstInSection: index === 0,
      isLastInSection: index === limitedTokens.length - 1,
      wrapperId: index === 0 ? wrapperId : undefined,
    })
  })
}
