import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

export async function getNamedSigner(
  { ethers, getNamedAccounts }: HardhatRuntimeEnvironment,
  name: string,
): Promise<SignerWithAddress> {
  const accounts = await getNamedAccounts();
  const account = accounts[name];
  if (account === undefined) {
    throw new Error(`No account named ${name}`);
  }

  const signer = (await ethers.getSigners()).find(
    (signer) => signer.address == account,
  );
  if (signer === undefined) {
    throw new Error(
      `No account '${name}' found among the signers. Did you export its private key with 'export PK=<your key>'?`,
    );
  }
  return signer;
}
