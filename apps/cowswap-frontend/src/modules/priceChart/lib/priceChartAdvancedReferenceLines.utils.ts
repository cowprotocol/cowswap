import { getReferenceLineColor, getPriceChartReferenceLineAppearance } from './priceChartReferenceLine.utils'

import type { PriceChartReferenceLine } from './priceChart.types'
import type { IChartingLibraryWidget } from 'charting_library'

export interface HorizontalLineEntity {
  entityId: ReturnType<ReturnType<IChartingLibraryWidget['activeChart']>['createShape']>
  signature: string
}
export interface SyncHorizontalLinesParams {
  entities: Map<string, HorizontalLineEntity>
  referenceLines: PriceChartReferenceLine<number>[]
  ticker: string
  widget: IChartingLibraryWidget | null
}

export function syncHorizontalLines({ entities, referenceLines, ticker, widget }: SyncHorizontalLinesParams): void {
  if (!widget) return

  const activeIds = new Set(referenceLines.map((line) => line.id))

  entities.forEach(({ entityId }, id) => {
    if (activeIds.has(id)) return

    removeShape(widget, entityId)
    entities.delete(id)
  })

  referenceLines.forEach((referenceLine) => {
    const appearance = getPriceChartReferenceLineAppearance(referenceLine.variant)
    const color = getReferenceLineColor(appearance.colorToken, appearance.colorFallback)
    const signature = [
      ticker,
      referenceLine.label,
      referenceLine.price,
      color,
      appearance.lineStyle,
      appearance.lineWidth,
    ].join(':')
    const existing = entities.get(referenceLine.id)

    if (existing?.signature === signature) return

    if (existing) removeShape(widget, existing.entityId)

    const entityId = widget.activeChart().createShape(
      {
        price: referenceLine.price,
        time: Math.floor(Date.now() / 1000),
      },
      {
        disableSave: true,
        disableSelection: true,
        disableUndo: true,
        lock: true,
        text: referenceLine.label,
        overrides: {
          'linetoolhorzline.linecolor': color,
          'linetoolhorzline.linestyle': appearance.lineStyle,
          'linetoolhorzline.linewidth': appearance.lineWidth,
          'linetoolhorzline.showLabel': true,
          'linetoolhorzline.showPrice': true,
          'linetoolhorzline.textcolor': color,
        },
        shape: 'horizontal_line',
        showInObjectsTree: false,
        zOrder: 'top',
      },
    )

    entities.set(referenceLine.id, { entityId, signature })
  })
}

function removeShape(widget: IChartingLibraryWidget, entityId: HorizontalLineEntity['entityId']): void {
  entityId.then((id) => widget.activeChart().removeEntity(id, { disableUndo: true })).catch(() => undefined)
}
