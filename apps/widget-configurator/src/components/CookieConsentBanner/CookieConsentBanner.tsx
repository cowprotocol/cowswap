import { ReactNode } from 'react'

import { baseTheme, CookieConsentBannerContainer, Font, UI } from '@cowprotocol/ui'

import styled, { ThemeProvider } from 'styled-components/macro'

import { useColorMode } from '../../theme/context/hooks/useColorMode'

const BannerScope = styled.div`
  ${UI.FONT_FAMILY_PRIMARY}: ${Font.familyInter};
  ${UI.FONT_WEIGHT_BOLD}: ${Font.weight.bold};
  ${UI.FONT_WEIGHT_SEMIBOLD}: ${Font.weight.semibold};
  ${UI.FONT_WEIGHT_MEDIUM}: ${Font.weight.medium};
  ${UI.BOX_SHADOW}: 0 12px 12px color-mix(in srgb, ${({ theme }) => theme.primary} 6%, transparent);
`

export function CookieConsentBanner(): ReactNode {
  const { mode } = useColorMode()

  return (
    <ThemeProvider theme={baseTheme(mode)}>
      <BannerScope>
        <CookieConsentBannerContainer variant="trading" />
      </BannerScope>
    </ThemeProvider>
  )
}
