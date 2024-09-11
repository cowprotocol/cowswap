import { Body, Header, Tags, Wrapper } from './styled'

import { HookDapp } from '../../types/hooks'

interface HookDappDetailsProps {
  dapp: HookDapp
}

export function HookDappDetails({ dapp }: HookDappDetailsProps) {
  const { name, image, description, version } = dapp

  return (
    <Wrapper>
      <Header>
        <img src={image} alt={name} />
        <h3>{name}</h3>
      </Header>
      <Body>
        <p>{description}</p>
      </Body>
      <Tags>
        <div>
          <span>Hook version</span>
          <a>{version}</a>
        </div>
      </Tags>
    </Wrapper>
  )
}
