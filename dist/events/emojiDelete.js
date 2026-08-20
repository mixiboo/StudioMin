"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleEmojiDelete = handleEmojiDelete;
const discord_js_1 = require("discord.js");
const configManager_1 = require("../utils/configManager");
async function handleEmojiDelete(emoji) {
    try {
        const guildId = emoji.guild.id;
        const config = (0, configManager_1.getGuildConfig)(guildId);
        if (!config?.logChannel || !(0, configManager_1.isEventEnabled)(guildId, 'emojiDelete'))
            return;
        const logChannel = emoji.guild.channels.cache.get(config.logChannel);
        if (!logChannel)
            return;
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('🗑️ 이모지 삭제')
            .setColor(0xFF0000)
            .setThumbnail(emoji.imageURL())
            .addFields({ name: '이모지 이름', value: emoji.name || '알 수 없음', inline: true }, { name: '이모지 ID', value: emoji.id, inline: true })
            .setTimestamp();
        await logChannel.send({ embeds: [embed] });
    }
    catch (error) {
        console.error('Error handling emojiDelete:', error);
    }
}
