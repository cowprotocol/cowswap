import { MEDIA_WIDTHS } from '@cowprotocol/ui'

export const upToSmall = `(max-width: ${MEDIA_WIDTHS.upToSmall}px)`
export const upToExtraSmall = `(max-width: ${MEDIA_WIDTHS.upToExtraSmall}px)`
export const upToTiny = `(max-width: ${MEDIA_WIDTHS.upToTiny}px)`
export const MediumAndUp = `(min-width: ${MEDIA_WIDTHS.upToSmall + 1}px)`
export const isMediumOnly = `(min-width: ${MEDIA_WIDTHS.upToSmall + 1}px) and (max-width: ${MEDIA_WIDTHS.upToMedium}px)`
export const upToMedium = `(max-width: ${MEDIA_WIDTHS.upToMedium}px)`
export const isLargeOnly = `(min-width: ${MEDIA_WIDTHS.upToMedium + 1}px) and (max-width: ${MEDIA_WIDTHS.upToLarge}px)`
export const upToLarge = `(max-width: ${MEDIA_WIDTHS.upToLarge}px)`
export const LargeAndUp = `(min-width: ${MEDIA_WIDTHS.upToLarge + 1}px)`
