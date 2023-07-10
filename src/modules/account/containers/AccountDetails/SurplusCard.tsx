import QuestionHelper from 'legacy/components/QuestionHelper'
import { useHigherUSDValue } from 'legacy/hooks/useStablecoinPrice'
import { ExternalLink } from 'legacy/theme'
import { supportedChainId } from 'legacy/utils/supportedChainId'

import { useWalletInfo } from 'modules/wallet'

import { FiatAmount } from 'common/pure/FiatAmount'
import { TokenAmount } from 'common/pure/TokenAmount'
import { useTotalSurplus } from 'common/state/totalSurplusState'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'

import { InfoCard, SurplusCardWrapper } from './styled'

export function SurplusCard() {
  const { surplusAmount, isLoading } = useTotalSurplus()

  const showSurplusAmount = surplusAmount && surplusAmount.greaterThan(0)
  const surplusUsdAmount = useHigherUSDValue(showSurplusAmount ? surplusAmount : undefined)
  const nativeSymbol = useNativeCurrency()?.symbol || 'ETH'

  // TODO: Remove these 2 lines once merged in DEVELOP (this change was cherry-picked from it, and it still needs these two lines because it doesn't have sasha refactor for supportedChainId)
  const { chainId } = useWalletInfo()
  if (!supportedChainId(chainId)) return null
  // ------- end of TODO

  return (
    <SurplusCardWrapper>
      <InfoCard>
        <div>
          <span>
            <i>
              Your total surplus{' '}
              <QuestionHelper
                text={`The total surplus CoW Swap has generated for you in ${nativeSymbol} across all your trades since March 2023`}
              />
            </i>
          </span>
          <span>
            {isLoading ? (
              <p>Loading...</p>
            ) : showSurplusAmount ? (
              <b>
                +<TokenAmount amount={surplusAmount} tokenSymbol={surplusAmount?.currency} />
              </b>
            ) : (
              <p>No surplus for the given time period</p>
            )}
          </span>
          <small>{surplusUsdAmount && <FiatAmount amount={surplusUsdAmount} accurate={false} />}</small>
        </div>
        <div>
          <ExternalLink href={'https://blog.cow.fi/announcing-cow-swap-surplus-notifications-f679c77702ea'}>
            Learn about surplus on CoW Swap ↗
          </ExternalLink>
        </div>
      </InfoCard>
    </SurplusCardWrapper>
  )
}
