import React, { createContext, ReactElement, Suspense, useContext, useEffect, useState } from 'react'

import { getBlockExplorerUrl } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { Order } from '../../../api/operator'
import { useNetworkId } from '../../../state/network/hooks'
import { getOrderWrappers, ResolvedWrapper } from '../../../utils/getOrderWrappers'
import { RenderedData, WrapperHeader, WrapperItem, WrapperList } from './styled'

export const OrderCtx = createContext<Order | null>(null)

export function useOrderContext(): Order | null {
  return useContext(OrderCtx)
}

interface OrderWrapperDetailsProps {
  fullAppData: string | undefined
  order?: Order
  children: (content: ReactElement) => ReactElement
}

export function OrderWrapperDetails({ fullAppData, order, children }: OrderWrapperDetailsProps): ReactElement | null {
  const wrappers = getOrderWrappers(fullAppData)

  if (wrappers.length === 0) return null

  return (
    <OrderCtx.Provider value={order ?? null}>
      {children(
        <WrapperList>
          {wrappers.map((wrapper) => (
            <WrapperEntry key={wrapper.address} wrapper={wrapper} />
          ))}
        </WrapperList>,
      )}
    </OrderCtx.Provider>
  )
}

function WrapperEntry({ wrapper }: { wrapper: ResolvedWrapper }): ReactElement {
  const [Component, setComponent] = useState<React.ComponentType<{ data: string }> | null>(null)
  const { info, address, data, isOmittable } = wrapper
  const chainId = useNetworkId() as SupportedChainId | null

  useEffect(() => {
    if (!data) return
    wrapper.loadComponent().then((Comp) => setComponent(() => Comp))
  }, [wrapper, data])

  const addressUrl = chainId ? getBlockExplorerUrl(chainId, 'contract', address) : undefined

  return (
    <WrapperItem>
      <WrapperHeader>
        {info.image && <img src={info.image} alt={info.name} />}
        <strong>{info.name}</strong>
        {addressUrl ? (
          <a href={addressUrl} target="_blank" rel="noopener noreferrer" title={address}>
            ({address.slice(0, 6)}…{address.slice(-4)})
          </a>
        ) : (
          <span title={address}>
            ({address.slice(0, 6)}…{address.slice(-4)})
          </span>
        )}
        {isOmittable && <em>(omittable)</em>}
      </WrapperHeader>
      {Component && data && (
        <RenderedData>
          <Suspense fallback={<span>Loading…</span>}>
            <Component data={data} />
          </Suspense>
        </RenderedData>
      )}
    </WrapperItem>
  )
}
