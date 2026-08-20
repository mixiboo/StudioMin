"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStickerDelete = handleStickerDelete;
const discord_js_1 = require("discord.js");
const configManager_1 = require("../utils/configManager");
async function handleStickerDelete(sticker) {
    try {
        if (!sticker.guild)
            return;
        const guildId = sticker.guild.id;
        const config = (0, configManager_1.getGuildConfig)(guildId);
        if (!config?.logChannel || !(0, configManager_1.isEventEnabled)(guildId, 'stickerDelete'))
            return;
        const logChannel = sticker.guild.channels.cache.get(config.logChannel);
        if (!logChannel)
            return;
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('🗑️ 스티커 삭제')
            .setColor(0xFF0000)
            .addFields({ name: '스티커 이름', value: sticker.name, inline: true }, { name: '스티커 ID', value: sticker.id, inline: true })
            .setTimestamp();
        await logChannel.send({ embeds: [embed] });
    }
    catch (error) {
        console.error('Error handling stickerDelete:', error);
    }
}
