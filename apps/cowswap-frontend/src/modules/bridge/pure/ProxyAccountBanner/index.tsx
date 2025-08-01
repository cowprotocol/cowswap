import { ReactNode } from 'react'

import { ACCOUNT_PROXY_LABEL } from '@cowprotocol/common-const'
import { BannerOrientation, CollapsibleInlineBanner, StatusColorVariant } from '@cowprotocol/ui'

import { useSetShedModal } from 'entities/cowShed/useCowShedModal'

import { AddressLink } from 'common/pure/AddressLink'

interface ProxyAccountBannerProps {
  recipient: string
  chainId: number
}

export function ProxyAccountBanner({ recipient, chainId }: ProxyAccountBannerProps): ReactNode {
  const setCowShedModal = useSetShedModal()

  const handleReadMore = (): void => {
    setCowShedModal((state) => ({
      ...state,
      isOpen: true,
    }))
  }
  return (
    <CollapsibleInlineBanner
      bannerType={StatusColorVariant.Info}
      orientation={BannerOrientation.Horizontal}
      fontSize={13}
      collapsedContent={
        <div>
          Swap bridged via your {ACCOUNT_PROXY_LABEL}: <AddressLink address={recipient} chainId={chainId} />
        </div>
      }
      expandedContent={
        <div>
          CoW Swap uses a dedicated {ACCOUNT_PROXY_LABEL}, controlled only by you, to ensure smooooth bridging. Confirm the
          recipient address above is <AddressLink address={recipient} chainId={chainId} />
          <br />
          <br />
          <b onClick={handleReadMore} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
            View your private {ACCOUNT_PROXY_LABEL} +{' '}
          </b>
        </div>
      }
    />
  )
}
