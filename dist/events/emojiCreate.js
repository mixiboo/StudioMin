"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleEmojiCreate = handleEmojiCreate;
const discord_js_1 = require("discord.js");
const configManager_1 = require("../utils/configManager");
async function handleEmojiCreate(emoji) {
    try {
        const guildId = emoji.guild.id;
        const config = (0, configManager_1.getGuildConfig)(guildId);
        if (!config?.logChannel || !(0, configManager_1.isEventEnabled)(guildId, 'emojiCreate'))
            return;
        const logChannel = emoji.guild.channels.cache.get(config.logChannel);
        if (!logChannel)
            return;
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('😀 이모지 생성')
            .setColor(0x00FF00)
            .setThumbnail(emoji.imageURL())
            .addFields({ name: '이모지 이름', value: emoji.name || '알 수 없음', inline: true }, { name: '이모지 ID', value: emoji.id, inline: true }, { name: '애니메이션', value: emoji.animated ? '예' : '아니오', inline: true })
            .setTimestamp();
        await logChannel.send({ embeds: [embed] });
    }
    catch (error) {
        console.error('Error handling emojiCreate:', error);
    }
}
