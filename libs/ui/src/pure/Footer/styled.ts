import styled from 'styled-components/macro'
import { CowSwapTheme } from '@cowprotocol/widget-lib'
import { Color } from '@cowprotocol/ui'

export const FooterContainer = styled.footer<{ theme: CowSwapTheme }>`
  --bgColor: ${({ theme }) => Color(theme).neutral10};
  --color: ${({ theme }) => Color(theme).neutral50};
  --colorTitle: ${({ theme }) => Color(theme).neutral98};
  background: var(--bgColor);
  color: var(--color);
  padding: 20px 0;
  text-align: left;
`

export const FooterContent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  padding: 0 50px;
`

export const FooterSection = styled.div`
  margin: 10px;
`

export const FooterLogo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`

export const FooterIcons = styled.div`
  display: flex;
  gap: 10px;
`

export const SocialIconLink = styled.a`
  --size: 32px;
  background: var(--color);
  color: var(--bgColor);
  text-decoration: none;
  border-radius: var(--size);
  display: flex;
  justify-content: center;
  align-items: center;
  height: var(--size);
  width: var(--size);
  padding: calc(var(--size) / 4);

  > svg {
    height: 100%;
    width: 100%;
    object-fit: contain;
    color: inherit;
  }
`

export const SectionTitle = styled.h4`
  margin: 0;
  color: var(--colorTitle);
`

export const LinkListWrapper = styled.div`
  column-count: 3;
  column-gap: 10px;
  width: 100%;
  color: inherit;
`

export const LinkListGroup = styled.div`
  break-inside: avoid;
  margin: 0;
  padding: 10px;
  color: inherit;
`

export const LinkList = styled.ul`
  list-style-type: none;
  padding: 0;
  color: inherit;

  > li {
    margin-bottom: 5px;
  }
`

export const Link = styled.a`
  color: inherit;
  text-decoration: none;

  &:hover {
    color: #fff;
  }
`

export const FooterBottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 50px;
  gap: 24px;
`

export const FooterBottomLogos = styled.div`
  display: flex;
  gap: 10px;
  height: auto;
  margin: 0 auto 0 0;

  > a {
    display: flex;
    align-items: center;
    justify-content: center;
    height: inherit;
  }
`

export const BottomText = styled.p`
  margin: 0;
`

export const Description = styled.p`
  margin-bottom: 10px;
`
