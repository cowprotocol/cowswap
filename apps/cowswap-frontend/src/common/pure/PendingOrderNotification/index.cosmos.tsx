import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { USDC_MAINNET, WBTC } from '@cowprotocol/common-const'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { SnackbarPopup } from '@cowprotocol/snackbars'
import { GnosisSafeInfo, gnosisSafeInfoAtom } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { useSelect, useValue } from 'react-cosmos/client'
import { CheckCircle } from 'react-feather'
import styled from 'styled-components/macro'

import { UiOrderType } from 'utils/orderUtils/getUiOrderType'

import { PendingOrderNotification } from './index'

const SuccessIcon = styled(CheckCircle)`
  color: ${({ theme }) => theme.green1};
`

const defaultOrderId =
  '0x62baf4be8adec4766d26a2169999cc170c3ead90ae11a28d658e6d75edc05b185b0abe214ab7875562adee331deff0fe1912fe42644d2bb7'

const Wrapper = styled.div`
  width: 560px;
  margin: 0 auto;
`

function Custom({
  orderType,
  orderId,
  isSafeWallet: isSafeWalletParam = false,
}: {
  orderType: UiOrderType
  orderId: string
  isSafeWallet?: boolean
}) {
  const setGnosisSafeInfo = useSetAtom(gnosisSafeInfoAtom)

  const [kind] = useSelect('kind', {
    options: [OrderKind.SELL, OrderKind.BUY],
    defaultValue: OrderKind.SELL,
  })

  const [account] = useValue('account', { defaultValue: '0xfb3c7eb936cAA12B5A884d612393969A557d4307' })
  const [receiver] = useValue('receiver', { defaultValue: '0xfb3c7eb936cAA12B5A884d612393969A557d4307' })
  const [inputAmountRaw] = useValue('inputAmount', { defaultValue: '500000' })
  const [outputAmountRaw] = useValue('outputAmount', { defaultValue: '1.2' })
  const [isSafeWallet] = useValue('isSafeWallet', { defaultValue: isSafeWalletParam })

  const inputAmount = CurrencyAmount.fromRawAmount(
    USDC_MAINNET,
    parseFloat(inputAmountRaw) * 10 ** USDC_MAINNET.decimals
  )
  const outputAmount = CurrencyAmount.fromRawAmount(WBTC, parseFloat(outputAmountRaw) * 10 ** WBTC.decimals)

  useEffect(() => {
    if (orderType === UiOrderType.TWAP) {
      setGnosisSafeInfo({} as unknown as GnosisSafeInfo)
    } else {
      setGnosisSafeInfo(undefined)
    }
  }, [orderType, setGnosisSafeInfo])

  return (
    <Wrapper>
      <SnackbarPopup
        id="PendingOrderNotification"
        icon={<SuccessIcon size={24} />}
        duration={100_000}
        onExpire={() => console.log('expire')}
      >
        <PendingOrderNotification
          account={account}
          chainId={SupportedChainId.MAINNET}
          orderId={orderId}
          kind={kind}
          receiver={receiver}
          orderType={orderType}
          inputAmount={inputAmount}
          outputAmount={outputAmount}
          isSafeWallet={isSafeWallet}
        />
      </SnackbarPopup>
    </Wrapper>
  )
}

const Fixtures = {
  swap: <Custom orderType={UiOrderType.SWAP} orderId={defaultOrderId} />,
  limit: <Custom orderType={UiOrderType.LIMIT} orderId={defaultOrderId} />,
  twap: (
    <Custom orderType={UiOrderType.TWAP} orderId="0xc554e6c5612af4796c3c5cd817cea13f012f0807c9ce5e18cdf51e911701eeff" />
  ),
  swapSafe: <Custom orderType={UiOrderType.SWAP} orderId={defaultOrderId} isSafeWallet />,
  limitSafe: <Custom orderType={UiOrderType.LIMIT} orderId={defaultOrderId} isSafeWallet />,
  twapSafe: (
    <Custom
      orderType={UiOrderType.TWAP}
      orderId="0xc554e6c5612af4796c3c5cd817cea13f012f0807c9ce5e18cdf51e911701eeff"
      isSafeWallet
    />
  ),
}

export default Fixtures
