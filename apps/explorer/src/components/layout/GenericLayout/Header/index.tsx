import React, { PropsWithChildren } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { Color, Media, ProductLogo, ProductVariant } from '@cowprotocol/ui'

import { Link } from 'react-router'
import styled from 'styled-components/macro'

const HeaderStyled = styled.header`
  height: auto;
  margin: 2.2rem auto 0;
  position: relative;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding: 0 1.6rem;
  width: 100%;
  max-width: 100%;
  z-index: 5;
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

    ${Media.upToSmall()} {
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
    margin: 0;
    display: flex;
    align-content: center;
    justify-content: center;
    color: ${Color.explorer_textPrimary};
  }

  ${Media.upToExtraSmall()} {
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
          variant={ProductVariant.CowExplorer}
          overrideColor={Color.neutral100}
          logoIconOnly={isUpToMedium}
        />
      </Logo>
      {children}
    </HeaderStyled>
  )
}
