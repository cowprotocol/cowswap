import { COW, GNO_MAINNET } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useSelect } from 'react-cosmos/client'

import { CurrencySelectButton, CurrencySelectButtonProps } from 'common/pure/CurrencySelectButton/index'

const COW_TOKEN = COW[SupportedChainId.MAINNET]
const GNO_TOKEN = GNO_MAINNET

function useCustomProps(): CurrencySelectButtonProps {
  const [currencyRaw] = useSelect('currency', {
    options: [COW_TOKEN.symbol || '', GNO_TOKEN.symbol || ''],
    defaultValue: COW_TOKEN.symbol || '',
  })

  const currency = currencyRaw === COW_TOKEN.symbol ? COW_TOKEN : GNO_TOKEN

  return { currency, loading: false }
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const Custom = () => {
  return <CurrencySelectButton {...useCustomProps()} />
}

export default Custom
