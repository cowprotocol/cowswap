import type { BigNumberish, BytesLike } from "ethers";

/**
 * Gnosis Protocol v2 interaction data.
 */
export interface Interaction {
  /**
   * Address of the smart contract to be called in this interaction.
   */
  target: string;
  /**
   * Call value in wei for the interaction, allowing Ether to be sent.
   */
  value: BigNumberish;
  /**
   * Call data used in the interaction with a smart contract.
   */
  callData: BytesLike;
}

export type InteractionLike = Pick<Interaction, "target"> &
  Partial<Interaction>;

/**
 * Normalizes interaction data so that it is ready to be be ABI encoded.
 *
 * @param interaction The interaction to normalize.
 * @return The normalized interaction.
 */
export function normalizeInteraction(
  interaction: InteractionLike,
): Interaction {
  return {
    value: 0,
    callData: "0x",
    ...interaction,
  };
}

/**
 * Normalizes data for many interactions so that they can be ABI encoded. This
 * calls [`normalizeInteraction`] for each interaction.
 *
 * @param interactions The interactions to normalize.
 * @return The normalized interactions.
 */
export function normalizeInteractions(
  interactions: InteractionLike[],
): Interaction[] {
  return interactions.map(normalizeInteraction);
}
