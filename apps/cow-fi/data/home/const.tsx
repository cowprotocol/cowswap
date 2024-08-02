import { Color, ProductVariant } from '@cowprotocol/ui'

import IMG_GREEN_WAVES from '@cowprotocol/assets/images/image-green-waves.svg'
import IMG_COINS from '@cowprotocol/assets/images/image-coins.svg'
import IMG_BITS from '@cowprotocol/assets/images/image-bits.svg'
import IMG_TUBE from '@cowprotocol/assets/images/image-tube.svg'

import IMG_DISCORD from '@cowprotocol/assets/images/image-discord.svg'
import IMG_FORUM from '@cowprotocol/assets/images/image-forum.svg'
import IMG_SNAPSHOT from '@cowprotocol/assets/images/image-snapshot.svg'
import {
  ContainerCard,
  ContainerCardSection,
  SectionTitleText,
  SectionTitleWrapper,
  TopicCard,
  TopicCardInner,
  TopicDescription,
  TopicImage,
  TopicList,
  TopicTitle,
} from '@/styles/styled'
import { Link, LinkType } from '@/components/Link'
import SVG from 'react-inlinesvg'
import { clickOnHome } from 'modules/analytics'

export const PRODUCT_LIST = [
  {
    title: 'CoW Protocol',
    description: 'Open-source, permissionless DEX aggregation protocol',
    linkHref: '/cow-protocol',
    linkText: 'Start building',
    linkEvent: 'click-start-building',
    bgColor: '#490072',
    textColor: '#F996EE',
    descriptionColor: '#F996EE',
    linkBgColor: '#F996EE',
    linkColor: '#490072',
    productVariant: ProductVariant.CowDao,
    iconImage: IMG_BITS,
  },
  {
    title: 'CoW Swap',
    description: 'The DEX that lets you do what you want',
    linkHref: 'https://swap.cow.fi/#/1/swap/USDC/COW',
    linkText: 'Start trading',
    linkEvent: 'click-trade-on-cow-swap',
    linkExternal: true,
    linkUtmContent: 'home-page-trade-on-cow-swap',
    bgColor: '#65D9FF',
    textColor: '#012F7A',
    descriptionColor: '#012F7A',
    linkBgColor: '#012F7A',
    linkColor: '#65D9FF',
    productVariant: ProductVariant.CowDao,
    iconImage: IMG_COINS,
  },
  {
    title: 'CoW AMM',
    description: 'The first MEV-capturing AMM',
    linkHref: '/cow-amm',
    linkText: 'Deposit liquidity',
    linkEvent: 'click-deploy-liquidity',
    bgColor: '#194D06',
    textColor: '#BCEC79',
    descriptionColor: '#BCEC79',
    linkBgColor: '#BCEC79',
    linkColor: '#194D06',
    productVariant: ProductVariant.CowDao,
    iconImage: IMG_GREEN_WAVES,
  },
  {
    title: 'MEV Blocker',
    description: 'The best MEV protection RPC under the sun',
    linkHref: '/mev-blocker',
    linkText: 'Get protected',
    linkEvent: 'click-get-protected',
    bgColor: '#FEE7CF',
    textColor: '#EC4612',
    descriptionColor: '#EC4612',
    linkBgColor: '#EC4612',
    linkColor: '#FEE7CF',
    productVariant: ProductVariant.MevBlocker,
    iconImage: IMG_TUBE,
  },
]

export const CHANNEL_LIST = [
  {
    title: 'Discord',
    href: 'https://discord.com/invite/cowprotocol?utm_source=cow.fi&utm_medium=web&utm_content=link',
    linkEvent: 'click-discord',
    iconColor: '#FDADA3',
    textColor: '#23191A',
    iconImage: IMG_DISCORD,
  },
  {
    title: 'Forum',
    href: 'https://forum.cow.fi/?utm_source=cow.fi&utm_medium=web&utm_content=link',
    linkEvent: 'click-forum',
    iconColor: '#1E5C06',
    textColor: '#FFF8F7',
    iconImage: IMG_FORUM,
  },
  {
    title: 'Snapshot',
    href: 'https://snapshot.org/#/cow.eth?utm_source=cow.fi&utm_medium=web&utm_content=link',
    linkEvent: 'click-snapshot',
    iconColor: '#710408',
    textColor: '#FFF8F7',
    iconImage: IMG_SNAPSHOT,
  },
]

export const PRODUCT_CONTAINERS = (
  <ContainerCard bgColor={Color.neutral100}>
    <ContainerCardSection>
      <SectionTitleWrapper color={Color.neutral0} maxWidth={1200} margin="100px auto">
        <SectionTitleText lineHeight={1.6} lineHeightMobile={1.8} fontSizeMobile={28}>
          CoW DAO develops the <span className="wordtag-orange">most user-protective</span> products in DeFi – so you
          can <span className="wordtag-purple">do more</span> with <span className="wordtag-blue">less worry</span>
        </SectionTitleText>
      </SectionTitleWrapper>

      <TopicList columns={2}>
        {PRODUCT_LIST.map((topic, index) => (
          <TopicCard
            key={index}
            contentAlign={'left'}
            bgColor={topic.bgColor}
            textColor={topic.textColor}
            padding={'32px'}
            asProp="div"
          >
            <TopicCardInner contentAlign="left">
              <TopicTitle fontSize={51}>{topic.title}</TopicTitle>
              <TopicDescription fontSize={28} color={topic.descriptionColor}>
                {topic.description}
              </TopicDescription>
              <Link
                bgColor={topic.linkBgColor}
                color={topic.linkColor}
                href={topic.linkHref}
                linkType={LinkType.TopicButton}
                onClick={() => clickOnHome(topic.linkEvent)}
                external={topic.linkExternal}
                utmContent={topic.linkUtmContent}
              >
                {topic.linkText}
              </Link>
            </TopicCardInner>
            <TopicImage
              iconColor="transparent"
              bgColor="transparent"
              margin={'0 0 0 auto'}
              height={'236px'}
              width={'auto'}
            >
              <SVG src={topic.iconImage} title={topic.title} />
            </TopicImage>
          </TopicCard>
        ))}
      </TopicList>
    </ContainerCardSection>
  </ContainerCard>
)
