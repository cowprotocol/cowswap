import styled from 'styled-components'
import { Font, Color, Media } from '@cowprotocol/ui'

export const ContainerCard = styled.div<{
  bgColor?: string
  gap?: number
  gapMobile?: number
  touchFooter?: boolean
  centerContent?: boolean
}>`
  display: flex;
  flex-flow: row wrap;
  justify-content: ${({ centerContent }) => (centerContent ? 'center' : 'flex-start')};
  gap: ${({ gap }) => gap || 100}px;
  margin: ${({ touchFooter }) => (touchFooter ? '0 0 -65px' : '24px 0')};
  width: 100%;
  padding: 60px;
  border-radius: 60px;
  background: ${({ bgColor }) => bgColor || Color.neutral90};
  position: relative;

  ${Media.upToMedium()} {
    flex-flow: column wrap;
    padding: 48px 32px;
    gap: ${({ gapMobile }) => gapMobile || 100}px;
  }
`

export const ContainerCardSection = styled.div`
  display: flex;
  flex-flow: row wrap;
  gap: 42px;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`

export const ContainerCardSectionTop = styled.div`
  display: flex;
  flex-flow: row wrap;
  gap: 24px;
  width: 100%;
  justify-content: space-between;
  align-items: center;

  > h1,
  > h3 {
    font-size: 38px;
    font-weight: ${Font.weight.bold};
    color: ${Color.neutral10};

    ${Media.upToMedium()} {
      font-size: 28px;
    }
  }
`

export const ArticleList = styled.div<{ columns?: number; columnsMobile?: number }>`
  display: grid;
  grid-template-columns: repeat(${({ columns }) => columns || 3}, 1fr);
  gap: 64px 32px;
  justify-content: space-between;
  width: 100%;

  ${Media.upToMedium()} {
    grid-template-columns: repeat(${({ columnsMobile }) => columnsMobile || 1}, 1fr);
  }
`

export const ArticleCard = styled.a`
  display: flex;
  flex-direction: column;
  padding: 0;
  border-radius: 20px;
  width: 100%;
  text-decoration: none;

  h4 {
    font-size: 28px;
    font-weight: ${Font.weight.bold};
    color: ${Color.neutral0};
    margin: 16px 0 8px;
    line-height: 1.2;
  }

  p {
    font-size: 16px;
    color: ${Color.neutral0};
    font-weight: ${Font.weight.medium};
    line-height: 1.5;
  }
`

export const ArticleImage = styled.div<{ color?: string }>`
  width: 100%;
  height: 200px;
  background: ${({ color }) => color || Color.neutral70};
  border-radius: 20px;

  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: inherit;
  }
`

export const ArticleTitle = styled.h4`
  font-size: 18px;
  font-weight: ${Font.weight.bold};
  color: ${Color.neutral0};
  margin: 16px 0 8px;
`

export const ArticleDescription = styled.p`
  font-size: 14px;
  color: ${Color.neutral0};
`

export const TopicList = styled.div<{ columns?: number; columnsMobile?: number }>`
  display: grid;
  grid-template-columns: ${({ columns }) => `repeat(${columns || 4}, 1fr)`};
  gap: 32px;
  width: 100%;

  ${Media.upToMedium()} {
    grid-template-columns: ${({ columnsMobile }) => `repeat(${columnsMobile || 1}, 1fr)`};
    gap: 16px;
  }
`

export const TopicCard = styled.a<{ bgColor: string; textColor: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${({ bgColor }) => bgColor || Color.neutral90};
  color: ${({ textColor }) => textColor || Color.neutral0};
  padding: 56px 20px;
  border-radius: 20px;
  text-align: center;
  font-size: 24px;
  font-weight: ${Font.weight.bold};
  text-decoration: none;
  border: 4px solid transparent;
  transition: border 0.2s ease-in-out;
  gap: 56px;

  &:hover {
    border: 4px solid ${Color.neutral40};
  }

  ${Media.upToMedium()} {
    padding: 32px 16px;
    gap: 32px;
  }

  > h5 {
    font-size: inherit;
    font-weight: inherit;
    color: inherit;
    padding: 0;
    margin: 0;
  }
`

export const TopicImage = styled.div<{ iconColor: string }>`
  width: 100px;
  height: 100px;
  background: ${({ iconColor }) => iconColor || Color.neutral90};
  color: ${({ iconColor }) => iconColor || Color.neutral90};
  border-radius: 50%;
  margin-bottom: 16px;

  svg {
    fill: currentColor;
  }
`

export const LinkSection = styled.div<{ columns?: number; columnsMobile?: number }>`
  display: grid;
  grid-template-columns: ${({ columns }) => `repeat(${columns || 2}, 1fr)`};
  background: ${Color.neutral100};
  border-radius: 28px;
  padding: 24px;
  width: 100%;
  gap: 24px;

  ${Media.upToMedium()} {
    grid-template-columns: ${({ columnsMobile }) => `repeat(${columnsMobile || 1}, 1fr)`};
  }
`

export const LinkColumn = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 0;
  width: 100%;

  > h5 {
    font-size: 21px;
    font-weight: ${Font.weight.bold};
    color: ${Color.neutral0};
    margin: 0 0 16px;
    line-height: 1.2;
  }
`

export const LinkItem = styled.a`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-size: 18px;
  border-radius: 36px;
  padding: 4px 8px 4px 16px;
  text-decoration: none;
  color: ${Color.neutral50};
  transition: color 0.2s ease-in-out;
  line-height: 1.2;

  &:hover {
    color: ${Color.neutral0};
    background: ${Color.neutral80};

    > span {
      color: ${Color.neutral0};
      background: ${Color.neutral100};
      transform: translateX(3px);
    }
  }

  &:last-child {
    margin-bottom: 0;
  }

  > span {
    --size: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
    height: var(--size);
    width: var(--size);
    color: ${Color.neutral50};
    transition: color 0.2s ease-in-out;
    border-radius: 24px;
    font-size: 24px;
    transition: transform 0.2s ease-in-out;
  }
`

export const CTASectionWrapper = styled.section`
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
  width: 100%;
  gap: 28px;
  padding: 0 24px;
  background: transparent;
  text-align: center;
  margin: 100px 0;
`

export const CTAImage = styled.div<{ bgColor?: string }>`
  --size: 100px;
  width: var(--size);
  height: var(--size);
  border-radius: var(--size);
  background: ${({ bgColor }) => bgColor || Color.neutral50};
  padding: 0;

  > img,
  svg {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`

export const CTATitle = styled.h6`
  font-size: 48px;
  font-weight: ${Font.weight.bold};
  color: ${Color.neutral0};
  margin: 0;
  line-height: 1.2;
  white-space: wrap;

  ${Media.upToMedium()} {
    font-size: 38px;
  }
`

export const CTASubtitle = styled.p`
  font-size: 28px;
  color: ${Color.neutral30};
  margin: 0;
  line-height: 1.2;
`

export const CTAButton = styled.a`
  --height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: var(--height);
  padding: 12px 24px;
  font-size: 24px;
  font-weight: ${Font.weight.medium};
  color: ${Color.neutral98};
  background: ${Color.neutral0};
  border: none;
  border-radius: var(--height);
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s ease-in-out, color 0.2s ease-in-out;

  &:hover {
    color: ${Color.neutral100};
    background: ${Color.neutral20};
  }
`

export const Breadcrumbs = styled.div<{ padding?: string }>`
  display: flex;
  justify-content: flex-start;
  font-size: 16px;
  line-height: 1.2;
  padding: ${({ padding }) => padding || '0 0 24px'};
  color: ${Color.neutral50};

  ${Media.upToMedium()} {
    flex-flow: column wrap;
    gap: 8px;
    font-size: 14px;
  }

  > h1 {
    font-size: inherit;
    margin: 0;
    line-height: inherit;
  }

  > a {
    color: ${Color.neutral50};
    text-decoration: none;
    margin-right: 8px;
    transition: color 0.2s ease-in-out;

    &:hover {
      color: ${Color.neutral0};
    }

    &:after {
      content: '→';
      margin-left: 8px;
    }

    &:last-child:after {
      content: '';
    }
  }

  > span {
    color: ${Color.neutral0};
  }
`

export const ArticleCount = styled.p`
  font-size: 16px;
  color: ${Color.neutral50};
`

export const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 24px auto 0;
  padding: 4px;
  background: ${Color.neutral100};
  border-radius: 21px;
  width: min-content;

  > a {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    border-radius: inherit;
    text-decoration: none;
    font-size: 16px;
    font-weight: ${Font.weight.medium};
    color: ${Color.neutral0};
    background: transparent;
    transition: background 0.2s, color 0.2s;

    &:hover {
      background: ${Color.neutral80};
    }

    &.active {
      background: ${Color.neutral0};
      color: ${Color.neutral100};
    }
  }

  span {
    font-size: 16px;
    color: ${Color.neutral60};
  }
`
