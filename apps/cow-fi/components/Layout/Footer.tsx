import { useRouter } from 'next/router'
import styled from 'styled-components'
import Link from 'next/link'
import { Color, Font, Media } from 'styles/variables'
import SocialList from 'components/SocialList'
import { CustomLink } from '../CustomLink'
import { FOOTER_LINK_GROUPS } from '@/const/menu'
import { CONFIG } from '@/const/meta'

const LogoImage = '/images/logo-light.svg'
const LogoLightImageThemedCoWAMM = '/images/logo-light-themed-cowamm.svg'
const CURRENT_YEAR = new Date().getFullYear()

const Wrapper = styled.footer<{ noMargin?: boolean; isCoWAMM?: boolean }>`
  display: flex;
  justify-content: space-between;
  flex-flow: row wrap;
  z-index: 1;
  width: 100%;
  padding: 5.6rem;
  margin: ${({ noMargin, isCoWAMM }) => (noMargin || isCoWAMM ? '0 auto' : '16rem auto 0')};
  position: relative;
  background: ${({ isCoWAMM }) => (isCoWAMM ? Color.cowammBlack : Color.darkBlue)};
  color: ${({ isCoWAMM }) => (isCoWAMM ? Color.cowammWhite : Color.text2)};

  ${Media.mediumDown} {
    flex-flow: column wrap;
    padding: 5.6rem 2.4rem;
  }

  &::before {
    content: '';
    width: 100%;
    display: ${({ isCoWAMM }) => (isCoWAMM ? 'none' : 'block')};
    height: 0.1rem;
    background: ${Color.gradient};
    position: absolute;
    top: 0;
    left: 0;
  }
`

const MenuSection = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-flow: row;
  gap: 4.8rem;

  ${Media.mediumDown} {
    justify-content: space-around;
  }

  ${Media.mobile} {
    flex: 1 1 100%;
    flex-flow: column wrap;
  }
`

const LogoSection = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-flow: column wrap;
  align-items: flex-end;

  ${Media.mediumDown} {
    justify-content: space-around;
    align-items: center;
    margin: 9rem auto 0;
  }
`

const MenuWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  color: inherit;
  font-size: ${Font.sizeDefault};

  ${Media.mobile} {
    align-content: center;
  }

  > b {
    display: block;
    font-size: 1.6rem;
    margin: 0 0 3rem;

    ${Media.mobile} {
      text-align: center;
      font-size: 1.9rem;
    }
  }
`

const Menu = styled.ol`
  display: flex;
  list-style: none;
  font-size: inherit;
  flex-flow: column wrap;
  gap: 1.4rem;
  color: inherit;
  padding: 0;
  margin: 0;

  ${Media.mobile} {
    text-align: center;
  }

  > li:not(:last-of-type) {
    ${Media.mediumUp} {
      margin: 0 3.6rem 0 0;
    }
  }

  > li > a {
    font-size: inherit;
    color: inherit;
    text-decoration: none;
    line-height: 1.2;

    ${Media.mediumDown} {
      margin: 0 0 2.4rem;
      display: block;
    }

    &:hover {
      color: ${Color.white};
      text-decoration: underline;
    }
  }
`

const Logo = styled.div<{ isCoWAMM?: boolean }>`
  width: 17rem;
  height: 5.7rem;
  background: ${({ isCoWAMM }) => (isCoWAMM ? `url(${LogoLightImageThemedCoWAMM})` : `url(${LogoImage})`)} no-repeat
    center/contain;
  cursor: pointer;
  margin: 0 0 4rem;
`

const CopyrightLinks = styled.ol`
  list-style-type: none;
  display: flex;
  flex-flow: column wrap;
  align-items: flex-end;
  font-size: 1.4rem;
  color: inherit;
  line-height: 1.5;
  padding: 0;

  ${Media.mediumDown} {
    align-items: center;
  }
`

const FooterDisclaimer = styled.div`
  width: 100%;
  color: ${Color.text2};
  margin: 5.6rem auto 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  text-align: left;

  > p {
    line-height: 1.4;
    font-size: 1.3rem;
    font-weight: 400;
  }
`

function FooterMenu() {
  return (
    <MenuSection>
      {FOOTER_LINK_GROUPS.map(({ label: title, links }, index) => (
        <MenuWrapper key={index}>
          <b>{title}</b>
          <Menu>
            {links.map((link, index) => (
              <li key={index}>
                <CustomLink {...link} />
              </li>
            ))}
          </Menu>
        </MenuWrapper>
      ))}
    </MenuSection>
  )
}

function Social({ isCoWAMM = false }: Pick<FooterProps, 'isCoWAMM'>) {
  const { social } = CONFIG
  return (
    <LogoSection>
      <Link passHref href="/">
        <Logo isCoWAMM={isCoWAMM} />
      </Link>
      <SocialList
        social={social}
        labels={false}
        iconSize={2.8}
        gap={0.7}
        innerPadding={1}
        alignItems={'right'}
        color={isCoWAMM ? Color.cowammWhite : undefined}
      />
      <CopyrightLinks>
        <li>©CoW Protocol - {CURRENT_YEAR}</li>
      </CopyrightLinks>
    </LogoSection>
  )
}

type FooterProps = {
  noMargin?: boolean
  isCoWAMM?: boolean
}

export default function Footer({ noMargin = false, isCoWAMM = false }: FooterProps) {
  const router = useRouter()
  const showDisclaimer = router.asPath.startsWith('/tokens')

  return (
    <Wrapper noMargin={noMargin} isCoWAMM={isCoWAMM}>
      <FooterMenu />
      <Social isCoWAMM={isCoWAMM} />
      {showDisclaimer && (
        <FooterDisclaimer>
          <p>{CONFIG.tokenDisclaimer}</p>
        </FooterDisclaimer>
      )}
    </Wrapper>
  )
}
