import { BalanceDisplay, ConvertWrapper, VestingBreakdown } from 'pages/Profile/styled'
import { Card } from './styled'
import { ButtonPrimary } from 'custom/components/Button'
import { HelpCircle } from 'components/Page'
import { MouseoverTooltipContent } from 'components/Tooltip'
import cowImage from 'assets/cow-swap/cow_v2.svg'
import SVG from 'react-inlinesvg'
import ArrowIcon from 'assets/cow-swap/arrow.svg'
import { AMOUNT_PRECISION } from 'constants/index'
import { useBalances } from './hooks'
import { formatSmartLocaleAware } from '@src/custom/utils/format'

const LockedGnoVesting: React.FC = () => {
  const { allocated, vested, claimed } = useBalances()
  const allocatedFormatted = formatSmartLocaleAware(allocated, AMOUNT_PRECISION) || '0'
  const vestedFormatted = formatSmartLocaleAware(vested, AMOUNT_PRECISION) || '0'
  const unvestedFormatted = formatSmartLocaleAware(allocated.subtract(vested), AMOUNT_PRECISION) || '0'
  const claimableFormatted = formatSmartLocaleAware(vested.subtract(claimed), AMOUNT_PRECISION) || '0'
  return (
    <Card>
      <BalanceDisplay hAlign="left">
        <img src={cowImage} alt="COW token" width="56" height="56" />
        <span>
          <i>COW vesting from locked GNO</i>
          <b>
            {allocatedFormatted} COW{' '}
            <MouseoverTooltipContent
              content={
                <VestingBreakdown>
                  <span>
                    <i>Unvested</i> <p>{unvestedFormatted} COW</p>
                  </span>
                  <span>
                    <i>Vested</i> <p>{vestedFormatted} COW</p>
                  </span>
                </VestingBreakdown>
              }
            >
              <HelpCircle size={14} />
            </MouseoverTooltipContent>
          </b>
        </span>
      </BalanceDisplay>
      <ConvertWrapper>
        <BalanceDisplay titleSize={18} altColor={true}>
          <i>
            Vested{' '}
            <MouseoverTooltipContent
              content={
                <div>
                  <p>
                    <strong>COW vesting from the GNO lock</strong> is vested linearly over four years, starting on Fri
                    Feb 11 2022 at 13:05:15 GMT.
                  </p>
                  <p>Each time you claim, you will receive the entire vested amount.</p>
                </div>
              }
            >
              <HelpCircle size={14} />
            </MouseoverTooltipContent>
          </i>
          <b>{claimableFormatted}</b>
        </BalanceDisplay>
        <ButtonPrimary>
          Claim COW <SVG src={ArrowIcon} />
        </ButtonPrimary>
      </ConvertWrapper>
    </Card>
  )
}

export default LockedGnoVesting
