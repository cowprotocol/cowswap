/** The `MEDIA_WIDTHS` of `libs/ui/src/consts.ts` that this app reads from JS, which can't import that lib */
export const MEDIA_QUERIES = {
  upToTiny: '(max-width: 320px)',
  upToSmall: '(max-width: 720px)',
  upToMedium: '(max-width: 960px)',
  upToLarge: '(max-width: 1280px)',
} as const
