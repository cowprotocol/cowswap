import axios from "axios";
import { BigNumber, ethers } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export type FeeData = Partial<ethers.providers.FeeData>;

/**
 * Gas estimator interface.
 */
export interface IGasEstimator {
  /**
   * Computes the estimated gas price for a given transaction.
   */
  gasPriceEstimate(): Promise<BigNumber>;

  /**
   * Computes the optimal transaction gas price options to use.
   */
  txGasPrice(): Promise<FeeData>;
}

export function createGasEstimator(
  hre: HardhatRuntimeEnvironment,
  options: {
    blockNative: boolean;
  },
): IGasEstimator {
  if (options.blockNative) {
    if (hre.network.name !== "mainnet") {
      throw new Error(`BlockNative does not support ${hre.network.name}`);
    }
    return new BlockNativeGasEstimator();
  } else {
    return new ProviderGasEstimator(hre.ethers.provider);
  }
}

export class ProviderGasEstimator implements IGasEstimator {
  constructor(private provider: ethers.providers.Provider) {}

  gasPriceEstimate(): Promise<BigNumber> {
    return this.provider.getGasPrice();
  }

  txGasPrice(): Promise<FeeData> {
    return Promise.resolve({});
  }
}

// We just use the API that the gas price browser page uses to avoid dealing
// with API keys and rate limiting.
const BLOCKNATIVE_URL = "https://blocknative-api.herokuapp.com/data";

interface EstimatedPrice {
  confidence: number;
  price: number;
  maxPriorityFeePerGas: number;
  maxFeePerGas: number;
}

interface BlockPrices {
  estimatedPrices: EstimatedPrice[];
}

export class BlockNativeGasEstimator implements IGasEstimator {
  constructor(public confidence: number = 90) {}

  private async queryEstimatedPrice(): Promise<EstimatedPrice> {
    const response = await axios.get(BLOCKNATIVE_URL);
    const { estimatedPrices }: BlockPrices = response.data;
    estimatedPrices.sort((a, b) => a.confidence - b.confidence);
    const price = estimatedPrices.find(
      (price) => price.confidence >= this.confidence,
    );
    if (price === undefined) {
      throw new Error(
        `no price with confidence greater than ${this.confidence}`,
      );
    }

    return price;
  }

  async gasPriceEstimate(): Promise<BigNumber> {
    const { price } = await this.queryEstimatedPrice();
    return gweiToWei(price);
  }

  async txGasPrice(): Promise<FeeData> {
    const { maxFeePerGas, maxPriorityFeePerGas } =
      await this.queryEstimatedPrice();

    return {
      maxFeePerGas: gweiToWei(maxFeePerGas),
      maxPriorityFeePerGas: gweiToWei(maxPriorityFeePerGas),
    };
  }
}

function gweiToWei(amount: number): BigNumber {
  return ethers.utils.parseUnits(amount.toFixed(9), 9);
}
