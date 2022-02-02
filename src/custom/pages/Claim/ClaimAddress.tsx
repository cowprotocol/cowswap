import { useMemo } from 'react'
import { Trans } from '@lingui/macro'
import { ButtonSecondary } from 'components/Button'
import Circle from 'assets/images/blue-loader.svg'
import { CustomLightSpinner, TYPE } from 'theme'
import { CheckAddress, InputField, InputFieldTitle, InputErrorText } from './styled'
import { ClaimCommonTypes } from './types'
import useENS from 'hooks/useENS'
import { useClaimDispatchers, useClaimState } from 'state/claim/hooks'
import { ClaimStatus } from 'state/claim/actions'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'

export type ClaimAddressProps = Pick<ClaimCommonTypes, 'account'> & {
  toggleWalletModal: () => void
}

export default function ClaimAddress({ account, toggleWalletModal }: ClaimAddressProps) {
  const { error } = useWeb3React()
  const { activeClaimAccount, claimStatus, inputAddress } = useClaimState()
  const { setInputAddress } = useClaimDispatchers()

  const { loading, address: resolvedAddress } = useENS(inputAddress)

  // Show input error
  const showInputError = useMemo(
    () => Boolean(inputAddress.length > 0 && !loading && !resolvedAddress),
    [resolvedAddress, inputAddress, loading]
  )

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value
    const withoutSpaces = input.replace(/\s+/g, '')

    setInputAddress(withoutSpaces)
  }

  const buttonLabel =
    error instanceof UnsupportedChainIdError ? 'or connect a wallet in a supported network' : 'or connect a wallet'

  if (activeClaimAccount || claimStatus === ClaimStatus.CONFIRMED) return null

  return (
    <CheckAddress>
      <p>
        Enter an address to check for any eligible vCOW claims. <br />
        <i>Note: It is possible to claim for an account, using any wallet/account.</i>
      </p>

      <InputField>
        <InputFieldTitle>
          <b>Input address</b>
          {loading && <CustomLightSpinner src={Circle} alt="loader" size={'10px'} />}
        </InputFieldTitle>
        <input placeholder="Address or ENS name" value={inputAddress} onChange={handleInputChange} />
      </InputField>

      {showInputError && (
        <InputErrorText>
          <TYPE.error error={true}>
            <Trans>Enter valid address or ENS</Trans>
          </TYPE.error>
        </InputErrorText>
      )}

      {!account && (
        <ButtonSecondary onClick={toggleWalletModal}>
          <Trans>{buttonLabel}</Trans>
        </ButtonSecondary>
      )}
    </CheckAddress>
  )
}
