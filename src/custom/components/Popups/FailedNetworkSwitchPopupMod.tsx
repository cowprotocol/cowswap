import { Trans } from '@lingui/macro'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useContext } from 'react'
import { AlertCircle } from 'react-feather'
import styled, { ThemeContext } from 'styled-components/macro'

import { AutoColumn } from 'components/Column'
import { AutoRow } from 'components/Row'

import { getChainInfo } from 'constants/chainInfo'
import { useMemo } from 'react'
import UnsupportedNetworkMessage from 'components/UnsupportedNetworkMessage'

const RowNoFlex = styled(AutoRow)`
  flex-wrap: nowrap;
`

export default function FailedNetworkSwitchPopup({
  chainId,
  isUnsupportedNetwork = false,
}: {
  chainId: SupportedChainId
  isUnsupportedNetwork?: boolean
}) {
  const chainInfo = getChainInfo(chainId)
  const theme = useContext(ThemeContext)

  const errorMessage = useMemo(() => {
    return isUnsupportedNetwork ? (
      <UnsupportedNetworkMessage />
    ) : (
      <Trans>
        Failed to switch networks from the CoW Swap Interface. In order to use CoW Swap on {chainInfo?.label}, you must
        change the network in your wallet.
      </Trans>
    )
  }, [chainInfo, isUnsupportedNetwork])

  return (
    <RowNoFlex>
      <div style={{ paddingRight: 16 }}>
        <AlertCircle color={isUnsupportedNetwork ? theme.red3 : theme.red1} size={24} />
      </div>
      <AutoColumn gap="8px">
        <Trans>{errorMessage}</Trans>
      </AutoColumn>
    </RowNoFlex>
  )
}
