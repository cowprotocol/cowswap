import React, { useContext } from 'react'

import { Command } from '@cowprotocol/types'

import CowLoading from 'components/common/CowLoading'
import { EmptyItemWrapper } from 'components/common/StyledUserDetailsTable'
import useFirstRender from 'hooks/useFirstRender'

import { Order } from 'api/operator'

import { FillsTableContext } from './context/FillsTableContext'
import FillsTable from './FillsTable'


type Props = {
  areTokensLoaded: boolean
  order: Order | null
  isPriceInverted: boolean
  invertPrice: Command
}

export const FillsTableWithData: React.FC<Props> = ({ areTokensLoaded, order, isPriceInverted, invertPrice }) => {
  const { trades, tableState } = useContext(FillsTableContext)
  const isFirstRender = useFirstRender()

  return isFirstRender || !areTokensLoaded ? (
    <EmptyItemWrapper>
      <CowLoading />
    </EmptyItemWrapper>
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
