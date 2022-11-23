import UniswapV2Router from "@uniswap/v2-periphery/build/UniswapV2Router02.json";
import { utils, BytesLike, BigNumberish } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { Interaction } from "../../../ts";
import {
  DecodedInteraction,
  DecodedInteractionCall,
  DecodingTools,
} from "../interaction";

import { InteractionDecoder } from "./template";

const ROUTERS: Record<string, Record<string, string>> = {
  rinkeby: {
    // https://uniswap.org/docs/v2/smart-contracts/router02/#address (same as mainnet)
    "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D": "Uniswap",
    // https://dev.sushi.com/sushiswap/contracts#alternative-networks (same as xdai)
    "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506": "Sushiswap",
  },
  mainnet: {
    // https://uniswap.org/docs/v2/smart-contracts/router02/#address (same as rinkeby)
    "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D": "Uniswap",
    // https://dev.sushi.com/sushiswap/contracts#sushiv-2-router02
    "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F": "Sushiswap",
  },
  xdai: {
    // https://wiki.1hive.org/projects/honeyswap/honeyswap-on-xdai-1#amm-contracts
    "0x1C232F01118CB8B424793ae03F870aa7D0ac7f77": "Honeyswap",
    // https://dev.sushi.com/sushiswap/contracts#alternative-networks (same as rinkeby)
    "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506": "Sushiswap",
  },
};

const uniswapInterface = new utils.Interface(UniswapV2Router.abi);

export class UniswapLikeDecoder extends InteractionDecoder {
  private network: string;

  constructor(hre: HardhatRuntimeEnvironment) {
    super();
    this.network = hre.network.name;
  }

  public get name(): string {
    return "uniswap-like";
  }

  // Returns the name of the Uniswap-like contract or null if the target is not
  // decodable with this decoder.
  private contractName(target: string): string | null {
    if ((ROUTERS[this.network]?.[target] ?? null) === null) {
      return null;
    }
    return `${ROUTERS[this.network][target]} router`;
  }

  private formatCalldata(
    calldata: BytesLike,
    { tokenRegistry, settlementContractAddress }: DecodingTools = {},
  ): DecodedInteractionCall | null {
    const selector = utils.hexlify(utils.arrayify(calldata).slice(0, 4));

    let functionName: string;
    let args: Map<string, string> | null = null;
    switch (selector) {
      case uniswapInterface.getSighash("swapTokensForExactTokens"):
        functionName = "swapTokensForExactTokens";
        try {
          const { amountOut, amountInMax, path, to, deadline } =
            uniswapInterface.decodeFunctionData(functionName, calldata);
          args = new Map();
          const formatAmount = (
            amount: BigNumberish,
            token: string | undefined,
          ) => {
            if (!token || !tokenRegistry?.[token]) {
              return amount.toString();
            }
            const { symbol, decimals } = tokenRegistry[token];
            return `${utils.formatUnits(amount, decimals ?? 0)} ${
              symbol ?? `token ${token}`
            }`;
          };
          args.set("amountOut", formatAmount(amountOut, path[path.length - 1]));
          args.set("amountInMax", formatAmount(amountInMax, path[0]));
          args.set(
            "path",
            path
              .map((t: string) => {
                const symbol = tokenRegistry?.[t]?.symbol ?? null;
                return t + (symbol === null ? "" : ` (${symbol})`);
              })
              .join(" -> "),
          );
          args.set(
            "to",
            to === settlementContractAddress ? "settlement contract" : to,
          );
          let deadlineString = "unlimited";
          // Any large date (> year 275,760) is converted to an unlimited
          // deadline since `Date` doesn't handle large timestamps well.
          try {
            const deadlineMillis = deadline.toNumber() * 1000;
            // https://262.ecma-international.org/5.1/#sec-15.9.1.1
            if (deadlineMillis <= 8640000000000000) {
              deadlineString = `${new Date(
                deadlineMillis,
              ).toISOString()} (${deadline.toString()})`;
            }
          } catch {
            // anything larger than 2**52-1 is considered unlimited
          }
          args.set("deadline", deadlineString);
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
    const targetName = this.contractName(interaction.target);
    if (targetName === null) {
      return null;
    }
    return {
      targetName,
      call: this.formatCalldata(interaction.callData, decodingTools),
    };
  }
}
