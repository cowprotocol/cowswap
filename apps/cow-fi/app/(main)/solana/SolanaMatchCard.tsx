import { useId, useState } from 'react'
import type { ReactNode } from 'react'

import svgCowIconSrc from '@cowprotocol/assets/images/logo-icon-cow.svg'

import {
  Avatar,
  Chip,
  Chips,
  MatchAvatars,
  MatchCard,
  MatchCardSubtitle,
  MatchCardTitle,
  MatchSpark,
  ProfileList,
  ProfileToggle,
  StatusPill,
  VisuallyHidden,
} from './styled'

import LazySVG from '@/components/LazySVG'
import { MATCH_CARD } from '@/data/solana/const'

const CHIP_STAGGER = 0.05
const TURN_ONS_DELAY = 0.2
const DEALBREAKERS_DELAY = 0.35

export function SolanaMatchCard(): ReactNode {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const titleId = useId()
  const profileId = useId()

  return (
    <MatchCard aria-labelledby={titleId}>
      <StatusPill>
        <VisuallyHidden>Relationship status: </VisuallyHidden>
        {MATCH_CARD.status}
      </StatusPill>

      <MatchAvatars aria-hidden="true">
        <Avatar $variant="cow">
          <LazySVG uniquifyIDs src={svgCowIconSrc} />
        </Avatar>
        <Avatar $variant="builders">
          <strong>Solana</strong>
          <span>builders</span>
        </Avatar>
        <MatchSpark viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" />
        </MatchSpark>
      </MatchAvatars>

      <MatchCardTitle id={titleId}>{MATCH_CARD.title}</MatchCardTitle>
      <MatchCardSubtitle>{MATCH_CARD.subtitle}</MatchCardSubtitle>

      <ProfileToggle
        type="button"
        aria-expanded={isProfileOpen}
        aria-controls={profileId}
        onClick={() => setIsProfileOpen((open) => !open)}
      >
        {isProfileOpen ? 'Hide profile' : 'See full profile'}
      </ProfileToggle>

      <ProfileList id={profileId} data-expanded={isProfileOpen}>
        <div>
          <dt>Looking for</dt>
          <dd>{MATCH_CARD.lookingFor}</dd>
        </div>
        <div>
          <dt>Turn-ons</dt>
          <dd>
            <Chips>
              {MATCH_CARD.turnOns.map((turnOn, index) => (
                <Chip key={turnOn} $delay={TURN_ONS_DELAY + index * CHIP_STAGGER}>
                  {turnOn}
                </Chip>
              ))}
            </Chips>
          </dd>
        </div>
        <div>
          <dt>Dealbreakers</dt>
          <dd>
            <Chips>
              {MATCH_CARD.dealbreakers.map((dealbreaker, index) => (
                <Chip key={dealbreaker} $muted $delay={DEALBREAKERS_DELAY + index * CHIP_STAGGER}>
                  {dealbreaker}
                </Chip>
              ))}
            </Chips>
          </dd>
        </div>
      </ProfileList>
    </MatchCard>
  )
}
