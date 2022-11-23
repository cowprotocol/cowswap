import { Interaction } from "../../../ts";
import { DecodedInteraction, DecodingTools } from "../interaction";

export abstract class InteractionDecoder {
  // Returns a human-readable name representing which decoder was used. Examples
  // could be "uniswap-like", "1inch", ...
  public abstract get name(): string;

  // Tries to decode the input interaction. Returns `null` if and only if the
  // interaction can't be decoded with this decoder instance.
  public abstract decode(
    interaction: Interaction,
    decodingTools?: DecodingTools,
  ): Promise<DecodedInteraction | null>;
}
