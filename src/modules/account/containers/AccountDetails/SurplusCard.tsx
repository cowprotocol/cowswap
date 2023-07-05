import { MouseoverTooltipContent } from 'legacy/components/Tooltip'
import { useHigherUSDValue } from 'legacy/hooks/useStablecoinPrice'
import { ExternalLink } from 'legacy/theme'
import { supportedChainId } from 'legacy/utils/supportedChainId'

import { useWalletInfo } from 'modules/wallet'

import { FiatAmount } from 'common/pure/FiatAmount'
import { HelpCircle } from 'common/pure/HelpCircle'
import { TokenAmount } from 'common/pure/TokenAmount'
import { useTotalSurplus } from 'common/state/totalSurplusState'

import { InfoCard } from './styled'

export function SurplusCard() {
  const { surplusAmount, isLoading } = useTotalSurplus()

  const surplusUsdAmount = useHigherUSDValue(surplusAmount)

  const { chainId } = useWalletInfo()

  if (!supportedChainId(chainId)) return null

  return (
    <InfoCard>
      <span>
        Your total surplus{' '}
        <MouseoverTooltipContent content={'TODO: insert tooltip'} wrap>
          <HelpCircle size={14} />
        </MouseoverTooltipContent>
      </span>
      <span>
        {isLoading
          ? 'Loading...'
          : surplusAmount && (
              <>
                +<TokenAmount amount={surplusAmount} tokenSymbol={surplusAmount?.currency} />
              </>
            )}
        {!surplusAmount && 'No surplus for the given time period'}
      </span>
      {surplusUsdAmount && <FiatAmount amount={surplusUsdAmount} accurate={false} />}
      {/* TODO: add correct link */}
      <ExternalLink href={'https://swap.cow.fi'}>Learn about surplus on CoW Swap ↗</ExternalLink>
    </InfoCard>
  )
}
