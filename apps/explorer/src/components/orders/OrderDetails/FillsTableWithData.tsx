import React, { useContext } from 'react'

import { Command } from '@cowprotocol/types'

import CowLoading from 'components/common/CowLoading'
import useFirstRender from 'hooks/useFirstRender'

import { Order } from 'api/operator'

import { FillsTableContext } from './context/FillsTableContext'
import { FillsTable } from './FillsTable'

export type FillsTableWithDataProps = {
  areTokensLoaded: boolean
  order: Order | null
  isPriceInverted: boolean
  invertPrice: Command
}

export const FillsTableWithData: React.FC<FillsTableWithDataProps> = ({
  areTokensLoaded,
  order,
  isPriceInverted,
  invertPrice,
}) => {
  const { data: trades, tableState } = useContext(FillsTableContext)
  const isFirstRender = useFirstRender()

  return isFirstRender && !areTokensLoaded ? (
    <CowLoading />
  ) : (
    <FillsTable
      order={order}
      trades={trades}
      tableState={tableState}
      isPriceInverted={isPriceInverted}
      invertPrice={invertPrice}
    />
  )
}
