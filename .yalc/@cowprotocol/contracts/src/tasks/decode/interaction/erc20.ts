import IERC20 from "@openzeppelin/contracts/build/contracts/IERC20.json";
import { utils, BytesLike } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { Interaction } from "../../../ts";
import { erc20Token } from "../../ts/tokens";
import {
  DecodedInteraction,
  DecodedInteractionCall,
  DecodingTools,
} from "../interaction";

import { InteractionDecoder } from "./template";

const erc20Interface = new utils.Interface(IERC20.abi);

export class Erc20Decoder extends InteractionDecoder {
  private hre: HardhatRuntimeEnvironment;

  constructor(hre: HardhatRuntimeEnvironment) {
    super();
    this.hre = hre;
  }

  public get name(): string {
    return "erc20";
  }

  private formatCalldata(
    calldata: BytesLike,
    symbol: string,
    decimals: number,
    settlementContractAddress: string,
  ): DecodedInteractionCall | null {
    const selector = utils.hexlify(utils.arrayify(calldata).slice(0, 4));

    let functionName: string;
    let args: Map<string, string> | null = null;
    switch (selector) {
      case erc20Interface.getSighash("approve"):
        functionName = "approve";
        try {
          const { spender, amount } = erc20Interface.decodeFunctionData(
            functionName,
            calldata,
          );
          args = new Map();
          args.set(
            "spender",
            spender === settlementContractAddress
              ? "settlement contract"
              : spender,
          );
          args.set(
            "amount",
            `${utils.formatUnits(amount, decimals)} ${symbol}`,
          );
        } catch {
          // unable to decode arguments, `args` is null
        }
        break;
      case erc20Interface.getSighash("transfer"):
        functionName = "transfer";
        try {
          const { recipient, amount } = erc20Interface.decodeFunctionData(
            functionName,
            calldata,
          );
          args = new Map();
          args.set(
            "recipient",
            recipient === settlementContractAddress
              ? "settlement contract"
              : recipient,
          );
          args.set(
            "amount",
            `${utils.formatUnits(amount, decimals)} ${symbol}`,
          );
        } catch {
          // unable to decode arguments, `args` is null
        }
        break;
      case erc20Interface.getSighash("transferFrom"):
        functionName = "transferFrom";
        try {
          const { sender, recipient, amount } =
            erc20Interface.decodeFunctionData(functionName, calldata);
          args = new Map();
          args.set(
            "sender",
            sender === settlementContractAddress
              ? "settlement contract"
              : sender,
          );
          args.set(
            "recipient",
            recipient === settlementContractAddress
              ? "settlement contract"
              : recipient,
          );
          args.set(
            "amount",
            `${utils.formatUnits(amount, decimals)} ${symbol}`,
          );
        } catch {
          // unable to decode arguments, `args` is null
        }
        break;
      default:
        return null;
    }

    return { functionName, args };
  }

  public async decode(
    interaction: Interaction,
    decodingTools: DecodingTools = {},
  ): Promise<DecodedInteraction | null> {
    const { settlementContractAddress } = decodingTools;
    const { symbol, decimals } =
      (await erc20Token(interaction.target, this.hre)) ?? {};
    // Assumption: it's a token if and only if it has both a symbol and
    // decimals. In theory there could be false positives and negatives, in
    // practice all meaningful tokens have both.
    if (symbol === undefined || decimals === undefined) {
      return null;
    }

    const targetName = `erc20 token: ${symbol}`;
    return {
      targetName,
      call: this.formatCalldata(
        interaction.callData,
        symbol,
        decimals,
        settlementContractAddress ?? "",
      ),
    };
  }
}
