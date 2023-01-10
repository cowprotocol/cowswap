import jazzicon from '@metamask/jazzicon'
import { useWeb3React } from '@web3-react/core'
import useENSAvatar from 'hooks/useENSAvatar'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components/macro'

// MOD imports
import { IdenticonProps } from 'components/Identicon'

export const StyledIdenticon = styled.div`
  height: 1rem;
  width: 1rem;
  border-radius: 1.125rem;
  // background-color: ${({ theme }) => theme.bg4};
  background-color: ${({ theme }) => theme.bg1}; // MOD
  font-size: initial;
`

const StyledAvatar = styled.img`
  height: inherit;
  width: inherit;
  border-radius: inherit;
`

export default function Identicon({ account: customAccount, size = 16 }: IdenticonProps) {
  const { account: chainAccount } = useWeb3React()
  const account = customAccount || chainAccount

  const { avatar } = useENSAvatar(account ?? undefined, false)
  const [fetchable, setFetchable] = useState(true)

  const icon = useMemo(() => account && jazzicon(size, parseInt(account.slice(2, 10), 16)), [size, account])
  const iconRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const current = iconRef.current
    if (icon) {
      current?.appendChild(icon)
      return () => {
        try {
          current?.removeChild(icon)
        } catch (e) {
          console.error('Avatar icon not found')
        }
      }
    }
    return
  }, [icon, iconRef])

  return (
    <StyledIdenticon>
      {avatar && fetchable ? (
        <StyledAvatar alt="avatar" src={avatar} onError={() => setFetchable(false)} />
      ) : (
        <span ref={iconRef} />
      )}
    </StyledIdenticon>
  )
  // TODO: revisit if previous changes should be re-applied
  //   <StyledIdenticon>
  //     {avatar && fetchable ? (
  //       <StyledAvatar alt="avatar" src={avatar} onError={() => setFetchable(false)}></StyledAvatar>
  //     ) : (
  //       <span ref={iconRef} />
  //     )}
  //   </StyledIdenticon>
}
