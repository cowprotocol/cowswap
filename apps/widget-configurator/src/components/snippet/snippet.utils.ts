import type { CSSProperties } from 'react'

type SyntaxHighlighterStyle = Record<string, CSSProperties>

/** Applies the app surface background while keeping token colors from the hljs theme. */
export function withPaperBackground(
  baseStyle: SyntaxHighlighterStyle,
  paperBackground: string,
): SyntaxHighlighterStyle {
  return {
    ...baseStyle,
    hljs: {
      ...baseStyle.hljs,
      background: paperBackground,
      backgroundColor: paperBackground,
    },
  }
}
