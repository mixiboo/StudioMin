"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.colors = void 0;
exports.createEmbed = createEmbed;
exports.successEmbed = successEmbed;
exports.errorEmbed = errorEmbed;
exports.infoEmbed = infoEmbed;
const discord_js_1 = require("discord.js");
exports.colors = {
    primary: 0x5865F2,
    success: 0x57F287,
    warning: 0xFEE75C,
    error: 0xED4245,
    info: 0x3498db,
};
function createEmbed(type = 'primary') {
    return new discord_js_1.EmbedBuilder()
        .setColor(exports.colors[type])
        .setTimestamp();
}
function successEmbed(description) {
    return createEmbed('success').setDescription(description);
}
function errorEmbed(description) {
    return createEmbed('error').setDescription(description);
}
function infoEmbed(description) {
    return createEmbed('info').setDescription(description);
}
