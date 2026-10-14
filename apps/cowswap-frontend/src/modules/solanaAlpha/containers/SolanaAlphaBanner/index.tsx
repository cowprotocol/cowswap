import { ReactNode } from 'react'

import { SOLANA_ALPHA_MAX_TRADE_SIZE_USD_DISPLAY } from '@cowprotocol/common-const'
import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { DismissableInlineBanner, LinkStyledButton, StatusColorVariant } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { BANNER_IDS } from 'common/constants/banners'

import { useSolanaAlphaAcknowledgement } from '../../hooks/useSolanaAlphaAcknowledgement'
import { useSolanaAlphaRiskModal } from '../../hooks/useSolanaAlphaRiskModal'

const ViewRisksButton = styled(LinkStyledButton)`
  padding: 0;
  text-decoration: underline;
`

export function SolanaAlphaBanner(): ReactNode {
  const { chainId } = useWalletInfo()
  const { openModal } = useSolanaAlphaRiskModal()
  const { isAcknowledgementRequired } = useSolanaAlphaAcknowledgement()

  if (!isSolanaChain(chainId) || isAcknowledgementRequired) return null

  return (
    <DismissableInlineBanner bannerId={BANNER_IDS.SOLANA_ALPHA} bannerType={StatusColorVariant.Alert} iconSize={32}>
      <strong>
        <Trans>Solana Alpha · Unaudited</Trans>
      </strong>
      <p>
        <Trans>
          This deployment has not been independently audited. Bugs, vulnerabilities or unexpected behaviour could cause
          failed transactions or partial or total loss of assets.
        </Trans>
      </p>
      <p>
        <Trans>
          Maximum trade size: <b>${SOLANA_ALPHA_MAX_TRADE_SIZE_USD_DISPLAY}</b> per order.
        </Trans>{' '}
        <ViewRisksButton onClick={openModal}>
          <Trans>View risks</Trans>
        </ViewRisksButton>
      </p>
    </DismissableInlineBanner>
  )
}
