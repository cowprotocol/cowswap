import styled from 'styled-components/macro'
import { Media, Color } from '@cowprotocol/ui'

export const Wrapper = styled.div`
  --tokenSize: 2.6rem;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 126rem;
  margin: 0 auto;
  padding: 0 1.6rem;
  color: ${Color.neutral10};

  ${Media.upToSmall()} {
    max-width: 100%;
    padding: 0 2.4rem;
  }

  h1 {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 0 0 1.6rem;
  }

  h1 > span {
    font-size: 1.3rem;
  }
`

export const SearchTokens = styled.input`
  width: 100%;
  border: 1px solid transparent;
  border-radius: 1.6rem;
  background: ${Color.neutral80};
  padding: 1rem 1rem;
  margin: 0 auto 1.6rem;
  color: ${Color.neutral30};
  font-size: 1.8rem;
  transition: border-color 0.2s ease-in-out, background-color 0.2s ease-in-out, color 0.2s ease-in-out;
  outline: 0;
`

export const TokenTable = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
`

export const HeaderItem = styled.div`
  display: grid;
  grid-template-columns: 0.1fr 3fr 1fr 1fr 1fr 1fr;
  align-items: center;
  justify-content: flex-start;
  padding: 1rem 0;
  border-bottom: 1px solid ${Color.neutral10};
  gap: 1.4rem;
  width: 100%;

  ${Media.upToSmall()} {
    grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
    padding: 2.4rem 0;
  }

  > div {
    font-weight: bold;
  }
`

export const ListItem = styled(HeaderItem)``
export const ListItemValue = styled.span<{ color?: string }>`
  font-size: 14px;
  color: ${({ color }) => color || 'inherit'};
`

export const PlacerholderImage = styled.div`
  width: var(--tokenSize);
  height: var(--tokenSize);
  border-radius: var(--tokenSize);
  background-color: ${Color.neutral10};
`

export const NoTokensText = styled.div`
  font-size: 2rem;
  padding: 2rem 1rem 1rem;
  color: ${Color.neutral0};
`
