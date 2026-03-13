import { ReactNode } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenAmount, InlineBanner, LinkStyledButton, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { MINIMUM_PART_SELL_AMOUNT_FIAT } from '../../../const'

export type SmallPartVolumeWarningBannerProps = {
  chainId: SupportedChainId
  isAtMinimumParts?: boolean
  maxPartsValue?: number
  onUseMaxParts?(): void
}

const UseMaxPartsLink = styled(LinkStyledButton)`
  color: var(${UI.COLOR_TEXT});
  text-decoration: underline;

  :hover,
  :focus,
  :active {
    text-decoration: underline;
  }
`

export function SmallPartVolumeWarning({
  chainId,
  isAtMinimumParts,
  maxPartsValue,
  onUseMaxParts,
}: SmallPartVolumeWarningBannerProps): ReactNode {
  const amount = MINIMUM_PART_SELL_AMOUNT_FIAT[chainId]
  const hasMaxPartsAction = Boolean(onUseMaxParts && maxPartsValue)

  return (
    <InlineBanner>
      <strong>
        <Trans>Minimum sell size</Trans>
      </strong>
      <p>
        {isAtMinimumParts ? (
          <Trans>
            The sell amount per part of your TWAP order should be at least{' '}
            <b>
              $<TokenAmount amount={amount} hideTokenSymbol />
            </b>
            . Increase the total sell amount. TWAP orders require at least 2 parts.
          </Trans>
        ) : (
          <Trans>
            The sell amount per part of your TWAP order should be at least{' '}
            <b>
              $<TokenAmount amount={amount} hideTokenSymbol />
            </b>
            . Decrease the number of parts or increase the total sell amount.
          </Trans>
        )}
      </p>
      {hasMaxPartsAction && (
        <p>
          <UseMaxPartsLink onClick={onUseMaxParts}>
            <Trans>Set to maximum parts ({maxPartsValue})</Trans>
          </UseMaxPartsLink>
        </p>
      )}
    </InlineBanner>
  )
}
