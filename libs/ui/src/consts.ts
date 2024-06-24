export const SAFE_COW_APP_LINK = 'https://app.safe.global/share/safe-app?appUrl=https%3A%2F%2Fswap.cow.fi&chain=eth'
export const LINK_GUIDE_ADD_CUSTOM_TOKEN = 'https://blog.cow.fi/how-to-add-custom-tokens-on-cow-swap-a72d677c78c0'
export const MY_ORDERS_ID = 'my-orders'

export const MEDIA_WIDTHS = {
  upToTiny: 320,
  upToExtraSmall: 500,
  upToSmall: 720,
  upToMedium: 960,
  upToLarge: 1280,
  upToLargeAlt: 1390,
  upToExtraLarge: 2560,
}

const getMediaQuery = (query: string, useMediaPrefix = true) => {
  return useMediaPrefix ? `@media ${query}` : query
}

export const Media = {
  upToTiny: (useMediaPrefix = true) => getMediaQuery(`(max-width: ${MEDIA_WIDTHS.upToTiny}px)`, useMediaPrefix),
  upToExtraSmall: (useMediaPrefix = true) =>
    getMediaQuery(`(max-width: ${MEDIA_WIDTHS.upToExtraSmall}px)`, useMediaPrefix),
  upToSmall: (useMediaPrefix = true) => getMediaQuery(`(max-width: ${MEDIA_WIDTHS.upToSmall}px)`, useMediaPrefix),
  MediumAndUp: (useMediaPrefix = true) => getMediaQuery(`(min-width: ${MEDIA_WIDTHS.upToSmall + 1}px)`, useMediaPrefix),
  isMediumOnly: (useMediaPrefix = true) =>
    getMediaQuery(
      `(min-width: ${MEDIA_WIDTHS.upToSmall + 1}px) and (max-width: ${MEDIA_WIDTHS.upToMedium}px)`,
      useMediaPrefix
    ),
  upToMedium: (useMediaPrefix = true) => getMediaQuery(`(max-width: ${MEDIA_WIDTHS.upToMedium}px)`, useMediaPrefix),
  isLargeOnly: (useMediaPrefix = true) =>
    getMediaQuery(
      `(min-width: ${MEDIA_WIDTHS.upToMedium + 1}px) and (max-width: ${MEDIA_WIDTHS.upToLarge}px)`,
      useMediaPrefix
    ),
  upToLarge: (useMediaPrefix = true) => getMediaQuery(`(max-width: ${MEDIA_WIDTHS.upToLarge}px)`, useMediaPrefix),
  upToLargeAlt: (useMediaPrefix = true) => getMediaQuery(`(max-width: ${MEDIA_WIDTHS.upToLargeAlt}px)`, useMediaPrefix),
  LargeAndUp: (useMediaPrefix = true) => getMediaQuery(`(min-width: ${MEDIA_WIDTHS.upToLarge + 1}px)`, useMediaPrefix),
}

export const Font = {
  family: `'studiofeixen', Arial, sans-serif`,
  familySerif: `'studiofeixenserif', Arial, serif`,
  weight: {
    ultralight: 200,
    light: 300,
    regular: 400,
    book: 450,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
}

export const Color = {
  neutral100: '#FFFFFF',
  neutral98: '#FFF8F7',
  neutral95: '#FFEDEC',
  neutral90: '#F0DEDE',
  neutral80: '#D4C3C2',
  neutral70: '#B8A7A7',
  neutral60: '#9C8D8D',
  neutral50: '#827474',
  neutral40: '#685B5B',
  neutral30: '#504444',
  neutral20: '#382E2E',
  neutral10: '#23191A',
  neutral0: '#000000',
}
