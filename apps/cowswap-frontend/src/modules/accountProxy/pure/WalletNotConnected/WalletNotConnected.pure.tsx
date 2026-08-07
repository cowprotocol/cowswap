import { ReactNode } from 'react'

import svgWalletPlusSrc from '@cowprotocol/assets/cow-swap/wallet-plus.svg'
import { ButtonPrimary, ButtonSize } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import * as styledEl from './WalletNotConnected.styled'

import { BaseAccountCard } from '../BaseAccountCard/BaseAccountCard.pure'
import { CowProtocolIcon } from '../CowProtocolIcon/CowProtocolIcon.pure'
import { SkeletonLines } from '../SkeletonLines/SkeletonLines.pure'

interface WalletNotConnectedProps {
  onConnect(): void
}
export function WalletNotConnected({ onConnect }: WalletNotConnectedProps): ReactNode {
  return (
    <styledEl.Container>
      <styledEl.Wrapper>
        <BaseAccountCard width={206} height={116} padding={16} enableScale ariaLabel={t`Connect wallet banner`}>
          <styledEl.WalletIcon>
            <SVG src={svgWalletPlusSrc} description={t`connect wallet`} />
          </styledEl.WalletIcon>
          <SkeletonLines />
          <CowProtocolIcon />
        </BaseAccountCard>
        <p>
          <Trans>Connect wallet to recover funds</Trans>
        </p>
      </styledEl.Wrapper>
      <ButtonPrimary buttonSize={ButtonSize.BIG} onClick={onConnect}>
        Connect wallet
      </ButtonPrimary>
    </styledEl.Container>
  )
}
