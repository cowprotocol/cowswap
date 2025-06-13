import { useState } from 'react'

import { HookToDappMatch } from '@cowprotocol/hook-dapp-lib'

import { Item, Wrapper, ToggleButton, Details } from './styled'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function HookItem({ item, number }: { item: HookToDappMatch; number: number }) {
  const [showDetails, setShowDetails] = useState(false)

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const toggleDetails = () => setShowDetails(!showDetails)

  return (
    <Item>
      <Wrapper>
        <p>
          #{number} -{' '}
          {item.dapp ? (
            <>
              <img src={item.dapp.image} alt={item.dapp.name} /> <strong>{item.dapp.name}</strong>{' '}
            </>
          ) : (
            'Unknown hook dapp'
          )}
          <ToggleButton onClick={toggleDetails}>{showDetails ? '[-] Show less' : '[+] Show more'}</ToggleButton>
        </p>

        {showDetails && (
          <Details>
            {item.dapp && (
              <>
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
              </>
            )}
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
    </Item>
  )
}
