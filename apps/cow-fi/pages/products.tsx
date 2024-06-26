import { Color } from '@cowprotocol/ui'
import Layout from '@/components/Layout'
import { PRODUCT_LIST } from '@/data/home/const'
import { Link, LinkType } from '@/components/Link'
import { EventCategories, sendEventHandler } from '@cowprotocol/analytics'
import SVG from 'react-inlinesvg'

import {
  PageWrapper,
  ContainerCard,
  ContainerCardSection,
  TopicList,
  TopicCard,
  TopicImage,
  TopicTitle,
  TopicDescription,
  SectionTitleWrapper,
  SectionTitleText,
  TopicCardInner,
} from '@/styles/styled'

export default function Page() {
  return (
    <Layout bgColor={Color.neutral90}>
      <PageWrapper>
        <ContainerCard bgColor={Color.neutral100} touchFooter>
          <ContainerCardSection>
            <SectionTitleWrapper color={Color.neutral0} maxWidth={1200} margin="100px auto">
              <SectionTitleText lineHeight={1.6} lineHeightMobile={1.8} fontSizeMobile={28}>
                CoW DAO develops the <span className="wordtag-orange">most user-protective</span> products in DeFi – so
                you can <span className="wordtag-purple">do more</span> with{' '}
                <span className="wordtag-blue">less worry</span>
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
                      onClick={() => sendEventHandler(EventCategories.HOME, topic.linkEvent)}
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
      </PageWrapper>
    </Layout>
  )
}
