import { useAtomValue } from 'jotai'
import { ReactNode, ChangeEvent } from 'react'

import alertCircle from '@cowprotocol/assets/cow-swap/alert-circle.svg'
import orderPresignaturePending from '@cowprotocol/assets/cow-swap/order-presignature-pending.svg'
import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import { tabParamAtom } from 'modules/ordersTable/state/params/ordersTableParams.atoms'
import { ordersTableTabsAtom } from 'modules/ordersTable/state/tabs/ordersTableTabs.atom'

import { useNavigate } from 'common/hooks/useNavigate'

import * as styledEl from './OrdersTabs.styled'

import { useGetBuildOrdersTableUrl } from '../../hooks/url/useGetBuildOrdersTableUrl'
import { OrderTabId } from '../../state/tabs/ordersTableTabs.constants'

export function OrdersTabs(): ReactNode {
  const { i18n } = useLingui()
  const { account } = useWalletInfo()
  const buildOrdersTableUrl = useGetBuildOrdersTableUrl()
  const navigate = useNavigate()

  const tabs = useAtomValue(ordersTableTabsAtom)
  const currentTabId = useAtomValue(tabParamAtom)

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const tabId = event.target.value as OrderTabId
    navigate(buildOrdersTableUrl({ tabId, pageNumber: 1 }))
  }

  return (
    <>
      <styledEl.SelectContainer>
        <styledEl.Select value={currentTabId} onChange={handleSelectChange}>
          {tabs.map((tab) => {
            const isUnfillable = tab.id === 'unfillable'
            const isSigning = tab.id === 'signing'
            return (
              <option key={tab.id} value={tab.id}>
                {isUnfillable && '⚠️ '}
                {isSigning && '⏳ '}
                {i18n._(tab.title)} {account && `(${tab.count})`}
              </option>
            )
          })}
        </styledEl.Select>
      </styledEl.SelectContainer>

      <styledEl.Tabs>
        {tabs.map((tab) => {
          const isUnfillable = tab.id === 'unfillable'
          const isSigning = tab.id === 'signing'
          return (
            <styledEl.TabButton
              key={tab.id}
              $isActive={tab.id === currentTabId}
              $isUnfillable={isUnfillable}
              $isSigning={isSigning}
              $isDisabled={!account}
              to={buildOrdersTableUrl({ tabId: tab.id, pageNumber: 1 })}
            >
              {isUnfillable && <SVG src={alertCircle} description={t`warning`} />}
              {isSigning && <SVG src={orderPresignaturePending} description={t`signing`} />}
              {i18n._(tab.title)} {account && <span>({tab.count})</span>}
            </styledEl.TabButton>
          )
        })}
      </styledEl.Tabs>
    </>
  )
}
