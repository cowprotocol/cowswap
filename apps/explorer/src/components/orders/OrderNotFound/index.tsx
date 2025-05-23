import React, { useEffect } from 'react'

import { Color, Media } from '@cowprotocol/ui'

import SupportIcon from 'assets/img/support.png'
import { BlockExplorerLink } from 'components/common/BlockExplorerLink'
import { useLocation, useNavigate, useParams } from 'react-router'
import styled from 'styled-components/macro'

import { Search } from '../../../explorer/components/common/Search'

const Wrapper = styled.div`
  max-width: 140rem;
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: flex-start;
  padding: 4.2rem 0 0;
  min-height: 50vh;

  ${Media.upToSmall()} {
    padding: 4.2rem 1.6rem 0;
  }
`

const Title = styled.h1`
  width: 100%;
  margin: 0 0 2.4rem;
  font-weight: ${({ theme }): string => theme.fontBold};
`

const Content = styled.div`
  width: 100%;
  font-size: 1.6rem;
  border: 0.1rem solid ${Color.explorer_border};
  padding: 2rem;
  border-radius: 0.4rem;

  p {
    line-height: ${({ theme }): string => theme.fontLineHeight};
    word-break: break-word;
  }

  strong {
    color: ${Color.explorer_textSecondary2};
  }
`

const SearchSection = styled.div`
  margin-top: 6rem;
  padding: 2rem;
  border-radius: 0.4rem;
  background-color: ${Color.explorer_bg2};
`

const LinkData = styled.p`
  font-size: 1.6rem;

  ${Media.upToSmall()} {
    line-height: 1.5;
  }
`

const SearchContent = styled.div`
  display: flex;
  flex-flow: row;
  align-items: center;
  gap: 2.5rem;

  ${Media.upToMedium()} {
    flex-flow: column wrap;
    gap: 1.5rem;

    form {
      width: 100%;
      input {
        width: 100%;
      }
    }
  }
`

const Support = styled.a`
  height: 5rem;
  border: 0.1rem solid ${Color.explorer_border};
  border-radius: 0.6rem;
  width: 16rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  cursor: pointer;
  color: ${Color.neutral100} !important;

  :hover {
    background-color: ${Color.explorer_greyOpacity};
    text-decoration: none;
  }
`

export const OrderAddressNotFound: React.FC = (): React.ReactNode => {
  const { searchString } = useParams<{ searchString: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { referrer, data } = location.state || { referrer: null, data: null }
  const wasRedirected = !!referrer
  const showLinkData = referrer === 'tx' && data
  // used after refresh by remove referrer state if was redirected
  useEffect(() => {
    window.addEventListener('beforeunload', () => {
      navigate(location.pathname, { replace: true })
    })

    return (): void => {
      window.removeEventListener('beforeunload', () => {
        navigate(location.pathname, { replace: true })
      })
    }
  }, [navigate, location.pathname])

  return (
    <Wrapper>
      <Title>No results found</Title>
      <Content>
        {searchString ? (
          <>
            <p>Sorry, no matches found.</p>
            {/* Disabled temporarily, until we can implement a way to validate search strings. */}
            {/*<p>
              <strong>&quot;{searchString}&quot;</strong>
            </p>*/}
          </>
        ) : (
          <p>The search cannot be empty</p>
        )}
        <SearchSection>
          <SearchContent>
            <Search searchString={wasRedirected ? '' : searchString} submitSearchImmediatly={!wasRedirected} />
            <span>or</span>
            <Support href="https://discord.com/invite/cowprotocol" target="_blank" rel="noopener noreferrer">
              Get Support
              <img src={SupportIcon} alt="Support icon" />
            </Support>
          </SearchContent>
        </SearchSection>
      </Content>
      {showLinkData && (
        <LinkData>
          This is not a CoW Protocol transaction. See it on <BlockExplorerLink {...data} />
        </LinkData>
      )}
    </Wrapper>
  )
}
