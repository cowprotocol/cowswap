/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "./common";

export type CallStruct = {
  target: PromiseOrValue<string>;
  value: PromiseOrValue<BigNumberish>;
  callData: PromiseOrValue<BytesLike>;
  allowFailure: PromiseOrValue<boolean>;
  isDelegateCall: PromiseOrValue<boolean>;
};

export type CallStructOutput = [string, BigNumber, string, boolean, boolean] & {
  target: string;
  value: BigNumber;
  callData: string;
  allowFailure: boolean;
  isDelegateCall: boolean;
};

export interface CowShedContractInterface extends utils.Interface {
  functions: {
    "executeHooks((address,uint256,bytes,bool,bool)[],bytes32,uint256,address,bytes)": FunctionFragment;
  };

  getFunction(nameOrSignatureOrTopic: "executeHooks"): FunctionFragment;

  encodeFunctionData(
    functionFragment: "executeHooks",
    values: [
      CallStruct[],
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>,
      PromiseOrValue<BytesLike>
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "executeHooks",
    data: BytesLike
  ): Result;

  events: {};
}

export interface CowShedContract extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: CowShedContractInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    executeHooks(
      calls: CallStruct[],
      nonce: PromiseOrValue<BytesLike>,
      deadline: PromiseOrValue<BigNumberish>,
      user: PromiseOrValue<string>,
      signature: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  executeHooks(
    calls: CallStruct[],
    nonce: PromiseOrValue<BytesLike>,
    deadline: PromiseOrValue<BigNumberish>,
    user: PromiseOrValue<string>,
    signature: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    executeHooks(
      calls: CallStruct[],
      nonce: PromiseOrValue<BytesLike>,
      deadline: PromiseOrValue<BigNumberish>,
      user: PromiseOrValue<string>,
      signature: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    executeHooks(
      calls: CallStruct[],
      nonce: PromiseOrValue<BytesLike>,
      deadline: PromiseOrValue<BigNumberish>,
      user: PromiseOrValue<string>,
      signature: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    executeHooks(
      calls: CallStruct[],
      nonce: PromiseOrValue<BytesLike>,
      deadline: PromiseOrValue<BigNumberish>,
      user: PromiseOrValue<string>,
      signature: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
