import { ReactNode, useMemo } from 'react'

import LockedIcon from '@cowprotocol/assets/images/icon-locked-2.svg'
import ICON_QR_CODE from '@cowprotocol/assets/images/icon-qr-code-v2.svg'
import ICON_SOCIAL_X from '@cowprotocol/assets/images/icon-social-x.svg'
import { formatShortDate } from '@cowprotocol/common-utils'
import { ButtonOutlined } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import CopyHelper from 'legacy/components/Copy'

import { useModalState } from 'common/hooks/useModalState'

import { AffiliatePartnerQrModal } from './AffiliatePartnerQrModal'

import { useAffiliatePartnerInfo } from '../hooks/useAffiliatePartnerInfo'
import { getReferralLink, toValidDate } from '../lib/affiliateProgramUtils'
import { LinkedBadge } from '../pure/AffiliateBadges.shared'
import {
  CardTitle,
  LinkedCard,
  LinkedCodeRow,
  LinkedCodeText,
  LinkedFooterNote,
  LinkedMetaList,
  LinkedCopy,
  LinkedLinkRow,
  LinkedLinkText,
} from '../pure/AffiliateCards.shared'
import { MetricItem } from '../pure/AffiliateMetrics.shared'

export function AffiliatePartnerCodeInfo(): ReactNode {
  const { account } = useWalletInfo()
  const { data: partnerInfo } = useAffiliatePartnerInfo(account)

  const refCode = partnerInfo?.code
  const referralLink = useMemo(() => getReferralLink(refCode || ''), [refCode])
  const shareText = useMemo(
    () => encodeURIComponent(`Trade on CoW Swap with my referral code ${refCode}. ${referralLink} @CoWSwap`),
    [refCode, referralLink],
  )

  const { isModalOpen, openModal, closeModal } = useModalState()

  if (!refCode) {
    return null
  }

  return (
    <>
      <CardTitle>
        <Trans>Your referral code</Trans>
      </CardTitle>
      <LinkedCard>
        <LinkedCodeRow>
          <LinkedCopy>
            <CopyHelper toCopy={refCode} iconSize={16} hideCopiedLabel />
            <LinkedCodeText>{refCode}</LinkedCodeText>
          </LinkedCopy>
          <LinkedBadge>
            <SVG src={LockedIcon} width={12} height={10} />
            <Trans>Created</Trans>
          </LinkedBadge>
        </LinkedCodeRow>
        <LinkedLinkRow>
          <LinkedCopy>
            <CopyHelper toCopy={referralLink} iconSize={16} hideCopiedLabel />
            <LinkedLinkText>{referralLink}</LinkedLinkText>
          </LinkedCopy>
        </LinkedLinkRow>
      </LinkedCard>

      <LinkedMetaList>
        <MetricItem>
          <span>
            <Trans>Created on</Trans>
          </span>
          <strong>
            {partnerInfo && toValidDate(partnerInfo.createdAt) ? formatShortDate(partnerInfo.createdAt) : '-'}
          </strong>
        </MetricItem>
      </LinkedMetaList>

      <LinkedFooter>
        <LinkedFooterNote>
          <Trans>Links/codes don't reveal your wallet.</Trans>
        </LinkedFooterNote>
        <LinkedActions>
          <LinkedActionButton
            as="a"
            href={`https://twitter.com/intent/tweet?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <LinkedActionIcon>
              <SVG src={ICON_SOCIAL_X} width={14} height={14} />
            </LinkedActionIcon>
            <Trans>Share on X</Trans>
          </LinkedActionButton>
          <LinkedActionButton onClick={openModal}>
            <LinkedActionIcon>
              <SVG src={ICON_QR_CODE} width={14} height={14} />
            </LinkedActionIcon>
            <Trans>Download QR</Trans>
          </LinkedActionButton>
        </LinkedActions>
      </LinkedFooter>
      <AffiliatePartnerQrModal isOpen={isModalOpen} refCode={refCode} onDismiss={closeModal} />
    </>
  )
}

const LinkedActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
`

const LinkedFooter = styled.div`
  margin-top: auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`

const LinkedActionButton = styled(ButtonOutlined)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  border-radius: 12px;
  text-decoration: none;
  font-size: 14px;
  padding: 8px 14px;
`

const LinkedActionIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: inherit;
`
