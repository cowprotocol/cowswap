import { type ReactNode, useCallback } from 'react'

import FeedbackIcon from '@cowprotocol/assets/cow-swap/feedback.svg'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { isAppziEnabled, openAffiliateFeedbackAppzi } from 'appzi'
import SVG from 'react-inlinesvg'

import * as styledEl from './AffiliateFeedbackButton.styled'

export function AffiliateFeedbackButton(): ReactNode {
  const { account, chainId } = useWalletInfo()
  const { walletName } = useWalletDetails()

  const handleClick = useCallback((): void => {
    openAffiliateFeedbackAppzi({ account, chainId, walletName })
  }, [account, chainId, walletName])

  if (!isAppziEnabled) {
    return null
  }

  return (
    <styledEl.Wrapper>
      <styledEl.Button type="button" onClick={handleClick} aria-label={t`Give affiliate feedback`}>
        <styledEl.Icon aria-hidden="true">
          <SVG src={FeedbackIcon} description={t`Provide Feedback`} />
        </styledEl.Icon>
        <styledEl.Label>
          <Trans>Give affiliate feedback</Trans>
        </styledEl.Label>
      </styledEl.Button>
    </styledEl.Wrapper>
  )
}
