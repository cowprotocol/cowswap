import React, { useCallback, useMemo, useRef } from 'react'

import { upToSmall, useMediaQuery } from 'legacy/hooks/useMediaQuery'

import { ComparisonMessage } from './ComparisonMessage'
import { dummyData, lpTokenConfig, StateKey } from './dummyData'
import { GlobalContent } from './GlobalContent'
import { TokenSelectorContent } from './TokenSelectorContent'
import { CoWAmmBannerContext } from './types'

import { useSafeMemoObject } from '../../hooks/useSafeMemo'

interface CoWAmmBannerContentProps {
  id: string
  title: string
  ctaText: string
  isTokenSelectorView: boolean
  isDarkMode: boolean
  selectedState: StateKey
  dummyData: typeof dummyData
  lpTokenConfig: typeof lpTokenConfig
  onCtaClick: () => void
  onClose: () => void
}

export function CoWAmmBannerContent({
  id,
  title,
  ctaText,
  isTokenSelectorView,
  selectedState,
  dummyData,
  lpTokenConfig,
  onCtaClick,
  onClose,
  isDarkMode,
}: CoWAmmBannerContentProps) {
  const isMobile = useMediaQuery(upToSmall)
  const arrowBackgroundRef = useRef<HTMLDivElement>(null)

  const tokens = lpTokenConfig[selectedState]
  const data = dummyData[selectedState]
  const isUniV2InferiorWithLowAverageYield = selectedState === 'uniV2InferiorWithLowAverageYield'

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

  const aprMessage = useMemo(() => {
    if (selectedState === 'uniV2InferiorWithLowAverageYield' && 'poolsCount' in data) {
      return `${data.poolsCount}+`
    }
    return `+${data.apr.toFixed(1)}%`
  }, [selectedState, data])

  const comparisonMessage = (
    <ComparisonMessage
      tokens={tokens}
      isTokenSelectorView={isTokenSelectorView}
      isDarkMode={isDarkMode}
      selectedState={selectedState}
      data={data}
    />
  )

  const context: CoWAmmBannerContext = useSafeMemoObject({
    title,
    ctaText,
    aprMessage,
    comparisonMessage,
    isMobile,
    onClose,
    onCtaClick,
    handleCTAMouseEnter,
    handleCTAMouseLeave,
  })

  return (
    <div data-banner-id={id}>
      {isTokenSelectorView ? (
        <TokenSelectorContent isDarkMode={isDarkMode} context={context} />
      ) : (
        <GlobalContent
          tokens={tokens}
          isUniV2InferiorWithLowAverageYield={isUniV2InferiorWithLowAverageYield}
          arrowBackgroundRef={arrowBackgroundRef}
          context={context}
        />
      )}
    </div>
  )
}
