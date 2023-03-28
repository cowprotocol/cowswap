import { CurrencySelectButton, CurrencySelectButtonProps } from '@cow/modules/swap/pure/CurrencySelectButton/index'
import { useSelect } from 'react-cosmos/fixture'
import { COW, GNO } from 'constants/tokens'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

const COW_TOKEN = COW[SupportedChainId.MAINNET]
const GNO_TOKEN = GNO[SupportedChainId.MAINNET]

function useCustomProps(): CurrencySelectButtonProps {
  const [currencyRaw] = useSelect('currency', {
    options: [COW_TOKEN.symbol || '', GNO_TOKEN.symbol || ''],
    defaultValue: COW_TOKEN.symbol || '',
  })

  const currency = currencyRaw === COW_TOKEN.symbol ? COW_TOKEN : GNO_TOKEN

  return { currency, loading: false }
}

const Custom = () => {
  return <CurrencySelectButton {...useCustomProps()} />
}

export default Custom
