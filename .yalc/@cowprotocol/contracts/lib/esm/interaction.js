/**
 * Normalizes interaction data so that it is ready to be be ABI encoded.
 *
 * @param interaction The interaction to normalize.
 * @return The normalized interaction.
 */
export function normalizeInteraction(interaction) {
    return Object.assign({ value: 0, callData: "0x" }, interaction);
}
/**
 * Normalizes data for many interactions so that they can be ABI encoded. This
 * calls [`normalizeInteraction`] for each interaction.
 *
 * @param interactions The interactions to normalize.
 * @return The normalized interactions.
 */
export function normalizeInteractions(interactions) {
    return interactions.map(normalizeInteraction);
}
//# sourceMappingURL=interaction.js.map