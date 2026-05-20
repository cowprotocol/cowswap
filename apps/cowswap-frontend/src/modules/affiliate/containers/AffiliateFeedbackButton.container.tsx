import { useAtomValue } from 'jotai'
import { type ReactNode, useCallback } from 'react'

import svgFeedbackSrc from '@cowprotocol/assets/cow-swap/feedback.svg'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'
import { useWalletChainId } from '@cowprotocol/wallet-provider'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { isAppziEnabled, openAffiliateFeedbackAppzi } from 'appzi'
import SVG from 'react-inlinesvg'
import { useLocation } from 'react-router'

import { Routes as RoutesEnum } from 'common/constants/routes'

import * as styledEl from './AffiliateFeedbackButton.styled'

import { TraderWalletStatus, useAffiliateTraderWallet } from '../hooks/useAffiliateTraderWallet'
import { isSupportedTradingNetwork } from '../lib/affiliateProgramUtils'
import { affiliateTraderSavedCodeAtom } from '../state/affiliateTraderSavedCodeAtom'

interface AffiliateFeedbackTriggerProps {
  canShow: boolean
  chainId?: number
}

export function AffiliateFeedbackButton(): ReactNode {
  const { pathname } = useLocation()

  if (pathname === RoutesEnum.ACCOUNT_AFFILIATE_PARTNER) {
    return <AffiliatePartnerFeedbackButton />
  }

  if (pathname === RoutesEnum.ACCOUNT_AFFILIATE_TRADER) {
    return <AffiliateTraderFeedbackButton />
  }

  return null
}

function AffiliatePartnerFeedbackButton(): ReactNode {
  const chainId = useWalletChainId()

  return <AffiliateFeedbackTrigger canShow={isSupportedTradingNetwork(chainId)} chainId={chainId} />
}

function AffiliateTraderFeedbackButton(): ReactNode {
  const chainId = useWalletChainId()
  const { savedCode } = useAtomValue(affiliateTraderSavedCodeAtom)
  const walletStatus = useAffiliateTraderWallet()
  const canShow =
    isSupportedTradingNetwork(chainId) && Boolean(savedCode) && walletStatus !== TraderWalletStatus.INELIGIBLE

  return <AffiliateFeedbackTrigger canShow={canShow} chainId={chainId} />
}

function AffiliateFeedbackTrigger({ canShow, chainId }: AffiliateFeedbackTriggerProps): ReactNode {
  const { account } = useWalletInfo()
  const { walletName } = useWalletDetails()

  const handleClick = useCallback((): void => {
    if (!chainId) return

    openAffiliateFeedbackAppzi({ account, chainId, walletName })
  }, [account, chainId, walletName])

  if (!isAppziEnabled || !account || !chainId || !canShow) {
    return null
  }

  return (
    <styledEl.Wrapper>
      <styledEl.Button type="button" onClick={handleClick} aria-label={t`Give feedback`}>
        <styledEl.Icon aria-hidden="true">
          <SVG src={svgFeedbackSrc} description={t`Provide Feedback`} />
        </styledEl.Icon>
        <styledEl.Label>
          <Trans>Give feedback</Trans>
        </styledEl.Label>
      </styledEl.Button>
    </styledEl.Wrapper>
  )
}
