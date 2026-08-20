"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleEmojiUpdate = handleEmojiUpdate;
const discord_js_1 = require("discord.js");
const configManager_1 = require("../utils/configManager");
async function handleEmojiUpdate(oldEmoji, newEmoji) {
    try {
        const guildId = newEmoji.guild.id;
        const config = (0, configManager_1.getGuildConfig)(guildId);
        if (!config?.logChannel || !(0, configManager_1.isEventEnabled)(guildId, 'emojiUpdate'))
            return;
        const logChannel = newEmoji.guild.channels.cache.get(config.logChannel);
        if (!logChannel)
            return;
        const changes = [];
        if (oldEmoji.name !== newEmoji.name) {
            changes.push(`**이름**: ${oldEmoji.name} → ${newEmoji.name}`);
        }
        if (changes.length === 0)
            return;
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('😀 이모지 수정')
            .setColor(0x0099FF)
            .setThumbnail(newEmoji.imageURL())
            .addFields({ name: '이모지 ID', value: newEmoji.id, inline: true }, { name: '변경 사항', value: changes.join('\n'), inline: false })
            .setTimestamp();
        await logChannel.send({ embeds: [embed] });
    }
    catch (error) {
        console.error('Error handling emojiUpdate:', error);
    }
}
