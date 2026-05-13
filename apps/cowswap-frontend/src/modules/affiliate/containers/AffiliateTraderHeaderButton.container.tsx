import { type ReactNode, useCallback } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { ButtonIcon, ButtonLabel } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { RiUserAddLine } from 'react-icons/ri'

import { Routes } from 'common/constants/routes'
import { useNavigate } from 'common/hooks/useNavigate'

import * as styledEl from './AffiliateTraderHeaderButton.styled'

import { useShouldShowAffiliateTraderHeaderButton } from '../hooks/useShouldShowAffiliateTraderHeaderButton'

export function AffiliateTraderHeaderButton(): ReactNode {
  const analytics = useCowAnalytics()
  const navigate = useNavigate()
  const shouldShowAffiliateTraderHeaderButton = useShouldShowAffiliateTraderHeaderButton()

  const handleClick = useCallback((): void => {
    analytics.sendEvent({ category: 'affiliate', action: 'cta_clicked', label: 'header_refer' })
    navigate(Routes.ACCOUNT_AFFILIATE_PARTNER)
  }, [analytics, navigate])

  if (!shouldShowAffiliateTraderHeaderButton) {
    return null
  }

  return (
    <styledEl.Button type="button" onClick={handleClick} aria-label={t`Refer`}>
      <ButtonIcon aria-hidden="true">
        <RiUserAddLine size={18} />
      </ButtonIcon>
      <ButtonLabel $hideOnMobile>
        <Trans>Refer</Trans>
      </ButtonLabel>
    </styledEl.Button>
  )
}
