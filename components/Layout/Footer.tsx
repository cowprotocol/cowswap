import styled from 'styled-components';
import Link from 'next/link'
import { Color, Font, Media } from 'const/styles/variables'
import SocialList from 'components/SocialList'

const LogoImage = 'images/logo.svg'

const Wrapper = styled.footer`
  display: flex;
  justify-content: space-between;
  z-index: 1;
  width: 100%;
  padding: 5.6rem;
  position: relative;

  ${Media.mobile} {
    flex-flow: column wrap;
  }

  &::before {
    content: "";
    width: 100%;
    display: block;
    height: 0.1rem;
    background: ${Color.border};
    position: absolute;
    top: 0;
    left: 0;
  }
`

const MenuSection = styled.div`
  display: flex;
  flex: 1 1 50%;
  flex-flow: row;
  gap: 4.8rem;

  ${Media.mobile} {
    flex: 1 1 100%;
    flex-flow: column wrap;
  }
`

const LogoSection = styled.div`
  display: flex;
  flex: 1 1 50%;
  flex-flow: column wrap;
  align-items: flex-end;

  ${Media.mobile} {
    flex: 1 1 100%;
    align-items: center;
    margin: 5.6rem 0 0;
  }
`

const MenuWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  color: ${Color.grey};
  font-size: ${Font.sizeDefault};

  ${Media.mobile} {
    align-content: center;
  }

  > b {
    display: block;
    font-size: 1.6rem;
    color: ${Color.white};
    margin: 0 0 3rem;

    ${Media.mobile} {
      text-align: center;
    }
  }
`

const Menu = styled.ol`
  display: flex;
  list-style: none;
  font-size: inherit;
  flex-flow: column wrap;
  gap: 2.4rem;
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
      font-size: 1.2rem;
    }

    &:hover {
      color: ${Color.white};
    }
  }
`

const Logo = styled.div`
  width: 17rem;
  height: 5.7rem;
  background: url(${LogoImage}) no-repeat center/contain;
  cursor: pointer;
  margin: 0 0 4rem;
`

const CopyrightLinks = styled.ol`
  list-style-type: none;
  display: flex;
  flex-flow: column wrap;
  align-items: flex-end;
  font-size: 1.4rem;
  color: ${Color.grey};
  line-height: 1.5;
  padding: 0;

  ${Media.mobile} {
    align-items: center;
  }
`

export default function Footer({ siteConfig, menu }) {
  const { social } = siteConfig
  const currentYear = new Date().getFullYear()

  return (
    <Wrapper>

      {menu.length > 0 && <MenuSection>{menu.map(({ id, title, links }) => (
        <MenuWrapper key={id}>
          <b>{title}</b>
          <Menu>
            {links.map(({ title, url, target }, index) =>
              <li key={index}>
                <Link href={url}>
                  <a target={target}>
                    {title}
                  </a>
                </Link>
              </li>
            )}
          </Menu>
        </MenuWrapper>
      ))}</MenuSection>}


      <LogoSection>
        <Link passHref href='/'>
          <Logo />
        </Link>
        <SocialList social={social} labels={false} iconSize={2.8} gap={0.7} innerPadding={1} alignItems={'right'} />
        <CopyrightLinks>
          <li>©{siteConfig.title} - {currentYear}</li>
        </CopyrightLinks>
      </LogoSection>

    </Wrapper >
  )
}