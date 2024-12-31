import { PropsWithChildren } from 'react'

import { Media } from '@cowprotocol/ui'

import useSafeState from 'hooks/useSafeState'
import styled from 'styled-components/macro'

const ShowMoreButton = styled.button`
  font-size: 1.4rem;
  border: none;
  background: none;
  color: ${({ theme }) => theme.textActive1};
  margin: 0;
  padding: 0;

  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`

const DetailsWrapper = styled.div`
  display: flex;
  margin: 1.8rem 0 1rem;
  border-radius: 0.6rem;
  line-height: 1.6;
  width: max-content;
  align-items: flex-start;
  word-break: break-all;
  overflow: auto;
  border: 1px solid rgb(151 151 184 / 10%);
  padding: 0.6rem;
  background: rgb(151 151 184 / 10%);

  ${Media.upToSmall()} {
    width: 100%;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }
`

type BreakdownProps = {
  showExpanded?: boolean
} & PropsWithChildren

export const NumbersBreakdown = ({ children, showExpanded = false }: BreakdownProps): React.ReactNode => {
  const [showDetails, setShowDetails] = useSafeState<boolean>(showExpanded)

  const handleToggle = async (): Promise<void> => {
    setShowDetails(!showDetails)
  }

  return (
    <>
      <ShowMoreButton onClick={handleToggle}>{showDetails ? '[-] Show less' : '[+] Show more'}</ShowMoreButton>
      {showDetails && <DetailsWrapper>{children}</DetailsWrapper>}
    </>
  )
}
