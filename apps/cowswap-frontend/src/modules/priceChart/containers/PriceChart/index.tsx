import { useAtom, useAtomValue } from 'jotai'
import { ReactNode, useCallback, useMemo, useState } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import type { Currency } from '@cowprotocol/currency'
import { Dialog, DialogOrInline, Media, Modal, ModalHeader } from '@cowprotocol/ui'

import { useLingui } from '@lingui/react/macro'

import { ChartWrapper } from 'modules/trade'

import { usePriceChartVisibility } from '../../hooks/usePriceChartVisibility'
import { SimplePriceChart } from '../../simple/SimplePriceChart'
import { priceChartExpandedAtom } from '../../state/priceChartExpandedAtom'
import { priceChartModalOpenAtom } from '../../state/priceChartModalOpenAtom'
import { priceChartPairAtom } from '../../state/priceChartPairAtom'
import { priceChartSupplyVariantAtom } from '../../state/priceChartSupplyVariantAtom'

import type { ChartMetric } from '../../lib/chart.types'

export interface PriceChartProps {
  inputCurrency: Currency | null
  outputCurrency: Currency | null
  expandable?: boolean
}

export function PriceChart({ inputCurrency, outputCurrency, expandable = false }: PriceChartProps): ReactNode {
  const { t } = useLingui()
  const isUpToLarge = useMediaQuery(Media.upToLarge(false))
  const [isModalOpen, setIsModalOpen] = useAtom(priceChartModalOpenAtom)
  const isVisible = usePriceChartVisibility(inputCurrency, outputCurrency)
  const [isExpanded, setIsExpanded] = useAtom(priceChartExpandedAtom)
  const supplyVariant = useAtomValue(priceChartSupplyVariantAtom)
  const [metric, setMetric] = useState<ChartMetric>('price')
  const currencies = useMemo(
    () => [inputCurrency, outputCurrency].filter((currency): currency is Currency => currency !== null),
    [inputCurrency, outputCurrency],
  )
  const [selectedPair, setSelectedPair] = useAtom(priceChartPairAtom)
  const activeCurrency =
    (selectedPair === 'buy-usd' ? (outputCurrency ?? inputCurrency) : (inputCurrency ?? outputCurrency)) ?? undefined
  const handleSelectCurrency = useCallback(
    (currency: Currency) => {
      const pair = inputCurrency?.equals(currency) ? 'sell-usd' : 'buy-usd'
      setSelectedPair(pair)
    },
    [inputCurrency, setSelectedPair],
  )
  if (!isVisible) return null

  const chartProps = {
    activeCurrency,
    metric,
    onSelectMetric: setMetric,
    onSelectCurrency: handleSelectCurrency,
    sizeControl:
      expandable && !isUpToLarge ? { isExpanded, onToggle: () => setIsExpanded((value) => !value) } : undefined,
    currencies,
    supplyVariant,
  }
  const chart = (
    <ChartWrapper
      $isExpanded={!isUpToLarge && (!expandable || isExpanded)}
      $inDrawer={isUpToLarge}
      className="price-chart trade-orders-table"
      data-expanded={!isUpToLarge && expandable && isExpanded}
    >
      <SimplePriceChart {...chartProps} />
    </ChartWrapper>
  )

  return (
    <DialogOrInline isDialog={isUpToLarge} isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
      {isUpToLarge ? (
        <Modal.Root>
          <ModalHeader sticky title={t`Price chart`} titleAs={Dialog.Title} onClose={() => setIsModalOpen(false)} />
          {chart}
        </Modal.Root>
      ) : (
        chart
      )}
    </DialogOrInline>
  )
}
