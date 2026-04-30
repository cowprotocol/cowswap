import { ReactNode, useEffect } from 'react'

import { PAGE_TITLES } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'
import { useLocation, useParams } from 'react-router'

import { PageTitle } from 'modules/application'
import { getDefaultTradeRawState, PageWrapper, parameterizeTradeRoute, PrimaryWrapper } from 'modules/trade'
import { YieldWidget, YieldUpdaters } from 'modules/yield'

import { Routes } from 'common/constants/routes'
import { useNavigate } from 'common/hooks/useNavigate'

const TRADE_PAGE_MAX_WIDTH = '1800px'

export default function YieldPage(): ReactNode {
  const params = useParams()
  const { i18n } = useLingui()

  if (!params.chainId) {
    return <YieldPageRedirect />
  }

  return (
    <>
      <PageTitle title={i18n._(PAGE_TITLES.YIELD)} />
      <YieldUpdaters />
      <PageWrapper isUnlocked maxWidth={TRADE_PAGE_MAX_WIDTH} hideOrdersTable>
        <PrimaryWrapper>
          <YieldWidget />
        </PrimaryWrapper>
      </PageWrapper>
    </>
  )
}

function YieldPageRedirect(): ReactNode {
  const { chainId } = useWalletInfo()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const defaultState = getDefaultTradeRawState(chainId)
    const searchParams = new URLSearchParams(location.search)
    const inputCurrencyId = searchParams.get('inputCurrency') || defaultState.inputCurrencyId || undefined
    const outputCurrencyId = searchParams.get('outputCurrency') || defaultState.outputCurrencyId || undefined

    searchParams.delete('inputCurrency')
    searchParams.delete('outputCurrency')
    searchParams.delete('chain')

    const pathname = parameterizeTradeRoute(
      {
        chainId: String(chainId),
        inputCurrencyId,
        outputCurrencyId,
        inputCurrencyAmount: undefined,
        outputCurrencyAmount: undefined,
        orderKind: undefined,
      },
      Routes.YIELD,
    )

    navigate({ pathname, search: searchParams.toString() }, { replace: true })
  }, [chainId, location.search, navigate])

  return null
}
