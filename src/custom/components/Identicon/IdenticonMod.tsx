import Davatar, { Image } from '@davatar/react'
import { useMemo } from 'react'
import styled from 'styled-components/macro'
import { IdenticonProps } from 'components/Identicon'

import { useActiveWeb3React } from 'hooks/web3'

export const StyledIdenticonContainer = styled.div`
  height: 1rem;
  width: 1rem;
  border-radius: 1.125rem;
  background-color: ${({ theme }) => theme.bg4};
`

export default function Identicon({ size = 16 }: IdenticonProps) {
  const { account, library } = useActiveWeb3React()

  // restrict usage of Davatar until it stops sending 3p requests
  // see https://github.com/metaphor-xyz/davatar-helpers/issues/18
  const supportsENS = useMemo(() => {
    return ([1, 3, 4, 5] as Array<number | undefined>).includes(library?.network?.chainId)
  }, [library])

  return (
    <StyledIdenticonContainer>
      {account && supportsENS ? (
        <Davatar address={account} size={size} provider={library} />
      ) : (
        <Image address={account} size={size} />
      )}
    </StyledIdenticonContainer>
  )
}
