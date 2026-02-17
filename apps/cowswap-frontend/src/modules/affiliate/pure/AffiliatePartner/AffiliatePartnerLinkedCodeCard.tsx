import { ReactNode, useMemo } from 'react'

import LockedIcon from '@cowprotocol/assets/images/icon-locked-2.svg'
import ICON_QR_CODE from '@cowprotocol/assets/images/icon-qr-code.svg'
import ICON_SOCIAL_X from '@cowprotocol/assets/images/icon-social-x.svg'
import { formatShortDate } from '@cowprotocol/common-utils'

import { Trans } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import CopyHelper from 'legacy/components/Copy'

import { getReferralLink, toValidDate } from 'modules/affiliate/lib/affiliateProgramUtils'
import {
  CardTitle,
  LinkedActionButton,
  LinkedActionIcon,
  LinkedActions,
  LinkedBadge,
  LinkedCard,
  LinkedCodeRow,
  LinkedCodeText,
  LinkedCopy,
  LinkedFooter,
  LinkedFooterNote,
  LinkedLinkRow,
  LinkedLinkText,
  LinkedMetaList,
  MetricItem,
} from 'modules/affiliate/pure/shared'

interface AffiliatePartnerLinkedCodeCardProps {
  existingCode: string
  createdAt: string | undefined
  onOpenQr: () => void
}

export function AffiliatePartnerLinkedCodeCard({
  existingCode,
  createdAt,
  onOpenQr,
}: AffiliatePartnerLinkedCodeCardProps): ReactNode {
  const createdAtDate = toValidDate(createdAt)
  const createdOnLabel = createdAtDate ? formatShortDate(createdAtDate) : '-'
  const referralLink = useMemo(() => getReferralLink(existingCode), [existingCode])
  const shareText = useMemo(
    () => encodeURIComponent(`Trade on CoW Swap with my referral code ${existingCode}. ${referralLink} @CoWSwap`),
    [existingCode, referralLink],
  )

  return (
    <>
      <CardTitle>
        <Trans>Your referral code</Trans>
      </CardTitle>
      <LinkedCard>
        <LinkedCodeRow>
          <LinkedCopy>
            <CopyHelper toCopy={existingCode} iconSize={16} hideCopiedLabel />
            <LinkedCodeText>{existingCode}</LinkedCodeText>
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
          <strong>{createdOnLabel}</strong>
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
          <LinkedActionButton onClick={onOpenQr}>
            <LinkedActionIcon>
              <SVG src={ICON_QR_CODE} width={14} height={14} />
            </LinkedActionIcon>
            <Trans>Download QR</Trans>
          </LinkedActionButton>
        </LinkedActions>
      </LinkedFooter>
    </>
  )
}
