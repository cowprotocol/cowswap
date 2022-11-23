import readline from "readline";

import { HardhatRuntimeEnvironment } from "hardhat/types";

export async function prompt(
  { network }: HardhatRuntimeEnvironment,
  message: string,
): Promise<boolean> {
  if (network.name === "hardhat") {
    // shortcut prompts in tests.
    return true;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const response = await new Promise<string>((resolve) =>
    rl.question(`${message} (y/N) `, (response) => resolve(response)),
  );
  return "y" === response.toLowerCase();
}

export interface TransactionLike {
  hash: string;
}

export function transactionUrl(
  { network }: HardhatRuntimeEnvironment,
  { hash }: TransactionLike,
): string {
  switch (network.name) {
    case "mainnet":
      return `https://etherscan.io/tx/${hash}`;
    case "rinkeby":
      return `https://rinkeby.etherscan.io/tx/${hash}`;
    case "xdai":
      return `https://blockscout.com/xdai/mainnet/tx/${hash}`;
    default:
      return hash;
  }
}
