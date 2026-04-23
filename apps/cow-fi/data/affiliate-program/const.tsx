import type { ReactNode } from 'react'

import IMG_AFFILIATE_EARN from '@cowprotocol/assets/images/image-affiliate-earn.svg'
import IMG_GENERATE_LINK from '@cowprotocol/assets/images/image-generate-link.svg'
import IMG_SHARE_IT from '@cowprotocol/assets/images/image-shareit.svg'
import { UI } from '@cowprotocol/ui'

import { Link } from '@/components/Link'
import { CONFIG } from '@/const/meta'

export const AFFILIATE_PROGRAM_CTA = {
  text: 'Become an affiliate',
  href: 'https://swap.cow.fi/#/account/affiliate',
  action: 'click-become-an-affiliate',
  utmContent: 'affiliate-program-become-an-affiliate',
} as const

export const AFFILIATE_PROGRAM_DOCS_CTA = {
  text: 'Read how it works',
  href: `${CONFIG.url.docs}/cow-protocol/affiliate-program`,
  action: 'click-read-affiliate-docs',
  utmContent: 'affiliate-program-read-how-it-works',
} as const

export const AFFILIATE_PROGRAM_STEPS = [
  {
    title: 'Generate your link',
    description: 'Head to the affiliate portal and generate your unique referral link. No application. No approval.',
    bgColor: `var(${UI.COLOR_YELLOW_800_PRIMARY})`,
    textColor: `var(${UI.COLOR_YELLOW_300_PRIMARY})`,
    descriptionColor: `var(${UI.COLOR_YELLOW_300_PRIMARY})`,
    image: IMG_GENERATE_LINK,
    imageHeight: 128,
  },
  {
    title: 'Share it',
    description:
      'Post it on X, drop it in your Telegram, link it in your YouTube description, or share it wherever your community lives.',
    bgColor: `var(${UI.COLOR_YELLOW_300_PRIMARY})`,
    textColor: `var(${UI.COLOR_YELLOW_800_PRIMARY})`,
    descriptionColor: `var(${UI.COLOR_YELLOW_800_PRIMARY})`,
    image: IMG_SHARE_IT,
    imageHeight: 132,
  },
  {
    title: 'Earn rewards',
    description:
      'When referred wallets hit trading milestones, rewards are triggered for you and your traders. Paid weekly in USDC.',
    bgColor: `var(${UI.COLOR_YELLOW_700_PRIMARY})`,
    textColor: `var(${UI.COLOR_NEUTRAL_100})`,
    descriptionColor: `var(${UI.COLOR_NEUTRAL_100})`,
    image: IMG_AFFILIATE_EARN,
    imageHeight: 128,
  },
] as const

export const AFFILIATE_PROGRAM_METRICS = [
  {
    title: '$2,500',
    description: "Average trade size (more than 2x Uniswap's)",
  },
  {
    title: '50%',
    description: 'Market share among smart contract wallets',
  },
  {
    title: '42%',
    description: 'Monthly user retention rate - the highest in DeFi',
  },
  {
    title: '#1',
    description: 'Intents-based trading platform',
  },
] as const

export function getAffiliateProgramFaq(sendEvent: (action: string) => void): { question: string; answer: ReactNode }[] {
  return [
    {
      question: 'Do I need approval to participate?',
      answer:
        'No. The Moo & Earn Affiliate Program is fully permissionless. Anyone can generate a referral link and start sharing immediately. No application, no whitelist, no waiting.',
    },
    {
      question: 'How do rewards work?',
      answer:
        'Rewards are triggered when wallets you refer hit qualifying trading volume milestones on CoW Swap. Both you and your referred traders can earn rewards depending on where they are in the milestone journey.',
    },
    {
      question: 'When are rewards paid?',
      answer: 'Rewards are distributed every week in USDC. Hit a milestone, get paid - simple as that.',
    },
    {
      question: 'What counts as qualifying volume?',
      answer: (
        <>
          Only eligible trades on supported CoW Swap chains count toward milestone volume. Some trade types may be
          excluded based on program rules. Read the{' '}
          <Link
            href={`${CONFIG.url.docs}/cow-protocol/affiliate-program/faq`}
            external
            utmContent="affiliate-program-faq-docs"
            onClick={() => sendEvent('click-affiliate-faq-docs')}
          >
            full docs
          </Link>{' '}
          for details.
        </>
      ),
    },
    {
      question: 'Where can I get support?',
      answer: (
        <>
          The CoW Swap{' '}
          <Link
            href={CONFIG.social.discord.url}
            external
            utmContent="affiliate-program-discord-support"
            onClick={() => sendEvent('click-affiliate-discord-support')}
          >
            Discord
          </Link>{' '}
          is the best place to ask questions, get help, or connect with the community.
        </>
      ),
    },
  ]
}
