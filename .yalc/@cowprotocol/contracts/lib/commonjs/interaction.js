"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeInteractions = exports.normalizeInteraction = void 0;
/**
 * Normalizes interaction data so that it is ready to be be ABI encoded.
 *
 * @param interaction The interaction to normalize.
 * @return The normalized interaction.
 */
function normalizeInteraction(interaction) {
    return __assign({ value: 0, callData: "0x" }, interaction);
}
exports.normalizeInteraction = normalizeInteraction;
/**
 * Normalizes data for many interactions so that they can be ABI encoded. This
 * calls [`normalizeInteraction`] for each interaction.
 *
 * @param interactions The interactions to normalize.
 * @return The normalized interactions.
 */
function normalizeInteractions(interactions) {
    return interactions.map(normalizeInteraction);
}
exports.normalizeInteractions = normalizeInteractions;
//# sourceMappingURL=interaction.js.map