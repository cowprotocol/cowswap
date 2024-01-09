import React, { useEffect } from 'react'
import { useParams } from 'react-router'
import { useLocation, useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { Search } from 'apps/explorer/components/common/Search'
import SupportIcon from 'assets/img/support.png'
import { MEDIA } from 'const'
import { BlockExplorerLink } from 'components/common/BlockExplorerLink'

const Title = styled.h1`
  margin: 0.55rem 0 2.5rem;
  font-weight: ${({ theme }): string => theme.fontBold};
`

const Content = styled.div`
  font-size: 16px;
  border: 0.1rem solid ${({ theme }): string => theme.borderPrimary};
  padding: 20px;
  border-radius: 0.4rem;

  p {
    line-height: ${({ theme }): string => theme.fontLineHeight};
    word-break: break-word;
  }

  strong {
    color: ${({ theme }): string => theme.textSecondary2};
  }
`

const SearchSection = styled.div`
  margin-top: 6rem;
  padding: 20px;
  border-radius: 0.4rem;
  background-color: ${({ theme }): string => theme.bg2};
`

const LinkData = styled.p`
  font-size: 1.6rem;
  @media ${MEDIA.mobile} {
    line-height: 1.5;
  }
`

const SearchContent = styled.div`
  display: flex;
  flex-flow: row;
  align-items: center;
  gap: 2.5rem;

  @media ${MEDIA.mediumDown} {
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
  border: 1px solid ${({ theme }): string => theme.borderPrimary};
  border-radius: 0.6rem;
  width: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  cursor: pointer;
  color: ${({ theme }): string => theme.white} !important;

  :hover {
    background-color: ${({ theme }): string => theme.greyOpacity};
    text-decoration: none;
  }
`
interface LocationState {
  referrer: string
  data: unknown
}
export const OrderAddressNotFound: React.FC = (): JSX.Element => {
  const { searchString } = useParams<{ searchString: string }>()
  const location = useLocation<LocationState>()
  const history = useHistory()
  const { referrer, data } = location.state || { referrer: null, data: null }
  const wasRedirected = referrer ? true : false
  const showLinkData = referrer === 'tx' && data
  // used after refresh by remove referrer state if was redirected
  useEffect(() => {
    window.addEventListener('beforeunload', () => {
      history.replace(location.pathname, null)
    })

    return (): void => {
      window.removeEventListener('beforeunload', () => {
        history.replace(location.pathname, null)
      })
    }
  }, [history, location.pathname])

  return (
    <>
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
              <img src={SupportIcon} />
            </Support>
          </SearchContent>
        </SearchSection>
      </Content>
      {showLinkData && (
        <LinkData>
          This is not a CoW Protocol transaction. See it on <BlockExplorerLink {...(data as never)} />
        </LinkData>
      )}
    </>
  )
}
