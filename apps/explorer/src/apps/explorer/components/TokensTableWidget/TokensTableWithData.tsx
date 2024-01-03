import React, { useContext, useState, useEffect } from 'react'

import { EmptyItemWrapper } from 'components/common/StyledUserDetailsTable'
import useFirstRender from 'hooks/useFirstRender'
import { TokensTableContext } from 'apps/explorer/components/TokensTableWidget/context/TokensTableContext'
import TokenTable from 'components/token/TokenTable'
import { DEFAULT_TIMEOUT } from 'const'
import CowLoading from 'components/common/CowLoading'

export const TokensTableWithData: React.FC = () => {
  const { data: tokens, networkId, tableState } = useContext(TokensTableContext)
  const isFirstRender = useFirstRender()
  const [isFirstLoading, setIsFirstLoading] = useState(true)

  useEffect(() => {
    setIsFirstLoading(true)
  }, [networkId])

  useEffect(() => {
    let timeOutMs = 0
    if (!tokens) {
      timeOutMs = DEFAULT_TIMEOUT
    }

    const timeOutId: NodeJS.Timeout = setTimeout(() => {
      setIsFirstLoading(false)
    }, timeOutMs)

    return (): void => {
      clearTimeout(timeOutId)
    }
  }, [tokens, tokens?.length])

  return isFirstRender || isFirstLoading ? (
    <EmptyItemWrapper>
      <CowLoading />
    </EmptyItemWrapper>
  ) : (
    <TokenTable tokens={tokens} tableState={tableState} />
  )
}
