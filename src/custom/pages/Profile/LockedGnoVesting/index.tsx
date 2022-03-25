import {
  FlexCol,
  FlexWrap,
  Wrapper,
  Container,
  GridWrap,
  CardHead,
  StyledContainer,
  StyledTime,
  ItemTitle,
  ChildWrapper,
  Loader,
  ExtLink,
  CardsWrapper,
  BannerCard,
  BalanceDisplay,
  ConvertWrapper,
  VestingBreakdown,
} from 'pages/Profile/styled'
import { Card } from './styled'
import { ButtonPrimary } from 'custom/components/Button'
import { SectionTitle, HelpCircle } from 'components/Page'
import { MouseoverTooltipContent } from 'components/Tooltip'
import cowImage from 'assets/cow-swap/cow_v2.svg'
import SVG from 'react-inlinesvg'
import ArrowIcon from 'assets/cow-swap/arrow.svg'

const LockedGnoVesting: React.FC = () => {
  return (
    <Card>
      <BalanceDisplay hAlign="left">
        <img src={cowImage} alt="COW token" width="56" height="56" />
        <span>
          <i>COW vesting from locked GNO</i>
          <b>
            {0} COW{' '}
            <MouseoverTooltipContent
              content={
                <VestingBreakdown>
                  <span>
                    <i>Unvested</i> <p>{0} vCOW</p>
                  </span>
                  <span>
                    <i>Vested</i> <p>{0} vCOW</p>
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
          <b>{0}</b>
        </BalanceDisplay>
        <ButtonPrimary>
          Claim COW <SVG src={ArrowIcon} />
        </ButtonPrimary>
      </ConvertWrapper>
    </Card>
  )
}

export default LockedGnoVesting
