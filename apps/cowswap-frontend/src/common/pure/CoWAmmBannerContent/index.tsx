import React, { useCallback, useMemo, useRef } from 'react'

import { isTruthy } from '@cowprotocol/common-utils'
import { TokensByAddress } from '@cowprotocol/tokens'
import { LpTokenProvider } from '@cowprotocol/types'

import styled from 'styled-components/macro'

import { upToSmall, useMediaQuery } from 'legacy/hooks/useMediaQuery'

import { VampireAttackContext } from 'modules/yield/types'

import { TextFit } from './Common'
import { LP_PROVIDER_NAMES } from './const'
import { GlobalContent } from './GlobalContent'
import { PoolInfo } from './PoolInfo'
import { TokenSelectorContent } from './TokenSelectorContent'
import { CoWAmmBannerContext } from './types'

import { useSafeMemoObject } from '../../hooks/useSafeMemo'

const Wrapper = styled.div`
  z-index: 100;
`

interface CoWAmmBannerContentProps {
  id: string
  title: string
  ctaText: string
  isTokenSelectorView: boolean
  isDarkMode: boolean
  vampireAttackContext: VampireAttackContext
  tokensByAddress: TokensByAddress
  onCtaClick: () => void
  onClose: () => void
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type, complexity
export function CoWAmmBannerContent({
  id,
  title,
  ctaText,
  isTokenSelectorView,
  onCtaClick,
  onClose,
  isDarkMode,
  vampireAttackContext,
  tokensByAddress,
}: CoWAmmBannerContentProps) {
  const isMobile = useMediaQuery(upToSmall)
  const arrowBackgroundRef = useRef<HTMLDivElement>(null)
  const { superiorAlternatives, cowAmmLpTokensCount, averageApyDiff, poolsAverageData } = vampireAttackContext

  const handleCTAMouseEnter = useCallback(() => {
    if (arrowBackgroundRef.current) {
      arrowBackgroundRef.current.style.visibility = 'visible'
      arrowBackgroundRef.current.style.opacity = '1'
    }
  }, [])

  const handleCTAMouseLeave = useCallback(() => {
    if (arrowBackgroundRef.current) {
      arrowBackgroundRef.current.style.visibility = 'hidden'
      arrowBackgroundRef.current.style.opacity = '0'
    }
  }, [])

  const firstItemWithBetterCowAmm = superiorAlternatives?.[0]
  const isCowAmmAverageBetter = !!averageApyDiff && averageApyDiff > 0
  const betterAlternativeApyDiff = firstItemWithBetterCowAmm
    ? firstItemWithBetterCowAmm.alternativePoolInfo.apy - firstItemWithBetterCowAmm.tokenPoolInfo.apy
    : undefined

  const worseThanCoWAmmProviders = useMemo(() => {
    return superiorAlternatives?.reduce((acc, item) => {
      if (item.token.lpTokenProvider && !acc.includes(item.token.lpTokenProvider)) {
        return acc.concat(item.token.lpTokenProvider)
      }

      return acc
    }, [] as LpTokenProvider[])
  }, [superiorAlternatives])

  const sortedAverageProviders = useMemo(() => {
    if (!poolsAverageData) return undefined
    return Object.keys(poolsAverageData).sort((a, b) => {
      const aVal = poolsAverageData[a as LpTokenProvider]
      const bVal = poolsAverageData[b as LpTokenProvider]

      if (!aVal || !bVal) return 0

      return bVal.apy - aVal.apy
    }) as LpTokenProvider[]
  }, [poolsAverageData])

  const averageProvidersNames = useMemo(() => {
    return sortedAverageProviders?.map((key) => LP_PROVIDER_NAMES[key as LpTokenProvider]).filter(isTruthy)
  }, [sortedAverageProviders])

  const context: CoWAmmBannerContext = useSafeMemoObject({
    title,
    ctaText,
    isMobile,
    onClose,
    onCtaClick,
    handleCTAMouseEnter,
    handleCTAMouseLeave,
  })

  const Content = (
    <>
      <h3>
        <TextFit
          mode="single"
          minFontSize={isTokenSelectorView ? 35 : isMobile ? 40 : isCowAmmAverageBetter ? 60 : 80}
          maxFontSize={isTokenSelectorView ? 65 : isMobile ? 50 : isCowAmmAverageBetter ? 60 : 80}
        >
          {firstItemWithBetterCowAmm && betterAlternativeApyDiff && betterAlternativeApyDiff > 0
            ? `+${betterAlternativeApyDiff.toFixed(1)}%`
            : isCowAmmAverageBetter
              ? `+${averageApyDiff}%`
              : `${cowAmmLpTokensCount}+`}
        </TextFit>
      </h3>
      <span>
        <TextFit
          mode="multi"
          minFontSize={isTokenSelectorView ? 10 : 15}
          maxFontSize={isTokenSelectorView ? (isMobile ? 15 : 21) : isMobile ? 21 : 28}
        >
          {firstItemWithBetterCowAmm ? (
            <PoolInfo
              token={firstItemWithBetterCowAmm.token}
              tokensByAddress={tokensByAddress}
              isDarkMode={isDarkMode}
              isTokenSelectorView={isTokenSelectorView}
            />
          ) : isCowAmmAverageBetter && averageProvidersNames ? (
            `yield over average ${averageProvidersNames.join(', ')} pool${averageProvidersNames.length > 1 ? 's' : ''}`
          ) : (
            'pools available to get yield on your assets!'
          )}
        </TextFit>
      </span>
    </>
  )

  return (
    <Wrapper data-banner-id={id}>
      {isTokenSelectorView ? (
        <TokenSelectorContent isDarkMode={isDarkMode} context={context}>
          {Content}
        </TokenSelectorContent>
      ) : (
        <GlobalContent
          arrowBackgroundRef={arrowBackgroundRef}
          context={context}
          comparedProviders={
            firstItemWithBetterCowAmm
              ? worseThanCoWAmmProviders
              : isCowAmmAverageBetter
                ? sortedAverageProviders
                : undefined
          }
        >
          {Content}
        </GlobalContent>
      )}
    </Wrapper>
  )
}
