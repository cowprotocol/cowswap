import { useMemo } from 'react'

import STEP_IMAGE_CANCELLED from '@cowprotocol/assets/cow-swap/progressbar-step-cancelled.svg'
import STEP_IMAGE_EXPIRED from '@cowprotocol/assets/cow-swap/progressbar-step-expired.svg'
import STEP_IMAGE_SOLVING from '@cowprotocol/assets/cow-swap/progressbar-step-solving.svg'
import STEP_IMAGE_UNFILLABLE from '@cowprotocol/assets/cow-swap/progressbar-step-unfillable.svg'
import STEP_LOTTIE_EXECUTING from '@cowprotocol/assets/lottie/progressbar-step-executing.json'
import STEP_LOTTIE_NEXTBATCH from '@cowprotocol/assets/lottie/progressbar-step-nextbatch.json'
import LOTTIE_TIME_EXPIRED_DARK from '@cowprotocol/assets/lottie/time-expired-dark.json'
import { getRandomInt } from '@cowprotocol/common-utils'
import { ProductLogo, ProductVariant, UI } from '@cowprotocol/ui'

import { AnimatePresence, motion } from 'framer-motion'
import Lottie from 'lottie-react'
import SVG from 'react-inlinesvg'
import { Textfit } from 'react-textfit'

import * as styledEl from './styled'

import { CHAIN_SPECIFIC_BENEFITS, SURPLUS_IMAGES } from '../constants'
import { truncateWithEllipsis } from '../helpers'
import AnimatedTokens from '../steps/AnimatedToken'
import CircularCountdown from '../steps/CircularCountdown'
import OrderIntent from '../steps/OrderIntent'
import { OrderProgressBarV2Props } from '../types'

function RenderProgressTopSection({
  stepName,
  order,
  countdown,
  chainId,
  surplusData,
  debugForceShowSurplus = false,
}: Pick<OrderProgressBarV2Props, 'stepName' | 'order' | 'countdown' | 'chainId' | 'surplusData'> & {
  debugForceShowSurplus?: boolean
}) {
  const hideIntent = stepName === 'finished' || stepName === 'cancellationFailed'

  const { randomImage, randomBenefit } = useMemo(() => {
    const benefits = CHAIN_SPECIFIC_BENEFITS[chainId]

    return {
      randomImage: SURPLUS_IMAGES[getRandomInt(0, SURPLUS_IMAGES.length - 1)],
      randomBenefit: benefits[getRandomInt(0, benefits.length - 1)],
    }
  }, [chainId])

  const { surplusPercent, showSurplus } = surplusData || {}
  const shouldShowSurplus = debugForceShowSurplus || showSurplus
  const surplusPercentValue = surplusPercent ? parseFloat(surplusPercent).toFixed(2) : 'N/A'

  const content = useMemo(() => {
    switch (stepName) {
      case 'initial':
        return (
          <>
            <styledEl.ProgressImageWrapper bgColor={'#65D9FF'} padding={'24px'}>
              <AnimatedTokens sellToken={order?.inputToken} buyToken={order?.outputToken} />
            </styledEl.ProgressImageWrapper>
          </>
        )
      case 'solving':
      case 'solved':
      case 'unfillable':
      case 'delayed':
      case 'submissionFailed':
        return (
          <styledEl.ProgressImageWrapper
            bgColor={
              stepName === 'unfillable'
                ? '#FFDB9C'
                : stepName === 'delayed' || stepName === 'submissionFailed' || stepName === 'solved'
                  ? '#FFB3B3'
                  : '#65D9FF'
            }
            padding={stepName === 'unfillable' ? '20px 0 0' : stepName === 'solving' ? '16px' : '0'}
            height={
              stepName === 'delayed' || stepName === 'submissionFailed' || stepName === 'solved' ? '229px' : 'auto'
            }
          >
            {stepName === 'unfillable' ? (
              <img src={STEP_IMAGE_UNFILLABLE} alt="Order out of market" />
            ) : stepName === 'delayed' || stepName === 'submissionFailed' || stepName === 'solved' ? (
              <Lottie
                animationData={STEP_LOTTIE_NEXTBATCH}
                loop={true}
                autoplay={true}
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <>
                <SVG src={STEP_IMAGE_SOLVING} />
                {stepName === 'solving' && <CircularCountdown countdown={countdown || 0} />}
              </>
            )}
          </styledEl.ProgressImageWrapper>
        )
      case 'executing':
        return (
          <styledEl.ProgressImageWrapper height={'auto'}>
            <Lottie
              animationData={STEP_LOTTIE_EXECUTING}
              loop={true}
              autoplay={true}
              style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            />
          </styledEl.ProgressImageWrapper>
        )
      case 'finished':
      case 'cancellationFailed':
        return (
          <styledEl.ProgressTopSection>
            <styledEl.ProgressImageWrapper bgColor={'#65D9FF'} padding={'10px'} gap={'10px'}>
              <styledEl.CowImage>
                <SVG src={randomImage} />
              </styledEl.CowImage>
              <styledEl.FinishedImageContent>
                <styledEl.FinishedTagLine>
                  {shouldShowSurplus ? (
                    <styledEl.BenefitSurplusContainer>
                      I just received surplus on
                      <styledEl.TokenPairTitle title={`${order?.inputToken.symbol} / ${order?.outputToken.symbol}`}>
                        {truncateWithEllipsis(`${order?.inputToken.symbol} / ${order?.outputToken.symbol}`, 30)}
                      </styledEl.TokenPairTitle>{' '}
                      <styledEl.Surplus>
                        <Textfit
                          mode="multi"
                          min={14}
                          max={60}
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            lineHeight: 1.2,
                          }}
                        >
                          {shouldShowSurplus && surplusPercentValue !== 'N/A' ? `+${surplusPercentValue}%` : 'N/A'}
                        </Textfit>
                      </styledEl.Surplus>
                    </styledEl.BenefitSurplusContainer>
                  ) : (
                    <styledEl.BenefitSurplusContainer>
                      <styledEl.BenefitTagLine>Did you know?</styledEl.BenefitTagLine>
                      <styledEl.BenefitText>
                        <Textfit
                          mode="multi"
                          min={12}
                          max={50}
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            lineHeight: 1.2,
                          }}
                        >
                          {randomBenefit}
                        </Textfit>
                      </styledEl.BenefitText>
                    </styledEl.BenefitSurplusContainer>
                  )}
                </styledEl.FinishedTagLine>

                <styledEl.FinishedLogo>
                  <ProductLogo
                    variant={ProductVariant.CowSwap}
                    theme="light"
                    overrideColor={UI.COLOR_PRIMARY_DARKER}
                    height={19}
                    logoIconOnly
                  />
                  <b>CoW Swap</b>
                </styledEl.FinishedLogo>
              </styledEl.FinishedImageContent>
            </styledEl.ProgressImageWrapper>
          </styledEl.ProgressTopSection>
        )
      case 'cancelling':
      case 'cancelled':
        return (
          <styledEl.ProgressImageWrapper height={'auto'}>
            <img src={STEP_IMAGE_CANCELLED} alt="Cancelling order" />
          </styledEl.ProgressImageWrapper>
        )
      case 'expired':
        return (
          <styledEl.ProgressImageWrapper height={'auto'}>
            <styledEl.ClockAnimation>
              <Lottie
                animationData={LOTTIE_TIME_EXPIRED_DARK}
                loop={false}
                autoplay
                style={{ width: '100%', height: '100%' }}
              />
            </styledEl.ClockAnimation>
            <img src={STEP_IMAGE_EXPIRED} alt="Order expired" />
          </styledEl.ProgressImageWrapper>
        )
      default:
        return null
    }
  }, [stepName, order, countdown, randomImage, randomBenefit, shouldShowSurplus, surplusPercentValue])

  return (
    <styledEl.ProgressTopSection>
      <AnimatePresence mode="wait">
        <motion.div
          key="solving-group"
          initial={false}
          animate={{
            opacity: 1,
            width: '100%',
            transition: {
              duration: 0.15,
              ease: 'easeOut',
            },
          }}
          exit={{ opacity: 0, width: '100%' }}
          style={{ width: '100%' }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
      {!hideIntent && <OrderIntent order={order} />}
    </styledEl.ProgressTopSection>
  )
}

export default RenderProgressTopSection
