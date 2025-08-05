import { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'
import { ButtonSecondaryAlt, InlineBanner, InlineBannerProps } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

type CustomRecipientBannerProps = InlineBannerProps & { onDismiss?: Command }

const RecipientBannerContent = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;

  > p {
    margin: 0;
  }
`

export function CustomRecipientWarningBanner({
  bannerType,
  borderRadius,
  orientation,
  iconSize = 21,
  iconPadding = '0',
  padding = '10px 16px',
  onDismiss,
}: CustomRecipientBannerProps): ReactNode {
  return (
    <InlineBanner
      borderRadius={borderRadius}
      orientation={orientation}
      iconSize={iconSize}
      iconPadding={iconPadding}
      bannerType={bannerType}
      padding={padding}
    >
      <RecipientBannerContent>
        <p>
          <strong>Caution:</strong> Order recipient address differs from order owner!
        </p>
        {onDismiss && (
          <ButtonSecondaryAlt minHeight={'28px'} onClick={onDismiss}>
            Dismiss
          </ButtonSecondaryAlt>
        )}
      </RecipientBannerContent>
    </InlineBanner>
  )
}
