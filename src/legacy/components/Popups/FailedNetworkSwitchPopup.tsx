import { useContext } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { Trans } from '@lingui/macro'
import { AlertCircle } from 'react-feather'
import styled, { ThemeContext } from 'styled-components/macro'

import { AutoColumn } from 'legacy/components/Column'
import { AutoRow } from 'legacy/components/Row'
import { getChainInfo } from 'legacy/constants/chainInfo'

const RowNoFlex = styled(AutoRow)`
  flex-wrap: nowrap;
`

export function FailedNetworkSwitchPopup({ chainId }: { chainId: SupportedChainId }) {
  const chainInfo = getChainInfo(chainId)
  const theme = useContext(ThemeContext)

  return (
    <RowNoFlex>
      <div style={{ paddingRight: 16 }}>
        <AlertCircle color={theme.red1} size={24} />
      </div>
      <AutoColumn gap="8px">
        <Trans>
          <Trans>
            Failed to switch networks from the CoW Swap Interface. In order to use CoW Swap on {chainInfo?.label}, you
            must change the network in your wallet.
          </Trans>
        </Trans>
      </AutoColumn>
    </RowNoFlex>
  )
}
