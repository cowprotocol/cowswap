import { ReactNode } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { ButtonSecondary, ButtonSize } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'

import { AccountElement } from 'legacy/components/Header/AccountElement'
import { NetworkSelector } from 'legacy/components/Header/NetworkSelector'
import { HeaderControls, HeaderElement } from 'legacy/components/Header/styled'

import { useReferralActions } from 'modules/affiliate'
import { useInjectedWidgetParams } from 'modules/injectedWidget'

export function NetworkAndAccountControls(): ReactNode {
  const { hideNetworkSelector } = useInjectedWidgetParams()
  const { isAffiliateRewardsEnabled } = useFeatureFlags()
  const referralActions = useReferralActions()

  const handleOpenReferral = (): void => {
    referralActions.openModal('header')
  }

  return (
    <HeaderControls>
      {!hideNetworkSelector && <NetworkSelector />}
      {isAffiliateRewardsEnabled && (
        <HeaderElement>
          <ButtonSecondary buttonSize={ButtonSize.SMALL} width="auto" onClick={handleOpenReferral}>
            <Trans>Enter referral code</Trans>
          </ButtonSecondary>
        </HeaderElement>
      )}
      <HeaderElement>
        <AccountElement />
      </HeaderElement>
    </HeaderControls>
  )
}
