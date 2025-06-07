import React from 'react'

import { Command } from '@cowprotocol/types'

import Cytoscape, { EventObject } from 'cytoscape'

import { LAYOUTS } from './layouts'
import { PopperInstance } from './types'


/**
 * This allows to bind a tooltip (popper.js) around to a cytoscape elements (node, edge)
 */
// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function bindPopper(
  event: EventObject,
  targetData: Cytoscape.NodeDataDefinition | Cytoscape.EdgeDataDefinition,
  popperRef: React.MutableRefObject<PopperInstance | null>
): void {
  const tooltipId = `popper-target-${targetData.id}`
  const popperClassTarget = 'target-popper'

  // Remove if already existing
  const existingTooltips: HTMLCollectionOf<Element> = document.getElementsByClassName(popperClassTarget)
  Array.from(existingTooltips).forEach((ele: { remove: Command }): void => ele && ele.remove())

  if (!targetData.tooltip) {
    return
  }

  const target = event.target
  popperRef.current = target.popper({
    content: () => {
      const tooltip = document.createElement('span')
      tooltip.id = tooltipId
      tooltip.classList.add(popperClassTarget)

      const table = document.createElement('table')
      tooltip.append(table)

      // loop through target data [tooltip]
      for (const prop in targetData.tooltip) {
        const targetValue = targetData.tooltip[prop]

        // no recursive or reduce support
        if (typeof targetValue === 'object') continue

        const tr = table.insertRow()

        const tdTitle = tr.insertCell()
        const tdValue = tr.insertCell()

        tdTitle.innerText = prop
        tdValue.innerText = targetValue
      }

      document.body.appendChild(tooltip)

      return tooltip
    },
    popper: {
      placement: 'top-start',
      removeOnDestroy: true,
    },
  }) as PopperInstance

  const popperUpdate = (): void => popperRef.current?.scheduleUpdate()

  target.on('position', () => popperUpdate)
  target.cy().removeListener('pan zoom tapstart')
  target.cy().on('pan zoom resize', () => popperUpdate)
  target.removeListener('click tapstart mouseout')
  const newTarget = document.getElementById(tooltipId)
  const removePopper = (): void => {
    if (newTarget) {
      newTarget.remove()
    }
    popperRef.current?.destroy()
  }
  target
    .on('click tapstart', (evt: Event) => {
      evt.stopPropagation()
      if (newTarget) {
        newTarget.classList.add('active')
      }
    })
    .on('mouseout', removePopper)
  target.cy().on('tapstart', removePopper)
}

export const updateLayout = (cy: Cytoscape.Core, layoutName: string, noAnimation = false): void => {
  cy.layout(noAnimation ? { ...LAYOUTS[layoutName], animate: false } : LAYOUTS[layoutName]).run()
  cy.fit()
}

export const removePopper = (popperInstance: React.MutableRefObject<PopperInstance | null>): void =>
  popperInstance.current?.destroy()
