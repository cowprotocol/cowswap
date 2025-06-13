import { useCallback } from 'react'

import { ExternalLink, Row } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Text } from 'rebass'

import { AutoColumn } from 'legacy/components/Column'
import useCowBalanceAndSubsidy from 'legacy/hooks/useCowBalanceAndSubsidy'

import { CowModal } from 'common/pure/Modal'

import { SUBSIDY_INFO_MESSAGE } from './constants'
import SubsidyTable from './SubsidyTable'

import CowBalance from '../CowBalance'
import {
  ConfirmationModalContentProps,
  LegacyConfirmationModalContent,
} from '../TransactionConfirmationModal/LegacyConfirmationModalContent'

export type CowSubsidy = { tier: number; discount: number }
export interface CowSubsidyInfoProps {
  account?: string
  balance?: CurrencyAmount<Currency>
  subsidy: CowSubsidy
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const CowSubsidyInfo = ({ account, balance, subsidy }: CowSubsidyInfoProps) => (
  <AutoColumn style={{ marginTop: 32 }} gap="18px" justify="center">
    <Text fontWeight={400} fontSize={15} style={{ textAlign: 'center', width: '100%', wordBreak: 'break-word' }}>
      {SUBSIDY_INFO_MESSAGE}
    </Text>
    {/* VCOW LOGO */}
    {account && <CowBalance account={account} balance={balance} />}
    <SubsidyTable {...subsidy} />
  </AutoColumn>
)

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function CowSubsidyModal({
  isOpen,
  onDismiss,
  ...restProps
}: { isOpen: boolean } & Omit<ConfirmationModalContentProps, 'title' | 'topContent'>) {
  const { account, chainId } = useWalletInfo()

  const { subsidy, balance } = useCowBalanceAndSubsidy()

  const TopContent = useCallback(
    () => <CowSubsidyInfo account={account ?? undefined} balance={balance} subsidy={subsidy} />,
    [account, balance, subsidy]
  )

  const BottomContent = useCallback(
    () => (
      <Row style={{ justifyContent: 'center' }}>
        <ExternalLink href="https://medium.com/@cow-protocol/cow-token-is-moving-forward-at-full-speed-d9f047a23b57">
          Read more about the tokenomics
        </ExternalLink>
      </Row>
    ),
    []
  )

  if (!chainId) return null

  // TODO: use TradeConfirmModal
  return (
    <CowModal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90} maxWidth={500} padding={'12px 0 18px'}>
      <LegacyConfirmationModalContent
        {...restProps}
        title="CoWmunity fees discount"
        titleSize={21}
        styles={{ textAlign: 'center', width: '100%' }}
        onDismiss={onDismiss}
        topContent={TopContent}
        bottomContent={BottomContent}
      />
    </CowModal>
  )
}
