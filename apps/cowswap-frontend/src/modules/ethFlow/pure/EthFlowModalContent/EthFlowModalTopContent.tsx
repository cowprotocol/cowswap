import { Media, UI } from '@cowprotocol/ui'

const ModalMessage = styled.div`
  display: flex;
  flex-flow: row wrap;
  padding: 16px 0 0;
  width: 100%;
  color: ${({ theme }) => transparentize(theme.text, 0.15)};
  font-size: 14px;
  line-height: 1.3;

  ${Media.upToSmall()} {
    margin-top: 2rem;
  }

  > span {
    margin: 0 0 8px;
  }
`



export type TopContentParams = {
  descriptions: string[] | null
  nativeSymbol: string
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function EthFlowModalTopContent({ descriptions }: TopContentParams) {
  
  return (
    <>
      {!!descriptions?.length && (
        <ModalMessage>
          {descriptions.map((description, index) => (
            <span key={index}>{description}</span>
          ))}
        </ModalMessage>
      )}
     
    </>
  )
}
