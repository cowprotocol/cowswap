import { Trans } from '@lingui/macro'
import { SupportedChainId } from 'constants/chains'
import { useContext } from 'react'
import { AlertCircle } from 'react-feather'
import styled, { ThemeContext } from 'styled-components/macro'

import { ThemedText } from 'theme'
import { AutoColumn } from 'components/Column'
import { AutoRow } from 'components/Row'

import { NETWORK_SELECTOR_CHAINS } from 'components/Header/NetworkSelector/NetworkSelectorMod'
import { getChainInfo } from 'constants/chainInfo'
import { useMemo } from 'react'

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

  const getErrorMessage = useMemo(() => {
    return isUnsupportedNetwork
      ? 'Please connect your wallet to one of our supported networks: ' +
          NETWORK_SELECTOR_CHAINS.map((chainId) => getChainInfo(chainId)?.label)
            .filter(Boolean)
            .join(', ')
      : `Failed to switch networks from the CoW Swap Interface. In order to use CoW Swap on ${chainInfo?.label}, you must change the network in your wallet.`
  }, [chainInfo, isUnsupportedNetwork])

  return (
    <RowNoFlex>
      <div style={{ paddingRight: 16 }}>
        <AlertCircle color={isUnsupportedNetwork ? theme.red3 : theme.red1} size={24} />
      </div>
      <AutoColumn gap="8px">
        <ThemedText.Body fontWeight={500} color={isUnsupportedNetwork ? theme.text2 : theme.text1}>
          <Trans>{getErrorMessage}</Trans>
        </ThemedText.Body>
      </AutoColumn>
    </RowNoFlex>
  )
}
