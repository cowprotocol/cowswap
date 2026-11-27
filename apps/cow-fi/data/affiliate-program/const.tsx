import svgAffiliateEarnSrc from '@cowprotocol/assets/images/image-affiliate-earn.svg'
import svgGenerateLinkSrc from '@cowprotocol/assets/images/image-generate-link.svg'
import svgShareitSrc from '@cowprotocol/assets/images/image-shareit.svg'
import { UI } from '@cowprotocol/ui'

export const AFFILIATE_PROGRAM_CTA = {
  action: 'click-become-an-affiliate',
  utmContent: 'affiliate-program-become-an-affiliate',
} as const

export const AFFILIATE_PROGRAM_STEP_STYLES = [
  {
    bgColor: `var(${UI.COLOR_YELLOW_800_PRIMARY})`,
    textColor: `var(${UI.COLOR_YELLOW_300_PRIMARY})`,
    descriptionColor: `var(${UI.COLOR_YELLOW_300_PRIMARY})`,
    image: svgGenerateLinkSrc,
    imageHeight: 128,
  },
  {
    bgColor: `var(${UI.COLOR_YELLOW_300_PRIMARY})`,
    textColor: `var(${UI.COLOR_YELLOW_800_PRIMARY})`,
    descriptionColor: `var(${UI.COLOR_YELLOW_800_PRIMARY})`,
    image: svgShareitSrc,
    imageHeight: 132,
  },
  {
    bgColor: `var(${UI.COLOR_YELLOW_700_PRIMARY})`,
    textColor: `var(${UI.COLOR_NEUTRAL_100})`,
    descriptionColor: `var(${UI.COLOR_NEUTRAL_100})`,
    image: svgAffiliateEarnSrc,
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
