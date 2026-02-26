import { ReactNode, useMemo } from 'react'

import LockedIcon from '@cowprotocol/assets/images/icon-locked-2.svg'
import ICON_QR_CODE from '@cowprotocol/assets/images/icon-qr-code-v2.svg'
import ICON_SOCIAL_X from '@cowprotocol/assets/images/icon-social-x.svg'
import { formatShortDate } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import CopyHelper from 'legacy/components/Copy'

import { useModalState } from 'common/hooks/useModalState'

import { AffiliatePartnerQrModal } from './AffiliatePartnerQrModal'

import { useAffiliatePartnerInfo } from '../hooks/useAffiliatePartnerInfo'
import { getReferralLink, toValidDate } from '../lib/affiliateProgramUtils'
import {
  CardTitle,
  LinkedActionButton,
  LinkedActionIcon,
  LinkedActions,
  LinkedBadge,
  LinkedCard,
  LinkedCardGroup,
  LinkedCodeRow,
  LinkedCodeText,
  LinkedCopy,
  LinkedFooter,
  LinkedFooterNote,
  LinkedLinkRow,
  LinkedLinkText,
  LinkedMetaList,
  MetricItem,
  MetricValue,
} from '../pure/shared'

export function AffiliatePartnerCodeInfo(): ReactNode {
  const { account } = useWalletInfo()
  const { data: partnerInfo } = useAffiliatePartnerInfo(account)

  const refCode = partnerInfo?.code
  const referralLink = useMemo(() => getReferralLink(refCode || ''), [refCode])
  const shareUrl = useMemo(
    () =>
      `https://x.com/intent/tweet?text=${encodeURIComponent(`Trade on CoW Swap with my referral link! @CoWSwap`)}&url=${encodeURIComponent(referralLink)}`,
    [referralLink],
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
      <LinkedCardGroup>
        <LinkedCard>
          <LinkedCodeRow>
            <LinkedCopy>
              <CopyHelper toCopy={refCode} iconSize={16} hideCopiedLabel />
              <LinkedCodeText>{refCode}</LinkedCodeText>
            </LinkedCopy>
            <LinkedBadge>
              <SVG src={LockedIcon} width={16} height={16} />
              <Trans>Created</Trans>
            </LinkedBadge>
          </LinkedCodeRow>
          <LinkedLinkRow>
            <LinkedCopy>
              <CopyHelper toCopy={referralLink} iconSize={16} hideCopiedLabel />
              <LinkedLinkText>
                {referralLink
                  .split(/(ref=)/)
                  .map((part, i) => (part === 'ref=' ? part : i > 1 ? <strong key={i}>{part}</strong> : part))}
              </LinkedLinkText>
            </LinkedCopy>
          </LinkedLinkRow>
        </LinkedCard>

        <LinkedMetaList>
          <MetricItem>
            <span>
              <Trans>Created on</Trans>
            </span>
            <MetricValue>
              {partnerInfo && toValidDate(partnerInfo.createdAt) ? formatShortDate(partnerInfo.createdAt) : '-'}
            </MetricValue>
          </MetricItem>
        </LinkedMetaList>
      </LinkedCardGroup>

      <LinkedFooter>
        <LinkedFooterNote>
          <Trans>Links/codes don't reveal your wallet.</Trans>
        </LinkedFooterNote>
        <LinkedActions>
          <LinkedActionButton as="a" href={shareUrl} target="_blank" rel="noopener noreferrer">
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
