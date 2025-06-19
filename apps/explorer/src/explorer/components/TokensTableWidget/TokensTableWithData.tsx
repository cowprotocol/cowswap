import React, { useContext, useState, useEffect } from 'react'

import { TokensTableContext } from './context/TokensTableContext'

import { LoadingWrapper } from '../../../components/common/LoadingWrapper'
import TokenTable from '../../../components/token/TokenTable'
import { DEFAULT_TIMEOUT } from '../../../const'
import useFirstRender from '../../../hooks/useFirstRender'

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

  return isFirstRender || isFirstLoading ? <LoadingWrapper message="Loading tokens" /> : <TokenTable tokens={tokens} tableState={tableState} />
}
