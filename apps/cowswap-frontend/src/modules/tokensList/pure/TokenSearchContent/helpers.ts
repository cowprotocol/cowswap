import { getTokenAddressKey } from '@cowprotocol/common-utils'

import { t } from '@lingui/core/macro'

import { AppendImportSectionParams, TokenSearchRow } from './types'

export function appendImportSection(rows: TokenSearchRow[], params: AppendImportSectionParams): void {
  const {
    tokens,
    section,
    limit,
    sectionTitle,
    tooltip,
    shadowed,
    wrapperId,
    bridgeSupportedTokensMap,
    areTokensFromBridge = false,
  } = params

  if (!tokens?.length) {
    return
  }

  if (sectionTitle) {
    rows.push({ type: 'section-title', text: sectionTitle, tooltip })
  }

  const noRouteTooltip = t`No route found for this token`
  const limitedTokens = tokens.slice(0, limit)

  limitedTokens.forEach((token, index) => {
    // Hide import button for non-bridgeable tokens when in bridge mode
    const hideImport =
      areTokensFromBridge &&
      !!bridgeSupportedTokensMap &&
      !!token.address &&
      !bridgeSupportedTokensMap[getTokenAddressKey(token.address)]

    rows.push({
      type: 'import-token',
      token,
      section,
      shadowed,
      isFirstInSection: index === 0,
      isLastInSection: index === limitedTokens.length - 1,
      wrapperId: index === 0 ? wrapperId : undefined,
      hideImport,
      disabledReason: hideImport ? noRouteTooltip : undefined,
    })
  })
}
