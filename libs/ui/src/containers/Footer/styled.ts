import styled from 'styled-components/macro'

import { Color } from '../../colors'
import { Media } from '../../consts'

export const FooterContainer = styled.footer<{ expanded: boolean; hasTouchFooter: boolean }>`
  --bgColor: ${({ theme }) => (theme.darkMode ? Color.neutral0 : Color.neutral10)};
  --color: ${({ theme }) => (theme.darkMode ? Color.neutral50 : Color.neutral50)};
  --colorTitle: ${({ theme }) => (theme.darkMode ? Color.neutral90 : Color.neutral98)};
  background: var(--bgColor);
  color: var(--color);
  padding: ${({ expanded, hasTouchFooter }) =>
    !expanded && hasTouchFooter ? '68px 0 0' : expanded ? '134px 0 0' : '0'};
  text-align: left;
  transition: padding 0.3s ease;
  font-size: 18px;
  width: 100%;

  ${Media.upToSmall()} {
    padding: ${({ expanded }) => (expanded ? '54px 0 0' : '0')};

    padding: ${({ expanded, hasTouchFooter }) =>
      !expanded && hasTouchFooter
        ? '120px 0 0'
        : expanded && hasTouchFooter
          ? '120px 0 0'
          : expanded
            ? '54px 0 0'
            : '0'};
  }
`

export const FooterContent = styled.div<{ maxWidth?: number }>`
  display: grid;
  grid-template-columns: 0.7fr 1fr;
  gap: 20px;
  padding: 0 48px;
  max-width: ${({ maxWidth }) => (maxWidth ? `${maxWidth}px` : '100%')};
  margin: 0 auto;

  ${Media.upToLarge()} {
    grid-template-columns: 1fr;
    gap: 56px;
  }

  ${Media.upToSmall()} {
    padding: 0 24px;
  }
`

export const FooterDescriptionSection = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 40px;
  max-width: 400px;
  width: 100%;

  ${Media.upToLarge()} {
    max-width: 100%;
  }
`

export const FooterLogo = styled.div`
  display: flex;
  align-items: center;
`

export const SocialIconsWrapper = styled.div`
  display: flex;
  gap: 16px;
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
  transition: background 0.2s ease-in-out;

  &:hover {
    background: var(--colorTitle);
  }

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
  column-gap: 70px;
  width: max-content;
  margin: 0 0 0 auto;
  color: inherit;

  ${Media.upToLarge()} {
    width: 100%;
  }

  ${Media.upToSmall()} {
    column-count: initial;
    column-gap: initial;
  }
`

export const LinkListGroup = styled.div`
  break-inside: avoid;
  margin: 0 0 40px;
  padding: 0;
  color: inherit;
  display: flex;
  flex-flow: column wrap;
  gap: 20px;
`

export const LinkList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  color: inherit;
  gap: 10px;
  display: flex;
  flex-flow: column wrap;
  font-size: 18px;

  ${Media.upToSmall()} {
    gap: 16px;
  }

  > li {
    margin: 0;
    padding: 0;
    color: inherit;
    font-size: inherit;
    line-height: 1;
  }
`

export const Link = styled.a`
  color: inherit;
  text-decoration: none;

  &:hover {
    color: var(--colorTitle);
  }
`

export const FooterBottom = styled.div<{ maxWidth?: number }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  gap: 24px;
  font-size: 14px;
  max-width: ${({ maxWidth }) => (maxWidth ? `${maxWidth}px` : '100%')};
  margin: 0 auto;

  ${Media.upToLarge()} {
    flex-flow: column wrap;
    gap: 0;
  }
`

export const FooterBottomLogos = styled.div`
  display: flex;
  gap: 28px;
  height: auto;
  margin: 0 auto 0 0;

  ${Media.upToLarge()} {
    width: 100%;
    margin: 24px auto;
    justify-content: center;
    flex-flow: row wrap;
  }

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
  margin: 0;
  line-height: 1.5;
`

export const BottomRight = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex: 1 1 auto;
  margin: 0 0 0 auto;
  gap: 16px;

  ${Media.upToLarge()} {
    margin: 0;
    width: 100%;
    justify-content: flex-start;
  }
`

export const ToggleFooterButton = styled.button<{ expanded: boolean }>`
  --size: 24px;
  height: var(--size);
  width: var(--size);
  object-fit: contain;
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  transition:
    transform 0.5s ease-in-out,
    color 0.2s ease-in-out;
  transform: ${({ expanded }) => (expanded ? 'rotate(-90deg)' : 'rotate(0deg)')};

  &:hover {
    color: var(--colorTitle);
  }

  ${Media.upToLarge()} {
    margin: 0 0 0 auto;
  }
`
