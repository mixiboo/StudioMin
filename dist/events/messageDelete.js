"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMessageDelete = handleMessageDelete;
const discord_js_1 = require("discord.js");
const configManager_1 = require("../utils/configManager");
async function handleMessageDelete(message) {
    try {
        if (!message.guild)
            return;
        const guildId = message.guild.id;
        const config = (0, configManager_1.getGuildConfig)(guildId);
        if (!config?.logChannel || !(0, configManager_1.isEventEnabled)(guildId, 'messageDelete'))
            return;
        const logChannel = message.guild.channels.cache.get(config.logChannel);
        if (!logChannel)
            return;
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('🗑️ 메시지 삭제')
            .setColor(0xFF0000)
            .addFields({ name: '작성자', value: message.author ? `${message.author.tag} (${message.author.id})` : '알 수 없음', inline: true }, { name: '채널', value: `<#${message.channel.id}>`, inline: true }, { name: '메시지 ID', value: message.id, inline: true })
            .setTimestamp();
        if (message.content) {
            embed.addFields({ name: '내용', value: message.content.substring(0, 1024) || '내용 없음' });
        }
        await logChannel.send({ embeds: [embed] });
    }
    catch (error) {
        console.error('Error handling messageDelete:', error);
    }
}
