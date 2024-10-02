import { HookToDappMatch } from '@cowprotocol/hook-dapp-lib'

import { Item, Wrapper } from './styled'

export function HookItem({ item }: { item: HookToDappMatch }) {
  return (
    <Item>
      {item.dapp ? (
        <Wrapper href={item.dapp.website} target="_blank">
          <img src={item.dapp.image} alt={item.dapp.name} />
          <p>
            <strong>{item.dapp.name}</strong> <span>({item.dapp.version})</span>
          </p>
        </Wrapper>
      ) : (
        <div>Unknown hook dapp</div>
      )}
    </Item>
  )
}
