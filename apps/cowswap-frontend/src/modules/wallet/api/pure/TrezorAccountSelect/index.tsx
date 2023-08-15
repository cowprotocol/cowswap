import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'

import { ButtonEmpty, ButtonPrimary } from 'legacy/components/Button'
import Loader from 'legacy/components/Loader'
import { ThemedText } from 'legacy/theme'

import { ButtonSecondary } from 'modules/button'
import { SelectDropdown } from 'modules/selectDropdown'

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  width: 100%;
`

const LoaderContainer = styled.div`
  margin: 16px 0;
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
  justify-content: center;
`

const LoadingMessage = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  width: 100%;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
`

const LoadingWrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  width: 100%;
  align-items: center;
  justify-content: center;
  padding: 0 0 10px;
`

const SelectWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 8px 0 0;
  gap: 8px;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      flex-flow: column wrap;

      ${ButtonSecondary} {
        width: 100%;
      }
    `}
`

const TextWrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  margin: 0 0 24px;
  font-size: 14px;
`

// DEMO
const loadingAccounts = false
const TREZOR_ACCOUNTS = [
  { id: "0", address: "0x1234567890123456789012345678901234567890", value: "3.45" },
  { id: "1", address: "0x0987654321098765432109876543210987654321", value: "1.12" },
  { id: "2", address: "0x9876543210987654321098765432109876543212", value: "6.78" },
  { id: "3", address: "0x8765432109876543210987654321098765432109", value: "0.09" },
  { id: "4", address: "0x7654321098765432109876543210987654321098", value: "7.65" },
  { id: "5", address: "0x6543210987654321098765432109876543210987", value: "2.34" },
  { id: "6", address: "0x5432109876543210987654321098765432109876", value: "5.43" },
  { id: "7", address: "0x4321098765432109876543210987654321098765", value: "9.87" },
  { id: "8", address: "0x3210987654321098765432109876543210987654", value: "4.32" },
  { id: "9", address: "0x2109876543210987654321098765432109876543", value: "8.76" }
]

export function TrezorAccountSelect() {
  return (
    <Wrapper>
      <LoadingMessage>
        <LoadingWrapper>
          <>
            <TextWrapper>
              <Trans>Please select which account you would like to use:</Trans>

              <SelectWrapper>
                <SelectDropdown>
                  {TREZOR_ACCOUNTS.map(({ id, address, value }) => (
                    <option key={id} value={address}>
                      #{id} - {address} - {value} ETH
                    </option>
                  ))}
                </SelectDropdown>

                <ButtonSecondary onClick={undefined}>
                  {!loadingAccounts && <Trans>Load more</Trans>}
                  {loadingAccounts && <>
                    <LoaderContainer>
                      <Loader stroke="currentColor" size="32px" />
                    </LoaderContainer>
                    <Trans>Loading...</Trans>
                  </>
                  }
                </ButtonSecondary>
              </SelectWrapper>

            </TextWrapper>

            <ButtonPrimary $borderRadius="12px" padding="12px" onClick={undefined}>
              <Trans>Connect selected account</Trans>
            </ButtonPrimary>

            <ButtonEmpty width="fit-content" padding="0" marginTop={20}>
              <ThemedText.Link fontSize={14} onClick={undefined}>
                <Trans>Back to wallet selection</Trans>
              </ThemedText.Link>
            </ButtonEmpty>
          </>
        </LoadingWrapper>
      </LoadingMessage>
    </Wrapper>
  )
}
