import { Color, Media } from '@cowprotocol/ui'

import * as CSS from 'csstype'
import { Link } from 'react-router'
import styled from 'styled-components/macro'

import { RowWithCopyButton } from '../../components/common/RowWithCopyButton'
import { Search } from '../components/common/Search'

export const Wrapper = styled.div`
  padding: 1.6rem;
  margin: 0 auto;
  width: 100%;
  flex-grow: 1;
  align-items: center;
  max-width: 100%;

  ${Media.upToMedium()} {
    padding: 0 0 4.2rem;
  }

  > h1 {
    display: flex;
    padding: 2.4rem 0;
    align-items: center;
    font-weight: ${({ theme }): string => theme.fontBold};
    margin: 0;
  }
`

export const FlexContainerVar = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1.6rem;
  align-items: center;
  margin: 2.4rem 0;

  > h1 {
    line-height: 1.2;
  }

  ${Media.upToMedium()} {
    padding: 0 1.6rem;
  }

  ${Media.upToSmall()} {
    justify-content: center;
  }
`

export const TitleAddress = styled(RowWithCopyButton)`
  font-size: ${({ theme }): string => theme.fontSizeDefault};
  font-weight: ${({ theme }): string => theme.fontNormal};
  margin: 0 0 0 1.5rem;

  ${Media.upToSmall()} {
    font-size: 1.2rem;
  }
  a {
    display: flex;
    align-items: center;
  }
`

export const FlexWrap = styled.div<Partial<CSS.Properties & { grow?: number }>>`
  display: flex;
  align-items: center;
  flex-grow: ${({ grow }): string => `${grow}` || '0'};
`

export const StyledLink = styled(Link)`
  height: 5rem;
  border: 0.1rem solid ${Color.explorer_border};
  border-radius: 0.6rem;
  width: 16rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 1 auto;
  cursor: pointer;
  color: ${(): string => Color.neutral100} !important;

  :hover {
    background-color: ${Color.explorer_greyOpacity};
    text-decoration: none;
  }
`

export const Title = styled.h1`
  margin: 2.4rem 0;
  font-weight: ${({ theme }): string => theme.fontBold};
`

export const ContentCard = styled.div`
  font-size: 1.6rem;
  border: 0.1rem solid ${Color.explorer_border};
  padding: 20px;
  border-radius: 0.4rem;
  min-height: 23rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  p {
    line-height: ${({ theme }): string => theme.fontLineHeight};
    overflow-wrap: break-word;
  }
`

export const StyledSearch = styled(Search)`
  width: calc(100% - 3.2rem);
  max-width: 60rem;

  ${Media.upToMedium()} {
    margin: 1.6rem;
  }
`
