import { useState } from 'react'

import { HookToDappMatch } from '@cowprotocol/hook-dapp-lib'

import { Item, Wrapper, ToggleButton, Details } from './styled'

export function HookItem({ item, number }: { item: HookToDappMatch; number: number }) {
  const [showDetails, setShowDetails] = useState(false)

  const toggleDetails = () => setShowDetails(!showDetails)

  return (
    <Item>
      {item.dapp ? (
        <Wrapper>
          <p>
            #{number} - <img src={item.dapp.image} alt={item.dapp.name} /> <strong>{item.dapp.name}</strong>{' '}
            <ToggleButton onClick={toggleDetails}>{showDetails ? '[-] Show less' : '[+] Show more'}</ToggleButton>
          </p>

          {showDetails && (
            <Details>
              <p>
                <i>Version:</i> {item.dapp.version}
              </p>
              <p>
                <i>Description:</i> {item.dapp.descriptionShort}
              </p>
              <p>
                <i>Website: </i>
                <a href={item.dapp.website} target="_blank" rel="noopener noreferrer">
                  {item.dapp.website}
                </a>
              </p>
              <p>
                <i>Call Data:</i> {item.hook.callData}
              </p>
              <p>
                <i>Gas Limit:</i> {item.hook.gasLimit}
              </p>
              <p>
                <i>Target:</i> {item.hook.target}
              </p>
            </Details>
          )}
        </Wrapper>
      ) : (
        <div>Unknown hook dapp</div>
      )}
    </Item>
  )
}
