import { EmbedBuilder } from 'discord.js';

export const colors = {
    primary: 0x5865F2,
    success: 0x57F287,
    warning: 0xFEE75C,
    error: 0xED4245,
    info: 0x3498db,
};

export function createEmbed(type: keyof typeof colors = 'primary') {
    return new EmbedBuilder()
        .setColor(colors[type])
        .setTimestamp();
}

export function successEmbed(description: string) {
    return createEmbed('success').setDescription(description);
}

export function errorEmbed(description: string) {
    return createEmbed('error').setDescription(description);
}

export function infoEmbed(description: string) {
    return createEmbed('info').setDescription(description);
}
