import { ReactNode, useState } from 'react'

import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { mobileOrderCardScenarios, MobileOrderCardScenario } from './MobileOrderCard.fixture'
import { MobileOrderCard } from './MobileOrderCard.pure'

const Canvas = styled.div`
  width: 100%;
  padding: 16px;
  color: var(${UI.COLOR_TEXT});
`

const Controls = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;

  select {
    margin-left: 8px;
    padding: 6px;
    border: 1px solid var(${UI.COLOR_TEXT_OPACITY_25});
    border-radius: 4px;
    background: var(${UI.COLOR_PAPER});
    color: inherit;
  }
`

const Gallery = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 24px;
`

const Scenario = styled.section<{ $width: number }>`
  width: ${({ $width }) => $width}px;
  max-width: 100%;

  h3 {
    margin: 0 0 8px;
    font-size: 14px;
    line-height: 20px;
    font-weight: 500;
  }
`

function CardScenarios({ scenarios }: { scenarios: MobileOrderCardScenario[] }): ReactNode {
  const [width, setWidth] = useState(390)
  const [selected, setSelected] = useState<string>()

  return (
    <Canvas>
      <Controls>
        <label>
          Card width
          <select value={width} onChange={(event) => setWidth(Number(event.target.value))}>
            {[320, 390, 480, 640].map((size) => (
              <option key={size} value={size}>
                {size}px
              </option>
            ))}
          </select>
        </label>
        <span role="status">
          {selected ? `Card selected: ${selected}` : 'Select a card to check its open callback.'}
        </span>
      </Controls>
      <Gallery>
        {scenarios.map(({ name, item, dateGroup, warningReason }) => (
          <Scenario key={name} $width={width}>
            <h3>{name}</h3>
            <MobileOrderCard
              item={item}
              dateGroup={dateGroup}
              warningReason={warningReason}
              onOpen={() => setSelected(name)}
            />
          </Scenario>
        ))}
      </Gallery>
    </Canvas>
  )
}

const fixtures: Record<string, ReactNode> = {
  'All scenarios': <CardScenarios scenarios={mobileOrderCardScenarios} />,
  ...Object.fromEntries(
    mobileOrderCardScenarios.map((scenario) => [
      scenario.name,
      <CardScenarios key={scenario.name} scenarios={[scenario]} />,
    ]),
  ),
}

export default fixtures
