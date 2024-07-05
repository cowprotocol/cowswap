import { useCallback, useEffect } from 'react'

import { Media } from '@cowprotocol/ui'

import Spinner from 'components/common/Spinner'
import { Notification } from 'components/Notification'
import useSafeState from 'hooks/useSafeState'
import styled from 'styled-components/macro'

const ShowMoreButton = styled.button`
  font-size: 1.2rem;
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
  fetchData: () => Promise<any>
  renderContent: (data: any) => React.ReactNode
  showExpanded?: boolean
}

export const NumbersBreakdown = ({
  fetchData,
  renderContent,
  showExpanded = false,
}: BreakdownProps): React.ReactNode => {
  const [loading, setLoading] = useSafeState(false)
  const [error, setError] = useSafeState(false)
  const [detailedData, setDetailedData] = useSafeState<any | undefined>(undefined)
  const [showDetails, setShowDetails] = useSafeState<boolean>(showExpanded)

  const handleFetchData = useCallback(async (): Promise<void> => {
    setLoading(true)
    try {
      const result = await fetchData()
      setDetailedData(result)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [fetchData, setLoading, setError])

  useEffect(() => {
    if (showExpanded) {
      handleFetchData().catch(console.error)
    }
  }, [showExpanded, handleFetchData])

  const handleToggle = async (): Promise<void> => {
    if (!showDetails) {
      await handleFetchData()
    }
    setShowDetails(!showDetails)
  }

  const renderData = (): React.ReactNode | null => {
    if (loading) return <Spinner />
    if (error)
      return <Notification type="error" message="Error when getting details." closable={false} appendMessage={false} />
    return detailedData ? renderContent(detailedData) : null
  }

  return (
    <>
      <ShowMoreButton onClick={handleToggle}>{showDetails ? '[-] Show less' : '[+] Show more'}</ShowMoreButton>
      {showDetails && <DetailsWrapper>{renderData()}</DetailsWrapper>}
    </>
  )
}
