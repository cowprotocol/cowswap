import React, { PropsWithChildren } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { Color, Media, ProductLogo, ProductVariant } from '@cowprotocol/ui'

import { Link } from 'react-router-dom'
import styled from 'styled-components/macro'
import { media } from 'theme/styles/media'

const HeaderStyled = styled.header`
  height: auto;
  margin: 2.2rem auto 0;
  position: relative;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding: 0 1.6rem;
  max-width: 140rem;
  z-index: 5;

  ${media.mediumDown} {
    max-width: 94rem;
  }

  ${media.mobile} {
    max-width: 100%;
  }
`

const Logo = styled(Link)`
  padding: 0;
  margin: 0 1rem 0 0;
  display: flex;
  align-content: center;
  justify-content: center;
  z-index: 6;
  transition: transform 0.3s ease 0s;

  &:hover {
    text-decoration: none;
    transform: rotate(-5deg);
    transition: transform 0.3s ease 0s;
    ${media.mobile} {
      transform: none;
    }
  }

  > img {
    border: 0;
    object-fit: contain;
    width: 100%;
    height: 100%;
    margin: auto;
  }

  > span {
    margin: 0 0 0 1rem;
    display: flex;
    align-content: center;
    justify-content: center;
    color: ${({ theme }): string => theme.textPrimary1};
  }

  ${media.xSmallDown} {
    > img {
      max-width: 11.5rem;
    }
  }
`

type Props = PropsWithChildren<{
  linkTo?: string
  onClickOptional?: React.MouseEventHandler<HTMLAnchorElement>
}>

export const Header: React.FC<Props> = ({ children, linkTo, onClickOptional }) => {
  const isUpToMedium = useMediaQuery(Media.upToMedium(false))

  return (
    <HeaderStyled>
      <Logo to={linkTo || '/'} onClick={(event): void => onClickOptional && onClickOptional(event)}>
        <ProductLogo
          theme={'dark'}
          variant={ProductVariant.CowExplorer}
          overrideColor={Color.neutral100}
          logoIconOnly={isUpToMedium}
        />
      </Logo>
      {children}
    </HeaderStyled>
  )
}
