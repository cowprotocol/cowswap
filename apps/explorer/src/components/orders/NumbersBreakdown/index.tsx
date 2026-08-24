import { PropsWithChildren, ReactNode } from 'react'

import { Media } from '@cowprotocol/ui'

import { ShowMoreButton } from 'components/common/ShowMoreButton'
import useSafeState from 'hooks/useSafeState'
import styled from 'styled-components/macro'

const DetailsWrapper = styled.div`
  display: flex;
  margin: 0 0 1rem;
  border-radius: 0.6rem;
  line-height: 1.6;
  width: max-content;
  align-items: flex-start;
  word-break: break-all;
  overflow: auto;
  border: 1px solid rgb(151 151 184 / 10%);
  background: rgb(151 151 184 / 10%);

  ${Media.upToSmall()} {
    width: 100%;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  td {
    padding: 0.1rem 0.5rem;
  }

  tr:not(:last-child) td {
    border-bottom: 1px solid rgb(151 151 184 / 15%);
  }
`

export const NumbersBreakdown = ({ children }: PropsWithChildren): ReactNode => {
  const [showDetails, setShowDetails] = useSafeState<boolean>(false)

  const handleToggle = (): void => {
    setShowDetails(!showDetails)
  }

  return (
    <>
      <ShowMoreButton onClick={handleToggle}>{showDetails ? '[-] Show less' : '[+] Show more'}</ShowMoreButton>
      {showDetails && <DetailsWrapper>{children}</DetailsWrapper>}
    </>
  )
}
